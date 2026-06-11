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
