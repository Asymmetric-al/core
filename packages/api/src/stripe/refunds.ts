import { markStagedGiftRefunded } from "../giving/staged-gifts";

import type { StripeWebhookOutcome } from "./webhooks";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type Stripe from "stripe";

/**
 * Stripe refund provider helpers.
 *
 * This module owns the convergent "apply a refunded charge to the donation
 * record" write shared by the webhook path (`charge.refunded`) and the admin
 * refund action, plus the raw Stripe refund creation call. It intentionally
 * has no contribution-operations imports so provider plumbing stays separate
 * from workflow policy.
 */

interface DonationWebhookRow {
  id: string;
  tenant_id: string | null;
  donor_id: string | null;
  missionary_id: string | null;
  fund_id: string | null;
  amount: number;
  currency: string | null;
  status: string;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_refund_ids: string[] | null;
}

export function getStripeObjectId(
  value: string | { id?: string | null } | null | undefined,
) {
  if (typeof value === "string") {
    return value.length > 0 ? value : null;
  }

  if (value && typeof value.id === "string" && value.id.length > 0) {
    return value.id;
  }

  return null;
}

export async function findDonationByPaymentIntentId(
  supabaseAdmin: AdminSupabaseClient,
  paymentIntentId: string,
) {
  const { data, error } = await supabaseAdmin
    .from("donations")
    .select(
      "id, tenant_id, donor_id, missionary_id, fund_id, amount, currency, status, stripe_payment_intent_id, stripe_charge_id, stripe_refund_ids",
    )
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as DonationWebhookRow | null;
}

