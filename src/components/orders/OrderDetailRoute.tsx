import React from "react";
import { useParams } from "react-router";
import OrderDetail from "./OrderDetail";
import RecordRoute from "../common/RecordRoute";
import type {
  Client,
  EditOrderInput,
  MenuItemStock,
  Order,
  OrderDeliveryInput,
  OrderId,
  OrderPaymentInput,
  OrderStatus,
} from "../../types/domain";

interface OrderDetailRouteProps {
  orders: Order[];
  clients: Client[];
  menuInventory: MenuItemStock[];
  onEditOrder: (id: OrderId, input: EditOrderInput) => void;
  onAdvanceStatus: (id: OrderId, status: OrderStatus | null) => void;
  onScheduleDelivery: (id: OrderId, input: OrderDeliveryInput) => void;
  onMarkDelivered: (id: OrderId) => void;
  onRecordPayment: (id: OrderId, input: OrderPaymentInput) => void;
  onGoToProduction: () => void;
  onBack: () => void;
}

/** `/orders/:orderId` — the detail panel addressed by the record instead of by app-shell state. */
export default function OrderDetailRoute({
  orders,
  clients,
  menuInventory,
  onEditOrder,
  onAdvanceStatus,
  onScheduleDelivery,
  onMarkDelivered,
  onRecordPayment,
  onGoToProduction,
  onBack,
}: OrderDetailRouteProps) {
  const { orderId = "" } = useParams();

  return (
    <RecordRoute items={orders} id={orderId} kind="Order" onBack={onBack}>
      {(order) => (
        <OrderDetail
          order={order}
          client={clients.find((c) => c.id === order.clientId)}
          menuInventory={menuInventory}
          onBack={onBack}
          onAdvanceStatus={onAdvanceStatus}
          onScheduleDelivery={onScheduleDelivery}
          onMarkDelivered={onMarkDelivered}
          onRecordPayment={onRecordPayment}
          onEditOrder={onEditOrder}
          onGoToProduction={onGoToProduction}
        />
      )}
    </RecordRoute>
  );
}
