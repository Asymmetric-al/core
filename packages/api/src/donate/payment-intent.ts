import type Stripe from "stripe";

/**
 * Server-side PaymentIntent leg of the donate flow (money path).
 *
 * Pure over an injected Stripe client — NO database access. The donation saga
 * and the (DB-blocked) guest checkout path both create their PaymentIntent
 * through this one function so the Stripe call is single-sourced, idempotent,
 * and integration-testable against the real Stripe TEST API in isolation.
 */

export interface DonationPaymentIntentMetadata {
  donation_id: string;
  donor_id?: string;
  missionary_id?: string;
  fund_id?: string;
  tenant_id?: string;
  user_id?: string;
}

export interface DonationPaymentIntentParams {
  /** Amount in the currency's MINOR units (e.g. cents). Must be a positive integer. */
  amountCents: number;
  currency: string;
  metadata: DonationPaymentIntentMetadata;
  /** Raw saga idempotency key; namespaced here so it can't collide with other calls. */
  idempotencyKey: string;
  customerId?: string;
}

export interface DonationPaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string | null;
  status: Stripe.PaymentIntent.Status;
  amountCents: number;
  currency: string;
}

/** Stripe metadata values must be strings; drop undefined keys. */
function toStripeMetadata(
  metadata: DonationPaymentIntentMetadata,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value !== undefined && value !== null) {
      out[key] = String(value);
    }
  }
  return out;
}

export async function createDonationPaymentIntent(
  stripe: Stripe,
  params: DonationPaymentIntentParams,
): Promise<DonationPaymentIntentResult> {
  if (!Number.isInteger(params.amountCents) || params.amountCents <= 0) {
    throw new Error(
      "PaymentIntent amount must be a positive integer in minor units",
    );
  }

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: params.amountCents,
      currency: params.currency.toLowerCase(),
      ...(params.customerId ? { customer: params.customerId } : {}),
      automatic_payment_methods: { enabled: true },
      metadata: toStripeMetadata(params.metadata),
    },
    { idempotencyKey: `${params.idempotencyKey}:payment_intent` },
  );

  return {
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    status: paymentIntent.status,
    amountCents: paymentIntent.amount,
    currency: paymentIntent.currency,
  };
}
