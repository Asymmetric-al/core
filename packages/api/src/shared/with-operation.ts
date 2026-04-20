import {
  getAuthContext,
  requireAuth,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { NextResponse } from "next/server";

import { toApiHttpError, toErrorResponse } from "./http-errors";

import type { UserRole } from "@asym/database/types";
import type { NextRequest } from "next/server";

type AdminSupabaseClient = Exclude<
  ReturnType<typeof getAdminClient>["client"],
  null
>;

export interface OperationContext {
  supabaseAdmin: AdminSupabaseClient;
  auth: AuthenticatedContext;
  audit: ReturnType<typeof createAuditLogger>;
  request: NextRequest;
  requestId: string;
}

export interface OperationOptions {
  roles?: UserRole[];
}

/**
 * Next.js Cache Components may prerender GET Route Handlers. Control-flow errors
 * (bail out / resume at request time) must propagate — never map them to JSON 500s.
 */
function isNextPrerenderControlFlowError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const digest =
    "digest" in error ? (error as { digest?: unknown }).digest : undefined;
  if (
    digest === "NEXT_PRERENDER_INTERRUPTED" ||
    digest === "HANGING_PROMISE_REJECTION"
  ) {
    return true;
  }

  return (
    error instanceof Error && error.message.includes("bail out of prerendering")
  );
}

function isJsonErrorBody(
  body: unknown,
): body is Record<string, unknown> & { error: string } {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
  );
}

/**
 * When the handler returns a non-OK JSON body with `{ error: string }` and no
 * `requestId`, merge `requestId` so clients get a consistent correlation shape.
 * Other JSON shapes pass through unchanged.
 */
async function normalizeHandlerErrorResponse(
  response: NextResponse,
  requestId: string,
): Promise<NextResponse> {
  if (response.ok) {
    return response;
  }

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return response;
  }

  try {
    const body = await response.clone().json();
    if (!isJsonErrorBody(body) || typeof body.requestId === "string") {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.delete("content-length");

    return NextResponse.json(
      { ...body, requestId },
      {
        status: response.status,
        statusText: response.statusText,
        headers,
      },
    );
  } catch {
    return response;
  }
}

export function withOperation(
  handler: (ctx: OperationContext) => Promise<NextResponse>,
  options?: OperationOptions,
): (request: NextRequest) => Promise<NextResponse> {
  return async function operationHandler(request: NextRequest) {
    const requestId = crypto.randomUUID();

    try {
      // With `cacheComponents`, GET Route Handlers can enter the same prerender model
      // as pages. Touching the incoming request opts the handler out of static
      // prerender *before* `next/headers` `cookies()` runs (see Next.js Route Handlers
      // + Cache Components docs: request headers/url stop prerendering).
      void request.headers.get("cookie");

      const { client: supabaseAdmin, error: adminError } = getAdminClient();
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: adminError, requestId },
          { status: 503 },
        );
      }

      const authContext = await getAuthContext(request);
      if (options?.roles) {
        requireRole(authContext, options.roles);
      } else {
        requireAuth(authContext);
      }

      const auth = authContext;
      const audit = createAuditLogger(auth, request);

      const response = await handler({
        supabaseAdmin,
        auth,
        audit,
        request,
        requestId,
      });

      return normalizeHandlerErrorResponse(response, requestId);
    } catch (error) {
      if (isNextPrerenderControlFlowError(error)) {
        throw error;
      }

      const normalized = toApiHttpError(error, "Internal error");
      if (normalized.status >= 500) {
        console.error("[withOperation] Unhandled error:", error);
      }
      return toErrorResponse(error, "Internal error", requestId);
    }
  };
}
