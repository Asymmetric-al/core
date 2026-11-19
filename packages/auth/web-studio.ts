import { safeNextParam } from "./demo-login";
import { selectAssignment } from "./principal/assignment";

import type { ActiveAssignment, RoleClass } from "./principal/types";
import type { DocumentSegment } from "@asym/database/document-scope";

/**
 * Web Studio's organization (plan 5.2, "One stated exception: Web Studio";
 * AL-2675, WP2b first release, slice C).
 *
 * Payload's own screens and REST calls cannot carry the tenant in their
 * address, so Web Studio keeps the organization a person chose in one signed,
 * HttpOnly cookie scoped to `/web-studio`. Payload's REST routes live under
 * `/web-studio/api`, so the cookie reaches them, and never reaches Mission
 * Control's own `/api` routes. It carries the tenant and the chosen
 * membership row and nothing else, and it only narrows: every request still
 * resolves its assignment from the person's live rows through the principal
 * resolver, which accepts the cookie's row only if the person holds it, live,
 * in that tenant. A cookie that names anything else selects nothing.
 *
 * Pure apart from Web Crypto, so the proxy, server code and tests share it.
 * The signing key is the caller's: the admin app derives it from Payload's
 * secret (`apps/admin/src/cms/web-studio-tenant-cookie.ts`).
 */

/** Web Studio acts on staff rows (plan 5.1). */
export const WEB_STUDIO_ROLE_CLASS: RoleClass = "staff";

/** Payload's admin route (`routes.admin`). */
export const WEB_STUDIO_PATH = "/web-studio";

/** Payload's REST routes (`routes.api`). */
export const WEB_STUDIO_API_PATH = "/web-studio/api";

/** Where a person picks the organization Web Studio works in. */
export const WEB_STUDIO_CHOOSER_PATH = "/web-studio/organization";

export const WEB_STUDIO_TENANT_COOKIE = "asym_web_studio_tenant";

/** Thirty days; signing out clears it sooner. */
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const VERSION = "v1";

/** Separates this key from every other use of the secret it is derived from. */
const KEY_INFO = "asym:web-studio-tenant-cookie:v1";

const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export interface WebStudioSelection {
  readonly tenantId: string;
  /** `authz.memberships.id` of the chosen staff row. */
  readonly assignmentId: string;
}

/**
 * The cookie as read: none, a verified selection, or a value that is there
 * but cannot be used (forged, altered, signed with another key, malformed).
 * An unusable cookie selects nothing; it is never read as absent, so it can
 * never let a person through on a default.
 */
export type WebStudioCookieState =
  | { readonly kind: "absent" }
  | { readonly kind: "selected"; readonly selection: WebStudioSelection }
  | { readonly kind: "unusable" };

function hasPathPrefix(pathname: string, root: string): boolean {
  return pathname === root || pathname.startsWith(`${root}/`);
}

export function isWebStudioPath(pathname: string): boolean {
  return hasPathPrefix(pathname, WEB_STUDIO_PATH);
}

/**
 * A path under Payload's REST routes: the prefix with its slash. The bare
 * `/web-studio/api` is not one; no API route serves it, so it falls to the
 * page route and is gated as a Web Studio page.
 */
export function isWebStudioApiPath(pathname: string): boolean {
  return pathname.startsWith(`${WEB_STUDIO_API_PATH}/`);
}

/**
 * A Web Studio page: under `/web-studio`, but neither one of its REST routes
 * nor its organization chooser. The one definition that the admin app's
 * tenant boundary, Web Studio's document scope and Payload's router adapter
 * share (council on the joined release, JC1), so crossing into or out of Web
 * Studio's pages is a document load wherever the navigation starts: the
 * chooser never renders on a Web Studio document, and no Web Studio page
 * renders on another one.
 */
export function isWebStudioPagePath(pathname: string): boolean {
  return (
    isWebStudioPath(pathname) &&
    !isWebStudioApiPath(pathname) &&
    !hasPathPrefix(pathname, WEB_STUDIO_CHOOSER_PATH)
  );
}

/**
 * Web Studio's pages as the segment a Web Studio document's scope is valid
 * in (`DocumentScopeProvider`): named by Web Studio's path, bounded by
 * `isWebStudioPagePath`. Pass this constant, from client code; a function
 * cannot cross from a server component to a client one.
 */
export const WEB_STUDIO_SEGMENT: DocumentSegment = {
  name: WEB_STUDIO_PATH,
  contains: isWebStudioPagePath,
};

/**
 * The query names with which a link from a tenant's page into Web Studio
 * names that page's tenant and row (council on the joined release, JC3).
 * Web Studio keeps its organization in a cookie that lasts thirty days, so
 * the proxy compares them with the cookie's choice and asks before Web
 * Studio works in another organization; a link never sets the cookie.
 */
export const WEB_STUDIO_ENTRY_TENANT_PARAM = "organization";
export const WEB_STUDIO_ENTRY_ASSIGNMENT_PARAM = "assignment";

