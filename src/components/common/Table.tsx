import React from "react";
import type { ReactNode } from "react";

/**
 * The wide-table grammar: white card, one signed scroll region, and the table
 * named by its heading. Headers inside use `TableHead` (scope=col on each th
 * stays with the caller's cells).
 */
export interface TableProps {
  /** Names the scroll region for keyboard and screen-reader users. */
  label: string;
  /** id of the card heading that names the table. */
  labelledBy?: string;
  /** The table's minimum width, e.g. "min-w-[1040px]". */
  minWidth?: string;
  /** Inside an existing card: no second card chrome, just the scroll region. */
  bare?: boolean;
  /** A band above the table inside the card (a section title or a date group). */
  header?: ReactNode;
  children: ReactNode;
}

export default function Table({
  label,
  labelledBy,
  minWidth = "",
  bare = false,
  header,
  children,
}: TableProps) {
  const scroller = (
    <div className="overflow-x-auto w-full" tabIndex={0} role="region" aria-label={label}>
      <table
        aria-labelledby={labelledBy}
        className={`w-full text-left border-collapse ${minWidth}`}
      >
        {children}
      </table>
    </div>
  );
  if (bare) return scroller;
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {header}
      {scroller}
    </div>
  );
}

/** The shared header row: 12px semibold uppercase, gray-700 on a 50-step band. */
export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
        {children}
      </tr>
    </thead>
  );
}
