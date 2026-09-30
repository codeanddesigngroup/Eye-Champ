export const fulfillmentStatuses = ["Unfulfilled", "Processing", "Dispatched", "Delivered", "Returned", "Cancelled"];
export const cancellationReasons = ["Unreachable", "Out of stock", "Customer request", "Other"];
export const returnReasons = ["Refused at delivery", "Customer requested return", "Item defect / warranty claim", "Wrong item sent", "Other"];

export function allowedTransitions(current, prescription = false) {
  switch (current) {
    case "Unfulfilled": return ["Processing", "Cancelled"];
    case "Processing": return prescription ? ["Dispatched", "Returned"] : ["Dispatched", "Cancelled"];
    case "Dispatched": return ["Delivered", "Returned"];
    case "Delivered": return ["Returned"];
    default: return [];
  }
}

export function containsPrescription(items) {
  return Array.isArray(items) && items.some(item => item && (
    item.isPrescription === true ||
    (item.prescription && typeof item.prescription === "object" && Object.keys(item.prescription).length > 0) ||
    ["single-vision", "progressive", "bifocal", "reading"].includes(item.vision) ||
    (item.prescriptionMethod && item.vision !== "non-prescription")
  ));
}

export function validateTransition(current, next, prescription, fields = {}) {
  if (current === next) return null;
  if (!allowedTransitions(current, prescription).includes(next)) return `Cannot change ${current} to ${next}${prescription ? " for a prescription order" : ""}.`;
  if (next === "Dispatched" && (![fields.courierName, fields.trackingNumber].every(value => typeof value === "string" && value.trim() && value.trim().length <= 160))) return "Enter a courier name and tracking number (up to 160 characters each).";
  if (next === "Cancelled" && !cancellationReasons.includes(fields.reason)) return "Select a cancellation reason.";
  if (next === "Returned" && !returnReasons.includes(fields.reason)) return "Select a return reason.";
  return null;
}
