/**
 * Client-safe checkout orchestration.
 *
 * Submits a donation and derives the shown outcome from the SERVER-returned
 * PaymentIntent status via `decideCheckoutOutcome`. The network call + Stripe
 * confirmation are provided as an injected `transport` so this orchestration is
 * unit-testable with a mocked money path and carries no server-only imports.
 *
 * Invariant: success is only ever reported when the transport returns a
 * server-confirmed `succeeded` status. A transport error is surfaced honestly
 * as a non-success outcome — never a fabricated success.
 */
import {
  decideCheckoutOutcome,
  type CheckoutOutcome,
  type StripePaymentIntentStatus,
} from "./checkout-confirmation";

import type { PaymentRail } from "./payment-status-language";

export interface CheckoutDonor {
  email: string;
  firstName: string;
  lastName: string;
}

export interface CheckoutPaymentRequest {
  amountCents: number;
  currency: string;
  missionaryId?: string | null;
  fundId?: string | null;
  frequency: "one-time" | "monthly";
  rail: PaymentRail;
  donor: CheckoutDonor;
  /** True when the donor chose to give anonymously (public/missionary redaction). */
  isAnonymous?: boolean;
}

/**
 * The server-confirmed result of submitting + confirming a payment. Returned by
 * the injected transport (which posts to the money endpoint and confirms via
 * Stripe). Only the PaymentIntent status is trusted for the success decision.
 */
export interface CheckoutTransportResult {
  paymentIntentStatus: StripePaymentIntentStatus;
  hasLastPaymentError?: boolean;
  donationId?: string;
  paymentIntentId?: string;
}

export type CheckoutTransport = (
  request: CheckoutPaymentRequest,
) => Promise<CheckoutTransportResult>;

export interface ConfirmCheckoutPaymentDeps {
  transport: CheckoutTransport;
}

export interface ConfirmCheckoutPaymentResult {
  /**
   * True when the checkout may advance to its confirmation screen — a
   * server-confirmed collected gift OR an honestly-pending rail (e.g. ACH
   * processing). Use `outcome.isSuccess` for the strict "funds collected" flag.
   * A transport error or a requires_action/failed status is `ok: false`.
   */
  ok: boolean;
  outcome: CheckoutOutcome;
  donationId?: string;
  paymentIntentId?: string;
  /** Present when the money path could not be reached or reported a problem. */
  error?: string;
}

/** A neutral non-success outcome used when the transport never returned Stripe status. */
function indeterminateOutcome(): CheckoutOutcome {
  return {
    state: "pending",
    isSuccess: false,
    showConfirmation: false,
    description: {
      label: "Payment not confirmed",
      message:
        "We could not confirm this payment. Please try again or use a different payment method.",
      tone: "attention",
      isFinal: false,
    },
  };
}

export async function confirmCheckoutPayment(
  request: CheckoutPaymentRequest,
  { transport }: ConfirmCheckoutPaymentDeps,
): Promise<ConfirmCheckoutPaymentResult> {
  let result: CheckoutTransportResult;
  try {
    result = await transport(request);
  } catch (cause) {
    return {
      ok: false,
      outcome: indeterminateOutcome(),
      error:
        cause instanceof Error
          ? cause.message
          : "Payment could not be completed.",
    };
  }

  const outcome = decideCheckoutOutcome({
    paymentIntentStatus: result.paymentIntentStatus,
    rail: request.rail,
    hasLastPaymentError: result.hasLastPaymentError,
  });

  return {
    ok: outcome.showConfirmation,
    outcome,
    donationId: result.donationId,
    paymentIntentId: result.paymentIntentId,
  };
}
