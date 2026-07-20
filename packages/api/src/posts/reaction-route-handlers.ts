import { getAdminClient } from "@asym/database/supabase/admin";
import { createClient } from "@asym/database/supabase/server";
import { NextResponse } from "next/server";

import {
  revalidatePostReactionTags,
  resolveReactionRouteContext,
} from "./reaction-route-utils";
import { ApiHttpError, toErrorResponse } from "../shared/http-errors";

import type { NextRequest } from "next/server";

/**
 * The atomic reaction RPCs are service_role-only by migration grant
 * (REVOKEd from anon/authenticated), so every handler must go through the
 * admin client after the request-scoped auth and tenant validation.
 */
type ReactionRpcName =
  | "atomic_like_post"
  | "atomic_unlike_post"
  | "atomic_pray_for_post"
  | "atomic_unpray_for_post"
  | "atomic_fire_post"
  | "atomic_unfire_post";

interface ReactionMutationConfig {
  rpc: ReactionRpcName;
  /** 500 body when the RPC fails for any reason other than P0002. */
  failureMessage: string;
  /** Fallback message for unexpected errors anywhere in the handler. */
  fallbackMessage: string;
}

export interface ReactionRouteConfig {
  apply: ReactionMutationConfig;
  remove: ReactionMutationConfig;
}

type ReactionRouteHandler = (
  request: NextRequest,
  context: { params: Promise<{ postId: string }> },
) => Promise<Response>;

function createReactionMutationHandler(
  config: ReactionMutationConfig,
): ReactionRouteHandler {
  return async (_request, { params }) => {
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

      const { data, error } = await supabaseAdmin.rpc(config.rpc, {
        p_post_id: postId,
        p_user_id: userId,
        p_tenant_id: tenantId,
      });

      if (error) {
        if (error.code === "P0002") {
          throw new ApiHttpError(404, "Post not found");
        }
        throw new ApiHttpError(500, config.failureMessage);
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
      return toErrorResponse(error, config.fallbackMessage);
    }
  };
}

export function createReactionRouteHandlers(config: ReactionRouteConfig): {
  POST: ReactionRouteHandler;
  DELETE: ReactionRouteHandler;
} {
  return {
    POST: createReactionMutationHandler(config.apply),
    DELETE: createReactionMutationHandler(config.remove),
  };
}
