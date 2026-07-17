export const SETTLED_DONATION_STATUSES = [
  "completed",
  "succeeded",
  "success",
] as const;

/**
 * Shared membership set over {@link SETTLED_DONATION_STATUSES}. Keeping it
 * next to the canonical list ensures payment-status normalizers classify
 * settled donations identically and cannot drift.
 */
export const SETTLED_DONATION_STATUS_SET: ReadonlySet<string> = new Set(
  SETTLED_DONATION_STATUSES,
);
