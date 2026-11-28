import React, { useId, useState } from "react";
import { formatMonthLabel, shiftMonthKey } from "../../utils/dates";
import { buildLedgerForMonth } from "../../utils/ledger";
import { formatMoney } from "../../utils/money";
import { discrepancyLabel } from "../../utils/counts";
import { TONE_TEXT } from "../../utils/status";
import SearchField from "../common/SearchField";
import Table, { TableHead } from "../common/Table";
import EmptyState from "../common/EmptyState";
import StatCard from "../common/StatCard";
import Badge from "../common/Badge";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";
import type {
  ChamsBeginning,
  ChamsBranch,
  ChamsCount,
  ChamsMovement,
  ChamsProduct,
} from "../../types/domain";

export default function LedgerView({ branches, products, beginnings, movements, counts, month, onMonthChange }: {
  branches: ChamsBranch[];
  products: ChamsProduct[];
  beginnings: ChamsBeginning[];
  movements: ChamsMovement[];
  counts: ChamsCount[];
  month: string;
  onMonthChange: (month: string) => void;
}) {
  const headingId = useId();
  const [search, setSearch] = useState("");
  const rows = buildLedgerForMonth(branches, products, month, beginnings, movements, counts).sort(
    (a, b) => a.branchName.localeCompare(b.branchName) || a.productName.localeCompare(b.productName)
  );
  const flaggedCount = rows.filter((r) => r.flagged).length;
  const notSubmittedCount = rows.filter((r) => !r.countSubmitted).length;
  const totalRemaining = rows.reduce((sum, r) => sum + r.remainingCalculated, 0);
  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);

  const branchRevenues = branches.map((branch) => ({
    branch,
    revenue: rows
      .filter((r) => r.branchId === branch.id)
      .reduce((sum, r) => sum + r.revenue, 0),
  }));

  const query = search.toLowerCase();
  const visibleRows = rows.filter(
    (r) => r.branchName.toLowerCase().includes(query) || r.productName.toLowerCase().includes(query)
  );

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 w-full">
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 id={headingId} className="text-2xl md:text-3xl font-bold text-chams-navy">Branch Stock Ledger</h2>
          <p className="text-chams-navy/70 mt-1 font-medium text-sm md:text-base">
            Beginning, restocked, spoilage, sold and remaining siopao stock per branch.
          </p>
        </div>
        <div className="self-center md:self-auto flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-sm">
          <button
            onClick={() => onMonthChange(shiftMonthKey(month, -1))}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
            title="Previous month"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-chams-navy w-32 text-center">{formatMonthLabel(month)}</span>
          <button
            onClick={() => onMonthChange(shiftMonthKey(month, 1))}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
            title="Next month"
            aria-label="Next month"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard label="Branches" value={branches.length} accent="text-chams-navy" />
        <StatCard label="Flagged Discrepancies" value={flaggedCount} accent={TONE_TEXT.danger} />
        <StatCard label="Total Remaining (Calc.)" value={totalRemaining} accent="text-chams-navy" />
        <StatCard label="Total Revenue" value={formatMoney(totalRevenue)} accent={TONE_TEXT.success} />
      </div>

      {notSubmittedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium rounded-lg px-4 py-3 mb-4">
          {notSubmittedCount} branch/siopao combo{notSubmittedCount !== 1 ? "s" : ""} without a remaining count for{" "}
          {formatMonthLabel(month)} yet.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold text-chams-navy mb-4">Revenue by Branch</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {branchRevenues.map(({ branch, revenue }) => (
            <div key={branch.id} className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-medium text-gray-500 mb-1">{branch.name}</p>
              <p className="text-lg font-bold text-chams-navy tabular-nums">{formatMoney(revenue)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-2 mb-4 shadow-sm">
        <SearchField
          value={search}
          onChange={setSearch}
          ariaLabel="Search ledger by branch or siopao type"
          placeholder="Search branch or siopao type..."
        />
      </div>

      <Table label="Monthly stock ledger" labelledBy={headingId} minWidth="min-w-[1020px]">
        <TableHead>
          <th scope="col" className="px-5 py-4">Branch</th>
          <th scope="col" className="px-5 py-4">Siopao Type</th>
          <th scope="col" className="px-5 py-4 text-right">Beginning</th>
          <th scope="col" className="px-5 py-4 text-right">Restocked</th>
          <th scope="col" className="px-5 py-4 text-right">Spoilage</th>
          <th scope="col" className="px-5 py-4 text-right">Sold</th>
          <th scope="col" className="px-5 py-4 text-right">Revenue</th>
          <th scope="col" className="px-5 py-4 text-right">Remaining (Calc.)</th>
          <th scope="col" className="px-5 py-4 text-right">Remaining (Reported)</th>
          <th scope="col" className="px-5 py-4">Discrepancy</th>
        </TableHead>
        <tbody className="divide-y divide-gray-200 text-sm">
          {visibleRows.length === 0 ? (
            <tr>
              <td colSpan={10}>
                <EmptyState
                  title="No ledger rows match your search."
                  hint="Clear the search to see every branch and siopao type."
                />
              </td>
            </tr>
          ) : (
            visibleRows.map((r) => (
              <tr
                key={`${r.branchId}-${r.productId}`}
                className={`hover:bg-gray-50/50 transition-colors ${r.flagged ? "bg-red-50/40" : ""}`}
              >
                <th scope="row" className="px-5 py-4 text-left font-medium text-ink">{r.branchName}</th>
                <td className="px-5 py-4 text-gray-600">{r.productName}</td>
                <td className="px-5 py-4 text-right text-gray-600 tabular-nums">{r.beginning}</td>
                <td className="px-5 py-4 text-right text-gray-600 tabular-nums">{r.restocked}</td>
                <td className="px-5 py-4 text-right text-gray-600 tabular-nums">{r.spoilage}</td>
                <td className="px-5 py-4 text-right text-gray-600 tabular-nums">{r.sold}</td>
                <td className="px-5 py-4 text-right text-green-700 font-medium tabular-nums">{formatMoney(r.revenue)}</td>
                <td className="px-5 py-4 text-right font-semibold text-ink tabular-nums">{r.remainingCalculated}</td>
                <td className="px-5 py-4 text-right text-gray-600 tabular-nums">
                  {r.countSubmitted ? r.remainingReported : <span className="text-gray-500">—</span>}
                </td>
                <td className="px-5 py-4">
                  {!r.countSubmitted ? (
                    <Badge family="stock" tone="neutral">
                      Not Submitted
                    </Badge>
                  ) : r.flagged ? (
                    <Badge family="stock" tone="danger">
                      {discrepancyLabel(r.discrepancy as number)}
                    </Badge>
                  ) : (
                    <Badge family="stock" tone="success">
                      Match
                    </Badge>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
