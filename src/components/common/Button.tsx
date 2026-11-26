import React, { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

/**
 * The command-button ladder. Variants pick the colour family, sizes pick the
 * geometry of one role: sm = table row action, md = toolbar, lg = modal footer
 * or form submit, pill = a record header's action row. Chips, segments, tiles
 * and icon-only controls are controls, not commands, and stay bespoke.
 */
export type ButtonVariant =
  | "primary"
  | "cta"
  | "secondary"
  | "danger"
  | "dangerOutline"
  | "ghost"
  | "ghostBrand"
  | "ghostDanger"
  | "ghostSuccess"
  | "chams";

export type ButtonSize = "sm" | "md" | "lg" | "pill";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-espresso text-white font-bold hover:bg-espresso-deep",
  cta: "bg-brand-strong text-white font-bold hover:bg-brand-strong-hover",
  secondary: "bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100",
  danger: "bg-red-600 text-white font-bold hover:bg-red-700",
  dangerOutline: "bg-white border border-red-200 text-red-700 font-bold hover:bg-red-50",
  ghost: "text-gray-500 font-semibold hover:bg-gray-100",
  ghostBrand: "text-brand-strong font-semibold hover:bg-orange-50",
  ghostDanger: "text-gray-500 font-semibold hover:text-red-500 hover:bg-red-50",
  ghostSuccess: "text-green-700 font-semibold hover:bg-green-50",
  chams: "bg-chams-navy text-white font-bold hover:bg-chams-navy-deep",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 rounded-md text-sm",
  md: "px-4 py-2.5 rounded-lg text-sm shadow-sm",
  lg: "px-4 py-3 rounded-xl",
  pill: "px-4 py-1.5 min-h-[2.75rem] rounded-full text-sm shadow-sm",
};

const BASE = [
  "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors",
  "focus:outline-none focus-visible:ring-2",
  // The one disabled recipe: gray-200 fill, gray-400 label, no-shadow, no pointer.
  "disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed",
].join(" ");

const FOCUS_LIGHT = "focus-visible:ring-brand-strong";
/** On espresso chrome the brand ring disappears; use a white ring instead. */
const FOCUS_CHROME =
  "focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-espresso";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Set on buttons resting on espresso chrome (white focus ring). */
  onChrome?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", onChrome = false, className = "", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${BASE} ${onChrome ? FOCUS_CHROME : FOCUS_LIGHT} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
});

export default Button;
