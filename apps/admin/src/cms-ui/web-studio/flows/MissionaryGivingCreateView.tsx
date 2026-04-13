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
import { useConfig } from "@payloadcms/ui";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatAdminURL } from "payload/shared";
import { useEffect, useMemo, useState } from "react";

import {
  TENANT_REQUIRED_MESSAGE,
  TenantSelectField,
  useSuperAdminTenantOptions,
} from "./tenant-picker";
import { buildWebStudioCreateFromTemplateUrl } from "./web-studio-create-api";
import { StudioLayout } from "../shell/studio-layout";

type MissionaryRow = {
  id: string;
  profile?: { full_name?: string | null; display_name?: string | null } | null;
};

export function MissionaryGivingCreateView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get("template") ?? "";
  const preselectedMissionaryId = searchParams.get("missionaryId") ?? "";
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    config: { routes },
  } = useConfig();

  const createUrl = useMemo(
    () =>
      buildWebStudioCreateFromTemplateUrl({
        apiRoute: routes.api,
      }),
    [routes.api],
  );

  const missionariesQuery = useQuery({
    queryKey: ["web-studio", "admin-missionaries"],
    queryFn: async () => {
      const res = await fetch("/api/admin/missionaries?limit=200", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to load missionaries");
      }
      const json = (await res.json()) as { missionaries?: MissionaryRow[] };
      return json.missionaries ?? [];
    },
  });
  const { isSuperAdmin, tenantsQuery } = useSuperAdminTenantOptions();

  const form = useForm({
    defaultValues: {
      missionaryId: preselectedMissionaryId,
      tenantId: "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      if (!templateId) {
        setSubmitError("Pick a template from the gallery first.");
        return;
      }
      if (!value.missionaryId) {
        setSubmitError("Select a missionary.");
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
          targetCollection: "missionary-giving-pages",
          templateId,
          missionaryId: value.missionaryId,
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
          path: `/collections/missionary-giving-pages/${body.existingId}`,
        });
        router.push(editPath);
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
        router.push(editPath);
      }
    },
  });

  useEffect(() => {
    if (preselectedMissionaryId) {
      form.setFieldValue("missionaryId", preselectedMissionaryId);
    }
  }, [form, preselectedMissionaryId]);

  return (
    <StudioLayout
      sectionLabel="Missionary Pages"
      currentLabel="New giving page"
    >
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <h1 className="font-semibold text-xl tracking-tight">
          Missionary giving page
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Canonical missionary ID is stored on the document. Title and slug are
          prefilled from Supabase profile data when possible.
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
                  options={tenantsQuery.data ?? []}
                  disabled={tenantsQuery.isPending || tenantsQuery.isError}
                  placeholder="Select tenant"
                />
              )}
            </form.Field>
          ) : null}

          <form.Field name="missionaryId">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label>Missionary</Label>
                <Select
                  value={field.state.value || undefined}
                  onValueChange={(v) => field.handleChange(v)}
                  disabled={
                    missionariesQuery.isPending || missionariesQuery.isError
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select missionary" />
                  </SelectTrigger>
                  <SelectContent>
                    {(missionariesQuery.data ?? []).map((m) => {
                      const label =
                        m.profile?.full_name?.trim() ||
                        m.profile?.display_name?.trim() ||
                        m.id;
                      return (
                        <SelectItem key={m.id} value={m.id}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          {missionariesQuery.isError ? (
            <p className="text-destructive text-sm">
              {(missionariesQuery.error as Error).message}
            </p>
          ) : null}

          {tenantsQuery.isError ? (
            <p className="text-destructive text-sm">
              {(tenantsQuery.error as Error).message}
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
