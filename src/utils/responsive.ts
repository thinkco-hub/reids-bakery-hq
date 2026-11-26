/** Viewport classes shared by the app shells (App, Sidebar, Chams ledger). */

import { useEffect, useState } from "react";

/** Below this width the POS ticket lives in the top bar instead of a side panel. */
const RAIL_QUERY = "(min-width: 1024px)";

/** The phone layout is everything narrower than the md step (768px). */
const PHONE_FLOOR_QUERY = "(min-width: 768px)";

/**
 * A mouse is a hovering fine pointer. Touch-capable laptops report this too,
 * which is the point: the old maxTouchPoints sniff denied them the rail. Real
 * tablets and phones answer false and keep the drawer.
 */
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * Tracks one media query through its own change listener, so the component
 * re-renders only when the answer flips — not on every resize pixel.
 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches
  );

  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/**
 * True when the viewport may show the pinned, hover-to-expand sidebar rail.
 * Touch devices never qualify: they have no hover to trigger the expansion, and
 * iPadOS reports a desktop-sized viewport in landscape. They get the same
 * off-canvas drawer as the phone, opened from the hamburger.
 */
export function useCanUseSidebarRail(): boolean {
  const wideEnough = useMediaQuery(RAIL_QUERY);
  const finePointer = useMediaQuery(FINE_POINTER_QUERY);
  return wideEnough && finePointer;
}

/** True while the phone POS layout (one column, ticket in the top bar) applies. */
export function useIsPhoneViewport(): boolean {
  return !useMediaQuery(PHONE_FLOOR_QUERY);
}
