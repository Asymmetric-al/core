export const DEFERRED_EVENT_TYPES: ReadonlySet<string> = new Set([
  "charge.refunded",
  "charge.refund.updated",
  "refund.created",
  "refund.updated",
  "refund.failed",
  "charge.dispute.created",
  "charge.dispute.updated",
  "charge.dispute.closed",
  "charge.dispute.funds_withdrawn",
  "charge.dispute.funds_reinstated",
]);

export function isDeferredEventType(type: string): boolean {
  return (
    type.startsWith("charge.refund") ||
    type.startsWith("refund.") ||
    type.startsWith("charge.dispute.")
  );
}

export const PAYMENT_EVENT_LEASE_SECONDS = 120;
export const PAYMENT_EVENT_RETRY_DELAY_SECONDS = 60;
