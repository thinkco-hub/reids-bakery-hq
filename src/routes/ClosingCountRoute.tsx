import React from "react";
import ClosingCountForm from "../components/inventory/ClosingCountForm";
import { RequireTab } from "../components/RequireAccess";
import { useClosingSlice, useInventorySlice, useVisibleIngredients } from "../store/slices";
import { useShell } from "./shell";

export default function ClosingCountRoute() {
  const { currentUser, goToTab } = useShell();
  const { menuInventory } = useInventorySlice();
  const ingredients = useVisibleIngredients();
  const { submitClosingCount } = useClosingSlice();

  return (
    <RequireTab role={currentUser.role} tab="inventory-closing-count">
      <ClosingCountForm
        menuInventory={menuInventory}
        ingredients={ingredients}
        onSubmit={submitClosingCount}
        onBack={() => goToTab("inventory")}
      />
    </RequireTab>
  );
}
