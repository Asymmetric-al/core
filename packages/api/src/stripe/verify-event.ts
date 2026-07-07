import type Stripe from "stripe";

/**
 * Stripe webhook signature verification (money path).
 *
 * Wraps `stripe.webhooks.constructEvent` with typed failure reasons so the
 * route handler maps them to the right status and never processes an unverified
 * event. Single-sourced so the verification structure is unit-testable with the
 * SDK's `generateTestHeaderString` (no live signing secret needed for that).
 */

export type StripeWebhookVerificationReason =
  | "missing_signature"
  | "not_configured"
  | "invalid_signature";

export class StripeWebhookVerificationError extends Error {
  constructor(
    readonly reason: StripeWebhookVerificationReason,
    message: string,
  ) {
    super(message);
    this.name = "StripeWebhookVerificationError";
  }
}

export function constructVerifiedStripeEvent(params: {
  stripe: Stripe;
  rawBody: string;
  signature: string | null;
  secret: string | undefined;
}): Stripe.Event {
  if (!params.signature) {
    throw new StripeWebhookVerificationError(
      "missing_signature",
      "Missing Stripe signature.",
    );
  }
  if (!params.secret) {
    throw new StripeWebhookVerificationError(
      "not_configured",
      "Stripe webhook is not configured.",
    );
  }

  try {
    return params.stripe.webhooks.constructEvent(
      params.rawBody,
      params.signature,
      params.secret,
    );
  } catch {
    throw new StripeWebhookVerificationError(
      "invalid_signature",
      "Invalid Stripe signature.",
    );
  }
}
