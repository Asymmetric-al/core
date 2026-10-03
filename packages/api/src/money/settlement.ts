import "server-only";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

/**
 * Compatibility resolver for the currently qualified USD-only donate route.
 * public.tenants has no settlement-currency field. A verified existing tenant
 * may use the existing USD lane; an absent/error/mismatched identity has no lane.
 * This creates no Site/default/merchant selector. Phase 7/20 must replace this
 * narrow resolver with exact financial-owner/binding qualification before any
 * currency expansion; metadata and caller input cannot widen it.
 */
export async function resolveTenantSettlementCurrency(
  client: AdminSupabaseClient,
  tenantId: string,
): Promise<"USD" | null> {
  const { data, error } = await client
    .from("tenants")
    .select("id")
    .eq("id", tenantId)
    .maybeSingle();
  if (error || !data || data.id !== tenantId) return null;
  return "USD";
}
