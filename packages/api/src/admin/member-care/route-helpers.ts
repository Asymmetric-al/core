import {
  getAuthContext,
  hasContextCapability,
  scopeRefusedHeaders,
} from "@asym/auth/context";
import { ZodError, type ZodType } from "zod";

import { ApiHttpError, ensureJsonBody } from "../../shared/http-errors";

export type MemberCareContext = {
  tenantId: string;
  userId: string;
  isSuperAdmin: boolean;
};

type AuthResult =
  { ok: true; context: MemberCareContext } | { ok: false; response: Response };

type JsonResult<T = unknown> =
  { ok: true; body: T } | { ok: false; response: Response };

export async function requireMemberCareAccess(
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

  // Any staff member, as before AL-2675; WP4b narrows care reads to
  // `care.access` when it builds the care command (plan WP2 acceptance).
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
      // WP2c moves this to the operator list; no membership yields it.
      isSuperAdmin: auth.role === "super_admin",
    },
  };
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
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: "Invalid request payload.",
        details: error.flatten(),
      },
      { status: 422 },
    );
  }

  return Response.json({ error: fallbackMessage }, { status });
}

export const toMutationErrorResponse = toApiErrorResponse;
