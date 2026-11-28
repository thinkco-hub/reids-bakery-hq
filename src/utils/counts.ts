import type { InventoryCount, Quantity } from "../types/domain";

export function computeDiscrepancy(countedQty: Quantity, systemQty: Quantity): number {
  return countedQty - systemQty;
}

export function discrepancyLabel(discrepancy: number): string {
  if (discrepancy === 0) return "Match";
  return discrepancy > 0 ? `+${discrepancy} Overage` : `${discrepancy} Shortage`;
}

export function flaggedPendingCounts(counts: InventoryCount[]): InventoryCount[] {
  return counts.filter((c) => c.status === "pending" && c.discrepancy !== 0);
}
