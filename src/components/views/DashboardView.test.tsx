import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardView from "./DashboardView";
import type { Sale } from "../../types/domain";

const noop = () => {};

const DAY_MS = 24 * 60 * 60 * 1000;
const todayKey = new Date().toISOString().slice(0, 10);
const yesterdayKey = new Date(Date.now() - DAY_MS).toISOString().slice(0, 10);
/** Noon UTC keeps each fixture solidly inside its day key. */
const atNoon = (dateKey: string) => `${dateKey}T12:00:00.000Z`;

function saleOn(dateKey: string, total: number): Sale {
  return {
    id: `SALE-${dateKey}-${total}`,
    type: "Walk-in",
    customerName: "Test Customer",
    customerContact: "09171234567",
    paymentMethod: "Cash",
    items: [],
    subtotal: total,
    tax: 0,
    total,
    deliveryDate: dateKey,
    notes: "",
    createdAt: atNoon(dateKey),
  };
}

function renderDashboard(sales: Sale[]) {
  return render(
    <DashboardView
      orders={[]}
      clients={[]}
      sales={sales}
      lowStockAlerts={[]}
      pendingOrdersCount={0}
      readyOrdersCount={0}
      onNavClick={noop}
      onViewOrder={noop}
    />
  );
}

describe("dashboard revenue card", () => {
  it("sums today's sales and compares with yesterday", () => {
    renderDashboard([
      saleOn(todayKey, 90),
      saleOn(todayKey, 60),
      saleOn(yesterdayKey, 100),
    ]);
    expect(screen.getByText("₱150.00")).toBeInTheDocument();
    expect(screen.getByText("+50.0%")).toBeInTheDocument();
  });

  it("shows revenue without a percentage when yesterday had no sales", () => {
    renderDashboard([saleOn(todayKey, 80)]);
    expect(screen.getByText("₱80.00")).toBeInTheDocument();
    expect(screen.queryByTitle("Versus yesterday")).toBeNull();
  });

  it("starts at zero before the first sale", () => {
    renderDashboard([]);
    expect(screen.getByText("₱0.00")).toBeInTheDocument();
    expect(screen.queryByTitle("Versus yesterday")).toBeNull();
  });
});
