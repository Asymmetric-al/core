import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

/**
 * The signed-in person's full profile. Every caller passes the profile of the
 * request's resolved assignment, whose live membership in the request's tenant
 * the resolver has just checked, so this reads no membership again (council
 * round 1 on WP2a, F12). It reads by id, never by the profile's tenant column
 * (AL-2675, NR-68).
 */
export async function findFullProfileById(
  supabase: AdminSupabaseClient,
  profileId: string,
) {
  return supabase.from("profiles").select("*").eq("id", profileId).single();
}
