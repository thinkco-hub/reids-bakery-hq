import React from "react";
import Badge from "../common/Badge";
import type { StatusTone } from "../../utils/status";
import type { OrderStatus } from "../../types/domain";

const TONE_BY_STATUS: Record<OrderStatus, StatusTone> = {
  Pending: "info",
  "In Production": "espresso",
  Ready: "success",
  Delivered: "neutral",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={TONE_BY_STATUS[status]}>{status}</Badge>;
}
