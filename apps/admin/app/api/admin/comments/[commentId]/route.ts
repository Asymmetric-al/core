import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, requireRole } from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireRole(auth, ["admin", "super_admin"]);
    const { commentId } = await params;

    const body = await request.json();
    const { content } = body;

    const { data: existingComment } = await supabaseAdmin
      .from("post_comments")
      .select("*, post:posts!post_id(tenant_id)")
      .eq("id", commentId)
      .single();

    if (!existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (content !== undefined) {
      updateData.content = content.trim();
    }

    const { data: comment, error } = await supabaseAdmin
      .from("post_comments")
      .update(updateData)
      .eq("id", commentId)
      .select(
        `
        *,
        author:profiles!user_id(id, first_name, last_name, avatar_url, full_name)
      `,
      )
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ comment });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext();
    requireRole(auth, ["admin", "super_admin"]);
    const { commentId } = await params;

    const { data: existingComment } = await supabaseAdmin
      .from("post_comments")
      .select("*")
      .eq("id", commentId)
      .single();

    if (!existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    await supabaseAdmin
      .from("post_comments")
      .delete()
      .eq("parent_id", commentId);

    const { error } = await supabaseAdmin
      .from("post_comments")
      .delete()
      .eq("id", commentId);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
