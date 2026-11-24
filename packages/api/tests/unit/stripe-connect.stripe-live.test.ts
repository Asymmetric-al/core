import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import { createStripeClient } from "../../src/stripe/client";
import {
  STRIPE_CONNECT_ACCOUNT_CONFIGURATION,
  assertStripeTestModeKey,
  ensureConnectedAccountForIntent,
  issueConnectedAccountLink,
  verifyConnectedAccountForIntent,
  type StripeConnectClient,
} from "../../src/stripe/connect";

const secret = process.env.STRIPE_SECRET_KEY ?? "";

describe.skipIf(!secret)(
  "[stripe-integration] Stripe Connect onboarding on Accounts v2 — real Stripe TEST",
  () => {
    it("creates one test-mode account per intent with the ruled configuration and an onboarding link, then closes it", async () => {
      const stripe = createStripeClient(assertStripeTestModeKey(secret));
      const connect = stripe as unknown as StripeConnectClient;
      const intentId = randomUUID();
      const intent = {
        intentId,
        livemode: false,
        countryCode: "US",
        currency: "usd",
        legalName: "GiveHope Test Entity",
      };
      const first = await ensureConnectedAccountForIntent(connect, intent);
      try {
        expect(first.livemode).toBe(false);
        const replay = await ensureConnectedAccountForIntent(connect, intent);
        expect(replay.id).toBe(first.id);
        const verified = await verifyConnectedAccountForIntent(
          connect,
          first.id,
          { intentId, livemode: false },
        );
        expect(verified.dashboard).toBe(
          STRIPE_CONNECT_ACCOUNT_CONFIGURATION.dashboard,
        );
        const raw = await stripe.v2.core.accounts.retrieve(first.id, {
          include: ["defaults"],
        });
        expect(raw.defaults?.responsibilities).toEqual(
          STRIPE_CONNECT_ACCOUNT_CONFIGURATION.defaults.responsibilities,
        );
        const link = await issueConnectedAccountLink(connect, {
          accountId: first.id,
          origin: "https://development-admin.asymmetric.al",
          useCase: "account_onboarding",
        });
        expect(link.url).toMatch(/^https:\/\//);
      } finally {
        await stripe.v2.core.accounts
          .close(first.id, {})
          .catch(() => undefined);
      }
    });
  },
);
