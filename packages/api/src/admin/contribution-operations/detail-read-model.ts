import {
  buildSharedContributionRowFields,
  type SharedContributionRowFields,
} from "../contribution-shared/row-contract";

export type ContributionDetailDonationInput = {
  id: string;
  tenantId: string;
  donorId: string | null;
  missionaryId: string | null;
  fundId: string | null;
  amount: number;
  currency: string;
  status: string | null;
  donationType: string | null;
  paymentMethod: string | null;
  isRecurring: boolean | null;
  recurringInterval: string | null;
  notes: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  giftDate: string;
  campaignId: string | null;
  pledgeId: string | null;
  processedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  refundedAt: string | null;
  refundAmount: number;
  source: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContributionDetailDonorInput = {
  id: string;
  profileId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  mobile?: string | null;
  location: string | null;
  organization: string | null;
} | null;

export interface ContributionDetailInput {
  donation: ContributionDetailDonationInput;
  donor?: ContributionDetailDonorInput;
  fund?: { id: string; name: string | null } | null;
  missionary?: { id: string; name: string | null } | null;
  stagedGift?: {
    id: string;
    status: string | null;
    receiptStatus: string | null;
    crmPostStatus: string | null;
    reviewReason: string | null;
    twentyRecordId: string | null;
  } | null;
  auditEvents?: Array<{
    id: string;
    actionType: string;
    sourceSurface: string;
    reason: string | null;
    createdAt: string;
  }>;
  corrections?: Array<{
    id: string;
    correctionType: string;
    status: string;
  }>;
}

export interface ContributionDetail {
  /**
   * Shared contribution row contract fields (ADR-CD-032). Hub rows, CRM
   * gift-history rows, and this detail payload derive overlapping fields from
   * the same builder so surfaces cannot drift.
   */
  shared: SharedContributionRowFields;
  id: string;
  tenantId: string;
  donor: {
    id: string;
    profileId: string | null;
    name: string;
    email: string | null;
    phoneNumbers: string[];
    location: string | null;
    organization: string | null;
  } | null;
  gift: {
    date: string;
    createdAt: string;
    updatedAt: string;
    source: string;
    campaignId: string | null;
    pledgeId: string | null;
  };
  amount: {
    value: number;
    gross: number;
    net: number | null;
    fee: number | null;
    taxDeductible: number | null;
    currency: string;
  };
  payment: {
    type: string;
    method: string;
    status: string;
    lastFour: string | null;
    stripe: {
      paymentIntentId: string | null;
      chargeId: string | null;
      refundIds: string[];
      replayContext: Record<string, unknown> | null;
    };
  };
  designation: {
    fundId: string | null;
    fundName: string;
    missionaryId: string | null;
    missionaryName: string | null;
    projectId: string | null;
  };
  receipt: {
    status: string;
    statementStatus: string | null;
  };
  refund: {
    status: "none" | "partial_refund" | "refunded";
    amount: number;
    refundedAt: string | null;
  };
  recurring: {
    isRecurring: boolean;
    interval: string | null;
    pledgeId: string | null;
  };
  stagedGift: ContributionDetailInput["stagedGift"];
  crm: {
    postStatus: string | null;
    twentyRecordId: string | null;
  };
  auditEvents: NonNullable<ContributionDetailInput["auditEvents"]>;
  corrections: NonNullable<ContributionDetailInput["corrections"]>;
  tasks: unknown[];
  batches: unknown[];
  donorVisible: {
    status:
      | "Succeeded"
      | "Processing"
      | "Failed"
      | "Partially Refunded"
      | "Refunded";
    historyUpdatedImmediately: true;
    amount: number;
    currency: string;
  };
}

function normalizeCurrency(currency: string | null | undefined): string {
  return (currency ?? "usd").toUpperCase();
}

function displayNameFromDonor(
  donor: NonNullable<ContributionDetailDonorInput>,
) {
  return (
    donor.name?.trim() ||
    donor.email?.trim() ||
    donor.organization?.trim() ||
    "Unknown donor"
  );
}

function phoneNumbersFromDonor(
  donor: NonNullable<ContributionDetailDonorInput>,
): string[] {
  return Array.from(
    new Set(
      [donor.phone, donor.mobile].filter((value): value is string =>
        Boolean(value?.trim()),
      ),
    ),
  );
}

function donorVisibleStatus(
  status: string | null,
  refundAmount: number,
  amount: number,
) {
  const normalized = status?.toLowerCase() ?? "";
  if (refundAmount > 0 && refundAmount < amount) {
    return "Partially Refunded" as const;
  }
  if (normalized === "refunded" || (amount > 0 && refundAmount >= amount)) {
    return "Refunded" as const;
  }
  if (
    normalized === "completed" ||
    normalized === "succeeded" ||
    normalized === "success"
  ) {
    return "Succeeded" as const;
  }
  if (normalized === "failed") {
    return "Failed" as const;
  }
  return "Processing" as const;
}

function refundStatus(
  donation: Pick<ContributionDetailDonationInput, "amount" | "refundAmount">,
) {
  if (donation.refundAmount <= 0) {
    return "none" as const;
  }
  return donation.refundAmount >= donation.amount
    ? ("refunded" as const)
    : ("partial_refund" as const);
}

export function buildContributionDetail(
  input: ContributionDetailInput,
): ContributionDetail {
  const { donation, donor, fund, missionary, stagedGift } = input;
  const currency = normalizeCurrency(donation.currency);

  const shared = buildSharedContributionRowFields({
    donation: {
      id: donation.id,
      donor_id: donation.donorId,
      missionary_id: donation.missionaryId,
      fund_id: donation.fundId,
      amount: donation.amount,
      currency: donation.currency,
      status: donation.status,
      gift_date: donation.giftDate,
      refund_amount: donation.refundAmount,
      refunded_at: donation.refundedAt,
      created_at: donation.createdAt,
      updated_at: donation.updatedAt,
    },
    donor: donor
      ? { id: donor.id, name: donor.name, email: donor.email }
      : null,
    profile: null,
    fund: fund ?? null,
    missionary: missionary
      ? { id: missionary.id, display_name: missionary.name }
      : null,
    stagedGift: stagedGift
      ? {
          id: stagedGift.id,
          status: stagedGift.status,
          receipt_status: stagedGift.receiptStatus,
          crm_post_status: stagedGift.crmPostStatus,
        }
      : null,
    corrections: input.corrections?.map((correction) => ({
      status: correction.status,
    })),
  });

  return {
    shared,
    id: donation.id,
    tenantId: donation.tenantId,
    donor: donor
      ? {
          id: donor.id,
          profileId: donor.profileId,
          name: displayNameFromDonor(donor),
          email: donor.email,
          phoneNumbers: phoneNumbersFromDonor(donor),
          location: donor.location,
          organization: donor.organization,
        }
      : null,
    gift: {
      date: donation.giftDate,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
      source: donation.source ?? "online",
      campaignId: donation.campaignId,
      pledgeId: donation.pledgeId,
    },
    amount: {
      value: donation.amount,
      gross: donation.amount,
      net: null,
      fee: null,
      taxDeductible: null,
      currency,
    },
    payment: {
      type: donation.donationType ?? "one_time",
      method: donation.paymentMethod ?? "unknown",
      status: donation.status ?? "pending",
      lastFour: null,
      stripe: {
        paymentIntentId: donation.stripePaymentIntentId,
        chargeId: donation.stripeChargeId,
        refundIds: [],
        replayContext: null,
      },
    },
    designation: {
      fundId: fund?.id ?? donation.fundId,
      fundName: fund?.name?.trim() || "General Fund",
      missionaryId: missionary?.id ?? donation.missionaryId,
      missionaryName: missionary?.name?.trim() || null,
      projectId: null,
    },
    receipt: {
      status: stagedGift?.receiptStatus ?? "pending",
      statementStatus: null,
    },
    refund: {
      status: refundStatus(donation),
      amount: donation.refundAmount,
      refundedAt: donation.refundedAt,
    },
    recurring: {
      isRecurring: Boolean(donation.isRecurring || donation.recurringInterval),
      interval: donation.recurringInterval,
      pledgeId: donation.pledgeId,
    },
    stagedGift: stagedGift ?? null,
    crm: {
      postStatus: stagedGift?.crmPostStatus ?? null,
      twentyRecordId: stagedGift?.twentyRecordId ?? null,
    },
    auditEvents: input.auditEvents ?? [],
    corrections: input.corrections ?? [],
    tasks: [],
    batches: [],
    donorVisible: {
      status: donorVisibleStatus(
        donation.status,
        donation.refundAmount,
        donation.amount,
      ),
      historyUpdatedImmediately: true,
      amount: donation.amount,
      currency,
    },
  };
}
