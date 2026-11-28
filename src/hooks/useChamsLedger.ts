import { useState } from "react";
import { buildSeedData } from "../data/initialChams";
import { monthKey } from "../utils/dates";
import { upsertByPeriod } from "../utils/ledger";
import type { ChamsBeginning, ChamsCount, ChamsMovement, MonthKey } from "../types/domain";

/**
 * Chams ledger state for one mounted screen. Leaving /chams still reseeds;
 * the state deliberately does not outlive the route.
 */
export function useChamsLedger() {
  const [month, setMonth] = useState<MonthKey>(() => monthKey());
  const [seed] = useState(buildSeedData);
  const [beginnings, setBeginnings] = useState(seed.beginnings);
  const [movements, setMovements] = useState(seed.movements);
  const [counts, setCounts] = useState(seed.counts);

  const upsertBeginning = (data: Omit<ChamsBeginning, "id">) =>
    setBeginnings((prev) => upsertByPeriod(prev, data, "BG"));
  const upsertMovement = (data: Omit<ChamsMovement, "id">) =>
    setMovements((prev) => upsertByPeriod(prev, data, "MV"));
  const upsertCount = (data: Omit<ChamsCount, "id">) =>
    setCounts((prev) => upsertByPeriod(prev, data, "CT"));

  return {
    month,
    setMonth,
    beginnings,
    movements,
    counts,
    upsertBeginning,
    upsertMovement,
    upsertCount,
  };
}
