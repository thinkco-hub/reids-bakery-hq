import { useState } from "react";
import { recordAuditEvent } from "../utils/auditLog";
import { buildEditHistoryEntry, diffField, diffLines } from "../utils/editHistory";
import { isValidCustomerContact } from "../utils/orders";
import type {
  CartItem,
  ConfirmModalState,
  EditSaleInput,
  FieldEdit,
  OrderItem,
  PaymentMethod,
  PosCategory,
  PosProduct,
  Sale,
  SaleId,
  SaleType,
  User,
} from "../types/domain";

const EMPTY_CONFIRM_MODAL: ConfirmModalState = {
  isOpen: false,
  saleType: "Walk-in",
  paymentMethod: "",
  customerName: "",
  customerContact: "",
  deliveryDate: "",
  notes: "",
};

/** VAT applied to every sale subtotal. */
const SALES_TAX_RATE = 0.05;

/** How one sale line reads in an edit-history entry. */
const describeSaleLine = (line: CartItem) => `${line.qty} × ${line.name}`;

interface UsePosOptions {
  posProducts: PosProduct[];
  /**
   * Orders-owned pre-order creation for deliveries scheduled after today.
   * Injected by the app shell so order state stays owned by useOrders.
   */
  createOrderFromSale: (sale: Sale) => void;
  /**
   * Inventory-owned deduction for finished goods leaving stock at checkout.
   * Injected by the app shell so stock updates stay owned by useInventory.
   */
  deductOrderLines: (lines: OrderItem[]) => void;
  currentUser: User | null;
}

/**
 * Owns the POS feature: product category filter, cart, checkout confirmation
 * modal, completed sales and receipts.
 */
