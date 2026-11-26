import React from "react";
import Badge from "../common/Badge";
import type { StatusTone } from "../../utils/status";
import type { PaymentStatus } from "../../types/domain";

const TONE_BY_STATUS: Record<PaymentStatus, StatusTone> = {
  Paid: "success",
  Partial: "warning",
  Unpaid: "neutral",
};

export default function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={TONE_BY_STATUS[status]}>{status}</Badge>;
}
