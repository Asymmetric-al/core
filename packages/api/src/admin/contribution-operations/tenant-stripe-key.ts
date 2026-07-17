import { resolveTenantStripe } from "../../stripe/tenant-client";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

/**
 * Shared tenant Stripe key resolution delegates to the canonical tenant
 * resolver. `null` means the tenant is absent or Stripe is not configured.
 *
 * Both the refund adapter (which requires a key and fails with a 503) and the
 * provider dashboard mode resolution (which maps a missing key to live-mode
 * links) build on this single helper so the two paths cannot drift.
 */
export async function loadTenantStripeSecretKey(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<string | null> {
  const tenantStripe = await resolveTenantStripe(input);

  if (!tenantStripe.ok) {
    if (tenantStripe.reason === "lookup_failed") {
      throw new Error(tenantStripe.message);
    }

    return null;
  }

  return tenantStripe.secretKey;
}
