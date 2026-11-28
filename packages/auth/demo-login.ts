import {
  appBasePath,
  isServeUnderPathsEnabled,
} from "@asym/database/app-base-path";

import { defaultRouteForRole, type AppRole } from "./roles";
import { parseSubRoleAddress, parseTenantAddress } from "./tenant-address";

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

const API_PATH = /^\/api(?:\/|$)/;

const BASE_SEGMENTS = ["/admin", "/missionary"] as const;

const DOORWAY_ROOT = "/invite";

const DOORWAY_PATH = /^\/invite\/([^/]+)$/i;

function servedForms(pathname: string): string[] | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const forms = new Set<string>();
  const pending = [pathname, decoded];
  while (pending.length > 0) {
    const form = pending.shift()!;
    const lower = form.toLowerCase();
    if (forms.has(lower)) continue;
    forms.add(lower);
    for (const base of BASE_SEGMENTS)
      if (lower.startsWith(`${base}/`)) pending.push(form.slice(base.length));
    const address = parseTenantAddress(form) ?? parseSubRoleAddress(form);
    if (address) pending.push(address.innerPathname);
  }
  return [...forms];
}

function underRoot(form: string, root: string): boolean {
  return form === root || form.startsWith(`${root}/`);
}

function isBlockedForm(form: string): boolean {
  return (
    API_PATH.test(form) ||
    BLOCKED_NEXT_PREFIXES.some((prefix) => underRoot(form, prefix))
  );
}

function doorwayLanding(
  pathname: string,
  forms: readonly string[],
): string | null | undefined {
  if (!forms.some((form) => underRoot(form, DOORWAY_ROOT))) return undefined;
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const selector = DOORWAY_PATH.exec(decoded)?.[1];
  return selector ? `${DOORWAY_ROOT}/${encodeURIComponent(selector)}` : null;
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
  const forms = servedForms(parsed.pathname);
  if (!forms || forms.some(isBlockedForm)) return null;
  if (leavesTheDonorApp(parsed.pathname)) return null;

  const doorway = doorwayLanding(parsed.pathname, forms);
  if (doorway !== undefined) return doorway;
  return `${parsed.pathname}${parsed.search}`;
}
