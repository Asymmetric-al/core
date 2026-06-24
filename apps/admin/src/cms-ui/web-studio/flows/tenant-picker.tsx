"use client";

import { Label } from "@asym/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { useAuth, useConfig } from "@payloadcms/ui";
import { useQuery } from "@tanstack/react-query";
import { formatAdminURL } from "payload/shared";

export type TenantOption = {
  id: string;
  name?: string | null;
  slug?: string | null;
};

export const TENANT_REQUIRED_MESSAGE = "Select a tenant.";

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

type TenantFieldLike = {
  state: { value: string };
  handleChange: (value: string) => void;
};

export function TenantSelectField({
  field,
  options,
  disabled,
  label,
  placeholder,
}: {
  field: TenantFieldLike;
  options: TenantOption[];
  disabled: boolean;
  label: string;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Select
        value={field.state.value || undefined}
        onValueChange={(v) => field.handleChange(v)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.name?.trim() || tenant.slug?.trim() || tenant.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function useSuperAdminTenantOptions() {
  const { user } = useAuth();
  const {
    config: { routes, serverURL },
  } = useConfig();

  const isSuperAdmin = isSuperAdminUser(user);
  const { data, error, isError, isPending } = useQuery(
    buildTenantsQuery({
      isSuperAdmin,
      apiRoute: routes.api,
      serverURL,
    }),
  );

  return {
    isSuperAdmin,
    tenantsQuery: {
      data,
      error,
      isError,
      isPending,
    },
  };
}
