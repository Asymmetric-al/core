/**
 * Public giving-flow column allowlists — MVP Item 3a.
 *
 * A PUBLIC read must select ONLY these columns. The allowlist is posture-neutral:
 * it works for whichever public read path is approved (a server-side admin-client
 * route with a column allowlist, or an anon-RLS browser read), and it guarantees
 * that no PII column is ever requested from the database in the first place.
 *
 * `assertNoForbiddenPublicColumns` is a runtime guard usable at the query site.
 */

/**
 * Columns that must NEVER appear in a public select — donor/missionary PII and
 * sensitive operational fields. Internal FK ids (`tenant_id`, `profile_id`) are
 * intentionally NOT here: they carry no PII and `profile_id` is a legitimate
 * Supabase foreign-key join hint (`profiles!profile_id`) in the allowlist below.
 */
export const FORBIDDEN_PUBLIC_COLUMNS: readonly string[] = [
  "email",
  "phone",
  "birth_date",
  "health_status",
  "health_signals",
  "last_check_in",
  "manual_attention",
  "user_id",
  "last_name",
];

/**
 * Public missionary select. Joins ONLY public-safe profile fields
 * (display_name / first_name for a title, avatar_url for the image).
 * NOTE: runtime feasibility (anon RLS / a public-read endpoint / a `is_public`
 * flag / tenant resolution) is a separate, unresolved architecture decision —
 * see the Item 3a wiring note. This constant only fixes the column contract.
 */
export const PUBLIC_WORKER_SELECT =
  "id, tagline, bio, mission_field, location, current_funding, funding_goal, " +
  "profile:profiles!profile_id(display_name, first_name, avatar_url)";

/** Public post (field update) select — content + engagement counts + media only. */
export const PUBLIC_POST_SELECT =
  "id, content, created_at, like_count, comment_count, media";

/**
 * Throw if a select string references a forbidden PII column. Word-boundary
 * matched so a bare `id` is never mistaken for `user_id`, and the `profiles!profile_id`
 * FK-join hint is not flagged (`profile_id` is not a forbidden column).
 */
export function assertNoForbiddenPublicColumns(select: string): void {
  for (const col of FORBIDDEN_PUBLIC_COLUMNS) {
    const pattern = new RegExp(`(^|[^a-z_])${col}([^a-z_]|$)`, "i");
    if (pattern.test(select)) {
      throw new Error(
        `Public select must not request PII column "${col}": ${select}`,
      );
    }
  }
}
