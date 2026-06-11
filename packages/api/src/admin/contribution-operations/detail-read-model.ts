import {
  buildContributionActionAvailability,
  type ContributionActionAvailability,
} from "./action-availability";
import {
  buildContributionDesignationSet,
  type DesignationAllocationInput,
  type DesignationFundInput,
} from "../contribution-shared/designation-set";
import {
  deriveEffectiveContribution,
  type ContributionAdjustmentRecord,
} from "../contribution-shared/effective-values";
import {
  buildSharedContributionRowFields,
  type SharedContributionRowFields,
} from "../contribution-shared/row-contract";

import type { ContributionDesignationSet } from "@asym/database/types";

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
  /** Applied/reversed adjustment records linked to this donation (ADR-CD-004). */
  adjustments?: ContributionAdjustmentRecord[];
  /** Allocation rows backing the designation set (staged_gift_allocations). */
  allocations?: DesignationAllocationInput[];
  /** Fund metadata for designation lines (subtype derivation). */
  allocationFunds?: DesignationFundInput[];
  /** Missionary display names for designation lines. */
  allocationMissionaries?: Array<{
    id: string;
    display_name: string | null;
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
  /**
   * The gift's complete designation set — financial truth per ADR-CD-008.
   * Lines are equal; there is intentionally no single primary designation.
   */
  designations: ContributionDesignationSet;
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
  /** Server-computed action availability (ADR-CD-017 / ADR-CD-018). */
  actionAvailability: ContributionActionAvailability[];
  /** Original donation truth — never mutated by corrections (ADR-CD-004). */
  original: {
    amountCents: number;
    fundId: string | null;
    missionaryId: string | null;
    paymentStatus: string;
  };
  /** Current effective view derived from original + applied adjustments. */
  effective: {
    amountCents: number;
    fundId: string | null;
    missionaryId: string | null;
    paymentStatus: string;
    changedFields: string[];
    materiallyDiffers: boolean;
  };
  /** Adjustment history linked to this donation, oldest first. */
  adjustments: ContributionAdjustmentRecord[];
  /**
   * Optimistic-concurrency token (ADR-CD-022). Save APIs verify the submitted
   * revision before applying so stale saves are rejected with recovery.
   */
  revision: string;
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

  const designationFunds = new Map<string, DesignationFundInput>();
  if (fund) {
    designationFunds.set(fund.id, {
      id: fund.id,
      name: fund.name,
      missionary_id: null,
      goal_amount: null,
      start_date: null,
      end_date: null,
    });
  }
  for (const allocationFund of input.allocationFunds ?? []) {
    designationFunds.set(allocationFund.id, allocationFund);
  }

  const designationMissionaries = new Map<string, string | null>();
  if (missionary) {
    designationMissionaries.set(missionary.id, missionary.name);
  }
  for (const allocationMissionary of input.allocationMissionaries ?? []) {
    designationMissionaries.set(
      allocationMissionary.id,
      allocationMissionary.display_name,
    );
  }

  const adjustments = input.adjustments ?? [];
  const original = {
    amountCents: donation.amount,
    fundId: donation.fundId,
    missionaryId: donation.missionaryId,
    paymentStatus: donation.status ?? "pending",
  };
  const effectiveResult = deriveEffectiveContribution({
    original,
    adjustments,
  });
  const effective = effectiveResult.effective;

  const effectiveFund = effective.fundId
    ? (designationFunds.get(effective.fundId) ?? null)
    : null;
  const effectiveMissionary = effective.missionaryId
    ? {
        id: effective.missionaryId,
        display_name:
          designationMissionaries.get(effective.missionaryId) ?? null,
      }
    : null;

  const designations = buildContributionDesignationSet({
    donation: {
      id: donation.id,
      amount: effective.amountCents,
      currency: donation.currency,
      fund_id: effective.fundId,
      missionary_id: effective.missionaryId,
    },
    effectiveAmountCents: effective.amountCents,
    allocations: effectiveResult.effectiveDesignationLines
      ? effectiveResult.effectiveDesignationLines.map((line) => ({
          id: line.id,
          amount: line.amountCents,
          fund_id: line.fundId,
          missionary_id: line.missionaryId,
          memo: line.memo,
        }))
      : (input.allocations ?? []),
    funds: designationFunds,
    missionaries: designationMissionaries,
  });

  const shared = buildSharedContributionRowFields({
    designationSet: designations,
    donation: {
      id: donation.id,
      donor_id: donation.donorId,
      missionary_id: effective.missionaryId,
      fund_id: effective.fundId,
      amount: effective.amountCents,
      currency: donation.currency,
      status: effective.paymentStatus,
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
    fund: effectiveFund
      ? { id: effectiveFund.id, name: effectiveFund.name }
      : null,
    missionary: effectiveMissionary,
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
      value: effective.amountCents,
      gross: effective.amountCents,
      net: null,
      fee: null,
      taxDeductible: null,
      currency,
    },
    payment: {
      type: donation.donationType ?? "one_time",
      method: donation.paymentMethod ?? "unknown",
      status: effective.paymentStatus,
      lastFour: null,
      stripe: {
        paymentIntentId: donation.stripePaymentIntentId,
        chargeId: donation.stripeChargeId,
        refundIds: [],
        replayContext: null,
      },
    },
    designations,
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
    original,
    effective: {
      ...effective,
      changedFields: effectiveResult.changedFields,
      materiallyDiffers: effectiveResult.materiallyDiffers,
    },
    adjustments,
    revision: `${donation.updatedAt}#${adjustments.length}`,
    actionAvailability: buildContributionActionAvailability({
      stagedGift: stagedGift
        ? {
            id: stagedGift.id,
            status: stagedGift.status,
            receiptStatus: stagedGift.receiptStatus,
            crmPostStatus: stagedGift.crmPostStatus,
          }
        : null,
      paymentStatus: donation.status,
    }),
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
