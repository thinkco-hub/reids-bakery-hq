import React from "react";
import type { ReactNode } from "react";

/**
 * One stat-card grammar: label over a tabular value, optionally an icon disc,
 * a right-hand flag, a sub line, or `onSelect` to make the whole card a toggle
 * (aria-pressed) for the filterable stat bars.
 */
export interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Text colour class for the value; defaults to ink. */
  accent?: string;
  sub?: string;
  icon?: ReactNode;
  /** Tinted disc classes around the icon, e.g. "bg-green-50 text-green-700". */
  iconClassName?: string;
  /** Right-hand flag rendered on the icon row (a delta or "Action Req" pill). */
  flag?: ReactNode;
  /** Filterable stat bars make the card a toggle button. */
  onSelect?: () => void;
  active?: boolean;
}

export default function StatCard({
  label,
  value,
  accent = "text-ink",
  sub,
  icon,
  iconClassName = "",
  flag,
  onSelect,
  active = false,
}: StatCardProps) {
  const cardCls = onSelect
    ? `text-left bg-white p-4 md:p-5 rounded-2xl border shadow-sm transition-all ${
        active
          ? "border-brand-strong ring-2 ring-brand-strong/30"
          : "border-gray-100 hover:border-gray-300"
      }`
    : "bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm";

  const body = (
    <>
      {(icon || flag) && (
        <div
          className={`flex items-center justify-between ${onSelect ? "mb-2 md:mb-3" : "mb-4"}`}
        >
          {icon && (
            <span
              className={`${
                onSelect ? "w-9 h-9 md:w-10 md:h-10" : "w-12 h-12"
              } rounded-full flex items-center justify-center ${iconClassName}`}
            >
              {icon}
            </span>
          )}
          {flag}
        </div>
      )}
      <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">{label}</p>
      <p className={`text-xl md:text-2xl font-bold tabular-nums ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </>
  );

  if (onSelect) {
    return (
      <button type="button" aria-pressed={active} onClick={onSelect} className={cardCls}>
        {body}
      </button>
    );
  }
  return <div className={cardCls}>{body}</div>;
}
