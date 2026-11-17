import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";

import { resolveAssignmentCapabilities } from "./capabilities/effective-capabilities";
import { CapabilityResolutionError } from "./capabilities/errors";
import { DEMO_PROFILE_ID } from "./constants";
import {
  assertSupabaseDatasourceAllowedForE2EBypass,
  E2E_AUTH_COOKIE_NAME,
  getE2EAuthCookieNameForProxyHost,
  getE2EAuthCookieNameForRequest,
  isE2EAuthBypassEnabled,
  parseE2EAuthCookieValue,
  type E2EAuthSession,
} from "./e2e-auth";
import {
  derivePrimaryRole,
  hasAnyRole,
  hasRole,
  type AuthMembership,
} from "./permissions";
import {
  readActiveAssignments,
  resolveActiveAssignment,
  selectAssignment,
} from "./principal/assignment";
import { listE2EAuthAssignments } from "./principal/e2e-assignments";
import { createRpcAssignmentReader } from "./principal/reader";
import {
  ASSIGNMENT_HEADER,
  parseRoleClass,
  ROLE_CLASS_HEADER,
  TENANT_HEADER,
} from "./request-headers";

import type { Capability } from "./capabilities/registry";
import type {
  ActiveAssignment,
  AssignmentDenyReason,
  RoleClass,
} from "./principal/types";
import type { UserRole } from "@asym/database/types";

export interface AuthContext {
  userId: string | null;
  email: string | null;
  tenantId: string | null;
  role: UserRole | null;
  /**
   * @deprecated Always `null` since AL-2675: a profile role is no longer
   * authority, and nothing reads `profiles.role` here. Kept only so the call
   * sites the WP2a sweep moves onto `role` or a capability still compile.
   */
  profileRole: UserRole | null;
  /** The one membership the request acts under, as a role snapshot. */
  memberships: AuthMembership[];
  /**
   * The assignment the resolver selected; `null` (or absent, in contexts built
   * outside `getAuthContext`) for an E2E bypass identity or a denial.
   */
  assignment?: ActiveAssignment | null;
  /** Why no assignment resolved for a signed-in person; `null` otherwise. */
  assignmentDenial?: AssignmentDenyReason | "no_role_class" | null;
  profileId: string | null;
  isAuthenticated: boolean;
}

export interface AuthenticatedContext extends AuthContext {
  userId: string;
  email: string | null;
  tenantId: string;
  role: UserRole;
  profileRole: UserRole | null;
  memberships: AuthMembership[];
  profileId: string;
  isAuthenticated: true;
}

/**
 * How a caller narrows the resolution. Each value falls back to the request:
 * the role class to the `x-asym-role-class` header the app's proxy sets, the
 * proposed assignment to the `x-asym-assignment` header and the expected
 * tenant to the `x-asym-tenant` header. On a page request the proxy sets the
 * last two from the page address after its membership decision; on an API
 * request the own-API fetch wrapper sends the page's (plan 5.2). Each only
 * narrows: the resolver checks them against the caller's live rows.
 */
export interface AuthContextOptions {
  roleClass?: RoleClass;
  proposedAssignmentId?: string;
  expectedTenantId?: string;
}

function getBearerToken(request?: Request): string | null {
  const authorizationHeader = request?.headers.get("authorization")?.trim();
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, ...tokenParts] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer") {
    return null;
  }

  const token = tokenParts.join(" ").trim();
  return token || null;
}

/**
 * Supabase client that acts with the caller's own bearer token (RLS applies),
 * never the service role. Returns `null` when the public config is missing.
 */
