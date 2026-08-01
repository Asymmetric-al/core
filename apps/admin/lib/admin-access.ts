import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createClient } from "@asym/database/supabase/server";
import {
  createMCBootstrapState,
  type MCBootstrapState,
} from "@asym/lib/mission-control/bootstrap";
import { redirect } from "next/navigation";

type AdminShellProfile = {
  avatar_url: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  tenant_id: string | null;
  tenants:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | {
        id: string;
        name: string;
        slug: string;
      }[]
    | null;
};

function normalizeTenant(
  tenant: AdminShellProfile["tenants"],
  tenantId: string | null,
) {
  const resolvedTenant = Array.isArray(tenant) ? tenant[0] : tenant;

  if (
    resolvedTenant &&
    typeof resolvedTenant.id === "string" &&
    typeof resolvedTenant.name === "string" &&
    typeof resolvedTenant.slug === "string"
  ) {
    return resolvedTenant;
  }

  if (!tenantId) {
    return null;
  }

  return {
    id: tenantId,
    name: "Give Hope",
    slug: "give-hope",
  };
}

const ADMIN_ALLOWED_ROLES = ["staff", "admin", "super_admin"] as const;

/**
 * The only role gate in this app.
 *
 * `apps/admin/proxy.ts` rejects wrong-app sessions at the edge. Layouts still
 * call this defense-in-depth gate to establish the tenant-scoped auth context
 * used by admin data reads.
 */
export async function requireAdminAccess(pathname: string) {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated || !auth.userId) {
    redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }

  if (!auth.tenantId || !hasAnyContextRole(auth, [...ADMIN_ALLOWED_ROLES])) {
    redirect("/no-access");
  }

  return { auth, tenantId: auth.tenantId, userId: auth.userId };
}

export async function getProtectedShellState(
  pathname: string,
): Promise<MCBootstrapState> {
  const { auth, tenantId, userId } = await requireAdminAccess(pathname);

  const serverClient = await createClient();
  const profileReader = getAdminClient().client ?? serverClient;
  const { data: profile } = await profileReader
    .from("profiles")
    .select(
      "email, first_name, last_name, avatar_url, role, tenant_id, tenants(id, name, slug)",
    )
    .eq("user_id", userId)
    .maybeSingle<AdminShellProfile>();

  return createMCBootstrapState({
    userId,
    email: profile?.email ?? "",
    firstName: profile?.first_name,
    lastName: profile?.last_name,
    avatarUrl: profile?.avatar_url,
    profileRole:
      auth.profileRole ??
      auth.role ??
      (typeof profile?.role === "string" ? profile.role : null),
    tenantId,
    tenant: normalizeTenant(profile?.tenants ?? null, tenantId),
  });
}
