"use client";

import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import { useAuth, useConfig } from "@payloadcms/ui";
import { useQuery } from "@tanstack/react-query";

import { isSuperAdminUser, buildTenantsQuery } from "./tenant-options";

import type { TenantOption } from "./tenant-options";

export const TENANT_REQUIRED_MESSAGE = "Select a tenant.";

export type { TenantOption } from "./tenant-options";

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
      <SearchableSelect
        items={[
          ...options.map((tenant) => ({
            value: tenant.id,
            label: tenant.name?.trim() || tenant.slug?.trim() || tenant.id,
          })),
        ]}
        value={field.state.value || null}
        onValueChange={(v) => {
          if (v === null) {
            return;
          }
          field.handleChange(v);
        }}
        disabled={disabled}
        placeholder={placeholder}
        label={label}
      />
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
    tenants: data ?? [],
    tenantsError: error,
    tenantsIsError: isError,
    tenantsIsPending: isPending,
  };
}
