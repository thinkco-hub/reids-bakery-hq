import React, { useId } from "react";
import { Link } from "react-router";
import OrderStatusBadge from "../orders/OrderStatusBadge";
import Table, { TableHead } from "../common/Table";
import EmptyState from "../common/EmptyState";
import { formatMoney } from "../../utils/money";
import { computeOrderTotal } from "../../utils/orders";
import { orderPath } from "../../routes";
import type { Client, Order } from "../../types/domain";

interface ClientDetailProps {
  client: Client;
  orders: Order[];
  onBack: () => void;
}

export default function ClientDetail({ client, orders, onBack }: ClientDetailProps) {
  const ordersHeadingId = useId();
  const clientOrders = [...orders]
    .filter((o) => o.clientId === client.id)
    .sort((a, b) => b.requestedDate.localeCompare(a.requestedDate));

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-10 w-full">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center text-[0.9375rem] text-gray-500 font-medium tracking-wide">
          <li>
            <button
              onClick={onBack}
              className="-my-2 py-2 hover:text-brand-strong transition-colors"
            >
              Clients
            </button>
          </li>
          <li aria-hidden="true" className="mx-2 text-gray-500">&gt;</li>
          <li aria-current="page" className="text-ink font-bold">{client.name}</li>
        </ol>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-amber-disc text-espresso flex items-center justify-center font-bold text-xl flex-shrink-0">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-ink">{client.name}</h2>
            <p className="text-gray-500 text-sm">{clientOrders.length} order(s) on record</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Contact</p>
            <p className="text-ink font-medium">{client.contact || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email</p>
            <p className="text-ink font-medium">{client.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Address</p>
            <p className="text-ink font-medium">{client.address || "—"}</p>
          </div>
        </div>
        {client.standingOrder && (
          <div className="mt-6 bg-orange-50 rounded-lg p-4 text-sm text-espresso font-medium">
            <span className="font-bold">Standing Order: </span>
            {client.standingOrder}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 id={ordersHeadingId} className="text-lg font-bold text-ink">Order History</h3>
        </div>
        <Table label="Order history" labelledBy={ordersHeadingId} bare minWidth="min-w-[600px]">
          <TableHead>
            <th scope="col" className="px-5 py-3">Order #</th>
            <th scope="col" className="px-5 py-3">Requested Date</th>
            <th scope="col" className="px-5 py-3">Status</th>
            <th scope="col" className="px-5 py-3 text-right">Total</th>
          </TableHead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {clientOrders.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState title="No orders yet." hint="Orders placed for this client will appear here." />
                </td>
              </tr>
            ) : (
              clientOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <th scope="row" className="px-5 py-4 text-left font-medium text-ink">
                    <Link
                      to={orderPath(order.id)}
                      className="rounded hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong"
                    >
                      {order.id}
                    </Link>
                  </th>
                  <td className="px-5 py-4 text-gray-600">{order.requestedDate}</td>
                  <td className="px-5 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-ink tabular-nums">
                    {formatMoney(computeOrderTotal(order))}
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
