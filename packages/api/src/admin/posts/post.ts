import { NextRequest, NextResponse } from "next/server";
import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireRole(auth, ["admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;
    const { postId } = await params;

    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .select(
        `
        *,
        author:profiles!missionary_id(id, first_name, last_name, avatar_url, role)
      `,
      )
      .eq("id", postId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    requireRole(auth, ["admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;
    const { postId } = await params;

    const body = await request.json();
    const { action, content, status, visibility, post_type, is_pinned } = body;

    const { data: existingPost } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("id", postId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (action) {
      switch (action) {
        case "approve":
          updateData.status = "published";
          break;
        case "hide":
          updateData.status = "hidden";
          break;
        case "flag":
          updateData.status = "flagged";
          break;
        case "restore":
          updateData.status = "published";
          break;
        case "pin":
          updateData.is_pinned = true;
          break;
        case "unpin":
          updateData.is_pinned = false;
          break;
      }
    }

    if (content !== undefined) updateData.content = content.trim();
    if (status !== undefined) updateData.status = status;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (post_type !== undefined) updateData.post_type = post_type;
    if (is_pinned !== undefined) updateData.is_pinned = is_pinned;

    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .update(updateData)
      .eq("id", postId)
      .select(
        `
        *,
        author:profiles!missionary_id(id, first_name, last_name, avatar_url, role)
      `,
      )
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ post });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireRole(auth, ["admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;
    const { postId } = await params;

    const { data: existingPost } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("id", postId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await supabaseAdmin.from("post_comments").delete().eq("post_id", postId);
    await supabaseAdmin.from("post_likes").delete().eq("post_id", postId);
    await supabaseAdmin.from("post_prayers").delete().eq("post_id", postId);
    await supabaseAdmin.from("post_fires").delete().eq("post_id", postId);

    const { error } = await supabaseAdmin
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