export function createBearerSupabaseClient(
  token: string,
): SupabaseClient | null {
  const { url, key } = getSupabasePublicConfig();

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

async function createAuthContextClient(
  request?: Request,
): Promise<SupabaseClient | null> {
  const { url, key } = getSupabasePublicConfig();

  if (!url || !key) {
    return null;
  }

  const bearerToken = getBearerToken(request);
  if (bearerToken) {
    return createBearerSupabaseClient(bearerToken);
  }

  // Prefer the mutable Next.js cookie store whenever it is available so
  // route handlers that call getAuthContext(request) can persist refreshed
  // sessions. Fall back to the explicit Request Cookie header only when the
  // ambient store is unavailable (forwarded/sidecar contexts).
  try {
    const cookieStore = await cookies();

    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: Parameters<typeof cookieStore.set>[2];
          }>,
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    });
  } catch (error) {
    // Dynamic-API bailouts (prerender interrupts, redirects, notFound) must
    // never be swallowed here or Next.js can cache an unauthenticated render.
    unstable_rethrow(error);

    if (!request) {
      return null;
    }

    const requestCookies = parseCookieHeader(
      request.headers.get("cookie") ?? "",
    ).flatMap(({ name, value }) =>
      typeof value === "string" ? [{ name, value }] : [],
    );

    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return requestCookies;
        },
        // No mutable response cookie jar in this context.
        setAll() {},
      },
    });
  }
}

function createUnauthenticatedContext(): AuthContext {
  return {
    userId: null,
    email: null,
    tenantId: null,
    role: null,
    profileRole: null,
    memberships: [],
    assignment: null,
    assignmentDenial: null,
    profileId: null,
    isAuthenticated: false,
  };
}

/**
 * The signed E2E bypass session on this request, when the bypass is enabled
 * against an allowlisted datasource; `null` otherwise.
 */
async function readE2EBypassSession(
  request: Request | undefined,
): Promise<E2EAuthSession | null> {
  if (!isE2EAuthBypassEnabled()) {
    return null;
  }
  // Bind the bypass to datasource identity, not NODE_ENV: refuse to grant a
  // bypass identity unless the configured Supabase project is allowlisted.
  assertSupabaseDatasourceAllowedForE2EBypass(getSupabasePublicConfig().url);
  const requestCookieMap = request
    ? new Map(
        parseCookieHeader(request.headers.get("cookie") ?? "").flatMap(
          ({ name, value }) =>
            typeof value === "string" ? [[name, value] as const] : [],
        ),
      )
    : null;
  const cookieStore = request ? null : await cookies();
  const e2eCookieName = request
    ? getE2EAuthCookieNameForRequest(request)
    : getE2EAuthCookieNameForProxyHost((await headers()).get("host"));
  const getCookieValue = (name: string): string | undefined =>
    requestCookieMap?.get(name) ?? cookieStore?.get(name)?.value;
  let e2eSession = e2eCookieName
    ? await parseE2EAuthCookieValue(getCookieValue(e2eCookieName))
    : null;
  if (!e2eSession) {
    e2eSession = await parseE2EAuthCookieValue(
      getCookieValue(E2E_AUTH_COOKIE_NAME),
    );
  }
  return e2eSession;
}

/**
 * E2E bypass identity is only used when there is no valid Supabase session.
 * Otherwise a stale asym_e2e_auth cookie could override the real user in dev
 * (NODE_ENV !== production) whenever E2E_AUTH_BYPASS is enabled.
 */
async function getE2EAuthBypassContext(
  request: Request | undefined,
  narrowing: AssignmentNarrowing,
): Promise<AuthContext | null> {
  const e2eSession = await readE2EBypassSession(request);
  if (!e2eSession) {
    return null;
  }
  // The bypass identity holds the memberships its signed cookie names (or the
  // one its role implies) and is judged by the resolver's own rule, so the
  // tenant and assignment the request names select among them exactly as
  // they would among live rows.
  const assignments = listE2EAuthAssignments(e2eSession);
  const { roleClass } = narrowing;
  let selected: ActiveAssignment | null;
  if (roleClass) {
    const result = selectAssignment(assignments, { ...narrowing, roleClass });
    selected = result.ok ? result.assignment : null;
  } else {
    // No surface class (a context built outside a proxied request): only an
    // identity with exactly one membership resolves.
    selected = assignments.length === 1 ? assignments[0]! : null;
  }
  if (!selected) {
    return null;
  }
  const memberships = [toAuthMembership(selected)];
  return {
    userId: e2eSession.userId,
    email: null,
    tenantId: selected.tenantId,
    role: derivePrimaryRole({ memberships }),
    profileRole: null,
    memberships,
    assignment: selected,
    assignmentDenial: null,
    profileId: e2eSession.profileId ?? DEMO_PROFILE_ID,
    isAuthenticated: true,
  };
}

