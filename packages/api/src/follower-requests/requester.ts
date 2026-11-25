import { isAnonymousToRecipient } from "../missionary-portal/redaction";

export type FollowerRequestDonor = {
  id?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  total_given?: number | null;
  giving_preferences?: unknown;
  donor_is_restricted_party?: unknown;
};

export function requesterOf(
  donor: FollowerRequestDonor[] | FollowerRequestDonor | null | undefined,
): { donor: FollowerRequestDonor | null; shown: boolean } {
  const resolved = (Array.isArray(donor) ? donor[0] : donor) ?? null;
  return {
    donor: resolved,
    shown:
      resolved !== null &&
      !isAnonymousToRecipient({
        givingPreferences: resolved.giving_preferences,
        restrictedParty: resolved.donor_is_restricted_party,
      }),
  };
}
