import type { Contribution } from "./types";

/** Live-query page reads from TanStack DB; keep empty for typing / fallbacks. */
export const mockContributions: Contribution[] = [];

/** Static timestamps for Boneyard capture, unit tests, and skeleton fixtures. */
const FIXTURE_TIMESTAMP = "2026-04-16T12:00:00.000Z";

function boneyardRow(
  row: Pick<
    Contribution,
    | "id"
    | "donorId"
    | "donorName"
    | "donorEmail"
    | "amount"
    | "date"
    | "contributionDate"
    | "createdAt"
    | "updatedAt"
    | "status"
    | "type"
    | "paymentMethod"
    | "source"
    | "fundCode"
    | "fundName"
    | "transactionId"
    | "isAnonymous"
    | "receiptSent"
  > &
    Partial<Contribution>,
): Contribution {
  const amountGross = row.amountGross ?? row.amount;
  const receiptSent = row.receiptSent;
  const receiptStatus = row.receiptStatus ?? (receiptSent ? "sent" : "pending");
  return {
    shared: row.shared ?? {
      donationId: row.id,
      amountCents: amountGross,
      currencyCode: (row.currency ?? "usd").toUpperCase(),
      giftDate: row.date,
      donorId: row.donorId,
      donorName: row.donorName,
      designationSummary: {
        fundId: row.fundId ?? row.fundCode,
        fundName: row.fundName,
        missionaryId: row.missionaryId ?? null,
        missionaryName: row.missionaryName ?? null,
        lineCount: 1,
      },
      paymentStatus: row.status,
      receiptStatus,
      crmPostStatus: row.crmPostStatus ?? null,
      refundState: "none",
      refundedAmountCents: 0,
      correctionState: "none",
      recurringLinkState: row.type === "Recurring" ? "provider_only" : "none",
    },
    donorAvatar: row.donorAvatar ?? null,
    donorType: row.donorType ?? null,
    donorPhone: row.donorPhone ?? null,
    donorLocation: row.donorLocation ?? null,
    organizationName: row.organizationName ?? null,
    amount: row.amount,
    amountGross,
    amountNet: row.amountNet ?? null,
    amountFee: row.amountFee ?? null,
    amountTaxDeductible: row.amountTaxDeductible ?? null,
    currency: row.currency ?? "usd",
    date: row.date,
    contributionDate: row.contributionDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    settlementDate: row.settlementDate ?? null,
    depositDate: row.depositDate ?? null,
    status: row.status,
    subStatus: row.subStatus ?? null,
    type: row.type,
    paymentMethod: row.paymentMethod,
    source: row.source,
    fundId: row.fundId ?? row.fundCode,
    fundCode: row.fundCode,
    fundName: row.fundName,
    missionaryId: row.missionaryId ?? null,
    missionaryName: row.missionaryName ?? null,
    campaignId: row.campaignId ?? null,
    receiptStatus,
    receiptSent,
    receiptSentAt: row.receiptSentAt ?? null,
    stagedGiftId: row.stagedGiftId ?? null,
    stagedGiftStatus: row.stagedGiftStatus ?? null,
    stagedGiftReviewReason: row.stagedGiftReviewReason ?? null,
    crmPostStatus: row.crmPostStatus ?? null,
    annualStatementEligible: row.annualStatementEligible ?? true,
    entryMethod: row.entryMethod ?? "api",
    reconciliationStatus: row.reconciliationStatus ?? "unreconciled",
    transactionId: row.transactionId,
    externalTransactionId: row.externalTransactionId ?? null,
    processorTransactionId:
      row.processorTransactionId ?? row.transactionId ?? null,
    notes: row.notes ?? null,
    notesPreview: row.notesPreview ?? null,
    isAnonymous: row.isAnonymous,
    id: row.id,
    donorId: row.donorId,
    donorName: row.donorName,
    donorEmail: row.donorEmail,
  };
}

/** Synthetic rows for Boneyard capture, unit tests, and skeleton fixtures only. */
export const boneyardContributionsFixture: Contribution[] = [
  boneyardRow({
    id: "by-c1",
    donorId: "by-d1",
    donorName: "Sarah Mitchell",
    donorEmail: "sarah.mitchell@example.com",
    amount: 25_000,
    date: FIXTURE_TIMESTAMP,
    contributionDate: FIXTURE_TIMESTAMP,
    createdAt: FIXTURE_TIMESTAMP,
    updatedAt: FIXTURE_TIMESTAMP,
    status: "completed",
    type: "One-time",
    paymentMethod: "Credit Card",
    source: "Online",
    fundCode: "GEN",
    fundName: "General Fund",
    transactionId: "pi_fixture_1",
    isAnonymous: false,
    receiptSent: true,
    receiptStatus: "sent",
  }),
  boneyardRow({
    id: "by-c2",
    donorId: "by-d2",
    donorName: "James Chen",
    donorEmail: "james.chen@example.com",
    amount: 10_000,
    date: FIXTURE_TIMESTAMP,
    contributionDate: FIXTURE_TIMESTAMP,
    createdAt: FIXTURE_TIMESTAMP,
    updatedAt: FIXTURE_TIMESTAMP,
    status: "pending",
    type: "Recurring",
    paymentMethod: "Bank Transfer",
    source: "Mobile",
    fundCode: "OUT",
    fundName: "Outreach",
    transactionId: null,
    isAnonymous: false,
    receiptSent: false,
    receiptStatus: "pending",
  }),
];

export const contributionStatusOptions = [
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

export const contributionTypeOptions = [
  { label: "One-time", value: "One-time" },
  { label: "Recurring", value: "Recurring" },
  { label: "Pledge", value: "Pledge" },
  { label: "In-kind", value: "In-kind" },
];

export const paymentMethodOptions = [
  { label: "Credit Card", value: "Credit Card" },
  { label: "Bank Transfer", value: "Bank Transfer" },
  { label: "Check", value: "Check" },
  { label: "Cash", value: "Cash" },
  { label: "PayPal", value: "PayPal" },
  { label: "Other", value: "Other" },
];

export const sourceOptions = [
  { label: "Online", value: "Online" },
  { label: "Mobile", value: "Mobile" },
  { label: "In-person", value: "In-person" },
  { label: "Mail", value: "Mail" },
  { label: "Phone", value: "Phone" },
  { label: "Import", value: "Import" },
];
