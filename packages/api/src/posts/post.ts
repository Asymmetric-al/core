import {
  getAuthContext,
  requestScopeOf,
  requireRoleClass,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  commandClient,
  isWorkerNotLinked,
  UPDATE_NOT_SAVED,
  WORKER_NOT_LINKED,
  WORKER_NOT_LINKED_CODE,
} from "./command-client";
import { normalizeStoredPostContent } from "./content";
import { FEED_POST_SELECT } from "./select";
import { postIdParamSchema, postUpdateSchema } from "../schemas/posts";
import { CACHE_TAGS } from "../shared/cache-tags";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../shared/http-errors";
import { findProfileByUserId } from "../shared/queries";
import { createRequestSessionClient } from "../shared/request-session-client";

function revalidatePostTags(postId: string) {
  revalidateTag(CACHE_TAGS.post(postId), "max");
}

function toAuthAwareErrorResponse(error: unknown) {
  // The shared reader's refusals (400, 415) keep their status (fix check G1).
  if (error instanceof ApiHttpError) return toErrorResponse(error);
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const message = error instanceof Error ? error.message : "Internal error";
  if (message === "Unauthorized") {
    // The shared answer: the same 401, marked when the resolver refused the
    // page's tenant or assignment (AL-2675, JB1).
    return toErrorResponse(error);
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
    const auth = await getAuthContext(request);
    requireRoleClass(auth, ["missionary"]);
    const ctx = auth as AuthenticatedContext;
    const { postId } = postIdParamSchema.parse(await params);

    const {
      title,
      content,
      media,
      status,
      visibility,
      post_type,
      autosave,
      expected_updated_at,
    } = postUpdateSchema.parse(await ensureJsonBody(request));
    if (
      title === undefined ||
      content === undefined ||
      visibility === undefined ||
      status === undefined
    ) {
      return NextResponse.json(
        { error: "Send the update’s title, words, visibility and status." },
        { status: 400 },
      );
    }

    const supabase = await createRequestSessionClient(
      request,
      requestScopeOf(ctx),
    );
    const { error: commandError } = await commandClient(supabase).rpc(
      "submit_ministry_update",
      {
        p_tenant_id: ctx.tenantId,
        p_post_id: postId,
        p_title: title ?? null,
        p_content: normalizeStoredPostContent(content),
        p_media: media ?? null,
        p_visibility: visibility,
        p_post_type: post_type ?? null,
        p_publish: status === "published",
        p_expected_updated_at: expected_updated_at ?? null,
        p_expected_draft: autosave === true,
      },
    );
    if (commandError) {
      if (commandError.code === "40001") {
        return NextResponse.json(
          {
            error:
              "This update changed while you were editing. Reload it before saving again.",
          },
          { status: 409 },
        );
      }
      if (isWorkerNotLinked(commandError)) {
        return NextResponse.json(
          { error: WORKER_NOT_LINKED, code: WORKER_NOT_LINKED_CODE },
          { status: 403 },
        );
      }
      if (commandError.code === "42501") {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      if (commandError.code === "22023") {
        return NextResponse.json(
          { error: commandError.message ?? "Invalid update" },
          { status: 400 },
        );
      }
      console.error(
        "[posts] editing through submit_ministry_update failed",
        commandError,
      );
      return NextResponse.json({ error: UPDATE_NOT_SAVED }, { status: 500 });
    }

    revalidatePostTags(postId);
    const { data: post, error } = await supabase
      .from("posts")
      .select(FEED_POST_SELECT)
      .eq("id", postId)
      .single();
    if (error || !post) {
      console.error("[posts] reading back an edited update failed", error);
      return NextResponse.json({ post: { id: postId } });
    }
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

    const auth = await getAuthContext(request);
    requireRoleClass(auth, ["missionary"]);
    const ctx = auth as AuthenticatedContext;
    const { postId } = postIdParamSchema.parse(await params);

    const { data: profile } = await findProfileByUserId(
      supabaseAdmin,
      ctx.userId,
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

    revalidatePostTags(postId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return toAuthAwareErrorResponse(e);
  }
}
