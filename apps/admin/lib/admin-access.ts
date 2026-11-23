import {
  contextCapabilities,
  getAuthContext,
  hasAnyContextRole,
  requestScopeOf,
  type AuthContext,
} from "@asym/auth/context";
import { getProtectedAppRedirectPath } from "@asym/auth/redirects";
import { CHOOSER_PATH } from "@asym/auth/tenant-address";
import { readDocumentScope, redirectInTenant } from "@asym/auth/tenant-server";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createClient } from "@asym/database/supabase/server";
import {
  createMCBootstrapState,
  type MCBootstrapState,
} from "@asym/lib/mission-control/bootstrap";

import type { DocumentScope } from "@asym/database/document-scope";

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
 * the edge. The (app) layout still calls this defense-in-depth gate, through
 * `getTenantShell`, to establish the tenant-scoped auth context used by admin
 * data reads.
 * API routes and narrower areas (for example the admin-only Eve workspace)
 * check access themselves.
 */
export async function requireAdminAccess(pathname: string) {
  const auth = await getAuthContext(undefined, { roleClass: "staff" });

  // No user: sign-in. A signed-in person the resolver refused: /no-access,
  // never /login, which the proxy answers for a signed-in person by sending
  // them back to `next`, here, in a loop (council on the joined release,
  // JB3). The same decision as the missionary and donor layouts.
  const refused = getProtectedAppRedirectPath(
    auth,
    `/login?next=${encodeURIComponent(pathname)}`,
  );
  if (refused || !auth.userId) {
    return redirectInTenant(refused ?? "/no-access");
  }

  if (!auth.tenantId || !hasAnyContextRole(auth, [...ADMIN_ALLOWED_ROLES])) {
    return redirectInTenant("/no-access");
  }

  return { auth, tenantId: auth.tenantId, userId: auth.userId };
}

/**
 * The signed-in pages' gate and shell (plan 5.2): the role gate, the document
 * scope the proxy decided for the page address, and the shell's bootstrap
 * state in that scope's tenant. Every signed-in page lives under a tenant
 * address; the proxy sends an address without one to the person's one
 * organization or the chooser, so a page that still arrives without a scope
 * goes to the chooser.
 */
export async function getTenantShell(pathname: string): Promise<{
  scope: DocumentScope;
  shellState: MCBootstrapState;
}> {
  const { auth, tenantId, userId } = await requireAdminAccess(pathname);
  const scope = await readDocumentScope(auth);
  if (!scope) {
    return redirectInTenant(
      `${CHOOSER_PATH}?next=${encodeURIComponent(pathname)}`,
    );
  }
  return { scope, shellState: await loadShellState(auth, tenantId, userId) };
}

async function loadShellState(
  auth: AuthContext,
  tenantId: string,
  userId: string,
): Promise<MCBootstrapState> {
  const serverClient = await createClient(requestScopeOf(auth));
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
    capabilities: Array.isArray(auth.memberships)
      ? [...contextCapabilities(auth)]
      : [],
    tenantId,
    tenant: normalizeTenant(tenant ?? null, tenantId),
  });
}
