import { isServeUnderPathsEnabled } from "@asym/database/app-base-path";
import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";

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
  OrganizationNamesReadError,
  readOrganizationNames,
} from "./organization-names";
import {
  derivePrimaryRole,
  hasAnyRole,
  hasMembershipClass,
  hasRole,
  hasTenantAdministratorMembership,
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
  isNameGenerationRefused,
  isNameTenantRefused,
  NAME_GENERATION_HEADER,
  NAME_TENANT_HEADER,
  nameTenantIdOf,
  parseRoleClass,
  readNameGeneration,
  readNameTenantState,
  ROLE_CLASS_HEADER,
  SCOPE_GENERATION_HEADER,
  SCOPE_REFUSED_HEADER,
  TENANT_HEADER,
  type NameTenantState,
} from "./request-headers";

import type { Capability } from "./capabilities/registry";

export type { Capability, RoleClass };
import type {
  ActiveAssignment,
  AssignmentDenyReason,
  RoleClass,
} from "./principal/types";
import type { RequestScope } from "@asym/database/request-scope-headers";
import type { UserRole } from "@asym/database/types";

export interface AuthContext {
  userId: string | null;
  email: string | null;
  tenantId: string | null;
  role: UserRole | null;
  memberships: AuthMembership[];
  assignment?: ActiveAssignment | null;
  assignmentDenial?:
    AssignmentDenyReason | "no_role_class" | "generation_mismatch" | null;
  scopeRefused?: boolean;
  profileId: string | null;
  isAuthenticated: boolean;
}

export interface AuthenticatedContext extends AuthContext {
  userId: string;
  email: string | null;
  tenantId: string;
  role: UserRole;
  memberships: AuthMembership[];
  profileId: string;
  isAuthenticated: true;
}

export interface AuthContextOptions {
  roleClass?: RoleClass;
  proposedAssignmentId?: string;
  expectedTenantId?: string;
  nameTenant?: "ignore";
  allowAbsentScopeGeneration?: true;
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

  try {
    const cookieStore = await cookies();
    if (!request) await connection();

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
    memberships: [],
    assignment: null,
    assignmentDenial: null,
    profileId: null,
    isAuthenticated: false,
  };
}

