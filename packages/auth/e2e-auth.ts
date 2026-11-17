import { DEMO_TENANT_ID } from "./constants";

import type { ActiveAssignment } from "./principal/types";
import type {
  MembershipRole,
  StaffSubrole,
  UserRole,
} from "@asym/database/types";

/** @deprecated Prefer surface-specific names; kept for grep/docs compatibility */
export const E2E_AUTH_COOKIE_NAME = "asym_e2e_auth";

export type E2EAuthAppSurface = "donor" | "admin" | "missionary";

export const E2E_AUTH_COOKIE_NAMES: Record<E2EAuthAppSurface, string> = {
  donor: "asym_e2e_auth_donor",
  admin: "asym_e2e_auth_admin",
  missionary: "asym_e2e_auth_missionary",
};

/**
 * Map dev / Playwright ports to app surface so E2E cookies do not authenticate
 * the wrong local app (all use host `localhost` but different ports).
 */
export function inferE2EAuthSurfaceFromHost(
  host: string | null,
): E2EAuthAppSurface | null {
  if (!host) return null;
  const normalized = host
    .trim()
    .toLowerCase()
    .replace(/^\[(.*)\]$/, "$1");
  const portMatch = normalized.match(/:(\d+)$/);
  if (!portMatch) return null;
  const port = Number(portMatch[1]);
  if (port === 3000 || port === 3005) return "donor";
  if (port === 3030) return "admin";
  if (port === 4000) return "missionary";
  return null;
}

/**
 * Cookie name for E2E bypass auth on this request's host, or `ASYM_E2E_AUTH_SURFACE`
 * when the URL has no port (e.g. some unit tests).
 */
export function getE2EAuthCookieNameForRequest(
  request: Request,
): string | null {
  const url = new URL(request.url);
  let surface = inferE2EAuthSurfaceFromHost(url.host);
  if (!surface) {
    const env = process.env.ASYM_E2E_AUTH_SURFACE?.trim().toLowerCase();
    if (env === "donor" || env === "admin" || env === "missionary") {
      surface = env;
    }
  }
  return surface ? E2E_AUTH_COOKIE_NAMES[surface] : null;
}

export function getE2EAuthCookieNameForProxyHost(
  hostHeader: string | null,
): string | null {
  const surface = inferE2EAuthSurfaceFromHost(hostHeader);
  if (surface) {
    return E2E_AUTH_COOKIE_NAMES[surface];
  }
  const env = process.env.ASYM_E2E_AUTH_SURFACE?.trim().toLowerCase();
  if (env === "donor" || env === "admin" || env === "missionary") {
    return E2E_AUTH_COOKIE_NAMES[env];
  }
  return null;
}
const E2E_AUTH_BYPASS_VALUES = new Set(["1", "true"]);
const USER_ROLES: readonly UserRole[] = [
  "donor",
  "missionary",
  "admin",
  "staff",
  "super_admin",
];
const USER_ROLE_SET = new Set(USER_ROLES);

/**
 * Lifetime of a minted E2E bypass token, in seconds. Kept in lockstep with the
 * cookie `maxAge` used by the demo-account route so a token never outlives its
 * cookie. Short by design: a leaked token expires quickly.
 */
const E2E_AUTH_TOKEN_TTL_SECONDS = 60 * 60;

/**
 * One membership of a bypass identity (AL-2675). No row stands behind it: the
 * signed cookie names it, so end-to-end suites can sign in as a person with
 * several staff rows, or rows in two tenants, without a database.
 */
export interface E2EAuthMembership {
  /** Stands in for `authz.memberships.id`; a canonical UUID. */
  id: string;
  tenantId: string;
  role: MembershipRole;
  staffRole: StaffSubrole | null;
  isTenantAdmin: boolean;
}

export interface E2EAuthSession {
  userId: string;
  role: UserRole;
  tenantId: string | null;
  profileId?: string | null;
  /** Absent: the one membership `role` implies, in `tenantId` or the demo tenant. */
  memberships?: E2EAuthMembership[];
}

