"use client";

import { useQuery } from "@tanstack/react-query";

import type { PostWithAuthor } from "../types/database";

/**
 * View shape for the dashboard "Ministry Updates" widget. Structurally matches
 * `RecentUpdate` from `@asym/mock-data` (kept local so this package does not
 * depend on the mock-data package).
 */
export interface DonorRecentUpdate {
  id: string | number;
  author: string;
  title: string;
  time: string;
  image?: string;
  avatar: string;
}

/**
 * Donor feed posts.
 *
 * Thin client hook over the SERVER endpoint `GET /api/posts`
 * (`@asym/api/posts`). It is the fetch counterpart to the client-collection
 * `usePostsWithAuthors` hook: the donor portal feed + dashboard "Ministry
 * Updates" widget need the tenant-scoped, auth-gated, server-redacted feed, so
 * they read the HTTP endpoint (which resolves `tenant_id`/`user_*` interactions
 * server-side) rather than the raw client collections.
 *
 * Pattern-matched to `missionary-donors.ts`: `useQuery` + `fetch`, returning a
 * flat `{ data, isLoading, error }` view. The pure mappers below are exported so
 * both surfaces derive their view shapes from the same, tested logic.
 */

export const DONOR_FEED_POSTS_QUERY_KEY = "donor-feed-posts";

export interface DonorFeedPostsOptions {
  /** Restrict the feed to a single missionary (optional). */
  missionaryId?: string | null;
  /** Page size (defaults to the endpoint's own default of 10). */
  limit?: number;
  /** Post status filter (defaults to "published"). */
  status?: string;
  /** React Query `enabled` toggle. */
  enabled?: boolean;
}

async function fetchDonorFeedPostsResponse(
  options: DonorFeedPostsOptions,
): Promise<PostWithAuthor[]> {
  const params = new URLSearchParams();
  params.set("status", options.status ?? "published");
  if (typeof options.limit === "number") {
    params.set("limit", String(options.limit));
  }
  if (options.missionaryId) {
    params.set("missionaryId", options.missionaryId);
  }

  const response = await fetch(`/api/posts?${params.toString()}`, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    let message = `Failed to load updates (${response.status})`;
    try {
      const body = (await response.json()) as { error?: unknown };
      if (body?.error) message = String(body.error);
    } catch {
      // keep the status-based message
    }
    throw new Error(message);
  }

  const body = (await response.json()) as { posts?: PostWithAuthor[] };
  return body.posts ?? [];
}

/**
 * Fetch the donor feed directly (used by the hook; exported for testing).
 * `status` defaults to "published"; `limit`/`missionaryId` are optional.
 */
export function fetchDonorFeedPosts(
  options: DonorFeedPostsOptions = {},
): Promise<PostWithAuthor[]> {
  return fetchDonorFeedPostsResponse(options);
}

export function useDonorFeedPosts(options: DonorFeedPostsOptions = {}) {
  const { enabled = true, ...fetchOptions } = options;

  const query = useQuery({
    queryKey: [
      DONOR_FEED_POSTS_QUERY_KEY,
      fetchOptions.missionaryId ?? null,
      fetchOptions.status ?? "published",
      fetchOptions.limit ?? null,
    ],
    queryFn: () => fetchDonorFeedPostsResponse(fetchOptions),
    enabled,
    staleTime: 30_000,
  });

  return {
    data: (query.data ?? []) as PostWithAuthor[],
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  };
}

// --- Pure view mappers (shared by the feed page + dashboard widget) ---

/**
 * Relative "time ago" label. `now` is injectable so callers/tests stay
 * deterministic; app code passes `new Date()`.
 */
export function formatPostRelativeTime(
  isoDate: string,
  now: Date = new Date(),
): string {
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Author display name, with a neutral fallback. */
export function postAuthorName(post: PostWithAuthor): string {
  const name = `${post.author.first_name} ${post.author.last_name}`.trim();
  return name.length > 0 ? name : "Ministry Partner";
}

/** Two-letter author initials (empty string when no name is present). */
export function postInitials(post: PostWithAuthor): string {
  const first = post.author.first_name?.charAt(0) ?? "";
  const last = post.author.last_name?.charAt(0) ?? "";
  return `${first}${last}`.toUpperCase();
}

/**
 * A short, plain-text title derived from the post's (HTML) content: tags are
 * stripped, whitespace collapsed, and the result truncated with an ellipsis.
 */
export function postTitle(post: PostWithAuthor, maxLength = 80): string {
  const text = post.content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length === 0) return "Ministry Update";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

/** Image URLs from the post's media (videos excluded). */
export function postImages(post: PostWithAuthor): string[] {
  return post.media
    .filter((item) => item.type === "image")
    .map((item) => item.url);
}

/**
 * Map a feed post to the dashboard "Ministry Updates" widget shape
 * (`RecentUpdate` from `@asym/mock-data`).
 */
export function mapToRecentUpdate(
  post: PostWithAuthor,
  now: Date = new Date(),
): DonorRecentUpdate {
  const [image] = postImages(post);
  return {
    id: post.id,
    author: postAuthorName(post),
    title: postTitle(post),
    time: formatPostRelativeTime(post.created_at, now),
    ...(image ? { image } : {}),
    avatar: postInitials(post),
  };
}
