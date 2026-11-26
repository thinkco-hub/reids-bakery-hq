import React, { useId, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { CheckIcon } from "../icons";
import { formatDateTime } from "../../utils/dates";
import { formatMoney } from "../../utils/money";
import type { Sale } from "../../types/domain";

interface ReceiptModalProps {
  receipt: Sale;
  onClose: () => void;
}

export default function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  const headingId = useId();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      // Lazy-load jsPDF so it stays out of the initial bundle.
      const { downloadReceiptPdf } = await import("../../utils/receiptPdf");
      downloadReceiptPdf(receipt);
    } catch {
      setExportError("The receipt PDF could not be prepared. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal
      labelledBy={headingId}
      onClose={onClose}
      overlayClassName="z-[100] bg-black/50 backdrop-blur-sm p-4 print:bg-white print:static"
      className="print-receipt bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-sm max-h-[90dvh] overflow-y-auto overscroll-contain animate-fadeIn print:shadow-none print:rounded-none"
    >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckIcon className="w-6 h-6 text-green-700" />
          </div>
          <h2 id={headingId} className="text-xl font-bold text-ink">Sale Complete</h2>
          <p className="text-gray-500 text-sm mt-1">{receipt.id}</p>
          {receipt.type === "Order" && (
            <p className="mt-2">
              <Badge family="stock" tone="attention">
                Added to Orders — tracked through production &amp; delivery
              </Badge>
            </p>
          )}
        </div>

        <div className="text-sm text-gray-600 space-y-1 mb-4 border-b border-dashed border-gray-300 pb-4">
          <div className="flex justify-between">
            <span>Customer</span>
            <span className="font-semibold text-gray-800">{receipt.customerName}</span>
          </div>
          {receipt.customerContact && (
            <div className="flex justify-between">
              <span>Contact</span>
              <span className="font-semibold text-gray-800">{receipt.customerContact}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Payment Method</span>
            <span className="font-semibold text-gray-800">{receipt.paymentMethod}</span>
          </div>
          {receipt.type === "Order" && (
            <div className="flex justify-between">
              <span>Delivery Date</span>
              <span className="font-semibold text-gray-800">{receipt.deliveryDate}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Date</span>
            <span className="font-semibold text-gray-800">
              {formatDateTime(receipt.createdAt)}
            </span>
          </div>
        </div>

        <ul className="divide-y divide-gray-100 mb-4 max-h-[25vh] overflow-y-auto">
          {receipt.items.map((item) => (
            <li key={item.id} className="py-2 flex justify-between text-sm">
              <span className="text-gray-700">
                <span className="text-gray-500 mr-2">{item.qty}x</span>
                {item.name}
              </span>
              <span className="font-semibold text-gray-900 tabular-nums">
                {formatMoney(item.price * item.qty)}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-1 mb-6 border-t border-dashed border-gray-300 pt-3">
          <div className="flex justify-between text-gray-500 text-sm">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney(receipt.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-sm">
            <span>Tax (5%)</span>
            <span className="tabular-nums">{formatMoney(receipt.tax)}</span>
          </div>
          <div
            className={`flex justify-between text-lg font-bold text-ink pt-1 ${
              receipt.notes ? "pb-3 border-b border-dashed border-gray-300" : ""
            }`}
          >
            <span>Total</span>
            <span className="text-brand-strong tabular-nums">{formatMoney(receipt.total)}</span>
          </div>
          {receipt.notes && (
            <div className="flex justify-between text-sm pt-1">
              <span className="text-gray-500">Notes</span>
              <span className="font-semibold text-gray-800 text-right max-w-[60%]">
                {receipt.notes}
              </span>
            </div>
          )}
        </div>

        <div className="print:hidden">
          <div className="flex gap-3">
            <Button variant="secondary" size="lg" className="flex-1" onClick={onClose}>
              Exit
            </Button>
            {/* aria-disabled rather than disabled: disabling the focused button drops focus to body. */}
            <Button
              variant="cta"
              size="lg"
              className="flex-1 aria-disabled:bg-gray-200 aria-disabled:text-gray-400 aria-disabled:cursor-not-allowed"
              onClick={handleDownload}
              aria-disabled={exporting}
            >
              {exporting ? "Preparing…" : "Download Receipt"}
            </Button>
          </div>
          {/* Mounted empty: a live region inserted with its text is often skipped by screen readers. */}
          <p role="status" className="sr-only">
            {exporting ? "Preparing your receipt PDF…" : ""}
          </p>
          {exportError && (
            <p role="alert" className="mt-3 text-center text-sm font-semibold text-red-700">
              {exportError}
            </p>
          )}
        </div>
    </Modal>
  );
}
