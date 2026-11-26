/**
 * Shared inline SVG icons (Heroicons-style, 24px grid). Decorative by default:
 * every icon is aria-hidden, so the adjacent text carries the meaning.
 * All outline icons use stroke 2; sizing/colour come from `className`.
 */
import type { ReactNode } from "react";

interface IconProps {
  className?: string;
}

function Outline({ className = "h-5 w-5", children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

function Solid({ className = "h-5 w-5", children }: IconProps & { children: ReactNode }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      {children}
    </svg>
  );
}

export function SearchIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </Outline>
  );
}

export function CalendarIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </Outline>
  );
}

export function XIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M6 18L18 6M6 6l12 12" />
    </Outline>
  );
}

export function MenuIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Outline>
  );
}

export function ChevronDownIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M19 9l-7 7-7-7" />
    </Outline>
  );
}

export function ChevronLeftIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M15 19l-7-7 7-7" />
    </Outline>
  );
}

export function ChevronRightIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M9 5l7 7-7 7" />
    </Outline>
  );
}

export function ArrowLeftIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </Outline>
  );
}

export function CheckIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M5 13l4 4L19 7" />
    </Outline>
  );
}

export function PlusIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M12 4v16m8-8H4" />
    </Outline>
  );
}

export function MinusIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M20 12H4" />
    </Outline>
  );
}

export function TrashIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </Outline>
  );
}

export function DownloadIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
    </Outline>
  );
}

export function PencilIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </Outline>
  );
}

export function PrinterIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </Outline>
  );
}

export function GridIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </Outline>
  );
}

export function ClockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Outline>
  );
}

export function AlertTriangleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </Outline>
  );
}

export function MoneyIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Outline>
  );
}

export function ClipboardListIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </Outline>
  );
}

export function DocumentIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </Outline>
  );
}

export function InfoIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Outline>
  );
}

export function CheckCircleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Outline>
  );
}

export function EyeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </Outline>
  );
}

export function InboxIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </Outline>
  );
}

/** Finished goods / stock box, replacing the section emoji. */
export function BoxIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </Outline>
  );
}

export function ShoppingCartIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Solid className={className}>
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
    </Solid>
  );
}

export function UserPlusIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Outline className={className}>
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M20 8v6M23 11h-6" />
    </Outline>
  );
}

export function UserIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <Solid className={className}>
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
      />
    </Solid>
  );
}
