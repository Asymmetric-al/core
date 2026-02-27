import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  derivePrimaryRole,
  hasAnyRole,
  hasRole,
  type AuthMembership,
} from "./permissions";

import type { UserRole } from "@asym/database/types";

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
  tenantId: string | null;
  role: UserRole | null;
  profileRole: UserRole | null;
  memberships: AuthMembership[];
  profileId: string | null;
  isAuthenticated: boolean;
}

export interface AuthenticatedContext extends AuthContext {
  userId: string;
  tenantId: string;
  role: UserRole;
  profileRole: UserRole | null;
  memberships: AuthMembership[];
  profileId: string;
  isAuthenticated: true;
}

export async function getAuthContext(): Promise<AuthContext> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      userId: null,
      tenantId: null,
      role: null,
      profileRole: null,
      memberships: [],
      profileId: null,
      isAuthenticated: false,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, tenant_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return {
      userId: user.id,
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
  const memberships = await loadMembershipsForTenant(
    supabase,
    user.id,
    profile.tenant_id,
  );
  const role = derivePrimaryRole({ profileRole, memberships });

  return {
    userId: user.id,
    tenantId: profile.tenant_id,
    role,
    profileRole,
    memberships,
    profileId: profile.id,
    isAuthenticated: true,
  };
}

async function loadMembershipsForTenant(
  supabase: ReturnType<typeof createServerClient>,
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
