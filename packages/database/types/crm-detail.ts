export type CrmTimelineEntryKind =
  | "gift"
  | "receipt"
  | "note"
  | "task"
  | "activity"
  | "support";

export interface CrmGiftHistoryRow {
  id: string;
  donationId: string;
  stagedGiftId: string | null;
  amountCents: number;
  currencyCode: string;
  giftDate: string | null;
  paymentStatus: string | null;
  receiptStatus: string | null;
  crmPostStatus: string | null;
  twentyRecordId: string | null;
  fundId: string | null;
  fundName: string | null;
  missionaryId: string | null;
  missionaryName: string | null;
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
