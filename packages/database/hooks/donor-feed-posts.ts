"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import type { PostWithAuthor } from "../types/database";

/**
 * View shape for the dashboard "Ministry Updates" widget. Structurally matches
 * `RecentUpdate` from `@asym/mock-data` (kept local so this package does not
 * depend on the mock-data package).
 */
interface DonorRecentUpdate {
  id: string | number;
  author: string;
  title: string;
  time: string;
  image?: string;
  avatar: string;
  /** The author's photo, for when the update has none. */
  authorAvatar?: string;
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
  /** Updates to skip, for paging (defaults to 0). */
  offset?: number;
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
  if (options.offset) {
    params.set("offset", String(options.offset));
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
    throw Object.assign(new Error(message), { status: response.status });
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
    data: accessDenied(query.error) ? [] : (query.data ?? []),
    isLoading: query.isLoading,
    error: query.error,
  };
}

/** Updates per page on the donor Updates feed. */
export const DONOR_FEED_PAGE_SIZE = 20;

function accessDenied(error: Error | null): boolean {
  return (
    error !== null &&
    "status" in error &&
    (error.status === 401 || error.status === 403)
  );
}

/**
 * The donor Updates feed, a page at a time. The endpoint returns a bare list,
 * so a full page means there may be more; a short page is the end of the feed.
 */
export function useDonorFeedPostPages(
  options: Omit<DonorFeedPostsOptions, "limit"> = {},
) {
  const { enabled = true, ...fetchOptions } = options;

  const query = useInfiniteQuery({
    queryKey: [
      DONOR_FEED_POSTS_QUERY_KEY,
      "pages",
      fetchOptions.missionaryId ?? null,
      fetchOptions.status ?? "published",
      DONOR_FEED_PAGE_SIZE,
    ],
    queryFn: ({ pageParam }) =>
      fetchDonorFeedPostsResponse({
        ...fetchOptions,
        limit: DONOR_FEED_PAGE_SIZE,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < DONOR_FEED_PAGE_SIZE
        ? undefined
        : allPages.length * DONOR_FEED_PAGE_SIZE,
    enabled,
    staleTime: 30_000,
  });
  const denied = accessDenied(query.error);

  return {
    data: denied ? [] : (query.data?.pages.flat() ?? []),
    isLoading: query.isLoading,
    error: query.error,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    accessDenied: denied,
    isNextPageError: query.isFetchNextPageError,
    retry: () => {
      if (query.isFetchNextPageError) {
        void query.fetchNextPage();
      } else {
        void query.refetch();
      }
    },
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        void query.fetchNextPage();
      }
    },
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
 * A feed row as `GET /api/posts` returns it (`select *`): it also carries the
 * author's headline and category, which the shared `Post` type omits.
 */
export type DonorFeedPost = PostWithAuthor & {
  title?: string | null;
  post_type?: string | null;
};

/** The author's category label (e.g. "Prayer Request"), if any. */
export function postCategory(post: DonorFeedPost): string | undefined {
  return post.post_type?.trim() || undefined;
}

type RichTextNode = { type?: string; text?: string; content?: RichTextNode[] };

function nodeText(node: RichTextNode): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return " ";
  const text = (node.content ?? []).map(nodeText).join("");
  return node.type && RICH_TEXT_BLOCKS.has(node.type) ? `${text} ` : text;
}

const RICH_TEXT_BLOCKS = new Set([
  "doc",
  "paragraph",
  "heading",
  "blockquote",
  "codeBlock",
  "listItem",
  "bulletList",
  "orderedList",
  "taskList",
  "taskItem",
  "table",
  "tableRow",
  "tableCell",
  "tableHeader",
]);

/**
 * A post's words as plain text. The update composer stores TipTap JSON;
 * older posts hold HTML. Blocks are separated by a space.
 */
export function postPlainText(content: string): string {
  if (content.trimStart().startsWith("{")) {
    try {
      const doc = JSON.parse(content) as RichTextNode;
      if (doc?.type === "doc") {
        return nodeText(doc).replace(/\s+/g, " ").trim();
      }
    } catch {
      // Not JSON: read it as HTML below.
    }
  }
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The post's own headline when the author supplied one; otherwise a short,
 * plain-text title from its content, truncated with an ellipsis.
 */
export function postTitle(post: DonorFeedPost, maxLength = 80): string {
  const ownTitle = post.title?.trim();
  if (ownTitle) return ownTitle;
  const text = postPlainText(post.content);
  if (text.length === 0) return "Ministry Update";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

/**
 * Reading-time estimate from the post's body at about 200 words a minute,
 * never less than one minute.
 */
export function postReadTime(post: PostWithAuthor): string {
  const words = postPlainText(post.content).split(" ").filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/** Image URLs from the post's media (videos excluded). */
export function postImages(post: PostWithAuthor): string[] {
  return post.media.flatMap((item) =>
    item.type === "image" ? [item.url] : [],
  );
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
    ...(post.author?.avatar_url
      ? { authorAvatar: post.author.avatar_url }
      : {}),
  };
}
