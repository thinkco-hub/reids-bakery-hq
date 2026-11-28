import { describe, expect, it } from "vitest";
import { buildLedgerRow, upsertByPeriod } from "./ledger";
import type {
  ChamsBeginning,
  ChamsBranch,
  ChamsCount,
  ChamsMovement,
  ChamsProduct,
} from "../types/domain";

const branch: ChamsBranch = { id: "BR-01", name: "Chams Poblacion" };
const product: ChamsProduct = { id: "PORK", name: "Pork Siopao", sellingPrice: 25 };

const beginning = (overrides: Partial<ChamsBeginning> = {}): ChamsBeginning => ({
  id: "BG-0001",
  branchId: "BR-01",
  productId: "PORK",
  month: "2026-09",
  openingCount: 10,
  ...overrides,
});

const movement = (overrides: Partial<ChamsMovement> = {}): ChamsMovement => ({
  id: "MV-0001",
  branchId: "BR-01",
  productId: "PORK",
  month: "2026-09",
  restocked: 0,
  spoilage: 0,
  sold: 6,
  ...overrides,
});

const chamsCount = (overrides: Partial<ChamsCount> = {}): ChamsCount => ({
  id: "CT-0001",
  branchId: "BR-01",
  productId: "PORK",
  month: "2026-10",
  remainingReported: 24,
  ...overrides,
});

describe("upsertByPeriod", () => {
  it("appends a new branch/product/month with the padded id", () => {
    const rows = upsertByPeriod(
      [beginning()],
      { branchId: "BR-01", productId: "PORK", month: "2026-10", openingCount: 5 },
      "BG"
    );
    expect(rows).toHaveLength(2);
    expect(rows[1]).toMatchObject({ id: "BG-0002", month: "2026-10", openingCount: 5 });
  });

  it("updates the matching key in place without duplicating it", () => {
    const rows = upsertByPeriod(
      [beginning()],
      { branchId: "BR-01", productId: "PORK", month: "2026-09", openingCount: 99 },
      "BG"
    );
    expect(rows).toEqual([{ ...beginning(), openingCount: 99 }]);
  });
});

describe("buildLedgerRow", () => {
  const beginnings = [
    beginning({ month: "2026-09", openingCount: 10 }),
    beginning({ id: "BG-0002", month: "2026-10", openingCount: 20 }),
  ];
  const movements = [
    movement({ month: "2026-09", sold: 6 }),
    movement({ id: "MV-0002", month: "2026-10", restocked: 5, spoilage: 2, sold: 3 }),
  ];

  it("carries the previous month's remaining into restocked and prices the sold units", () => {
    const row = buildLedgerRow(branch, product, "2026-10", beginnings, movements, []);
    expect(row).toMatchObject({
      beginning: 20,
      restocked: 9,
      spoilage: 2,
      sold: 3,
      remainingCalculated: 24,
      revenue: 75,
      remainingReported: null,
      countSubmitted: false,
      flagged: false,
    });
  });

  it("flags a reported count that differs from the calculated remaining", () => {
    const row = buildLedgerRow(branch, product, "2026-10", beginnings, movements, [
      chamsCount({ remainingReported: 21 }),
    ]);
    expect(row.remainingReported).toBe(21);
    expect(row.discrepancy).toBe(-3);
    expect(row.flagged).toBe(true);
  });

  it("does not flag a matching count", () => {
    const row = buildLedgerRow(branch, product, "2026-10", beginnings, movements, [
      chamsCount({ remainingReported: 24 }),
    ]);
    expect(row.discrepancy).toBe(0);
    expect(row.flagged).toBe(false);
    expect(row.countSubmitted).toBe(true);
  });
});
