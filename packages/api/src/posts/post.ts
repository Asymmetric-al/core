import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { normalizeStoredPostContent } from "./content";
import { postIdParamSchema } from "../schemas/posts";
import { CACHE_TAGS } from "../shared/cache-tags";
import { findProfileByUserId } from "../shared/queries";

function revalidatePostTags(postId: string, tenantId: string) {
  revalidateTag(CACHE_TAGS.tenantPosts(tenantId), "max");
  revalidateTag(CACHE_TAGS.post(postId), "max");
}

function toAuthAwareErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const message = error instanceof Error ? error.message : "Internal error";
  if (message === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (message.startsWith("Forbidden")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ error: message }, { status: 500 });
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
    requireRole(auth, ["missionary"]);
    const ctx = auth as AuthenticatedContext;
    const { postId } = postIdParamSchema.parse(await params);

    const body = await request.json();
    const { content, media, status, visibility, post_type } = body;

    const { data: profile } = await findProfileByUserId(
      supabaseAdmin,
      ctx.userId,
      ctx.tenantId,
    );

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

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (content !== undefined) {
      updateData.content = normalizeStoredPostContent(content);
    }
    if (media !== undefined) updateData.media = media;
    if (status !== undefined) updateData.status = status;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (post_type !== undefined) updateData.post_type = post_type;

    const { error: rpcError } = await supabaseAdmin.rpc(
      "atomic_update_post_with_audit",
      {
        p_post_id: postId,
        p_tenant_id: ctx.tenantId,
        p_actor_user_id: ctx.userId,
        p_updates: updateData,
        p_audit_action: "post_updated",
        p_ip_address: request.headers.get("x-forwarded-for"),
        p_user_agent: request.headers.get("user-agent"),
      },
    );
    if (rpcError) {
      if (rpcError.code === "P0002") {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .select(
        `
        *,
        author:profiles!missionary_id(id, first_name, last_name, avatar_url)
      `,
      )
      .eq("id", postId)
      .single();
    if (error || !post) {
      return NextResponse.json(
        { error: error?.message ?? "Post not found" },
        { status: 500 },
      );
    }

    revalidatePostTags(postId, ctx.tenantId);
    return NextResponse.json({ post });
  } catch (e) {
    return toAuthAwareErrorResponse(e);
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
    const { postId } = postIdParamSchema.parse(await params);

    const { data: profile } = await findProfileByUserId(
      supabaseAdmin,
      ctx.userId,
      ctx.tenantId,
    );

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

    const { error } = await supabaseAdmin.rpc("atomic_delete_post_with_audit", {
      p_post_id: postId,
      p_tenant_id: ctx.tenantId,
      p_actor_user_id: ctx.userId,
      p_audit_action: "post_deleted",
      p_details: {},
      p_ip_address: request.headers.get("x-forwarded-for"),
      p_user_agent: request.headers.get("user-agent"),
    });

    if (error) {
      if (error.code === "P0002") {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePostTags(postId, ctx.tenantId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return toAuthAwareErrorResponse(e);
  }
}
