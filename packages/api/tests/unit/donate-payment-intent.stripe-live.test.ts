import { describe, expect, it } from "vitest";

import { createDonationPaymentIntent } from "../../src/donate/payment-intent";
import { createStripeClient } from "../../src/stripe/client";

/**
 * [stripe-integration] Exercises the REAL Stripe TEST API.
 * Skipped unless STRIPE_SECRET_KEY is set (a Stripe test-mode secret key), e.g.:
 *   STRIPE_SECRET_KEY="$(cat ~/.eve-secrets/stripe-test-sk.txt)" \
 *     node_modules/.bin/vitest run packages/api/tests/unit/donate-payment-intent.stripe-live.test.ts
 * The secret is consumed only via env — never logged or committed.
 */

const secret = process.env.STRIPE_SECRET_KEY ?? "";

describe.skipIf(!secret)(
  "[stripe-integration] createDonationPaymentIntent — real Stripe TEST",
  () => {
    it("creates a livemode=false PaymentIntent with amount + metadata, then retrieves it", async () => {
      const stripe = createStripeClient(secret);
      const idempotencyKey = `eve-int-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      const result = await createDonationPaymentIntent(stripe, {
        amountCents: 1234,
        currency: "usd",
        idempotencyKey,
        metadata: {
          donation_id: "int-test-donation",
          fund_id: "int-test-fund",
          tenant_id: "int-test-tenant",
        },
      });

      try {
        expect(result.paymentIntentId).toMatch(/^pi_/);
        expect(result.clientSecret).toMatch(/_secret_/);
        expect(result.amountCents).toBe(1234);
        expect(result.currency).toBe("usd");

        const retrieved = await stripe.paymentIntents.retrieve(
          result.paymentIntentId,
        );
        expect(retrieved.livemode).toBe(false);
        expect(retrieved.amount).toBe(1234);
        expect(retrieved.currency).toBe("usd");
        expect(retrieved.metadata.donation_id).toBe("int-test-donation");
        expect(retrieved.metadata.fund_id).toBe("int-test-fund");
        expect(retrieved.metadata.tenant_id).toBe("int-test-tenant");

        // Idempotency: same key returns the same PaymentIntent, not a new charge.
        const replay = await createDonationPaymentIntent(stripe, {
          amountCents: 1234,
          currency: "usd",
          idempotencyKey,
          metadata: {
            donation_id: "int-test-donation",
            fund_id: "int-test-fund",
            tenant_id: "int-test-tenant",
          },
        });
        expect(replay.paymentIntentId).toBe(result.paymentIntentId);
      } finally {
        // Clean up the test-mode intent (best effort).
        await stripe.paymentIntents
          .cancel(result.paymentIntentId)
          .catch(() => undefined);
      }
    });
  },
);
