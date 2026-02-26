import { defaultRouteForRole, type AppRole } from "./roles";

export const APP_IDS = ["admin", "missionary", "donor"] as const;
export type AppId = (typeof APP_IDS)[number];

const DEMO_ROLE_FOR_APP: Record<AppId, AppRole> = {
  admin: "admin",
  missionary: "missionary",
  donor: "donor",
};

const DEFAULT_POST_LOGIN_PATH_FOR_APP: Record<AppId, string> = {
  admin: defaultRouteForRole("admin"),
  missionary: defaultRouteForRole("missionary"),
  donor: defaultRouteForRole("donor"),
};

const BLOCKED_NEXT_PREFIXES = [
  "/login",
  "/register",
  "/auth/callback",
] as const;

function isBlockedNextPath(pathname: string): boolean {
  if (pathname.startsWith("/api/auth/")) return true;
  return BLOCKED_NEXT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function getDemoRoleForApp(appId: AppId): AppRole {
  return DEMO_ROLE_FOR_APP[appId];
}

export function getDefaultPostLoginPathForApp(appId: AppId): string {
  return DEFAULT_POST_LOGIN_PATH_FOR_APP[appId];
}

/**
 * Sanitize an untrusted `next` query parameter to prevent open redirects.
 *
 * Security implications:
 * - Only same-origin relative paths are allowed.
 * - Auth endpoints are blocked to avoid post-login loops and callback abuse.
 * - Invalid values return `null` so callers can fall back to a safe default.
 */
export function safeNextParam(value: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed, "http://localhost");
  } catch {
    return null;
  }

  if (parsed.origin !== "http://localhost") return null;
  if (isBlockedNextPath(parsed.pathname)) return null;

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
