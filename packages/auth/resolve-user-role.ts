import { DEMO_TENANT_ID } from "./constants";

import type { SupabaseUserRoleReader } from "./middleware";
import type { RoleSnapshot } from "./permissions";
import type { UserRole } from "@asym/database/types";

const MEMBERSHIP_ROLES = new Set(["donor", "missionary", "staff"]);

type MembershipRow = {
  tenant_id: string | null;
  role: string | null;
  staff_role: string | null;
  is_active: boolean | null;
};

/**
 * Resolves a signed-in user's complete role snapshot for `createAuthMiddleware`.
 *
 * The edge evaluates the snapshot with the same `hasAnyRole` policy as the
 * server-side auth context. Keeping every active membership is essential for
 * users who legitimately access more than one app surface.
 *
 * Reads through the request-scoped client, so RLS applies and a user can only
 * resolve their own role. It never sees the service-role key, which has no
 * business at the edge.
 *
 * Returns `null` when the role cannot be established -- no profile row, an
 * unreadable table, a thrown query. The middleware treats `null` as "not
 * allowed", so every one of those degrades to a redirect rather than to
 * unchecked access.
 */
export async function resolveUserRoleFromDatabase({
  userId,
  supabase,
}: {
  userId: string;
  supabase: SupabaseUserRoleReader;
}): Promise<RoleSnapshot | null> {
  try {
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("tenant_id, role")
      .eq("user_id", userId)
      .maybeSingle();
    const profile = data as {
      tenant_id: string | null;
      role: string | null;
    } | null;

    if (profileError || !profile) {
      return null;
    }

    const profileRole =
      typeof profile.role === "string" ? (profile.role as UserRole) : null;

    // Mirrors `getAuthContext`: a super_admin without an explicit tenant is
    // scoped to the demo tenant rather than left tenant-less.
    const tenantId =
      typeof profile.tenant_id === "string"
        ? profile.tenant_id
        : profileRole === "super_admin"
          ? DEMO_TENANT_ID
          : null;

    const memberships = tenantId
      ? await loadActiveMemberships(supabase, userId, tenantId)
      : [];

    if (!memberships) {
      return null;
    }

    return { profileRole, memberships };
  } catch {
    return null;
  }
}

async function loadActiveMemberships(
  supabase: SupabaseUserRoleReader,
  userId: string,
  tenantId: string,
) {
  const { data: rows, error } = await supabase
    .schema("authz")
    .from("memberships")
    .select("tenant_id, role, staff_role, is_active")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .eq("is_active", true);

  if (error) {
    return null;
  }

  return ((rows ?? []) as MembershipRow[])
    .filter(
      (row): row is MembershipRow & { tenant_id: string; role: string } =>
        typeof row.tenant_id === "string" &&
        typeof row.role === "string" &&
        MEMBERSHIP_ROLES.has(row.role),
    )
    .map((row) => ({
      tenantId: row.tenant_id,
      role: row.role as "donor" | "missionary" | "staff",
      staffRole: null,
      isActive: true,
    }));
}
