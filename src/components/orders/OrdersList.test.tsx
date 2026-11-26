import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrdersList from "./OrdersList";
import { initialClients } from "../../data/initialClients";
import { initialOrders } from "../../data/initialOrders";

function renderOrders() {
  render(<OrdersList orders={initialOrders} clients={initialClients} menuInventory={[]} onView={() => {}} />);
}

const rowIds = () =>
  screen
    .getAllByRole("button", { name: /^View order #/ })
    .map((b) => b.getAttribute("aria-label")!.replace("View order ", ""));

describe("OrdersList sort control", () => {
  it("sorts the table and the card list with one control", async () => {
    const user = userEvent.setup();
    renderOrders();

    expect(rowIds()).toEqual(["#1044", "#1042", "#1043", "#1045", "#1046", "#1047"]);

    await user.selectOptions(screen.getByLabelText("Sort by"), "total");
    expect(rowIds()).toEqual(["#1047", "#1044", "#1042", "#1043", "#1046", "#1045"]);

    await user.selectOptions(screen.getByLabelText("Sort by"), "date");
    expect(rowIds()).toEqual(["#1044", "#1042", "#1043", "#1047", "#1045", "#1046"]);

    expect(screen.getAllByRole("combobox", { name: "Sort by" })).toHaveLength(1);
  });
});
