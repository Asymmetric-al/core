import { serverEnv } from "@asym/env";

import type Stripe from "stripe";

export const STRIPE_CONNECT_ACCOUNT_CONTROLLER = {
  losses: { payments: "stripe" },
  fees: { payer: "account" },
  requirement_collection: "stripe",
  stripe_dashboard: { type: "full" },
} as const satisfies Stripe.AccountCreateParams.Controller;

export function buildConnectedAccountCreateParams(input: {
  countryCode: string;
  tenantId: string;
  legalEntityId: string;
  legalName: string;
}): Stripe.AccountCreateParams {
  return {
    country: input.countryCode,
    controller: {
      losses: { payments: STRIPE_CONNECT_ACCOUNT_CONTROLLER.losses.payments },
      fees: { payer: STRIPE_CONNECT_ACCOUNT_CONTROLLER.fees.payer },
      requirement_collection:
        STRIPE_CONNECT_ACCOUNT_CONTROLLER.requirement_collection,
      stripe_dashboard: {
        type: STRIPE_CONNECT_ACCOUNT_CONTROLLER.stripe_dashboard.type,
      },
    },
    business_profile: {
      name: input.legalName,
    },
    metadata: {
      tenant_id: input.tenantId,
      legal_entity_id: input.legalEntityId,
    },
  };
}

export function resolveAdminConfiguredOrigin(envSource?: {
  NEXT_PUBLIC_APP_URL?: string | null;
  NEXT_PUBLIC_SITE_URL?: string | null;
}): string {
  const raw = envSource
    ? envSource.NEXT_PUBLIC_APP_URL?.trim() ||
      envSource.NEXT_PUBLIC_SITE_URL?.trim() ||
      ""
    : serverEnv.NEXT_PUBLIC_APP_URL?.trim() ||
      serverEnv.NEXT_PUBLIC_SITE_URL?.trim() ||
      "";
  if (!raw) {
    throw new Error(
      "Admin origin is not configured. Set NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_SITE_URL.",
    );
  }
  const parsed = new URL(raw);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Admin origin must use http or https.");
  }
  return parsed.origin;
}

export function buildConnectOnboardingUrls(origin: string): {
  returnUrl: string;
  refreshUrl: string;
} {
  const base = new URL(origin).origin;
  return {
    returnUrl: `${base}/settings/payments?onboarding=return`,
    refreshUrl: `${base}/settings/payments?onboarding=refresh`,
  };
}

export function assertConnectedAccountId(
  accountId: string | null | undefined,
): string {
  const trimmed = typeof accountId === "string" ? accountId.trim() : "";
  if (!/^acct_[A-Za-z0-9]+$/.test(trimmed)) {
    throw new Error("A connected Stripe account id (acct_...) is required.");
  }
  return trimmed;
}

export function connectedAccountRequestOptions(
  accountId: string,
  idempotencyKey?: string,
): Stripe.RequestOptions {
  const stripeAccount = assertConnectedAccountId(accountId);
  return idempotencyKey ? { stripeAccount, idempotencyKey } : { stripeAccount };
}

export function assertStripeTestModeKey(secretKey: string): string {
  const trimmed = secretKey.trim();
  if (!trimmed) {
    throw new Error("Stripe test secret key is missing.");
  }
  if (trimmed.startsWith("sk_live_") || trimmed.startsWith("pk_live_")) {
    throw new Error("Live Stripe keys are forbidden in test helpers.");
  }
  if (!trimmed.startsWith("sk_test_")) {
    throw new Error("Expected a Stripe test secret key (sk_test_...).");
  }
  return trimmed;
}

export function isStripeSecretKeyLivemode(secretKey: string): boolean {
  const trimmed = secretKey.trim();
  if (trimmed.startsWith("sk_live_")) return true;
  if (trimmed.startsWith("sk_test_")) return false;
  throw new Error("Unrecognized Stripe secret key prefix.");
}

export interface StripeConnectOnboardingClient {
  accounts: {
    create(
      params: Stripe.AccountCreateParams,
      options?: Stripe.RequestOptions,
    ): Promise<{ id: string }>;
  };
  accountLinks: {
    create(
      params: Stripe.AccountLinkCreateParams,
      options?: Stripe.RequestOptions,
    ): Promise<{ url: string; expires_at: number }>;
  };
}

export async function createConnectedAccountOnboarding(
  stripe: StripeConnectOnboardingClient,
  input: {
    countryCode: string;
    tenantId: string;
    legalEntityId: string;
    legalName: string;
    origin: string;
    idempotencyKey: string;
    existingAccountId?: string | null;
  },
): Promise<{
  providerAccountId: string;
  onboardingUrl: string;
  expiresAt: number;
}> {
  const providerAccountId = input.existingAccountId
    ? assertConnectedAccountId(input.existingAccountId)
    : (
        await stripe.accounts.create(
          buildConnectedAccountCreateParams({
            countryCode: input.countryCode,
            tenantId: input.tenantId,
            legalEntityId: input.legalEntityId,
            legalName: input.legalName,
          }),
          { idempotencyKey: `${input.idempotencyKey}:account` },
        )
      ).id;

  const { returnUrl, refreshUrl } = buildConnectOnboardingUrls(input.origin);
  const link = await stripe.accountLinks.create({
    account: providerAccountId,
    type: "account_onboarding",
    return_url: returnUrl,
    refresh_url: refreshUrl,
  });

  return {
    providerAccountId,
    onboardingUrl: link.url,
    expiresAt: link.expires_at,
  };
}
