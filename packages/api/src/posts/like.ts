import { createClient } from "@asym/database/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

import {
  revalidatePostReactionTags,
  resolveReactionRouteContext,
} from "./reaction-route-utils";
import { ApiHttpError, toErrorResponse } from "../shared/http-errors";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const supabase = await createClient();
    const { postId, userId, tenantId } = await resolveReactionRouteContext(
      supabase,
      params,
    );

    const { data, error } = await supabase.rpc("atomic_like_post", {
      p_post_id: postId,
      p_user_id: userId,
      p_tenant_id: tenantId,
    });

    if (error) {
      if (error.code === "P0002") {
        throw new ApiHttpError(404, "Post not found");
      }
      throw new ApiHttpError(500, "Failed to register like");
    }

    const result = (data ?? null) as { applied?: boolean } | null;
    if (result?.applied) {
      revalidatePostReactionTags({ postId, tenantId });
    }

    return NextResponse.json({
      success: true,
      applied: Boolean(result?.applied),
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to like post");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const supabase = await createClient();
    const { postId, userId, tenantId } = await resolveReactionRouteContext(
      supabase,
      params,
    );

    const { data, error } = await supabase.rpc("atomic_unlike_post", {
      p_post_id: postId,
      p_user_id: userId,
      p_tenant_id: tenantId,
    });

    if (error) {
      if (error.code === "P0002") {
        throw new ApiHttpError(404, "Post not found");
      }
      throw new ApiHttpError(500, "Failed to remove like");
    }

    const result = (data ?? null) as { applied?: boolean } | null;
    if (result?.applied) {
      revalidatePostReactionTags({ postId, tenantId });
    }

    return NextResponse.json({
      success: true,
      applied: Boolean(result?.applied),
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to unlike post");
  }
}
