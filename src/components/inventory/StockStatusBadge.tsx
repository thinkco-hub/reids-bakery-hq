import React from "react";
import Badge from "../common/Badge";
import { STOCK_STATUS_LABELS, STOCK_STATUS_TONES } from "../../utils/status";
import { getStockStatus } from "../../utils/stock";
import type { StockItem } from "../../types/domain";

export default function StockStatusBadge({ item }: { item: StockItem }) {
  const status = getStockStatus(item);
  const text =
    status === "low"
      ? `Low (Need ${item.target - item.qty})`
      : STOCK_STATUS_LABELS[status];

  return (
    <Badge family="stock" tone={STOCK_STATUS_TONES[status]}>
      {text}
    </Badge>
  );
}
