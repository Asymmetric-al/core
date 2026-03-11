import {
  getAuthContext,
  requireAuth,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import {
  fetchUserPostInteractions,
  toUserPostInteractionSets,
} from "@asym/database/supabase/post-interactions";
import { cacheLife, cacheTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { getPostReactionStatus } from "./queries";
import { postsQuerySchema } from "../schemas/posts";
import { CACHE_TAGS } from "../shared/cache-tags";
import { toErrorResponse } from "../shared/http-errors";

interface FeedPostsQuery {
  tenantId: string;
  status: string;
  offset: number;
  limit: number;
  missionaryId?: string | null;
}

function getAdminClientOrThrow() {
  const { client: supabaseAdmin, error: adminError } = getAdminClient();
  if (!supabaseAdmin) {
    throw new Error(adminError ?? "Admin client unavailable");
  }
  return supabaseAdmin;
}

async function getCachedFeedPosts({
  tenantId,
  status,
  offset,
  limit,
  missionaryId,
}: FeedPostsQuery) {
  "use cache";

  cacheLife("minutes");
  cacheTag(CACHE_TAGS.tenantPosts(tenantId));

  // `use cache` stores query results; admin client remains a module-level singleton.
  const supabaseAdmin = getAdminClientOrThrow();

  let query = supabaseAdmin
    .from("posts")
    .select(
      `
        *,
        author:profiles!missionary_id(id, first_name, last_name, avatar_url)
      `,
    )
    .eq("tenant_id", tenantId)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (missionaryId) {
    query = query.eq("missionary_id", missionaryId);
  }

  const { data: posts, error } = await query;
  if (error) {
    throw error;
  }

  return posts ?? [];
}

export async function GET(request: NextRequest) {
  try {
    const adminClientState = getAdminClient();
    if (!adminClientState.client) {
      return NextResponse.json(
        { error: adminClientState.error },
        { status: 503 },
      );
    }

    const auth = await getAuthContext();
    requireAuth(auth);
    const ctx = auth as AuthenticatedContext;

    const { searchParams } = new URL(request.url);
    const { limit, offset, status, missionaryId } = postsQuerySchema.parse({
      limit: searchParams.get("limit") ?? "10",
      offset: searchParams.get("offset") ?? "0",
      status: searchParams.get("status") ?? "published",
      missionaryId: searchParams.get("missionaryId"),
    });

    const posts = await getCachedFeedPosts({
      tenantId: ctx.tenantId,
      status,
      offset,
      limit,
      missionaryId,
    });

    const postIds = posts.map((post: { id: string }) => post.id);
    if (postIds.length === 0) return NextResponse.json({ posts: [] });

    const interactionRows = await fetchUserPostInteractions(
      adminClientState.client,
      ctx.userId,
      postIds,
    );

    const { likedPostIds, prayedPostIds, firedPostIds } =
      toUserPostInteractionSets(interactionRows);

    const postsWithStatus = posts.map((post: { id: string }) => ({
      ...post,
      user_liked: likedPostIds.has(post.id),
      user_prayed: prayedPostIds.has(post.id),
      user_fired: firedPostIds.has(post.id),
    }));

    return NextResponse.json({ posts: postsWithStatus });
  } catch (e) {
    return toErrorResponse(e);
  }
}

/** Read-only demo: post creation disabled. */
export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}
