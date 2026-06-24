"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { useAuth, useConfig } from "@payloadcms/ui";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatAdminURL } from "payload/shared";
import { Suspense, useMemo, useState } from "react";

import {
  TENANT_REQUIRED_MESSAGE,
  TenantSelectField,
  buildTenantsQuery,
  isSuperAdminUser,
} from "./tenant-picker";
import { buildWebStudioCreateFromTemplateUrl } from "./web-studio-create-api";
import { StudioLayout } from "../shell/studio-layout";

type FundRow = {
  id: string;
  name?: string | null;
};

export function ProjectPageCreateView() {
  return (
    <Suspense fallback={null}>
      <ProjectPageCreateViewContent />
    </Suspense>
  );
}

function ProjectPageCreateViewContent() {
  const searchParams = useSearchParams();
  const { get: readSearchParam } = searchParams;
  const get = readSearchParam.bind(searchParams);
  const { push } = useRouter();
  const templateId = get("template") ?? "";
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user } = useAuth();

  const {
    config: { routes, serverURL },
  } = useConfig();
  const isSuperAdmin = isSuperAdminUser(user);

  const createUrl = useMemo(
    () =>
      buildWebStudioCreateFromTemplateUrl({
        apiRoute: routes.api,
      }),
    [routes.api],
  );

  const {
    data: funds,
    error: fundsError,
    isError: fundsIsError,
    isPending: fundsIsPending,
  } = useQuery({
    queryKey: ["web-studio", "admin-funds"],
    queryFn: async () => {
      const res = await fetch("/api/admin/funds?limit=200", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to load funds");
      }
      const json = (await res.json()) as { funds?: FundRow[] };
      return json.funds ?? [];
    },
  });
  const {
    data: tenants,
    error: tenantsError,
    isError: tenantsIsError,
    isPending: tenantsIsPending,
  } = useQuery(
    buildTenantsQuery({ isSuperAdmin, apiRoute: routes.api, serverURL }),
  );

  const form = useForm({
    defaultValues: {
      fundId: "",
      tenantId: "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      if (!templateId) {
        setSubmitError("Pick a template from the gallery first.");
        return;
      }
      if (!value.fundId) {
        setSubmitError("Select a fund.");
        return;
      }
      if (isSuperAdmin && !value.tenantId) {
        setSubmitError(TENANT_REQUIRED_MESSAGE);
        return;
      }

      const res = await fetch(createUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCollection: "project-pages",
          templateId,
          fundId: value.fundId,
          ...(isSuperAdmin ? { tenantId: value.tenantId } : {}),
        }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        id?: string;
        collectionSlug?: string;
        error?: string;
        existingId?: string;
      };

      if (res.status === 409 && body.existingId) {
        const editPath = formatAdminURL({
          adminRoute: routes.admin,
          path: `/collections/project-pages/${body.existingId}`,
        });
        push(editPath);
        return;
      }

      if (!res.ok) {
        setSubmitError(body.error ?? "Create failed");
        return;
      }

      if (body.id && body.collectionSlug) {
        const editPath = formatAdminURL({
          adminRoute: routes.admin,
          path: `/collections/${body.collectionSlug}/${body.id}`,
        });
        push(editPath);
      }
    },
  });

  return (
    <StudioLayout sectionLabel="Project Pages" currentLabel="New project page">
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <h1 className="font-semibold text-xl tracking-tight">
          Fund-backed project page
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Project pages anchor to a canonical fund ID. Title, slug, and summary
          are prefilled from the fund record when available.
        </p>

        {!templateId ? (
          <p className="mt-4 text-muted-foreground text-sm">
            Choose a template from the{" "}
            <Link
              className="text-primary underline"
              href="/web-studio/templates"
            >
              gallery
            </Link>
            .
          </p>
        ) : null}

        <form
          className="mt-8 flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          {isSuperAdmin ? (
            <form.Field name="tenantId">
              {(field) => (
                <TenantSelectField
                  label="Tenant"
                  field={field}
                  options={tenants ?? []}
                  disabled={tenantsIsPending || tenantsIsError}
                  placeholder="Select tenant"
                />
              )}
            </form.Field>
          ) : null}

          <form.Field name="fundId">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label>Fund</Label>
                <Select
                  value={field.state.value || undefined}
                  onValueChange={(v) => field.handleChange(v)}
                  disabled={fundsIsPending || fundsIsError}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fund" />
                  </SelectTrigger>
                  <SelectContent>
                    {(funds ?? []).map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name?.trim() || f.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          {fundsIsError ? (
            <p className="text-destructive text-sm">
              {(fundsError as Error).message}
            </p>
          ) : null}

          {tenantsIsError ? (
            <p className="text-destructive text-sm">
              {(tenantsError as Error).message}
            </p>
          ) : null}

          {submitError ? (
            <p className="text-destructive text-sm" role="alert">
              {submitError}
            </p>
          ) : null}

          <Button type="submit" disabled={!templateId}>
            Create draft
          </Button>
        </form>
      </div>
    </StudioLayout>
  );
}
