import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";
import { ZodError, type ZodType } from "zod";

export type SupportHubContext = {
  tenantId: string;
  userId: string;
  isSuperAdmin: boolean;
};

type AuthResult =
  | { ok: true; context: SupportHubContext }
  | { ok: false; response: Response };

type JsonResult<T = unknown> =
  | { ok: true; body: T }
  | { ok: false; response: Response };

/**
 * Auth gate for every Support Hub route handler. Mirrors
 * `requireMemberCareAccess()` from `@asym/api/admin/member-care/route-helpers`
 * so the access-control posture stays identical to the rest of Mission
 * Control's admin surface.
 *
 * Roles allowed: staff, admin, super_admin. The `/support` nav entry already
 * gates on `member_care | admin` so admin demos with a staff role still pass.
 */
export async function requireSupportHubAccess(): Promise<AuthResult> {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated || !auth.userId || !auth.tenantId) {
    return {
      ok: false,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!hasAnyContextRole(auth, ["staff", "admin", "super_admin"])) {
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
      isSuperAdmin:
        auth.role === "super_admin" || auth.profileRole === "super_admin",
    },
  };
}

export async function readJsonBody<T = unknown>(
  request: Request,
  schema?: ZodType<T>,
): Promise<JsonResult<T>> {
  try {
    const body = await request.json();
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
  } catch {
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
      { error: "Invalid request payload.", details: error.flatten() },
      { status: 422 },
    );
  }
  return Response.json({ error: fallbackMessage }, { status });
}
