import {
  getAuthContext,
  requireCapability,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { unstable_rethrow } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";

import { ApiHttpError } from "../shared/api-http-error";
import {
  createRequestSessionClient,
  type RequestSessionClient,
} from "../shared/request-session-client";
import { isMediaVariantName } from "../storage/media-constants";
import { readMediaVariant } from "../storage/media-store";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PRIVATE_NO_CACHE_HEADERS = {
  "Cache-Control": "private, no-cache",
  "X-Content-Type-Options": "nosniff",
} as const;

function getBearerToken(request: Request): string | null {
  const authorizationHeader = request.headers.get("authorization")?.trim();
  if (!authorizationHeader) {
    return null;
  }
  const [scheme, ...tokenParts] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer") {
    return null;
  }
  const token = tokenParts.join(" ").trim();
  return token || null;
}

function emptyResponse(status: 401 | 404): NextResponse {
  return new NextResponse(null, {
    status,
    headers: PRIVATE_NO_CACHE_HEADERS,
  });
}

async function createMediaSessionClient(
  request: Request,
): Promise<RequestSessionClient> {
  try {
    return await createRequestSessionClient(request, null);
  } catch (error) {
    unstable_rethrow(error);
    const { url, key } = getSupabasePublicConfig();
    if (!url || !key) {
      throw new ApiHttpError(503, "Media auth unavailable");
    }
    const requestCookies = parseCookieHeader(
      request.headers.get("cookie") ?? "",
    ).flatMap(({ name, value }) =>
      typeof value === "string" ? [{ name, value }] : [],
    );
    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return requestCookies;
        },
        setAll() {},
      },
    }) as unknown as RequestSessionClient;
  }
}

function parseMediaAccessRow(data: unknown): {
  tenantId: string;
  assignmentId: string;
} | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") {
    return null;
  }
  const tenantId =
    "tenant_id" in row && typeof row.tenant_id === "string"
      ? row.tenant_id
      : null;
  const assignmentId =
    "assignment_id" in row && typeof row.assignment_id === "string"
      ? row.assignment_id
      : null;
  if (!tenantId || !assignmentId) {
    return null;
  }
  return { tenantId, assignmentId };
}

export interface MediaRouteContext {
  params: Promise<{ assetId: string }>;
}

export async function GET(
  request: NextRequest,
  routeContext: MediaRouteContext,
): Promise<NextResponse> {
  void request.headers.get("cookie");

  const bearerToken = getBearerToken(request);
  let sessionClient: RequestSessionClient;
  try {
    sessionClient = await createMediaSessionClient(request);
  } catch (error) {
    unstable_rethrow(error);
    return emptyResponse(401);
  }

  const {
    data: { user },
    error: userError,
  } = await sessionClient.auth.getUser(bearerToken ?? undefined);

  if (userError || !user) {
    return emptyResponse(401);
  }

  const { assetId } = await routeContext.params;
  if (!UUID_RE.test(assetId)) {
    return emptyResponse(404);
  }

  const rawVariant = request.nextUrl.searchParams.get("variant");
  if (
    rawVariant !== null &&
    rawVariant !== "" &&
    !isMediaVariantName(rawVariant)
  ) {
    return emptyResponse(404);
  }

  const { data: accessRows, error: accessError } = await sessionClient.rpc(
    "resolve_staff_media_access",
    { p_asset_id: assetId },
  );
  if (accessError) {
    return emptyResponse(404);
  }

  const access = parseMediaAccessRow(accessRows);
  if (!access) {
    return emptyResponse(404);
  }

  const authContext = await getAuthContext(request, {
    roleClass: "staff",
    expectedTenantId: access.tenantId,
    proposedAssignmentId: access.assignmentId,
  });

  try {
    requireCapability(authContext, "web_studio.edit");
  } catch {
    return emptyResponse(404);
  }

  if (
    authContext.tenantId !== access.tenantId ||
    authContext.assignment?.assignmentId !== access.assignmentId
  ) {
    return emptyResponse(404);
  }

  const admittedAuth: AuthenticatedContext = authContext;

  try {
    const result = await readMediaVariant(admittedAuth, {
      assetId,
      variant: rawVariant,
      ifNoneMatch: request.headers.get("if-none-match"),
    });

    if (result.notModified) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ...PRIVATE_NO_CACHE_HEADERS,
          ETag: result.etag,
        },
      });
    }

    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        ...PRIVATE_NO_CACHE_HEADERS,
        "Content-Type": result.mimeType,
        "Content-Length": String(result.byteSize),
        ETag: result.etag,
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ApiHttpError && error.status === 404) {
      return emptyResponse(404);
    }
    if (error instanceof ApiHttpError && error.status === 401) {
      return emptyResponse(401);
    }
    throw error;
  }
}
