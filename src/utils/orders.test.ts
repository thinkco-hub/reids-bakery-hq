import { describe, expect, it } from "vitest";
import { canSaveOrderEdit } from "./orders";
import type { Order } from "../types/domain";

const order = (overrides: Partial<Order> = {}): Order => ({
  id: "#2000",
  clientId: null,
  customerName: "Ana Reyes",
  customerContact: "09171234567",
  items: [{ menuItemId: "p1", name: "Butter Croissant", qty: 1, unitPrice: 120 }],
  requestedDate: "2026-11-01",
  status: "Pending",
  notes: "",
  deliveryDate: null,
  assignedTo: null,
  createdAt: "2026-11-01",
  deliveredAt: null,
  paymentMethod: null,
  amountPaid: 0,
  ...overrides,
});

const input = {
  customerName: "Ana Reyes",
  customerContact: "09171234567",
  itemCount: 1,
};

describe("canSaveOrderEdit", () => {
  it("accepts a walk-in edit with a name, a full contact and one line", () => {
    expect(canSaveOrderEdit(order(), input)).toBe(true);
  });

  it("refuses a delivered order", () => {
    expect(canSaveOrderEdit(order({ status: "Delivered" }), input)).toBe(false);
  });

  it("refuses a blank name or an incomplete contact on a walk-in", () => {
    expect(canSaveOrderEdit(order(), { ...input, customerName: "  " })).toBe(false);
    expect(canSaveOrderEdit(order(), { ...input, customerContact: "0917123456" })).toBe(false);
  });

  it("checks only the lines on a client order", () => {
    const clientOrder = order({ clientId: "c1", customerName: undefined, customerContact: undefined });
    expect(
      canSaveOrderEdit(clientOrder, { customerName: "", customerContact: "", itemCount: 1 })
    ).toBe(true);
    expect(canSaveOrderEdit(clientOrder, { ...input, itemCount: 0 })).toBe(false);
  });

  it("refuses an edit with no lines even when the customer details are valid", () => {
    expect(canSaveOrderEdit(order(), { ...input, itemCount: 0 })).toBe(false);
  });
});