async function readE2EBypassSession(
  request: Request | undefined,
): Promise<E2EAuthSession | null> {
  if (!isE2EAuthBypassEnabled()) {
    return null;
  }
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

async function getE2EAuthBypassContext(
  request: Request | undefined,
  narrowing: AssignmentNarrowing,
): Promise<AuthContext | null> {
  if (narrowing.nameRefused) return null;
  const e2eSession = await readE2EBypassSession(request);
  if (!e2eSession) {
    return null;
  }
  if (narrowing.tenantConflict) {
    return {
      ...createUnauthenticatedContext(),
      assignmentDenial: "tenant_mismatch",
      scopeRefused: true,
    };
  }
  if (narrowing.generationConflict) {
    return {
      ...createUnauthenticatedContext(),
      assignmentDenial: "generation_mismatch",
      scopeRefused: true,
    };
  }
  const assignments = listE2EAuthAssignments(e2eSession);
  const { roleClass } = narrowing;
  let selected: ActiveAssignment | null;
  let denial: AssignmentDenyReason = "no_assignment";
  if (roleClass) {
    const result = selectAssignment(
      assignments,
      selection(narrowing, roleClass),
    );
    selected = result.ok ? result.assignment : null;
    if (!result.ok) denial = result.reason;
  } else {
    const pool =
      narrowing.nameTenantId === null
        ? assignments
        : assignments.filter((a) => a.tenantId === narrowing.nameTenantId);
    selected = pool.length === 1 ? pool[0]! : null;
  }
  if (!selected) {
    return proposesScope(narrowing)
      ? {
          ...createUnauthenticatedContext(),
          assignmentDenial: denial,
          scopeRefused: refusesProposedScope(narrowing, denial),
        }
      : null;
  }
  const memberships = [toAuthMembership(selected)];
  return {
    userId: e2eSession.userId,
    email: null,
    tenantId: selected.tenantId,
    role: derivePrimaryRole({ memberships }),
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
  claimsTenant: boolean;
  tenantConflict: boolean;
  generationConflict: boolean;
  nameRefused: boolean;
  nameTenantId: string | null;
}

function selection(narrowing: AssignmentNarrowing, roleClass: RoleClass) {
  return {
    roleClass,
    ...(narrowing.proposedAssignmentId !== undefined
      ? { proposedAssignmentId: narrowing.proposedAssignmentId }
      : {}),
    ...(narrowing.expectedTenantId !== undefined
      ? { expectedTenantId: narrowing.expectedTenantId }
      : {}),
    ...(narrowing.nameTenantId !== null
      ? { nameTenantId: narrowing.nameTenantId }
      : {}),
  };
}

function proposesScope(narrowing: AssignmentNarrowing): boolean {
  return narrowing.proposedAssignmentId !== undefined || narrowing.claimsTenant;
}

async function readNameTenant(
  request: Request | undefined,
  options: AuthContextOptions,
): Promise<NameTenantState> {
  if (options.nameTenant === "ignore" || !isServeUnderPathsEnabled()) {
    return { kind: "off" };
  }
  const value = await readRequestHeader(request, NAME_TENANT_HEADER);
  return readNameTenantState({
    get: (name) => (name === NAME_TENANT_HEADER ? value : null),
  });
}

const SCOPE_REFUSALS: ReadonlySet<AssignmentDenyReason> = new Set([
  "not_owned_or_inactive",
  "role_class_mismatch",
  "tenant_mismatch",
  "ambiguous",
  "no_assignment",
]);

function refusesProposedScope(
  narrowing: AssignmentNarrowing,
  reason: AssignmentDenyReason,
): boolean {
  return proposesScope(narrowing) && SCOPE_REFUSALS.has(reason);
}

async function readGenerationClaim(
  request: Request | undefined,
  options: AuthContextOptions,
  name: NameTenantState,
): Promise<{ refused: boolean; conflict: boolean }> {
  const trusted = await readRequestHeader(request, NAME_GENERATION_HEADER);
  const generation = readNameGeneration({
    get: (header) => (header === NAME_GENERATION_HEADER ? trusted : null),
  });
  if (isNameGenerationRefused(name, generation)) {
    return { refused: true, conflict: false };
  }
  if (generation.kind !== "valid") return { refused: false, conflict: false };
  const claim = await readRequestHeader(request, SCOPE_GENERATION_HEADER);
  const conflict =
    claim === null
      ? request !== undefined && options.allowAbsentScopeGeneration !== true
      : claim !== String(generation.generation);
  return { refused: false, conflict };
}

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
  const headerTenantId = (
    await readRequestHeader(request, TENANT_HEADER)
  )?.trim();
  const name = await readNameTenant(request, options);
  const nameTenantId = nameTenantIdOf(name);
  const proposed = proposedAssignmentId ? { proposedAssignmentId } : {};
  if (nameTenantId === null) {
    const expectedTenantId = options.expectedTenantId ?? headerTenantId;
    return {
      roleClass,
      ...proposed,
      ...(expectedTenantId ? { expectedTenantId } : {}),
      claimsTenant: Boolean(expectedTenantId),
      tenantConflict: false,
      generationConflict: false,
      nameRefused: isNameTenantRefused(name),
      nameTenantId: null,
    };
  }
  const claims = [options.expectedTenantId, headerTenantId || undefined].filter(
    (claim): claim is string => claim !== undefined,
  );
  const generation = await readGenerationClaim(request, options, name);
  return {
    roleClass,
    ...proposed,
    expectedTenantId: nameTenantId,
    claimsTenant: claims.length > 0,
    tenantConflict: claims.some((claim) => claim !== nameTenantId),
    generationConflict: generation.conflict,
    nameRefused: generation.refused,
    nameTenantId,
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

  if (narrowing.nameRefused) {
    return denied(profile.id, "no_assignment");
  }

  if (narrowing.tenantConflict) {
    return { ...denied(profile.id, "tenant_mismatch"), scopeRefused: true };
  }

  if (narrowing.generationConflict) {
    return { ...denied(profile.id, "generation_mismatch"), scopeRefused: true };
  }

  const result = await resolveActiveAssignment(
    { ...selection(narrowing, roleClass), userId: user.id },
    createRpcAssignmentReader(supabase),
  );

  if (!result.ok) {
    return {
      ...denied(profile.id, result.reason),
      scopeRefused: refusesProposedScope(narrowing, result.reason),
    };
  }

  const memberships = [toAuthMembership(result.assignment)];
  return {
    userId: user.id,
    email,
    tenantId: result.assignment.tenantId,
    role: derivePrimaryRole({ memberships }),
    memberships,
    assignment: result.assignment,
    assignmentDenial: null,
    profileId: profile.id,
    isAuthenticated: true,
  };
}

export function requestScopeOf(context: AuthContext): RequestScope | null {
  const { assignment } = context;
  if (
    !context.isAuthenticated ||
    !assignment ||
    assignment.tenantId !== context.tenantId
  ) {
    return null;
  }
  return {
    tenantId: assignment.tenantId,
    assignmentId: assignment.assignmentId,
  };
}

export type SignedInAssignments =
  | {
      kind: "signed_in";
      userId: string;
      assignments: readonly ActiveAssignment[];
      organizationNames: ReadonlyMap<string, string>;
    }
  | { kind: "signed_out" }
  | { kind: "unavailable" };

export async function getSignedInAssignments(): Promise<SignedInAssignments> {
  const supabase = await createAuthContextClient();
  const {
    data: { user },
    error,
  } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null }, error: null };

  if (supabase && user && !error) {
    const [read, organizationNames] = await Promise.all([
      readActiveAssignments(user.id, createRpcAssignmentReader(supabase)),
      readOrganizationNames(supabase).catch((cause: unknown) => {
        if (cause instanceof OrganizationNamesReadError) return null;
        throw cause;
      }),
    ]);
    return read.ok && organizationNames
      ? {
          kind: "signed_in",
          userId: user.id,
          assignments: read.assignments,
          organizationNames,
        }
      : { kind: "unavailable" };
  }

  const e2eSession = await readE2EBypassSession(undefined);
  return e2eSession
    ? {
        kind: "signed_in",
        userId: e2eSession.userId,
        assignments: listE2EAuthAssignments(e2eSession),
        organizationNames: new Map(),
      }
    : { kind: "signed_out" };
}