/** The id of the one membership a bypass session without a list holds. */
export const E2E_BYPASS_ASSIGNMENT_ID = "00000000-0000-4000-8000-0000000e2e00";

const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const MEMBERSHIP_ROLES: readonly MembershipRole[] = [
  "donor",
  "missionary",
  "staff",
];
const BYPASS_STAFF_SUBROLES: readonly StaffSubrole[] = [
  "finance",
  "mobilizer",
  "development",
  "hr",
  "member_care",
];

/** A signed membership entry, or `null` when any field breaks the table's rules. */
function parseE2EAuthMembership(raw: unknown): E2EAuthMembership | null {
  if (raw === null || typeof raw !== "object") return null;
  const { id, tenantId, role, staffRole, isTenantAdmin } = raw as Record<
    string,
    unknown
  >;
  if (typeof id !== "string" || !CANONICAL_UUID.test(id)) return null;
  if (typeof tenantId !== "string" || !CANONICAL_UUID.test(tenantId)) {
    return null;
  }
  if (!MEMBERSHIP_ROLES.includes(role as MembershipRole)) return null;
  if (
    staffRole !== null &&
    !BYPASS_STAFF_SUBROLES.includes(staffRole as StaffSubrole)
  ) {
    return null;
  }
  if ((role === "staff") !== (staffRole !== null)) return null;
  if (typeof isTenantAdmin !== "boolean") return null;
  if (isTenantAdmin && role !== "staff") return null;
  return {
    id,
    tenantId,
    role: role as MembershipRole,
    staffRole: staffRole as StaffSubrole | null,
    isTenantAdmin,
  };
}

/** The membership a bypass role implies: an admin is a flagged staff member. */
function impliedE2EAuthMembership(
  session: E2EAuthSession,
): E2EAuthMembership | null {
  const tenantId = session.tenantId ?? DEMO_TENANT_ID;
  const base = { id: E2E_BYPASS_ASSIGNMENT_ID, tenantId };
  switch (session.role) {
    case "donor":
    case "missionary":
      return {
        ...base,
        role: session.role,
        staffRole: null,
        isTenantAdmin: false,
      };
    case "staff":
    case "admin":
    case "super_admin":
      return {
        ...base,
        role: "staff",
        staffRole: "development",
        isTenantAdmin: session.role !== "staff",
      };
    default:
      return null;
  }
}

/**
 * The live rows a bypass identity holds, in the resolver's shape, so the
 * proxy and `getAuthContext` judge it by the same rules as a real session.
 */
export function listE2EAuthAssignments(
  session: E2EAuthSession,
): ActiveAssignment[] {
  const memberships =
    session.memberships ??
    [impliedE2EAuthMembership(session)].filter(
      (m): m is E2EAuthMembership => m !== null,
    );
  return memberships.map((membership) => ({
    assignmentId: membership.id,
    userId: session.userId,
    tenantId: membership.tenantId,
    revision: "e2e-bypass",
    membershipRole: membership.role,
    staffRole: membership.staffRole,
    isTenantAdmin: membership.isTenantAdmin,
  }));
}

/** Signed on-the-wire payload: an {@link E2EAuthSession} plus an absolute expiry. */
interface SignedE2EAuthPayload extends E2EAuthSession {
  /** Absolute expiry as epoch seconds. Signed, so a client cannot extend it. */
  exp: number;
}

export function isE2EAuthBypassEnabled() {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const value = process.env.E2E_AUTH_BYPASS?.trim().toLowerCase();
  return value ? E2E_AUTH_BYPASS_VALUES.has(value) : false;
}

/** The canonical non-resolving Supabase placeholder host used across the repo. */
const E2E_PLACEHOLDER_SUPABASE_HOST = "example.supabase.co";

/**
 * Public, NON-SECRET fallback HMAC key. Used automatically ONLY for datasources
 * that cannot hold real data — loopback, the non-resolving `example.supabase.co`
 * placeholder, or no datasource at all — so local dev and the placeholder CI job
 * need zero secret setup ("easy for anyone to test").
 *
 * This being public is safe: it is only ever used where the bypass grants access
 * to throwaway / non-existent data, and the datasource binding independently
 * forbids production projects. A real remote datasource MUST set an explicit,
 * confidential `E2E_AUTH_SECRET` — otherwise `getE2EAuthSecret` returns `null`
 * there and mint/verify fail closed.
 */
