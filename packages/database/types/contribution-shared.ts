/**
 * Shared contribution row contract types (ADR-CD-032).
 *
 * CRM donor gift history and the Contributions Hub are two surfaces over the
 * same database. Fields appearing in both surfaces must use these types so
 * value meaning and status vocabulary cannot drift between surfaces. The
 * derivation logic lives in `@asym/api/admin/contribution-shared`; these pure
 * types live here so both the API package and the database hook layer can
 * reference one definition without a package cycle.
 */

export type SharedContributionPaymentStatus =
  | "completed"
  | "pending"
  | "failed"
  | "refunded";

export type SharedContributionReceiptStatus =
  | "sent"
  | "pending"
  | "failed"
  | "not_sent";

export type SharedContributionCrmPostStatus =
  | "not_required"
  | "queued"
  | "posted"
  | "failed"
  | "blocked";

export type SharedContributionRefundState =
  | "none"
  | "partial_refund"
  | "refunded";

export type SharedContributionCorrectionState = "none" | "pending" | "applied";

export interface SharedContributionDesignationSummary {
  fundId: string | null;
  fundName: string;
  missionaryId: string | null;
  missionaryName: string | null;
  /** Number of designation lines the summary represents (1 when not split). */
  lineCount: number;
}

export type ContributionDesignationFundType =
  | "missionary"
  | "project"
  | "campaign"
  | "general";

/**
 * One donor-intent allocation line (ADR-CD-008 / ADR-CD-010). Lines are equal
 * — there is intentionally no primary flag — and every line resolves to
 * exactly one fund (General Fund when donor intent is unspecified).
 */
export interface ContributionDesignationLine {
  id: string;
  amountCents: number;
  currencyCode: string;
  fundId: string | null;
  fundName: string;
  fundType: ContributionDesignationFundType;
  missionaryId: string | null;
  missionaryName: string | null;
  memo: string | null;
  restriction: string | null;
  correctionState: SharedContributionCorrectionState;
}

export interface ContributionDesignationSet {
  lines: ContributionDesignationLine[];
  totalAmountCents: number;
  reconcilesToGiftAmount: boolean;
  issues: string[];
}

export interface SharedContributionRowFields {
  /** Canonical staff-facing gift identity (`donation.id`). */
  donationId: string;
  amountCents: number;
  currencyCode: string;
  giftDate: string;
  donorId: string | null;
  donorName: string;
  designationSummary: SharedContributionDesignationSummary;
  paymentStatus: SharedContributionPaymentStatus;
  receiptStatus: SharedContributionReceiptStatus;
  crmPostStatus: SharedContributionCrmPostStatus | null;
  refundState: SharedContributionRefundState;
  refundedAmountCents: number;
  correctionState: SharedContributionCorrectionState;
}
