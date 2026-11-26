import { missionaryArgs, type MissionaryScope } from "./missionary-authority";
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
  scope: MissionaryScope,
) {
  return supabase
    .rpc("missionary_own_record", missionaryArgs(scope))
    .select("id, bio, tagline, location, phone, cover_url, social_links")
    .maybeSingle();
}

export type OwnDonorLookup<Row> =
  { status: "found"; donor: Row } | { status: "none" } | { status: "multiple" };

type DonorReader = Pick<AdminSupabaseClient, "from">;

export async function findOwnDonor<Row = { id: string }>(
  supabase: DonorReader,
  person: { userId: string; tenantId: string },
  columns = "id",
): Promise<OwnDonorLookup<Row>> {
  const { data: link, error: linkError } = await supabase
    .from("account_links")
    .select("party_id")
    .eq("tenant_id", person.tenantId)
    .eq("user_id", person.userId)
    .maybeSingle();
  if (linkError) {
    throw new Error(linkError.message || "Failed to read the account link.");
  }
  const partyId = (link as { party_id?: string | null } | null)?.party_id;
  if (!partyId) return { status: "none" };

  const { data: donors, error: donorsError } = await supabase
    .from("donors")
    .select(columns)
    .eq("tenant_id", person.tenantId)
    .eq("party_id", partyId)
    .limit(2);
  if (donorsError) {
    throw new Error(donorsError.message || "Failed to read the donor record.");
  }
  const rows = (donors ?? []) as unknown as Row[];
  if (rows.length === 0) return { status: "none" };
  if (rows.length > 1) return { status: "multiple" };
  return { status: "found", donor: rows[0]! };
}
