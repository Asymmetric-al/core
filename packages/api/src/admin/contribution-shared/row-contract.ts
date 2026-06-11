/**
 * Shared contribution row contract (ADR-CD-032).
 *
 * CRM donor gift history and the Contributions Hub are two surfaces over the
 * same database. Any field that appears in both surfaces must derive from this
 * contract so values, labels, formatting, and status vocabulary cannot drift.
 * Surfaces may render fewer or more fields, but overlapping fields must come
 * from `buildSharedContributionRowFields`.
 */

import { summarizeContributionDesignationSet } from "./designation-set";

import type {
  ContributionDesignationSet,
  SharedContributionCorrectionState,
  SharedContributionCrmPostStatus,
  SharedContributionDesignationSummary,
  SharedContributionPaymentStatus,
  SharedContributionReceiptStatus,
  SharedContributionRefundState,
  SharedContributionRowFields,
} from "@asym/database/types";

export type {
  SharedContributionCorrectionState,
  SharedContributionCrmPostStatus,
  SharedContributionDesignationSummary,
  SharedContributionPaymentStatus,
  SharedContributionReceiptStatus,
  SharedContributionRefundState,
  SharedContributionRowFields,
};

export interface SharedContributionDonationInput {
  id: string;
  donor_id: string | null;
  missionary_id: string | null;
  fund_id: string | null;
  amount: number;
  currency: string;
  status: string | null;
  gift_date: string | null;
  refund_amount: number;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SharedContributionDonorInput {
  id: string;
  name: string | null;
  email: string | null;
  organization?: string | null;
}

export interface SharedContributionProfileInput {
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export interface SharedContributionStagedGiftInput {
  id: string;
  status: string | null;
  receipt_status: string | null;
  crm_post_status: string | null;
}

export interface SharedContributionCorrectionInput {
  status: string;
}

export interface BuildSharedContributionRowFieldsInput {
  donation: SharedContributionDonationInput;
  donor: SharedContributionDonorInput | null;
  profile: SharedContributionProfileInput | null;
  fund: { id: string; name: string | null } | null;
  missionary: { id: string; display_name: string | null } | null;
  stagedGift: SharedContributionStagedGiftInput | null;
  corrections?: SharedContributionCorrectionInput[];
  /**
   * Full designation set when the caller has loaded allocation lines. When
   * provided, the designation summary derives from the set (ADR-CD-008);
   * otherwise a single-line summary is built from the fund/missionary inputs.
   */
  designationSet?: ContributionDesignationSet;
}

export const SHARED_GENERAL_FUND_NAME = "General Fund";

export const SHARED_PAYMENT_STATUS_LABELS: Record<
  SharedContributionPaymentStatus,
  string
> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

export const SHARED_RECEIPT_STATUS_LABELS: Record<
  SharedContributionReceiptStatus,
  string
> = {
  sent: "Sent",
  pending: "Pending",
  failed: "Failed",
  not_sent: "Not sent",
};

export const SHARED_CRM_POST_STATUS_LABELS: Record<
  SharedContributionCrmPostStatus,
  string
> = {
  not_required: "Not required",
  queued: "Queued",
  posted: "Posted",
  failed: "Failed",
  blocked: "Blocked",
};

export const SHARED_REFUND_STATE_LABELS: Record<
  SharedContributionRefundState,
  string
> = {
  none: "No refund",
  partial_refund: "Partially refunded",
  refunded: "Refunded",
};

export const SHARED_CORRECTION_STATE_LABELS: Record<
  SharedContributionCorrectionState,
  string
> = {
  none: "No corrections",
  pending: "Correction pending",
  applied: "Correction applied",
};

/**
 * Formats a contribution amount stored in cents for staff-facing display.
 * `donations.amount` is BIGINT cents (foundation schema migration), so every
 * surface that renders a shared amount must divide by 100 through this helper.
 */
export function formatSharedContributionAmount(
  amountCents: number,
  currencyCode: string,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode || "USD",
  }).format(amountCents / 100);
}

