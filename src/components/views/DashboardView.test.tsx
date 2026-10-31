import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardView from "./DashboardView";
import { addDaysISO, todayISO } from "../../utils/dates";
import type { Sale } from "../../types/domain";

const noop = () => {};

const todayKey = todayISO();
const yesterdayKey = addDaysISO(todayKey, -1);
/** Noon local keeps each fixture solidly inside its own day key. */
const atNoon = (dateKey: string) => new Date(`${dateKey}T12:00:00`).toISOString();

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
