import { useId, useState } from "react";
import SearchField from "../common/SearchField";
import Table, { TableHead } from "../common/Table";
import EmptyState from "../common/EmptyState";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { getAuditLog } from "../../utils/auditLog";
import { formatTime, toISODate, todayISO } from "../../utils/dates";
import { roleLabel } from "../../utils/permissions";
import type { AuditActionType, AuditLogEntry } from "../../types/domain";

const ACTION_LABELS: Record<AuditActionType, string> = {
  "auth.login.success": "Login",
  "auth.login.failure": "Failed login",
  "auth.login.lockout": "Login lockout",
  "auth.logout": "Logout",
  "user.role_changed": "User role changed",
  "user.deactivated": "Account deactivated",
  "user.reactivated": "Account reactivated",
  "sale.completed": "POS sale completed",
  "sale.edited": "Sale details edited",
  "order.created": "Order created",
  "order.edited": "Order details edited",
  "order.payment_recorded": "Order payment recorded",
  "order.status_advanced": "Order status changed",
  "order.delivery_scheduled": "Order delivery scheduled",
  "order.delivered": "Order delivered",
  "inventory.ingredient_added": "Ingredient added",
  "inventory.ingredient_updated": "Ingredient updated",
  "inventory.restocked": "Stock restocked",
  "inventory.count_submitted": "Inventory count submitted",
  "inventory.count_resolved": "Inventory count resolved",
  "inventory.reconciliation_applied": "Reconciliation applied",
  "production.run_scheduled": "Production run scheduled",
  "production.run_completed": "Production run completed",
  "production.run_deleted": "Production run deleted",
  "client.created": "Client added",
  "client.updated": "Client updated",
  "recipe.saved": "Recipe saved",
  "recipe.pricing_rule_updated": "Pricing rule updated",
  "closing.day_closed": "Day closed",
  "closing.expense_added": "Expense added",
  "closing.expense_deleted": "Expense deleted",
};

const WARNING_ACTIONS: ReadonlySet<AuditActionType> = new Set([
  "auth.login.failure",
  "auth.login.lockout",
]);

export default function AuditLogsView() {
  const headingId = useId();
  // Read once on mount: the view is only mounted while its tab is open, so each visit is a fresh read.
  const [entries] = useState<AuditLogEntry[]>(() => getAuditLog());
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(() => todayISO());

  const query = search.trim().toLowerCase();
  const filtered = entries.filter((entry) => {
    const matchDate = !dateFilter || toISODate(new Date(entry.timestamp)) === dateFilter;
    const matchSearch =
      !query ||
      entry.userName.toLowerCase().includes(query) ||
      ACTION_LABELS[entry.action].toLowerCase().includes(query) ||
      (entry.entityId ?? "").toLowerCase().includes(query) ||
      (entry.details ?? "").toLowerCase().includes(query);
    return matchDate && matchSearch;
  });

  const today = todayISO();
  const hasFilters = !!search || dateFilter !== today;

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 w-full">
      <header className="mb-6 md:mb-8">
        <h2 id={headingId} className="text-3xl font-bold text-ink">Audit Logs</h2>
        <p className="text-gray-500 mt-1">
          Sign-ins and changes made by users across the system.
        </p>
      </header>

      <div className="bg-white border border-gray-200 rounded-lg p-2 mb-4 flex flex-col md:flex-row items-center gap-2 shadow-sm">
        <SearchField
          value={search}
          onChange={setSearch}
          ariaLabel="Search audit logs by user, action or details"
          placeholder="Search user, action or details..."
        />
        <div className="w-full h-px md:w-px md:h-8 bg-gray-200 my-2 md:my-0 block"></div>
        <div className="flex items-center gap-2 w-full md:w-auto px-2">
          <label htmlFor="audit-date-filter" className="text-sm text-gray-500 font-medium whitespace-nowrap">Date:</label>
          <input
            id="audit-date-filter"
            type="date"
            value={dateFilter}
            max={today}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-md bg-white text-sm text-gray-600 focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none flex-1 md:flex-none cursor-pointer"
          />
          {dateFilter !== today && (
            <Button variant="secondary" size="sm" onClick={() => setDateFilter(today)}>
              Today
            </Button>
          )}
        </div>
      </div>

      <p role="status" className="text-sm text-gray-500 mb-3">
        {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        {dateFilter ? ` on ${dateFilter}` : ""}
      </p>

      <Table label="Audit log entries" labelledBy={headingId} minWidth="min-w-[860px]">
        <TableHead>
          <th scope="col" className="px-6 py-4">Time</th>
          <th scope="col" className="px-6 py-4">User</th>
          <th scope="col" className="px-6 py-4">Action</th>
          <th scope="col" className="px-6 py-4">Entity</th>
          <th scope="col" className="px-6 py-4">Details</th>
        </TableHead>
        <tbody className="divide-y divide-gray-200 text-sm">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <EmptyState
                  title={hasFilters ? "No activity found for the selected filters." : "No activity logged today."}
                  hint={hasFilters ? "Try another date or clear the search." : undefined}
                  action={
                    hasFilters ? (
                      <Button
                        size="sm"
                        variant="ghostBrand"
                        onClick={() => {
                          setSearch("");
                          setDateFilter(today);
                        }}
                      >
                        Clear filters
                      </Button>
                    ) : undefined
                  }
                />
              </td>
            </tr>
          ) : (
            filtered.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap tabular-nums">
                  {formatTime(entry.timestamp)}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-ink">{entry.userName}</div>
                  {entry.userRole && (
                    <div className="text-xs text-gray-500">{roleLabel(entry.userRole)}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    family="micro"
                    tone={WARNING_ACTIONS.has(entry.action) ? "danger" : "attention"}
                    className="whitespace-nowrap"
                  >
                    {ACTION_LABELS[entry.action]}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {entry.entityType
                    ? `${entry.entityType}${entry.entityId ? ` ${entry.entityId}` : ""}`
                    : "—"}
                </td>
                <td className="px-6 py-4 text-gray-800">{entry.details ?? "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
