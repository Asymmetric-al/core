import { getAdminClient } from "@asym/database/supabase/admin";
import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";

import {
  E2E_AUTH_COOKIE_NAME,
  getE2EAuthCookieNameForProxyHost,
  isE2EAuthBypassEnabled,
  parseE2EAuthCookieValue,
} from "./e2e-auth";
import {
  derivePrimaryRole,
  hasAnyRole,
  hasRole,
  type AuthMembership,
} from "./permissions";

import type { UserRole } from "@asym/database/types";

const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const MEMBERSHIP_ROLES = new Set(["donor", "missionary", "staff"]);
const STAFF_SUBROLES = new Set([
  "finance",
  "mobilizer",
  "development",
  "hr",
  "member_care",
]);

type MembershipRow = {
  tenant_id: string | null;
  role: string | null;
  staff_role: string | null;
  is_active: boolean | null;
};

export interface AuthContext {
  userId: string | null;
  email: string | null;
  tenantId: string | null;
  role: UserRole | null;
  profileRole: UserRole | null;
  memberships: AuthMembership[];
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

async function createAuthContextClient(
  request?: Request,
): Promise<SupabaseClient | null> {
  const { url, key } = getSupabasePublicConfig();

  if (!url || !key) {
    return null;
  }

  const bearerToken = getBearerToken(request);
  if (bearerToken) {
    return createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    });
  }

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
}

function createUnauthenticatedContext(): AuthContext {
  return {
    userId: null,
    email: null,
    tenantId: null,
    role: null,
    profileRole: null,
    memberships: [],
    profileId: null,
    isAuthenticated: false,
  };
}

/**
 * E2E bypass identity is only used when there is no valid Supabase session.
 * Otherwise a stale asym_e2e_auth cookie could override the real user in dev
 * (NODE_ENV !== production) whenever E2E_AUTH_BYPASS is enabled.
 */
async function getE2EAuthBypassContext(): Promise<AuthContext | null> {
  if (!isE2EAuthBypassEnabled()) {
    return null;
  }
  const cookieStore = await cookies();
  const host = (await headers()).get("host");
  const e2eCookieName = getE2EAuthCookieNameForProxyHost(host);
  let e2eSession = e2eCookieName
    ? parseE2EAuthCookieValue(cookieStore.get(e2eCookieName)?.value)
    : null;
  if (!e2eSession) {
    e2eSession = parseE2EAuthCookieValue(
      cookieStore.get(E2E_AUTH_COOKIE_NAME)?.value,
    );
  }
  if (!e2eSession) {
    return null;
  }
  const profileRole = e2eSession.role;
  const role = derivePrimaryRole({
    profileRole,
    memberships: [],
  });
  const tenantIdForBypass =
    e2eSession.tenantId ??
    (hasAnyRole({ profileRole, memberships: [] }, [
      "admin",
      "staff",
      "super_admin",
    ])
      ? DEFAULT_TENANT_ID
      : null);
  return {
    userId: e2eSession.userId,
    email: null,
    tenantId: tenantIdForBypass,
    role,
    profileRole,
    memberships: [],
    profileId: null,
    isAuthenticated: true,
  };
}

async function resolveUnauthenticatedOrE2EContext(
  bearerToken: string | null,
): Promise<AuthContext> {
  if (!bearerToken) {
    const e2e = await getE2EAuthBypassContext();
    if (e2e) {
      return e2e;
    }
  }
  return createUnauthenticatedContext();
}

export async function getAuthContext(request?: Request): Promise<AuthContext> {
  const bearerToken = getBearerToken(request);

  const supabase = await createAuthContextClient(request);

  if (!supabase) {
    return resolveUnauthenticatedOrE2EContext(bearerToken);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(bearerToken ?? undefined);

  if (userError || !user) {
    return resolveUnauthenticatedOrE2EContext(bearerToken);
  }

  const adminClient = getAdminClient().client;
  const profileReader = adminClient ?? supabase;

  const { data: profile } = await profileReader
    .from("profiles")
    .select("id, tenant_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return {
      userId: user.id,
      email: typeof user.email === "string" ? user.email : null,
      tenantId: null,
      role: null,
      profileRole: null,
      memberships: [],
      profileId: null,
      isAuthenticated: false,
    };
  }

  const profileRole =
    typeof profile.role === "string" ? (profile.role as UserRole) : null;
  const tenantId =
    typeof profile.tenant_id === "string"
      ? profile.tenant_id
      : profileRole === "super_admin"
        ? DEFAULT_TENANT_ID
        : null;
  const memberships = await loadMembershipsForTenant(
    adminClient ?? supabase,
    user.id,
    tenantId,
  );
  const role = derivePrimaryRole({ profileRole, memberships });

  return {
    userId: user.id,
    email: typeof user.email === "string" ? user.email : null,
    tenantId,
    role,
    profileRole,
    memberships,
    profileId: profile.id,
    isAuthenticated: true,
  };
}

async function loadMembershipsForTenant(
  supabase: SupabaseClient,
  userId: string,
  tenantId: string | null,
): Promise<AuthMembership[]> {
  if (!tenantId) {
    return [];
  }

  const { data: rows } = await supabase
    .schema("authz")
    .from("memberships")
    .select("tenant_id, role, staff_role, is_active")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .eq("is_active", true);

  return ((rows ?? []) as MembershipRow[])
    .filter(
      (row): row is MembershipRow & { tenant_id: string; role: string } =>
        typeof row.tenant_id === "string" &&
        typeof row.role === "string" &&
        MEMBERSHIP_ROLES.has(row.role),
    )
    .map((row) => ({
      tenantId: row.tenant_id,
      role: row.role as AuthMembership["role"],
      staffRole:
        typeof row.staff_role === "string" && STAFF_SUBROLES.has(row.staff_role)
          ? (row.staff_role as NonNullable<AuthMembership["staffRole"]>)
          : null,
      isActive: row.is_active ?? true,
    }));
}

export function hasContextRole(context: AuthContext, role: UserRole) {
  return hasRole(
    { profileRole: context.profileRole, memberships: context.memberships },
    role,
  );
}

export function hasAnyContextRole(context: AuthContext, roles: UserRole[]) {
  return hasAnyRole(
    { profileRole: context.profileRole, memberships: context.memberships },
    roles,
  );
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
