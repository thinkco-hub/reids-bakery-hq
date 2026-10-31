import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { ReactNode } from "react";
import { initialUsers } from "../data/initialUsers";
import { BakeryProvider } from "../store/BakeryProvider";
import type { BakerySeed } from "../store/BakeryProvider";
import { ShellProvider } from "../routes/shell";
import type { ShellContextValue } from "../routes/shell";
import type { User } from "../types/domain";

const defaultUser =
  initialUsers.find((user) => user.role === "admin") ?? initialUsers[0];

export interface RenderBakeryOptions {
  initialPath?: string;
  currentUser?: User;
  seed?: BakerySeed;
}

/** The shell services a route module reads, without the sign-in screen around them. */
export function fixtureShell(currentUser: User): ShellContextValue {
  const noop = () => {};
  return {
    currentUser,
    users: initialUsers,
    updateUserRole: () => ({ ok: true }),
    setUserActive: () => ({ ok: true }),
    logout: noop,
    activeTab: null,
    backToList: noop,
    goToTab: noop,
    openPath: noop,
    isSidebarOpen: false,
    setIsSidebarOpen: noop,
    isInventoryExpanded: false,
    setIsInventoryExpanded: noop,
    isReportsExpanded: false,
    setIsReportsExpanded: noop,
    windowWidth: 1024,
  };
}

/** The same tree `renderWithBakery` mounts, for tests that re-render by hand. */
export function bakeryTree(ui: ReactNode, options: RenderBakeryOptions = {}) {
  const { initialPath = "/", currentUser = defaultUser, seed } = options;
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <ShellProvider value={fixtureShell(currentUser)}>
        <BakeryProvider currentUser={currentUser} seed={seed}>
          {ui}
        </BakeryProvider>
      </ShellProvider>
    </MemoryRouter>
  );
}

/**
 * A route-module harness: memory history, a signed-in fixture and the store.
 * Unlike renderShell it never mounts App, so the test states its own route
 * table and the auth screen never runs.
 */
export function renderWithBakery(ui: ReactNode, options: RenderBakeryOptions = {}) {
  const view = render(bakeryTree(ui, options));
  return {
    ...view,
    /** Re-renders under a different session, the way a role change does. */
    rerenderAs: (currentUser: User) =>
      view.rerender(bakeryTree(ui, { ...options, currentUser })),
  };
}
