import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNavigation } from "./hooks/useNavigation";
import { setFinePointer, setViewportWidth } from "./test/media";
import { renderShell, signInAsCashier } from "./test/render-shell";

const counters = vi.hoisted(() => ({ sidebarRenders: 0 }));

/**
 * Sidebar is useDrawerA11y's only consumer in the shell and calls it first
 * thing every render, so one call is one Sidebar render pass. Keystrokes are
 * separate events, so each one is its own commit — the count is commits.
 */
vi.mock("./hooks/useDrawerA11y", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./hooks/useDrawerA11y")>();
  return {
    ...mod,
    useDrawerA11y: (...args: Parameters<typeof mod.useDrawerA11y>) => {
      counters.sidebarRenders += 1;
      return mod.useDrawerA11y(...args);
    },
  };
});

afterEach(() => {
  setViewportWidth(1024);
  setFinePointer(true);
});

describe("shell chrome re-renders", () => {
  it("commits Sidebar zero times while the cashier types in POS search", async () => {
    setViewportWidth(1024);
    const user = userEvent.setup();
    renderShell("/pos");
    await signInAsCashier(user);
    await screen.findByRole("heading", { name: "Current Ticket" });

    const search = screen.getByRole("textbox", { name: "Search POS items" });
    const before = counters.sidebarRenders;
    await user.type(search, "croissant");
    const commits = counters.sidebarRenders - before;

    console.log(`[phase4] Sidebar commits for 9 POS search keystrokes: ${commits}`);
    expect(commits).toBe(0);
  });
});

let navRenders = 0;

/** Counts its own commits: the effect runs once per commit, never on a bailout. */
function NavigationProbe() {
  useNavigation();
  useEffect(() => {
    navRenders += 1;
  });
  return <div data-testid="navigation-probe" />;
}

describe("resize sweep", () => {
  it("re-renders the shell only when the viewport crosses 768 or 1024", () => {
    setViewportWidth(700);
    navRenders = 0;
    render(
      <MemoryRouter>
        <NavigationProbe />
      </MemoryRouter>
    );

    const steps: { width: number; renders: number }[] = [];
    let last = navRenders;
    for (let width = 700; width <= 1100; width += 10) {
      act(() => {
        setViewportWidth(width);
        window.dispatchEvent(new Event("resize"));
      });
      steps.push({ width, renders: navRenders - last });
      last = navRenders;
    }

    const crossings = steps.filter((step) => step.renders > 0).map((step) => step.width);
    const total = steps.reduce((sum, step) => sum + step.renders, 0);
    console.log(
      `[phase4] shell re-renders over a 700→1100 sweep: ${total} at ${JSON.stringify(crossings)}`
    );
    expect(crossings).toEqual([770, 1030]);
  });
});

function LayoutProbe() {
  const { canUseSidebarRail, isPhoneViewport } = useNavigation();
  return <div data-testid="layout-state">{`${canUseSidebarRail}:${isPhoneViewport}`}</div>;
}

describe("drawer/rail predicate", () => {
  const cases: { width: number; fine: boolean; expected: string; why: string }[] = [
    { width: 375, fine: false, expected: "false:true", why: "phone touch" },
    { width: 768, fine: false, expected: "false:false", why: "tablet touch starts the drawer band" },
    { width: 1023, fine: true, expected: "false:false", why: "mouse under 1024 keeps the drawer" },
    { width: 1024, fine: true, expected: "true:false", why: "wide mouse gets the rail" },
    { width: 1024, fine: false, expected: "false:false", why: "wide touch keeps the drawer" },
    { width: 1440, fine: true, expected: "true:false", why: "desktop mouse" },
  ];

  for (const { width, fine, expected, why } of cases) {
    it(`${width}px ${fine ? "mouse" : "touch"} → ${expected} (${why})`, () => {
      setViewportWidth(width);
      setFinePointer(fine);
      render(
        <MemoryRouter>
          <LayoutProbe />
        </MemoryRouter>
      );
      expect(screen.getByTestId("layout-state")).toHaveTextContent(expected);
    });
  }
});
