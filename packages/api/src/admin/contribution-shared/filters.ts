import type {
  SharedContributionCorrectionState,
  SharedContributionCrmPostStatus,
  SharedContributionPaymentStatus,
  SharedContributionRecurringLinkState,
  SharedContributionRefundState,
  SharedContributionRowFields,
} from "@asym/database/types";

/**
 * Shared CRM/Hub filter definitions (issue #274, ADR-CD-032).
 *
 * Overlapping CRM gift-history and Contributions Hub filters evaluate
 * through these definitions so the same gift matches (or not) identically
 * on both surfaces. The Hub may expose the full set; CRM exposes a compact
 * donor-context subset, but a shared filter id always means the same thing.
 */

export interface SharedContributionFilterInput {
  shared: SharedContributionRowFields;
  /** Designation set issues when the surface has them loaded. */
  designationIssues?: string[] | null;
}

export type SharedContributionFilter =
  | { id: "receipt_affected" }
  | { id: "pending_correction" }
  | { id: "approval_state"; value: SharedContributionCorrectionState }
  | { id: "refund_state"; value: SharedContributionRefundState }
  | { id: "crm_post_state"; value: SharedContributionCrmPostStatus }
  | { id: "designation_issue" }
  | { id: "recurring_link"; value: SharedContributionRecurringLinkState }
  | { id: "payment_status"; value: SharedContributionPaymentStatus };

export type SharedContributionFilterId = SharedContributionFilter["id"];

export interface SharedContributionFilterDefinition {
  id: SharedContributionFilterId;
  label: string;
  /** Flag filters match on their own; enum filters need a value. */
  kind: "flag" | "enum";
}

export const SHARED_CONTRIBUTION_FILTERS: SharedContributionFilterDefinition[] =
  [
    { id: "receipt_affected", label: "Receipt affected", kind: "flag" },
    { id: "pending_correction", label: "Pending correction", kind: "flag" },
    { id: "approval_state", label: "Approval state", kind: "enum" },
    { id: "refund_state", label: "Refund state", kind: "enum" },
    { id: "crm_post_state", label: "CRM post state", kind: "enum" },
    { id: "designation_issue", label: "Designation issue", kind: "flag" },
    { id: "recurring_link", label: "Recurring link", kind: "enum" },
    { id: "payment_status", label: "Payment status", kind: "enum" },
  ];

/**
 * A gift is receipt-affected when a receipt already went out and the gift's
 * effective values changed (or are changing) through correction activity, so
 * the sent receipt may no longer match financial truth (ADR-CD-013).
 */
function isReceiptAffected(input: SharedContributionFilterInput): boolean {
  return (
    input.shared.receiptStatus === "sent" &&
    input.shared.correctionState !== "none"
  );
}

export function matchesSharedContributionFilter(
  input: SharedContributionFilterInput,
  filter: SharedContributionFilter,
): boolean {
  switch (filter.id) {
    case "receipt_affected":
      return isReceiptAffected(input);
    case "pending_correction":
      return input.shared.correctionState === "pending";
    case "approval_state":
      return input.shared.correctionState === filter.value;
    case "refund_state":
      return input.shared.refundState === filter.value;
    case "crm_post_state":
      // A gift without staged-gift workflow has nothing to post; null means
      // not_required so both surfaces read it the same way.
      return (input.shared.crmPostStatus ?? "not_required") === filter.value;
    case "designation_issue":
      return (input.designationIssues?.length ?? 0) > 0;
    case "recurring_link":
      return input.shared.recurringLinkState === filter.value;
    case "payment_status":
      return input.shared.paymentStatus === filter.value;
  }
}

/** AND-combines filters, like stacked table filters on either surface. */
export function filterSharedContributions<
  T extends SharedContributionFilterInput,
>(rows: T[], filters: SharedContributionFilter[]): T[] {
  return rows.filter((row) =>
    filters.every((filter) => matchesSharedContributionFilter(row, filter)),
  );
}

/**
 * Compact "needs attention" composite for CRM issue filters: composes the
 * shared definitions instead of inventing CRM-only status logic.
 */
export function hasSharedContributionIssue(
  input: SharedContributionFilterInput,
): boolean {
  return (
    isReceiptAffected(input) ||
    matchesSharedContributionFilter(input, { id: "pending_correction" }) ||
    matchesSharedContributionFilter(input, {
      id: "crm_post_state",
      value: "failed",
    }) ||
    matchesSharedContributionFilter(input, {
      id: "crm_post_state",
      value: "blocked",
    }) ||
    matchesSharedContributionFilter(input, { id: "designation_issue" }) ||
    matchesSharedContributionFilter(input, {
      id: "recurring_link",
      value: "provider_only",
    }) ||
    matchesSharedContributionFilter(input, {
      id: "payment_status",
      value: "failed",
    })
  );
}
