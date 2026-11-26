import { findOwnDonor } from "../shared/queries";

const MISSIONARY_EMBED =
  "missionary:missionaries(id, tenant_id, bio, mission_field, funding_goal, current_funding, created_at, updated_at, worker_public_name, profile:profiles!profile_id(id, avatar_url))";

/**
 * PostgREST select for a donation with its donor and missionary embedded.
 *
 * `donations.donor_id` references `donors`, not `profiles`, so the donor's
 * profile is reached through `donors.profile_id`. That profile is null for a
 * guest donor. Neither party embed hints a column: each resolves through its
 * sole relationship with donations, whether the key is single or composite.
 * The donors embed selects only `id` alongside the profile, adding no donor PII.
 */
export const DONATION_WITH_PARTIES_SELECT = `*, donor:donors(id, profile:profiles!profile_id(*)), ${MISSIONARY_EMBED}`;

export const SUPPORTER_DONATION_SELECT = `*, donor:donors(id, giving_preferences, donor_is_restricted_party, profile:profiles!profile_id(*)), ${MISSIONARY_EMBED}`;

/** What a gift request asked for, as passed to `begin_donation_saga`. */
export type RequestedGift = {
  profileId: string;
  amountCents: number;
  currency: string;
  missionaryId: string | null;
  fundId: string | null;
};

/**
 * The fields where a read-back donation differs from the caller's request; an
 * empty list means it is the caller's gift. A replayed idempotency key can
 * resolve to another donor's gift, so this must be empty before any row data
 * is returned. Values are compared as the saga stores them: amount in integer
 * cents unchanged, currency trimmed and lowercased, and ids as canonical UUIDs,
 * since Postgres accepts any case, braces or hyphenation and stores lowercase.
 */
export function giftMismatches(
  row: Record<string, unknown>,
  gift: RequestedGift & { ownDonorId?: string | null },
): string[] {
  const donor = row.donor as {
    id?: unknown;
    profile?: { id?: unknown } | null;
  } | null;
  const ownerProfileId = uuidKey(donor?.profile?.id);
  const donorId = uuidKey(row.donor_id ?? donor?.id);
  const checks: Array<[string, boolean]> = [
    [
      "profile",
      (Boolean(ownerProfileId) && ownerProfileId === uuidKey(gift.profileId)) ||
        (Boolean(donorId) && donorId === uuidKey(gift.ownDonorId)),
    ],
    ["amount", Number(row.amount) === gift.amountCents],
    [
      "currency",
      String(row.currency ?? "")
        .trim()
        .toLowerCase() === gift.currency.trim().toLowerCase(),
    ],
    ["missionary", uuidKey(row.missionary_id) === uuidKey(gift.missionaryId)],
    ["fund", uuidKey(row.fund_id) === uuidKey(gift.fundId)],
  ];
  return checks.filter(([, ok]) => !ok).map(([field]) => field);
}

export async function callerGiftMismatches(
  supabase: Parameters<typeof findOwnDonor>[0],
  row: Record<string, unknown>,
  gift: RequestedGift,
  person: { userId: string; tenantId: string },
): Promise<string[]> {
  const mismatched = giftMismatches(row, gift);
  if (!mismatched.includes("profile")) return mismatched;
  const own = await findOwnDonor(supabase, person).catch(() => null);
  if (own?.status !== "found") return mismatched;
  return giftMismatches(row, { ...gift, ownDonorId: own.donor.id });
}

/** A UUID in one comparable form (lowercase hex, no braces or hyphens). */
function uuidKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.trim().toLowerCase().replace(/[{}-]/g, "");
}
