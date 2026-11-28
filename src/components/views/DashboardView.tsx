import React from "react";
import { Link } from "react-router";
import OrderStatusBadge from "../orders/OrderStatusBadge";
import StatCard from "../common/StatCard";
import EmptyState from "../common/EmptyState";
import {
  Alert02Icon,
  Calendar03Icon,
  CheckIcon,
  Clock01Icon,
  PhilippinePesoIcon,
} from "../icons";
import { orderPath } from "../../routes";
import { addDaysISO, formatDate, toISODate } from "../../utils/dates";
import { formatMoney } from "../../utils/money";
import { computeOrderTotal } from "../../utils/orders";
import { getRevenueByDay } from "../../utils/sales";
import type { Client, NavTabId, Order, Quantity, Sale } from "../../types/domain";

interface DashboardViewProps {
  orders: Order[];
  clients: Client[];
  /** The sale ledger, so Today's Revenue matches the Reports screens. */
  sales: Sale[];
  /** Merged finished-goods and raw-material stock below target. */
  lowStockAlerts: Array<{
    id: string;
    name: string;
    qty: Quantity;
    target: Quantity;
    type: string;
    unit?: string;
  }>;
  pendingOrdersCount: number;
  readyOrdersCount: number;
  onNavClick: (tab: NavTabId) => void;
}

export default function DashboardView({
  orders,
  clients,
  sales,
  lowStockAlerts,
  pendingOrdersCount,
  readyOrdersCount,
  onNavClick,
}: DashboardViewProps) {
  const recentOrdersHeadingId = React.useId();
  const today = new Date();
  const todayLabel = formatDate(today);
  const todayKey = toISODate(today);
  const yesterdayKey = addDaysISO(todayKey, -1);
  const revenueByDay = getRevenueByDay(sales);
  const revenueOn = (date: string) =>
    revenueByDay.find((entry) => entry.date === date)?.revenue ?? 0;
  const todayRevenue = revenueOn(todayKey);
  const yesterdayRevenue = revenueOn(yesterdayKey);
  // No previous day to compare against means no percentage, not 0%.
  const revenueChangePercent =
    yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : null;

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 w-full">
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-ink">Dashboard</h2>
          <p className="text-gray-500 mt-1">
            Overview of your bakery operations today.
          </p>
        </div>
        <div className="self-center md:self-auto bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center text-sm font-medium text-gray-600">
          <Calendar03Icon className="w-4 h-4 mr-2 text-brand-strong" />
          {todayLabel}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          label="Today's Revenue"
          value={formatMoney(todayRevenue)}
          icon={<PhilippinePesoIcon className="w-6 h-6" />}
          iconClassName="bg-orange-50 text-brand-strong"
          flag={
            revenueChangePercent !== null ? (
              <span className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full tabular-nums ${
                    revenueChangePercent >= 0
                      ? "text-green-700 bg-green-50"
                      : "text-red-700 bg-red-50"
                  }`}
                >
                  {revenueChangePercent >= 0 ? "+" : ""}
                  {revenueChangePercent.toFixed(1)}%
                </span>
                <span className="text-xs font-medium text-gray-500">vs yesterday</span>
              </span>
            ) : undefined
          }
        />
        <StatCard
          label="Pending Orders"
          value={pendingOrdersCount}
          icon={<Clock01Icon className="w-6 h-6" />}
          iconClassName="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="Low Stock Alerts"
          value={lowStockAlerts.length}
          icon={<Alert02Icon className="w-6 h-6" />}
          iconClassName="bg-red-50 text-red-700"
          flag={
            lowStockAlerts.length > 0 ? (
              <span className="text-red-700 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">
                Action Req
              </span>
            ) : undefined
          }
        />
        <StatCard
          label="Ready for Dispatch"
          value={readyOrdersCount}
          icon={<CheckIcon className="w-6 h-6" />}
          iconClassName="bg-green-50 text-green-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 id={recentOrdersHeadingId} className="text-lg font-bold text-ink">
              Recent Orders
            </h3>
            <button
              onClick={() => onNavClick("orders")}
              className="-my-2 py-2 text-sm text-brand-strong font-medium hover:underline"
            >
              View All
            </button>
          </div>
          <div
            className="p-0 flex-1 overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label="Recent orders"
          >
            <table aria-labelledby={recentOrdersHeadingId} className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-gray-50/50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <th scope="col" className="px-5 py-3">Order #</th>
                  <th scope="col" className="px-5 py-3">Client</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {orders.slice(0, 4).map((order) => (
                  <tr key={order.id} className="hover:bg-orange-50/50 transition-colors">
                    <th scope="row" className="px-5 py-4 text-left font-medium text-ink">
                      <Link
                        to={orderPath(order.id)}
                        className="rounded hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong"
                      >
                        {order.id}
                      </Link>
                    </th>
                    <td className="px-5 py-4 text-gray-800">
                      {clients.find((c) => c.id === order.clientId)?.name || order.customerName || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4 font-medium text-ink text-right tabular-nums">
                      {formatMoney(computeOrderTotal(order))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-ink flex items-center">
              Inventory Alerts
              <span className="ml-2 bg-red-100 text-red-700 py-0.5 px-2 rounded-full text-xs tabular-nums">
                {lowStockAlerts.length}
              </span>
            </h3>
          </div>
          <div
            className="p-0 flex-1 overflow-y-auto max-h-[400px]"
            tabIndex={0}
            role="region"
            aria-label="Inventory alerts"
          >
            {lowStockAlerts.length === 0 ? (
              <EmptyState
                icon={<CheckIcon className="h-6 w-6 text-green-700" />}
                title="All stock levels are optimal."
                hint="Items below their reorder threshold will appear here."
              />
            ) : (
              <ul className="divide-y divide-gray-100">
                {lowStockAlerts.map((item) => (
                  <li
                    key={item.id}
                    className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-ink text-sm">
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        {item.id} • {item.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-red-700 block leading-tight tabular-nums">
                          {item.qty} {item.unit || ""}
                        </span>
                        <span className="text-xs text-gray-500">
                          Target: {item.target}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
