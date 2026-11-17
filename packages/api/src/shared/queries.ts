import { isTenantMemberProfile, listTenantMembers } from "./tenant-members";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const NOT_A_MEMBER = {
  data: null,
  error: { code: "PGRST116", message: "No member profile in this tenant" },
} as const;

/**
 * The profile id of a login that holds a live membership in the tenant
 * (AL-2675, NR-68): membership decides, never the profile's tenant column. A login
 * with no membership there gets the shape `.single()` gives for no row.
 */
export async function findProfileByUserId(
  supabase: AdminSupabaseClient,
  userId: string,
  tenantId: string,
) {
  const [member] = await listTenantMembers(supabase, tenantId, {
    userIds: [userId],
  });
  if (!member) return NOT_A_MEMBER;
  return supabase
    .from("profiles")
    .select("id")
    .eq("id", member.profileId)
    .single();
}

/** A profile by id; with a tenant, only when it is a live member there (AL-2675). */
export async function findProfileById(
  supabase: AdminSupabaseClient,
  profileId: string,
  tenantId?: string,
) {
  if (
    tenantId &&
    !(await isTenantMemberProfile(supabase, tenantId, profileId))
  ) {
    return NOT_A_MEMBER;
  }
  return supabase.from("profiles").select("*").eq("id", profileId).single();
}

export function findMissionaryByProfileId(
  supabase: AdminSupabaseClient,
  profileId: string,
) {
  return supabase
    .from("missionaries")
    .select("*")
    .eq("profile_id", profileId)
    .single();
}

export function findDonorByProfileId(
  supabase: AdminSupabaseClient,
  profileId: string,
  tenantId: string,
) {
  return supabase
    .from("donors")
    .select("id, stripe_customer_id, profile_id")
    .eq("profile_id", profileId)
    .eq("tenant_id", tenantId)
    .single();
}
