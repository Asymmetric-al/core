import {
  ASSIGNMENT_HEADER,
  SCOPE_REFUSED_HEADER,
  TENANT_HEADER,
} from "@asym/database/request-scope-headers";

import type { RoleClass } from "./principal/types";

export function requestOrigin(request: Request): string | null {
  const { headers } = request;
  const nextUrl = new URL(request.url);
  const authority = headers.get("host") ?? nextUrl.host;
  if (
    !["http:", "https:"].includes(nextUrl.protocol) ||
    !/^(?:[a-z\d.-]+|\[[a-f\d:.]+\])(?::\d+)?$/i.test(authority)
  )
    return null;
  try {
    return new URL(`${nextUrl.protocol}//${authority}`).origin;
  } catch {
    return null;
  }
}

export function isSameOriginDownload(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site !== null) return site === "same-origin";
  const referer = request.headers.get("referer");
  try {
    return (
      referer !== null && new URL(referer).origin === requestOrigin(request)
    );
  } catch {
    return false;
  }
}

/**
 * Request headers that carry the assignment context (plan 5.1, 5.2).
 *
 * - `x-asym-role-class`: the surface's role class. Each app's proxy sets it on
 *   every request it passes on, overwriting any value the client sent, from
 *   its own configuration: staff for Mission Control and Web Studio,
 *   missionary for the missionary workspace, donor for the donor portal.
 *   Each proxy runs on every path its app can answer, pages and API routes,
 *   whatever the path ends in. The `matcher` in each app's `proxy.ts` skips
 *   exactly three kinds of path, and its comment names what answers each:
 *   `/_next/*` (Next.js's own assets); `/maplibre/*` in Mission Control and
 *   the donor portal (the files of `public/maplibre`, the one public folder);
 *   and one file name at the root with a static extension. On those the app
 *   answers with an asset, a public file, a metadata route, the global
 *   not-found page, or, in the donor portal, the public CMS pages'
 *   catch-all; none of them reads these headers. So no page and no API route
 *   reads a class the client chose (council round 2, AR7).
 * - `x-asym-tenant`: the tenant the request acts in. On a page request the
 *   proxy sets it from the page address after its membership decision; on an
 *   API request the shared own-API fetch wrapper sends the page's tenant.
 *   `getAuthContext` passes it to the resolver as the expected tenant, which
 *   only narrows: a person is still resolved only in a tenant where they hold
 *   a live row.
 * - `x-asym-assignment`: the membership row the request acts under. On a page
 *   request the proxy sets it to the row its decision chose; on an API
 *   request the fetch wrapper sends the page's assignment. The resolver
 *   accepts it only as a proposal and checks it against the caller's live
 *   rows; the database reads the same header
 *   (`tenant_guard.request_assignment_id()`).
 *
 * Every page request that can read them runs the proxy (the donor portal's
 * CMS catch-all, the one page on a skipped path, reads none), and the proxy
 * deletes every copy of the tenant, assignment and address headers the
 * client sent before it decides, so a forged header never selects anything. Behind it, the server reads only
 * what holds together: `readAddressPrefix` takes a value that is exactly a
 * prefix, and `readDocumentScope` requires the resolved row to be in the
 * address's tenant and, under a suffix, to be that staff row.
 */
export const ROLE_CLASS_HEADER = "x-asym-role-class";
// Owned by `@asym/database`, whose fetch wrapper, browser client and session
// clients send them; re-exported here with the rules above.
export { ASSIGNMENT_HEADER, SCOPE_REFUSED_HEADER, TENANT_HEADER };

/**
 * Page requests only, set by the proxy on a tenant address: the address
 * prefix the document was loaded under (`/<tenant>` or `/<tenant>~<sub-role>`).
 * Server code reads it to build prefixed addresses and the document scope.
 */
export const ADDRESS_PREFIX_HEADER = "x-asym-address-prefix";

/**
 * Proxy-internal marker on a rewritten tenant address. If the proxy ever sees
 * its own marker come back, Next treated the rewrite as external and fetched
 * the inner path over HTTP (record D-19): the proxy fails that request loudly
 * instead of rendering the page without its tenant.
 */
export const TENANT_REWRITE_HEADER = "x-asym-tenant-rewrite";

/** The headers only the proxy may set on a page request. */
export const PAGE_SCOPE_HEADERS = [
  TENANT_HEADER,
  ASSIGNMENT_HEADER,
  ADDRESS_PREFIX_HEADER,
  TENANT_REWRITE_HEADER,
] as const;

const ROLE_CLASSES: readonly RoleClass[] = ["donor", "missionary", "staff"];

export function parseRoleClass(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return ROLE_CLASSES.find((roleClass) => roleClass === normalized) ?? null;
}
