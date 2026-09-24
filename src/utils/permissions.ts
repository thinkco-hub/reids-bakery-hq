import type { NavTabId, UserRole } from "../types/domain";

/** Roles in display order (lowest to highest privilege). */
export const ALL_ROLES: readonly UserRole[] = [
  "cashier",
  "kitchen",
  "sales_marketing",
  "research_development",
  "admin",
  "super_admin",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  cashier: "Cashier",
  kitchen: "Kitchen",
  sales_marketing: "Sales and Marketing",
  research_development: "Research and Development",
  admin: "Admin",
  super_admin: "Super Admin / Owner",
};

/** Display name for a role. Tolerates legacy values (e.g. "staff") still present in old audit entries. */
export function roleLabel(role: string): string {
  return ROLE_LABELS[role as UserRole] ?? role.charAt(0).toUpperCase() + role.slice(1);
}

const INVENTORY_TABS: NavTabId[] = ["inventory", "inventory-closing-count"];
const REPORT_TABS: NavTabId[] = ["reports-dashboard", "reports-closing", "reports-inventory"];

const ADMIN_TABS: NavTabId[] = [
  "dashboard",
  "pos",
  "orders",
  "clients",
  ...INVENTORY_TABS,
  "inventory-reconciliation",
  "recipes",
  "production-runs",
  "calendar",
  ...REPORT_TABS,
  "audit-logs",
  "user-management",
];

/** Everything an admin sees except Reconciliation, Audit Logs and the Roles view. */
const R_AND_D_TABS = ADMIN_TABS.filter(
  (tab) =>
    tab !== "inventory-reconciliation" && tab !== "audit-logs" && tab !== "user-management"
);

/** Single source of truth for which tabs each role may open. */
const ROLE_TABS: Record<UserRole, ReadonlySet<NavTabId>> = {
  cashier: new Set<NavTabId>(["dashboard", "pos", "orders", "calendar"]),
  sales_marketing: new Set<NavTabId>([
    "dashboard",
    "pos",
    "orders",
    "calendar",
    "clients",
    "production-runs",
    ...INVENTORY_TABS,
    ...REPORT_TABS,
  ]),
  research_development: new Set<NavTabId>(R_AND_D_TABS),
  kitchen: new Set<NavTabId>([
    "dashboard",
    "pos",
    "orders",
    "recipes",
    "production-runs",
    ...INVENTORY_TABS,
  ]),
  admin: new Set<NavTabId>(ADMIN_TABS),
  super_admin: new Set<NavTabId>(ADMIN_TABS),
};

export const DEFAULT_TAB: NavTabId = "dashboard";

export function canAccessTab(role: UserRole, tab: NavTabId): boolean {
  return ROLE_TABS[role].has(tab);
}

export function canAccessReconciliation(role: UserRole): boolean {
  return canAccessTab(role, "inventory-reconciliation");
}

/** Ingredients (the Raw Materials table) follow the same rule as Reconciliation: admin tier only. */
export function canAccessIngredients(role: UserRole): boolean {
  return canAccessReconciliation(role);
}

/** The separate Chams stock ledger: admin tier plus Research and Development. */
export function canAccessChams(role: UserRole): boolean {
  return role === "admin" || role === "super_admin" || role === "research_development";
}

export function canManageRoles(role: UserRole): boolean {
  return canAccessTab(role, "user-management");
}

function isAdminTier(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

/**
 * Whether `actorRole` may move a user from `currentRole` to `newRole`.
 * Admins manage the non-admin roles; only a Super Admin may grant or revoke
 * Admin / Super Admin.
 */
export function canAssignRole(
  actorRole: UserRole,
  currentRole: UserRole,
  newRole: UserRole
): boolean {
  if (!canManageRoles(actorRole)) return false;
  if (isAdminTier(currentRole) || isAdminTier(newRole)) return actorRole === "super_admin";
  return true;
}
