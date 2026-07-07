/**
 * Public giving-flow projection / redaction helpers — MVP Item 3a.
 *
 * Pure functions that map raw DB rows to the public view shapes in `./types`.
 * They are the ONLY supported way to build public worker/update views: each
 * function returns an object literal containing exclusively non-identifying,
 * publicly displayable fields, so no donor/missionary PII can reach an
 * anonymous viewer even if extra columns are present on the raw input.
 */
import type {
  PublicWorker,
  PublicWorkerUpdate,
  RawMissionaryForPublic,
  RawPostForPublic,
  RawProfileForPublic,
} from "./types";

const DEFAULT_CATEGORY = "Ministry";
const DEFAULT_LOCATION = "Global";
/** Shown when a worker has no public display name — never a private full name. */
const ANONYMOUS_WORKER_TITLE = "Field Worker";
const CENTS_PER_DOLLAR = 100;

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

/** Integer cents -> whole dollars, floored and clamped non-negative. */
function centsToDollars(cents: number | null | undefined): number {
  if (cents == null || !Number.isFinite(cents) || cents <= 0) return 0;
  return Math.floor(cents / CENTS_PER_DOLLAR);
}

/** Public, non-identifying title for a worker. */
export function publicWorkerTitle(
  profile?: RawProfileForPublic | null,
): string {
  return (
    nonEmpty(profile?.display_name) ??
    nonEmpty(profile?.first_name) ??
    ANONYMOUS_WORKER_TITLE
  );
}

/** Map a raw missionary row (+ optional public profile) to the public view. */
export function toPublicWorker(row: RawMissionaryForPublic): PublicWorker {
  const missionField = nonEmpty(row.mission_field);
  const category = missionField
    ? (nonEmpty(missionField.split(" & ")[0]) ?? DEFAULT_CATEGORY)
    : DEFAULT_CATEGORY;

  const goalCents = row.funding_goal;
  const goal = goalCents == null ? null : centsToDollars(goalCents);

  return {
    id: row.id,
    title: publicWorkerTitle(row.profile),
    location: nonEmpty(row.location) ?? DEFAULT_LOCATION,
    category,
    description: nonEmpty(row.tagline) ?? nonEmpty(row.bio) ?? "",
    image: nonEmpty(row.profile?.avatar_url) ?? "",
    raised: centsToDollars(row.current_funding),
    goal,
  };
}

/** Percentage of goal raised (0-100, rounded), or `null` when there is no positive goal. */
export function computePercentRaised(
  raised: number,
  goal: number | null,
): number | null {
  if (goal == null || goal <= 0) return null;
  return Math.min(100, Math.max(0, Math.round((raised / goal) * 100)));
}

/** First usable image URL from a post's media array, else `null`. */
function firstPublicImage(media: RawPostForPublic["media"]): string | null {
  if (!Array.isArray(media)) return null;
  for (const item of media) {
    const url = nonEmpty(item?.url);
    if (url) return url;
  }
  return null;
}

/** Map a raw post row to the public update view. */
export function toPublicWorkerUpdate(
  row: RawPostForPublic,
): PublicWorkerUpdate {
  return {
    id: row.id,
    content: row.content ?? "",
    createdAt: row.created_at,
    image: firstPublicImage(row.media),
    likeCount: Math.max(0, Math.trunc(row.like_count ?? 0)),
    commentCount: Math.max(0, Math.trunc(row.comment_count ?? 0)),
  };
}
