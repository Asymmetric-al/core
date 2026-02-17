import { createClient } from "@asym/database/supabase/server";
import type { UserRole } from "@asym/database/types";
import { DEMO_PROFILE_ID } from "./constants";

export { DEMO_PROFILE_ID };

export interface AuthContext {
  userId: string | null;
  tenantId: string | null;
  role: UserRole | null;
  profileId: string | null;
  isAuthenticated: boolean;
}

export interface AuthenticatedContext extends AuthContext {
  userId: string;
  tenantId: string;
  role: UserRole;
  profileId: string;
  isAuthenticated: true;
}

export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, tenant_id, role")
    .eq("id", DEMO_PROFILE_ID)
    .single();

  if (error || !profile) {
    throw new Error(
      `Demo profile not found (id=${DEMO_PROFILE_ID}). Run seed. ${error?.message ?? ""}`.trim(),
    );
  }

  return {
    userId: profile.id,
    tenantId: profile.tenant_id,
    role: (profile.role ?? "donor") as UserRole,
    profileId: profile.id,
    isAuthenticated: true,
  };
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
  if (!allowedRoles.includes(context.role)) {
    throw new Error(
      `Forbidden: requires one of ${allowedRoles.join(", ")} role`,
    );
  }
}