const E2E_AUTH_DEV_FALLBACK_SECRET =
  "asym-e2e-dev-fallback-key-loopback-and-example-placeholder-only";

/**
 * HMAC secret shared by the E2E cookie producer (`POST /api/auth/demo-account`)
 * and every verifier. Read directly from `process.env` (not `@asym/env`) so this
 * module stays edge-safe and dependency-light, matching the other env reads here.
 *
 * Resolution: an explicit `E2E_AUTH_SECRET` always wins. When it is unset, a
 * public fallback key is used for datasources that cannot hold real data
 * (loopback / `example.supabase.co` / unconfigured). For any real remote
 * datasource this returns `null`, so callers fail closed — mint refuses and
 * verify rejects — until an explicit confidential secret is configured.
 */
function getE2EAuthSecret(): string | null {
  const explicit = process.env.E2E_AUTH_SECRET?.trim();
  if (explicit) return explicit;
  if (isNonConfidentialE2EDatasource(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    return E2E_AUTH_DEV_FALLBACK_SECRET;
  }
  return null;
}

/**
 * Whether a usable signing key (explicit secret, or the safe fallback for a
 * non-confidential datasource) is available in this environment. Producers use
 * this to report availability honestly and fail fast.
 */
export function hasE2EAuthSecret(): boolean {
  return getE2EAuthSecret() !== null;
}

/**
 * A datasource that cannot hold real data, so the public fallback signing key is
 * safe to use: loopback, the `example.supabase.co` placeholder, or no datasource
 * configured. Anything else (a real hosted Supabase project) is treated as
 * potentially confidential and requires an explicit `E2E_AUTH_SECRET`.
 */
function isNonConfidentialE2EDatasource(
  supabaseUrl: string | null | undefined,
): boolean {
  if (!supabaseUrl) return true;
  let hostname: string;
  try {
    hostname = new URL(supabaseUrl).hostname.toLowerCase();
  } catch {
    return false;
  }
  return (
    isLoopbackDatasourceHostname(hostname) ||
    hostname === E2E_PLACEHOLDER_SUPABASE_HOST
  );
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (base64.length % 4)) % 4;
  const binary = atob(base64 + "=".repeat(pad));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Encode a string as UTF-8 bytes backed by a plain `ArrayBuffer` (Web Crypto `BufferSource`). */
function utf8Bytes(input: string): Uint8Array<ArrayBuffer> {
  const encoded = new TextEncoder().encode(input);
  return new Uint8Array(encoded);
}

function encodeBase64Url(input: string): string {
  return bytesToBase64Url(new TextEncoder().encode(input));
}

function decodeBase64Url(value: string): string {
  return new TextDecoder().decode(base64UrlToBytes(value));
}

async function importE2EAuthKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    utf8Bytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signE2EAuthPayload(
  payloadSegment: string,
  secret: string,
): Promise<string> {
  const key = await importE2EAuthKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    utf8Bytes(payloadSegment),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

/**
 * Constant-time HMAC verification via Web Crypto. Returns `false` (never throws)
 * for a malformed signature segment or any verification error.
 */
async function verifyE2EAuthSignature(
  payloadSegment: string,
  signatureSegment: string,
  secret: string,
): Promise<boolean> {
  let signatureBytes: Uint8Array<ArrayBuffer>;
  try {
    signatureBytes = base64UrlToBytes(signatureSegment);
  } catch {
    return false;
  }

  try {
    const key = await importE2EAuthKey(secret);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      utf8Bytes(payloadSegment),
    );
  } catch {
    return false;
  }
}

/**
 * Mint a signed E2E bypass cookie value: `"<base64url(payload)>.<base64url(hmac)>"`.
 *
 * Throws when no signing key is available (`E2E_AUTH_SECRET` unset against a real
 * remote datasource; see `getE2EAuthSecret`) — an unsigned bypass primitive is
 * exactly the gap this guards against, so we refuse to produce one.
 */
export async function createE2EAuthCookieValue(
  session: E2EAuthSession,
): Promise<string> {
  const secret = getE2EAuthSecret();
  if (!secret) {
    throw new Error(
      "E2E_AUTH_SECRET is not set; refusing to mint an unsigned E2E auth cookie.",
    );
  }

  const payload: SignedE2EAuthPayload = {
    userId: session.userId,
    role: session.role,
    tenantId: session.tenantId,
    ...(session.profileId !== undefined
      ? { profileId: session.profileId }
      : {}),
    ...(session.memberships ? { memberships: session.memberships } : {}),
    exp: Math.floor(Date.now() / 1000) + E2E_AUTH_TOKEN_TTL_SECONDS,
  };

  const payloadSegment = encodeBase64Url(JSON.stringify(payload));
  const signatureSegment = await signE2EAuthPayload(payloadSegment, secret);
  return `${payloadSegment}.${signatureSegment}`;
}

/**
 * Verify and decode a signed E2E bypass cookie. Returns `null` — never throws —
 * for any missing / unsigned / forged / expired / malformed value so callers
 * fall back to an unauthenticated context.
 *
 * Fails closed when no signing key is available (`E2E_AUTH_SECRET` unset against
 * a real remote datasource): without the shared secret the signature cannot be
 * trusted, so no bypass identity is granted.
 *
 * INVARIANT — this function proves the cookie is *authentic*, NOT that the
 * environment is *allowed* to honor a bypass. Every caller that grants identity
 * from the result MUST first gate on {@link isE2EAuthBypassEnabled} and
 * {@link assertSupabaseDatasourceAllowedForE2EBypass}. Do not honor the returned
 * session without both. Current callers: `context.ts`, `middleware.ts`,
 * `apps/admin/src/cms/auth/supabase-strategy.ts`.
 */
export async function parseE2EAuthCookieValue(
  value: string | null | undefined,
): Promise<E2EAuthSession | null> {
  if (!value) return null;

  const secret = getE2EAuthSecret();
  if (!secret) return null;

  const segments = value.split(".");
  if (segments.length !== 2) return null;
  const [payloadSegment, signatureSegment] = segments;
  if (!payloadSegment || !signatureSegment) return null;

  const signatureValid = await verifyE2EAuthSignature(
    payloadSegment,
    signatureSegment,
    secret,
  );
  if (!signatureValid) return null;

  let parsed: Partial<SignedE2EAuthPayload>;
  try {
    parsed = JSON.parse(
      decodeBase64Url(payloadSegment),
    ) as Partial<SignedE2EAuthPayload>;
  } catch {
    return null;
  }

  if (typeof parsed.exp !== "number" || !Number.isFinite(parsed.exp)) {
    return null;
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (parsed.exp <= nowSeconds) {
    return null;
  }

  if (
    typeof parsed.userId !== "string" ||
    !parsed.userId ||
    typeof parsed.role !== "string" ||
    !USER_ROLE_SET.has(parsed.role as UserRole)
  ) {
    return null;
  }

  const profileId =
    typeof parsed.profileId === "string"
      ? parsed.profileId
      : parsed.profileId === null
        ? null
        : undefined;

  let memberships: E2EAuthMembership[] | undefined;
  if (parsed.memberships !== undefined) {
    if (!Array.isArray(parsed.memberships)) return null;
    memberships = [];
    for (const raw of parsed.memberships as unknown[]) {
      const membership = parseE2EAuthMembership(raw);
      // Authentic but malformed: fail closed rather than drop a row.
      if (!membership) return null;
      memberships.push(membership);
    }
  }

  return {
    userId: parsed.userId,
    role: parsed.role as UserRole,
    tenantId: typeof parsed.tenantId === "string" ? parsed.tenantId : null,
    ...(profileId !== undefined ? { profileId } : {}),
    ...(memberships ? { memberships } : {}),
  };
}

const E2E_BYPASS_LOOPBACK_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "host.docker.internal",
]);

