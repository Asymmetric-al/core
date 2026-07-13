import { serverEnv } from "@asym/env";

import { createStripeClient } from "./client";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type Stripe from "stripe";

/**
 * Per-tenant Stripe resolution: tenant key lookup, key normalization, and the
 * canonical environment fallback, behind one interface. Seven money-path
 * handlers previously each re-implemented this with divergent fallbacks
 * (process.env vs serverEnv) and empty-string handling.
 *
 * A missing tenant row is `tenant_not_found` and never borrows the platform
 * env key: falling back there would point provider operations (refunds,
 * recovery) at the wrong Stripe account.
 */
export type TenantStripeResolution =
  | {
      ok: true;
      stripe: Stripe;
      secretKey: string;
      /** Null when neither the tenant nor the environment provides one. */
      publishableKey: string | null;
    }
  | { ok: false; reason: "lookup_failed"; message: string }
  | { ok: false; reason: "tenant_not_found" }
  | { ok: false; reason: "stripe_unconfigured" };

function normalizeStripeKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

export async function resolveTenantStripe(params: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  /** Test seam only: production callers omit this and get serverEnv. */
  envKeys?: { secretKey?: string | null; publishableKey?: string | null };
}): Promise<TenantStripeResolution> {
  const { data, error } = await params.supabaseAdmin
    .from("tenants")
    .select("id, stripe_secret_key, stripe_publishable_key")
    .eq("id", params.tenantId)
    .maybeSingle();

  if (error) {
    return { ok: false, reason: "lookup_failed", message: error.message };
  }
  if (!data) {
    return { ok: false, reason: "tenant_not_found" };
  }

  const tenantRow = data as {
    stripe_secret_key?: unknown;
    stripe_publishable_key?: unknown;
  };
  const envKeys = params.envKeys ?? {
    secretKey: serverEnv.STRIPE_SECRET_KEY,
    publishableKey: serverEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };

  const secretKey =
    normalizeStripeKey(tenantRow.stripe_secret_key) ??
    normalizeStripeKey(envKeys.secretKey);
  if (!secretKey) {
    return { ok: false, reason: "stripe_unconfigured" };
  }

  const publishableKey =
    normalizeStripeKey(tenantRow.stripe_publishable_key) ??
    normalizeStripeKey(envKeys.publishableKey);

  return {
    ok: true,
    stripe: createStripeClient(secretKey),
    secretKey,
    publishableKey,
  };
}
