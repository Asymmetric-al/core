import { getAdminClient } from "@asym/database/supabase/admin";
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

    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      throw new ApiHttpError(503, adminError || "Admin client unavailable");
    }

    const { data, error } = await supabaseAdmin.rpc("atomic_pray_for_post", {
      p_post_id: postId,
      p_user_id: userId,
      p_tenant_id: tenantId,
    });

    if (error) {
      if (error.code === "P0002") {
        throw new ApiHttpError(404, "Post not found");
      }
      throw new ApiHttpError(500, "Failed to register prayer");
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
    return toErrorResponse(error, "Failed to pray for post");
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

    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      throw new ApiHttpError(503, adminError || "Admin client unavailable");
    }

    const { data, error } = await supabaseAdmin.rpc("atomic_unpray_for_post", {
      p_post_id: postId,
      p_user_id: userId,
      p_tenant_id: tenantId,
    });

    if (error) {
      if (error.code === "P0002") {
        throw new ApiHttpError(404, "Post not found");
      }
      throw new ApiHttpError(500, "Failed to remove prayer");
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
    return toErrorResponse(error, "Failed to remove prayer");
  }
}
