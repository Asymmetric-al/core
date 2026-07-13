import { createHash } from "node:crypto";

import {
  buildContributionActionAvailability,
  type ContributionActionAvailability,
} from "./action-availability";
import {
  buildContributionCrmPostState,
  type ContributionCrmPostState,
  type CrmPostLinkInput,
} from "./crm-post-state";
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

import type { ResolvedReceiptDeliverySelection } from "./receipt-delivery";
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
  /** Correction requests linked to this donation (ADR-CD-005). */
  correctionRequests?: Array<{
    id: string;
    actionType: string;
    status: string;
    reason: string;
    requestedByProfileId: string | null;
    createdAt: string;
    /**
     * Requester's proposed updated-receipt delivery action (#263).
     * Intentionally excluded from the revision fingerprint: display-only
     * context that must not invalidate concurrent saves.
     */
    receiptDeliveryProposal?: ResolvedReceiptDeliverySelection | null;
    /** Receipt-visible fields this request's payload would change (#263). */
    receiptAffectedFields?: string[];
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
  /** Parent and child CRM record links for this donation (ADR-CD-012). */
  crmLinks?: CrmPostLinkInput[];
  /**
   * The internal recurring agreement linked via `donations.pledge_id`
   * (ADR-CD-007). Stripe references on it are secondary technical proof.
   */
  recurringAgreement?: {
    id: string;
    status: string | null;
    frequency: string | null;
    amountCents: number;
    currencyCode: string;
    fundId: string | null;
    fundName: string | null;
    missionaryId: string | null;
    nextExpectedGiftAt: string | null;
    stripeSubscriptionId: string | null;
  } | null;
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
  /**
   * Recurring context (ADR-CD-007). The internal recurring agreement is the
   * primary link; provider recurrence without one is a reconciliation gap.
   */
  recurring: {
    isRecurring: boolean;
    interval: string | null;
    pledgeId: string | null;
    agreement: NonNullable<
      ContributionDetailInput["recurringAgreement"]
    > | null;
    providerRecurrenceWithoutAgreement: boolean;
  };
  stagedGift: ContributionDetailInput["stagedGift"];
  /**
   * CRM/Twenty post state — workflow metadata, never payment truth
   * (ADR-CD-012). Parent gift status and child designation record status are
   * distinguished so retries can target the failed scope.
   */
  crm: ContributionCrmPostState & {
    postStatus: string | null;
    twentyRecordId: string | null;
  };
  auditEvents: NonNullable<ContributionDetailInput["auditEvents"]>;
  corrections: NonNullable<ContributionDetailInput["corrections"]>;
  /** Pending and decided correction requests for this gift (ADR-CD-005). */
  correctionRequests: NonNullable<
    ContributionDetailInput["correctionRequests"]
  >;
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

function refundStatus(input: {
  amountCents: number;
  refundedAmountCents: number;
}) {
  if (input.refundedAmountCents <= 0) {
    return "none" as const;
  }
  return input.refundedAmountCents >= input.amountCents
    ? ("refunded" as const)
    : ("partial_refund" as const);
}

function effectiveValuesRevisionPayload(
  values: ContributionAdjustmentRecord["effectiveValues"],
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (values.amountCents !== undefined) {
    payload.amountCents = values.amountCents;
  }
  if (values.fundId !== undefined) {
    payload.fundId = values.fundId;
  }
  if (values.missionaryId !== undefined) {
    payload.missionaryId = values.missionaryId;
  }
  if (values.paymentStatus !== undefined) {
    payload.paymentStatus = values.paymentStatus;
  }
  if (values.designationLines !== undefined) {
    payload.designationLines = values.designationLines.map((line) => ({
      id: line.id,
      amountCents: line.amountCents,
      fundId: line.fundId,
      missionaryId: line.missionaryId,
      memo: line.memo,
    }));
  }

  return payload;
}

function buildContributionRevision(input: {
  donationUpdatedAt: string;
  adjustments: ContributionAdjustmentRecord[];
  stagedGift: ContributionDetailInput["stagedGift"];
  crmLinks: CrmPostLinkInput[];
  corrections: NonNullable<ContributionDetailInput["corrections"]>;
  correctionRequests: NonNullable<
    ContributionDetailInput["correctionRequests"]
  >;
  auditEvents: NonNullable<ContributionDetailInput["auditEvents"]>;
}): string {
  const adjustmentFingerprint = [...input.adjustments]
    .sort((left, right) => {
      const createdAtDiff =
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime();
      if (createdAtDiff !== 0) {
        return createdAtDiff;
      }
      return left.id.localeCompare(right.id);
    })
    .map((adjustment) => ({
      id: adjustment.id,
      adjustmentType: adjustment.adjustmentType,
      status: adjustment.status,
      effectiveValues: effectiveValuesRevisionPayload(
        adjustment.effectiveValues,
      ),
      reason: adjustment.reason,
      actorProfileId: adjustment.actorProfileId,
      sourceSurface: adjustment.sourceSurface,
      createdAt: adjustment.createdAt,
    }));
  const workflowFingerprint = {
    stagedGift: input.stagedGift
      ? {
          id: input.stagedGift.id,
          status: input.stagedGift.status,
          receiptStatus: input.stagedGift.receiptStatus,
          crmPostStatus: input.stagedGift.crmPostStatus,
          reviewReason: input.stagedGift.reviewReason,
          twentyRecordId: input.stagedGift.twentyRecordId,
        }
      : null,
    crmLinks: [...input.crmLinks]
      .sort((left, right) => {
        const scopeDiff = left.scope.localeCompare(right.scope);
        if (scopeDiff !== 0) {
          return scopeDiff;
        }
        const allocationDiff = (left.allocationId ?? "").localeCompare(
          right.allocationId ?? "",
        );
        if (allocationDiff !== 0) {
          return allocationDiff;
        }
        return left.id.localeCompare(right.id);
      })
      .map((link) => ({
        id: link.id,
        scope: link.scope,
        allocationId: link.allocationId,
        linkStatus: link.linkStatus,
        twentyRecordId: link.twentyRecordId,
        lastError: link.lastError,
      })),
    corrections: [...input.corrections]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((correction) => ({
        id: correction.id,
        correctionType: correction.correctionType,
        status: correction.status,
      })),
    correctionRequests: [...input.correctionRequests]
      .sort((left, right) => {
        const createdAtDiff =
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime();
        if (createdAtDiff !== 0) {
          return createdAtDiff;
        }
        return left.id.localeCompare(right.id);
      })
      .map((request) => ({
        id: request.id,
        actionType: request.actionType,
        status: request.status,
        reason: request.reason,
        requestedByProfileId: request.requestedByProfileId,
        createdAt: request.createdAt,
      })),
    auditEvents: [...input.auditEvents]
      .sort((left, right) => {
        const createdAtDiff =
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime();
        if (createdAtDiff !== 0) {
          return createdAtDiff;
        }
        return left.id.localeCompare(right.id);
      })
      .map((event) => ({
        id: event.id,
        actionType: event.actionType,
        sourceSurface: event.sourceSurface,
        reason: event.reason,
        createdAt: event.createdAt,
      })),
  };

  const adjustmentHash = createHash("sha256")
    .update(
      JSON.stringify({
        adjustments: adjustmentFingerprint,
        workflow: workflowFingerprint,
      }),
    )
    .digest("hex")
    .slice(0, 16);

  return `${input.donationUpdatedAt}#${input.adjustments.length}#${adjustmentHash}`;
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
      is_recurring: donation.isRecurring,
      recurring_interval: donation.recurringInterval,
      pledge_id: donation.pledgeId,
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
    corrections: [
      ...(input.corrections ?? []).map((correction) => ({
        status: correction.status,
      })),
      ...(input.correctionRequests ?? [])
        .filter((request) => request.status === "pending")
        .map(() => ({ status: "pending" })),
    ],
  });

  const crmPostState = buildContributionCrmPostState({
    stagedGiftCrmPostStatus: stagedGift?.crmPostStatus ?? null,
    stagedGiftTwentyRecordId: stagedGift?.twentyRecordId ?? null,
    links: input.crmLinks ?? [],
    designationLineCount: designations.lines.length,
  });
  const hasLoadedRecurringAgreement = input.recurringAgreement != null;
  const hasInternalRecurringLink = Boolean(
    donation.pledgeId || hasLoadedRecurringAgreement,
  );
  const isRecurringGift = Boolean(
    donation.isRecurring ||
    donation.recurringInterval ||
    hasInternalRecurringLink,
  );
  const providerRecurrenceWithoutAgreement = Boolean(
    (donation.isRecurring || donation.recurringInterval) &&
    !hasInternalRecurringLink,
  );

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
      status: refundStatus({
        amountCents: effective.amountCents,
        refundedAmountCents: donation.refundAmount,
      }),
      amount: donation.refundAmount,
      refundedAt: donation.refundedAt,
    },
    recurring: {
      isRecurring: isRecurringGift,
      interval: donation.recurringInterval,
      pledgeId: donation.pledgeId,
      agreement: input.recurringAgreement ?? null,
      providerRecurrenceWithoutAgreement,
    },
    stagedGift: stagedGift ?? null,
    crm: {
      postStatus: stagedGift?.crmPostStatus ?? null,
      twentyRecordId: stagedGift?.twentyRecordId ?? null,
      ...crmPostState,
    },
    auditEvents: input.auditEvents ?? [],
    corrections: input.corrections ?? [],
    correctionRequests: input.correctionRequests ?? [],
    original,
    effective: {
      ...effective,
      changedFields: effectiveResult.changedFields,
      materiallyDiffers: effectiveResult.materiallyDiffers,
    },
    adjustments,
    revision: buildContributionRevision({
      donationUpdatedAt: donation.updatedAt,
      adjustments,
      stagedGift,
      crmLinks: input.crmLinks ?? [],
      corrections: input.corrections ?? [],
      correctionRequests: input.correctionRequests ?? [],
      auditEvents: input.auditEvents ?? [],
    }),
    actionAvailability: buildContributionActionAvailability({
      stagedGift: stagedGift
        ? {
            id: stagedGift.id,
            status: stagedGift.status,
            receiptStatus: stagedGift.receiptStatus,
            crmPostStatus: stagedGift.crmPostStatus,
          }
        : null,
      paymentStatus: effective.paymentStatus,
      hasCrmPostFailure: crmPostState.failedScopes.length > 0,
      crmPostFailedScopes: crmPostState.failedScopes,
      refund: {
        // Refundable basis is the ORIGINAL donation amount (what the
        // provider charged), never the adjusted effective amount, so the
        // availability payload agrees with the refund adapter (issue #265).
        amountCents: donation.amount,
        refundedAmountCents: donation.refundAmount,
        hasProviderCharge: Boolean(
          donation.stripeChargeId || donation.stripePaymentIntentId,
        ),
      },
    }),
    tasks: [],
    batches: [],
    donorVisible: {
      status: donorVisibleStatus(
        effective.paymentStatus,
        donation.refundAmount,
        effective.amountCents,
      ),
      historyUpdatedImmediately: true,
      amount: effective.amountCents,
      currency,
    },
  };
}
