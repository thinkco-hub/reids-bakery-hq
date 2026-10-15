import { describe, expect, it } from "vitest";
import {
  ALL_ROLES,
  DEFAULT_TAB,
  canAccessChams,
  canAccessIngredients,
  canAccessReconciliation,
  canAccessTab,
} from "./permissions";
import type { NavTabId, UserRole } from "../types/domain";

/**
 * Listing every tab by key means TypeScript fails the file if a NavTabId is
 * added or renamed without re-checking the matrix, so the assertions below
 * always cover all of them.
 */
const ALL_TABS: Record<NavTabId, true> = {
  dashboard: true,
  pos: true,
  orders: true,
  clients: true,
  inventory: true,
  "inventory-closing-count": true,
  "inventory-reconciliation": true,
  recipes: true,
  "production-runs": true,
  calendar: true,
  "reports-dashboard": true,
  "reports-closing": true,
  "reports-inventory": true,
  "audit-logs": true,
  "user-management": true,
};

const TAB_IDS = Object.keys(ALL_TABS) as NavTabId[];

/** Every role x tab pair: allowed here, denied everywhere else. */
const ALLOWED_TABS: Record<UserRole, NavTabId[]> = {
  cashier: ["dashboard", "pos", "orders", "calendar"],
  kitchen: [
    "dashboard",
    "pos",
    "orders",
    "recipes",
    "production-runs",
    "inventory",
    "inventory-closing-count",
  ],
  sales_marketing: [
    "dashboard",
    "pos",
    "orders",
    "clients",
    "production-runs",
    "calendar",
    "inventory",
    "inventory-closing-count",
    "reports-dashboard",
    "reports-closing",
    "reports-inventory",
  ],
  research_development: [
    "dashboard",
    "pos",
    "orders",
    "clients",
    "inventory",
    "inventory-closing-count",
    "recipes",
    "production-runs",
    "calendar",
    "reports-dashboard",
    "reports-closing",
    "reports-inventory",
  ],
  admin: TAB_IDS,
  super_admin: TAB_IDS,
};

const sorted = (tabs: NavTabId[]) => [...tabs].sort();

describe("canAccessTab", () => {
  it.each(ALL_ROLES)("%s may open exactly its own tabs", (role) => {
    const allowed = TAB_IDS.filter((tab) => canAccessTab(role, tab));
    expect(sorted(allowed)).toEqual(sorted(ALLOWED_TABS[role]));
  });

  // The shell sends a role that loses its current tab to DEFAULT_TAB, so a
  // redirect there can never bounce.
  it.each(ALL_ROLES)("%s can always open the default tab", (role) => {
    expect(canAccessTab(role, DEFAULT_TAB)).toBe(true);
  });

  it("defaults to the dashboard", () => {
    expect(DEFAULT_TAB).toBe("dashboard");
  });
});

describe("feature-level access", () => {
  it("grants Chams to the admin tier and Research and Development only", () => {
    expect(ALL_ROLES.filter(canAccessChams)).toEqual(["research_development", "admin", "super_admin"]);
  });

  it("grants Reconciliation to the admin tier only", () => {
    expect(ALL_ROLES.filter(canAccessReconciliation)).toEqual(["admin", "super_admin"]);
  });

  it("follows Reconciliation for Ingredients", () => {
    for (const role of ALL_ROLES) {
      expect(canAccessIngredients(role)).toBe(canAccessReconciliation(role));
    }
  });
});
