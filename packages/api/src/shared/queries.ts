import { isTenantMemberProfile } from "./tenant-members";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const NOT_A_MEMBER = {
  data: null,
  error: { code: "PGRST116", message: "No member profile in this tenant" },
} as const;

/**
 * The profile id of the signed-in person's login. Every caller passes the
 * login of the request's resolved assignment, whose live membership in the
 * request's tenant the resolver has just checked, so this reads no membership
 * again (council round 1 on WP2a, F12). It filters on `user_id`, never on the
 * profile's tenant column (AL-2675, NR-68).
 */
export async function findProfileByUserId(
  supabase: AdminSupabaseClient,
  userId: string,
) {
  return supabase.from("profiles").select("id").eq("user_id", userId).single();
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