export function contextCapabilities(
  context: AuthContext,
): readonly Capability[] {
  const memberships = Array.isArray(context.memberships)
    ? context.memberships
    : [];
  const [membership, ...others] = memberships;
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

export function membershipHasCapability(
  membership: AuthMembership,
  capability: Capability,
): boolean {
  if (!membership.isActive) return false;
  try {
    return resolveAssignmentCapabilities({
      assignmentId: "member-row",
      tenantId: membership.tenantId,
      membershipRole: membership.role,
      staffRole: membership.staffRole,
      isTenantAdmin: membership.isTenantAdmin === true,
    }).includes(capability);
  } catch (error) {
    if (error instanceof CapabilityResolutionError) return false;
    throw error;
  }
}

type MembershipView = Pick<
  AuthContext,
  "isAuthenticated" | "memberships" | "tenantId"
>;

export function hasContextRoleClass(
  context: MembershipView,
  roleClass: RoleClass,
): boolean {
  return (
    context.isAuthenticated &&
    hasMembershipClass(context.memberships, context.tenantId, roleClass)
  );
}

export function isTenantAdministrator(context: MembershipView): boolean {
  return (
    context.isAuthenticated &&
    hasTenantAdministratorMembership(context.memberships, context.tenantId)
  );
}

export function requireRoleClass(
  context: AuthContext,
  roleClasses: readonly RoleClass[],
): asserts context is AuthenticatedContext {
  requireAuth(context);
  if (
    !roleClasses.some((roleClass) => hasContextRoleClass(context, roleClass))
  ) {
    throw new Error(
      `Forbidden: requires a ${roleClasses.join(" or ")} membership`,
    );
  }
}

export function requireTenantAdministrator(
  context: AuthContext,
): asserts context is AuthenticatedContext {
  requireAuth(context);
  if (!isTenantAdministrator(context)) {
    throw new Error("Forbidden: requires the tenant administrator");
  }
}

export function requireCapability(
  context: AuthContext,
  capability: Capability,
): asserts context is AuthenticatedContext {
  requireAuth(context);
  if (!hasContextCapability(context, capability)) {
    throw new Error(`Forbidden: requires ${capability}`);
  }
}

export function hasContextRole(context: AuthContext, role: UserRole) {
  return hasRole({ memberships: context.memberships }, role);
}

export function hasAnyContextRole(context: AuthContext, roles: UserRole[]) {
  return hasAnyRole({ memberships: context.memberships }, roles);
}

export class ScopeRefusedError extends Error {
  readonly reason: string;

  constructor(reason: string | null | undefined) {
    super("Unauthorized");
    this.name = "ScopeRefusedError";
    this.reason = reason ?? "refused";
  }
}

export function scopeRefusedHeaders(
  context: Pick<AuthContext, "scopeRefused" | "assignmentDenial">,
): Record<string, string> | undefined {
  return context.scopeRefused
    ? { [SCOPE_REFUSED_HEADER]: context.assignmentDenial ?? "refused" }
    : undefined;
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
    if (context.scopeRefused) {
      throw new ScopeRefusedError(context.assignmentDenial);
    }
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
