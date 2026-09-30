"use client";

import { useState, type FormEvent } from "react";
import { allowedTransitions, fulfillmentStatuses, cancellationReasons, returnReasons } from "@/lib/order-workflow";
import "./OrderStatusEditor.css";

export type StatusChange = { fulfillment?: string; payment?: string; courierName?: string; trackingNumber?: string; reason?: string; expectedFulfillment?: string };
type Props = { order: { fulfillment: string; isPrescription?: boolean; orderNumber: string; courierName?: string; trackingNumber?: string; reason?: string }; disabled?: boolean; onSave: (change: StatusChange) => Promise<boolean | void> };
export default function OrderStatusEditor({ order, disabled, onSave }: Props) {
  const [selected, setSelected] = useState(order.fulfillment);
  const [courierName, setCourierName] = useState(order.courierName || "");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const transitions = allowedTransitions(order.fulfillment, order.isPrescription);
  const needsFields = selected !== order.fulfillment && ["Dispatched", "Cancelled", "Returned"].includes(selected);
  async function save(status: string) {
    setBusy(true);
    try {
      const saved = await onSave({ fulfillment: status, expectedFulfillment: order.fulfillment, courierName, trackingNumber, reason });
      if (saved === false && !["Dispatched", "Cancelled", "Returned"].includes(status)) setSelected(order.fulfillment);
    } finally { setBusy(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void save(selected); }
  return <div className="order-workflow">
    <select aria-label={`Fulfillment status for ${order.orderNumber}`} value={selected} disabled={disabled || busy || !transitions.length} onChange={event => {
      const next = event.target.value; setSelected(next); setReason("");
      if (next !== order.fulfillment && !["Dispatched", "Cancelled", "Returned"].includes(next)) void save(next);
    }}>
      {fulfillmentStatuses.filter(value => value === order.fulfillment || transitions.includes(value)).map(value => <option key={value}>{value}</option>)}
    </select>
    {order.isPrescription && <small>Prescription order</small>}
    {needsFields && <form onSubmit={submit} className="order-workflow-fields">
      {selected === "Dispatched" ? <>
        <label>Courier name<input value={courierName} onChange={event => setCourierName(event.target.value)} required pattern=".*\S.*" maxLength={160} disabled={disabled || busy} /></label>
        <label>Tracking number<input value={trackingNumber} onChange={event => setTrackingNumber(event.target.value)} required pattern=".*\S.*" maxLength={160} disabled={disabled || busy} /></label>
      </> : <label>{selected === "Returned" ? "Return reason" : "Cancellation reason"}<select value={reason} onChange={event => setReason(event.target.value)} required disabled={disabled || busy}>
        <option value="">Select a reason</option>{(selected === "Returned" ? returnReasons : cancellationReasons).map(value => <option key={value}>{value}</option>)}
      </select></label>}
      {selected === "Returned" && order.isPrescription && <small>Prescription returns are handled as warranty claims.</small>}
      <div><button type="submit" disabled={disabled || busy}>{busy ? "Saving..." : "Save"}</button><button type="button" disabled={disabled || busy} onClick={() => setSelected(order.fulfillment)}>Dismiss</button></div>
    </form>}
    {!needsFields && order.courierName && <small>{order.courierName}: {order.trackingNumber}</small>}
    {!needsFields && order.reason && <small>{order.reason}</small>}
  </div>;
}