async function resolveUnauthenticatedOrE2EContext(
  bearerToken: string | null,
  request: Request | undefined,
  narrowing: AssignmentNarrowing,
): Promise<AuthContext> {
  if (!bearerToken) {
    const e2e = await getE2EAuthBypassContext(request, narrowing);
    if (e2e) {
      return e2e;
    }
  }
  return createUnauthenticatedContext();
}

/**
 * A request header: from the request when there is one, else from the
 * render's request headers. `null` outside a request scope.
 */
async function readRequestHeader(
  request: Request | undefined,
  name: string,
): Promise<string | null> {
  if (request) {
    return request.headers.get(name);
  }
  try {
    return (await headers()).get(name);
  } catch (error) {
    unstable_rethrow(error);
    return null;
  }
}

interface AssignmentNarrowing {
  roleClass: RoleClass | null;
  proposedAssignmentId?: string;
  expectedTenantId?: string;
}

/** The options, each falling back to its request header; blank values are absent. */
async function readAssignmentNarrowing(
  request: Request | undefined,
  options: AuthContextOptions,
): Promise<AssignmentNarrowing> {
  const roleClass =
    options.roleClass ??
    parseRoleClass(await readRequestHeader(request, ROLE_CLASS_HEADER));
  const proposedAssignmentId =
    options.proposedAssignmentId ??
    (await readRequestHeader(request, ASSIGNMENT_HEADER))?.trim();
  const expectedTenantId =
    options.expectedTenantId ??
    (await readRequestHeader(request, TENANT_HEADER))?.trim();
  return {
    roleClass,
    ...(proposedAssignmentId ? { proposedAssignmentId } : {}),
    ...(expectedTenantId ? { expectedTenantId } : {}),
  };
}

function toAuthMembership(assignment: ActiveAssignment): AuthMembership {
  return {
    tenantId: assignment.tenantId,
    role: assignment.membershipRole,
    staffRole: assignment.staffRole,
    isActive: true,
    isTenantAdmin: assignment.isTenantAdmin,
  };
}

/**
 * Who the caller is and the one membership the request acts under (plan 5.1).
 *
 * The caller is the validated Supabase user. The assignment comes from the
 * principal resolver over the caller's live memberships
 * (`public.current_user_assignments()`), given the surface's role class and,
 * when the person chose one, the proposed row. The resolver refuses a person
 * with no live row of that class, or with several and no choice: it never
 * guesses. The profile's tenant and role are not read: a profile role grants
 * nothing, and a signed-in person with no assignment is not authenticated for
 * the surface (`isAuthenticated: false`; `assignmentDenial` says why).
 */
export async function getAuthContext(
  request?: Request,
  options: AuthContextOptions = {},
): Promise<AuthContext> {
  const bearerToken = getBearerToken(request);
  const narrowing = await readAssignmentNarrowing(request, options);
  const { roleClass } = narrowing;

  const supabase = await createAuthContextClient(request);

  if (!supabase) {
    return resolveUnauthenticatedOrE2EContext(bearerToken, request, narrowing);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(bearerToken ?? undefined);

  if (userError || !user) {
    return resolveUnauthenticatedOrE2EContext(bearerToken, request, narrowing);
  }

  const email = typeof user.email === "string" ? user.email : null;
  const denied = (
    profileId: string | null,
    reason: AuthContext["assignmentDenial"],
  ): AuthContext => ({
    ...createUnauthenticatedContext(),
    userId: user.id,
    email,
    profileId,
    assignmentDenial: reason,
  });

  // Resolve the caller under their own RLS authority: the profile supplies
  // the profile id and nothing else.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile || typeof profile.id !== "string") {
    return denied(null, null);
  }

  if (!roleClass) {
    return denied(profile.id, "no_role_class");
  }

  const result = await resolveActiveAssignment(
    { ...narrowing, userId: user.id, roleClass },
    createRpcAssignmentReader(supabase),
  );

  if (!result.ok) {
    return denied(profile.id, result.reason);
  }

  const memberships = [toAuthMembership(result.assignment)];
  return {
    userId: user.id,
    email,
    tenantId: result.assignment.tenantId,
    role: derivePrimaryRole({ memberships }),
    profileRole: null,
    memberships,
    assignment: result.assignment,
    assignmentDenial: null,
    profileId: profile.id,
    isAuthenticated: true,
  };
}

