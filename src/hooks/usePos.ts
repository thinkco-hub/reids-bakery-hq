import { useState } from "react";
import { recordAuditEvent } from "../utils/auditLog";
import {
  buildSale,
  buildSaleEdit,
  computeSaleTotals,
  toOrderLines,
  validateCheckout,
} from "../utils/checkout";
import { todayISO } from "../utils/dates";
import { formatMoney } from "../utils/money";
import { toContactDigits } from "../utils/orders";
import type {
  CartItem,
  ConfirmModalState,
  EditSaleInput,
  OrderId,
  OrderItem,
  PosCategory,
  PosProduct,
  Sale,
  SaleId,
  SaleType,
  TicketCustomer,
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
   * Orders-owned pre-order creation. Returns the new order id, which the sale
   * stores as its `orderId`. Injected by the app shell so order state stays
   * owned by useOrders.
   */
  createOrderFromSale: (sale: Sale) => OrderId;
  /**
   * Inventory-owned deduction for finished goods leaving stock at checkout.
   * Injected by the app shell so stock updates stay owned by useInventory.
   */
  deductOrderLines: (lines: OrderItem[]) => void;
  currentUser: User | null;
  /** Seeded sales; a test fixture replaces the empty ledger. */
  sales?: Sale[];
}

/**
 * Owns the POS feature: product category and text filters, cart, the customer
 * attached to the open ticket, checkout confirmation modal, completed sales and
 * receipts.
 */
