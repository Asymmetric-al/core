import Stripe from "stripe";

/**
 * The single pinned Stripe API version for every server-side Stripe client.
 * Bumping this is a one-line change, but remember the webhook caveat: Stripe
 * webhook endpoints have their own pinned version in the Stripe dashboard,
 * and event payload shapes follow the endpoint version, not this constant
 * (e.g. basil moved invoice.subscription under parent.subscription_details).
 */
export const STRIPE_API_VERSION = "2025-02-24.acacia";

export function getStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
}
