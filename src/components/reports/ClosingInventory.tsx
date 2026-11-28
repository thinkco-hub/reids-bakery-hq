import React, { useId, useMemo, useState } from "react";
import Table, { TableHead } from "../common/Table";
import EmptyState from "../common/EmptyState";
import StatCard from "../common/StatCard";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { DownloadIcon } from "../icons";
import { downloadCSV } from "../../utils/sales";
import { discrepancyLabel, flaggedPendingCounts } from "../../utils/counts";
import { discrepancyTone, TONE_TEXT } from "../../utils/status";
import {
  todayISO,
  getDayRange,
  getWeekRange,
  getMonthRange,
  shiftDayRange,
  shiftWeekRange,
  shiftMonthKey,
  monthKeyOf,
  formatDayLabel,
  formatWeekLabel,
  formatMonthLabel,
} from "../../utils/dates";
import { formatMoney } from "../../utils/money";
import { computeClosingInventory, closingInventoryToCSV } from "../../utils/closingInventory";
import type {
  ClosingInventoryRow,
  IngredientStock,
  InventoryCount,
  ISODate,
  MenuItemStock,
} from "../../types/domain";

const pillCls = (active: boolean) =>
  `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
    active ? "bg-espresso text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
  }`;

function DiscrepancyBadge({ row }: { row: ClosingInventoryRow }) {
  if (!row.periodCountCount) {
    return <span className="text-gray-500">—</span>;
  }
  const tone = discrepancyTone(row.discrepancyQty);
  return (
    <Badge family="stock" tone={tone}>
      {discrepancyLabel(row.discrepancyQty)}
    </Badge>
  );
}

