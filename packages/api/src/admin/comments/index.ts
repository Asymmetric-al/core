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
    const postId = searchParams.get("postId");

    let query = supabaseAdmin
      .from("post_comments")
      .select(
        `
        *,
        author:profiles!user_id(id, first_name, last_name, avatar_url, full_name),
        post:posts!post_id!inner(id, content, missionary_id, tenant_id)
      `,
      )
      .eq("posts.tenant_id", ctx.tenantId);

    if (postId) {
      query = query.eq("post_id", postId);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: comments, error } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ comments: comments ?? [] });
  } catch (e) {
    return toErrorResponse(e);
  }
}
