/**
 * Server-confirmed checkout outcome contract (client-safe).
 *
 * The public donor checkout must NOT decide success on its own — the previous
 * mock flipped to a "success" screen after a client-side timer, which is a lie
 * in a money flow. This module derives the donor-facing outcome from the
 * SERVER's Stripe PaymentIntent status, reusing the shared payment vocabulary in
 * `./payment-status-language` ("Stripe is the payment authority").
 *
 * Pure + client-safe: no Stripe SDK, no network, no server-only imports.
 */
import {
  describeDonationPaymentStatus,
  type DonationPaymentState,
  type PaymentRail,
  type PaymentStatusDescription,
} from "./payment-status-language";

/**
 * The Stripe PaymentIntent lifecycle statuses. Kept as a local literal union so
 * this stays a client-safe module (no `stripe` SDK import); the values mirror
 * `Stripe.PaymentIntent.Status`.
 */
export const STRIPE_PAYMENT_INTENT_STATUSES = [
  "requires_payment_method",
  "requires_confirmation",
  "requires_action",
  "processing",
  "requires_capture",
  "canceled",
  "succeeded",
] as const;

export type StripePaymentIntentStatus =
  (typeof STRIPE_PAYMENT_INTENT_STATUSES)[number];

export interface MapStripeStatusOptions {
  /**
   * True when the PaymentIntent carries a `last_payment_error` — i.e. a payment
   * was attempted and declined. A `requires_payment_method` PI means "no usable
   * method": a fresh one is still `pending`; one that just failed is `failed`.
   */
  hasLastPaymentError?: boolean;
}

/** Map a server-truth Stripe PaymentIntent status to a shared donation state. */
export function mapStripePaymentIntentStatus(
  status: StripePaymentIntentStatus,
  options: MapStripeStatusOptions = {},
): DonationPaymentState {
  // Fail safe on an out-of-contract value (a raw cast, a malformed transport
  // payload, or a future Stripe status): never claim success — treat as pending.
  // The switch below stays exhaustive over the validated union for TS.
  if (!STRIPE_PAYMENT_INTENT_STATUSES.includes(status)) {
    return "pending";
  }
  switch (status) {
    case "succeeded":
      return "completed";
    case "processing":
    case "requires_capture":
      // requires_capture = authorized but not yet captured — not final money.
      return "processing";
    case "requires_action":
      return "requires_action";
    case "requires_confirmation":
      return "pending";
    case "requires_payment_method":
      return options.hasLastPaymentError ? "failed" : "pending";
    case "canceled":
      return "failed";
  }
}

export interface DecideCheckoutOutcomeInput {
  paymentIntentStatus: StripePaymentIntentStatus;
  rail?: PaymentRail;
  hasLastPaymentError?: boolean;
  audience?: "donor" | "staff";
}

export interface CheckoutOutcome {
  /** Shared donation state derived from the server PaymentIntent status. */
  state: DonationPaymentState;
  /** True ONLY for a server-confirmed, finally-collected gift (`completed`). */
  isSuccess: boolean;
  /**
   * True when the checkout may advance to its confirmation screen: a collected
   * gift (`completed`) OR an honestly-pending rail (`processing`, e.g. ACH). It
   * is NEVER true for requires_action / failed — the donor stays on the payment
   * step to finish or retry.
   */
  showConfirmation: boolean;
  /** Truthful donor/staff copy for the state (calm, rail-aware). */
  description: PaymentStatusDescription;
}

/**
 * Decide what the checkout may show, from server truth only. This is the direct
 * replacement for the old client-timer "success": the confirmation screen and
 * any success claim are gated on the Stripe PaymentIntent status.
 */
export function decideCheckoutOutcome({
  paymentIntentStatus,
  rail = "unknown",
  hasLastPaymentError,
  audience = "donor",
}: DecideCheckoutOutcomeInput): CheckoutOutcome {
  const state = mapStripePaymentIntentStatus(paymentIntentStatus, {
    hasLastPaymentError,
  });
  const description = describeDonationPaymentStatus({ state, rail, audience });
  const isSuccess = state === "completed";
  const showConfirmation = state === "completed" || state === "processing";
  return { state, isSuccess, showConfirmation, description };
}
