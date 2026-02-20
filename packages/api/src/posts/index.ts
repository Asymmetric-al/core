import {
  getAuthContext,
  requireAuth,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { postsQuerySchema } from "../schemas/posts";
import { toErrorResponse } from "../shared/http-errors";

export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
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

    let query = supabaseAdmin
      .from("posts")
      .select(
        `
        *,
        author:profiles!missionary_id(id, first_name, last_name, avatar_url)
      `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (missionaryId) {
      query = query.eq("missionary_id", missionaryId);
    }

    const { data: posts, error } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    const postIds = (posts || []).map((p: { id: string }) => p.id);
    if (postIds.length === 0) return NextResponse.json({ posts: [] });

    const { data: likes } = await supabaseAdmin
      .from("post_likes")
      .select("post_id")
      .in("post_id", postIds)
      .eq("user_id", ctx.userId);

    const { data: prayers } = await supabaseAdmin
      .from("post_prayers")
      .select("post_id")
      .in("post_id", postIds)
      .eq("user_id", ctx.userId);

    const { data: fires } = await supabaseAdmin
      .from("post_fires")
      .select("post_id")
      .in("post_id", postIds)
      .eq("user_id", ctx.userId);

    const likedSet = new Set(
      (likes || []).map((l: { post_id: string }) => l.post_id),
    );
    const prayedSet = new Set(
      (prayers || []).map((p: { post_id: string }) => p.post_id),
    );
    const firedSet = new Set(
      (fires || []).map((f: { post_id: string }) => f.post_id),
    );

    const postsWithStatus = (posts || []).map((post: { id: string }) => ({
      ...post,
      user_liked: likedSet.has(post.id),
      user_prayed: prayedSet.has(post.id),
      user_fired: firedSet.has(post.id),
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
