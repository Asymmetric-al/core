/**
 * Public giving-flow view types — MVP Item 3a (giving-flow READ wiring).
 *
 * These shapes back the ANONYMOUS donor-facing surfaces:
 *   - /workers                (field-worker directory)
 *   - /workers/[id]           (field-worker profile + updates feed + giving widget)
 *
 * DATA-BOUNDARY LAW (fleet charter, isolation guarantee #2): a public/anonymous
 * viewer may only ever see non-identifying, publicly displayable fields. None of
 * these types carry donor/missionary PII (email, phone, birth_date, health,
 * role, user_id, tenant_id). The projection helpers in `./projection` are the
 * only supported way to build these from raw DB rows.
 */

/** Whole US dollars (already converted from the DB's integer-cents `MoneyCents`). */
export type Dollars = number;

/**
 * Public view of a field worker (missionary). Drop-in replacement for the former
 * mock `FieldWorker` shape (`@asym/mock-data`), so the existing directory/profile
 * UI consumes it unchanged.
 */
export interface PublicWorker {
  id: string;
  /** Public display name (missionary's chosen display name, else first name, else a safe fallback). */
  title: string;
  location: string;
  /** Ministry focus / category label. */
  category: string;
  /** Public tagline / bio description. */
  description: string;
  /** Public avatar / hero image URL (empty string when none). */
  image: string;
  /** Total raised, in whole dollars. */
  raised: Dollars;
  /** Funding goal in whole dollars; `null` when the worker publishes no goal. */
  goal: Dollars | null;
}

/** Public view of a single field update (a missionary-authored post). */
export interface PublicWorkerUpdate {
  id: string;
  /** Post body (HTML/markdown, already public). */
  content: string;
  /** ISO timestamp of publication. */
  createdAt: string;
  /** First public media image URL, or `null`. */
  image: string | null;
  likeCount: number;
  commentCount: number;
}

/**
 * Minimal raw missionary row the public projection accepts. Deliberately a
 * SUBSET of the DB `Missionary` row: PII columns are intentionally absent from
 * this contract so a public read never even threads them through.
 */
export interface RawMissionaryForPublic {
  id: string;
  tagline: string | null;
  bio: string | null;
  mission_field: string | null;
  location: string | null;
  current_funding: number | null;
  funding_goal: number | null;
  profile?: RawProfileForPublic | null;
}

/** Public-safe subset of a joined `Profile` row. */
export interface RawProfileForPublic {
  display_name?: string | null;
  first_name?: string | null;
  avatar_url?: string | null;
}

/** Minimal raw post row the public update projection accepts. */
export interface RawPostForPublic {
  id: string;
  content: string | null;
  created_at: string;
  like_count?: number | null;
  comment_count?: number | null;
  media?: Array<{ type?: string | null; url?: string | null }> | null;
}
