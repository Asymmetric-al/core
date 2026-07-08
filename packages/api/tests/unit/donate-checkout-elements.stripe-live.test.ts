import { describe, expect, it } from "vitest";

import { createDonationPaymentIntent } from "../../src/donate/payment-intent";
import { createStripeClient } from "../../src/stripe/client";

/**
 * [stripe-integration] Client-Elements leg end-to-end scaffold.
 * Skipped unless BOTH NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY
 * are set — so it auto-runs green the moment Blake's test keys land:
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." \
 *   STRIPE_SECRET_KEY="$(cat ~/.eve-secrets/stripe-test-sk.txt)" \
 *     node_modules/.bin/vitest run packages/api/tests/unit/donate-checkout-elements.stripe-live.test.ts
 *
 * Verifies the server leg mints a real client_secret (what <PaymentElement>
 * mounts on) and that a publishable key is present. The actual card entry +
 * confirmPayment must run in a browser → BLOCKED-FOR-PLAYWRIGHT (documented).
 * Secrets consumed via env only; never logged or committed.
 */

const envPk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const envSk = process.env.STRIPE_SECRET_KEY ?? "";

describe.skipIf(!envPk || !envSk)(
  "[stripe-integration] checkout Elements leg — real Stripe TEST",
  () => {
    it("server leg mints a client_secret the PaymentElement can mount on", async () => {
      const stripe = createStripeClient(envSk);
      const idempotencyKey = `eve-elements-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      const result = await createDonationPaymentIntent(stripe, {
        amountCents: 2500,
        currency: "usd",
        idempotencyKey,
        metadata: { donation_id: "int-elements", fund_id: "int-fund" },
      });

      try {
        // A non-null client_secret is exactly what <Elements options={{ clientSecret }}> needs.
        expect(result.clientSecret).toMatch(/_secret_/);
        expect(result.paymentIntentId).toMatch(/^pi_/);
        expect(result.amountCents).toBe(2500);

        const retrieved = await stripe.paymentIntents.retrieve(
          result.paymentIntentId,
        );
        expect(retrieved.livemode).toBe(false);
      } finally {
        await stripe.paymentIntents
          .cancel(result.paymentIntentId)
          .catch(() => undefined);
      }
    });

    it("a publishable key is present so Elements can render (pk_ prefix)", () => {
      expect(envPk.startsWith("pk_")).toBe(true);
      // Card entry + stripe.confirmPayment run in a browser only →
      // real end-to-end capture is BLOCKED-FOR-PLAYWRIGHT.
    });
  },
);
