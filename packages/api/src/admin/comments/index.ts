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
        post:posts!post_id!inner(id, content, missionary_id, tenant_id)
      `,
        { count: "exact" },
      )
      .eq("post.tenant_id", ctx.tenantId);

    if (postId) {
      query = query.eq("post_id", postId);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: comments, error, count } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    const authorIds = [
      ...new Set(
        (comments ?? [])
          .map((comment) => comment.user_id)
          .filter((id): id is string => !!id),
      ),
    ];
    const authors = new Map<
      string,
      {
        id: string;
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
        full_name: string;
      }
    >();
    if (authorIds.length > 0) {
      // Comments reference auth.users, so profiles must be read separately.
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, first_name, last_name, full_name, avatar_url")
        .eq("tenant_id", ctx.tenantId)
        .in("id", authorIds);
      if (profileError)
        return NextResponse.json(
          { error: profileError.message },
          { status: 500 },
        );
      for (const profile of profiles ?? []) {
        authors.set(profile.id, {
          ...profile,
          full_name:
            profile.full_name?.trim() ||
            [profile.first_name, profile.last_name]
              .filter(Boolean)
              .join(" ")
              .trim(),
        });
      }
    }
    return NextResponse.json({
      comments: (comments ?? []).map((comment) => ({
        ...comment,
        author: authors.get(comment.user_id ?? "") ?? null,
      })),
      total: count ?? null,
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}
