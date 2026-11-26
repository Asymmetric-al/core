import { STAFF_SUBROLES } from "./staff-subroles";

import type { StaffSubrole } from "@asym/database/types";

const TENANT_SEGMENT = new RegExp(
  "^/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" +
    `(?:~(${STAFF_SUBROLES.join("|")}))?(?=/|$)`,
);

export const OUTSIDE_TENANT_SEGMENT_ROOTS = [
  "/api",
  "/_next",
  "/auth",
  "/login",
  "/register",
  "/forgot-password",
  "/invite",
  "/no-access",
  "/choose-organization",
  "/web-studio",
  "/boneyard",
  "/operator",
] as const;

export const CHOOSER_PATH = "/choose-organization";

export interface TenantAddress {
  tenantId: string;
  subRole: StaffSubrole | null;
  prefix: string;
  innerPathname: string;
}

function startsAnotherAuthority(rest: string): boolean {
  const forms = [rest];
  try {
    forms.push(decodeURIComponent(rest));
  } catch {}
  return forms.some((form) => /^[/\\]{2}/.test(form.replace(/[\t\n\r]/g, "")));
}

export function parseTenantAddress(pathname: string): TenantAddress | null {
  const match = TENANT_SEGMENT.exec(pathname);
  if (!match) return null;
  const [prefix, tenantId, subRole] = match;
  const rest = pathname.slice(prefix.length);
  if (startsAnotherAuthority(rest)) return null;
  return {
    tenantId: tenantId!,
    subRole: (subRole as StaffSubrole | undefined) ?? null,
    prefix,
    innerPathname: rest === "" || rest === "/" ? "/" : rest,
  };
}

export function stripTenantAddress(pathname: string): string {
  return parseTenantAddress(pathname)?.innerPathname ?? pathname;
}

export function buildTenantPrefix(
  tenantId: string,
  subRole: StaffSubrole | null,
): string {
  return subRole ? `/${tenantId}~${subRole}` : `/${tenantId}`;
}

export function isOutsideTenantSegment(pathname: string): boolean {
  return OUTSIDE_TENANT_SEGMENT_ROOTS.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
}

export function withTenantAddress(prefix: string | null, href: string): string {
  if (!prefix || !href.startsWith("/") || href.startsWith("//")) return href;
  const pathEnd = href.search(/[?#]/);
  const pathname = pathEnd === -1 ? href : href.slice(0, pathEnd);
  const rest = pathEnd === -1 ? "" : href.slice(pathEnd);
  if (parseTenantAddress(pathname) || isOutsideTenantSegment(pathname)) {
    return href;
  }
  return pathname === "/" ? `${prefix}${rest}` : `${prefix}${href}`;
}