export async function updateDonation(
  supabaseAdmin: AdminSupabaseClient,
  donationId: string,
  values: Record<string, unknown>,
) {
  const { error } = await supabaseAdmin
    .from("donations")
    .update(values)
    .eq("id", donationId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Merges the Stripe refund ids already stored on the donation with the ids
 * the provider reported for this convergence pass (the charge's embedded
 * refund list plus any refund ids the caller knows directly, e.g. the refund
 * the admin action just created).
 *
 * This is a UNION, not a replace: Stripe's embedded `charge.refunds` list is
 * not guaranteed to be complete — newer API versions omit it unless expanded,
 * and the expanded list is truncated when a charge has many refunds
 * (`has_more`). Replacing would silently drop known ids in those cases, so
 * the honest convergent set is "everything we have ever observed". Refund
 * ids are provider proof pointers only; `refund_amount` remains the absolute
 * financial truth.
 */
export function mergeStripeRefundIds(input: {
  existingIds: readonly string[] | null | undefined;
  charge: Stripe.Charge;
  knownRefundIds?: readonly string[];
}): string[] {
  const chargeRefundIds = (input.charge.refunds?.data ?? [])
    .map((refund) => getStripeObjectId(refund))
    .filter((id): id is string => id !== null);

  const merged: string[] = [];
  const seen = new Set<string>();
  const candidateIds = [
    ...(input.existingIds ?? []),
    ...chargeRefundIds,
    ...(input.knownRefundIds ?? []),
  ];
  for (const id of candidateIds) {
    if (typeof id !== "string" || id.length === 0 || seen.has(id)) {
      continue;
    }
    seen.add(id);
    merged.push(id);
  }

  return merged;
}

/**
 * Applies a refunded Stripe charge to the donation record with an absolute,
 * convergent write: `refund_amount` mirrors `charge.amount_refunded`, a full
 * refund flips the status to "refunded", `stripe_refund_ids` converges to the
 * union of observed refund ids, and the staged gift workflow record is marked
 * refunded. Safe to run from both the webhook and admin paths.
 */
export async function applyRefundedChargeToDonation(
  supabaseAdmin: AdminSupabaseClient,
  charge: Stripe.Charge,
  options: {
    /**
     * Refund ids the caller already holds (e.g. the refund the admin action
     * just created) so convergence never depends on the charge's possibly
     * absent embedded refund list.
     */
    knownRefundIds?: readonly string[];
  } = {},
): Promise<StripeWebhookOutcome> {
  const paymentIntentId = getStripeObjectId(charge.payment_intent);
  if (!paymentIntentId) {
    return {
      action: "charge_refund_missing_payment_intent",
      handled: true,
      reason: "Stripe charge did not include a payment intent.",
    } satisfies StripeWebhookOutcome;
  }

  const donation = await findDonationByPaymentIntentId(
    supabaseAdmin,
    paymentIntentId,
  );

  if (!donation) {
    return {
      action: "charge_refund_not_matched",
      handled: true,
      paymentIntentId,
      reason: "No donation matched the refunded Stripe charge.",
    } satisfies StripeWebhookOutcome;
  }

  const timestamp = new Date().toISOString();
  const refundAmount = charge.amount_refunded ?? 0;
  const isFullRefund = refundAmount >= donation.amount;

  await updateDonation(supabaseAdmin, donation.id, {
    refund_amount: refundAmount,
    refunded_at: refundAmount > 0 ? timestamp : null,
    status: isFullRefund ? "refunded" : donation.status,
    stripe_charge_id: charge.id,
    stripe_refund_ids: mergeStripeRefundIds({
      existingIds: donation.stripe_refund_ids,
      charge,
      knownRefundIds: options.knownRefundIds,
    }),
    updated_at: timestamp,
  });
  const stagedGift = await markStagedGiftRefunded({
    supabaseAdmin,
    donationId: donation.id,
    tenantId: donation.tenant_id,
    stripeChargeId: charge.id,
    fullRefund: isFullRefund,
  });

  return {
    action: isFullRefund ? "charge_refunded" : "charge_partially_refunded",
    donationId: donation.id,
    handled: true,
    paymentIntentId,
    stagedGiftId: stagedGift?.id ?? null,
  } satisfies StripeWebhookOutcome;
}

/**
 * Minimal structural surface of the Stripe SDK used by refund creation and
 * the live-charge remaining check. A full `Stripe` client satisfies this;
 * tests can inject a small stub.
 */
export interface StripeRefundsApi {
  refunds: {
    create(
      params: Stripe.RefundCreateParams,
      options: Stripe.RequestOptions,
    ): Promise<Stripe.Refund>;
  };
  charges: {
    retrieve(id: string): Promise<Stripe.Charge>;
  };
  paymentIntents: {
    retrieve(
      id: string,
      params?: Stripe.PaymentIntentRetrieveParams,
    ): Promise<Stripe.PaymentIntent>;
  };
}

export interface RetrieveLiveChargeForRefundInput {
  stripe: StripeRefundsApi;
  paymentIntentId: string | null;
  chargeId: string | null;
}

/**
 * Retrieves the live Stripe charge backing a refund target so callers can
 * validate against provider truth. Stripe counts pending refunds into
 * `charge.amount_refunded` immediately, so
 * `charge.amount - charge.amount_refunded` is the authority on what actually
 * remains refundable even when the local record has not converged yet.
 * Returns `null` when the payment intent has no charge to inspect; the
 * refund creation call then surfaces provider truth itself.
 */
export async function retrieveLiveChargeForRefund(
  input: RetrieveLiveChargeForRefundInput,
): Promise<Stripe.Charge | null> {
  if (input.chargeId) {
    return input.stripe.charges.retrieve(input.chargeId);
  }

  if (!input.paymentIntentId) {
    return null;
  }

  const paymentIntent = await input.stripe.paymentIntents.retrieve(
    input.paymentIntentId,
    { expand: ["latest_charge"] },
  );
  const latestCharge = paymentIntent.latest_charge;
  if (typeof latestCharge === "object" && latestCharge !== null) {
    return latestCharge;
  }

  return null;
}

export interface CreateStripeRefundInput {
  stripe: StripeRefundsApi;
  paymentIntentId: string | null;
  chargeId: string | null;
  amountCents: number;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

/**
 * Creates a Stripe refund against the payment intent (preferred) or charge.
 * The caller idempotency key is namespaced with `:refund` so a retried admin
 * action maps to the same Stripe refund attempt.
 */
export async function createStripeRefund(
  input: CreateStripeRefundInput,
): Promise<{ refund: Stripe.Refund; charge: Stripe.Charge | null }> {
  if (!input.paymentIntentId && !input.chargeId) {
    throw new Error(
      "A Stripe payment intent id or charge id is required to create a refund.",
    );
  }

  const target: Pick<Stripe.RefundCreateParams, "payment_intent" | "charge"> =
    input.paymentIntentId
      ? { payment_intent: input.paymentIntentId }
      : { charge: input.chargeId ?? undefined };

  const refund = await input.stripe.refunds.create(
    {
      ...target,
      amount: input.amountCents,
      metadata: input.metadata,
      expand: ["charge"],
    },
    { idempotencyKey: `${input.idempotencyKey}:refund` },
  );

  const charge =
    typeof refund.charge === "object" && refund.charge !== null
      ? refund.charge
      : null;

  return { refund, charge };
}

/**
 * Stripe error types that are AMBIGUOUS: the request may or may not have
 * been processed (connection dropped, Stripe 5xx, idempotency conflict).
 * Stripe's guidance is to retry these with the SAME idempotency key so the
 * original attempt replays safely. Callers must never record them as
 * definitive provider failures.
 */
const AMBIGUOUS_STRIPE_ERROR_TYPES: ReadonlySet<string> = new Set([
  "StripeConnectionError",
  "StripeAPIError",
  "StripeIdempotencyError",
]);

export interface DescribedStripeRefundError {
  errorCode: string;
  errorMessage: string;
  /**
   * True when Stripe may or may not have processed the refund. Ambiguous
   * errors must be retried with the same idempotency key, not recorded as
   * terminal failures.
   */
  ambiguous: boolean;
}

/**
 * Describes a Stripe SDK error as a provider outcome error pair plus an
 * ambiguity classification. Returns `null` for non-Stripe errors so the
 * caller rethrows them instead of recording an inaccurate provider failure.
 */
export function describeStripeRefundError(
  error: unknown,
): DescribedStripeRefundError | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const candidate = error as {
    type?: unknown;
    rawType?: unknown;
    code?: unknown;
    message?: unknown;
  };
  const errorType = typeof candidate.type === "string" ? candidate.type : null;
  if (!errorType) {
    return null;
  }

  const looksLikeStripeError =
    errorType.startsWith("Stripe") || typeof candidate.rawType === "string";
  if (!looksLikeStripeError) {
    return null;
  }

  const errorCode =
    typeof candidate.code === "string" && candidate.code.length > 0
      ? candidate.code
      : errorType;
  const errorMessage =
    typeof candidate.message === "string" && candidate.message.length > 0
      ? candidate.message
      : "Stripe rejected the refund request.";

  return {
    errorCode,
    errorMessage,
    ambiguous: AMBIGUOUS_STRIPE_ERROR_TYPES.has(errorType),
  };
}
