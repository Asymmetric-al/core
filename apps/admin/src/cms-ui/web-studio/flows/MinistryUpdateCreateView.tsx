"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
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
import { formatAdminURL } from "payload/shared";
import { Suspense, useMemo, useState } from "react";
import { z } from "zod";

import {
  TENANT_REQUIRED_MESSAGE,
  TenantSelectField,
  useSuperAdminTenantOptions,
} from "./tenant-picker";
import { buildWebStudioCreateFromTemplateUrl } from "./web-studio-create-api";
import { Link, useRouter, useSearchParams } from "../routing";
import { StudioLayout } from "../shell/studio-layout";

type ProfileDoc = {
  id: string | number;
  fullName?: string;
  slug?: string;
};

const formSchema = z.object({
  missionaryProfileId: z.string().min(1, "Profile is required"),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  tenantId: z.string().optional(),
});

export function MinistryUpdateCreateView() {
  return (
    <Suspense fallback={null}>
      <MinistryUpdateCreateViewContent />
    </Suspense>
  );
}

function MinistryUpdateCreateViewContent() {
  const searchParams = useSearchParams();
  const { get: readSearchParam } = searchParams;
  const get = readSearchParam.bind(searchParams);
  const { push } = useRouter();
  const templateId = get("template") ?? "";
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    config: { routes, serverURL },
  } = useConfig();

  const createUrl = useMemo(
    () =>
      buildWebStudioCreateFromTemplateUrl({
        apiRoute: routes.api,
      }),
    [routes.api],
  );
  const {
    isSuperAdmin,
    tenants,
    tenantsError,
    tenantsIsError,
    tenantsIsPending,
  } = useSuperAdminTenantOptions();

  const profilesUrl = `${serverURL}${formatAdminURL({
    apiRoute: routes.api,
    path: "/missionary-profiles",
  })}?limit=200&pagination=false&depth=0&draft=true`;

  const {
    data: profiles,
    error: profilesError,
    isError: profilesIsError,
    isPending: profilesIsPending,
  } = useQuery({
    queryKey: ["web-studio", "missionary-profiles", profilesUrl],
    queryFn: async () => {
      const res = await fetch(profilesUrl, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to load missionary profiles");
      }
      const json = (await res.json()) as { docs?: ProfileDoc[] };
      return json.docs ?? [];
    },
  });

  const form = useForm({
    defaultValues: {
      missionaryProfileId: "",
      title: "",
      slug: "",
      tenantId: "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      const parsed = formSchema.safeParse(value);
      if (!parsed.success) {
        const msg = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
        setSubmitError(typeof msg === "string" ? msg : "Validation failed");
        return;
      }
      if (!templateId) {
        setSubmitError("Pick a ministry update template from the gallery.");
        return;
      }
      if (isSuperAdmin && !parsed.data.tenantId) {
        setSubmitError(TENANT_REQUIRED_MESSAGE);
        return;
      }

      const res = await fetch(createUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCollection: "ministry-updates",
          templateId,
          missionaryProfileId: parsed.data.missionaryProfileId,
          title: parsed.data.title,
          slug: parsed.data.slug,
          ...(isSuperAdmin ? { tenantId: parsed.data.tenantId } : {}),
        }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        id?: string;
        collectionSlug?: string;
        error?: string;
      };

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
    <StudioLayout
      sectionLabel="Ministry Updates"
      currentLabel="New from template"
    >
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <h1 className="font-semibold text-xl tracking-tight">
          Ministry update starter
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Creates a draft ministry update with empty rich text, linked to the
          selected missionary profile.
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
                  options={tenants}
                  disabled={tenantsIsPending || tenantsIsError}
                  placeholder="Select tenant"
                />
              )}
            </form.Field>
          ) : null}

          <form.Field name="missionaryProfileId">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label>Missionary profile</Label>
                <Select
                  value={field.state.value || null}
                  onValueChange={(v) => {
                    if (v === null) {
                      return;
                    }
                    field.handleChange(v);
                  }}
                  disabled={profilesIsPending || profilesIsError}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {(profiles ?? []).map((p) => (
                      <SelectItem key={String(p.id)} value={String(p.id)}>
                        {p.fullName ?? p.slug ?? String(p.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="title">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor="mu-title">Title</Label>
                <Input
                  id="mu-title"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="slug">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor="mu-slug">Slug</Label>
                <Input
                  id="mu-slug"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="spring-newsletter"
                />
              </div>
            )}
          </form.Field>

          {profilesIsError ? (
            <p className="text-destructive text-sm">
              {(profilesError as Error).message}
            </p>
          ) : null}
          {tenantsIsError && isSuperAdmin ? (
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
