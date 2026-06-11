export type ContributionGridStatus =
  | "completed"
  | "pending"
  | "processing"
  | "failed"
  | "refunded";

export type ContributionGridType =
  | "One-time"
  | "Recurring"
  | "Pledge"
  | "In-kind";

export type ContributionGridPaymentMethod =
  | "Credit Card"
  | "Bank Transfer"
  | "Check"
  | "Cash"
  | "PayPal"
  | "Other";

export type ContributionGridSource =
  | "Online"
  | "Mobile"
  | "In-person"
  | "Mail"
  | "Phone"
  | "Import";

export type ContributionReceiptStatus =
  | "sent"
  | "pending"
  | "failed"
  | "not_sent";

export type StagedGiftGridStatus =
  | "received"
  | "needs_review"
  | "ready_to_post"
  | "posted"
  | "failed"
  | "refunded"
  | "voided";

export type StagedGiftCrmPostStatus =
  | "not_required"
  | "queued"
  | "posted"
  | "failed"
  | "blocked";

export interface ContributionGridRow {
  id: string;
  donorId: string | null;
  donorName: string;
  donorEmail: string;
  donorAvatar: string | null;
  donorType: string | null;
  donorPhone: string | null;
  donorLocation: string | null;
  organizationName: string | null;
  amount: number;
  amountGross: number;
  amountNet: number | null;
  amountFee: number | null;
  amountTaxDeductible: number | null;
  currency: string;
  date: string;
  contributionDate: string;
  createdAt: string;
  updatedAt: string;
  settlementDate: string | null;
  depositDate: string | null;
  status: ContributionGridStatus;
  subStatus: string | null;
  type: ContributionGridType;
  paymentMethod: ContributionGridPaymentMethod;
  source: ContributionGridSource;
  fundId: string | null;
  fundCode: string | null;
  fundName: string;
  missionaryId: string | null;
  missionaryName: string | null;
  campaignId: string | null;
  receiptStatus: ContributionReceiptStatus;
  receiptSent: boolean;
  receiptSentAt: string | null;
  stagedGiftId: string | null;
  stagedGiftStatus: StagedGiftGridStatus | null;
  stagedGiftReviewReason: string | null;
  crmPostStatus: StagedGiftCrmPostStatus | null;
  annualStatementEligible: boolean;
  entryMethod: "api" | "manual" | "import";
  reconciliationStatus: "unreconciled" | "review" | "reconciled";
  transactionId: string | null;
  externalTransactionId: string | null;
  processorTransactionId: string | null;
  notes: string | null;
  notesPreview: string | null;
  isAnonymous: boolean;
}

type RawDonation = {
  id: string;
  donor_id: string | null;
  missionary_id: string | null;
  fund_id: string | null;
  amount: number;
  currency: string;
  status: string | null;
  donation_type: string | null;
  payment_method: string | null;
  is_recurring: boolean | null;
  recurring_interval: string | null;
  notes: string | null;
  stripe_payment_intent_id: string | null;
  gift_date: string;
  campaign_id: string | null;
  pledge_id: string | null;
  processed_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  error_code: string | null;
  error_message: string | null;
  stripe_charge_id: string | null;
  refunded_at: string | null;
  refund_amount: number;
  source: string | null;
  created_at: string;
  updated_at: string;
};

type RawDonor = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  type: string | null;
  location: string | null;
  organization: string | null;
  notes: string | null;
} | null;

type RawProfile = {
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
} | null;

type RawFund = {
  id: string;
  name: string | null;
} | null;

type RawMissionary = {
  id: string;
  display_name: string | null;
} | null;

type RawStagedGift = {
  id: string;
  status: string | null;
  review_reason: string | null;
  receipt_status: string | null;
  receipt_send_log_id: string | null;
  crm_post_status: string | null;
} | null;

/**
 * Map raw donation status to the staff-facing grid status. Stripe is the
 * payment authority: "processing" stays distinct (ACH and other delayed
 * rails are not collected yet), and unknown statuses are never shown as
 * completed — they stay pending until a Stripe-confirmed state arrives.
 */
export function normalizeContributionGridStatus(
  status: string | null | undefined,
): ContributionGridStatus {
  if (status === "processing") {
    return "processing";
  }
  if (status === "completed") {
    return "completed";
  }
  if (status === "failed" || status === "refunded") {
    return status;
  }
  return "pending";
}

const normalizeStatus = normalizeContributionGridStatus;

function normalizeType(
  donationType: string | null | undefined,
  isRecurring: boolean | null | undefined,
): ContributionGridType {
  if (isRecurring || donationType === "recurring") {
    return "Recurring";
  }
  if (donationType === "pledge_payment" || donationType === "pledge") {
    return "Pledge";
  }
  if (donationType === "in_kind") {
    return "In-kind";
  }
  return "One-time";
}

function normalizePaymentMethod(
  paymentMethod: string | null | undefined,
): ContributionGridPaymentMethod {
  switch (paymentMethod) {
    case "card":
    case "credit_card":
    case "Credit Card":
      return "Credit Card";
    case "bank_transfer":
    case "Bank Transfer":
    case "ach":
      return "Bank Transfer";
    case "check":
    case "Check":
      return "Check";
    case "cash":
    case "Cash":
      return "Cash";
    case "paypal":
    case "PayPal":
      return "PayPal";
    default:
      return "Other";
  }
}

