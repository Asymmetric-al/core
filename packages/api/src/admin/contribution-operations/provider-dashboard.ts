import { serverEnv } from "@asym/env";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

/**
 * Mode-aware Stripe dashboard proof links (issue #266).
 *
 * Test-mode charges only resolve under https://dashboard.stripe.com/test/...,
 * so the provider proof drawer must know which mode the tenant's Stripe key
 * runs in. Only a boolean ever leaves the key resolution — the secret key is
 * never returned, logged, or attached to the projection.
 */

const STRIPE_TEST_MODE_KEY_PREFIXES = ["sk_test_", "rk_test_"] as const;

const STRIPE_LIVE_DASHBOARD_BASE_URL = "https://dashboard.stripe.com";
const STRIPE_TEST_DASHBOARD_BASE_URL = "https://dashboard.stripe.com/test";

export function isStripeTestModeKey(
  secretKey: string | null | undefined,
): boolean {
  if (!secretKey) {
    return false;
  }

  return STRIPE_TEST_MODE_KEY_PREFIXES.some((prefix) =>
    secretKey.startsWith(prefix),
  );
}

export interface StripeDashboardUrlsInput {
  paymentIntentId: string | null;
  chargeId: string | null;
  testMode: boolean;
}

export interface StripeDashboardUrls {
  paymentIntent: string | null;
  charge: string | null;
}

/** Pure URL builder: inserts /test after the host for test-mode tenants. */
export function stripeDashboardUrls(
  input: StripeDashboardUrlsInput,
): StripeDashboardUrls {
  const baseUrl = input.testMode
    ? STRIPE_TEST_DASHBOARD_BASE_URL
    : STRIPE_LIVE_DASHBOARD_BASE_URL;

  return {
    paymentIntent: input.paymentIntentId
      ? `${baseUrl}/payments/${input.paymentIntentId}`
      : null,
    charge: input.chargeId ? `${baseUrl}/charges/${input.chargeId}` : null,
  };
}

/**
 * Resolves whether the tenant's effective Stripe key is a test-mode key,
 * using the same tenant-key-then-platform-fallback order as the refund
 * adapter. Returns only the boolean; the key itself never leaves this
 * function. A missing key resolves to live mode — the drawer then simply
 * links to the live dashboard, which is the pre-existing behavior.
 */
export async function resolveProviderDashboardTestMode(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<boolean> {
  const { data, error } = await input.supabaseAdmin
    .from("tenants")
    .select("id, stripe_secret_key")
    .eq("id", input.tenantId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const tenantRow = data as { stripe_secret_key?: string | null } | null;
  const secretKey =
    tenantRow?.stripe_secret_key ?? serverEnv.STRIPE_SECRET_KEY ?? null;

  return isStripeTestModeKey(secretKey);
}

/**
 * Route-side gate: the Stripe key is resolved ONLY when the viewer holds
 * contributions.use_provider_actions — unauthorized viewers get their
 * providerProof nulled by the projection anyway, so the tenant key row is
 * never read on their behalf.
 */
export async function resolveViewerProviderDashboardTestMode(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  viewerCapabilities: string[];
}): Promise<boolean> {
  const hasProviderAccess = input.viewerCapabilities.includes(
    "contributions.use_provider_actions",
  );
  if (!hasProviderAccess) {
    return false;
  }

  return resolveProviderDashboardTestMode({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.tenantId,
  });
}
