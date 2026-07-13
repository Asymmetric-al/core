import { loadContributionDetailFromSupabase } from "./operations";
import {
  claimContributionRefundAttempt,
  finalizeContributionRefundAttempt,
  loadContributionRefundAttempt,
} from "./store";
import { loadTenantStripeSecretKey } from "./tenant-stripe-key";
import { ApiHttpError } from "../../shared/http-errors";
import { createStripeClient } from "../../stripe/client";
import {
  applyRefundedChargeToDonation,
  createStripeRefund,
  describeStripeRefundError,
  retrieveLiveChargeForRefund,
} from "../../stripe/refunds";

import type { ContributionProviderOutcome } from "./types";
import type { StripeRefundsApi } from "../../stripe/refunds";
import type { StripeWebhookOutcome } from "../../stripe/webhooks";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type Stripe from "stripe";

/**
 * Admin refund adapter (issue #265). Enforces server-side availability
 * before touching Stripe, then maps the provider result to an honest
 * ContributionProviderOutcome: the platform never implies a refund is final
 * before Stripe confirms it, and provider failures are RETURNED (not thrown)
 * so the executor records failed corrections and audit events truthfully.
 */

const STALE_REVISION_MESSAGE =
  "This gift changed since you loaded it. Reload the latest detail, review the changes, and submit the refund again.";

/**
 * Ambiguous transport errors (connection dropped, Stripe 5xx, idempotency
 * conflict): Stripe may or may not have created the refund. Thrown — not
 * returned as a failed outcome — so the shell keeps the form open behind its
 * Retry button with the SAME idempotency key, and the retry replays the
 * identical Stripe attempt instead of minting a new refund.
 */
const AMBIGUOUS_PROVIDER_ERROR_MESSAGE =
  "Stripe did not confirm the refund. Retry — the same attempt will be replayed safely.";

/** Stripe metadata values are limited to 500 characters. */
const STRIPE_METADATA_VALUE_LIMIT = 500;

/**
 * Convergence outcomes that mean the routine wrote nothing locally: the
 * expanded charge had no payment intent, or no donation row matched it.
 * Reporting these as "succeeded" would leave refund_amount at 0 forever.
 */
const NON_CONVERGING_LOCAL_UPDATE_ACTIONS: ReadonlySet<string> = new Set([
  "charge_refund_missing_payment_intent",
  "charge_refund_not_matched",
]);

export interface RefundContributionThroughStripeInput {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  contributionId: string;
  /** Refund amount in cents; validated against the remaining refundable amount. */
  amount: number;
  reason: string;
  confirmationToken: string;
  expectedRevision?: string | null;
  idempotencyKey: string;
  /** Test seam: builds the Stripe client for the resolved secret key. */
  createStripe?: (secretKey: string) => StripeRefundsApi;
}

function formatCentsAsCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function isCompletedPaymentStatus(status: string): boolean {
  return (
    status === "completed" || status === "succeeded" || status === "success"
  );
}

