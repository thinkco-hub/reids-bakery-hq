import { monthKey, shiftMonthKey } from "../utils/dates";
import type {
  ChamsBeginning,
  ChamsBranch,
  ChamsCount,
  ChamsMovement,
  ChamsProduct,
} from "../types/domain";

export const INITIAL_BRANCHES: ChamsBranch[] = [
  { id: "BR-01", name: "Chams Poblacion" },
  { id: "BR-02", name: "Chams Lahug" },
  { id: "BR-03", name: "Chams Mandaue" },
];

// FR-3.9.6: sellingPrice is the standardized price used for revenue = sold x price.
export const SIOPAO_PRODUCTS: ChamsProduct[] = [
  { id: "PORK", name: "Pork Siopao", sellingPrice: 25 },
  { id: "BEEF", name: "Beef Siopao", sellingPrice: 28 },
  { id: "CHOCO", name: "Choco Siopao", sellingPrice: 22 },
];

const CURRENT_MONTH = monthKey();
const MONTH_MINUS_1 = shiftMonthKey(CURRENT_MONTH, -1);
const MONTH_MINUS_2 = shiftMonthKey(CURRENT_MONTH, -2);

// Rough per-branch and per-product volume multipliers used only to seed
// plausible demo data — not part of the ledger's actual math.
const BRANCH_FACTOR: Record<string, number> = { "BR-01": 1, "BR-02": 0.7, "BR-03": 0.5 };
const PRODUCT_BASE: Record<string, number> = { PORK: 90, BEEF: 70, CHOCO: 60 };

export function buildSeedData(): {
  beginnings: ChamsBeginning[];
  movements: ChamsMovement[];
  counts: ChamsCount[];
} {
  const beginnings: ChamsBeginning[] = [];
  const movements: ChamsMovement[] = [];
  const counts: ChamsCount[] = [];
  let beginningSeq = 0;
  let movementSeq = 0;
  let countSeq = 0;

  INITIAL_BRANCHES.forEach((branch) => {
    SIOPAO_PRODUCTS.forEach((product) => {
      const factor = BRANCH_FACTOR[branch.id];
      const baseStock = Math.round(PRODUCT_BASE[product.id] * factor);

      // Only the earliest month gets a true, explicit onboarding beginning.
      // Every month's restocked total = last month's remaining, carried
      // over automatically (FR-3.9.4), plus whatever the supplier manually
      // restocks that month (FR-3.9.5).
      const openingCount = Math.round(baseStock * 0.15);
      beginningSeq += 1;
      beginnings.push({
        id: `BG-${String(beginningSeq).padStart(4, "0")}`,
        branchId: branch.id,
        productId: product.id,
        month: MONTH_MINUS_2,
        openingCount,
      });

      let carryOver = 0;
      let remaining: number | null = null;
      [MONTH_MINUS_2, MONTH_MINUS_1].forEach((month, idx) => {
        const beginning = month === MONTH_MINUS_2 ? openingCount : 0;
        const manualRestocked = Math.round(baseStock * (idx === 0 ? 0.85 : 0.6));
        const available = beginning + carryOver + manualRestocked;
        const spoilage = Math.round(available * 0.05);
        const sold = Math.round(available * 0.55);
        movementSeq += 1;
        movements.push({
          id: `MV-${String(movementSeq).padStart(4, "0")}`,
          branchId: branch.id,
          productId: product.id,
          month,
          restocked: manualRestocked,
          spoilage,
          sold,
        });
        remaining = available - spoilage - sold;
        carryOver = remaining;

        countSeq += 1;
        counts.push({
          id: `CT-${String(countSeq).padStart(4, "0")}`,
          branchId: branch.id,
          productId: product.id,
          month,
          remainingReported: remaining as number,
        });
      });

      // Current month: partially logged, nothing counted yet — demonstrates
      // the in-progress state. Carryover still applies automatically even
      // for the one combo left without a movement entry.
      const skipCurrentMovement = branch.id === "BR-03" && product.id === "CHOCO";
      if (!skipCurrentMovement) {
        const manualRestocked = Math.round(baseStock * 0.6);
        const currentAvailable = carryOver + manualRestocked;
        const spoilage = Math.round(currentAvailable * 0.03);
        const sold = Math.round(currentAvailable * 0.3);
        movementSeq += 1;
        movements.push({
          id: `MV-${String(movementSeq).padStart(4, "0")}`,
          branchId: branch.id,
          productId: product.id,
          month: CURRENT_MONTH,
          restocked: manualRestocked,
          spoilage,
          sold,
        });
      }
    });
  });

  // Deliberate demo discrepancy: Chams Poblacion's Pork Siopao count for last
  // month was reported short by 4 versus the calculated remaining.
  const flaggedCount = counts.find(
    (c) => c.branchId === "BR-01" && c.productId === "PORK" && c.month === MONTH_MINUS_1
  );
  if (flaggedCount) flaggedCount.remainingReported -= 4;

  return { beginnings, movements, counts };
}
