import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

/** Finds the minimal profile record used for auth-to-profile resolution. */
export function findProfileByUserId(
  supabase: AdminSupabaseClient,
  userId: string,
  tenantId: string,
) {
  return supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .single();
}

export function findProfileById(
  supabase: AdminSupabaseClient,
  profileId: string,
  tenantId?: string,
) {
  let query = supabase.from("profiles").select("*").eq("id", profileId);

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  return query.single();
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
