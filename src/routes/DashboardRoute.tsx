import React from "react";
import { RequireTab } from "../components/RequireAccess";
import DashboardView from "../components/views/DashboardView";
import {
  useClientsSlice,
  useInventorySlice,
  useOrdersSlice,
  usePosSlice,
  useVisibleIngredients,
} from "../store/slices";
import { orderPath } from "../routes";
import { useShell } from "./shell";

export default function DashboardRoute() {
  const { currentUser, goToTab, openPath } = useShell();
  const { orders } = useOrdersSlice();
  const { clients } = useClientsSlice();
  const { sales } = usePosSlice();
  const { menuInventory } = useInventorySlice();
  const ingredients = useVisibleIngredients();

  const pendingOrdersCount = orders.filter((o) => o.status === "Pending").length;
  const readyOrdersCount = orders.filter((o) => o.status === "Ready").length;
  const lowStockAlerts = [...menuInventory, ...ingredients].filter(
    (item) => item.qty < item.target
  );

  return (
    <RequireTab role={currentUser.role} tab="dashboard">
      <DashboardView
        orders={orders}
        clients={clients}
        sales={sales}
        lowStockAlerts={lowStockAlerts}
        pendingOrdersCount={pendingOrdersCount}
        readyOrdersCount={readyOrdersCount}
        onNavClick={goToTab}
        onViewOrder={(order) => openPath(orderPath(order.id))}
      />
    </RequireTab>
  );
}
