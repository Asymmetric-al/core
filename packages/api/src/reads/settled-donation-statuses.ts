export const SETTLED_DONATION_STATUSES = [
  "completed",
  "succeeded",
  "success",
] as const;

/**
 * Membership set over {@link SETTLED_DONATION_STATUSES}. Shared so the payment
 * status normalizers on every surface classify settled donations identically
 * and cannot drift.
 */
export const SETTLED_DONATION_STATUS_SET: ReadonlySet<string> = new Set(
  SETTLED_DONATION_STATUSES,
);
