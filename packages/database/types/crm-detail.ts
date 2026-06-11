import type {
  SharedContributionCorrectionState,
  SharedContributionCrmPostStatus,
  SharedContributionPaymentStatus,
  SharedContributionReceiptStatus,
  SharedContributionRefundState,
  SharedContributionRowFields,
} from "./contribution-shared";

export type CrmTimelineEntryKind =
  | "gift"
  | "receipt"
  | "note"
  | "task"
  | "activity"
  | "support";

/**
 * Contribution operations that can be surfaced inline from CRM gift rows.
 * Inline operations are alternate UI affordances over the same shared
 * operation contracts as contribution detail — never separate business logic.
 */
export type CrmGiftInlineActionType =
  | "approve_staged_gift"
  | "retry_staged_gift"
  | "resend_receipt"
  | "refund"
  | "amount_correction"
  | "fund_correction"
  | "stripe_replay";

export interface CrmGiftInlineActionEntry {
  actionType: CrmGiftInlineActionType;
  available: boolean;
  blockedReason: string | null;
  nextStep: string | null;
  riskLevel: "low" | "medium" | "high";
}

export interface CrmGiftInlineActions {
  /**
   * Server-computed single next-best action for the row. Only low-risk
   * workflow actions are ever promoted; high-risk operations stay behind the
   * grouped menu. Null when nothing is actionable for this viewer.
   */
  nextBestActionType: CrmGiftInlineActionType | null;
  /** Capability-filtered entries; blocked ones keep their server reasons. */
  entries: CrmGiftInlineActionEntry[];
}

export interface CrmGiftHistoryRow {
  /**
   * Shared contribution row contract fields (ADR-CD-032 display parity).
   * Overlapping CRM/Hub fields below are adapter-mapped from this object and
   * must never be derived separately.
   */
  shared: SharedContributionRowFields;
  id: string;
  donationId: string;
  amountCents: number;
  currencyCode: string;
  giftDate: string;
  paymentStatus: SharedContributionPaymentStatus;
  receiptStatus: SharedContributionReceiptStatus;
  crmPostStatus: SharedContributionCrmPostStatus | null;
  refundState: SharedContributionRefundState;
  correctionState: SharedContributionCorrectionState;
  fundId: string | null;
  fundName: string;
  missionaryId: string | null;
  missionaryName: string | null;
  /** CRM-only workflow context — not part of the shared row contract. */
  stagedGiftId: string | null;
  twentyRecordId: string | null;
  canResendReceipt: boolean;
  /** Inline operation parity with contribution detail (issue #270). */
  inlineActions: CrmGiftInlineActions;
}

export interface CrmTimelineEntry {
  id: string;
  kind: CrmTimelineEntryKind;
  occurredAt: string;
  title: string;
  description: string | null;
  amountCents: number | null;
  currencyCode: string | null;
  source: "platform" | "twenty" | "queued";
  visibility: "standard" | "restricted";
}

export interface CrmDuplicateWarning {
  id: string;
  candidateId: string | null;
  candidateLabel: string | null;
  confidence: string | null;
  score: number | null;
  reason: string;
}

export interface CrmSupportSummary {
  lifetimeGivingCents: number;
  lastGiftAt: string | null;
  activeRecurringCommitments: number;
  lapsedCommitments: number;
  atRiskCommitments: number;
  byFund: Array<{
    fundId: string | null;
    fundName: string;
    amountCents: number;
  }>;
  byMissionary: Array<{
    missionaryId: string | null;
    missionaryName: string;
    amountCents: number;
  }>;
}

export interface CrmDonorDetailResponse {
  donor: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    organization: string | null;
    status: string | null;
    type: string | null;
    profileId: string | null;
    missionaryId: string | null;
    notesPreview: string | null;
  };
  giftHistory: CrmGiftHistoryRow[];
  timeline: CrmTimelineEntry[];
  duplicateWarnings: CrmDuplicateWarning[];
  support: CrmSupportSummary;
  privacy: {
    roleGate: "staff" | "admin";
    restrictedNotesVisible: boolean;
    missionaryContactDataExposed: false;
  };
  reconciliation: {
    crmWriteMode: "disabled" | "enabled";
    twentyIsPaymentTruth: false;
    platformPaymentTruth: true;
  };
}
