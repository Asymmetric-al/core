import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";
import { ZodError } from "zod";

type MemberCareContext = {
  tenantId: string;
  userId: string;
};

type AuthResult =
  | { ok: true; context: MemberCareContext }
  | { ok: false; response: Response };

type JsonResult =
  | { ok: true; body: unknown }
  | { ok: false; response: Response };

export async function requireMemberCareAccess(): Promise<AuthResult> {
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
    },
  };
}

export async function readJsonBody(request: Request): Promise<JsonResult> {
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

    return { ok: true, body };
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
