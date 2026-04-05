import { findDonorByProfileId } from "../shared/queries";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

export interface DonorRecord {
  id: string;
  stripe_customer_id: string | null;
  profile_id: string;
}

/** Returns an existing donor for the profile, or creates one for the tenant. */
export async function findOrCreateDonor(
  supabase: AdminSupabaseClient,
  profileId: string,
  tenantId: string,
): Promise<{ data: DonorRecord | null; error: string | null }> {
  const { data: donor, error: donorError } = await findDonorByProfileId(
    supabase,
    profileId,
    tenantId,
  );

  if (!donorError && donor) {
    return {
      data: donor as DonorRecord,
      error: null,
    };
  }

  const { data: newDonor, error: createError } = await supabase
    .from("donors")
    .insert({
      tenant_id: tenantId,
      profile_id: profileId,
      giving_preferences: {},
      total_given: 0,
    })
    .select("id, stripe_customer_id, profile_id")
    .single();

  if (createError || !newDonor) {
    return {
      data: null,
      error: createError?.message ?? "Failed to create donor record",
    };
  }

  return {
    data: newDonor as DonorRecord,
    error: null,
  };
}
