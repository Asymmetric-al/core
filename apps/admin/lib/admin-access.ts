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
};

type AdminShellTenant = {
  id: string;
  name: string;
  slug: string;
};

function normalizeTenant(tenant: AdminShellTenant | null, tenantId: string) {
  if (
    tenant &&
    typeof tenant.id === "string" &&
    typeof tenant.name === "string" &&
    typeof tenant.slug === "string"
  ) {
    return tenant;
  }

  return {
    id: tenantId,
    name: "",
    slug: "",
  };
}

const ADMIN_ALLOWED_ROLES = ["staff", "admin"] as const;

/**
 * The admin layouts' role gate: a signed-in user whose one live staff
 * membership resolves passes; anyone else goes to /login or /no-access.
 *
 * Mission Control acts on staff rows (plan 5.1), so the context resolves with
 * the staff class, and its tenant is that membership's. The profile's tenant
 * and role are not read. `apps/admin/proxy.ts` rejects wrong-app sessions at
 * the edge. The (app) and (payload) layouts still call this defense-in-depth
 * gate to establish the tenant-scoped auth context used by admin data reads.
 * API routes and narrower areas (for example the admin-only Eve workspace)
 * check access themselves.
 */
export async function requireAdminAccess(pathname: string) {
  const auth = await getAuthContext(undefined, { roleClass: "staff" });

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
  const shellReader = getAdminClient().client ?? serverClient;
  const [{ data: profile }, { data: tenant }] = await Promise.all([
    shellReader
      .from("profiles")
      .select("email, first_name, last_name, avatar_url")
      .eq("user_id", userId)
      .maybeSingle<AdminShellProfile>(),
    shellReader
      .from("tenants")
      .select("id, name, slug")
      .eq("id", tenantId)
      .maybeSingle<AdminShellTenant>(),
  ]);

  return createMCBootstrapState({
    userId,
    email: profile?.email ?? "",
    firstName: profile?.first_name,
    lastName: profile?.last_name,
    avatarUrl: profile?.avatar_url,
    role: auth.role,
    tenantId,
    tenant: normalizeTenant(tenant ?? null, tenantId),
  });
}
