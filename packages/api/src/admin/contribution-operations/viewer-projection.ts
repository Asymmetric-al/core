import {
  canDecideCorrectionRequest,
  resolveCorrectionApprovalPolicy,
} from "./approval-policy";
import { evaluateReceiptDeliveryOptions } from "./receipt-delivery";
import {
  buildCorrectionActionAvailability,
  isContributionOperationActionType,
  isCorrectionRequestActionType,
  stripeReplayAvailability,
  viewerCanUseContributionOperation,
} from "./viewer-action-availability";

import type { ContributionActionAvailability } from "./action-availability";
import type { CorrectionApprovalPolicy } from "./approval-policy";
import type { ContributionDetail } from "./detail-read-model";
import type {
  ReceiptDeliveryChoice,
  ReceiptDeliveryDonorContext,
  ReceiptDeliveryOption,
  TenantReceiptDeliveryPolicy,
} from "./receipt-delivery";
import type {
  ContributionActionResult,
  ContributionProviderOutcome,
} from "./types";

export { stripeReplayAvailability } from "./viewer-action-availability";

/**
 * Role-gated provider proof (ADR-CD-014 / ADR-CD-015).
 *
 * Normal staff see payment summaries without raw provider identifiers.
 * Authorized finance/admin operators (contributions.use_provider_actions)
 * get an expandable proof block with provider ids and dashboard links, plus
 * the safe provider actions. Raw provider payloads and secrets are never
 * part of the detail payload for unauthorized viewers.
 */

export interface ContributionProviderProof {
  paymentIntentId: string | null;
  chargeId: string | null;
  refundIds: string[];
  replayContext: Record<string, unknown> | null;
  dashboardUrls: {
    paymentIntent: string | null;
    charge: string | null;
  };
}

/**
 * Updated receipt delivery context for the detail GET payload (#263).
 * Attached only when the gift's receipt was already sent — the only state in
 * which a correction can invalidate a communicated receipt.
 */
export interface ContributionReceiptDeliveryView {
  options: ReceiptDeliveryOption[];
  defaultChoice: ReceiptDeliveryChoice | null;
  deferReasonRequired: boolean;
  requireDeliveryAction: boolean;
  donor: ReceiptDeliveryDonorContext;
}

export type ViewerProjectedCorrectionRequest =
  ContributionDetail["correctionRequests"][number] & {
    /** Whether this viewer may approve/reject the request (ADR-CD-025). */
    viewerCanDecide: boolean;
  };

export type ViewerProjectedContributionDetail = Omit<
  ContributionDetail,
  "correctionRequests"
> & {
  /** Present only for viewers with contributions.use_provider_actions. */
  providerProof: ContributionProviderProof | null;
  /**
   * `viewerCanDecide` is attached by the detail GET route via
   * {@link projectCorrectionRequestsForViewer}; action-result projections
   * leave it absent.
   */
  correctionRequests: Array<
    ContributionDetail["correctionRequests"][number] & {
      viewerCanDecide?: boolean;
    }
  >;
  /**
   * Attached by the detail GET route when `shared.receiptStatus === "sent"`;
   * `null`/absent otherwise.
   */
  receiptDelivery?: ContributionReceiptDeliveryView | null;
};

export interface ProjectContributionDetailOptions {
  /** Tenant approval policy used by both detail and inline availability. */
  approvalPolicy?: CorrectionApprovalPolicy | null;
}

/**
 * Pure viewer projection of the tenant receipt delivery policy + donor
 * context, evaluated against the viewer's capabilities (#263).
 */
export function buildContributionReceiptDeliveryView(input: {
  policy: TenantReceiptDeliveryPolicy;
  donor: ReceiptDeliveryDonorContext;
  viewerCapabilities: string[];
}): ContributionReceiptDeliveryView {
  const evaluated = evaluateReceiptDeliveryOptions({
    policy: input.policy,
    donor: input.donor,
    actorCapabilities: input.viewerCapabilities,
  });

  return {
    options: evaluated.options,
    defaultChoice: evaluated.defaultChoice,
    deferReasonRequired: input.policy.deferReasonRequired,
    requireDeliveryAction: input.policy.requireDeliveryAction,
    donor: input.donor,
  };
}

/**
 * Pure per-request decision projection (#263). Mirrors the decision
 * endpoint's server-side enforcement so the UI never shows approve/reject
 * affordances the server would refuse.
 */
export function projectCorrectionRequestsForViewer(
  requests: ContributionDetail["correctionRequests"],
  viewer: {
    policy: CorrectionApprovalPolicy;
    viewerProfileId: string | null;
    viewerCapabilities: string[];
  },
): ViewerProjectedCorrectionRequest[] {
  return requests.map((request) => ({
    ...request,
    viewerCanDecide: canDecideCorrectionRequest({
      policy: viewer.policy,
      request: { requestedByProfileId: request.requestedByProfileId },
      deciderProfileId: viewer.viewerProfileId,
      deciderCapabilities: viewer.viewerCapabilities,
    }),
  }));
}

