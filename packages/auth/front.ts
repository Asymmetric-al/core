import { APP_BASE_PATHS } from "@asym/database/document-reload";
import {
  canonicalOrigin,
  canonicalUpstreamOrigin,
} from "@asym/env/front-origin";
import { NextRequest, NextResponse } from "next/server";

import { admitApiMutation } from "./mutation-admission";
import {
  ADDRESS_PREFIX_HEADER,
  NAME_TENANT_HEADER,
  PAGE_SCOPE_HEADERS,
  ROLE_CLASS_HEADER,
  TENANT_REWRITE_HEADER,
} from "./request-headers";

export const FRONT_STAMP_HEADER = "x-asym-front-stamp";
export const FRONT_ORIGIN_HEADER = "x-asym-front-origin";
export const FRONT_HEADER_PREFIX = "x-asym-front-";

const PROTECTION_BYPASS_HEADERS = [
  "x-vercel-protection-bypass",
  "x-vercel-set-bypass-cookie",
] as const;

export const STAFF_EXEMPT_PATHS = [
  "/api/health/migrations",
  "/api/webhooks/stripe",
  "/api/webhooks/stripe-connect",
  "/api/email/webhooks/resend",
  "/api/inngest",
  "/eve/v1/github",
] as const;

export const STAFF_READ_ONLY_EXEMPT_PREFIXES = [] as const;

export const MISSIONARY_EXEMPT_PATHS = [
  "/api/health/migrations",
  "/api/webhooks/stripe",
] as const;

const STAMP_VERSION = "v1";
const MIN_STAMP_KEY_BYTES = 32;
const MAX_AGE_SECONDS = 60;
const MAX_CLOCK_SKEW_SECONDS = 5;
const encoder = new TextEncoder();

export interface FrontDashboard {
  prefix: string;
  origin: string;
  key: string;
}

export interface VerifyStampKeys {
  key: string | undefined;
  previousKey?: string | undefined;
}

export interface AdmissionOptions {
  prefix: string;
  key: string | undefined;
  previousKey?: string | undefined;
  exempt: readonly string[];
  readOnlyPrefixes?: readonly string[];
}

export type FrontAdmission =
  | { kind: "stamped"; origin: string }
  | { kind: "exempt"; pathname: string }
  | { kind: "refused" };

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]{43}$/.test(text)) return null;
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function hasValidStampKey(value: string | undefined): value is string {
  return (
    typeof value === "string" &&
    encoder.encode(value).byteLength >= MIN_STAMP_KEY_BYTES
  );
}

function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function stampPayload(
  origin: string,
  prefix: string,
  issuedAt: number,
): Uint8Array<ArrayBuffer> {
  return encoder.encode(`${STAMP_VERSION}\n${origin}\n${prefix}\n${issuedAt}`);
}

export { canonicalOrigin, canonicalUpstreamOrigin };

const loggedFrontConfigIssues = new Set<string>();

export function resetFrontConfigLogForTests(): void {
  loggedFrontConfigIssues.clear();
}

function logFrontConfigIssueOnce(
  variable: string,
  reason: "missing" | "invalid",
): void {
  if (loggedFrontConfigIssues.has(variable)) return;
  loggedFrontConfigIssues.add(variable);
  console.error(
    `[front] ${variable} is ${reason}; refusing request while CORE_SERVE_UNDER_PATHS=1.`,
  );
}

export async function signFrontStamp(
  origin: string,
  prefix: string,
  key: string,
  now: number = Date.now(),
): Promise<string> {
  const canonical = canonicalOrigin(origin);
  if (!canonical) {
    throw new Error("Front stamp requires a canonical http(s) origin.");
  }
  if (!prefix || !prefix.startsWith("/")) {
    throw new Error("Front stamp requires a dashboard prefix.");
  }
  if (!hasValidStampKey(key)) {
    throw new Error("Front stamp key must be at least 32 UTF-8 bytes.");
  }
  const issuedAt = Math.floor(now / 1000);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(key),
    stampPayload(canonical, prefix, issuedAt),
  );
  return `${STAMP_VERSION}.${issuedAt}.${toBase64Url(signature)}`;
}

export async function verifyFrontStamp(
  origin: string | null,
  prefix: string,
  stamp: string | null,
  keys: VerifyStampKeys,
  now: number = Date.now(),
): Promise<boolean> {
  const canonical = canonicalOrigin(origin);
  if (!canonical || !prefix || !stamp) return false;
  if (!hasValidStampKey(keys.key)) return false;
  const parts = stamp.split(".");
  if (parts.length !== 3 || parts[0] !== STAMP_VERSION) return false;
  const [, issued = "", signature = ""] = parts;
  if (!/^\d{1,12}$/.test(issued)) return false;
  const issuedAt = Number(issued);
  const age = Math.floor(now / 1000) - issuedAt;
  if (age < -MAX_CLOCK_SKEW_SECONDS || age > MAX_AGE_SECONDS) return false;
  const bytes = fromBase64Url(signature);
  if (!bytes) return false;
  const payload = stampPayload(canonical, prefix, issuedAt);
  if (
    await crypto.subtle.verify("HMAC", await hmacKey(keys.key), bytes, payload)
  ) {
    return true;
  }
  if (hasValidStampKey(keys.previousKey)) {
    return crypto.subtle.verify(
      "HMAC",
      await hmacKey(keys.previousKey),
      bytes,
      payload,
    );
  }
  return false;
}

