import {
  getAuthContext,
  requireCapability,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { toErrorResponse } from "../../shared/http-errors";
import { listTenantMembers } from "../../shared/tenant-members";

export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext(request);
    requireCapability(auth, "admin.dashboard.access");
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
      // Comments reference auth.users. An author is shown when their login
      // holds a membership in this tenant, revoked ones included since their
      // comments remain (AL-2675, NR-68); profiles are then read by id.
      let profileToUser: Map<string, string>;
      try {
        const members = await listTenantMembers(supabaseAdmin, ctx.tenantId, {
          userIds: authorIds,
          includeRevoked: true,
        });
        profileToUser = new Map(members.map((m) => [m.profileId, m.userId]));
      } catch (memberError) {
        return NextResponse.json(
          { error: (memberError as Error).message },
          { status: 500 },
        );
      }
      const { data: profiles, error: profileError } =
        profileToUser.size > 0
          ? await supabaseAdmin
              .from("profiles")
              .select("id, first_name, last_name, full_name, avatar_url")
              .in("id", [...profileToUser.keys()])
          : { data: [], error: null };
      if (profileError)
        return NextResponse.json(
          { error: profileError.message },
          { status: 500 },
        );
      for (const profile of profiles ?? []) {
        authors.set(profileToUser.get(profile.id) ?? profile.id, {
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
