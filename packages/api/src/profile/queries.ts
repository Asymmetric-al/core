import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

export function findFullProfileById(
  supabase: AdminSupabaseClient,
  profileId: string,
  tenantId: string,
) {
  return supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .eq("tenant_id", tenantId)
    .single();
}
