import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { toErrorResponse } from "../../shared/http-errors";

export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext(request);
    requireRole(auth, ["staff", "admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const missionaryId = searchParams.get("missionaryId");
    const visibility = searchParams.get("visibility");
    const postType = searchParams.get("postType");

    let query = supabaseAdmin
      .from("posts")
      .select(
        `
        *,
        author:profiles!missionary_id(id, first_name, last_name, avatar_url, role)
      `,
        { count: "exact" },
      )
      .eq("tenant_id", ctx.tenantId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      const statuses = status
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      if (statuses.length === 1) query = query.eq("status", statuses[0]!);
      else if (statuses.length > 1) query = query.in("status", statuses);
    }

    if (missionaryId) {
      query = query.eq("missionary_id", missionaryId);
    }

    if (visibility) {
      query = query.eq("visibility", visibility);
    }

    if (postType) {
      query = query.eq("post_type", postType);
    }

    const { data: posts, error, count: filteredCount } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    const { count: flaggedCount, error: flaggedError } = await supabaseAdmin
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", ctx.tenantId)
      .eq("status", "flagged");

    const { count: hiddenCount, error: hiddenError } = await supabaseAdmin
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", ctx.tenantId)
      .eq("status", "hidden");

    const { count: totalCount, error: totalError } = await supabaseAdmin
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", ctx.tenantId);

    const countError = flaggedError ?? hiddenError ?? totalError;
    if (countError)
      return NextResponse.json({ error: countError.message }, { status: 500 });
    if (
      filteredCount === null ||
      flaggedCount === null ||
      hiddenCount === null ||
      totalCount === null
    ) {
      return NextResponse.json(
        { error: "Post counts unavailable" },
        { status: 500 },
      );
    }
    return NextResponse.json({
      total: filteredCount,
      posts: posts || [],
      stats: {
        total: totalCount,
        flagged: flaggedCount,
        hidden: hiddenCount,
      },
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}

/** Read-only demo: admin post creation disabled. */
export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: "Read-only demo" }, { status: 403 });
}
