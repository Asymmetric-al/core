import { NextRequest, NextResponse } from "next/server";
import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireRole(auth, ["admin", "super_admin"]);
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
      )
      .eq("tenant_id", ctx.tenantId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
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

    const { data: posts, error } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    const { count: flaggedCount } = await supabaseAdmin
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", ctx.tenantId)
      .eq("status", "flagged");

    const { count: hiddenCount } = await supabaseAdmin
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", ctx.tenantId)
      .eq("status", "hidden");

    const { count: totalCount } = await supabaseAdmin
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", ctx.tenantId);

    return NextResponse.json({
      posts: posts || [],
      stats: {
        total: totalCount || 0,
        flagged: flaggedCount || 0,
        hidden: hiddenCount || 0,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Forbidden") ? 403 : 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireRole(auth, ["admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const body = await request.json();
    const {
      content,
      media = [],
      status = "published",
      visibility = "public",
      post_type = "Announcement",
    } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .insert({
        tenant_id: ctx.tenantId,
        missionary_id: null,
        content: content.trim(),
        media,
        status,
        visibility,
        post_type,
      })
      .select("*")
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Forbidden") ? 403 : 500 },
    );
  }
}