export function normalizeSharedPaymentStatus(
  status: string | null | undefined,
): SharedContributionPaymentStatus {
  if (status === "processing" || status === "pending") {
    return "pending";
  }
  if (status === "failed" || status === "refunded") {
    return status;
  }
  return "completed";
}

export function normalizeSharedReceiptStatus(
  receiptStatus: string | null | undefined,
): SharedContributionReceiptStatus {
  switch (receiptStatus) {
    case "sent":
      return "sent";
    case "failed":
      return "failed";
    case "not_required":
    case "suppressed":
      return "not_sent";
    default:
      return "pending";
  }
}

export function normalizeSharedCrmPostStatus(
  status: string | null | undefined,
): SharedContributionCrmPostStatus | null {
  if (
    status === "not_required" ||
    status === "queued" ||
    status === "posted" ||
    status === "failed" ||
    status === "blocked"
  ) {
    return status;
  }

  return null;
}

export function normalizeSharedCurrencyCode(
  currency: string | null | undefined,
): string {
  return (currency ?? "usd").trim().toUpperCase();
}

export function deriveSharedGiftDate(
  donation: Pick<SharedContributionDonationInput, "gift_date" | "created_at">,
): string {
  return donation.gift_date || donation.created_at;
}

export function deriveSharedRefundState(
  donation: Pick<SharedContributionDonationInput, "amount" | "refund_amount">,
): SharedContributionRefundState {
  if (donation.refund_amount <= 0) {
    return "none";
  }
  return donation.refund_amount >= donation.amount
    ? "refunded"
    : "partial_refund";
}

export function deriveSharedCorrectionState(
  corrections: SharedContributionCorrectionInput[] | undefined,
): SharedContributionCorrectionState {
  if (!corrections || corrections.length === 0) {
    return "none";
  }
  if (corrections.some((correction) => correction.status === "pending")) {
    return "pending";
  }
  if (corrections.some((correction) => correction.status === "applied")) {
    return "applied";
  }
  return "none";
}

export function deriveSharedDonorName(
  donor: SharedContributionDonorInput | null,
  profile: SharedContributionProfileInput | null,
): string {
  const donorName = donor?.name?.trim();
  if (donorName) {
    return donorName;
  }

  const displayName = profile?.display_name?.trim();
  if (displayName) {
    return displayName;
  }

  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fullName) {
    return fullName;
  }

  const email = donor?.email?.trim() || profile?.email?.trim();
  if (email) {
    return email;
  }

  return "Anonymous";
}

export function buildSharedContributionRowFields(
  input: BuildSharedContributionRowFieldsInput,
): SharedContributionRowFields {
  const { donation, donor, profile, fund, missionary, stagedGift } = input;
  const refundState = deriveSharedRefundState(donation);

  return {
    donationId: donation.id,
    amountCents: donation.amount,
    currencyCode: normalizeSharedCurrencyCode(donation.currency),
    giftDate: deriveSharedGiftDate(donation),
    donorId: donor?.id ?? donation.donor_id,
    donorName: deriveSharedDonorName(donor, profile),
    designationSummary: input.designationSet
      ? summarizeContributionDesignationSet(input.designationSet)
      : {
          fundId: fund?.id ?? donation.fund_id,
          fundName: fund?.name?.trim() || SHARED_GENERAL_FUND_NAME,
          missionaryId: missionary?.id ?? donation.missionary_id,
          missionaryName: missionary?.display_name?.trim() || null,
          lineCount: 1,
        },
    paymentStatus:
      refundState === "refunded"
        ? "refunded"
        : normalizeSharedPaymentStatus(donation.status),
    receiptStatus: normalizeSharedReceiptStatus(stagedGift?.receipt_status),
    crmPostStatus: normalizeSharedCrmPostStatus(stagedGift?.crm_post_status),
    refundState,
    refundedAmountCents: Math.max(0, donation.refund_amount),
    correctionState: deriveSharedCorrectionState(input.corrections),
  };
}
