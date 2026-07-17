import {
  CRM_POSTING_UNAVAILABLE_NEXT_STEP,
  CRM_POSTING_UNAVAILABLE_REASON,
  isContributionCrmPostingSupported,
  isContributionRouteCrmRetryScopeSupported,
} from "./crm-retry-support";
import { getContributionActionRiskLevel } from "./policy";
import { isContributionRouteActionSupported } from "./route-action-support";

import type { CrmPostFailedScope } from "./crm-post-state";
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
  /** Unified CRM post state from parent/child links, not just staged columns. */
  hasCrmPostFailure?: boolean;
  /**
   * Scope-aware CRM failures. When provided, these supersede the legacy
   * aggregate flag so unsupported designation-only retries stay unavailable.
   */
  crmPostFailedScopes?: CrmPostFailedScope[];
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
  stagedGift: ActionAvailabilityStagedGiftInput | null,
): ContributionActionAvailability {
  if (
    !isContributionCrmPostingSupported() ||
    !isContributionRouteActionSupported("approve_staged_gift")
  ) {
    return entry("approve_staged_gift", {
      available: false,
      blockedReason: CRM_POSTING_UNAVAILABLE_REASON,
      nextStep: CRM_POSTING_UNAVAILABLE_NEXT_STEP,
    });
  }

  if (!stagedGift) {
    return blockedWithoutStagedGift("approve_staged_gift");
  }

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
  stagedGift: ActionAvailabilityStagedGiftInput | null,
  hasCrmPostFailure: boolean,
  hasRetryableCrmPostFailure: boolean,
  hasScopedCrmPostState: boolean,
): ContributionActionAvailability {
  if (
    !isContributionCrmPostingSupported() ||
    !isContributionRouteActionSupported("retry_staged_gift")
  ) {
    return entry("retry_staged_gift", {
      available: false,
      blockedReason: CRM_POSTING_UNAVAILABLE_REASON,
      nextStep: CRM_POSTING_UNAVAILABLE_NEXT_STEP,
    });
  }

  if (!stagedGift) {
    return blockedWithoutStagedGift("retry_staged_gift");
  }

  const hasRetryableStagedGiftState =
    stagedGift.status === "failed" ||
    (stagedGift.status === "ready_to_post" &&
      (stagedGift.crmPostStatus === "failed" ||
        stagedGift.crmPostStatus === "blocked"));
  const hasLegacyCrmPostFailure =
    !hasScopedCrmPostState &&
    (stagedGift.crmPostStatus === "failed" ||
      stagedGift.crmPostStatus === "blocked");
  const retryable =
    hasRetryableStagedGiftState ||
    hasLegacyCrmPostFailure ||
    hasRetryableCrmPostFailure;

  if (retryable) {
    return entry("retry_staged_gift", { available: true });
  }

  if (hasCrmPostFailure) {
    return entry("retry_staged_gift", {
      available: false,
      blockedReason: CRM_POSTING_UNAVAILABLE_REASON,
      nextStep: CRM_POSTING_UNAVAILABLE_NEXT_STEP,
    });
  }

  return entry("retry_staged_gift", {
    available: false,
    blockedReason: "There is no failed or blocked posting to retry.",
    nextStep:
      "Retry becomes available when staged gift processing or CRM posting fails.",
  });
}

function isCompletedPaymentStatus(paymentStatus: string | null): boolean {
  const normalizedStatus = paymentStatus?.toLowerCase() ?? null;

  return (
    normalizedStatus === "completed" ||
    normalizedStatus === "succeeded" ||
    normalizedStatus === "success"
  );
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

  if (!isCompletedPaymentStatus(paymentStatus)) {
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
  if (!isContributionRouteActionSupported("refund")) {
    return entry("refund", {
      available: false,
      blockedReason: "Refund processing is not available yet.",
      nextStep:
        "Use the provider-safe refund workflow once finance enables it.",
    });
  }

  if (
    !isCompletedPaymentStatus(paymentStatus) &&
    paymentStatus !== "refunded"
  ) {
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
  const crmPostFailedScopes = input.crmPostFailedScopes;
  const hasCrmPostFailure = crmPostFailedScopes
    ? crmPostFailedScopes.length > 0
    : (input.hasCrmPostFailure ?? false);
  const hasRetryableCrmPostFailure = crmPostFailedScopes
    ? crmPostFailedScopes.some((scope) =>
        isContributionRouteCrmRetryScopeSupported(scope.scope),
      )
    : hasCrmPostFailure;
  const refund = input.refund ?? {
    amountCents: 0,
    refundedAmountCents: 0,
    hasProviderCharge: false,
  };

  if (!stagedGift) {
    return [
      approveAvailability(null),
      retryAvailability(
        null,
        hasCrmPostFailure,
        hasRetryableCrmPostFailure,
        crmPostFailedScopes !== undefined,
      ),
      blockedWithoutStagedGift("resend_receipt"),
      refundAvailability(paymentStatus, refund),
    ];
  }

  return [
    approveAvailability(stagedGift),
    retryAvailability(
      stagedGift,
      hasCrmPostFailure,
      hasRetryableCrmPostFailure,
      crmPostFailedScopes !== undefined,
    ),
    receiptAvailability(stagedGift, paymentStatus),
    refundAvailability(paymentStatus, refund),
  ];
}
