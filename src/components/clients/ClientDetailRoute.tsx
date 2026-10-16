import React from "react";
import { useParams } from "react-router";
import ClientDetail from "./ClientDetail";
import RecordNotFound from "../common/RecordNotFound";
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
  const client = clients.find((c) => c.id === clientId);

  if (!client) {
    return <RecordNotFound kind="Client" id={clientId} onBack={onBack} />;
  }

  return (
    <ClientDetail
      client={client}
      orders={orders}
      onBack={onBack}
      onViewOrder={onViewOrder}
    />
  );
}
