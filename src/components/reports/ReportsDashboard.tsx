import React, { useId, useMemo, useState } from "react";
import RevenueByDayChart from "./RevenueByDayChart";
import SellerBarList from "./SellerBarList";
import EditSaleModal from "./EditSaleModal";
import Table, { TableHead } from "../common/Table";
import EmptyState from "../common/EmptyState";
import StatCard from "../common/StatCard";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { DownloadIcon, PencilIcon, PrinterIcon, SearchIcon } from "../icons";
import { linkedSaleView } from "../../utils/checkout";
import { formatDateTime } from "../../utils/dates";
import { formatMoney } from "../../utils/money";
import {
  DATE_PRESETS,
  getPresetRange,
  filterSalesByRange,
  computeSalesSummary,
  getBestSellers,
  getWorstSellers,
  getRevenueByDay,
  getRevenueByPaymentMethod,
  salesToCSV,
  downloadCSV,
} from "../../utils/sales";
import type {
  DatePresetId,
  EditSaleInput,
  Order,
  PaymentMethod,
  PosProduct,
  RevenueByPaymentMethod,
  Sale,
  SaleId,
} from "../../types/domain";

const METHOD_COLORS: Record<PaymentMethod, string> = {
  Cash: "var(--color-brand)",
  GCash: "var(--color-chams-blue)",
  "Bank Transfer": "var(--color-espresso)",
  Card: "var(--color-gray-400)",
};

