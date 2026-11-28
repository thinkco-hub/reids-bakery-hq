import React, { useId, useRef } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { Alert02Icon } from "../icons";

interface DeleteConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Destructive-action confirmation dialog, replacing window.confirm. */
export default function DeleteConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  const headingId = useId();
  const messageId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  // z-[110] keeps this above a z-[100] detail card when delete is opened from inside it.
  return (
    <Modal
      role="alertdialog"
      labelledBy={headingId}
      describedBy={messageId}
      onClose={onCancel}
      initialFocusRef={cancelRef}
      overlayClassName="z-[110] bg-black/50 backdrop-blur-sm p-4"
      className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-7 animate-fadeIn"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
          <Alert02Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 id={headingId} className="text-xl font-bold text-ink">{title}</h2>
          <p id={messageId} className="mt-2 text-sm leading-relaxed text-gray-500">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button ref={cancelRef} variant="secondary" size="lg" className="w-full sm:w-auto" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" size="lg" className="w-full sm:w-auto" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
