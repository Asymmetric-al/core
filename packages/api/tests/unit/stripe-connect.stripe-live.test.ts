import { describe, expect, it } from "vitest";

import { createStripeClient } from "../../src/stripe/client";
import {
  STRIPE_CONNECT_ACCOUNT_CONTROLLER,
  assertStripeTestModeKey,
  createConnectedAccountOnboarding,
} from "../../src/stripe/connect";

const secret = process.env.STRIPE_SECRET_KEY ?? "";

describe.skipIf(!secret)(
  "[stripe-integration] Stripe Connect onboarding — real Stripe TEST",
  () => {
    it("creates a livemode=false Standard-equivalent connected account and hosted onboarding link, then cleans up", async () => {
      const testSecret = assertStripeTestModeKey(secret);
      const stripe = createStripeClient(testSecret);
      const idempotencyKey = `wp8a-connect-test-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      const onboarding = await createConnectedAccountOnboarding(stripe, {
        countryCode: "US",
        tenantId: "00000000-0000-0000-0000-000000000001",
        legalEntityId: "00000000-0000-0000-0000-000000000010",
        legalName: "GiveHope Test Entity",
        origin: "https://development-admin.asymmetric.al",
        idempotencyKey,
      });

      try {
        expect(onboarding.providerAccountId).toMatch(/^acct_/);
        expect(onboarding.onboardingUrl).toMatch(/^https:\/\//);

        const retrieved = await stripe.accounts.retrieve(
          onboarding.providerAccountId,
        );
        expect(retrieved.controller?.losses?.payments).toBe(
          STRIPE_CONNECT_ACCOUNT_CONTROLLER.losses.payments,
        );
        expect(retrieved.controller?.fees?.payer).toBe(
          STRIPE_CONNECT_ACCOUNT_CONTROLLER.fees.payer,
        );
        expect(retrieved.controller?.requirement_collection).toBe(
          STRIPE_CONNECT_ACCOUNT_CONTROLLER.requirement_collection,
        );
        expect(retrieved.controller?.stripe_dashboard?.type).toBe(
          STRIPE_CONNECT_ACCOUNT_CONTROLLER.stripe_dashboard.type,
        );
      } finally {
        await stripe.accounts
          .del(onboarding.providerAccountId)
          .catch(() => undefined);
      }
    });
  },
);
