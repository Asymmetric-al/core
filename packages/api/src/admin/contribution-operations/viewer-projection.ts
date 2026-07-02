import { resolveCorrectionApprovalPolicy } from "./approval-policy";
import {
  buildCorrectionRequestAvailability,
  isCorrectionRequestActionType,
  stripeReplayAvailability,
  viewerCanUseContributionOperation,
} from "./viewer-action-availability";

import type { ContributionActionAvailability } from "./action-availability";
import type { CorrectionApprovalPolicy } from "./approval-policy";
import type { ContributionDetail } from "./detail-read-model";
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

export type ViewerProjectedContributionDetail = ContributionDetail & {
  /** Present only for viewers with contributions.use_provider_actions. */
  providerProof: ContributionProviderProof | null;
};

export interface ProjectContributionDetailOptions {
  /**
   * Tenant correction approval policy. When omitted, the same conservative
   * default as the executor and the CRM inline builder applies
   * (`resolveCorrectionApprovalPolicy(null)`).
   */
  approvalPolicy?: CorrectionApprovalPolicy | null;
}

/**
 * Viewer-scoped operation entries appended to the detail contract (#270).
 *
 * Correction requests and provider replay reuse the exact derivation
 * `buildInlineContributionActions` uses, so a CRM inline affordance always
 * finds a matching detail availability entry with identical semantics.
 * Entries the viewer cannot act on stay hidden (ADR-CD-018 mixed
 * visibility: irrelevant or unauthorized → hidden). The base workflow
 * entries (approve/retry/resend/refund) pass through untouched.
 */
function viewerScopedActionAvailability(input: {
  detail: ContributionDetail;
  approvalPolicy: CorrectionApprovalPolicy;
  viewerCapabilities: string[];
}): ContributionActionAvailability[] {
  const { detail, approvalPolicy, viewerCapabilities } = input;
  const baseEntries = detail.actionAvailability.filter(
    (entry) =>
      entry.actionType !== "stripe_replay" &&
      !isCorrectionRequestActionType(entry.actionType),
  );

  const correctionEntries = buildCorrectionRequestAvailability(
    approvalPolicy,
  ).filter((entry) =>
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
