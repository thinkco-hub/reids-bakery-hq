import React from "react";
import ClosingInventory from "../components/reports/ClosingInventory";
import { RequireTab } from "../components/RequireAccess";
import { useClosingSlice, useInventorySlice, useVisibleIngredients } from "../store/slices";
import { useShell } from "./shell";

export default function ReportsInventoryRoute() {
  const { currentUser } = useShell();
  const { menuInventory } = useInventorySlice();
  const ingredients = useVisibleIngredients();
  const { inventoryCounts } = useClosingSlice();

  return (
    <RequireTab role={currentUser.role} tab="reports-inventory">
      <ClosingInventory
        menuInventory={menuInventory}
        ingredients={ingredients}
        inventoryCounts={inventoryCounts}
      />
    </RequireTab>
  );
}
