import React from "react";
import type { ReactNode } from "react";

/**
 * The status badge families (DESIGN.md): `status` is the bordered pill for
 * order/payment/run states, `stock` the borderless bold pill, `micro` the
 * small inline tag. Tone colours live in utils/status.ts.
 */
import { TONE_BORDERED, TONE_WASH, type StatusTone } from "../../utils/status";

export type BadgeFamily = "status" | "stock" | "micro";

const FAMILY: Record<BadgeFamily, string> = {
  status: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium whitespace-nowrap",
  stock: "inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap",
  micro: "inline-flex items-center px-2 py-0.5 rounded-full font-bold whitespace-nowrap",
};

export interface BadgeProps {
  tone: StatusTone;
  family?: BadgeFamily;
  /** Micro tags are documented at 10px (xs) or 12px (sm). */
  size?: "xs" | "sm";
  className?: string;
  children: ReactNode;
}

export default function Badge({ tone, family = "status", size = "sm", className = "", children }: BadgeProps) {
  const toneClasses = family === "status" ? TONE_BORDERED[tone] : TONE_WASH[tone];
  const sizeClasses = family === "micro" ? (size === "xs" ? "text-[10px]" : "text-xs") : "";
  return (
    <span className={`${FAMILY[family]} ${sizeClasses} ${toneClasses} ${className}`}>
      {family === "status" && (
        <span aria-hidden="true" className="text-[10px] leading-none">
          ●
        </span>
      )}
      {children}
    </span>
  );
}
