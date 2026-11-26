import type {
  CountResolution,
  CountStatus,
  ProductionRunDisposition,
  StockStatus,
} from "../types/domain";

// ---- Status tones ----
// One meaning, one hue, one step. Text always sits at the 700 step on a
// 50-step wash (the documented status table in DESIGN.md).

export type StatusTone =
  | "danger"
  | "success"
  | "info"
  | "warning"
  | "attention"
  | "neutral"
  | "espresso";

/** Bordered pill: 300-step border, 50-step wash, 700-step text. */
export const TONE_BORDERED: Record<StatusTone, string> = {
  danger: "border-red-300 bg-red-50 text-red-700",
  success: "border-green-300 bg-green-50 text-green-700",
  info: "border-blue-300 bg-blue-50 text-blue-700",
  warning: "border-amber-300 bg-amber-50 text-amber-700",
  attention: "border-orange-300 bg-orange-50 text-brand-strong",
  neutral: "border-gray-300 bg-gray-50 text-gray-700",
  espresso: "border-espresso/30 bg-espresso/5 text-espresso",
};

/** Borderless pill: 50-step wash, 700-step text. */
export const TONE_WASH: Record<StatusTone, string> = {
  danger: "bg-red-50 text-red-700",
  success: "bg-green-50 text-green-700",
  info: "bg-blue-50 text-blue-700",
  warning: "bg-amber-50 text-amber-700",
  attention: "bg-orange-50 text-brand-strong",
  neutral: "bg-gray-50 text-gray-700",
  espresso: "bg-espresso/10 text-espresso",
};

/** Text-only status voice, at the 700 step. */
export const TONE_TEXT: Record<StatusTone, string> = {
  danger: "text-red-700",
  success: "text-green-700",
  info: "text-blue-700",
  warning: "text-amber-700",
  attention: "text-brand-strong",
  neutral: "text-gray-700",
  espresso: "text-espresso",
};

// ---- Production runs ----

export const RUN_STATUS_LABELS: Record<ProductionRunDisposition, string> = {
  scheduled: "Scheduled",
  insufficient: "Insufficient Stock",
  completed: "Completed",
};

export const RUN_STATUS_TONES: Record<ProductionRunDisposition, StatusTone> = {
  scheduled: "info",
  insufficient: "danger",
  completed: "success",
};

// ---- Stock levels ----

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  out: "Out of Stock",
  low: "Low Stock",
  ok: "In Stock",
};

export const STOCK_STATUS_TONES: Record<StockStatus, StatusTone> = {
  out: "danger",
  low: "attention",
  ok: "espresso",
};

// ---- Inventory count reconciliation ----

export const COUNT_STATUS_LABELS: Record<CountStatus, string> = {
  pending: "Pending",
  resolved: "Resolved",
};

export const COUNT_STATUS_TONES: Record<CountStatus, StatusTone> = {
  pending: "attention",
  resolved: "neutral",
};

export const COUNT_RESOLUTION_LABELS: Record<CountResolution, string> = {
  match: "Match",
  applied: "Applied",
  dismissed: "Dismissed",
};
