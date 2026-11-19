import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReceiptModal from "./ReceiptModal";
import type { Sale } from "../../types/domain";

const pdf = vi.hoisted(() => {
  const stub = {
    download: vi.fn(),
    loading: Promise.resolve() as Promise<void>,
    release: () => {},
    hold() {
      stub.loading = new Promise<void>((resolve) => {
        stub.release = resolve;
      });
    },
  };
  return stub;
});

// The lazy chunk fetch is the export's only await, so holding the module open is
// what makes the pending state observable.
vi.mock("../../utils/receiptPdf", async () => {
  await pdf.loading;
  return { downloadReceiptPdf: pdf.download };
});

const sale: Sale = {
  id: "SALE-0001",
  type: "Walk-in",
  customerName: "Walk-in Customer",
  customerContact: "",
  paymentMethod: "Cash",
  items: [{ id: "MENU-001", name: "Pandesal", price: 5, category: "Bread", color: "#F17D0C", qty: 12 }],
  subtotal: 60,
  tax: 3,
  total: 63,
  deliveryDate: "2026-11-20",
  notes: "",
  createdAt: new Date("2026-11-20T09:15:00").toISOString(),
};

const downloadButton = () => screen.getByRole("button", { name: "Download Receipt" });

beforeEach(() => {
  vi.resetModules();
  pdf.download.mockReset();
  pdf.loading = Promise.resolve();
  pdf.release = () => {};
});

describe("receipt PDF export", () => {
  it("disables the button and announces while the PDF is being prepared", async () => {
    pdf.hold();
    const user = userEvent.setup();
    render(<ReceiptModal receipt={sale} onClose={() => {}} />);

    await user.click(downloadButton());

    const preparing = await screen.findByRole("button", { name: "Preparing…" });
    expect(preparing).toHaveAttribute("aria-disabled", "true");
    expect(preparing).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Preparing your receipt PDF");
    expect(pdf.download).not.toHaveBeenCalled();

    // A second click while pending must not start a second export.
    await user.click(preparing);
    expect(pdf.download).not.toHaveBeenCalled();

    pdf.release();

    await waitFor(() => expect(downloadButton()).toHaveAttribute("aria-disabled", "false"));
    expect(pdf.download).toHaveBeenCalledWith(sale);
    expect(screen.getByRole("status")).toHaveTextContent("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an alert and re-enables the button when the export fails", async () => {
    pdf.download.mockImplementation(() => {
      throw new Error("font encoding");
    });
    const user = userEvent.setup();
    render(<ReceiptModal receipt={sale} onClose={() => {}} />);

    await user.click(downloadButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The receipt PDF could not be prepared. Please try again."
    );
    expect(downloadButton()).toHaveAttribute("aria-disabled", "false");
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("clears the alert and downloads on the next attempt", async () => {
    pdf.download.mockImplementationOnce(() => {
      throw new Error("font encoding");
    });
    const user = userEvent.setup();
    render(<ReceiptModal receipt={sale} onClose={() => {}} />);

    await user.click(downloadButton());
    await screen.findByRole("alert");

    await user.click(downloadButton());

    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(pdf.download).toHaveBeenCalledTimes(2);
    expect(downloadButton()).toHaveAttribute("aria-disabled", "false");
  });
});