/** Donut of the payment split (FR-3.8.2) — inline SVG, no chart dependency. */
function PaymentDonut({ data }: { data: RevenueByPaymentMethod[] }) {
  const total = data.reduce((sum, m) => sum + m.revenue, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const segments = data.reduce<
    { list: Array<RevenueByPaymentMethod & { fraction: number; dash: number; offset: number }>; offset: number }
  >(
    (acc, m) => {
      const fraction = total > 0 ? m.revenue / total : 0;
      const dash = fraction * circumference;
      return {
        list: [...acc.list, { ...m, fraction, dash, offset: acc.offset }],
        offset: acc.offset + dash,
      };
    },
    { list: [], offset: 0 }
  ).list;

  return (
    <div className="flex items-center gap-5 md:gap-6">
      <svg viewBox="0 0 120 120" className="w-32 h-32 md:w-36 md:h-36 -rotate-90 shrink-0" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-gray-100)" strokeWidth="16" />
        {segments.map((s) => (
          <circle
            key={s.method}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={METHOD_COLORS[s.method]}
            strokeWidth="16"
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset}
          >
            <title>{`${s.method}: ${formatMoney(s.revenue)}`}</title>
          </circle>
        ))}
      </svg>
      <ul className="text-sm space-y-1.5">
        {segments.map((s) => (
          <li key={s.method} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: METHOD_COLORS[s.method] }}
            />
            <span className="text-gray-600">{s.method}</span>
            <span className="font-semibold text-gray-900 tabular-nums">
              {Math.round(s.fraction * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ReportsDashboardProps {
  sales: Sale[];
  orders: Order[];
  /** POS projection of the catalogue, for the edit-sale item picker. */
  products: PosProduct[];
  onReprintSale?: (sale: Sale) => void;
  onSaveSaleEdit: (id: SaleId, input: EditSaleInput) => void;
}

export default function ReportsDashboard({
  sales,
  orders,
  products,
  onReprintSale,
  onSaveSaleEdit,
}: ReportsDashboardProps) {
  const [preset, setPreset] = useState<DatePresetId | "custom">("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [logSearch, setLogSearch] = useState("");
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const salesLogHeadingId = useId();

  const range = useMemo(() => {
    if (preset === "custom") return { start: customStart, end: customEnd };
    return getPresetRange(preset);
  }, [preset, customStart, customEnd]);

  // An Order-type sale reports as its linked order currently stands; a walk-in
  // reports as recorded.
  const reportSales = useMemo(
    () => sales.map((sale) => linkedSaleView(sale, orders)),
    [sales, orders]
  );

  const filteredSales = useMemo(() => {
    return filterSalesByRange(reportSales, range.start, range.end).slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [reportSales, range.start, range.end]);

  const summary = useMemo(() => computeSalesSummary(filteredSales), [filteredSales]);
  const bestSellers = useMemo(() => getBestSellers(filteredSales, 5), [filteredSales]);
  const worstSellers = useMemo(() => getWorstSellers(filteredSales, 5), [filteredSales]);
  const revenueByDay = useMemo(() => getRevenueByDay(filteredSales), [filteredSales]);
  const byPaymentMethod = useMemo(() => getRevenueByPaymentMethod(filteredSales), [filteredSales]);

  const query = logSearch.toLowerCase();
  const logRows = filteredSales.filter(
    (sale) =>
      !logSearch ||
      sale.id.toLowerCase().includes(query) ||
      sale.customerName.toLowerCase().includes(query)
  );

  const handleExport = () => {
    const csv = salesToCSV(filteredSales);
    const label = preset === "custom" ? `${customStart || "start"}_to_${customEnd || "end"}` : preset;
    downloadCSV(`sales-report-${label}.csv`, csv);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 w-full">
      {editingSale && (
        <EditSaleModal
          sale={editingSale}
          products={products}
          onClose={() => setEditingSale(null)}
          onSave={(input) => {
            onSaveSaleEdit(editingSale.id, input);
            setEditingSale(null);
          }}
        />
      )}

      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-ink">Sales Reports</h2>
          <p className="text-gray-500 mt-1">Revenue, best/worst sellers, and exportable sales logs.</p>
        </div>
        <Button
          onClick={handleExport}
          disabled={filteredSales.length === 0}
          title={filteredSales.length === 0 ? "No transactions in the selected range" : undefined}
        >
          <DownloadIcon className="w-4 h-4" />
          Export CSV
        </Button>
      </header>

      {/* Date range filter — one row, presets before custom */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-6 flex flex-wrap items-center gap-2">
        {DATE_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPreset(p.id)}
            aria-pressed={preset === p.id}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              preset === p.id
                ? "bg-espresso text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
        <div className="flex flex-col gap-2 min-w-0 basis-full flex-1 sm:basis-0 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            type="date"
            value={customStart}
            onChange={(e) => {
              setCustomStart(e.target.value);
              setPreset("custom");
            }}
            aria-label="Report start date"
            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none"
          />
          <span className="text-gray-500 text-sm">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => {
              setCustomEnd(e.target.value);
              setPreset("custom");
            }}
            aria-label="Report end date"
            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard label="Total Revenue" value={formatMoney(summary.totalRevenue)} accent="text-brand-strong" />
        <StatCard label="Transactions" value={summary.totalTransactions} />
        <StatCard label="Avg Ticket" value={formatMoney(summary.avgTicket)} />
        <StatCard label="Tax Collected" value={formatMoney(summary.totalTax)} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold text-ink mb-4">Revenue by Day</h3>
        <RevenueByDayChart data={revenueByDay} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-ink mb-4">Best Sellers</h3>
          <SellerBarList items={bestSellers} barColor="bg-brand" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-ink mb-4">Worst Sellers</h3>
          <SellerBarList items={worstSellers} barColor="bg-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold text-ink mb-4">Revenue by Payment Method</h3>
        {byPaymentMethod.length === 0 ? (
          <EmptyState
            title="No transactions in this range."
            hint="Adjust the date range to include a sale."
          />
        ) : (
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <PaymentDonut data={byPaymentMethod} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
              {byPaymentMethod.map((m) => (
                <div key={m.method} className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-medium text-gray-500 mb-1">{m.method}</p>
                  <p className="text-lg font-bold text-ink tabular-nums">{formatMoney(m.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 id={salesLogHeadingId} className="text-lg font-bold text-ink">Sales Log</h3>
          <div className="relative sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              aria-label="Search sales by sale number or customer"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-brand-strong focus:border-brand-strong"
              placeholder="Search sale # or customer..."
            />
          </div>
        </div>
        <Table label="Sales log" labelledBy={salesLogHeadingId} bare minWidth="min-w-[760px]">
          <TableHead>
            <th scope="col" className="px-6 py-3">Sale</th>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3">Type</th>
            <th scope="col" className="px-6 py-3">Customer</th>
            <th scope="col" className="px-6 py-3">Payment</th>
            <th scope="col" className="px-6 py-3 text-right">Total</th>
            <th scope="col" className="px-6 py-3 text-right">Edit</th>
            <th scope="col" className="px-6 py-3 text-right">Receipt</th>
          </TableHead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {logRows.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    title={logSearch ? "No sales match your search." : "No sales found in the selected range."}
                    hint={logSearch ? undefined : "Adjust the date range to include a sale."}
                    action={
                      logSearch ? (
                        <Button size="sm" variant="ghostBrand" onClick={() => setLogSearch("")}>
                          Clear search
                        </Button>
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              logRows.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50/50">
                  <th scope="row" className="px-6 py-3 text-left font-medium text-gray-900">
                    {sale.id}
                    {!!sale.editHistory?.length && (
                      <Badge
                        family="micro"
                        size="xs"
                        tone="attention"
                        className="ml-2 uppercase tracking-wide"
                      >
                        <span title={`Edited ${sale.editHistory.length} time${sale.editHistory.length === 1 ? "" : "s"}`}>
                          Edited
                        </span>
                      </Badge>
                    )}
                  </th>
                  <td className="px-6 py-3 text-gray-600">{formatDateTime(sale.createdAt)}</td>
                  <td className="px-6 py-3 text-gray-600">{sale.type}</td>
                  <td className="px-6 py-3 text-gray-800">{sale.customerName}</td>
                  <td className="px-6 py-3 text-gray-600">{sale.paymentMethod}</td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900 tabular-nums">{formatMoney(sale.total)}</td>
                  <td className="px-6 py-3 text-right">
                    {/* A linked sale's order is its only editor. */}
                    {!sale.orderId && (
                      <button
                        onClick={() => setEditingSale(sale)}
                        title="Edit sale details"
                        aria-label={`Edit sale ${sale.id}`}
                        className="p-2 rounded-lg text-gray-500 hover:text-espresso hover:bg-orange-50 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => onReprintSale?.(sale)}
                      title="View / Print Receipt"
                      aria-label={`View receipt for sale ${sale.id}`}
                      className="p-2 rounded-lg text-gray-500 hover:text-brand-strong hover:bg-orange-50 transition-colors"
                    >
                      <PrinterIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
