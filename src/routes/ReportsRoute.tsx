import React from "react";
import ReceiptModal from "../components/pos/ReceiptModal";
import ReportsDashboard from "../components/reports/ReportsDashboard";
import { RequireTab } from "../components/RequireAccess";
import { useCatalogueSlice, useOrdersSlice, usePosSlice } from "../store/slices";
import { useShell } from "./shell";

export default function ReportsRoute() {
  const { currentUser } = useShell();
  const { sales, editSale, receipt, setReceipt } = usePosSlice();
  const { orders } = useOrdersSlice();
  const { posProducts } = useCatalogueSlice();

  return (
    <RequireTab role={currentUser.role} tab="reports-dashboard">
      <ReportsDashboard
        sales={sales}
        orders={orders}
        products={posProducts}
        onReprintSale={setReceipt}
        onSaveSaleEdit={editSale}
      />

      {/* Reprint is the second way into the receipt, so this route renders it too. */}
      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}
    </RequireTab>
  );
}