/** The chooser's flag: the organization a link came from, offered first. */
export const WEB_STUDIO_FROM_PARAM = "from";

/** The query a link into Web Studio adds for a tenant's document, or `null` for any other document. */
export function webStudioEntryQuery(
  scope: {
    tenantId: string;
    assignmentId: string;
    addressPrefix: string;
  } | null,
): Record<string, string> | null {
  // Only a document whose address names its tenant: Web Studio's own pages
  // and the donor portal name none, and add nothing.
  if (!scope || scope.addressPrefix === "") return null;
  return {
    [WEB_STUDIO_ENTRY_TENANT_PARAM]: scope.tenantId,
    [WEB_STUDIO_ENTRY_ASSIGNMENT_PARAM]: scope.assignmentId,
  };
}

/**
 * A link into Web Studio from a tenant's document: the address of a Web
 * Studio page with that document's tenant and row added to its query, before
 * any fragment. Any other address, and any link from a document whose
 * address names no tenant, is returned as it is.
 */
export function withWebStudioEntry(
  href: string,
  scope: Parameters<typeof webStudioEntryQuery>[0],
): string {
  const entry = webStudioEntryQuery(scope);
  if (!entry || !href.startsWith("/") || href.startsWith("//")) return href;
  const hashAt = href.indexOf("#");
  const beforeHash = hashAt === -1 ? href : href.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : href.slice(hashAt);
  const queryAt = beforeHash.indexOf("?");
  const pathname = queryAt === -1 ? beforeHash : beforeHash.slice(0, queryAt);
  if (!isWebStudioPagePath(pathname)) return href;
  const query = new URLSearchParams(
    queryAt === -1 ? "" : beforeHash.slice(queryAt + 1),
  );
  for (const [name, value] of Object.entries(entry)) query.set(name, value);
  return `${pathname}?${query.toString()}${hash}`;
}

/**
 * Where a choice of organization returns: a Web Studio page the caller named,
 * with its query, or Web Studio's home. It passes the same refusal as every
 * other return address (`safeNextParam`: another origin, an empty path
 * segment or a backslash, as written or decoded), and then must be a Web
 * Studio page: not a page outside Web Studio, one of its REST routes or the
 * chooser itself.
 */
export function safeWebStudioNext(next: string | null | undefined): string {
  const safe = safeNextParam(next ?? null);
  if (!safe) return WEB_STUDIO_PATH;
  const url = new URL(safe, "http://web-studio.invalid");
  if (!isWebStudioPagePath(url.pathname)) return WEB_STUDIO_PATH;
  return `${url.pathname}${url.search}`;
}

/** The chooser's flag for a choice it refused (council C11). */
export const WEB_STUDIO_REFUSED_PARAM = "refused";

/**
 * The chooser's own address: where Web Studio returns after the choice
 * (`next`, made safe by `safeWebStudioNext`) and, when the last choice was
 * refused, the flag that has the chooser say so; when a link from Mission
 * Control named an organization, that one, which the chooser offers first
 * (JC3). Sign-in returns here too, so a person who signs in again still
 * lands on the page they were on.
 */
export function webStudioChooserAddress(
  next: string | null | undefined,
  options: { refused?: boolean; from?: string | null } = {},
): string {
  const params = new URLSearchParams({ next: safeWebStudioNext(next) });
  if (options.refused) params.set(WEB_STUDIO_REFUSED_PARAM, "1");
  if (options.from) params.set(WEB_STUDIO_FROM_PARAM, options.from);
  return `${WEB_STUDIO_CHOOSER_PATH}?${params.toString()}`;
}

function utf8(value: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new TextEncoder().encode(value));
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/** An HMAC-SHA-256 key derived from `secret` by HKDF, for this cookie only. */
async function cookieKey(secret: string): Promise<CryptoKey> {
  if (!secret) {
    throw new Error("The Web Studio cookie needs a signing key.");
  }
  const material = await crypto.subtle.importKey(
    "raw",
    utf8(secret),
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(0),
      info: utf8(KEY_INFO),
    },
    material,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    false,
    ["sign", "verify"],
  );
}

function payloadOf(selection: WebStudioSelection): string {
  return `${VERSION}.${selection.tenantId}.${selection.assignmentId}`;
}

