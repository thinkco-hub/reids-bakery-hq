import React from "react";
import type { ReactNode } from "react";
import { Archive04Icon } from "../icons";

/**
 * The one empty-state grammar: icon disc, a title that says whether there is
 * no data yet or no match, an optional hint, and the next action when one
 * exists. Rendered inside table cells or as a block in a card.
 */
export interface EmptyStateProps {
  /** Icon shown in the disc; defaults to the archive glyph. */
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <span className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
        {icon ?? <Archive04Icon className="h-6 w-6" />}
      </span>
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {hint && <p className="text-sm text-gray-500 mt-1">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
