import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderShell, signInAsCashier } from "./test/render-shell";

const sidebar = () => screen.getByRole("complementary");

/** Sidebar labels stay plain text whether the links are buttons or anchors. */
async function openTab(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(within(sidebar()).getByText(label));
}

/** The catalogue renders a phone list and a tablet grid from one array, so both match. */
async function addProduct(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  times: number
) {
  for (let i = 0; i < times; i++) {
    const [card] = screen.getAllByRole("button", { name: new RegExp(name) });
    await user.click(card);
  }
}

describe("app shell state identity", () => {
  it("keeps POS ticket lines and an open overlay across a tab switch", async () => {
    const user = userEvent.setup();
    renderShell();
    await signInAsCashier(user);
    await screen.findByText("Point of Sale");

    await openTab(user, "Point of Sale");
    await addProduct(user, "Butter Croissant", 2);
    await addProduct(user, "Pain au Chocolat", 1);

    expect(screen.getByText("₱240.00")).toBeInTheDocument();
    await screen.findAllByLabelText("Remove one Pain au Chocolat");

    await user.click(screen.getByRole("button", { name: "Add customer" }));
    expect(
      screen.getByLabelText("Cancel and return to the ticket")
    ).toBeInTheDocument();

    await openTab(user, "Orders");
    expect(screen.getByRole("heading", { name: "Orders" })).toBeInTheDocument();
    expect(screen.queryByText("Current Ticket")).toBeNull();

    await openTab(user, "Point of Sale");

    // Reseeding from src/data/initial*.ts would empty the ticket here; clearing
    // the shell overlays on navigation would close the picker.
    expect(screen.getByText("₱240.00")).toBeInTheDocument();
    await screen.findAllByLabelText("Remove one Pain au Chocolat");
    expect(
      screen.getByLabelText("Cancel and return to the ticket")
    ).toBeInTheDocument();
  });
});
