/**
 * Ministry Update engagement — snapshot normalization.
 *
 * Every surface historically shipped its own field dialect for the same
 * Ministry Update engagement data. This file is the single place where those
 * dialects converge into one canonical {@link EngagementSnapshot} so the rest
 * of the module (hook, bar, transport) never sees a raw wire row.
 *
 * Server-safe: no React, no browser APIs.
 */

/** The reactions a viewer can leave on a Ministry Update. */
export type ReactionKind = "love" | "prayer" | "fire";

/** Stable iteration order for the reaction kinds (module-internal helper). */
export const REACTION_KINDS: readonly ReactionKind[] = [
  "love",
  "prayer",
  "fire",
];

/**
 * Union of every wire dialect a Ministry Update row may arrive in.
 *
 * All fields except `id` are optional so any of the three dialects can be
 * passed as-is:
 *
 * - **Canonical** (`packages/database` `Post`): `like_count`,
 *   `prayer_count`, `fires_count`, `comment_count`, `user_liked`,
 *   `user_prayed`, `user_fired`.
 * - **Worker** dialect: `likes_count`, `prayers_count`.
 * - **Donor** dialect: `likes`, `prayers`, `liked`, `prayed`, `comments`
 *   (an inline array whose length is the comment count).
 */
export interface MinistryUpdateSnapshotInput {
  /** Update identifier; numbers are stringified into `updateId`. */
  id: string | number;
  /** Canonical love/like count. */
  like_count?: number | null;
  /** Canonical prayer count. */
  prayer_count?: number | null;
  /** Canonical fire count (note the historical `fires_` prefix). */
  fires_count?: number | null;
  /** Canonical comment count. */
  comment_count?: number | null;
  /** Canonical viewer-has-loved flag. */
  user_liked?: boolean | null;
  /** Canonical viewer-has-prayed flag. */
  user_prayed?: boolean | null;
  /** Canonical viewer-has-fired flag. */
  user_fired?: boolean | null;
  /** Worker-dialect love count. */
  likes_count?: number | null;
  /** Worker-dialect prayer count. */
  prayers_count?: number | null;
  /** Donor-dialect love count. */
  likes?: number | null;
  /** Donor-dialect prayer count. */
  prayers?: number | null;
  /** Donor-dialect viewer-has-loved flag. */
  liked?: boolean | null;
  /** Donor-dialect viewer-has-prayed flag. */
  prayed?: boolean | null;
  /** Donor-dialect inline comments; only the length is read. */
  comments?: readonly unknown[] | null;
}

/** One reaction's canonical state: public count plus the viewer's own flag. */
export interface ReactionState {
  /** Total reaction count, always `>= 0`. */
  count: number;
  /** Whether the current viewer has left this reaction. */
  mine: boolean;
}

/** Canonical engagement state for one Ministry Update. */
export interface EngagementSnapshot {
  /** Update identifier as a string. */
  updateId: string;
  /** Love ("like" on the wire) reaction state. */
  love: ReactionState;
  /** Prayer reaction state. */
  prayer: ReactionState;
  /** Fire reaction state. */
  fire: ReactionState;
  /** Comment count, always `>= 0`. */
  commentCount: number;
}

/** Coerce a candidate count; non-finite / non-number values fall through. */
function toCount(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  return Math.max(0, Math.trunc(value));
}

/** First usable count from a precedence-ordered candidate list, else 0. */
function firstCount(...candidates: readonly unknown[]): number {
  for (const candidate of candidates) {
    const count = toCount(candidate);
    if (count !== undefined) {
      return count;
    }
  }
  return 0;
}

/**
 * First explicit viewer flag from a precedence-ordered candidate list.
 * `null`/`undefined` fall through; any other value is coerced to boolean
 * (so an explicit `false` stops the precedence chain).
 */
function firstMine(...candidates: readonly unknown[]): boolean {
  for (const candidate of candidates) {
    if (candidate !== undefined && candidate !== null) {
      return Boolean(candidate);
    }
  }
  return false;
}

/**
 * Normalize any Ministry Update wire dialect into one canonical
 * {@link EngagementSnapshot}.
 *
 * Total and pure: never throws, never mutates the input, and always returns
 * a fully-populated snapshot. Per-field precedence is
 * canonical → worker (`likes_count`/`prayers_count`) → donor
 * (`likes`/`prayers`/`liked`/`prayed`); missing values default to `0`/`false`.
 * Counts are clamped to `>= 0` and truncated to integers. The comment count
 * resolves as `comment_count ?? comments?.length ?? 0`.
 */
export function toEngagementSnapshot(
  input: MinistryUpdateSnapshotInput,
): EngagementSnapshot {
  const inlineCommentCount = Array.isArray(input.comments)
    ? input.comments.length
    : undefined;

  return {
    updateId: String(input.id),
    love: {
      count: firstCount(input.like_count, input.likes_count, input.likes),
      mine: firstMine(input.user_liked, input.liked),
    },
    prayer: {
      count: firstCount(input.prayer_count, input.prayers_count, input.prayers),
      mine: firstMine(input.user_prayed, input.prayed),
    },
    fire: {
      count: firstCount(input.fires_count),
      mine: firstMine(input.user_fired),
    },
    commentCount: firstCount(input.comment_count, inlineCommentCount),
  };
}
