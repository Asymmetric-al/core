import { getContributionActionRiskLevel } from "./policy";

import type { ContributionActionType, ContributionRiskLevel } from "./types";

/**
 * Server-computed action availability (ADR-CD-017 / ADR-CD-018).
 *
 * The backend is the authority for which gift actions are valid. The UI never
 * infers availability from local state; it renders `available` actions and
 * explains blocked ones using `blockedReason` and `nextStep` product language.
 */
export interface ContributionActionAvailability {
  actionType: ContributionActionType;
  available: boolean;
  blockedReason: string | null;
  nextStep: string | null;
  riskLevel: ContributionRiskLevel;
}

export interface ActionAvailabilityStagedGiftInput {
  id: string;
  status: string | null;
  receiptStatus: string | null;
  crmPostStatus: string | null;
}

export interface BuildContributionActionAvailabilityInput {
  stagedGift: ActionAvailabilityStagedGiftInput | null;
  paymentStatus: string | null;
  /** Refund context: original amount, refunded so far, provider charge. */
  refund?: {
    amountCents: number;
    refundedAmountCents: number;
    hasProviderCharge: boolean;
  };
}

/**
 * A gift without a staged gift is valid read-only financial truth — never
 * describe the donation itself as missing or invalid (issue #258).
 */
const NO_STAGED_GIFT_REASON =
  "This gift has no staged gift workflow record, so finance workflow actions are unavailable.";
const NO_STAGED_GIFT_NEXT_STEP =
  "The donation is valid and shown read-only. Import or create a staged gift to run finance workflow actions for it.";

function entry(
  actionType: ContributionActionType,
  result:
    | { available: true }
    | { available: false; blockedReason: string; nextStep: string },
): ContributionActionAvailability {
  return {
    actionType,
    available: result.available,
    blockedReason: result.available ? null : result.blockedReason,
    nextStep: result.available ? null : result.nextStep,
    riskLevel: getContributionActionRiskLevel(actionType),
  };
}

function blockedWithoutStagedGift(
  actionType: ContributionActionType,
): ContributionActionAvailability {
  return entry(actionType, {
    available: false,
    blockedReason: NO_STAGED_GIFT_REASON,
    nextStep: NO_STAGED_GIFT_NEXT_STEP,
  });
}

function approveAvailability(
  stagedGift: ActionAvailabilityStagedGiftInput,
): ContributionActionAvailability {
  if (
    stagedGift.status === "received" ||
    stagedGift.status === "needs_review"
  ) {
    return entry("approve_staged_gift", { available: true });
  }

  return entry("approve_staged_gift", {
    available: false,
    blockedReason: `This gift is not awaiting finance review (current workflow state: ${
      stagedGift.status?.replace(/_/g, " ") ?? "unknown"
    }).`,
    nextStep:
      "Approval is only needed while a gift is received or needs review.",
  });
}

function retryAvailability(
  stagedGift: ActionAvailabilityStagedGiftInput,
): ContributionActionAvailability {
  const retryable =
    stagedGift.status === "failed" ||
    stagedGift.crmPostStatus === "failed" ||
    stagedGift.crmPostStatus === "blocked";

  if (retryable) {
    return entry("retry_staged_gift", { available: true });
  }

  return entry("retry_staged_gift", {
    available: false,
    blockedReason: "There is no failed or blocked posting to retry.",
    nextStep:
      "Retry becomes available when staged gift processing or CRM posting fails.",
  });
}

function receiptAvailability(
  stagedGift: ActionAvailabilityStagedGiftInput,
  paymentStatus: string | null,
): ContributionActionAvailability {
  if (stagedGift.receiptStatus === "suppressed") {
    return entry("resend_receipt", {
      available: false,
      blockedReason: "Receipts are suppressed for this gift.",
      nextStep:
        "Review the donor's receipt preference before sending donor communication.",
    });
  }

  if (paymentStatus !== "completed") {
    return entry("resend_receipt", {
      available: false,
      blockedReason: "The payment is not completed yet.",
      nextStep: "Receipts can be sent once the gift payment completes.",
    });
  }

  return entry("resend_receipt", { available: true });
}

function refundAvailability(
  paymentStatus: string | null,
  refund: NonNullable<BuildContributionActionAvailabilityInput["refund"]>,
): ContributionActionAvailability {
  if (paymentStatus !== "completed" && paymentStatus !== "refunded") {
    return entry("refund", {
      available: false,
      blockedReason: "Only completed payments can be refunded.",
      nextStep: "Refunds become available once the gift payment completes.",
    });
  }

  if (!refund.hasProviderCharge) {
    return entry("refund", {
      available: false,
      blockedReason:
        "This gift has no payment provider charge to refund against.",
      nextStep:
        "Offline gifts are corrected through adjustments rather than provider refunds.",
    });
  }

  const remaining = refund.amountCents - refund.refundedAmountCents;
  if (remaining <= 0) {
    return entry("refund", {
      available: false,
      blockedReason: "This gift is already fully refunded.",
      nextStep: "No refundable amount remains on this gift.",
    });
  }

  return entry("refund", { available: true });
}

export function buildContributionActionAvailability(
  input: BuildContributionActionAvailabilityInput,
): ContributionActionAvailability[] {
  const { stagedGift, paymentStatus } = input;
  const refund = input.refund ?? {
    amountCents: 0,
    refundedAmountCents: 0,
    hasProviderCharge: false,
  };

  if (!stagedGift) {
    return [
      blockedWithoutStagedGift("approve_staged_gift"),
      blockedWithoutStagedGift("retry_staged_gift"),
      blockedWithoutStagedGift("resend_receipt"),
      refundAvailability(paymentStatus, refund),
    ];
  }

  return [
    approveAvailability(stagedGift),
    retryAvailability(stagedGift),
    receiptAvailability(stagedGift, paymentStatus),
    refundAvailability(paymentStatus, refund),
  ];
}
