import { serverEnv } from "@asym/env";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

/**
 * Shared tenant Stripe key resolution: the tenant's own key wins, the
 * platform key is the fallback, and `null` means Stripe is not configured.
 *
 * Both the refund adapter (which requires a key and fails with a 503) and the
 * provider dashboard mode resolution (which maps a missing key to live-mode
 * links) build on this single helper so the two paths cannot drift.
 */
export async function loadTenantStripeSecretKey(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<string | null> {
  const { data, error } = await input.supabaseAdmin
    .from("tenants")
    .select("id, stripe_secret_key")
    .eq("id", input.tenantId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const tenantRow = data as { stripe_secret_key?: string | null } | null;
  return tenantRow?.stripe_secret_key ?? serverEnv.STRIPE_SECRET_KEY ?? null;
}
