import {
  getAuthContext,
  requestScopeOf,
  requireAuth,
  requireCapability,
  requireRoleClass,
  requireTenantAdministrator,
  type AuthenticatedContext,
  type Capability,
  type RoleClass,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { NextResponse } from "next/server";

import {
  reportOperationFailure,
  toApiHttpError,
  toErrorResponse,
} from "./http-errors";
import { confirmPlatformOperator } from "./platform-operator";
import {
  createRequestSessionClient,
  requestCarriesSupabaseSession,
  type RequestSessionClient,
} from "./request-session-client";

import type { NextRequest } from "next/server";

type AdminSupabaseClient = Exclude<
  ReturnType<typeof getAdminClient>["client"],
  null
>;

export interface OperationRouteContext {
  params?: Promise<Record<string, string | string[] | undefined>>;
}

interface BaseOperationContext {
  auth: AuthenticatedContext;
  audit: ReturnType<typeof createAuditLogger>;
  request: NextRequest;
  requestId: string;
  routeContext?: OperationRouteContext;
  /**
   * Whether the caller is a platform operator whose session passed a second
   * factor: the shared operator check (plan 5.4), run in the database on the
   * caller's own token, at most once per request (AL-2675 WP2c).
   */
  isPlatformOperator: () => Promise<boolean>;
}

export interface OperationContext extends BaseOperationContext {
  sessionClient: RequestSessionClient;
}

export interface PlatformOperationContext extends BaseOperationContext {
  supabaseAdmin: AdminSupabaseClient;
}

/**
 * Who may run the operation (AL-2675). Each option given must pass. A handler
 * names the registry capability its action needs (plan 5.4), the tenant
 * administrator where the plan makes the action theirs, the membership
 * classes it serves, or, for a platform gate, the platform operator.
 */
export interface OperationOptions {
  capability?: Capability;
  tenantAdministrator?: true;
  roleClasses?: readonly RoleClass[];
  /**
   * A platform gate (WP2c): the caller must pass the shared operator and
   * second-factor check in the database. It replaces the `super_admin` role
   * name, which no membership holds; a handler names no role name.
   */
  platformOperator?: true;
}

const NOT_AN_OPERATOR =
  "Forbidden: requires a platform operator whose session passed a second factor";

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

function authenticatedOperation<
  RouteContext extends OperationRouteContext = OperationRouteContext,
>(
  handler: (
    ctx: BaseOperationContext,
    routeContext?: RouteContext,
  ) => Promise<NextResponse>,
  options?: OperationOptions,
): (
  request: NextRequest,
  routeContext?: RouteContext,
) => Promise<NextResponse> {
  return async function operationHandler(
    request: NextRequest,
    routeContext?: RouteContext,
  ) {
    const requestId = crypto.randomUUID();

    try {
      // With `cacheComponents`, GET Route Handlers can enter the same prerender model
      // as pages. Touching the incoming request opts the handler out of static
      // prerender *before* `next/headers` `cookies()` runs (see Next.js Route Handlers
      // + Cache Components docs: request headers/url stop prerendering).
      void request.headers.get("cookie");

      const authContext = await getAuthContext(request);
      requireAuth(authContext);
      if (options?.roleClasses) {
        requireRoleClass(authContext, options.roleClasses);
      }
      if (options?.capability) {
        requireCapability(authContext, options.capability);
      }
      if (options?.tenantAdministrator) {
        requireTenantAdministrator(authContext);
      }

      let operatorCheck: Promise<boolean> | null = null;
      const isPlatformOperator = () =>
        (operatorCheck ??= confirmPlatformOperator({
          request,
          userId: authContext.userId,
          scope: requestScopeOf(authContext),
        }));
      if (options?.platformOperator && !(await isPlatformOperator())) {
        throw new Error(NOT_AN_OPERATOR);
      }

      const auth = authContext;
      const audit = createAuditLogger(auth, request);

      const response = await handler(
        {
          auth,
          audit,
          request,
          requestId,
          routeContext,
          isPlatformOperator,
        },
        routeContext,
      );

      return normalizeHandlerErrorResponse(response, requestId);
    } catch (error) {
      if (isNextPrerenderControlFlowError(error)) {
        throw error;
      }

      const normalized = toApiHttpError(error, "Internal error");
      if (normalized.status >= 500) {
        await reportOperationFailure(
          "withOperation",
          error,
          requestId,
          normalized.status,
        );
      }
      return toErrorResponse(error, "Internal error", requestId);
    }
  };
}

type OperationHandler<Context, RouteContext extends OperationRouteContext> = (
  ctx: Context,
  routeContext?: RouteContext,
) => Promise<NextResponse>;

export function withOperation<
  RouteContext extends OperationRouteContext = OperationRouteContext,
>(
  handler: OperationHandler<OperationContext, RouteContext>,
  options?: OperationOptions,
) {
  return authenticatedOperation<RouteContext>(async (context, routeContext) => {
    const scope = requestScopeOf(context.auth);
    // Defense in depth: requireAuth above already requires the active assignment.
    if (!scope)
      return NextResponse.json(
        { error: "Active assignment required" },
        { status: 403 },
      );
    if (!requestCarriesSupabaseSession(context.request)) {
      return NextResponse.json(
        { error: "A Supabase session is required.", code: "SESSION_REQUIRED" },
        { status: 401 },
      );
    }
    const sessionClient = await createRequestSessionClient(
      context.request,
      scope,
    );
    return handler({ ...context, sessionClient }, routeContext);
  }, options);
}

export function withPlatformOperation<
  RouteContext extends OperationRouteContext = OperationRouteContext,
>(
  handler: OperationHandler<PlatformOperationContext, RouteContext>,
  options?: OperationOptions,
) {
  return authenticatedOperation<RouteContext>(async (context, routeContext) => {
    const { client: supabaseAdmin, error } = getAdminClient();
    if (!supabaseAdmin) return NextResponse.json({ error }, { status: 503 });
    return handler({ ...context, supabaseAdmin }, routeContext);
  }, options);
}
