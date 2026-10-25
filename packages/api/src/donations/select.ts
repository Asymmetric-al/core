/**
 * PostgREST select for a donation with its donor and missionary embedded.
 *
 * `donations.donor_id` references `donors`, not `profiles`, so the donor's
 * profile is reached through `donors.profile_id`. That profile is null for a
 * guest donor. The donors embed is unhinted, so it resolves to whichever single
 * donations→donors FK exists, and it selects only `id` so no donor PII is added.
 */
export const DONATION_WITH_PARTIES_SELECT =
  "*, donor:donors(id, profile:profiles!profile_id(*)), missionary:missionaries!missionary_id(*, profile:profiles!profile_id(*))";

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
 * cents unchanged, currency trimmed and lowercased, ids as given.
 */
export function giftMismatches(
  row: Record<string, unknown>,
  gift: RequestedGift,
): string[] {
  const donor = row.donor as { profile?: { id?: unknown } | null } | null;
  const ownerProfileId = donor?.profile?.id ?? null;
  const checks: Array<[string, boolean]> = [
    ["profile", Boolean(gift.profileId) && ownerProfileId === gift.profileId],
    ["amount", Number(row.amount) === gift.amountCents],
    [
      "currency",
      String(row.currency ?? "")
        .trim()
        .toLowerCase() === gift.currency.trim().toLowerCase(),
    ],
    ["missionary", (row.missionary_id ?? null) === gift.missionaryId],
    ["fund", (row.fund_id ?? null) === gift.fundId],
  ];
  return checks.filter(([, ok]) => !ok).map(([field]) => field);
}
