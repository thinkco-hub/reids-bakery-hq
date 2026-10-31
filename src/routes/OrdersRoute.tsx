import React from "react";
import OrdersList from "../components/orders/OrdersList";
import { RequireTab } from "../components/RequireAccess";
import { useCatalogueSlice, useClientsSlice, useOrdersSlice } from "../store/slices";
import { orderPath } from "../routes";
import { useShell } from "./shell";

export default function OrdersRoute() {
  const { currentUser, openPath } = useShell();
  const { orders } = useOrdersSlice();
  const { clients } = useClientsSlice();
  const { stockItems } = useCatalogueSlice();

  return (
    <RequireTab role={currentUser.role} tab="orders">
      <OrdersList
        orders={orders}
        clients={clients}
        menuInventory={stockItems}
        onView={(order) => openPath(orderPath(order.id))}
      />
    </RequireTab>
  );
}
