import { describe, expect, it } from "vitest";

import { createStripeClient } from "../../src/stripe/client";
import {
  StripeWebhookVerificationError,
  constructVerifiedStripeEvent,
} from "../../src/stripe/verify-event";

/**
 * TDD — Stripe webhook signature-verification structure (money path).
 * Uses the SDK's generateTestHeaderString so the verification path is proven
 * locally with a TEST secret; the REAL endpoint verify against a live webhook
 * signing secret is BLOCKED (signing secret not yet provisioned).
 */

// The API key is irrelevant to signing (constructEvent/generateTestHeaderString
// HMAC the raw signing value) — use a non-sensitive placeholder.
const stripe = createStripeClient("stripe-client-placeholder");
const HMAC_FIXTURE = "hmac-fixture-value";

function signedPayload(payload: string) {
  return stripe.webhooks.generateTestHeaderString({
    payload,
    secret: HMAC_FIXTURE,
  });
}

describe("constructVerifiedStripeEvent", () => {
  const payload = JSON.stringify({
    id: "evt_1",
    object: "event",
    type: "payment_intent.succeeded",
    data: { object: { id: "pi_1" } },
  });

  it("accepts a correctly signed payload and returns the parsed event", () => {
    const event = constructVerifiedStripeEvent({
      stripe,
      rawBody: payload,
      signature: signedPayload(payload),
      secret: HMAC_FIXTURE,
    });
    expect(event.type).toBe("payment_intent.succeeded");
    expect(event.id).toBe("evt_1");
  });

  it("rejects a tampered payload as invalid_signature", () => {
    const signature = signedPayload(payload);
    expect(() =>
      constructVerifiedStripeEvent({
        stripe,
        rawBody: payload.replace("pi_1", "pi_ATTACKER"),
        signature,
        secret: HMAC_FIXTURE,
      }),
    ).toThrow(StripeWebhookVerificationError);
    try {
      constructVerifiedStripeEvent({
        stripe,
        rawBody: payload.replace("pi_1", "pi_ATTACKER"),
        signature,
        secret: HMAC_FIXTURE,
      });
    } catch (error) {
      expect((error as StripeWebhookVerificationError).reason).toBe(
        "invalid_signature",
      );
    }
  });

  it("rejects a missing signature header", () => {
    try {
      constructVerifiedStripeEvent({
        stripe,
        rawBody: payload,
        signature: null,
        secret: HMAC_FIXTURE,
      });
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(StripeWebhookVerificationError);
      expect((error as StripeWebhookVerificationError).reason).toBe(
        "missing_signature",
      );
    }
  });

  it("reports not_configured when the signing secret is absent", () => {
    try {
      constructVerifiedStripeEvent({
        stripe,
        rawBody: payload,
        signature: signedPayload(payload),
        secret: undefined,
      });
      throw new Error("should have thrown");
    } catch (error) {
      expect((error as StripeWebhookVerificationError).reason).toBe(
        "not_configured",
      );
    }
  });
});
