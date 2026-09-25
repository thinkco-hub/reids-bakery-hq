import { useCallback, useEffect, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { recordAuditEvent } from "../utils/auditLog";
import type {
  CartItem,
  ConfirmModalState,
  OrderItem,
  PaymentMethod,
  PosCategory,
  PosProduct,
  Sale,
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
 * modal, completed sales, receipts and the resizable ticket panel.
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

  // --- RESIZABLE TICKET STATE ---
  const [cartWidth, setCartWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: ReactMouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 300 && newWidth <= 800) {
          setCartWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // --- PRODUCT FILTER & CART TOTALS ---
  const filteredPosProducts =
    posCategory === "All"
      ? posProducts
      : posProducts.filter((p) => p.category === posCategory);

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const cartTax = cartSubtotal * 0.05;
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

  // An Order needs a delivery date after today; a walk-in needs none.
  const isConfirmOrderDisabled =
    !confirmModal.paymentMethod ||
    !confirmModal.customerName.trim() ||
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
    sales,
    receipt,
    setReceipt,
    cartWidth,
    isResizing,
    startResizing,
    todayISO,
    isConfirmOrderDisabled,
  };
}