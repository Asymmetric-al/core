/**
 * Pinned Stripe API version for every server-side Stripe client in this package.
 *
 * This must stay equal to the `stripe` SDK's built-in API version. Each
 * `new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION })` call passes this
 * value into `StripeConfig["apiVersion"]`, which the SDK types as its pinned
 * `LatestApiVersion`. If a future SDK upgrade advances that pinned version, this
 * literal stops typechecking at those call sites — a deliberate prompt to review
 * the API deltas (https://docs.stripe.com/changelog) before advancing the pin.
 *
 * Current value matches `stripe@22.x` (`ApiVersion = "2026-05-27.dahlia"`).
 */
export const STRIPE_API_VERSION = "2026-05-27.dahlia";
