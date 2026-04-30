import { DEMO_USER_ID } from "./constants";

import type { UserRole } from "@asym/database/types";

/** @deprecated Prefer surface-specific names; kept for grep/docs compatibility */
export const E2E_AUTH_COOKIE_NAME = "asym_e2e_auth";

export type E2EAuthAppSurface = "donor" | "admin" | "missionary";

export const E2E_AUTH_COOKIE_NAMES: Record<E2EAuthAppSurface, string> = {
  donor: "asym_e2e_auth_donor",
  admin: "asym_e2e_auth_admin",
  missionary: "asym_e2e_auth_missionary",
};

/**
 * Map dev / Playwright ports to app surface so E2E cookies do not authenticate
 * the wrong local app (all use host `localhost` but different ports).
 */
export function inferE2EAuthSurfaceFromHost(
  host: string | null,
): E2EAuthAppSurface | null {
  if (!host) return null;
  const normalized = host
    .trim()
    .toLowerCase()
    .replace(/^\[(.*)\]$/, "$1");
  const portMatch = normalized.match(/:(\d+)$/);
  if (!portMatch) return null;
  const port = Number(portMatch[1]);
  if (port === 3000 || port === 3005) return "donor";
  if (port === 3030) return "admin";
  if (port === 4000) return "missionary";
  return null;
}

/**
 * Cookie name for E2E bypass auth on this request's host, or `ASYM_E2E_AUTH_SURFACE`
 * when the URL has no port (e.g. some unit tests).
 */
export function getE2EAuthCookieNameForRequest(
  request: Request,
): string | null {
  const url = new URL(request.url);
  let surface = inferE2EAuthSurfaceFromHost(url.host);
  if (!surface) {
    const env = process.env.ASYM_E2E_AUTH_SURFACE?.trim().toLowerCase();
    if (env === "donor" || env === "admin" || env === "missionary") {
      surface = env;
    }
  }
  return surface ? E2E_AUTH_COOKIE_NAMES[surface] : null;
}

export function getE2EAuthCookieNameForProxyHost(
  hostHeader: string | null,
): string | null {
  const surface = inferE2EAuthSurfaceFromHost(hostHeader);
  if (surface) {
    return E2E_AUTH_COOKIE_NAMES[surface];
  }
  const env = process.env.ASYM_E2E_AUTH_SURFACE?.trim().toLowerCase();
  if (env === "donor" || env === "admin" || env === "missionary") {
    return E2E_AUTH_COOKIE_NAMES[env];
  }
  return null;
}
const E2E_AUTH_BYPASS_VALUES = new Set(["1", "true"]);
const USER_ROLES: readonly UserRole[] = [
  "donor",
  "missionary",
  "admin",
  "staff",
  "super_admin",
];
const USER_ROLE_SET = new Set(USER_ROLES);

export interface E2EAuthSession {
  userId: string;
  role: UserRole;
  tenantId: string | null;
}

export function isE2EAuthBypassEnabled() {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const value = process.env.E2E_AUTH_BYPASS?.trim().toLowerCase();
  return value ? E2E_AUTH_BYPASS_VALUES.has(value) : false;
}

function encodeBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(pad);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function createE2EAuthCookieValue(session: E2EAuthSession) {
  return encodeBase64Url(JSON.stringify(session));
}

export function parseE2EAuthCookieValue(
  value: string | null | undefined,
): E2EAuthSession | null {
  if (!value) return null;

  try {
    const decoded = decodeBase64Url(value);
    const parsed = JSON.parse(decoded) as Partial<E2EAuthSession>;

    if (
      typeof parsed.userId !== "string" ||
      !parsed.userId ||
      typeof parsed.role !== "string" ||
      !USER_ROLE_SET.has(parsed.role as UserRole)
    ) {
      return null;
    }

    return {
      userId: parsed.userId,
      role: parsed.role as UserRole,
      tenantId:
        typeof parsed.tenantId === "string"
          ? parsed.tenantId
          : parsed.tenantId
            ? null
            : null,
    };
  } catch {
    return null;
  }
}

/**
 * Normalize E2E bypass cookie sessions so server layouts match middleware.
 *
 * `POST /api/auth/demo-account` historically set `userId` to `e2e-${role}-user`
 * while the cookie `role` was `admin` for Mission Control. `derivePrimaryRole`
 * then returned null (no memberships), so `getAuthContext` treated the user
 * as unauthenticated even though the proxy let the request through.
 *
 * When the synthetic id is the seeded demo user, attach `profileId` so callers
 * that expect a profile row stay aligned with `supabase/seed.sql`.
 */
export function getEffectiveE2EBypassIdentity(session: E2EAuthSession): {
  userId: string;
  profileRole: UserRole;
  profileId: string | null;
  tenantId: string | null;
} {
  const { role: cookieRole, tenantId } = session;

  if (session.userId === DEMO_USER_ID) {
    return {
      userId: DEMO_USER_ID,
      profileRole: cookieRole,
      profileId: DEMO_USER_ID,
      tenantId,
    };
  }

  // Legacy: POST /api/auth/demo-account used userId `e2e-admin-user` with role
  // `admin` while Mission Control layouts need a resolvable profile (seed user).
  if (session.userId === "e2e-admin-user" && cookieRole === "admin") {
    return {
      userId: DEMO_USER_ID,
      profileRole: "admin",
      profileId: DEMO_USER_ID,
      tenantId,
    };
  }

  return {
    userId: session.userId,
    profileRole: cookieRole,
    profileId: null,
    tenantId,
  };
}
