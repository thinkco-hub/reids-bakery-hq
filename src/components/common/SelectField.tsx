import React from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "../icons";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Layout classes (flex-1, shrink-0, grid placement) belong here: this wrapper,
   *  not the select, is the flex/grid item. */
  wrapperClassName?: string;
}

/**
 * Dropdown with a uniform right-hand gutter and a chevron that turns while the
 * list is open.
 */
export default function SelectField({
  wrapperClassName = "",
  className = "",
  children,
  ...selectProps
}: SelectFieldProps) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      {/* The native arrow is painted flush to the border box, so padding-right
          alone cannot give it breathing room. It is dropped here and replaced
          below at a fixed offset, which keeps the gutter identical whatever the
          text size. Owns pr-10: call sites set pl-* only. */}
      <select
        {...selectProps}
        className={`peer appearance-none pr-10 ${className}`}
      >
        {children}
      </select>
      {/* A <select> renders only <option>/<optgroup> children, so the arrow has
          to be a sibling element rather than the select's own decoration. As an
          element it can be transformed, which is what makes the turn possible;
          the alternative (a background image) could only swap glyphs.
          peer-open targets :open, which is Baseline 2026 — where it is unsupported
          the chevron simply stays pointing down. */}
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-transform duration-200 peer-open:rotate-180" />
    </div>
  );
}
