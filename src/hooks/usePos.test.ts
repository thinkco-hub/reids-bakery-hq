import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { initialPosProducts } from "../data/initialProducts";
import { initialUsers } from "../data/initialUsers";
import { getAuditLog } from "../utils/auditLog";
import { addDaysISO, todayISO } from "../utils/dates";
import { usePos } from "./usePos";
import type { ConfirmModalState, OrderItem } from "../types/domain";

const cashier = initialUsers.find((u) => u.email === "cashier@rbc.test") ?? initialUsers[0];
const product = initialPosProducts[0];
const TOMORROW = addDaysISO(todayISO(), 1);

type PosHook = ReturnType<typeof usePos>;

function mountPos() {
  const createOrderFromSale = vi.fn<() => string>(() => "#9001");
  const deductOrderLines = vi.fn<(lines: OrderItem[]) => void>();
  const view = renderHook(() =>
    usePos({ posProducts: initialPosProducts, createOrderFromSale, deductOrderLines, currentUser: cashier })
  );
  return { view, createOrderFromSale, deductOrderLines };
}

function fillCheckout(
  pos: PosHook,
  overrides: Partial<
    Pick<ConfirmModalState, "saleType" | "paymentMethod" | "customerName" | "customerContact" | "deliveryDate">
  > = {}
) {
  act(() => pos.openConfirmModal());
  act(() => pos.setSaleType(overrides.saleType ?? "Walk-in"));
  act(() => pos.updateConfirmField("customerName", overrides.customerName ?? "Ana Reyes"));
  act(() => pos.updateConfirmField("customerContact", overrides.customerContact ?? "09171234567"));
  act(() => pos.updateConfirmField("paymentMethod", overrides.paymentMethod ?? "Cash"));
  act(() => pos.updateConfirmField("deliveryDate", overrides.deliveryDate ?? ""));
}

function ringUpAndConfirm(
  view: ReturnType<typeof mountPos>["view"],
  overrides: Parameters<typeof fillCheckout>[1] = {}
) {
  act(() => view.result.current.addToCart(product));
  fillCheckout(view.result.current, overrides);
  act(() => view.result.current.completeSale());
}

describe("completeSale stock timing", () => {
  it("deducts a walk-in's stock once at checkout and creates no order", () => {
    const { view, createOrderFromSale, deductOrderLines } = mountPos();
    ringUpAndConfirm(view);

    expect(deductOrderLines).toHaveBeenCalledTimes(1);
    expect(deductOrderLines).toHaveBeenCalledWith([
      { menuItemId: product.id, name: product.name, qty: 1, unitPrice: product.price },
    ]);
    expect(createOrderFromSale).not.toHaveBeenCalled();
    expect(view.result.current.sales).toHaveLength(1);
    expect(view.result.current.sales[0].orderId).toBeUndefined();
  });

  it("deducts zero at checkout for an Order and links the sale to the new order", () => {
    const { view, createOrderFromSale, deductOrderLines } = mountPos();
    act(() => view.result.current.addToCart(product));
    fillCheckout(view.result.current, { saleType: "Order", deliveryDate: TOMORROW });
    expect(view.result.current.isConfirmOrderDisabled).toBe(false);

    act(() => view.result.current.completeSale());

    expect(deductOrderLines).not.toHaveBeenCalled();
    expect(createOrderFromSale).toHaveBeenCalledTimes(1);
    expect(view.result.current.sales[0]).toMatchObject({
      type: "Order",
      deliveryDate: TOMORROW,
      orderId: "#9001",
    });
  });
});

describe("completeSale record", () => {
  it("returns the completed sale as the receipt with tax-inclusive totals", () => {
    const { view } = mountPos();
    ringUpAndConfirm(view);

    const sale = view.result.current.sales[0];
    expect(view.result.current.receipt).toBe(sale);
    expect(sale.id).toMatch(/^SALE-\d{4,}$/);
    expect(sale.subtotal).toBe(product.price);
    expect(sale.tax).toBe(product.price * 0.05);
    expect(sale.total).toBe(product.price * 1.05);
  });

  it("fires one sale.completed audit event", () => {
    const { view } = mountPos();
    ringUpAndConfirm(view);

    const events = getAuditLog().filter((entry) => entry.action === "sale.completed");
    expect(events).toHaveLength(1);
    expect(events[0].entityId).toBe(view.result.current.sales[0].id);
    expect(events[0].userName).toBe(cashier.name);
  });
});

describe("checkout guard", () => {
  it("blocks an Order dated today and refuses to complete it", () => {
    const { view, createOrderFromSale, deductOrderLines } = mountPos();
    act(() => view.result.current.addToCart(product));
    fillCheckout(view.result.current, { saleType: "Order", deliveryDate: todayISO() });

    expect(view.result.current.isConfirmOrderDisabled).toBe(true);
    act(() => view.result.current.completeSale());
    expect(view.result.current.sales).toHaveLength(0);
    expect(view.result.current.receipt).toBeNull();
    expect(createOrderFromSale).not.toHaveBeenCalled();
    expect(deductOrderLines).not.toHaveBeenCalled();
  });

  it("blocks an incomplete contact and refuses to complete it", () => {
    const { view, deductOrderLines } = mountPos();
    act(() => view.result.current.addToCart(product));
    fillCheckout(view.result.current, { customerContact: "0917" });

    expect(view.result.current.isConfirmOrderDisabled).toBe(true);
    act(() => view.result.current.completeSale());
    expect(view.result.current.sales).toHaveLength(0);
    expect(deductOrderLines).not.toHaveBeenCalled();
  });
});

describe("editSale", () => {
  it("edits a walk-in sale and audits the change", () => {
    const { view } = mountPos();
    ringUpAndConfirm(view);
    const sale = view.result.current.sales[0];

    act(() =>
      view.result.current.editSale(sale.id, {
        customerName: "Ana R.",
        customerContact: sale.customerContact,
        items: sale.items,
      })
    );

    expect(view.result.current.sales[0].customerName).toBe("Ana R.");
    expect(view.result.current.sales[0].editHistory).toHaveLength(1);
    expect(getAuditLog().filter((entry) => entry.action === "sale.edited")).toHaveLength(1);
  });

  it("refuses a linked sale: its order is the only editor", () => {
    const { view } = mountPos();
    ringUpAndConfirm(view, { saleType: "Order", deliveryDate: TOMORROW });
    const sale = view.result.current.sales[0];

    act(() =>
      view.result.current.editSale(sale.id, {
        customerName: "Someone Else",
        customerContact: sale.customerContact,
        items: sale.items,
      })
    );

    expect(view.result.current.sales[0].customerName).toBe("Ana Reyes");
    expect(view.result.current.sales[0].editHistory).toBeUndefined();
    expect(getAuditLog().filter((entry) => entry.action === "sale.edited")).toHaveLength(0);
  });
});