export type SignedInAssignments =
  | {
      kind: "signed_in";
      userId: string;
      assignments: readonly ActiveAssignment[];
    }
  | { kind: "signed_out" }
  /** The membership read failed or returned a malformed row. */
  | { kind: "unavailable" };

/**
 * Every live membership row of the signed-in person, of every class and in
 * every tenant, validated by the resolver's reader (plan 5.2). Only the
 * organization chooser reads this: it must list a person's rows before any
 * one is selected, which `getAuthContext` refuses for a person in two
 * organizations. It authorizes nothing; whatever the person picks goes back
 * through the proxy's membership decision.
 */
export async function getSignedInAssignments(): Promise<SignedInAssignments> {
  const supabase = await createAuthContextClient();
  const {
    data: { user },
    error,
  } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null }, error: null };

  if (supabase && user && !error) {
    const read = await readActiveAssignments(
      user.id,
      createRpcAssignmentReader(supabase),
    );
    return read.ok
      ? { kind: "signed_in", userId: user.id, assignments: read.assignments }
      : { kind: "unavailable" };
  }

  const e2eSession = await readE2EBypassSession(undefined);
  return e2eSession
    ? {
        kind: "signed_in",
        userId: e2eSession.userId,
        assignments: listE2EAuthAssignments(e2eSession),
      }
    : { kind: "signed_out" };
}

/**
 * The capabilities of the one membership the request acts under (plan 5.1):
 * its sub-role or member bundle and, with the flag, the tenant administrator's.
 * Empty for an unauthenticated context, a context that does not hold exactly
 * one live membership, or a membership the registry cannot resolve: it fails
 * closed. Handlers ask for a capability with `hasContextCapability`.
 */
export function contextCapabilities(
  context: AuthContext,
): readonly Capability[] {
  const [membership, ...others] = context.memberships;
  if (
    !context.isAuthenticated ||
    !membership ||
    others.length > 0 ||
    !membership.isActive ||
    membership.tenantId !== context.tenantId
  ) {
    return [];
  }
  try {
    return resolveAssignmentCapabilities({
      assignmentId: context.assignment?.assignmentId ?? "unbacked-assignment",
      tenantId: membership.tenantId,
      membershipRole: membership.role,
      staffRole: membership.staffRole,
      isTenantAdmin: membership.isTenantAdmin === true,
    });
  } catch (error) {
    if (error instanceof CapabilityResolutionError) return [];
    throw error;
  }
}

export function hasContextCapability(
  context: AuthContext,
  capability: Capability,
): boolean {
  return contextCapabilities(context).includes(capability);
}

export function hasContextRole(context: AuthContext, role: UserRole) {
  return hasRole({ memberships: context.memberships }, role);
}

export function hasAnyContextRole(context: AuthContext, roles: UserRole[]) {
  return hasAnyRole({ memberships: context.memberships }, roles);
}

export function requireAuth(
  context: AuthContext,
): asserts context is AuthenticatedContext {
  if (
    !context.isAuthenticated ||
    !context.userId ||
    !context.tenantId ||
    !context.role
  ) {
    throw new Error("Unauthorized");
  }
}

export function requireRole(
  context: AuthContext,
  allowedRoles: UserRole[],
): asserts context is AuthenticatedContext {
  requireAuth(context);
  if (!hasAnyContextRole(context, allowedRoles)) {
    throw new Error(
      `Forbidden: requires one of ${allowedRoles.join(", ")} role`,
    );
  }
}
