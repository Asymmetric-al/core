import { isTenantMemberProfile } from "../shared/tenant-members";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

/**
 * The full profile, when its login holds a live membership in the tenant
 * (AL-2675, NR-68): membership decides, never the profile's tenant column.
 */
export async function findFullProfileById(
  supabase: AdminSupabaseClient,
  profileId: string,
  tenantId: string,
) {
  if (!(await isTenantMemberProfile(supabase, tenantId, profileId))) {
    return {
      data: null,
      error: { code: "PGRST116", message: "No member profile in this tenant" },
    } as const;
  }
  return supabase.from("profiles").select("*").eq("id", profileId).single();
}
