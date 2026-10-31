import React from "react";
import { useParams } from "react-router";
import ClientDetail from "./ClientDetail";
import RecordRoute from "../common/RecordRoute";
import type { Client, Order } from "../../types/domain";

interface ClientDetailRouteProps {
  clients: Client[];
  orders: Order[];
  onBack: () => void;
  onViewOrder: (order: Order) => void;
}

/** `/clients/:clientId` — the client record addressed by its own URL. */
export default function ClientDetailRoute({
  clients,
  orders,
  onBack,
  onViewOrder,
}: ClientDetailRouteProps) {
  const { clientId = "" } = useParams();

  return (
    <RecordRoute items={clients} id={clientId} kind="Client" onBack={onBack}>
      {(client) => (
        <ClientDetail
          client={client}
          orders={orders}
          onBack={onBack}
          onViewOrder={onViewOrder}
        />
      )}
    </RecordRoute>
  );
}
