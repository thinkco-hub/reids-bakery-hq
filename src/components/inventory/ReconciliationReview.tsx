import React, { useEffect, useId, useRef, useState } from "react";
import DeleteConfirmDialog from "../common/DeleteConfirmDialog";
import Table, { TableHead } from "../common/Table";
import EmptyState from "../common/EmptyState";
import StatCard from "../common/StatCard";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { discrepancyLabel } from "../../utils/counts";
import {
  COUNT_RESOLUTION_LABELS,
  COUNT_STATUS_LABELS,
  COUNT_STATUS_TONES,
  TONE_TEXT,
} from "../../utils/status";
import type {
  CountResolutionAction,
  IngredientStock,
  InventoryCount,
  MenuItemStock,
} from "../../types/domain";

const FILTERS = [
  { key: "flagged", label: "Flagged" },
  { key: "all", label: "All" },
  { key: "resolved", label: "Resolved" },
] as const;

type ReconciliationFilter = (typeof FILTERS)[number]["key"];

interface ReconciliationReviewProps {
  counts: InventoryCount[];
  menuInventory: MenuItemStock[];
  ingredients: IngredientStock[];
  onResolve: (id: string, action: CountResolutionAction) => void;
  onApplyAll: () => void;
}

export default function ReconciliationReview({
  counts,
  menuInventory,
  ingredients,
  onResolve,
  onApplyAll,
}: ReconciliationReviewProps) {
  const [filter, setFilter] = useState<ReconciliationFilter>("flagged");
  const [confirmingApplyAll, setConfirmingApplyAll] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  // Apply All disables itself once nothing is pending, so the dialog cannot return focus to it.
  const focusHeadingOnConfirm = useRef(false);

  useEffect(() => {
    if (!focusHeadingOnConfirm.current) return;
    focusHeadingOnConfirm.current = false;
    headingRef.current?.focus();
  }, [confirmingApplyAll]);

  const itemName = (c: InventoryCount) => {
    const list = c.itemType === "ingredient" ? ingredients : menuInventory;
    return list.find((i) => i.id === c.itemId)?.name || c.itemId;
  };

  const flaggedPending = counts.filter((c) => c.discrepancy !== 0 && c.status === "pending");
  const resolved = counts.filter((c) => c.status === "resolved");

  const confirmApplyAll = () => {
    focusHeadingOnConfirm.current = true;
    setConfirmingApplyAll(false);
    onApplyAll();
  };

  let visible = counts;
  if (filter === "flagged") visible = flaggedPending;
  else if (filter === "resolved") visible = resolved;

  const sorted = [...visible].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 w-full">
      <header className="mb-6 md:mb-8">
        <h2 ref={headingRef} id={headingId} tabIndex={-1} className="text-2xl md:text-3xl font-bold text-espresso">Inventory Reconciliation</h2>
        <p className="text-espresso/70 mt-1 font-medium text-sm md:text-base">
          Review discrepancies between counted and system stock
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <StatCard label="Flagged (Pending)" value={flaggedPending.length} accent={TONE_TEXT.danger} />
        <StatCard label="Total Counts Logged" value={counts.length} />
        <StatCard label="Resolved" value={resolved.length} accent={TONE_TEXT.success} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`px-4 py-1.5 rounded border text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button
          onClick={() => setConfirmingApplyAll(true)}
          disabled={flaggedPending.length === 0}
        >
          Apply All ({flaggedPending.length})
        </Button>
      </div>

      <Table label="Inventory counts" labelledBy={headingId} minWidth="min-w-[760px]">
        <TableHead>
          <th scope="col" className="px-6 py-4">Date</th>
          <th scope="col" className="px-6 py-4">Item</th>
          <th scope="col" className="px-6 py-4">Type</th>
          <th scope="col" className="px-6 py-4 text-right">System Qty</th>
          <th scope="col" className="px-6 py-4 text-right">Counted Qty</th>
          <th scope="col" className="px-6 py-4 text-right">Discrepancy</th>
          <th scope="col" className="px-6 py-4">Resolution</th>
          <th scope="col" className="px-4 py-4 text-center">Action</th>
        </TableHead>
        <tbody className="divide-y divide-gray-200 text-sm">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <EmptyState
                  title={filter === "flagged" ? "No flagged discrepancies right now." : "No records in this view."}
                  hint={
                    filter === "flagged"
                      ? "Counts that match system stock stay out of this list."
                      : "Switch the filter to see flagged or resolved counts."
                  }
                />
              </td>
            </tr>
          ) : (
            sorted.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-gray-600">{c.date}</td>
                <th scope="row" className="px-6 py-4 text-left font-medium text-gray-900">{itemName(c)}</th>
                <td className="px-6 py-4 text-gray-500 text-xs font-semibold uppercase">
                  {c.itemType === "ingredient" ? "Raw Material" : "Menu Item"}
                </td>
                <td className="px-6 py-4 text-right text-gray-600 tabular-nums">{c.systemQty}</td>
                <td className="px-6 py-4 text-right text-gray-600 tabular-nums">{c.countedQty}</td>
                <td
                  className={`px-6 py-4 text-right font-bold tabular-nums ${
                    c.discrepancy === 0 ? "text-gray-500" : c.discrepancy > 0 ? TONE_TEXT.success : TONE_TEXT.danger
                  }`}
                >
                  {discrepancyLabel(c.discrepancy)}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {c.status === "pending" ? (
                    <Badge family="stock" tone={COUNT_STATUS_TONES.pending}>
                      {COUNT_STATUS_LABELS.pending}
                    </Badge>
                  ) : (
                    <Badge family="stock" tone={COUNT_STATUS_TONES.resolved}>
                      {c.resolution ? COUNT_RESOLUTION_LABELS[c.resolution] : COUNT_STATUS_LABELS.resolved}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  {c.status === "pending" && c.discrepancy !== 0 ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghostBrand"
                        onClick={() => onResolve(c.id, "apply")}
                        title="Adjust system stock to match the counted quantity"
                        aria-label={`Apply counted quantity for ${itemName(c)}`}
                      >
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onResolve(c.id, "dismiss")}
                        title="Keep system stock as-is, discard this count"
                        aria-label={`Dismiss count for ${itemName(c)}`}
                      >
                        Dismiss
                      </Button>
                    </>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {confirmingApplyAll && (
        <DeleteConfirmDialog
          title={`Apply ${flaggedPending.length} pending count${flaggedPending.length !== 1 ? "s" : ""}?`}
          message="This will adjust system stock to match each counted quantity."
          confirmLabel="Apply all"
          onConfirm={confirmApplyAll}
          onCancel={() => setConfirmingApplyAll(false)}
        />
      )}
    </div>
  );
}