function ClosingSection({
  title,
  rows,
  emptyText,
}: {
  title: string;
  rows: ClosingInventoryRow[];
  emptyText: string;
}) {
  const headingId = useId();
  return (
    <div className="mb-6">
      <Table
        label={`${title} closing inventory`}
        labelledBy={headingId}
        minWidth="min-w-[760px]"
        header={
          <div className="p-5 border-b border-gray-100">
            <h3 id={headingId} className="text-base font-bold text-ink">
              {title}
            </h3>
          </div>
        }
      >
        <TableHead>
          <th scope="col" className="px-6 py-3">Item</th>
          <th scope="col" className="px-6 py-3">Unit</th>
          <th scope="col" className="px-6 py-3 text-right">System Qty</th>
          <th scope="col" className="px-6 py-3 text-right">Closing Qty</th>
          <th scope="col" className="px-6 py-3">Source</th>
          <th scope="col" className="px-6 py-3 text-right">Unit Value</th>
          <th scope="col" className="px-6 py-3 text-right">Closing Value</th>
          <th scope="col" className="px-6 py-3">Count Discrepancy</th>
        </TableHead>
        <tbody className="divide-y divide-gray-200 text-sm">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <EmptyState title={emptyText} hint="Stock recorded for this period will appear here." />
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/50">
                <th scope="row" className="px-6 py-3 text-left font-medium text-ink">{row.name}</th>
                <td className="px-6 py-3 text-gray-500">{row.unit}</td>
                <td className="px-6 py-3 text-right text-gray-500 tabular-nums">{row.systemQty}</td>
                <td className="px-6 py-3 text-right font-semibold text-ink tabular-nums">{row.closingQty}</td>
                <td className="px-6 py-3">
                  {row.closingSource === "counted" ? (
                    <Badge family="stock" tone="success" className="whitespace-nowrap">
                      Counted {row.lastCountDate}
                    </Badge>
                  ) : (
                    <Badge family="stock" tone="neutral">
                      System
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-3 text-right text-gray-600 tabular-nums">{formatMoney(row.unitValue)}</td>
                <td className="px-6 py-3 text-right font-semibold text-ink tabular-nums">
                  {formatMoney(row.closingValue)}
                </td>
                <td className="px-6 py-3">
                  <DiscrepancyBadge row={row} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}

interface ClosingInventoryProps {
  menuInventory: MenuItemStock[];
  ingredients: IngredientStock[];
  inventoryCounts: InventoryCount[];
}

export default function ClosingInventory({ menuInventory, ingredients, inventoryCounts }: ClosingInventoryProps) {
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [dayAnchor, setDayAnchor] = useState<ISODate>(todayISO());
  const [weekAnchor, setWeekAnchor] = useState<ISODate>(todayISO());
  const [monthKey, setMonthKey] = useState(monthKeyOf(todayISO()));

  const period = useMemo(
    () =>
      view === "day"
        ? getDayRange(dayAnchor)
        : view === "week"
        ? getWeekRange(weekAnchor)
        : getMonthRange(monthKey),
    [view, dayAnchor, weekAnchor, monthKey]
  );

  const result = useMemo(
    () => computeClosingInventory(period, menuInventory, ingredients, inventoryCounts),
    [period, menuInventory, ingredients, inventoryCounts]
  );

  const periodLabel =
    view === "day"
      ? formatDayLabel(dayAnchor)
      : view === "week"
      ? formatWeekLabel(period)
      : formatMonthLabel(monthKey);
  const canGoNext = period.end < todayISO();

  const goPrev = () => {
    if (view === "day") setDayAnchor(shiftDayRange(period, -1).start);
    else if (view === "week") setWeekAnchor(shiftWeekRange(period, -1).start);
    else setMonthKey(shiftMonthKey(monthKey, -1));
  };

  const goNext = () => {
    if (!canGoNext) return;
    if (view === "day") setDayAnchor(shiftDayRange(period, 1).start);
    else if (view === "week") setWeekAnchor(shiftWeekRange(period, 1).start);
    else setMonthKey(shiftMonthKey(monthKey, 1));
  };

  const handleExport = () => {
    const csv = closingInventoryToCSV(result);
    const label =
      view === "day"
        ? period.start
        : view === "week"
        ? `${period.start}_to_${period.end}`
        : monthKey;
    downloadCSV(`closing-inventory-${label}.csv`, csv);
  };

  const { summary } = result;
  const discrepancyAccent =
    summary.netDiscrepancyQty === 0
      ? "text-ink"
      : summary.netDiscrepancyQty > 0
      ? TONE_TEXT.warning
      : TONE_TEXT.danger;

  // The count-log summary the Reconciliation screen shows (FR-3.4.7), over the
  // whole log — not scoped to the selected period.
  const flaggedPending = flaggedPendingCounts(inventoryCounts);
  const resolved = inventoryCounts.filter((c) => c.status === "resolved");

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 w-full">
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-ink">Closing Inventory</h2>
          <p className="text-gray-500 mt-1">
            Stock on hand and its value as of the close of a day, week or month.
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={result.rows.length === 0}
          title={result.rows.length === 0 ? "No stock rows in the selected period" : undefined}
        >
          <DownloadIcon className="w-4 h-4" />
          Export CSV
        </Button>
      </header>

      {/* View toggle + period navigation */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-6 flex flex-wrap items-center gap-2">
        <button onClick={() => setView("day")} aria-pressed={view === "day"} className={pillCls(view === "day")}>
          Daily
        </button>
        <button onClick={() => setView("week")} aria-pressed={view === "week"} className={pillCls(view === "week")}>
          Weekly
        </button>
        <button onClick={() => setView("month")} aria-pressed={view === "month"} className={pillCls(view === "month")}>
          Monthly
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
        <Button variant="secondary" size="sm" onClick={goPrev} title="Previous period">
          ‹ Prev
        </Button>
        <span className="text-sm font-semibold text-gray-700 px-1 whitespace-nowrap">{periodLabel}</span>
        <Button variant="secondary" size="sm" onClick={goNext} disabled={!canGoNext} title="Next period">
          Next ›
        </Button>
      </div>

      <div
        className={`grid grid-cols-2 gap-3 md:gap-4 mb-6 ${
          ingredients.length > 0 ? "lg:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        <StatCard
          label="Total Closing Stock Value"
          value={formatMoney(summary.totalValue)}
          accent="text-brand-strong"
        />
        <StatCard
          label="Menu Items Value"
          value={formatMoney(summary.menuValue)}
          sub={`${menuInventory.length} item(s)`}
        />
        {/* A role without the ingredient grant is handed no raw-material rows,
            so its total value would be a zero-peso figure invented for the layout. */}
        {ingredients.length > 0 && (
          <StatCard
            label="Raw Materials Value"
            value={formatMoney(summary.ingredientValue)}
            sub={`${ingredients.length} item(s)`}
          />
        )}
        <StatCard
          label="Net Count Discrepancy"
          value={`${summary.netDiscrepancyQty > 0 ? "+" : ""}${summary.netDiscrepancyQty} unit(s)`}
          accent={discrepancyAccent}
          sub={`≈ ${formatMoney(summary.netDiscrepancyValue)} · ${summary.countedItems} counted / ${summary.systemItems} system`}
        />
      </div>

      {/* The same count-log summary the Reconciliation screen shows (FR-3.4.7). */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <StatCard label="Flagged (Pending)" value={flaggedPending.length} accent={TONE_TEXT.danger} />
        <StatCard label="Total Counts Logged" value={inventoryCounts.length} />
        <StatCard label="Resolved" value={resolved.length} accent={TONE_TEXT.success} />
      </div>

      <ClosingSection
        title="Menu Items"
        rows={result.menuRows}
        emptyText="No menu items to report."
      />
      {ingredients.length > 0 && (
        <ClosingSection
          title="Raw Materials"
          rows={result.ingredientRows}
          emptyText="No raw materials to report."
        />
      )}

      <p className="text-xs text-gray-500 leading-relaxed mt-2">
        Closing Qty is taken from the latest physical count on or before {period.end} (submitted via
        Inventory → Closing Count). Items without any count fall back to current system stock and are
        marked "System". Menu items are valued at selling price; raw materials at unit cost.
        Discrepancies reflect counts recorded inside the selected period. The count-log summary above
        covers every count ever logged, not just the selected period.
      </p>
    </div>
  );
}
