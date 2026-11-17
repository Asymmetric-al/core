import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

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
