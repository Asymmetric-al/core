import {
  identityFromEveSessionAuthSnapshot,
  resolveAdminEveSessionIdentity,
} from "./identity";
import { assertEveSessionOwnership, claimEveSessionOwnership } from "./store";
import { ApiHttpError } from "../../shared/api-http-error";

import type { EveAdminSessionIdentity, EveSessionAuthSnapshot } from "./types";

export type EveRouteAuthFailure =
  | "forbidden"
  | "ownership_denied"
  | "service_unavailable"
  | "unauthenticated";

export class EveRouteAuthError extends Error {
  constructor(
    readonly reason: EveRouteAuthFailure,
    readonly status: 401 | 403 | 503,
  ) {
    super(reason);
    this.name = "EveRouteAuthError";
  }
}

export function getEveSessionIdFromRoute(request: Request): string | null {
  const segments = new URL(request.url).pathname.split("/").filter(Boolean);
  const sessionIndex = segments.findIndex((segment) => segment === "session");
  const candidate =
    sessionIndex >= 0 && segments.length > sessionIndex + 1
      ? segments[sessionIndex + 1]
      : null;
  return candidate ? decodeURIComponent(candidate) : null;
}

export async function authorizeEveAdminRouteRequest(
  request: Request,
): Promise<EveAdminSessionIdentity> {
  const resolution = await resolveAdminEveSessionIdentity(request);
  if (!resolution.ok) {
    throw new EveRouteAuthError(
      resolution.reason,
      resolution.reason === "unauthenticated" ? 401 : 403,
    );
  }

  const sessionId = getEveSessionIdFromRoute(request);
  if (!sessionId) {
    return resolution.identity;
  }

  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const { client: supabaseAdmin } = getAdminClient();
  if (!supabaseAdmin) {
    throw new EveRouteAuthError("service_unavailable", 503);
  }

  try {
    await assertEveSessionOwnership({
      identity: resolution.identity,
      sessionId,
      supabaseAdmin,
    });
  } catch (error) {
    if (error instanceof ApiHttpError && error.status === 403) {
      throw new EveRouteAuthError("ownership_denied", 403);
    }
    throw error;
  }

  return resolution.identity;
}

export async function claimEveSessionFromAuthSnapshot(input: {
  auth: EveSessionAuthSnapshot | null;
  sessionId: string;
}): Promise<void> {
  const identity = identityFromEveSessionAuthSnapshot(input.auth);
  if (!identity) {
    return;
  }

  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const { client: supabaseAdmin } = getAdminClient();
  if (!supabaseAdmin) {
    throw new EveRouteAuthError("service_unavailable", 503);
  }

  await claimEveSessionOwnership({
    identity,
    sessionId: input.sessionId,
    supabaseAdmin,
  });
}
