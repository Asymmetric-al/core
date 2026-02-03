import { NextRequest, NextResponse } from "next/server";
import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { getAdminClient } from "@asym/database/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireRole(auth, ["missionary"]);
    const ctx = auth as AuthenticatedContext;
    const audit = createAuditLogger(ctx, request);
    const { postId } = await params;

    const body = await request.json();
    const { content, media, status, visibility, post_type } = body;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", ctx.userId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: existingPost } = await supabaseAdmin
      .from("posts")
      .select("missionary_id")
      .eq("id", postId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.missionary_id !== profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = { updated_at: new RegExp("now()") };
    if (content !== undefined) updateData.content = content.trim();
    if (media !== undefined) updateData.media = media;
    if (status !== undefined) updateData.status = status;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (post_type !== undefined) updateData.post_type = post_type;

    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .update(updateData)
      .eq("id", postId)
      .select(
        `
        *,
        author:profiles!missionary_id(id, first_name, last_name, avatar_url)
      `,
      )
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    await audit.logPost(postId, "post_updated");
    return NextResponse.json({ post });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireRole(auth, ["missionary"]);
    const ctx = auth as AuthenticatedContext;
    const audit = createAuditLogger(ctx, request);
    const { postId } = await params;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", ctx.userId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: existingPost } = await supabaseAdmin
      .from("posts")
      .select("missionary_id")
      .eq("id", postId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.missionary_id !== profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await audit.logPost(postId, "post_deleted");
    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
