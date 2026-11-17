import {
  getAuthContext,
  hasAnyContextRole,
  type AuthContext,
} from "@asym/auth/context";
import { CHOOSER_PATH } from "@asym/auth/tenant-address";
import { readDocumentScope } from "@asym/auth/tenant-server";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createClient } from "@asym/database/supabase/server";
import {
  createMCBootstrapState,
  type MCBootstrapState,
} from "@asym/lib/mission-control/bootstrap";
import { redirect } from "next/navigation";

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
  return loadShellState(auth, tenantId, userId);
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
    redirect(`${CHOOSER_PATH}?next=${encodeURIComponent(pathname)}`);
  }
  return { scope, shellState: await loadShellState(auth, tenantId, userId) };
}

/**
 * The shell's reader: the service-role client where one is configured, else
 * the request's session (which cannot read `tenants`). This is the file's one
 * service-role site on the reviewed allowlist
 * (`docs/security/service-role-client-allowlist.json`); keep it the only one.
 */
async function createShellReader() {
  const serverClient = await createClient();
  return getAdminClient().client ?? serverClient;
}

/**
 * Organization names for the chooser (plan 5.2), as the shell reads its own
 * tenant's name. Call it only with tenant ids taken from the signed-in
 * person's own live rows: it reads names, nothing else, and authorizes
 * nothing.
 */
export async function readOrganizationNames(
  tenantIds: string[],
): Promise<ReadonlyMap<string, string>> {
  const shellReader = await createShellReader();
  const { data, error } = await shellReader
    .from("tenants")
    .select("id, name")
    .in("id", tenantIds);
  if (error || !data) return new Map();
  return new Map(
    (data as Array<{ id: string; name: string | null }>).flatMap((tenant) =>
      tenant.name?.trim() ? [[tenant.id, tenant.name.trim()] as const] : [],
    ),
  );
}

async function loadShellState(
  auth: AuthContext,
  tenantId: string,
  userId: string,
): Promise<MCBootstrapState> {
  const shellReader = await createShellReader();
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
    profileRole: auth.role,
    tenantId,
    tenant: normalizeTenant(tenant ?? null, tenantId),
  });
}