export function stripFrontHeaders(headers: Headers): boolean {
  let changed = false;
  for (const name of [...headers.keys()]) {
    if (name.toLowerCase().startsWith(FRONT_HEADER_PREFIX)) {
      headers.delete(name);
      changed = true;
    }
  }
  return changed;
}

function cloneNextRequest(request: NextRequest, headers: Headers): NextRequest {
  const hasBody =
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    request.body !== null;
  const init: ConstructorParameters<typeof NextRequest>[1] = {
    method: request.method,
    headers,
    nextConfig: { basePath: request.nextUrl.basePath },
    ...(hasBody ? { body: request.body, duplex: "half" as const } : {}),
  };
  return new NextRequest(request.url, init);
}

export function withoutFrontHeaders(
  request: NextRequest,
  options: { stripForwardedHost?: boolean } = {},
): NextRequest {
  const headers = new Headers(request.headers);
  let changed = stripFrontHeaders(headers);
  if (options.stripForwardedHost && headers.has("x-forwarded-host")) {
    headers.delete("x-forwarded-host");
    changed = true;
  }
  return changed ? cloneNextRequest(request, headers) : request;
}

const DASHBOARD_PREFIXES = [
  APP_BASE_PATHS.admin,
  APP_BASE_PATHS.missionary,
] as const;

export function matchesDashboardPrefix(pathname: string): string | null {
  for (const prefix of DASHBOARD_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return prefix;
    }
  }
  return null;
}

export function frontNamesFromEnv(
  env: Record<string, string | undefined>,
): string[] {
  return (env.FRONT_NAMES ?? "")
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
}

export function dashboardsFromEnv(
  env: Record<string, string | undefined>,
  options: { log?: boolean } = {},
): readonly FrontDashboard[] | null {
  const adminOrigin = canonicalUpstreamOrigin(env.FRONT_ADMIN_ORIGIN);
  const missionaryOrigin = canonicalUpstreamOrigin(env.FRONT_MISSIONARY_ORIGIN);
  const adminKey = env.FRONT_STAMP_KEY_ADMIN;
  const missionaryKey = env.FRONT_STAMP_KEY_MISSIONARY;
  if (options.log) {
    if (!adminOrigin) {
      logFrontConfigIssueOnce(
        "FRONT_ADMIN_ORIGIN",
        env.FRONT_ADMIN_ORIGIN ? "invalid" : "missing",
      );
    }
    if (!missionaryOrigin) {
      logFrontConfigIssueOnce(
        "FRONT_MISSIONARY_ORIGIN",
        env.FRONT_MISSIONARY_ORIGIN ? "invalid" : "missing",
      );
    }
    if (!hasValidStampKey(adminKey)) {
      logFrontConfigIssueOnce(
        "FRONT_STAMP_KEY_ADMIN",
        adminKey ? "invalid" : "missing",
      );
    }
    if (!hasValidStampKey(missionaryKey)) {
      logFrontConfigIssueOnce(
        "FRONT_STAMP_KEY_MISSIONARY",
        missionaryKey ? "invalid" : "missing",
      );
    }
  }
  if (
    !adminOrigin ||
    !missionaryOrigin ||
    !hasValidStampKey(adminKey) ||
    !hasValidStampKey(missionaryKey)
  ) {
    return null;
  }
  return [
    { prefix: APP_BASE_PATHS.admin, origin: adminOrigin, key: adminKey },
    {
      prefix: APP_BASE_PATHS.missionary,
      origin: missionaryOrigin,
      key: missionaryKey,
    },
  ];
}

export function frontOrigin(
  request: NextRequest,
  names: readonly string[],
): string | null {
  const host = request.headers.get("host")?.trim().toLowerCase() ?? "";
  if (!host || !names.includes(host)) return null;
  return canonicalOrigin(`${request.nextUrl.protocol}//${host}`);
}

export function frontNotFound(): NextResponse {
  return new NextResponse(null, {
    status: 404,
    headers: { "cache-control": "no-store" },
  });
}

