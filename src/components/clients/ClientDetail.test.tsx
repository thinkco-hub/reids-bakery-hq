import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useParams } from "react-router";
import ClientDetail from "./ClientDetail";
import { initialClients } from "../../data/initialClients";
import { initialOrders } from "../../data/initialOrders";
import type { Client } from "../../types/domain";

const client = initialClients.find((c) => c.id === "CL-001") as Client;

function OrderIdProbe() {
  const { orderId } = useParams();
  return <div data-testid="order-id">{orderId}</div>;
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={["/clients/CL-001"]}>
      <Routes>
        <Route
          path="/clients/:clientId"
          element={<ClientDetail client={client} orders={initialOrders} onBack={() => {}} />}
        />
        <Route path="/orders/:orderId" element={<OrderIdProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ClientDetail", () => {
  it("opens the order from its id with Tab and Enter", async () => {
    const user = userEvent.setup();
    renderDetail();
    await user.tab();
    const link = screen.getByRole("link", { name: "#1042" });
    expect(link).toHaveAttribute("href", "/orders/%231042");
    await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("order-id")).toHaveTextContent("#1042");
  });

  it("does not open an order from a non-link cell", async () => {
    const user = userEvent.setup();
    renderDetail();
    await user.click(screen.getByRole("cell", { name: "2026-08-24" }));
    expect(screen.queryByTestId("order-id")).not.toBeInTheDocument();
  });
});
