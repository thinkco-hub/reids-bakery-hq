import { afterEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import App from "./App";
import { PATH_BY_TAB } from "./routes";
import { canAccessTab } from "./utils/permissions";
import type { NavTabId } from "./types/domain";
import { renderShell, signInAsCashier } from "./test/render-shell";

const sidebar = () => screen.getByRole("complementary");

/** The router's own address, printed for the assertions a visible screen cannot make. */
function PathnameProbe() {
  const { pathname } = useLocation();
  return <div data-testid="pathname">{pathname}</div>;
}

/** renderShell plus the probe, for tests that have to name the URL they landed on. */
function renderShellAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <PathnameProbe />
    </MemoryRouter>
  );
}

const pathInAddressBar = () => screen.getByTestId("pathname").textContent;

/** useNavigation reads the width when it mounts, so this runs before rendering. */
function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
}

afterEach(() => setViewportWidth(1024));

/** Admin is the only tier whose Inventory group has a submenu to expand. */
async function signInAsAdmin(user: UserEvent) {
  const password = document.querySelector('input[type="password"]');
  if (!(password instanceof HTMLInputElement)) throw new Error("No password field");

  const email = screen.getByRole("textbox");
  await user.clear(email);
  await user.type(email, "admin@rbc.test");
  await user.type(password, "admin123");
  await user.click(screen.getByRole("button", { name: "Log In" }));
}

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

describe("sign-out", () => {
  it("starts the next sign-in on the default tab, not the tab just left", async () => {
    const user = userEvent.setup();
    renderShell("/pos");
    await signInAsCashier(user);
    await screen.findByRole("heading", { name: "Current Ticket" });

    await user.click(within(sidebar()).getByText("Log Out"));
    await screen.findByRole("button", { name: "Log In" });

    // The URL is the only thing that outlives the session, so a sign-out that
    // leaves it on /pos puts the next user straight back on the POS tab.
    await signInAsCashier(user);
    expect(
      await screen.findByRole("heading", { name: "Dashboard" }, { timeout: 3000 })
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Current Ticket" })).toBeNull();
  });
});

describe("nested routes", () => {
  it("opens the Inventory submenu for a nested route loaded cold", async () => {
    const user = userEvent.setup();
    renderShell("/inventory/reconciliation");
    await signInAsAdmin(user);

    await screen.findByRole("heading", { name: "Inventory Reconciliation" });
    // Nothing clicked a chevron here: the route is what opened the group.
    expect(
      within(sidebar()).getByRole("link", { name: "Reconciliation" })
    ).toBeInTheDocument();
  });

  it("takes Closing Count off the stock tables and back, URL and all", async () => {
    const user = userEvent.setup();
    renderShellAt("/inventory");
    await signInAsAdmin(user);
    await screen.findByRole("heading", { name: "Inventory: Menu Items" });

    await user.click(screen.getByRole("button", { name: "Closing Count" }));
    expect(
      await screen.findByRole("heading", { name: "Closing Inventory Count" })
    ).toBeInTheDocument();
    expect(pathInAddressBar()).toBe("/inventory/closing-count");

    await user.click(screen.getByRole("button", { name: "Back to Inventory" }));
    expect(
      await screen.findByRole("heading", { name: "Inventory: Menu Items" })
    ).toBeInTheDocument();
    expect(pathInAddressBar()).toBe("/inventory");
  });

  it("closes the phone drawer when a nested screen is chosen from it", async () => {
    const user = userEvent.setup();
    setViewportWidth(375);
    renderShellAt("/inventory");
    await signInAsAdmin(user);
    await screen.findByRole("heading", { name: "Inventory: Menu Items" });

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    await user.click(within(sidebar()).getByRole("link", { name: "Reconciliation" }));

    expect(
      await screen.findByRole("heading", { name: "Inventory Reconciliation" })
    ).toBeInTheDocument();
    expect(pathInAddressBar()).toBe("/inventory/reconciliation");
    // Off-canvas is the only thing that hides the drawer, so the transform is
    // the state under test — the submenu link itself stays in the document.
    expect(sidebar().className).toContain("-translate-x-full");
  });

  it("keeps a clicked group closed on the very route that would open it", async () => {
    const user = userEvent.setup();
    renderShellAt("/inventory");
    await signInAsAdmin(user);

    await within(sidebar()).findByRole("link", { name: "Reconciliation" });
    // The second svg in the group header is the chevron: it toggles, it does not navigate.
    await user.click(
      within(sidebar()).getByRole("link", { name: "Inventory" }).querySelectorAll("svg")[1]
    );

    expect(within(sidebar()).queryByRole("link", { name: "Reconciliation" })).toBeNull();
    expect(pathInAddressBar()).toBe("/inventory");
  });
});

/**
 * The paths a cashier may not open, read off PATH_BY_TAB rather than typed out
 * here. A leaf that was never wrapped has to fail this sweep, and a hand-written
 * list would carry the same blind spot as the missing guard.
 */
const cashierDeniedPaths = (Object.keys(PATH_BY_TAB) as NavTabId[])
  .filter((tab) => !canAccessTab("cashier", tab))
  .map((tab) => PATH_BY_TAB[tab]);

describe("route access guards", () => {
  it.each(cashierDeniedPaths)("signing in as a cashier off %s lands on the dashboard", async (path) => {
    const user = userEvent.setup();
    renderShellAt(path);
    await signInAsCashier(user);

    // The guard navigates while mounting, so the dashboard is awaited before the
    // address is read; an unwrapped leaf would sit on its own path and time out.
    await screen.findByRole("heading", { name: "Dashboard" });
    expect(pathInAddressBar()).toBe("/");
  });
});
