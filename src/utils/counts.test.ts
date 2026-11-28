import { describe, expect, it } from "vitest";
import { discrepancyTone } from "./status";
import { flaggedPendingCounts } from "./counts";
import type { InventoryCount } from "../types/domain";

const count = (overrides: Partial<InventoryCount> = {}): InventoryCount => ({
  id: "IC-001",
  itemId: "ING-001",
  itemType: "ingredient",
  date: "2026-11-28",
  systemQty: 10,
  countedQty: 8,
  discrepancy: -2,
  status: "pending",
  ...overrides,
});

describe("discrepancyTone", () => {
  it("reads a match as neutral, an overage as warning and a shortage as danger", () => {
    expect(discrepancyTone(0)).toBe("neutral");
    expect(discrepancyTone(4)).toBe("warning");
    expect(discrepancyTone(-4)).toBe("danger");
  });
});

describe("flaggedPendingCounts", () => {
  it("keeps pending rows with a discrepancy of either sign", () => {
    const shortage = count();
    const overage = count({ id: "IC-002", countedQty: 12, discrepancy: 2 });
    expect(flaggedPendingCounts([shortage, overage])).toEqual([shortage, overage]);
  });

  it("drops a match and a resolved row", () => {
    const match = count({ id: "IC-002", countedQty: 10, discrepancy: 0, status: "resolved", resolution: "match" });
    const applied = count({ id: "IC-003", status: "resolved", resolution: "applied" });
    expect(flaggedPendingCounts([count(), match, applied])).toEqual([count()]);
  });
});