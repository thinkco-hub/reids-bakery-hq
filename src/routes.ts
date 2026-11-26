import type { NavTabId } from "./types/domain";

/** The Chams stock ledger is a separate screen, not a tab of Reid's HQ. */
export const CHAMS_PATH = "/chams";

/**
 * The URL for every tab. The Record is exhaustive by type, so adding a member
 * to NavTabId without giving it a path here is a compile error — that is what
 * keeps this table, the route table and permissions.ts from drifting apart.
 *
 * The keys stay the permission keys in src/utils/permissions.ts; only the URL
 * spelling differs (user-management is /roles, the grouped tabs nest).
 */
export const PATH_BY_TAB: Record<NavTabId, string> = {
  dashboard: "/",
  pos: "/pos",
  orders: "/orders",
  clients: "/clients",
  inventory: "/inventory",
  "inventory-closing-count": "/inventory/closing-count",
  "inventory-reconciliation": "/inventory/reconciliation",
  recipes: "/recipes",
  "production-runs": "/production-runs",
  calendar: "/calendar",
  "reports-dashboard": "/reports",
  "reports-closing": "/reports/closing",
  "reports-inventory": "/reports/inventory",
  "audit-logs": "/audit-logs",
  "user-management": "/roles",
};

/** The view name a screen reader hears and the browser tab shows — the on-screen title. */
const VIEW_NAME_BY_TAB: Record<NavTabId, string> = {
  dashboard: "Dashboard",
  pos: "Point of Sale",
  orders: "Orders",
  clients: "Clients",
  inventory: "Inventory",
  "inventory-closing-count": "Closing Inventory Count",
  "inventory-reconciliation": "Inventory Reconciliation",
  recipes: "Recipes",
  "production-runs": "Production Runs",
  calendar: "Calendar",
  "reports-dashboard": "Sales Reports",
  "reports-closing": "End-of-Day Closing",
  "reports-inventory": "Closing Inventory",
  "audit-logs": "Audit Logs",
  "user-management": "Roles",
};

/**
 * Record URLs carry no tab, so they are named by pattern. `/recipes/new` has to
 * be tested before the recipe record pattern, or the editor would announce
 * itself as an existing recipe.
 */
const RECORD_VIEW_NAMES: Array<[RegExp, string]> = [
  [/^\/recipes\/new$/, "New Recipe"],
  [/^\/orders\/[^/]+$/, "Order Details"],
  [/^\/clients\/[^/]+$/, "Client Details"],
  [/^\/recipes\/[^/]+$/, "Recipe Details"],
];

/** The human name of the screen at `pathname`, for titles and announcements. */
export function viewNameFromPath(pathname: string): string {
  const normalized = normalize(pathname);
  if (normalized === CHAMS_PATH) return "Chams Ledger";
  const tab = tabFromPath(normalized);
  if (tab) return VIEW_NAME_BY_TAB[tab];
  for (const [pattern, name] of RECORD_VIEW_NAMES) {
    if (pattern.test(normalized)) return name;
  }
  return "Page not found";
}

const TAB_BY_PATH: Record<string, NavTabId> = Object.fromEntries(
  Object.entries(PATH_BY_TAB).map(([tab, path]) => [path, tab as NavTabId])
);

/** "/pos/" and "/pos" are the same route to the router, so parse them the same way. */
function normalize(pathname: string): string {
  return pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/**
 * The tab owning a path, by exact lookup. Null for the Chams ledger, for a record
 * URL like `/orders/%231042`, and for an unknown path. Do not widen it to a
 * longest match: Dashboard owns `/`, so every typo would resolve to it and the
 * catch-all route would stop being reachable.
 */
export function tabFromPath(pathname: string): NavTabId | null {
  return TAB_BY_PATH[normalize(pathname)] ?? null;
}

/**
 * Whether `pathname` is `path` or a route nested under it. "/inventory-nope"
 * owns nothing under "/inventory", so the boundary is a slash, not a prefix.
 */
export function isWithinPath(path: string, pathname: string): boolean {
  const target = normalize(pathname);
  return target === path || target.startsWith(`${path}/`);
}

/**
 * The one place an order URL is built. Order ids are minted as `#1042`, and a
 * bare `#` truncates the URL to path `/orders/` plus a fragment, so the
 * `:orderId` route would never match. Client and recipe ids are already
 * URL-safe, which is why this helper is orders-only.
 */
export const orderPath = (orderId: string): string =>
  `/orders/${encodeURIComponent(orderId)}`;

export function isChamsPath(pathname: string): boolean {
  return normalize(pathname) === CHAMS_PATH;
}
