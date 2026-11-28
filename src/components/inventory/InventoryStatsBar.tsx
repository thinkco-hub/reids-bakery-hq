import React from "react";
import StatCard from "../common/StatCard";
import { Alert02Icon, Cancel01Icon, CheckIcon, DashboardCircleIcon } from "../icons";
import { STOCK_STATUS_LABELS } from "../../utils/status";
import { getStockStatus } from "../../utils/stock";
import type { StockItem, StockStatus } from "../../types/domain";

const CARD_STYLES = {
  all: {
    label: "Total Items",
    icon: <DashboardCircleIcon className="w-5 h-5" />,
    iconBg: "bg-gray-100 text-gray-500",
  },
  ok: {
    icon: <CheckIcon className="w-5 h-5" />,
    iconBg: "bg-green-50 text-green-700",
  },
  low: {
    icon: <Alert02Icon className="w-5 h-5" />,
    iconBg: "bg-brand/10 text-brand-strong",
  },
  out: {
    icon: <Cancel01Icon className="w-5 h-5" />,
    iconBg: "bg-red-50 text-red-700",
  },
};

interface InventoryStatsBarProps {
  items: StockItem[];
  activeFilter: "all" | StockStatus;
  onFilterChange: (filter: "all" | StockStatus) => void;
}

export default function InventoryStatsBar({ items, activeFilter, onFilterChange }: InventoryStatsBarProps) {
  const counts: Record<"all" | StockStatus, number> = { all: items.length, ok: 0, low: 0, out: 0 };
  items.forEach((item) => {
    counts[getStockStatus(item)] += 1;
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {(["all", "ok", "low", "out"] as const).map((key) => {
        const style = CARD_STYLES[key];
        const label = key === "all" ? CARD_STYLES.all.label : STOCK_STATUS_LABELS[key];
        return (
          <StatCard
            key={key}
            label={label}
            value={counts[key]}
            icon={style.icon}
            iconClassName={style.iconBg}
            active={activeFilter === key}
            onSelect={() => onFilterChange(key)}
          />
        );
      })}
    </div>
  );
}
