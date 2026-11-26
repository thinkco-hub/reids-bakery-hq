import React, { useState } from "react";
import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";
import Badge from "../common/Badge";
import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import { ChevronDownIcon } from "../icons";
import { formatMoney } from "../../utils/money";
import { computeOrderTotal, getPaymentStatus, hasShortfall } from "../../utils/orders";
import type { MenuItemStock, Order } from "../../types/domain";

/** "2026-03-04" -> "Mar 04". Kept locale-independent and short for the card slot. */
export function formatDueDate(iso: string): string {
  const [year, month, day] = iso.split("-").map((part) => parseInt(part, 10));
  if (!year || !month || !day) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[month - 1]} ${String(day).padStart(2, "0")}`;
}

interface OrderCardListProps {
  orders: Order[];
  menuInventory: MenuItemStock[];
  getClientName: (order: Order) => string;
  onView: (order: Order) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}

/**
 * Tablet/mobile (< 1042px container width) representation of the orders table:
 * two-line cards with a fixed tabular value slot and an accordion reveal.
 * Rendered inside the parent @container.
 */
export default function OrderCardList({
  orders,
  menuInventory,
  getClientName,
  onView,
  hasFilters,
  onClearFilters,
}: OrderCardListProps) {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  return (
    <>
      <div className="hidden @max-[1042px]:grid gap-3">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200">
            <EmptyState
              title="No orders match these filters."
              hint={hasFilters ? "Try another client, status or date." : undefined}
              action={
                hasFilters ? (
                  <Button size="sm" variant="ghostBrand" onClick={onClearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              clientName={getClientName(order)}
              menuInventory={menuInventory}
              expanded={expandedCardId === order.id}
              onToggle={() => setExpandedCardId(expandedCardId === order.id ? null : order.id)}
              onView={onView}
            />
          ))
        )}
      </div>
    </>
  );
}

interface OrderCardProps {
  order: Order;
  clientName: string;
  menuInventory: MenuItemStock[];
  expanded: boolean;
  onToggle: () => void;
  onView: (order: Order) => void;
}

function OrderCard({ order, clientName, menuInventory, expanded, onToggle, onView }: OrderCardProps) {
  const shortfall = order.status !== "Delivered" && hasShortfall(order, menuInventory);
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Tappable header — expands in place (accordion). */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full text-left px-4 pt-3.5 pb-2 active:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-strong"
      >
        {/* Line 1: Identity (left) · Primary Value (right, fixed tabular slot). */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{clientName}</p>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{order.id}</p>
          </div>
          <p className="text-lg font-bold text-gray-900 whitespace-nowrap tabular-nums">
            {formatMoney(computeOrderTotal(order))}
          </p>
        </div>
        {/* Line 2: State badges + labeled secondary info. */}
        <div className="flex items-center flex-wrap gap-2 mt-2.5">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={getPaymentStatus(order)} />
          {shortfall && (
            <Badge family="micro" size="xs" tone="danger">
              Shortfall
            </Badge>
          )}
          {/* Ambiguous bare dates get an explicit label; status pills stay unlabeled. */}
          <span className="text-xs text-gray-600 ml-auto whitespace-nowrap">
            Requested {formatDueDate(order.requestedDate)}
          </span>
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Progressive reveal: hidden secondary fields + quick actions. */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50/50">
          <dl className="text-sm divide-y divide-gray-100">
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-gray-500">Items</dt>
              <dd className="text-gray-800 font-medium text-right">{order.items.length} item(s)</dd>
            </div>
            {order.items.map((item, i) => {
              const name =
                item.name || menuInventory.find((m) => m.id === item.menuItemId)?.name || item.menuItemId;
              return (
                <div key={`${item.menuItemId}-${i}`} className="flex justify-between gap-4 py-2 pl-4">
                  <dt className="text-gray-500 truncate">{name}</dt>
                  <dd className="text-gray-800 tabular-nums whitespace-nowrap">
                    {item.qty} × {formatMoney(item.unitPrice)}
                  </dd>
                </div>
              );
            })}
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-gray-500">Amount paid</dt>
              <dd className="text-gray-800 tabular-nums">
                {formatMoney(order.amountPaid || 0)}
              </dd>
            </div>
            {order.deliveryDate && (
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-gray-500">Delivery</dt>
                <dd className="text-gray-800">{formatDueDate(order.deliveryDate)}</dd>
              </div>
            )}
            {order.assignedTo && (
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-gray-500">Assigned to</dt>
                <dd className="text-gray-800">{order.assignedTo}</dd>
              </div>
            )}
            {order.notes && (
              <div className="py-2">
                <dt className="text-gray-500">Notes</dt>
                <dd className="text-gray-800 mt-0.5">{order.notes}</dd>
              </div>
            )}
          </dl>
          <Button
            size="md"
            onChrome
            onClick={() => onView(order)}
            className="w-full mt-3"
          >
            Manage order
          </Button>
        </div>
      )}
    </div>
  );
}
