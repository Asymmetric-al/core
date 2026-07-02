import { serverEnv } from "@asym/env";

import { loadContributionDetailFromSupabase } from "./operations";
import { ApiHttpError } from "../../shared/http-errors";
import { createStripeClient } from "../../stripe/client";
import {
  applyRefundedChargeToDonation,
  createStripeRefund,
  describeStripeRefundError,
} from "../../stripe/refunds";

import type { ContributionProviderOutcome } from "./types";
import type { StripeRefundsApi } from "../../stripe/refunds";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

/**
 * Admin refund adapter (issue #265). Enforces server-side availability
 * before touching Stripe, then maps the provider result to an honest
 * ContributionProviderOutcome: the platform never implies a refund is final
 * before Stripe confirms it, and provider failures are RETURNED (not thrown)
 * so the executor records failed corrections and audit events truthfully.
 */

const STALE_REVISION_MESSAGE =
  "This gift changed since you loaded it. Reload the latest detail, review the changes, and submit the refund again.";

/** Stripe metadata values are limited to 500 characters. */
const STRIPE_METADATA_VALUE_LIMIT = 500;

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
  const { data, error } = await input.supabaseAdmin
    .from("tenants")
    .select("id, stripe_secret_key")
    .eq("id", input.tenantId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const tenantRow = data as { stripe_secret_key?: string | null } | null;
  const secretKey =
    tenantRow?.stripe_secret_key ?? serverEnv.STRIPE_SECRET_KEY ?? null;

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
  const detail = await loadContributionDetailFromSupabase({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
    contributionId: input.contributionId,
  });

  // Stale-save protection (ADR-CD-022): reject before any provider call.
  if (input.expectedRevision && input.expectedRevision !== detail.revision) {
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

  const secretKey = await resolveTenantStripeSecretKey({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
  });
  const buildStripeClient = input.createStripe ?? createStripeClient;
  const stripe: StripeRefundsApi = buildStripeClient(secretKey);

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

    // Provider-outcome honesty: return the failure so the executor records
    // the failed correction and audit event instead of losing the attempt.
    return {
      provider: "stripe",
      status: "failed",
      errorCode: described.errorCode,
      errorMessage: described.errorMessage,
    };
  }

  const { refund, charge } = refundResult;

  if (refund.status === "succeeded") {
    try {
      if (!charge) {
        throw new Error(
          "Stripe did not return the expanded charge for the refund.",
        );
      }
      await applyRefundedChargeToDonation(input.supabaseAdmin, charge);
    } catch (error) {
      // The provider refund succeeded but the local record did not converge.
      // Keep the reference id so staff can reconcile against Stripe.
      return {
        provider: "stripe",
        status: "local_update_failed",
        referenceId: refund.id,
        errorCode: "local_update_failed",
        errorMessage:
          error instanceof Error
            ? error.message
            : "Failed to apply the Stripe refund to the donation record.",
      };
    }

    return {
      provider: "stripe",
      status: "succeeded",
      referenceId: refund.id,
    };
  }

  // Do not imply finality before Stripe confirms: pending refunds get no
  // local write; the charge.refunded webhook converges the record later.
  const providerStatus = refund.status ?? "pending";
  if (providerStatus === "pending") {
    return {
      provider: "stripe",
      status: "pending",
      referenceId: refund.id,
    };
  }

  // failed / canceled / requires_action — surface the provider status
  // honestly with no local write.
  return {
    provider: "stripe",
    status: providerStatus,
    referenceId: refund.id,
    errorCode: refund.failure_reason ?? null,
  };
}
