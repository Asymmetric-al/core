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
 * Reads through the request-scoped client, so a user can only ever resolve
 * their own role: RLS covers the `profiles` read, and the membership RPC pins
 * its rows to `auth.uid()`. It never sees the service-role key, which has no
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
      ? await loadActiveMemberships(supabase, tenantId)
      : [];

    if (!memberships) {
      return null;
    }

    return { profileRole, memberships };
  } catch {
    return null;
  }
}

/**
 * Read through the `public.current_user_memberships` RPC, never through
 * `.schema("authz")`.
 *
 * `authz` is not in the PostgREST `db-schemas` list (`supabase/config.toml`
 * exposes `public` and `graphql_public`), so a direct schema switch returns
 * PGRST106 and this resolver fails closed -- locking every signed-in user out
 * of every role-gated route. The RPC is the one narrow window onto that table:
 * `20260802041500_current_user_memberships_rpc.sql`.
 *
 * It takes no user id. The function pins rows to `auth.uid()` itself, so the
 * edge cannot resolve anyone else's roles.
 */
async function loadActiveMemberships(
  supabase: SupabaseUserRoleReader,
  tenantId: string,
) {
  const { data: rows, error } = await supabase.rpc("current_user_memberships", {
    target_tenant: tenantId,
  });

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