function normalizeSource(
  source: string | null | undefined,
): ContributionGridSource {
  switch (source) {
    case "mobile":
    case "Mobile":
      return "Mobile";
    case "in_person":
    case "In-person":
    case "in-person":
      return "In-person";
    case "mail":
    case "Mail":
      return "Mail";
    case "phone":
    case "Phone":
      return "Phone";
    case "import":
    case "Import":
      return "Import";
    default:
      return "Online";
  }
}

function buildDonorDisplayName(donor: RawDonor, profile: RawProfile) {
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

function normalizeEntryMethod(source: string | null | undefined) {
  if (source === "import") {
    return "import" as const;
  }

  if (source === "cash" || source === "check" || source === "bank_transfer") {
    return "manual" as const;
  }

  return "api" as const;
}

function normalizeReceiptStatus(
  stagedGift: RawStagedGift,
): ContributionReceiptStatus {
  switch (stagedGift?.receipt_status) {
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

function normalizeStagedGiftStatus(
  status: string | null | undefined,
): StagedGiftGridStatus | null {
  if (
    status === "received" ||
    status === "needs_review" ||
    status === "ready_to_post" ||
    status === "posted" ||
    status === "failed" ||
    status === "refunded" ||
    status === "voided"
  ) {
    return status;
  }

  return null;
}

function normalizeCrmPostStatus(
  status: string | null | undefined,
): StagedGiftCrmPostStatus | null {
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

function normalizeReconciliationStatus(stagedGift: RawStagedGift) {
  const crmPostStatus = normalizeCrmPostStatus(stagedGift?.crm_post_status);
  if (crmPostStatus === "posted") {
    return "reconciled" as const;
  }
  if (crmPostStatus === "failed" || crmPostStatus === "blocked") {
    return "review" as const;
  }
  return "unreconciled" as const;
}

export function buildContributionGridRow({
  donation,
  donor,
  profile,
  fund,
  missionary,
  stagedGift,
}: {
  donation: RawDonation;
  donor: RawDonor;
  profile: RawProfile;
  fund: RawFund;
  missionary: RawMissionary;
  stagedGift?: RawStagedGift;
}): ContributionGridRow {
  const donorName = buildDonorDisplayName(donor, profile);
  const donorEmail = donor?.email?.trim() || profile?.email?.trim() || "";
  const status = normalizeStatus(donation.status);
  const receiptStatus = normalizeReceiptStatus(stagedGift ?? null);
  const receiptSent = receiptStatus === "sent";

  return {
    id: donation.id,
    donorId: donor?.id ?? donation.donor_id,
    donorName,
    donorEmail,
    donorAvatar: profile?.avatar_url ?? null,
    donorType: donor?.type ?? null,
    donorPhone: donor?.phone ?? null,
    donorLocation: donor?.location ?? null,
    organizationName: donor?.organization ?? null,
    amount: donation.amount,
    amountGross: donation.amount,
    amountNet: null,
    amountFee: null,
    amountTaxDeductible: null,
    currency: donation.currency,
    date: donation.gift_date || donation.created_at,
    contributionDate: donation.gift_date || donation.created_at,
    createdAt: donation.created_at,
    updatedAt: donation.updated_at,
    settlementDate: donation.completed_at ?? donation.processed_at ?? null,
    depositDate: null,
    status,
    subStatus: donation.error_code ?? donation.error_message ?? null,
    type: normalizeType(donation.donation_type, donation.is_recurring),
    paymentMethod: normalizePaymentMethod(donation.payment_method),
    source: normalizeSource(donation.source),
    fundId: fund?.id ?? donation.fund_id,
    fundCode: fund?.id ?? donation.fund_id,
    fundName: fund?.name?.trim() || "General Fund",
    missionaryId: missionary?.id ?? donation.missionary_id,
    missionaryName: missionary?.display_name?.trim() || null,
    campaignId: donation.campaign_id,
    receiptStatus,
    receiptSent,
    receiptSentAt: receiptSent ? donation.completed_at : null,
    stagedGiftId: stagedGift?.id ?? null,
    stagedGiftStatus: normalizeStagedGiftStatus(stagedGift?.status),
    stagedGiftReviewReason: stagedGift?.review_reason ?? null,
    crmPostStatus: normalizeCrmPostStatus(stagedGift?.crm_post_status),
    annualStatementEligible: true,
    entryMethod: normalizeEntryMethod(donation.source),
    reconciliationStatus: normalizeReconciliationStatus(stagedGift ?? null),
    transactionId:
      donation.stripe_payment_intent_id ??
      donation.stripe_charge_id ??
      donation.id,
    externalTransactionId: donation.stripe_charge_id,
    processorTransactionId: donation.stripe_payment_intent_id,
    notes: donation.notes,
    notesPreview: donation.notes?.trim() || donor?.notes?.trim() || null,
    isAnonymous: !donation.donor_id,
  };
}
