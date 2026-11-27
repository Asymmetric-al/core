import {
  getAuthContext,
  hasContextRoleClass,
  requestScopeOf,
  requireAuth,
  requireRoleClass,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import {
  fetchUserPostInteractions,
  toUserPostInteractionSets,
} from "@asym/database/supabase/post-interactions";
import { type NextRequest, NextResponse } from "next/server";

import { createMissionaryPost } from "./create";
import {
  FEED_POST_AUTHOR_SELECT,
  FEED_POST_SELECT,
  forReader,
  type FeedPostRow,
} from "./select";
import { postsQuerySchema, postWriteSchema } from "../schemas/posts";
import { readJsonBodyOrNull, toErrorResponse } from "../shared/http-errors";
import { createRequestSessionClient } from "../shared/request-session-client";

const NO_STORE = { "Cache-Control": "private, no-store" };

interface AuthorRow {
  id: string;
  author?: unknown;
  post_author_public_name?: string | null;
}

async function withPostAuthors<T extends FeedPostRow>(posts: T[]) {
  if (posts.length === 0) return [];
  const { client, error } = getAdminClient();
  if (!client) throw new Error(error ?? "Admin client unavailable");
  const { data, error: readError } = await client
    .from("posts")
    .select(FEED_POST_AUTHOR_SELECT)
    .in(
      "id",
      posts.map((post) => post.id),
    );
  if (readError) throw readError;
  const authors = new Map(
    ((data ?? []) as unknown as AuthorRow[]).map((row) => [row.id, row]),
  );
  return posts.map((post) => {
    const row =
      post.worker_withheld === true ? undefined : authors.get(post.id);
    return {
      ...post,
      author: row?.author ?? null,
      post_author_public_name: row?.post_author_public_name ?? null,
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext(request);
    requireAuth(auth);
    const ctx = auth as AuthenticatedContext;

    const { searchParams } = new URL(request.url);
    const { limit, offset, status, missionaryId } = postsQuerySchema.parse({
      limit: searchParams.get("limit") ?? "10",
      offset: searchParams.get("offset") ?? "0",
      status: searchParams.get("status") ?? "published",
      missionaryId: searchParams.get("missionaryId"),
    });

    const ownDrafts = status !== "published";
    if (ownDrafts && !hasContextRoleClass(ctx, "missionary")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createRequestSessionClient(
      request,
      requestScopeOf(ctx),
    );
    let query = supabase
      .from("posts")
      .select(FEED_POST_SELECT)
      .eq("tenant_id", ctx.tenantId)
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (ownDrafts) {
      query = query.eq("author_user_id", ctx.userId);
    } else if (missionaryId) {
      query = query.eq("missionary_id", missionaryId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const posts = await withPostAuthors(
      (data ?? []) as unknown as FeedPostRow[],
    );
    if (posts.length === 0)
      return NextResponse.json({ posts: [] }, { headers: NO_STORE });

    const interactionRows = await fetchUserPostInteractions(
      supabase,
      ctx.userId,
      posts.map((post) => post.id),
    );
    const { likedPostIds, prayedPostIds, firedPostIds } =
      toUserPostInteractionSets(interactionRows);

    const postsWithStatus = posts.map((post) => ({
      ...forReader(post, ctx.userId),
      user_liked: likedPostIds.has(post.id),
      user_prayed: prayedPostIds.has(post.id),
      user_fired: firedPostIds.has(post.id),
    }));

    return NextResponse.json({ posts: postsWithStatus }, { headers: NO_STORE });
  } catch (e) {
    return toErrorResponse(e);
  }
}

/** A missionary publishes (or saves as a draft) one of their own updates. */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext(request);
    requireRoleClass(auth, ["missionary"]);
    const ctx = auth as AuthenticatedContext;

    const parsed = postWriteSchema.safeParse(await readJsonBodyOrNull(request));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid update" },
        { status: 400 },
      );
    }

    const result = await createMissionaryPost({
      supabase: await createRequestSessionClient(request, requestScopeOf(ctx)),
      auth: ctx,
      input: parsed.data,
    });
    if (!result.ok) {
      return NextResponse.json(
        result.code
          ? { error: result.error, code: result.code }
          : { error: result.error },
        { status: result.status },
      );
    }

    const unnamed = {
      ...result.post,
      author: null,
      post_author_public_name: null,
    };
    const post = await withPostAuthors([result.post]).then(
      ([named]) => named ?? unnamed,
      (error: unknown) => {
        console.error(
          "[posts] naming a submitted update's author failed",
          error,
        );
        return unnamed;
      },
    );
    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    return toErrorResponse(e);
  }
}