/** The cookie value for `selection`: `v1.<tenant>.<assignment>.<signature>`. */
export async function signWebStudioSelection(
  selection: WebStudioSelection,
  secret: string,
): Promise<string> {
  if (
    !CANONICAL_UUID.test(selection.tenantId) ||
    !CANONICAL_UUID.test(selection.assignmentId)
  ) {
    throw new Error(
      "The Web Studio cookie names a tenant and a membership row by canonical id only.",
    );
  }
  const payload = payloadOf(selection);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await cookieKey(secret),
    utf8(payload),
  );
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Reads and verifies the cookie's value. Never throws on a bad value. */
export async function readWebStudioCookie(
  value: string | null | undefined,
  secret: string,
): Promise<WebStudioCookieState> {
  if (value === undefined || value === null || value === "") {
    return { kind: "absent" };
  }
  const parts = value.split(".");
  if (parts.length !== 4) return { kind: "unusable" };
  const [version, tenantId, assignmentId, signature] = parts as [
    string,
    string,
    string,
    string,
  ];
  if (
    version !== VERSION ||
    !CANONICAL_UUID.test(tenantId) ||
    !CANONICAL_UUID.test(assignmentId)
  ) {
    return { kind: "unusable" };
  }
  const signatureBytes = fromBase64Url(signature);
  if (!signatureBytes) return { kind: "unusable" };
  const selection = { tenantId, assignmentId };
  const valid = await crypto.subtle.verify(
    "HMAC",
    await cookieKey(secret),
    signatureBytes,
    utf8(payloadOf(selection)),
  );
  return valid ? { kind: "selected", selection } : { kind: "unusable" };
}

export interface WebStudioCookie {
  name: string;
  value: string;
  httpOnly: true;
  sameSite: "strict";
  secure: boolean;
  path: string;
  maxAge: number;
}

/**
 * The cookie as set. `SameSite=Strict`: Payload's admin makes every request
 * same-origin, so nothing it does needs the cookie on a cross-site request.
 * A deep link into Web Studio from another site arrives without it, and a
 * person with several organizations then picks one again.
 */
export function webStudioCookie(
  value: string,
  { secure }: { secure: boolean },
): WebStudioCookie {
  return {
    name: WEB_STUDIO_TENANT_COOKIE,
    value,
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: WEB_STUDIO_PATH,
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}

/** The cookie as a `Set-Cookie` header value, for code without a cookie store. */
export function serializeWebStudioCookie(cookie: WebStudioCookie): string {
  return [
    `${cookie.name}=${cookie.value}`,
    `Path=${cookie.path}`,
    `Max-Age=${cookie.maxAge}`,
    "HttpOnly",
    "SameSite=Strict",
    ...(cookie.secure ? ["Secure"] : []),
  ].join("; ");
}

/** Expires the cookie: set on sign-out. */
export function clearedWebStudioCookie({
  secure,
}: {
  secure: boolean;
}): WebStudioCookie {
  return { ...webStudioCookie("", { secure }), maxAge: 0 };
}

export type WebStudioDecision =
  | { readonly kind: "allow"; readonly assignment: ActiveAssignment }
  /** Send the person to the chooser. */
  | { readonly kind: "choose" }
  /** No staff row at all: Web Studio is not for this person. */
  | { readonly kind: "refuse" };

/**
 * Who may open Web Studio, over rows already read and validated (the proxy's
 * decision, before the page shell):
 *
 * - no cookie: a person with one staff row acts under it; a person with
 *   several chooses; a person with none is refused;
 * - a cookie: the resolver's rule judges the row and tenant it names; a row
 *   the person does not hold live, of the staff class, in that tenant,
 *   selects nothing, and the person chooses again. It never falls back to
 *   another row, even the only one left.
 */
export function decideWebStudioAccess(input: {
  assignments: readonly ActiveAssignment[];
  cookie: WebStudioCookieState;
}): WebStudioDecision {
  const staffRows = input.assignments.filter(
    (a) => a.membershipRole === WEB_STUDIO_ROLE_CLASS,
  );
  if (staffRows.length === 0) return { kind: "refuse" };
  const resolveInput = webStudioResolveInput(input.cookie);
  if (!resolveInput.ok) return { kind: "choose" };
  const { ok: _ok, ...narrowing } = resolveInput;
  const result = selectAssignment(input.assignments, narrowing);
  return result.ok
    ? { kind: "allow", assignment: result.assignment }
    : { kind: "choose" };
}

export type WebStudioResolveInput =
  | {
      readonly ok: true;
      readonly roleClass: RoleClass;
      readonly proposedAssignmentId?: string;
      readonly expectedTenantId?: string;
    }
  /** The cookie is there but unusable: nothing may be resolved from it. */
  | { readonly ok: false };

/**
 * What the principal resolver is given for a Web Studio request: the staff
 * class and, when the cookie verified, its row and tenant as the proposed
 * assignment and the expected tenant. The resolver checks both against the
 * person's live rows, as it does for every other handler.
 */
export function webStudioResolveInput(
  cookie: WebStudioCookieState,
): WebStudioResolveInput {
  switch (cookie.kind) {
    case "absent":
      return { ok: true, roleClass: WEB_STUDIO_ROLE_CLASS };
    case "selected":
      return {
        ok: true,
        roleClass: WEB_STUDIO_ROLE_CLASS,
        proposedAssignmentId: cookie.selection.assignmentId,
        expectedTenantId: cookie.selection.tenantId,
      };
    case "unusable":
      return { ok: false };
  }
}
