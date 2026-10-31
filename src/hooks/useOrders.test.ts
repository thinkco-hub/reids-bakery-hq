import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { initialUsers } from "../data/initialUsers";
import { getAuditLog } from "../utils/auditLog";
import { addDaysISO, todayISO } from "../utils/dates";
import { computeAmountDue, computeOrderTotal } from "../utils/orders";
import { useOrders } from "./useOrders";
import type { OrderId, Sale } from "../types/domain";

const cashier = initialUsers.find((u) => u.email === "cashier@rbc.test") ?? initialUsers[0];

/** Seeded #1042 is a pending order nobody has paid on yet. */
const TARGET: OrderId = "#1042";

function mountOrders() {
  const view = renderHook(() =>
    useOrders({ deductOrderLines: vi.fn(), currentUser: cashier })
  );

  const orderOf = () => {
    const order = view.result.current.orders.find((o) => o.id === TARGET);
    if (!order) throw new Error(`Seed data no longer has order ${TARGET}`);
    return order;
  };

  return {
    orderOf,
    amountPaid: () => orderOf().amountPaid,
    pay: (amount: number) =>
      act(() =>
        view.result.current.recordOrderPayment(TARGET, { method: "Cash", amount })
      ),
  };
}

/** The audit log is the durable store the falsified figure would have reached. */
const paymentEvents = () =>
  getAuditLog().filter((entry) => entry.action === "order.payment_recorded");

describe("recordOrderPayment amount bound", () => {
  it("records the outstanding balance and settles the order at its total", () => {
    const { orderOf, amountPaid, pay } = mountOrders();
    pay(computeAmountDue(orderOf()));
    expect(amountPaid()).toBe(computeOrderTotal(orderOf()));
  });

  it("refuses an amount above the outstanding balance", () => {
    const { orderOf, amountPaid, pay } = mountOrders();
    const total = computeOrderTotal(orderOf());
    pay(total + 0.01);
    expect(amountPaid()).toBe(0);
    expect(paymentEvents()).toHaveLength(0);
  });

  it("refuses any payment onto a settled order", () => {
    const { orderOf, amountPaid, pay } = mountOrders();
    pay(computeAmountDue(orderOf()));
    pay(1);
    expect(amountPaid()).toBe(computeOrderTotal(orderOf()));
    expect(paymentEvents()).toHaveLength(1);
  });

  it("splits a second payment across the remaining balance only", () => {
    const { orderOf, amountPaid, pay } = mountOrders();
    const total = computeOrderTotal(orderOf());
    pay(total / 2);
    expect(amountPaid()).toBe(total / 2);
    pay(total);
    expect(amountPaid()).toBe(total / 2);
    pay(total / 2);
    expect(amountPaid()).toBe(total);
  });

  it("refuses zero, negative and non-finite amounts", () => {
    const { amountPaid, pay } = mountOrders();
    for (const amount of [0, -500, Number.NaN, Number.POSITIVE_INFINITY]) pay(amount);
    expect(amountPaid()).toBe(0);
    expect(paymentEvents()).toHaveLength(0);
  });
});

const TOMORROW = addDaysISO(todayISO(), 1);

const posSale: Sale = {
  id: "SALE-9001",
  type: "Order",
  customerName: "Ana Reyes",
  customerContact: "09171234567",
  paymentMethod: "Cash",
  items: [
    { id: "p1", name: "Butter Croissant", price: 120, category: "Pastries", color: "#F17D0C", qty: 2 },
  ],
  subtotal: 240,
  tax: 12,
  total: 252,
  deliveryDate: TOMORROW,
  notes: "Birthday",
  createdAt: new Date().toISOString(),
};

describe("createOrderFromSale", () => {
  function mountWithDeduction() {
    const deductOrderLines = vi.fn();
    const view = renderHook(() =>
      useOrders({ deductOrderLines, currentUser: cashier })
    );
    return { view, deductOrderLines };
  }

  it("creates the linked order and returns its id for the sale to store", () => {
    const { view, deductOrderLines } = mountWithDeduction();
    let orderId: OrderId = "";

    act(() => {
      orderId = view.result.current.createOrderFromSale(posSale);
    });

    const order = view.result.current.orders.find((o) => o.id === orderId);
    expect(order).toMatchObject({
      clientId: null,
      customerName: "Ana Reyes",
      customerContact: "09171234567",
      requestedDate: todayISO(),
      status: "Pending",
      deliveryDate: TOMORROW,
      paymentMethod: "Cash",
      amountPaid: 252,
      deliveredAt: null,
    });
    expect(order?.items).toEqual([
      { menuItemId: "p1", name: "Butter Croissant", qty: 2, unitPrice: 120 },
    ]);
    expect(deductOrderLines).not.toHaveBeenCalled();
  });

  it("deducts stock once when the linked order is delivered, not before", () => {
    const { view, deductOrderLines } = mountWithDeduction();
    let orderId: OrderId = "";

    act(() => {
      orderId = view.result.current.createOrderFromSale(posSale);
    });
    const order = view.result.current.orders.find((o) => o.id === orderId);

    act(() => view.result.current.markOrderDelivered(orderId));
    act(() => view.result.current.markOrderDelivered(orderId));

    expect(deductOrderLines).toHaveBeenCalledTimes(1);
    expect(deductOrderLines).toHaveBeenCalledWith(order?.items);
    expect(view.result.current.orders.find((o) => o.id === orderId)?.status).toBe("Delivered");
  });
});
