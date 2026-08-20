import type { GiftProcessingFeeStripeMetadata } from "./fee-policy";
import type Stripe from "stripe";

export type DonationPaymentIntentMethodType = "card" | "us_bank_account";

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
  gift_amount_cents?: string;
  cover_fees?: string;
  payment_method?: string;
  cover_amount_cents?: string;
  estimated_fee_cents?: string;
}

export const GIFT_PROCESSING_FEE_METADATA_KEYS = [
  "gift_amount_cents",
  "cover_fees",
  "payment_method",
  "cover_amount_cents",
  "estimated_fee_cents",
] as const;

export function pickGiftProcessingFeeMetadata(
  extra: GiftProcessingFeeStripeMetadata | Record<string, string> | undefined,
): Partial<DonationPaymentIntentMetadata> {
  if (!extra) {
    return {};
  }

  const picked: Partial<DonationPaymentIntentMetadata> = {};
  const record = extra as Record<string, string>;

  for (const key of GIFT_PROCESSING_FEE_METADATA_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) {
      picked[key] = value;
    }
  }

  return picked;
}

export function mergeDonationPaymentIntentMetadata(input: {
  donationId: string;
  donorId: string;
  missionaryId: string;
  fundId: string;
  tenantId: string;
  actorUserId: string;
  extra?: GiftProcessingFeeStripeMetadata | Record<string, string>;
}): DonationPaymentIntentMetadata {
  return {
    ...pickGiftProcessingFeeMetadata(input.extra),
    donation_id: input.donationId,
    donor_id: input.donorId,
    missionary_id: input.missionaryId,
    fund_id: input.fundId,
    tenant_id: input.tenantId,
    user_id: input.actorUserId,
  };
}

export interface DonationPaymentIntentParams {
  /** Amount in the currency's MINOR units (e.g. cents). Must be a positive integer. */
  amountCents: number;
  currency: string;
  metadata: DonationPaymentIntentMetadata;
  /** Raw saga idempotency key; namespaced here so it can't collide with other calls. */
  idempotencyKey: string;
  customerId?: string;
  /**
   * Gift intake binds the PaymentIntent to the quoted method. Recovery and
   * batch workers omit this and keep Stripe's automatic payment methods.
   */
  paymentMethodTypes?: ReadonlyArray<DonationPaymentIntentMethodType>;
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

  const paymentMethodTypes =
    params.paymentMethodTypes && params.paymentMethodTypes.length > 0
      ? [...params.paymentMethodTypes]
      : undefined;

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: params.amountCents,
      currency: params.currency.toLowerCase(),
      ...(params.customerId ? { customer: params.customerId } : {}),
      ...(paymentMethodTypes
        ? { payment_method_types: paymentMethodTypes }
        : { automatic_payment_methods: { enabled: true } }),
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
