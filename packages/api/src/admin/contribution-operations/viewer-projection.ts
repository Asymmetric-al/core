import type { ContributionActionAvailability } from "./action-availability";
import type { ContributionDetail } from "./detail-read-model";

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

export function stripeReplayAvailability(
  paymentIntentId: string | null,
): ContributionActionAvailability {
  if (!paymentIntentId) {
    return {
      actionType: "stripe_replay",
      available: false,
      blockedReason: "This gift has no provider payment events to replay.",
      nextStep:
        "Webhook replay applies to gifts processed through the payment provider.",
      riskLevel: "high",
    };
  }

  return {
    actionType: "stripe_replay",
    available: true,
    blockedReason: null,
    nextStep: null,
    riskLevel: "high",
  };
}

export function projectContributionDetailForViewer(
  detail: ContributionDetail,
  viewerCapabilities: string[],
): ViewerProjectedContributionDetail {
  const hasProviderAccess = viewerCapabilities.includes(
    "contributions.use_provider_actions",
  );

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
      actionAvailability: detail.actionAvailability.filter(
        (entry) => entry.actionType !== "stripe_replay",
      ),
      providerProof: null,
    };
  }

  const { paymentIntentId, chargeId } = detail.payment.stripe;

  return {
    ...detail,
    actionAvailability: [
      ...detail.actionAvailability.filter(
        (entry) => entry.actionType !== "stripe_replay",
      ),
      stripeReplayAvailability(paymentIntentId),
    ],
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
