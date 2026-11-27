import {
  appBasePath,
  isServeUnderPathsEnabled,
} from "@asym/database/app-base-path";

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
  "/forgot-password",
  "/admin/login",
  "/missionary/login",
  "/admin/register",
  "/missionary/register",
] as const;

const OTHER_APP_SEGMENTS = new Set(["admin", "missionary"]);

const API_PATH = /^(?:\/(?:admin|missionary))?\/api(?:\/|$)/i;

const DOORWAY_PATH = /^\/invite(?:\/|$)/;

function isBlockedNextPath(pathname: string): boolean {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return true;
  }
  return [pathname, decoded].some(
    (form) =>
      API_PATH.test(form) ||
      BLOCKED_NEXT_PREFIXES.some(
        (prefix) => form === prefix || form.startsWith(`${prefix}/`),
      ),
  );
}

function namesAnotherApp(pathname: string): boolean {
  const first = pathname
    .split("/", 2)[1]!
    .replace(/[A-Z]/g, (letter) => letter.toLowerCase());
  return OTHER_APP_SEGMENTS.has(first);
}

function leavesTheDonorApp(pathname: string): boolean {
  if (!isServeUnderPathsEnabled() || appBasePath() !== "") return false;
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return true;
  }
  if (/[?#%\t\n\r]/.test(decoded) || /(?:^|\/)\.\.?(?:\/|$)/.test(decoded))
    return true;
  return namesAnotherApp(pathname) || namesAnotherApp(decoded);
}

export function getDemoRoleForApp(appId: AppId): AppRole {
  return DEMO_ROLE_FOR_APP[appId];
}

export function getDefaultPostLoginPathForApp(appId: AppId): string {
  return DEFAULT_POST_LOGIN_PATH_FOR_APP[appId];
}

function hasEmptySegmentOrBackslash(pathname: string): boolean {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return true;
  }
  return [pathname, decoded].some((form) => /\/\/|\\/.test(form));
}

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
  if (hasEmptySegmentOrBackslash(parsed.pathname)) return null;
  if (isBlockedNextPath(parsed.pathname)) return null;
  if (leavesTheDonorApp(parsed.pathname)) return null;

  if (DOORWAY_PATH.test(parsed.pathname)) return parsed.pathname;
  return `${parsed.pathname}${parsed.search}`;
}
