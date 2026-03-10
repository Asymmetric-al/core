import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

/** Finds a missionary by ID within a tenant scope. */
export function findMissionaryById(
  supabase: AdminSupabaseClient,
  missionaryId: string,
  tenantId: string,
) {
  return supabase
    .from("missionaries")
    .select("id")
    .eq("id", missionaryId)
    .eq("tenant_id", tenantId)
    .single();
}
