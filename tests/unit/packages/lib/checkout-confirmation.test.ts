import { describe, expect, it } from "vitest";

import {
  STRIPE_PAYMENT_INTENT_STATUSES,
  decideCheckoutOutcome,
  mapStripePaymentIntentStatus,
} from "../../../../packages/lib/payments/checkout-confirmation";

/**
 * Public-giving WIRING — server-confirmed checkout outcome contract.
 *
 * The mock checkout used to fabricate "success" from a client-side timer.
 * These tests pin the replacement rule: a checkout may only be shown as
 * successful when the SERVER's Stripe PaymentIntent status supports it. The
 * client never decides success on its own.
 */

describe("mapStripePaymentIntentStatus", () => {
  it("maps a server-confirmed succeeded PI to a completed donation", () => {
    expect(mapStripePaymentIntentStatus("succeeded")).toBe("completed");
  });

  it("maps an in-flight processing PI to processing (e.g. ACH)", () => {
    expect(mapStripePaymentIntentStatus("processing")).toBe("processing");
  });

  it("maps requires_action to an action-needed state", () => {
    expect(mapStripePaymentIntentStatus("requires_action")).toBe(
      "requires_action",
    );
  });

  it("maps a fresh requires_confirmation PI to pending (created, not paid)", () => {
    expect(mapStripePaymentIntentStatus("requires_confirmation")).toBe(
      "pending",
    );
  });

  it("treats requires_payment_method WITH a last payment error as failed", () => {
    expect(
      mapStripePaymentIntentStatus("requires_payment_method", {
        hasLastPaymentError: true,
      }),
    ).toBe("failed");
  });

  it("treats a fresh requires_payment_method (no attempt yet) as pending", () => {
    expect(mapStripePaymentIntentStatus("requires_payment_method")).toBe(
      "pending",
    );
  });

  it("maps a canceled PI to failed", () => {
    expect(mapStripePaymentIntentStatus("canceled")).toBe("failed");
  });

  it("maps requires_capture (authorized, not captured) to processing", () => {
    expect(mapStripePaymentIntentStatus("requires_capture")).toBe("processing");
  });
});

describe("decideCheckoutOutcome (server truth only)", () => {
  it("shows a successful, final confirmation for a succeeded PI", () => {
    const outcome = decideCheckoutOutcome({ paymentIntentStatus: "succeeded" });
    expect(outcome.state).toBe("completed");
    expect(outcome.isSuccess).toBe(true);
    expect(outcome.showConfirmation).toBe(true);
    expect(outcome.description.isFinal).toBe(true);
  });

  it("shows an honest, NON-final pending confirmation for processing ACH", () => {
    const outcome = decideCheckoutOutcome({
      paymentIntentStatus: "processing",
      rail: "ach_debit",
    });
    expect(outcome.state).toBe("processing");
    expect(outcome.isSuccess).toBe(false);
    expect(outcome.showConfirmation).toBe(true);
    expect(outcome.description.isFinal).toBe(false);
    expect(outcome.description.label).toBe("Processing");
  });

  it("does NOT show confirmation for non-final card or wallet processing states", () => {
    for (const rail of ["card", "wallet"] as const) {
      const outcome = decideCheckoutOutcome({
        paymentIntentStatus: "processing",
        rail,
      });

      expect(outcome.state).toBe("processing");
      expect(outcome.isSuccess).toBe(false);
      expect(outcome.showConfirmation).toBe(false);
    }
  });

  it("does NOT show confirmation for requires_capture authorizations", () => {
    for (const rail of ["card", "wallet", "ach_debit", "unknown"] as const) {
      const outcome = decideCheckoutOutcome({
        paymentIntentStatus: "requires_capture",
        rail,
      });

      expect(outcome.state).toBe("processing");
      expect(outcome.isSuccess).toBe(false);
      expect(outcome.showConfirmation).toBe(false);
    }
  });

  it("does NOT show success/confirmation when action is still required", () => {
    const outcome = decideCheckoutOutcome({
      paymentIntentStatus: "requires_action",
    });
    expect(outcome.isSuccess).toBe(false);
    expect(outcome.showConfirmation).toBe(false);
  });

  it("does NOT show confirmation for a pending payment", () => {
    const outcome = decideCheckoutOutcome({
      paymentIntentStatus: "requires_confirmation",
    });

    expect(outcome.state).toBe("pending");
    expect(outcome.isSuccess).toBe(false);
    expect(outcome.showConfirmation).toBe(false);
  });

  it("does NOT show success when the payment failed", () => {
    const outcome = decideCheckoutOutcome({
      paymentIntentStatus: "requires_payment_method",
      hasLastPaymentError: true,
    });
    expect(outcome.state).toBe("failed");
    expect(outcome.isSuccess).toBe(false);
    expect(outcome.showConfirmation).toBe(false);
  });

  it("fails safe (non-success, no confirmation) on an out-of-contract status", () => {
    const outcome = decideCheckoutOutcome({
      // Force an invalid value past the type to simulate a malformed payload.
      paymentIntentStatus: "totally_unknown" as never,
    });
    expect(outcome.isSuccess).toBe(false);
    expect(outcome.showConfirmation).toBe(false);
    // Must still return a usable description (no undefined → no UI crash).
    expect(outcome.description).toBeTruthy();
    expect(typeof outcome.description.label).toBe("string");
  });

  it("INVARIANT: no PI status other than 'succeeded' is ever reported as success", () => {
    for (const status of STRIPE_PAYMENT_INTENT_STATUSES) {
      const outcome = decideCheckoutOutcome({ paymentIntentStatus: status });
      if (status === "succeeded") {
        expect(outcome.isSuccess).toBe(true);
      } else {
        expect(outcome.isSuccess).toBe(false);
      }
    }
  });
});
