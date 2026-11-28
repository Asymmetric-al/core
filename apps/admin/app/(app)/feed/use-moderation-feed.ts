"use client";

import { ownApiFetch } from "@asym/database/own-api";
import { useMC } from "@asym/lib/mission-control/context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  review_state?: "submitted" | "approved" | "rejected" | "withdrawn" | null;
  review_reason?: string | null;
  content_version?: number | null;
  worker_withheld?: boolean | null;
  ministry_assignment_id?: string | null;
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
  stats: { total: number; flagged: number; hidden: number; waiting?: number };
}
export type PublicationMode = "review" | "automatic";
export interface PublicationPolicy {
  ministry_assignment_id: string;
  path: "update" | "profile";
  mode: PublicationMode;
  reason: string;
}
interface PoliciesResponse {
  policies: PublicationPolicy[];
}
interface CommentsResponse {
  comments: ModerationComment[];
  total: number | null;
}

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await ownApiFetch(url, {
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
        "/api/admin/posts?reviewState=submitted&status=published&limit=100",
        signal,
      ),
  });
  const comments = useQuery({
    ...options,
    queryKey: ["moderation", ...identity, "comments"],
    queryFn: ({ signal }) =>
      getJson<CommentsResponse>("/api/admin/comments?limit=20", signal),
  });
  const policies = useQuery({
    ...options,
    queryKey: ["moderation", ...identity, "policies"],
    queryFn: ({ signal }) =>
      getJson<PoliciesResponse>("/api/admin/publication-policies", signal),
  });
  return { posts, review, comments, policies };
}

async function sendJson(
  url: string,
  method: "POST" | "PUT",
  body: unknown,
): Promise<{ reached: boolean; error: string | null }> {
  const response = await ownApiFetch(url, {
    method,
    credentials: "same-origin",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  if (response?.ok) return { reached: true, error: null };
  const answer = (await response?.json().catch(() => null)) as {
    error?: string;
  } | null;
  return {
    reached: response !== null,
    error: answer?.error ?? "Something went wrong. Nothing was changed.",
  };
}

export function useModerationActions() {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["moderation"] });
  return {
    review: async (
      post: Pick<ModerationPost, "id" | "content_version">,
      decision: "approve" | "reject" | "withdraw",
      reason?: string,
    ) => {
      const answer = await sendJson(
        `/api/admin/posts/${encodeURIComponent(post.id)}/review`,
        "POST",
        decision === "withdraw"
          ? { decision, reason }
          : {
              decision,
              version: post.content_version,
              ...(reason === undefined ? {} : { reason }),
            },
      );
      if (answer.reached) await refresh();
      return answer.error;
    },
    setPolicy: async (policy: {
      ministryAssignmentId: string;
      path: "update";
      mode: PublicationMode;
      reason: string;
    }) => {
      const answer = await sendJson(
        "/api/admin/publication-policies",
        "PUT",
        policy,
      );
      if (answer.reached) await refresh();
      return answer.error;
    },
  };
}
