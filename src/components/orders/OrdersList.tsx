import React, { useId, useState } from "react";
import OrderCardList from "./OrderCardList";
import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";
import SearchField from "../common/SearchField";
import SelectField from "../common/SelectField";
import Table, { TableHead } from "../common/Table";
import EmptyState from "../common/EmptyState";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { EyeIcon, XIcon } from "../icons";
import { formatMoney } from "../../utils/money";
import { computeOrderTotal, getPaymentStatus, hasShortfall, ORDER_STATUSES } from "../../utils/orders";
import type { Client, MenuItemStock, Order, OrderStatus } from "../../types/domain";

type SortKey = "created" | "date" | "total";

interface OrdersListProps {
  orders: Order[];
  clients: Client[];
  menuInventory: MenuItemStock[];
  onView: (order: Order) => void;
}

export default function OrdersList({ orders, clients, menuInventory, onView }: OrdersListProps) {
  const headingId = useId();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const [dateFilter, setDateFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created");

  const clientName = (order: Order) =>
    clients.find((c) => c.id === order.clientId)?.name || order.customerName || "—";

  const filtered = orders.filter((order) => {
    const matchStatus = statusFilter === "All" || order.status === statusFilter;
    const matchDate = !dateFilter || order.requestedDate === dateFilter;
    const matchSearch =
      !search ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      clientName(order).toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchDate && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === "total") return computeOrderTotal(b) - computeOrderTotal(a);
    if (sortKey === "date") return b.requestedDate.localeCompare(a.requestedDate);
    return b.createdAt.localeCompare(a.createdAt);
  });

  const hasFilters = !!search || statusFilter !== "All" || !!dateFilter;
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setDateFilter("");
  };
  const emptyState = (
    <EmptyState
      title="No orders match these filters."
      hint="Try another client, status or date."
      action={
        <Button size="sm" variant="ghostBrand" onClick={clearFilters}>
          Clear filters
        </Button>
      }
    />
  );

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 w-full">
      <header className="mb-6 md:mb-8">
        <h2 id={headingId} className="text-3xl font-bold text-ink">Orders</h2>
        <p className="text-gray-500 mt-1">Manage all customer orders and production status.</p>
      </header>

      <div className="bg-white border border-gray-200 rounded-lg p-2 mb-4 flex flex-col md:flex-row items-center gap-2 shadow-sm">
        <SearchField
          value={search}
          onChange={setSearch}
          ariaLabel="Search orders by client or order number"
          placeholder="Search client or order #..."
        />
        <div className="w-full h-px md:w-px md:h-8 bg-gray-200 my-2 md:my-0 block"></div>
        <div className="flex items-center gap-2 w-full md:w-auto px-2">
          <label htmlFor="orders-date-filter" className="text-sm text-gray-500 font-medium whitespace-nowrap">Filter Date:</label>
          <div className="flex-1 md:flex-none rounded-md focus-within:ring-2 focus-within:ring-brand-strong">
            <input
              id="orders-date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-md bg-white text-sm text-gray-600 focus:border-brand-strong outline-none cursor-pointer"
            />
          </div>
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              aria-label="Clear date filter"
              className="text-gray-500 hover:text-red-700 p-1 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong"
              title="Clear Date Filter"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["All", ...ORDER_STATUSES] as Array<OrderStatus | "All">).map((tab) => {
          const count = tab === "All" ? orders.length : orders.filter((o) => o.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              aria-pressed={statusFilter === tab}
              className={`px-4 py-1.5 min-h-[2.75rem] rounded border text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong ${
                statusFilter === tab
                  ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Container-query breakpoint: below the 1040px table floor (+2px card border) the table swaps to a card list. */}
      <div className="@container">
        {/* One sort model for both views — the table and the cards read the same order. */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <label htmlFor="orders-sort" className="text-sm font-medium text-gray-500 whitespace-nowrap">
            Sort by
          </label>
          <SelectField
            id="orders-sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="pl-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 focus:ring-2 focus:ring-brand-strong focus:border-brand-strong outline-none"
          >
            <option value="created">Newest first</option>
            <option value="date">Requested date</option>
            <option value="total">Total amount</option>
          </SelectField>
        </div>

        <div className="@max-[1042px]:hidden">
          <Table label="Orders list" labelledBy={headingId} minWidth="min-w-[1040px]">
            <TableHead>
              <th scope="col" className="px-6 py-4">Order #</th>
              <th scope="col" className="px-6 py-4">Client</th>
              <th scope="col" className="px-6 py-4">Items</th>
              <th scope="col" className="px-6 py-4">Requested Date</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4">Payment</th>
              <th scope="col" className="px-6 py-4 text-right">Total</th>
              <th scope="col" className="px-4 py-4 text-center">Action</th>
            </TableHead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8}>{emptyState}</td>
                </tr>
              ) : (
                sorted.map((order) => {
                  const shortfall = order.status !== "Delivered" && hasShortfall(order, menuInventory);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      <th scope="row" className="px-6 py-4 text-left font-medium text-gray-900">{order.id}</th>
                      <td className="px-6 py-4 text-gray-800">{clientName(order)}</td>
                      <td className="px-6 py-4 text-gray-600">{order.items.length} item(s)</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{order.requestedDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <OrderStatusBadge status={order.status} />
                          {shortfall && (
                            <Badge family="micro" size="xs" tone="danger">
                              Shortfall
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <PaymentStatusBadge status={getPaymentStatus(order)} />
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900 tabular-nums">
                        {formatMoney(computeOrderTotal(order))}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => onView(order)}
                          aria-label={`View order ${order.id}`}
                          className="text-gray-500 hover:text-brand-strong transition-colors p-2 rounded-md hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong"
                          title="View Order Details"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        {/* Tablet/mobile (<1042px container): stacked card list with accordion + bottom sheet. */}
        <OrderCardList
          orders={sorted}
          menuInventory={menuInventory}
          getClientName={clientName}
          onView={onView}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
        />
      </div>
    </div>
  );
}
