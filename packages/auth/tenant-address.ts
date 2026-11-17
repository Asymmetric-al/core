import { STAFF_SUBROLES } from "./principal/assignment";

import type { StaffSubrole } from "@asym/database/types";

/**
 * The tenant in the page address (plan 5.2; AL-2675).
 *
 * A signed-in page of Mission Control or the missionary workspace lives at
 * `/<tenant-id>[~<sub-role>]/<page>`. The first segment is a tenant only when
 * it is a UUID in canonical lower-case form, the form the principal resolver
 * demands, optionally followed by `~` and one staff sub-role name. Nothing
 * else is read as a tenant, so no page name can collide with it. The suffix
 * names the staff row a person with several rows in that tenant acts under; a
 * person with one row never sees it.
 *
 * The proxy strips the prefix and rewrites onto the existing page files, so
 * the route tree does not change. Page code builds addresses through the
 * helpers in `tenant-navigation.tsx` and `tenant-server.ts`, which call these.
 *
 * Pure: the proxy, server components and client components all import it.
 */

const TENANT_SEGMENT = new RegExp(
  "^/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" +
    `(?:~(${STAFF_SUBROLES.join("|")}))?(?=/|$)`,
);

/**
 * Paths that stay outside the tenant segment (plan 5.2): every API route,
 * sign-in and its relatives, the organization chooser, Web Studio and the
 * screenshot-capture pages. A link to one of them is never prefixed, and the
 * proxy never serves one under a prefix. The operator area joins this list
 * when WP2c builds it.
 */
export const OUTSIDE_TENANT_SEGMENT_ROOTS = [
  "/api",
  "/_next",
  "/auth",
  "/login",
  "/register",
  "/forgot-password",
  "/no-access",
  "/choose-organization",
  "/web-studio",
  "/boneyard",
] as const;

/** The organization and assignment chooser, outside the tenant segment. */
export const CHOOSER_PATH = "/choose-organization";

export interface TenantAddress {
  tenantId: string;
  /** The sub-role the address names, held or not. Only the proxy trusts it, after its decision. */
  subRole: StaffSubrole | null;
  /** The literal prefix, for example `/<uuid>` or `/<uuid>~finance`. */
  prefix: string;
  /** The pathname the page files see; `/` for the bare prefix. */
  innerPathname: string;
}

export function parseTenantAddress(pathname: string): TenantAddress | null {
  const match = TENANT_SEGMENT.exec(pathname);
  if (!match) return null;
  const [prefix, tenantId, subRole] = match;
  const rest = pathname.slice(prefix.length);
  return {
    tenantId: tenantId!,
    subRole: (subRole as StaffSubrole | undefined) ?? null,
    prefix,
    innerPathname: rest === "" || rest === "/" ? "/" : rest,
  };
}

/** The pathname the page files see: the address without its tenant prefix. */
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

/**
 * Prefixes an internal page address with the document's tenant prefix.
 * Absolute and protocol-relative URLs, relative, query-only and fragment
 * hrefs, addresses outside the tenant segment and addresses that already name
 * a tenant are returned unchanged, and so is every href when there is no
 * prefix (a page outside the tenant segment, or the donor portal).
 */
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
