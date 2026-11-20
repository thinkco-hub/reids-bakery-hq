import { beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReconciliationReview from "./ReconciliationReview";
import { todayISO } from "../../utils/dates";
import type { IngredientStock, InventoryCount } from "../../types/domain";

const flour: IngredientStock = {
  id: "ING-001",
  name: "Bread flour",
  qty: 10,
  target: 20,
  unit: "kg",
  type: "Ingredient",
  supplier: "Mill Co",
  unitCost: 55,
};

const flagged: InventoryCount = {
  id: "IC-001",
  itemId: flour.id,
  itemType: "ingredient",
  date: todayISO(),
  systemQty: 10,
  countedQty: 8,
  discrepancy: -2,
  status: "pending",
};

const onApplyAll = vi.fn();
const nativeConfirm = vi.spyOn(window, "confirm").mockReturnValue(true);

function Harness() {
  const [counts, setCounts] = useState<InventoryCount[]>([flagged]);
  return (
    <ReconciliationReview
      counts={counts}
      menuInventory={[]}
      ingredients={[flour]}
      onResolve={() => {}}
      onApplyAll={() => {
        onApplyAll();
        setCounts((prev) =>
          prev.map((c) =>
            c.status === "pending" && c.discrepancy !== 0
              ? { ...c, status: "resolved", resolution: "applied" }
              : c
          )
        );
      }}
    />
  );
}

const applyAllButton = () => screen.getByRole("button", { name: "Apply All (1)" });

beforeEach(() => {
  onApplyAll.mockClear();
  nativeConfirm.mockClear();
});

describe("apply all pending counts", () => {
  it("confirms in the shared dialog instead of a native confirm", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(applyAllButton());
    const dialog = screen.getByRole("alertdialog", { name: "Apply 1 pending count?" });
    expect(dialog).toHaveTextContent("This will adjust system stock to match each counted quantity.");
    expect(nativeConfirm).not.toHaveBeenCalled();
    expect(onApplyAll).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Apply all" }));
    expect(onApplyAll).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Apply All (0)" })).toBeDisabled();
    expect(screen.getByText("No flagged discrepancies right now.")).toBeInTheDocument();
  });

  it("leaves stock alone and returns focus when cancelled", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(applyAllButton());
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(onApplyAll).not.toHaveBeenCalled();
    expect(applyAllButton()).toHaveFocus();
    expect(applyAllButton()).toBeEnabled();
  });

  it("moves focus to the page heading once Apply All disables itself", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(applyAllButton());
    await user.click(screen.getByRole("button", { name: "Apply all" }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Inventory Reconciliation" })).toHaveFocus()
    );
  });
});