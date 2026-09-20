import { formatAdminURL } from "payload/shared";

export type TenantOption = {
  id: string;
  name?: string | null;
  slug?: string | null;
};

export function isSuperAdminUser(user: unknown): boolean {
  if (!user || typeof user !== "object") {
    return false;
  }

  return "role" in user && (user as { role?: unknown }).role === "super_admin";
}

export function buildTenantOptionsUrl({
  apiRoute,
  serverURL,
}: {
  apiRoute: string;
  serverURL: string;
}) {
  return `${serverURL}${formatAdminURL({
    apiRoute,
    path: "/tenants",
  })}?limit=200&pagination=false&depth=0`;
}

export async function loadTenantOptions({
  apiRoute,
  serverURL,
}: {
  apiRoute: string;
  serverURL: string;
}): Promise<TenantOption[]> {
  const tenantsUrl = buildTenantOptionsUrl({ apiRoute, serverURL });
  const res = await fetch(tenantsUrl, { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to load tenants");
  }
  const json = (await res.json()) as { docs?: TenantOption[] };
  return (json.docs ?? []).map((tenant) => ({
    id: String(tenant.id),
    name: tenant.name ?? null,
    slug: tenant.slug ?? null,
  }));
}

export function buildTenantsQuery({
  apiRoute,
  serverURL,
  isSuperAdmin,
}: {
  apiRoute: string;
  serverURL: string;
  isSuperAdmin: boolean;
}) {
  return {
    enabled: isSuperAdmin,
    queryKey: ["web-studio", "tenants", serverURL, apiRoute, isSuperAdmin],
    queryFn: async () => loadTenantOptions({ apiRoute, serverURL }),
  } as const;
}