function viewerScopedActionAvailability(input: {
  detail: ContributionDetail;
  approvalPolicy: CorrectionApprovalPolicy;
  viewerCapabilities: string[];
}): ContributionActionAvailability[] {
  const { detail, approvalPolicy, viewerCapabilities } = input;
  const baseEntries = detail.actionAvailability.filter(
    (entry) =>
      entry.actionType !== "stripe_replay" &&
      !isCorrectionRequestActionType(entry.actionType) &&
      isContributionOperationActionType(entry.actionType) &&
      viewerCanUseContributionOperation({
        actionType: entry.actionType,
        approvalPolicy,
        viewerCapabilities,
      }),
  );

  const correctionEntries = buildCorrectionActionAvailability().filter(
    (entry) =>
      viewerCanUseContributionOperation({
        actionType: entry.actionType,
        approvalPolicy,
        viewerCapabilities,
      }),
  );

  const canUseReplay = viewerCanUseContributionOperation({
    actionType: "stripe_replay",
    approvalPolicy,
    viewerCapabilities,
  });
  const replayEntries = canUseReplay
    ? [
        stripeReplayAvailability(
          detail.payment.stripe.paymentIntentId,
          detail.payment.stripe.chargeId,
        ),
      ]
    : [];

  return [...baseEntries, ...correctionEntries, ...replayEntries];
}

export function projectContributionDetailForViewer(
  detail: ContributionDetail,
  viewerCapabilities: string[],
  options?: ProjectContributionDetailOptions,
): ViewerProjectedContributionDetail {
  const approvalPolicy =
    options?.approvalPolicy ?? resolveCorrectionApprovalPolicy(null);
  const hasProviderAccess = viewerCapabilities.includes(
    "contributions.use_provider_actions",
  );
  const actionAvailability = viewerScopedActionAvailability({
    detail,
    approvalPolicy,
    viewerCapabilities,
  });

  if (!hasProviderAccess) {
    return {
      ...detail,
      payment: {
        ...detail.payment,
        stripe: {
          paymentIntentId: null,
          chargeId: null,
          refundIds: [],
          replayContext: null,
        },
      },
      recurring: {
        ...detail.recurring,
        agreement: detail.recurring.agreement
          ? { ...detail.recurring.agreement, stripeSubscriptionId: null }
          : null,
      },
      // Hide provider/admin actions entirely for unauthorized viewers
      // (ADR-CD-018 mixed visibility: irrelevant or unauthorized → hidden).
      actionAvailability,
      providerProof: null,
    };
  }

  const { paymentIntentId, chargeId } = detail.payment.stripe;

  return {
    ...detail,
    actionAvailability,
    providerProof: {
      paymentIntentId,
      chargeId,
      refundIds: detail.payment.stripe.refundIds,
      replayContext: detail.payment.stripe.replayContext,
      dashboardUrls: {
        paymentIntent: paymentIntentId
          ? `https://dashboard.stripe.com/payments/${paymentIntentId}`
          : null,
        charge: chargeId
          ? `https://dashboard.stripe.com/charges/${chargeId}`
          : null,
      },
    },
  };
}

/**
 * Strip raw provider identifiers from a provider outcome for viewers lacking
 * contributions.use_provider_actions. `referenceId` (e.g. a Stripe `re_`/`pi_`
 * id), `raw` (the provider payload), and `errorMessage` (which can embed ids)
 * are removed; the non-sensitive provider/status/errorCode workflow fields are
 * kept so the UI can still show what happened.
 */
function redactProviderOutcomeForViewer(
  outcome: ContributionProviderOutcome | null | undefined,
): ContributionProviderOutcome | null | undefined {
  if (!outcome) {
    return outcome;
  }

  return {
    provider: outcome.provider,
    status: outcome.status,
    errorCode: outcome.errorCode ?? null,
    referenceId: null,
  };
}

/**
 * Apply the same viewer projection the GET detail endpoint uses to an action
 * result before returning it (ADR-CD-014). Without this, a viewer lacking
 * contributions.use_provider_actions would receive raw Stripe identifiers on
 * result.canonicalContribution and result.providerOutcome.
 */
export function projectContributionActionResultForViewer<
  TResult extends ContributionActionResult,
>(
  result: TResult,
  viewerCapabilities: string[],
  options?: ProjectContributionDetailOptions,
): TResult {
  const hasProviderAccess = viewerCapabilities.includes(
    "contributions.use_provider_actions",
  );

  const canonical = result.canonicalContribution;
  const projected: TResult =
    canonical && typeof canonical === "object"
      ? {
          ...result,
          canonicalContribution: projectContributionDetailForViewer(
            canonical as ContributionDetail,
            viewerCapabilities,
            options,
          ),
        }
      : result;

  if (hasProviderAccess || result.providerOutcome == null) {
    return projected;
  }

  return {
    ...projected,
    providerOutcome: redactProviderOutcomeForViewer(result.providerOutcome),
  };
}
