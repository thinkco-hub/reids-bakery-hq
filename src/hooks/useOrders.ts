import { useState } from "react";
import { initialOrders } from "../data/initialOrders";
import { recordAuditEvent } from "../utils/auditLog";
import { buildEditHistoryEntry, diffField, diffLines } from "../utils/editHistory";
import { isValidCustomerContact } from "../utils/orders";
import type {
  AuditActionType,
  ClientId,
  CreateOrderData,
  EditOrderInput,
  FieldEdit,
  Order,
  OrderDeliveryInput,
  OrderId,
  OrderItem,
  OrderPaymentInput,
  OrderStatus,
  Sale,
  User,
} from "../types/domain";

// Monotonic order-number counter. Seeds past the highest seeded order so new
// IDs never collide with the initial data (or with each other after deletes).
let nextOrderSeq = 1048 + initialOrders.length;
const nextOrderId = (): OrderId => `#${nextOrderSeq++}`;

/** Shared order construction for createOrder / createOrderFromSale. */
const buildOrder = (
  id: OrderId,
  data: Omit<CreateOrderData, "clientId"> & {
    clientId: ClientId | null;
    customerName?: string;
    customerContact?: string;
  }
): Order => ({
  id,
  clientId: data.clientId,
  customerName: data.customerName,
  customerContact: data.customerContact,
  items: data.items,
  requestedDate: data.requestedDate,
  status: "Pending",
  notes: data.notes,
  deliveryDate: null,
  assignedTo: null,
  createdAt: new Date().toISOString().slice(0, 10),
  deliveredAt: null,
  paymentMethod: null,
  amountPaid: 0,
});

interface UseOrdersOptions {
  /**
   * Inventory-owned deduction applied when an order is delivered. Injected by
   * the app shell so stock updates stay owned by useInventory.
   */
  deductOrderLines: (lines: OrderItem[]) => void;
  currentUser: User | null;
}

/**
 * Owns the orders feature: the order list and the order detail panel
 * (viewingOrder), including payment recording, status changes, scheduling
 * and delivery.
 */
export function useOrders({ deductOrderLines, currentUser }: UseOrdersOptions) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const logOrderEvent = (
    action: AuditActionType,
    orderId: OrderId,
    details: string
  ) => {
    if (!currentUser) return;
    recordAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType: "Order",
      entityId: orderId,
      details,
    });
  };

  const createOrder = (data: CreateOrderData) => {
    const order = buildOrder(nextOrderId(), data);
    setOrders((prev) => [order, ...prev]);
    logOrderEvent(
      "order.created",
      order.id,
      `Created order ${order.id}${order.customerName ? ` for ${order.customerName}` : ""}`
    );
  };

  const createOrderFromSale = (sale: Sale) => {
    const today = new Date().toISOString().slice(0, 10);
    const order: Order = buildOrder(nextOrderId(), {
      clientId: null,
      customerName: sale.customerName,
      customerContact: sale.customerContact,
      items: sale.items.map((item) => ({
        menuItemId: item.id,
        name: item.name,
        qty: item.qty,
        unitPrice: item.price,
      })),
      requestedDate: today,
      notes: sale.notes
        ? `Placed via POS Order — ${sale.notes}`
        : "Placed via POS Order",
    });
    const finalOrder: Order = {
      ...order,
      deliveryDate: sale.deliveryDate,
      paymentMethod: sale.paymentMethod,
      amountPaid: sale.total,
    };
    setOrders((prev) => [finalOrder, ...prev]);
    logOrderEvent(
      "order.created",
      finalOrder.id,
      `Created order ${finalOrder.id} via POS${finalOrder.customerName ? ` for ${finalOrder.customerName}` : ""}`
    );
  };

  /**
   * Applies a patch to `orders`, mirroring it into `viewingOrder` if shown.
   * The patch may be a plain object or a function of the current order so the
   * two states can never drift apart.
   */
  const patchOrder = (
    id: OrderId,
    patch: Partial<Order> | ((order: Order) => Partial<Order>)
  ) => {
    const apply = (o: Order): Order => ({
      ...o,
      ...(typeof patch === "function" ? patch(o) : patch),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? apply(o) : o)));
    setViewingOrder((prev) => (prev && prev.id === id ? apply(prev) : prev));
  };

  /**
   * Applies customer-detail and item edits to an order, appending a history
   * entry describing every changed field. Delivered orders keep their
   * recorded items (stock was already deducted at delivery).
   */
  const editOrder = (id: OrderId, input: EditOrderInput) => {
    const order = orders.find((o) => o.id === id);
    // Guardrail: never edit a delivered order (also disabled in OrderDetail).
    if (!order || order.status === "Delivered") return;
    const isClientOrder = order.clientId !== null;
    // Contact is only editable on walk-in/POS orders; client records own their
    // own contact details.
    if (!isClientOrder && !isValidCustomerContact(input.customerContact)) return;

    const changes: FieldEdit[] = [];
    if (!isClientOrder) {
      const name = diffField("customerName", "Customer name", order.customerName || "", input.customerName);
      if (name) changes.push(name);
      const contact = diffField("customerContact", "Contact number", order.customerContact || "", input.customerContact);
      if (contact) changes.push(contact);
    }
    const items = diffLines("items", "Ordered items", order.items, input.items, input.describeItem);
    if (items) changes.push(items);
    if (changes.length === 0) return;

    const entry = buildEditHistoryEntry(currentUser?.name || "Unknown", changes);
    patchOrder(id, (o) => ({
      ...(isClientOrder
        ? {}
        : { customerName: input.customerName.trim(), customerContact: input.customerContact.trim() }),
      items: input.items,
      editHistory: [...(o.editHistory || []), entry],
    }));
    logOrderEvent(
      "order.edited",
      id,
      `Edited order ${id}: ${changes.map((c) => `${c.label} "${c.from}" -> "${c.to}"`).join("; ")}`
    );
  };

  const recordOrderPayment = (id: OrderId, { method, amount }: OrderPaymentInput) => {
    patchOrder(id, (o) => ({
      paymentMethod: method,
      amountPaid: (o.amountPaid || 0) + amount,
    }));
    logOrderEvent("order.payment_recorded", id, `Recorded payment of ${amount} (${method}) on order ${id}`);
  };

  const advanceOrderStatus = (id: OrderId, status: OrderStatus | null) => {
    if (!status) return;
    patchOrder(id, { status });
    logOrderEvent("order.status_advanced", id, `Advanced order ${id} to ${status}`);
  };

  const scheduleOrderDelivery = (
    id: OrderId,
    { deliveryDate, assignedTo }: OrderDeliveryInput
  ) => {
    patchOrder(id, { deliveryDate, assignedTo });
    logOrderEvent("order.delivery_scheduled", id, `Scheduled delivery for order ${id} on ${deliveryDate}`);
  };

  const markOrderDelivered = (id: OrderId) => {
    const order = orders.find((o) => o.id === id);
    // Guard against re-delivering: deduction must run only once per order.
    if (!order || order.status === "Delivered") return;
    const deliveredAt = new Date().toISOString().slice(0, 10);

    deductOrderLines(order.items);

    patchOrder(id, { status: "Delivered", deliveredAt });
    logOrderEvent("order.delivered", id, `Marked order ${id} delivered`);
  };

  const clearViewingOrder = () => setViewingOrder(null);

  return {
    orders,
    viewingOrder,
    setViewingOrder,
    createOrder,
    createOrderFromSale,
    editOrder,
    recordOrderPayment,
    advanceOrderStatus,
    scheduleOrderDelivery,
    markOrderDelivered,
    clearViewingOrder,
  };
}