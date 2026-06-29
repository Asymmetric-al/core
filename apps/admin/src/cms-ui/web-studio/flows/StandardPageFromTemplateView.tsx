"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { useAuth, useConfig } from "@payloadcms/ui";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { formatAdminURL } from "payload/shared";
import { Suspense, useMemo, useState } from "react";
import { z } from "zod";

import {
  TENANT_REQUIRED_MESSAGE,
  TenantSelectField,
  buildTenantsQuery,
  isSuperAdminUser,
} from "./tenant-picker";
import { Link, useRouter, useSearchParams } from "../routing";
import { buildWebStudioCreateFromTemplateUrl } from "./web-studio-create-api";
import { StudioLayout } from "../shell/studio-layout";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
});

export function StandardPageFromTemplateView() {
  return (
    <Suspense fallback={null}>
      <StandardPageFromTemplateViewContent />
    </Suspense>
  );
}

function StandardPageFromTemplateViewContent() {
  const searchParams = useSearchParams();
  const { get: readSearchParam } = searchParams;
  const get = readSearchParam.bind(searchParams);
  const { push } = useRouter();
  const templateId = get("template") ?? "";
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user } = useAuth();
  const isSuperAdmin = isSuperAdminUser(user);

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

  const tenantsQuery = useQuery(
    buildTenantsQuery({
      apiRoute: routes.api,
      serverURL,
      isSuperAdmin,
    }),
  );

  const form = useForm({
    defaultValues: {
      title: "",
      slug: "",
      tenantId: "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      const parsed = formSchema.safeParse(value);
      if (!parsed.success) {
        const first = parsed.error.flatten().fieldErrors;
        const msg = Object.values(first).flat()[0];
        setSubmitError(typeof msg === "string" ? msg : "Validation failed");
        return;
      }

      if (!templateId) {
        setSubmitError(
          "Missing template. Open this screen from the template gallery.",
        );
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
          targetCollection: "pages",
          templateId,
          title: parsed.data.title,
          slug: parsed.data.slug,
          ...(isSuperAdmin ? { tenantId: value.tenantId } : {}),
        }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        id?: string;
        collectionSlug?: string;
        error?: string;
        existingId?: string;
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
    <StudioLayout sectionLabel="Pages" currentLabel="New from template">
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <h1 className="font-semibold text-xl tracking-tight">
          Create standard page
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Draft is created with the template&apos;s default layout blocks. You
          can edit all fields after save opens the document workspace.
        </p>
        {!templateId ? (
          <p className="mt-4 text-destructive text-sm">
            No template selected. Go to{" "}
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/web-studio/templates">Templates</Link>
            </Button>
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
          <form.Field name="title">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  autoComplete="off"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="slug">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor="slug">URL slug</Label>
                <Input
                  id="slug"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="about-us"
                  autoComplete="off"
                />
              </div>
            )}
          </form.Field>

          {submitError ? (
            <p className="text-destructive text-sm" role="alert">
              {submitError}
            </p>
          ) : null}
          {tenantsQuery.isError ? (
            <p className="text-destructive text-sm">
              {(tenantsQuery.error as Error).message}
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