export async function routeToDashboard(
  request: NextRequest,
  env: Record<string, string | undefined>,
  now: number = Date.now(),
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;
  const prefix = matchesDashboardPrefix(pathname);
  if (!prefix) return null;

  const dashboards = dashboardsFromEnv(env, { log: true });
  const dashboard = dashboards?.find((entry) => entry.prefix === prefix);
  const names = frontNamesFromEnv(env);
  if (names.length === 0) {
    logFrontConfigIssueOnce("FRONT_NAMES", "missing");
  }
  const origin = frontOrigin(request, names);
  if (!dashboard || !origin) {
    return frontNotFound();
  }

  const headers = new Headers(request.headers);
  stripFrontHeaders(headers);
  headers.delete("x-forwarded-host");
  headers.delete(NAME_TENANT_HEADER);
  for (const name of PROTECTION_BYPASS_HEADERS) {
    headers.delete(name);
  }
  headers.set(FRONT_ORIGIN_HEADER, origin);
  headers.set(
    FRONT_STAMP_HEADER,
    await signFrontStamp(origin, dashboard.prefix, dashboard.key, now),
  );

  return NextResponse.rewrite(
    new URL(`${pathname}${request.nextUrl.search}`, dashboard.origin),
    { request: { headers } },
  );
}

function hasDotOrBackslashSegment(decodedPathname: string): boolean {
  if (decodedPathname.includes("\\")) return true;
  return decodedPathname
    .split("/")
    .some((segment) => segment === "." || segment === "..");
}

export async function admitFromFront(
  request: NextRequest,
  options: AdmissionOptions,
  now: number = Date.now(),
): Promise<FrontAdmission> {
  let decoded: string;
  try {
    decoded = decodeURIComponent(request.nextUrl.pathname);
  } catch {
    return { kind: "refused" };
  }

  const origin = request.headers.get(FRONT_ORIGIN_HEADER);
  const stamped = await verifyFrontStamp(
    origin,
    options.prefix,
    request.headers.get(FRONT_STAMP_HEADER),
    { key: options.key, previousKey: options.previousKey },
    now,
  );
  if (stamped && origin) {
    const forwarded = request.headers
      .get("x-forwarded-host")
      ?.trim()
      .toLowerCase();
    const own = request.headers.get("host")?.trim().toLowerCase();
    const stampedHost = new URL(origin).host;
    if (
      forwarded === undefined ||
      forwarded === stampedHost ||
      (Boolean(own) && forwarded === own)
    ) {
      return { kind: "stamped", origin };
    }
    return { kind: "refused" };
  }

  if (hasDotOrBackslashSegment(decoded)) {
    return { kind: "refused" };
  }

  const normalized =
    decoded.length > 1 && decoded.endsWith("/")
      ? decoded.slice(0, -1)
      : decoded;

  if (options.exempt.includes(normalized)) {
    return { kind: "exempt", pathname: normalized };
  }

  const method = request.method.toUpperCase();
  if (
    (method === "GET" || method === "HEAD") &&
    (options.readOnlyPrefixes ?? []).some((prefix) =>
      decoded.startsWith(prefix),
    )
  ) {
    return { kind: "exempt", pathname: normalized };
  }

  if (!hasValidStampKey(options.key)) {
    logFrontConfigIssueOnce(
      "FRONT_STAMP_KEY",
      options.key ? "invalid" : "missing",
    );
  }

  return { kind: "refused" };
}

export function asStampedRequest(
  request: NextRequest,
  origin: string,
): NextRequest {
  const headers = new Headers(request.headers);
  const host = new URL(origin).host;
  stripFrontHeaders(headers);
  for (const name of PROTECTION_BYPASS_HEADERS) {
    headers.delete(name);
  }
  headers.set(FRONT_ORIGIN_HEADER, origin);
  headers.set("host", host);
  headers.set("x-forwarded-host", host);
  return cloneNextRequest(request, headers);
}

export function rebaseLocation<T extends Response>(
  response: T,
  ownOrigin: string,
  publicOrigin: string,
): T {
  const location = response.headers.get("location");
  if (!location) return response;
  let url: URL;
  try {
    url = new URL(location, ownOrigin);
  } catch {
    return response;
  }
  if (url.origin !== ownOrigin) return response;
  response.headers.set(
    "location",
    `${publicOrigin}${url.pathname}${url.search}${url.hash}`,
  );
  return response;
}

export function frontRefusal(): NextResponse {
  return new NextResponse(null, {
    status: 403,
    headers: { "cache-control": "no-store" },
  });
}

export async function admitExemptRequest(
  request: NextRequest,
  pathname: string,
  roleClass: "staff" | "missionary" | null,
): Promise<NextResponse> {
  const cleaned = withoutFrontHeaders(request);
  const refusal = await admitApiMutation(cleaned, pathname);
  if (refusal) return refusal;
  const headers = new Headers(cleaned.headers);
  headers.delete(NAME_TENANT_HEADER);
  if (pathname.startsWith("/api/")) {
    headers.set("x-asym-pathname", pathname);
    if (roleClass) headers.set(ROLE_CLASS_HEADER, roleClass);
    else headers.delete(ROLE_CLASS_HEADER);
    headers.delete(ADDRESS_PREFIX_HEADER);
    headers.delete(TENANT_REWRITE_HEADER);
  } else {
    headers.delete(ROLE_CLASS_HEADER);
    for (const name of PAGE_SCOPE_HEADERS) headers.delete(name);
  }
  return NextResponse.next({ request: { headers } });
}
