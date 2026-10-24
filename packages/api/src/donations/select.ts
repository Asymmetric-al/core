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