async function resolveTenantStripeSecretKey(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<string> {
  const secretKey = await loadTenantStripeSecretKey(input);

  if (!secretKey) {
    throw new ApiHttpError(
      503,
      "Stripe is not configured for this organization, so provider refunds are unavailable.",
    );
  }

  return secretKey;
}

export async function refundContributionThroughStripe(
  input: RefundContributionThroughStripeInput,
): Promise<ContributionProviderOutcome> {
  let refundAttempt = await loadContributionRefundAttempt({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    idempotencyKey: input.idempotencyKey,
    donationId: input.contributionId,
    requestedAmount: input.amount,
  });

  if (refundAttempt?.state === "finalized") {
    if (!refundAttempt.providerOutcome) {
      throw new Error(
        "contribution_refund_attempt_recovery_failed: finalized attempt has no provider outcome",
      );
    }
    return refundAttempt.providerOutcome;
  }

  const isReplayableAttempt = refundAttempt?.state === "claimed";
  const detail = await loadContributionDetailFromSupabase({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    contributionId: input.contributionId,
  });

  // Stale-save protection (ADR-CD-022): reject before any provider call.
  if (
    !isReplayableAttempt &&
    input.expectedRevision &&
    input.expectedRevision !== detail.revision
  ) {
    throw new ApiHttpError(409, STALE_REVISION_MESSAGE);
  }

  // Server-enforced availability. These mirror the blocked reasons the
  // detail read model computes for the refund action so the adapter can
  // never refund a gift the availability payload reports as blocked.
  const paymentIntentId = detail.payment.stripe.paymentIntentId;
  const chargeId = detail.payment.stripe.chargeId;
  if (!paymentIntentId && !chargeId) {
    throw new ApiHttpError(
      409,
      "This gift has no payment provider charge to refund against.",
    );
  }

  const paymentStatus = detail.payment.status?.toLowerCase() ?? "";
  const isRefundablePaymentStatus =
    isCompletedPaymentStatus(paymentStatus) || paymentStatus === "refunded";
  if (!isRefundablePaymentStatus) {
    throw new ApiHttpError(409, "Only completed payments can be refunded.");
  }

  // The refundable basis is the ORIGINAL donation amount (what Stripe
  // charged), not the adjusted effective amount (ADR-CD-004).
  if (!isReplayableAttempt) {
    const remainingRefundableCents =
      detail.original.amountCents - detail.refund.amount;
    if (remainingRefundableCents <= 0) {
      throw new ApiHttpError(400, "This gift is already fully refunded.");
    }
    if (input.amount > remainingRefundableCents) {
      throw new ApiHttpError(
        400,
        `Refund amount exceeds the remaining refundable amount of ${formatCentsAsCurrency(
          remainingRefundableCents,
          detail.amount.currency,
        )}.`,
      );
    }
  }

  const secretKey = await resolveTenantStripeSecretKey({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
  });
  const buildStripeClient = input.createStripe ?? createStripeClient;
  const stripe: StripeRefundsApi = buildStripeClient(secretKey);

  // Provider-truth over-refund guard: Stripe counts pending refunds into
  // charge.amount_refunded immediately, so the live charge is the authority
  // on what remains refundable even when the local record has not converged
  // for a genuinely new attempt. Returned — not thrown — because it is
  // provider-verified state the executor should record honestly.
  if (!isReplayableAttempt) {
    let liveCharge: Stripe.Charge | null;
    try {
      liveCharge = await retrieveLiveChargeForRefund({
        stripe,
        paymentIntentId,
        chargeId,
      });
    } catch (error) {
      const described = describeStripeRefundError(error);
      if (!described) {
        throw error;
      }
      if (described.ambiguous) {
        // Nothing was created yet, so a same-key retry is doubly safe.
        throw new ApiHttpError(502, AMBIGUOUS_PROVIDER_ERROR_MESSAGE);
      }
      return {
        provider: "stripe",
        status: "failed",
        errorCode: described.errorCode,
        errorMessage: described.errorMessage,
      };
    }

    if (liveCharge) {
      const providerRemainingCents =
        (liveCharge.amount ?? 0) - (liveCharge.amount_refunded ?? 0);
      if (input.amount > providerRemainingCents) {
        return {
          provider: "stripe",
          status: "failed",
          errorCode: "refund_exceeds_provider_remaining",
          errorMessage: `Refund amount exceeds the provider's remaining refundable amount of ${formatCentsAsCurrency(
            providerRemainingCents,
            detail.amount.currency,
          )}. A refund may still be pending provider confirmation.`,
        };
      }
    }
  }

  if (!refundAttempt) {
    const claimed = await claimContributionRefundAttempt({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      donationId: input.contributionId,
      requestedAmount: input.amount,
      idempotencyKey: input.idempotencyKey,
    });
    refundAttempt = claimed.attempt;

    if (refundAttempt.state === "finalized") {
      if (!refundAttempt.providerOutcome) {
        throw new Error(
          "contribution_refund_attempt_recovery_failed: finalized attempt has no provider outcome",
        );
      }
      return refundAttempt.providerOutcome;
    }
  }

  if (!refundAttempt) {
    throw new Error(
      "contribution_refund_attempt_claim_failed: claimed row was not returned",
    );
  }
  const activeRefundAttempt = refundAttempt;

  const finalizeAttempt = async (
    providerOutcome: ContributionProviderOutcome,
  ): Promise<ContributionProviderOutcome> => {
    await finalizeContributionRefundAttempt({
      supabaseAdmin: input.supabaseAdmin,
      attempt: activeRefundAttempt,
      providerOutcome,
    });
    return providerOutcome;
  };

  let refundResult: Awaited<ReturnType<typeof createStripeRefund>>;
  try {
    refundResult = await createStripeRefund({
      stripe,
      paymentIntentId,
      chargeId,
      amountCents: input.amount,
      idempotencyKey: input.idempotencyKey,
      metadata: {
        tenant_id: input.tenantId,
        donation_id: input.contributionId,
        reason: input.reason.slice(0, STRIPE_METADATA_VALUE_LIMIT),
      },
    });
  } catch (error) {
    const described = describeStripeRefundError(error);
    if (!described) {
      throw error;
    }

    // Ambiguous transport errors are NOT terminal: Stripe may have created
    // the refund. Throw so the caller retries with the same idempotency key
    // instead of recording a definitive failure that invites re-submission
    // under a fresh key.
    if (described.ambiguous) {
      throw new ApiHttpError(502, AMBIGUOUS_PROVIDER_ERROR_MESSAGE);
    }

    // Provider-outcome honesty: return the failure so the executor records
    // the failed correction and audit event instead of losing the attempt.
    return finalizeAttempt({
      provider: "stripe",
      status: "failed",
      errorCode: described.errorCode,
      errorMessage: described.errorMessage,
    });
  }

  const { refund, charge } = refundResult;

  if (refund.status === "succeeded") {
    let localOutcome: StripeWebhookOutcome;
    try {
      if (!charge) {
        throw new Error(
          "Stripe did not return the expanded charge for the refund.",
        );
      }
      localOutcome = await applyRefundedChargeToDonation(
        input.supabaseAdmin,
        charge,
        // The expanded charge's embedded refund list can be absent or
        // truncated; the refund this action just created is always part of
        // the convergent stripe_refund_ids set.
        { knownRefundIds: [refund.id] },
      );
    } catch (error) {
      // The provider refund succeeded but the local record did not converge.
      // Keep the reference id so staff can reconcile against Stripe.
      return finalizeAttempt({
        provider: "stripe",
        status: "local_update_failed",
        referenceId: refund.id,
        errorCode: "local_update_failed",
        errorMessage:
          error instanceof Error
            ? error.message
            : "Failed to apply the Stripe refund to the donation record.",
      });
    }

    // The convergence routine returns handled-but-non-writing outcomes
    // (missing payment intent on the charge, no matching donation) without
    // throwing. Those are local-update failures, not successes: money moved
    // at Stripe while refund_amount stayed untouched.
    if (NON_CONVERGING_LOCAL_UPDATE_ACTIONS.has(localOutcome.action)) {
      return finalizeAttempt({
        provider: "stripe",
        status: "local_update_failed",
        referenceId: refund.id,
        errorCode: "local_update_failed",
        errorMessage:
          "The Stripe refund succeeded but no local donation record matched the refunded charge. Reconcile the gift against the provider reference.",
      });
    }

    return finalizeAttempt({
      provider: "stripe",
      status: "succeeded",
      referenceId: refund.id,
    });
  }

  // Do not imply finality before Stripe confirms: pending refunds get no
  // local write; the charge.refunded webhook converges the record later.
  const providerStatus = refund.status ?? "pending";
  if (providerStatus === "pending") {
    return finalizeAttempt({
      provider: "stripe",
      status: "pending",
      referenceId: refund.id,
    });
  }

  // failed / canceled / requires_action — surface the provider status
  // honestly with no local write.
  return finalizeAttempt({
    provider: "stripe",
    status: providerStatus,
    referenceId: refund.id,
    errorCode: refund.failure_reason ?? null,
  });
}