export function usePos({
  posProducts,
  createOrderFromSale,
  deductOrderLines,
  currentUser,
  sales: seededSales,
}: UsePosOptions) {
  const [posCategory, setPosCategory] = useState<PosCategory>("All");
  const [posSearch, setPosSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ticketCustomer, setTicketCustomer] = useState<TicketCustomer | null>(null);
  /**
   * Unsaved fields of the typed customer form. The picker unmounts with the
   * POS route, so the draft lives here or a cashier loses what they typed by
   * checking another screen and coming back.
   */
  const [customerDraft, setCustomerDraft] = useState<TicketCustomer>({ name: "", contact: "" });
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
  /**
   * Whether the phone POS shows its ticket screen instead of the catalogue.
   * Lives here rather than in the view because every action that empties the
   * ticket has to close it too, otherwise the next item tapped throws the
   * cashier back at a ticket they had already left.
   */
  const [isTicketViewOpen, setIsTicketViewOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(EMPTY_CONFIRM_MODAL);
  const [sales, setSales] = useState<Sale[]>(seededSales ?? []);
  const [receipt, setReceipt] = useState<Sale | null>(null);

  // --- PRODUCT FILTER & CART TOTALS ---
  const searchQuery = posSearch.trim().toLowerCase();
  const filteredPosProducts = posProducts.filter(
    (p) =>
      (posCategory === "All" || p.category === posCategory) &&
      (!searchQuery || p.name.toLowerCase().includes(searchQuery))
  );

  const { subtotal: cartSubtotal, tax: cartTax, total: cartTotal } = computeSaleTotals(cart);
  /** Units ringing up, so repeats of one product count as the cashier rang them. */
  const cartQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const today = todayISO();

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

  // Steps a line's quantity and drops the line at zero. Reads the current cart
  // instead of an updater form so an emptied ticket can close in the same action.
  const adjustCartQty = (id: string, delta: number) => {
    const nextCart = cart
      .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
      .filter((item) => item.qty > 0);
    setCart(nextCart);
    if (nextCart.length === 0) setIsTicketViewOpen(false);
  };

  /** Empties the ticket. The customer goes with it so the next sale at the
   *  counter can never inherit a stranger's pre-filled details. */
  const clearTicket = () => {
    setCart([]);
    setTicketCustomer(null);
    setIsTicketViewOpen(false);
  };

  const openTicketView = () => setIsTicketViewOpen(true);
  const closeTicketView = () => setIsTicketViewOpen(false);

  const attachTicketCustomer = (customer: TicketCustomer) => {
    setTicketCustomer(customer);
    setIsCustomerPickerOpen(false);
  };

  const clearTicketCustomer = () => setTicketCustomer(null);
  /** Opening starts from the attached customer, the way the form's mount used to. */
  const openCustomerPicker = () => {
    if (!isCustomerPickerOpen) {
      setCustomerDraft({
        name: ticketCustomer?.name ?? "",
        contact: ticketCustomer?.contact ?? "",
      });
    }
    setIsCustomerPickerOpen(true);
  };
  const closeCustomerPicker = () => setIsCustomerPickerOpen(false);
  const updateCustomerDraft = (field: keyof TicketCustomer, value: string) =>
    setCustomerDraft((prev) => ({ ...prev, [field]: value }));

  /** Opens the confirm modal with the attached customer, if any, pre-filled. */
  const openConfirmModal = () => {
    setConfirmModal({
      ...EMPTY_CONFIRM_MODAL,
      isOpen: true,
      customerName: ticketCustomer?.name ?? "",
      customerContact: ticketCustomer ? toContactDigits(ticketCustomer.contact) : "",
    });
  };

  // --- CHECKOUT (FR-5, FR-8) ---
  const completeSale = () => {
    const sale = buildSale(confirmModal, cart);
    // The same checkout rule disables the confirm button; re-checking here
    // closes the window between the render and the click.
    if (!sale) return;

    // An Order-type sale is one sale plus one order: the order owns later
    // customer/item edits, the sale is the record of what was paid.
    const finalSale: Sale =
      sale.type === "Order" ? { ...sale, orderId: createOrderFromSale(sale) } : sale;

    setSales((prev) => [finalSale, ...prev]);
    if (currentUser) {
      recordAuditEvent({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: "sale.completed",
        entityType: "Sale",
        entityId: finalSale.id,
        details: `${finalSale.type} sale ${finalSale.id} completed (${finalSale.items.length} line${finalSale.items.length === 1 ? "" : "s"}, ${formatMoney(finalSale.total)}, ${finalSale.paymentMethod})`,
      });
    }
    // A linked order's stock waits for delivery (markOrderDelivered); a
    // walk-in's goods leave stock now (FR-8).
    if (!finalSale.orderId) deductOrderLines(toOrderLines(finalSale.items));

    setCart([]);
    setTicketCustomer(null);
    setIsTicketViewOpen(false);
    setConfirmModal(EMPTY_CONFIRM_MODAL);
    setReceipt(finalSale);
  };

  /**
   * Edits a walk-in sale's customer details or items from the sales log,
   * appending a history entry per changed field. Linked sales are refused:
   * their order is the only editor. Totals are recomputed from the saved
   * lines; reports, CSV export and reprinted receipts follow.
   */
  const editSale = (id: SaleId, input: EditSaleInput) => {
    const sale = sales.find((s) => s.id === id);
    if (!sale) return;
    const result = buildSaleEdit(sale, input, currentUser?.name || "Unknown");
    if (!result) return;

    setSales((prev) => prev.map((s) => (s.id === id ? result.sale : s)));
    if (currentUser) {
      recordAuditEvent({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: "sale.edited",
        entityType: "Sale",
        entityId: id,
        details: `Edited sale ${id}: ${result.changes.map((c) => `${c.label} "${c.from}" -> "${c.to}"`).join("; ")}`,
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

  const isConfirmOrderDisabled = !validateCheckout(confirmModal).isValid;

  return {
    posCategory,
    setPosCategory,
    posSearch,
    setPosSearch,
    filteredPosProducts,
    addToCart,
    cart,
    adjustCartQty,
    clearTicket,
    isTicketViewOpen,
    openTicketView,
    closeTicketView,
    ticketCustomer,
    attachTicketCustomer,
    clearTicketCustomer,
    customerDraft,
    updateCustomerDraft,
    isCustomerPickerOpen,
    openCustomerPicker,
    closeCustomerPicker,
    openConfirmModal,
    cartSubtotal,
    cartTax,
    cartTotal,
    cartQty,
    confirmModal,
    updateConfirmField,
    setSaleType,
    closeConfirmModal,
    completeSale,
    editSale,
    sales,
    receipt,
    setReceipt,
    todayISO: today,
    isConfirmOrderDisabled,
  };
}
