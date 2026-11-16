"use client";
import { useMC } from "@asym/lib/mission-control/context";
import { useQuery } from "@tanstack/react-query";

export interface ModerationAuthor {
  full_name?: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}
export interface ModerationPost {
  id: string;
  title: string | null;
  content: string;
  post_type: string;
  status: string;
  visibility: string;
  created_at: string;
  like_count?: number | null;
  prayer_count?: number | null;
  fires_count?: number | null;
  comment_count?: number | null;
  author: ModerationAuthor | null;
}
export interface ModerationComment {
  id: string;
  content: string;
  created_at: string;
  author: ModerationAuthor | null;
}
export interface ModerationPostsResponse {
  posts: ModerationPost[];
  total: number;
  stats: { total: number; flagged: number; hidden: number };
}
interface CommentsResponse {
  comments: ModerationComment[];
  total: number | null;
}

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    signal,
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not load moderation data.");
  }
  return (await response.json()) as T;
}

export function useModerationFeed() {
  const { tenant, user, role } = useMC();
  const identity = [tenant?.id, user?.id, user?.role, role];
  const options = {
    // The endpoint resolves tenant and permissions from the session cookie.
    // Shell identity only partitions the cache; it is not a read prerequisite.
    retry: false,
    staleTime: 30_000,
    gcTime: 0,
    refetchOnWindowFocus: false,
  } as const;
  const posts = useQuery({
    ...options,
    queryKey: ["moderation", ...identity, "posts"],
    queryFn: ({ signal }) =>
      getJson<ModerationPostsResponse>("/api/admin/posts?limit=100", signal),
  });
  const review = useQuery({
    ...options,
    queryKey: ["moderation", ...identity, "review"],
    queryFn: ({ signal }) =>
      getJson<ModerationPostsResponse>(
        "/api/admin/posts?status=flagged,hidden,pending_review&limit=100",
        signal,
      ),
  });
  const comments = useQuery({
    ...options,
    queryKey: ["moderation", ...identity, "comments"],
    queryFn: ({ signal }) =>
      getJson<CommentsResponse>("/api/admin/comments?limit=20", signal),
  });
  return { posts, review, comments };
}
