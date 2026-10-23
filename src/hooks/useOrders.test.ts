import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { initialUsers } from "../data/initialUsers";
import { getAuditLog } from "../utils/auditLog";
import { computeAmountDue, computeOrderTotal } from "../utils/orders";
import { useOrders } from "./useOrders";
import type { OrderId } from "../types/domain";

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
