import React from "react";
import ReconciliationReview from "../components/inventory/ReconciliationReview";
import { RequireTab } from "../components/RequireAccess";
import { useClosingSlice, useInventorySlice } from "../store/slices";
import { useShell } from "./shell";

export default function ReconciliationRoute() {
  const { currentUser } = useShell();
  const { menuInventory, ingredients } = useInventorySlice();
  const { inventoryCounts, resolveInventoryCount, applyAllPendingCounts } = useClosingSlice();

  return (
    <RequireTab role={currentUser.role} tab="inventory-reconciliation">
      <ReconciliationReview
        counts={inventoryCounts}
        menuInventory={menuInventory}
        ingredients={ingredients}
        onResolve={resolveInventoryCount}
        onApplyAll={applyAllPendingCounts}
      />
    </RequireTab>
  );
}
