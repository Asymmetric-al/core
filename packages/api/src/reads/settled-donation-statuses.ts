export const SETTLED_DONATION_STATUSES = [
  "completed",
  "succeeded",
  "success",
] as const;

/**
 * Shared membership set for every legacy donation-status reader. Keeping the
 * set next to the canonical list prevents surface-specific normalizers from
 * drifting while the legacy single-status model remains in service.
 */
export const SETTLED_DONATION_STATUS_SET: ReadonlySet<string> = new Set(
  SETTLED_DONATION_STATUSES,
);
