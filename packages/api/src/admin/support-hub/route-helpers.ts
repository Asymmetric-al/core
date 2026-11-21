import {
  getAuthContext,
  hasContextCapability,
  scopeRefusedHeaders,
  isTenantAdministrator,
} from "@asym/auth/context";
import { ZodError, type ZodType } from "zod";

import { supportHubAdapter } from "./adapter";
import { SupportCannedResponseError } from "./canned-response-error";
import { matchSupportAgentId, SupportHubForbiddenError } from "./ownership";
import { runWithSupportHubTenant } from "./request-context";
import { ApiHttpError, ensureJsonBody } from "../../shared/http-errors";

export type SupportHubContext = {
  tenantId: string;
  userId: string;
  userEmail: string | null;
  isSuperAdmin: boolean;
  /** Support admins manage every agent’s preferences and saved views. */
  canManageAll: boolean;
};

type AuthResult =
  { ok: true; context: SupportHubContext } | { ok: false; response: Response };

type JsonResult<T = unknown> =
  { ok: true; body: T } | { ok: false; response: Response };

/**
 * Auth gate for every Support Hub route handler. Mirrors
 * `requireMemberCareAccess()` from `@asym/api/admin/member-care/route-helpers`
 * so the access-control posture stays identical to the rest of Mission
 * Control's admin surface.
 *
 * Any staff member works the Support Hub (plan 5.4: a live staff membership
 * of any sub-role), which the registry expresses as `admin.dashboard.access`.
 * The tenant administrator manages every agent's preferences and views
 * (AL-2675).
 */
export async function requireSupportHubAccess(
  request?: Request,
): Promise<AuthResult> {
  const auth = await getAuthContext(request);

  if (!auth.isAuthenticated || !auth.userId || !auth.tenantId) {
    return {
      ok: false,
      // A refused tenant or assignment is marked for the browser (JB1).
      response: Response.json(
        { error: "Unauthorized" },
        { status: 401, headers: scopeRefusedHeaders(auth) },
      ),
    };
  }

  if (!hasContextCapability(auth, "admin.dashboard.access")) {
    return {
      ok: false,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true,
    context: {
      tenantId: auth.tenantId,
      userId: auth.userId,
      userEmail: auth.email,
      // WP2c moves this to the operator list; no membership yields it.
      isSuperAdmin: auth.role === "super_admin",
      canManageAll: isTenantAdministrator(auth),
    },
  };
}

/**
 * Runs the handler after `requireSupportHubAccess()` succeeds, binding the
 * authenticated tenant that the adapter scopes every read and write to.
 */
export async function withSupportHubAccess(
  request: Request,
  handler: (context: SupportHubContext) => Promise<Response>,
): Promise<Response> {
  const auth = await requireSupportHubAccess(request);
  if (!auth.ok) return auth.response;
  return runWithSupportHubTenant(auth.context.tenantId, () =>
    handler(auth.context),
  );
}

export async function resolveCurrentSupportAgentId(
  context: SupportHubContext,
): Promise<string | null> {
  return matchSupportAgentId(await supportHubAdapter.agents.list(), context);
}

export async function readJsonBody<T = unknown>(
  request: Request,
  schema?: ZodType<T>,
): Promise<JsonResult<T>> {
  try {
    const body = await ensureJsonBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return {
        ok: false,
        response: Response.json(
          { error: "JSON body must be an object." },
          { status: 400 },
        ),
      };
    }
    if (schema) {
      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return {
          ok: false,
          response: Response.json(
            {
              error: "Invalid request payload.",
              details: parsed.error.flatten(),
            },
            { status: 422 },
          ),
        };
      }
      return { ok: true, body: parsed.data };
    }
    return { ok: true, body: body as T };
  } catch (error) {
    // The shared reader refuses a body that is not JSON (fix check G1).
    if (error instanceof ApiHttpError && error.status === 415)
      return {
        ok: false,
        response: Response.json({ error: error.message }, { status: 415 }),
      };
    return {
      ok: false,
      response: Response.json({ error: "Invalid JSON body." }, { status: 400 }),
    };
  }
}

export function toApiErrorResponse(
  error: unknown,
  fallbackMessage: string,
  status = 500,
): Response {
  if (error instanceof SupportCannedResponseError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof SupportHubForbiddenError) {
    return Response.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof ZodError) {
    return Response.json(
      { error: "Invalid request payload.", details: error.flatten() },
      { status: 422 },
    );
  }
  if (
    error instanceof Error &&
    error.message === "SUPPORT_HUB_TENANT_MISMATCH"
  ) {
    return Response.json(
      {
        error:
          "Support Hub is not available for this workspace in the current preview.",
      },
      { status: 403 },
    );
  }
  return Response.json({ error: fallbackMessage }, { status });
}
