import {
  getAuthContext,
  requireCapability,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

import { toErrorResponse } from "../../shared/http-errors";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext(request);
    requireCapability(auth, "admin.dashboard.access");
    const ctx = auth as AuthenticatedContext;
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

    const postRow = existingComment.post as { tenant_id?: string } | null;
    if (
      !postRow ||
      typeof postRow.tenant_id !== "string" ||
      postRow.tenant_id !== ctx.tenantId
    ) {
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
    // The shared answer: the guard's refusal of a proposed scope keeps its
    // 401 and its mark, any other error its status (check of the fix lists,
    // JR8).
    return toErrorResponse(e);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

    const auth = await getAuthContext(request);
    requireCapability(auth, "admin.dashboard.access");
    const ctx = auth as AuthenticatedContext;
    const { commentId } = await params;

    const { error } = await supabaseAdmin.rpc("atomic_delete_comment_thread", {
      p_comment_id: commentId,
      p_tenant_id: ctx.tenantId,
      p_actor_user_id: ctx.userId,
      p_ip_address: request.headers.get("x-forwarded-for"),
      p_user_agent: request.headers.get("user-agent"),
    });
    if (error) {
      if (error.code === "P0002") {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    // The shared answer: the guard's refusal of a proposed scope keeps its
    // 401 and its mark, any other error its status (check of the fix lists,
    // JR8).
    return toErrorResponse(e);
  }
}