function isLoopbackDatasourceHostname(hostname: string): boolean {
  const normalized = hostname
    .trim()
    .toLowerCase()
    .replace(/^\[(.*)\]$/, "$1");
  if (E2E_BYPASS_LOOPBACK_HOSTNAMES.has(normalized)) return true;
  return normalized.endsWith(".local") || normalized.endsWith(".localhost");
}

/**
 * Extract a Supabase hosted project ref from a URL (`<ref>.supabase.co` /
 * `.supabase.in`), else `null`.
 *
 * The trailing TLD is constrained to letters only (`[a-z]{2,}`) so a lookalike
 * host such as `myref.supabase.evil.com` does NOT resolve to a ref an attacker
 * could pre-seed into the allowlist. Custom API domains have no derivable ref;
 * allowlist those by full hostname instead.
 */
export function extractSupabaseProjectRef(
  supabaseUrl: string | null | undefined,
): string | null {
  if (!supabaseUrl) return null;
  let hostname: string;
  try {
    hostname = new URL(supabaseUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
  const match = hostname.match(/^([a-z0-9-]+)\.supabase\.[a-z]{2,}$/);
  return match ? match[1]! : null;
}

function getAllowedE2EBypassDatasources(): Set<string> {
  const raw = process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS;
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Is the configured Supabase datasource one the E2E bypass may run against?
 *
 * Binds the bypass to datasource IDENTITY rather than `NODE_ENV` (which is
 * non-"production" on staging, preview, and masked-prod too). Allowed when:
 * - no datasource is configured (nothing to protect), or
 * - the host is loopback (local Supabase / Docker), or
 * - the host is the non-resolving `example.supabase.co` placeholder, or
 * - the host or hosted project ref is listed in `E2E_AUTH_ALLOWED_SUPABASE_REFS`.
 *
 * Everything else — including production project refs and their read replicas —
 * is rejected.
 */
export function isSupabaseDatasourceAllowedForE2EBypass(
  supabaseUrl: string | null | undefined,
): boolean {
  if (!supabaseUrl) return true;

  let hostname: string;
  try {
    hostname = new URL(supabaseUrl).hostname.toLowerCase();
  } catch {
    return false;
  }

  if (isLoopbackDatasourceHostname(hostname)) return true;
  if (hostname === E2E_PLACEHOLDER_SUPABASE_HOST) return true;

  const allowed = getAllowedE2EBypassDatasources();
  if (allowed.has(hostname)) return true;

  const ref = extractSupabaseProjectRef(supabaseUrl);
  return ref !== null && allowed.has(ref);
}

/**
 * Throw unless the configured Supabase datasource is allowlisted for the E2E
 * bypass. Callers invoke this before granting a bypass identity, so a
 * bypass-enabled boot against a non-allowlisted datasource fails loudly before
 * serving a bypassed request.
 *
 * Logs before throwing so the misconfiguration is diagnosable even if a caller
 * swallows the error. The hostname is logged (it is a public `NEXT_PUBLIC_*`
 * value); the secret is never logged.
 */
export function assertSupabaseDatasourceAllowedForE2EBypass(
  supabaseUrl: string | null | undefined,
): void {
  if (isSupabaseDatasourceAllowedForE2EBypass(supabaseUrl)) return;
  let host = "<unparseable>";
  try {
    host = supabaseUrl ? new URL(supabaseUrl).host : "<unset>";
  } catch {
    // keep the placeholder
  }
  console.error(
    `[auth] E2E bypass blocked: Supabase datasource "${host}" is not in ` +
      `E2E_AUTH_ALLOWED_SUPABASE_REFS. Allowlist a non-production project ref/host ` +
      `or disable E2E_AUTH_BYPASS.`,
  );
  throw new Error(
    "E2E auth bypass is enabled but the configured Supabase datasource is not " +
      "allowlisted. Set E2E_AUTH_ALLOWED_SUPABASE_REFS to the project ref (or " +
      "hostname) of a non-production Supabase project, or disable " +
      "E2E_AUTH_BYPASS. Refusing to grant a bypass identity against a " +
      "non-allowlisted datasource.",
  );
}
