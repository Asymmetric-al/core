import { getAuthContext, requestScopeOf } from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { NextResponse } from "next/server";

import {
  applyMinistryUpdateReaction,
  type MinistryUpdateReactionKind,
} from "./ministry-update-reaction";
import { resolveReactionRouteContext } from "./reaction-route-utils";
import { ApiHttpError, toErrorResponse } from "../shared/http-errors";
import { createRequestSessionClient } from "../shared/request-session-client";

import type { NextRequest } from "next/server";

/**
 * HTTP adapters name the Ministry Update Reaction Command kind and own
 * surface copy. The command owns RPC names and cache revalidation.
 */
interface ReactionMutationConfig {
  kind: MinistryUpdateReactionKind;
  /** 500 body when the command reports a non-not-found failure. */
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
  return async (request, { params }) => {
    try {
      const auth = await getAuthContext(request);
      // The caller's token, sending the resolved tenant and assignment
      // (plan 5.4; WP2b, AL-2675): the bearer token first, as
      // `getAuthContext` authenticated it, otherwise the cookies (JB13).
      const supabase = await createRequestSessionClient(
        request,
        requestScopeOf(auth),
      );
      const { postId, userId, tenantId } = await resolveReactionRouteContext(
        auth,
        supabase,
        params,
      );

      const { client: supabaseAdmin, error: adminError } = getAdminClient();
      if (!supabaseAdmin) {
        throw new ApiHttpError(503, adminError || "Admin client unavailable");
      }

      const result = await applyMinistryUpdateReaction({
        rpc: async (name, rpcArgs) => {
          const response = await supabaseAdmin.rpc(name, rpcArgs as never);
          return { data: response.data, error: response.error };
        },
        kind: config.kind,
        postId,
        userId,
        tenantId,
      });

      if (!result.ok) {
        switch (result.code) {
          case "not_found":
            throw new ApiHttpError(404, "Post not found");
          case "failed":
            throw new ApiHttpError(500, config.failureMessage);
          default: {
            const _exhaustive: never = result;
            throw new ApiHttpError(500, String(_exhaustive));
          }
        }
      }

      return NextResponse.json({
        success: true,
        applied: result.applied,
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
