import { isServeUnderPathsEnabled } from "@asym/database/app-base-path";

import { STAFF_SUBROLES } from "./staff-subroles";

import type { StaffSubrole } from "@asym/database/types";

const TENANT_SEGMENT = new RegExp(
  "^/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" +
    `(?:~(${STAFF_SUBROLES.join("|")}))?(?=/|$)`,
);

const SUB_ROLE_SEGMENT = new RegExp(`^/~(${STAFF_SUBROLES.join("|")})(?=/|$)`);

const ORGANIZATION_ID_SEGMENT =
  /^\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}(?=$|[/~])/;

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

export interface SubRoleAddress {
  subRole: StaffSubrole;
  prefix: string;
  innerPathname: string;
}

export function parseSubRoleAddress(pathname: string): SubRoleAddress | null {
  const match = SUB_ROLE_SEGMENT.exec(pathname);
  if (!match) return null;
  const [prefix, subRole] = match;
  const rest = pathname.slice(prefix.length);
  if (startsAnotherAuthority(rest)) return null;
  return {
    subRole: subRole as StaffSubrole,
    prefix,
    innerPathname: rest === "" || rest === "/" ? "/" : rest,
  };
}

export function startsWithOrganizationId(pathname: string): boolean {
  return ORGANIZATION_ID_SEGMENT.test(pathname);
}

export function subRoleStartsAnotherAuthority(pathname: string): boolean {
  const match = SUB_ROLE_SEGMENT.exec(pathname);
  return (
    match !== null && startsAnotherAuthority(pathname.slice(match[0].length))
  );
}

export function nameAddressPrefix(subRole: StaffSubrole | null): string {
  return subRole ? `/~${subRole}` : "";
}

function decodedOnce(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname.replace(/%([0-7][0-9A-Fa-f])/g, (_escape, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    );
  }
}

export function refusesAddressOnName(
  pathname: string,
  roleClass: string | null,
): boolean {
  if (startsWithOrganizationId(pathname)) return true;
  if (subRoleStartsAnotherAuthority(pathname)) return true;
  const address = parseSubRoleAddress(pathname);
  if (!address) return false;
  return (
    roleClass === null ||
    isOutsideTenantSegment(address.innerPathname) ||
    isOutsideTenantSegment(decodedOnce(address.innerPathname))
  );
}

function pageAddressOf(
  pathname: string,
): { prefix: string; innerPathname: string } | null {
  return isServeUnderPathsEnabled()
    ? parseSubRoleAddress(pathname)
    : parseTenantAddress(pathname);
}

export function stripTenantAddress(pathname: string): string {
  return pageAddressOf(pathname)?.innerPathname ?? pathname;
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
  if (pageAddressOf(pathname) || isOutsideTenantSegment(pathname)) {
    return href;
  }
  return pathname === "/" ? `${prefix}${rest}` : `${prefix}${href}`;
}

export function nameAddressSegmentOf(pathname: string): string | null {
  const address = parseSubRoleAddress(pathname);
  if (address) return address.prefix;
  return isOutsideTenantSegment(pathname) ? null : "";
}