export function usePos({
  posProducts,
  createOrderFromSale,
  deductOrderLines,
  currentUser,
}: UsePosOptions) {
  const [posCategory, setPosCategory] = useState<PosCategory>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(EMPTY_CONFIRM_MODAL);
  const [sales, setSales] = useState<Sale[]>([]);
  const [receipt, setReceipt] = useState<Sale | null>(null);

  // --- PRODUCT FILTER & CART TOTALS ---
  const filteredPosProducts =
    posCategory === "All"
      ? posProducts
      : posProducts.filter((p) => p.category === posCategory);

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const cartTax = cartSubtotal * SALES_TAX_RATE;
  const cartTotal = cartSubtotal + cartTax;
  // Local calendar date (not UTC) so "today" matches the cashier's clock — in UTC+8,
  // toISOString() is still yesterday between 00:00 and 08:00.
  const now = new Date();
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  // --- CART ACTIONS ---
  const addToCart = (product: PosProduct) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const adjustCartQty = (id: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  // --- CHECKOUT (FR-5, FR-8) ---
  const completeSale = () => {
    // Orders (chosen explicitly in the modal) are tracked in the Orders view;
    // walk-ins only appear in Sales.
    const isOrder = confirmModal.saleType === "Order";
    // Guardrail: never confirm without a complete contact number
    // (also enforced by isConfirmOrderDisabled).
    if (!isValidCustomerContact(confirmModal.customerContact)) return;
    // An Order must be delivered after today (also enforced by isConfirmOrderDisabled).
    if (isOrder && !(confirmModal.deliveryDate > todayISO)) return;
    const sale: Sale = {
      id: `SALE-${String(sales.length + 1).padStart(4, "0")}`,
      type: confirmModal.saleType,
      customerName: confirmModal.customerName.trim(),
      customerContact: confirmModal.customerContact.trim(),
      // Confirm is disabled until a payment method is chosen (isConfirmOrderDisabled).
      paymentMethod: confirmModal.paymentMethod as PaymentMethod,
      items: cart,
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal,
      // Only Orders carry a delivery date; walk-ins are handed over today.
      deliveryDate: isOrder && confirmModal.deliveryDate ? confirmModal.deliveryDate : todayISO,
      notes: confirmModal.notes.trim(),
      createdAt: new Date().toISOString(),
    };
    setSales((prev) => [sale, ...prev]);
    if (currentUser) {
      recordAuditEvent({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: "sale.completed",
        entityType: "Sale",
        entityId: sale.id,
        details: `${sale.type} sale ${sale.id} completed (${sale.items.length} line${sale.items.length === 1 ? "" : "s"}, ₱${sale.total.toFixed(2)}, ${sale.paymentMethod})`,
      });
    }
    if (isOrder) {
      // Stock for an order is deducted when the order is delivered
      // (markOrderDelivered -> deductOrderLines), not at placement.
      createOrderFromSale(sale);
    } else {
      // Walk-in goods leave stock immediately at checkout (FR-8).
      deductOrderLines(
        sale.items.map((item) => ({
          menuItemId: item.id,
          name: item.name,
          qty: item.qty,
          unitPrice: item.price,
        }))
      );
    }
    setCart([]);
    setConfirmModal(EMPTY_CONFIRM_MODAL);
    setReceipt(sale);
  };

  /**
   * Edits a completed sale's customer details or items from the sales log,
   * appending a history entry per changed field. Money totals are recomputed
   * from the saved lines; reports, CSV export and reprinted receipts follow.
   */
  const editSale = (id: SaleId, input: EditSaleInput) => {
    const sale = sales.find((s) => s.id === id);
    if (!sale) return;
    // Guardrails mirrored by the disabled Save in EditSaleModal.
    if (!input.customerName.trim()) return;
    if (!isValidCustomerContact(input.customerContact)) return;

    const changes: FieldEdit[] = [];
    const name = diffField("customerName", "Customer name", sale.customerName, input.customerName);
    if (name) changes.push(name);
    const contact = diffField("customerContact", "Contact number", sale.customerContact, input.customerContact);
    if (contact) changes.push(contact);
    const items = diffLines("items", "Ordered items", sale.items, input.items, describeSaleLine);
    if (items) changes.push(items);
    if (changes.length === 0) return;

    const entry = buildEditHistoryEntry(currentUser?.name || "Unknown", changes);
    setSales((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const subtotal = input.items.reduce((sum, item) => sum + item.price * item.qty, 0);
        const tax = subtotal * SALES_TAX_RATE;
        return {
          ...s,
          customerName: input.customerName.trim(),
          customerContact: input.customerContact.trim(),
          items: input.items,
          subtotal,
          tax,
          total: subtotal + tax,
          editHistory: [...(s.editHistory || []), entry],
        };
      })
    );
    if (currentUser) {
      recordAuditEvent({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: "sale.edited",
        entityType: "Sale",
        entityId: id,
        details: `Edited sale ${id}: ${changes.map((c) => `${c.label} "${c.from}" -> "${c.to}"`).join("; ")}`,
      });
    }
  };

  const updateConfirmField = (
    field: Exclude<keyof ConfirmModalState, "isOpen" | "saleType">,
    value: string
  ) => {
    setConfirmModal((prev) => ({ ...prev, [field]: value }));
  };

  /** Switches between Walk-in and Order; a walk-in has no delivery date. */
  const setSaleType = (saleType: SaleType) => {
    setConfirmModal((prev) => ({
      ...prev,
      saleType,
      deliveryDate: saleType === "Walk-in" ? "" : prev.deliveryDate,
    }));
  };

  const closeConfirmModal = () => {
    setConfirmModal(EMPTY_CONFIRM_MODAL);
  };

  // Every sale type needs a reachable customer, so the contact must be a full
  // number; an Order additionally needs a delivery date after today.
  const isConfirmOrderDisabled =
    !confirmModal.paymentMethod ||
    !confirmModal.customerName.trim() ||
    !isValidCustomerContact(confirmModal.customerContact) ||
    (confirmModal.saleType === "Order" && !(confirmModal.deliveryDate > todayISO));

  return {
    posCategory,
    setPosCategory,
    filteredPosProducts,
    addToCart,
    cart,
    adjustCartQty,
    setCart,
    cartSubtotal,
    cartTax,
    cartTotal,
    confirmModal,
    setConfirmModal,
    updateConfirmField,
    setSaleType,
    closeConfirmModal,
    completeSale,
    editSale,
    sales,
    receipt,
    setReceipt,
    todayISO,
    isConfirmOrderDisabled,
  };
}