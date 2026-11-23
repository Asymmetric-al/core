import { safeNextParam } from "./demo-login";
import { selectAssignment } from "./principal/assignment";

import type { ActiveAssignment, RoleClass } from "./principal/types";
import type { DocumentSegment } from "@asym/database/document-scope";

export const WEB_STUDIO_ROLE_CLASS: RoleClass = "staff";

export const WEB_STUDIO_PATH = "/web-studio";

export const WEB_STUDIO_API_PATH = "/web-studio/api";

export const WEB_STUDIO_CHOOSER_PATH = "/web-studio/organization";

export const WEB_STUDIO_TENANT_COOKIE = "asym_web_studio_tenant";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const VERSION = "v1";

const KEY_INFO = "asym:web-studio-tenant-cookie:v1";

const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export interface WebStudioSelection {
  readonly tenantId: string;
  readonly assignmentId: string;
}

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

export function isWebStudioApiPath(pathname: string): boolean {
  return pathname.startsWith(`${WEB_STUDIO_API_PATH}/`);
}

function decodedPathname(pathname: string): string {
  return pathname
    .split("/")
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/");
}

function isUnderWebStudioChooser(pathname: string): boolean {
  return hasPathPrefix(decodedPathname(pathname), WEB_STUDIO_CHOOSER_PATH);
}

export function isStrayWebStudioChooserPath(pathname: string): boolean {
  return (
    pathname !== WEB_STUDIO_CHOOSER_PATH && isUnderWebStudioChooser(pathname)
  );
}

export function isWebStudioPagePath(pathname: string): boolean {
  return (
    isWebStudioPath(pathname) &&
    !isWebStudioApiPath(pathname) &&
    !isUnderWebStudioChooser(pathname)
  );
}

export const WEB_STUDIO_SEGMENT: DocumentSegment = {
  name: WEB_STUDIO_PATH,
  contains: isWebStudioPagePath,
};

export const WEB_STUDIO_ENTRY_TENANT_PARAM = "organization";
export const WEB_STUDIO_ENTRY_ASSIGNMENT_PARAM = "assignment";

export const WEB_STUDIO_FROM_PARAM = "from";

export function webStudioEntryQuery(
  scope: {
    tenantId: string;
    assignmentId: string;
    addressPrefix: string;
  } | null,
): Record<string, string> | null {
  if (!scope || scope.addressPrefix === "") return null;
  return {
    [WEB_STUDIO_ENTRY_TENANT_PARAM]: scope.tenantId,
    [WEB_STUDIO_ENTRY_ASSIGNMENT_PARAM]: scope.assignmentId,
  };
}

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

export function safeWebStudioNext(next: string | null | undefined): string {
  const safe = safeNextParam(next ?? null);
  if (!safe) return WEB_STUDIO_PATH;
  const url = new URL(safe, "http://web-studio.invalid");
  if (!isWebStudioPagePath(url.pathname)) return WEB_STUDIO_PATH;
  return `${url.pathname}${url.search}`;
}

export const WEB_STUDIO_REFUSED_PARAM = "refused";

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

export function clearedWebStudioCookie({
  secure,
}: {
  secure: boolean;
}): WebStudioCookie {
  return { ...webStudioCookie("", { secure }), maxAge: 0 };
}

export type WebStudioDecision =
  | { readonly kind: "allow"; readonly assignment: ActiveAssignment }
  | { readonly kind: "choose" }
  | { readonly kind: "refuse" };

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
  | { readonly ok: false };

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
