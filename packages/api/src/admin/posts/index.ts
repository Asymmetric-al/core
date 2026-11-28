import {
  getAuthContext,
  requestScopeOf,
  requireCapability,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { toErrorResponse } from "../../shared/http-errors";
import { createRequestSessionClient } from "../../shared/request-session-client";

const STAFF_AUTHOR_SELECT =
  "id, author:profiles!missionary_id(id, first_name, last_name, avatar_url, role)";

interface StaffAuthorRow {
  id: string;
  author?: unknown;
}

export async function withStaffPostAuthors<T extends { id: string }>(
  posts: T[],
) {
  if (posts.length === 0) return [];
  const { client, error } = getAdminClient();
  if (!client) throw new Error(error ?? "Admin client unavailable");
  const { data, error: readError } = await client
    .from("posts")
    .select(STAFF_AUTHOR_SELECT)
    .in(
      "id",
      posts.map((post) => post.id),
    );
  if (readError) throw readError;
  const authors = new Map(
    ((data ?? []) as unknown as StaffAuthorRow[]).map((row) => [
      row.id,
      row.author ?? null,
    ]),
  );
  return posts.map((post) => ({
    ...post,
    author: authors.get(post.id) ?? null,
  }));
}

const listOf = (value: string | null) =>
  (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext(request);
    requireCapability(auth, "admin.dashboard.access");
    const ctx = auth as AuthenticatedContext;
    const supabase = await createRequestSessionClient(
      request,
      requestScopeOf(ctx),
    );

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const statuses = listOf(searchParams.get("status"));
    const reviewStates = listOf(searchParams.get("reviewState"));
    const missionaryId = searchParams.get("missionaryId");
    const visibility = searchParams.get("visibility");
    const postType = searchParams.get("postType");

    let query = supabase
      .from("posts")
      .select("*", { count: "exact" })
      .eq("tenant_id", ctx.tenantId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (statuses.length === 1) query = query.eq("status", statuses[0]!);
    else if (statuses.length > 1) query = query.in("status", statuses);
    if (reviewStates.length === 1)
      query = query.eq("review_state", reviewStates[0]!);
    else if (reviewStates.length > 1)
      query = query.in("review_state", reviewStates);
    if (missionaryId) query = query.eq("missionary_id", missionaryId);
    if (visibility) query = query.eq("visibility", visibility);
    if (postType) query = query.eq("post_type", postType);

    const { data: posts, error, count: filteredCount } = await query;
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    const counted = (column?: string, value?: string) => {
      let count = supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", ctx.tenantId);
      if (column && value) count = count.eq(column, value);
      return count;
    };
    const flagged = await counted("status", "flagged");
    const hidden = await counted("status", "hidden");
    const total = await counted();
    const waiting = await counted("review_state", "submitted");

    const countError =
      flagged.error ?? hidden.error ?? total.error ?? waiting.error;
    if (countError)
      return NextResponse.json({ error: countError.message }, { status: 500 });
    if (
      filteredCount === null ||
      flagged.count === null ||
      hidden.count === null ||
      total.count === null ||
      waiting.count === null
    ) {
      return NextResponse.json(
        { error: "Post counts unavailable" },
        { status: 500 },
      );
    }
    return NextResponse.json(
      {
        total: filteredCount,
        posts: await withStaffPostAuthors(
          (posts ?? []) as unknown as { id: string }[],
        ),
        stats: {
          total: total.count,
          flagged: flagged.count,
          hidden: hidden.count,
          waiting: waiting.count,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return toErrorResponse(e);
  }
}

/** Read-only demo: admin post creation disabled. */
export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}
