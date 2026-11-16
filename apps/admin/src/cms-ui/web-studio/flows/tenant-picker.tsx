"use client";

import { useAuth, useConfig } from "@payloadcms/ui";
import { useQuery } from "@tanstack/react-query";

import { StudioSelectField } from "./studio-flow-frame";
import { isSuperAdminUser, buildTenantsQuery } from "./tenant-options";

import type { TenantOption } from "./tenant-options";
import type { ReactNode } from "react";

export const TENANT_REQUIRED_MESSAGE = "Choose an organization.";

export type { TenantOption } from "./tenant-options";

function organizationOptionLabel(
  tenant: TenantOption,
  options: TenantOption[],
) {
  const name = tenant.name?.trim();
  if (!name) return `Unnamed organization (${tenant.id})`;
  const matches = options.filter(
    (option) => option.name?.trim().toLowerCase() === name.toLowerCase(),
  );
  return matches.length > 1 ? `${name} (${tenant.id})` : name;
}

type TenantFieldLike = {
  state: { value: string };
  handleChange: (value: string) => void;
};

/** The tenant a super admin creates in; required, as the server enforces. */
export function TenantSelectField({
  id,
  field,
  options,
  disabled,
  label,
  placeholder,
  error,
  onChange,
  children,
}: {
  id?: string;
  field: TenantFieldLike;
  options: TenantOption[];
  disabled: boolean;
  label: string;
  placeholder: string;
  error?: string;
  onChange?: () => void;
  children?: ReactNode;
}) {
  return (
    <StudioSelectField
      id={id}
      label={label}
      items={options.map((tenant) => ({
        value: tenant.id,
        label: organizationOptionLabel(tenant, options),
      }))}
      value={field.state.value}
      onValueChange={(value) => {
        field.handleChange(value);
        onChange?.();
      }}
      disabled={disabled}
      placeholder={placeholder}
      required
      error={error}
    >
      {children}
    </StudioSelectField>
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
