import React from "react";
import { createPortal } from "react-dom";

interface DeleteConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Destructive-action confirmation dialog, replacing window.confirm. */
export default function DeleteConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  // Portalled to <body> for the same reason as RunDetailModal: <main> is `relative z-10`,
  // which would cap this overlay below the mobile top bar. z-[110] keeps it above the
  // z-[100] detail card when delete is opened from inside that card.
  return createPortal(
    <div
      onClick={(event) => event.target === event.currentTarget && onCancel()}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-7 animate-fadeIn"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#121212]">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto min-h-[2.75rem] px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold whitespace-nowrap hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto min-h-[2.75rem] px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold whitespace-nowrap hover:bg-red-700 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
