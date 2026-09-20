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
      <Label>{label}</Label>
      <Select
        value={field.state.value || null}
        onValueChange={(v) => {
          if (v === null) {
            return;
          }
          field.handleChange(v);
        }}
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
    tenants: data ?? [],
    tenantsError: error,
    tenantsIsError: isError,
    tenantsIsPending: isPending,
  };
}
