import React, { useId, useState } from "react";
import SelectField from "../common/SelectField";
import Table, { TableHead } from "../common/Table";
import Badge from "../common/Badge";
import { formatMonthLabel } from "../../utils/dates";
import { buildLedgerHistoryForBranchProduct } from "../../utils/ledger";
import { formatMoney } from "../../utils/money";
import { discrepancyLabel } from "../../utils/counts";
import type { ChamsBeginning, ChamsBranch, ChamsCount, ChamsMovement, ChamsProduct, LedgerRow } from "../../types/domain";

function TrendBars({ rows }: { rows: LedgerRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.remainingCalculated));
  return (
    <div className="flex items-end gap-2" style={{ height: 140 }}>
      {rows.map((r) => {
        const height = Math.max(2, (r.remainingCalculated / max) * 120);
        return (
          <div key={r.month} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
            <span className="text-[0.625rem] font-semibold text-gray-500 mb-1">{r.remainingCalculated}</span>
            <div
              className={`w-full max-w-[32px] rounded-t-[4px] ${r.flagged ? "bg-red-400" : "bg-chams-blue"}`}
              style={{ height }}
              title={`${r.branchName} — ${r.productName} — ${formatMonthLabel(r.month)}`}
            />
            <span className="text-[0.625rem] text-gray-500 mt-1 whitespace-nowrap">
              {formatMonthLabel(r.month).split(" ")[0].slice(0, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface LedgerHistoryProps {
  branches: ChamsBranch[];
  products: ChamsProduct[];
  beginnings: ChamsBeginning[];
  movements: ChamsMovement[];
  counts: ChamsCount[];
}

export default function LedgerHistory({ branches, products, beginnings, movements, counts }: LedgerHistoryProps) {
  const headingId = useId();
  const [branchId, setBranchId] = useState(branches[0]?.id || "");
  const [productId, setProductId] = useState(products[0]?.id || "");
  const branch = branches.find((b) => b.id === branchId);
  const product = products.find((p) => p.id === productId);
  const rows =
    branch && product ? buildLedgerHistoryForBranchProduct(branch, product, beginnings, movements, counts) : [];

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 w-full">
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 id={headingId} className="text-2xl md:text-3xl font-bold text-chams-navy">Ledger History</h2>
          <p className="text-chams-navy/70 mt-1 font-medium text-sm md:text-base">
            Multi-month trend of remaining stock per branch and siopao type.
          </p>
        </div>
        <div className="flex gap-2">
          <SelectField
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            aria-label="Branch"
            className="pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chams-blue focus:border-chams-blue outline-none text-gray-800 bg-white shadow-sm"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            aria-label="Siopao type"
            className="pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chams-blue focus:border-chams-blue outline-none text-gray-800 bg-white shadow-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </SelectField>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold text-chams-navy mb-4">Remaining Stock (Calculated)</h3>
        <TrendBars rows={rows} />
      </div>

      <Table label="Ledger history" labelledBy={headingId} minWidth="min-w-[940px]">
            <TableHead>
              <th scope="col" className="px-5 py-4">Month</th>
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
              {rows.map((r) => (
                <tr key={r.month} className={`hover:bg-gray-50/50 transition-colors ${r.flagged ? "bg-red-50/40" : ""}`}>
                  <th scope="row" className="px-5 py-4 text-left font-medium text-ink">{formatMonthLabel(r.month)}</th>
                  <td className="px-5 py-4 text-right text-gray-600 tabular-nums">{r.beginning}</td>
                  <td className="px-5 py-4 text-right text-gray-600 tabular-nums">{r.restocked}</td>
                  <td className="px-5 py-4 text-right text-gray-600 tabular-nums">{r.spoilage}</td>
                  <td className="px-5 py-4 text-right text-gray-600 tabular-nums">{r.sold}</td>
                  <td className="px-5 py-4 text-right text-green-700 font-medium tabular-nums">{formatMoney(r.revenue)}</td>
                  <td className="px-5 py-4 text-right font-semibold text-ink tabular-nums">{r.remainingCalculated}</td>
                  <td className="px-5 py-4 text-right text-gray-600">
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
              ))}
            </tbody>
      </Table>
    </div>
  );
}
