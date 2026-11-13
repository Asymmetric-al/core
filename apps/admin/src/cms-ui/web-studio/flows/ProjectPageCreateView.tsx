"use client";

import { readJsonBody } from "@asym/lib/http/fetch-result";
import { FieldDescription } from "@asym/ui/components/shadcn/field";
import { useAuth, useConfig } from "@payloadcms/ui";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { formatAdminURL } from "payload/shared";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  StudioFlowFieldNote,
  StudioFlowFrame,
  StudioSelectField,
  useStudioFieldErrors,
} from "./studio-flow-frame";
import { StudioFlowLoading } from "./studio-flow-loading";
import {
  StudioTemplateField,
  canChooseTemplate,
  soleTemplateId,
  useStudioTemplates,
} from "./studio-templates";
import { buildTenantsQuery, isSuperAdminUser } from "./tenant-options";
import { TENANT_REQUIRED_MESSAGE, TenantSelectField } from "./tenant-picker";
import { buildWebStudioCreateFromTemplateUrl } from "./web-studio-create-api";
import { WEB_STUDIO_COLLECTION_CONFIGS } from "../collections/config";
import { useRouter, useSearchParams } from "../routing";

type FundRow = {
  id: string;
  name?: string | null;
};

/** Field ids in screen order: the first invalid one takes focus. */
const FIELD_IDS = {
  template: "project-template",
  tenantId: "project-tenant",
  fundId: "project-fund",
} as const;

export function ProjectPageCreateView() {
  return (
    <Suspense fallback={<StudioFlowLoading />}>
      <ProjectPageCreateViewContent />
    </Suspense>
  );
}

function ProjectPageCreateViewContent() {
  const searchParams = useSearchParams();
  const { get: readSearchParam } = searchParams;
  const get = readSearchParam.bind(searchParams);
  const { push } = useRouter();
  const templateParam = get("template") ?? "";
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [chosenTemplateId, setChosenTemplateId] = useState("");
  const fieldErrors = useStudioFieldErrors(FIELD_IDS);
  const { user } = useAuth();
  const {
    config: { routes, serverURL },
  } = useConfig();
  const isSuperAdmin = isSuperAdminUser(user);
  const templates = useStudioTemplates();
  const templateId =
    templateParam ||
    chosenTemplateId ||
    soleTemplateId(templates.data, "project");

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
      if (!canChooseTemplate(templateId, templates.data, "project", templates))
        return;
      setSubmitError(null);
      const valid = fieldErrors.report({
        template: templateId ? undefined : "Choose a template to start from.",
        tenantId:
          isSuperAdmin && !value.tenantId ? TENANT_REQUIRED_MESSAGE : undefined,
        fundId: value.fundId ? undefined : "Select a fund.",
      });
      if (!valid) {
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
      }).catch(() => null);

      if (!res) {
        setSubmitError(
          "Unable to create draft. Check your connection and try again.",
        );
        return;
      }

      // Read the payload for both branches (409 conflicts and errors carry
      // data) with the status check made before the body is consumed.
      const { ok, status, body } = await readJsonBody<{
        id?: string;
        collectionSlug?: string;
        error?: string;
        existingId?: string;
      }>(res);

      if (status === 409 && body?.existingId) {
        toast.info("This project page already exists, so we opened it.");
        const editPath = formatAdminURL({
          adminRoute: routes.admin,
          path: `/collections/project-pages/${body.existingId}`,
        });
        push(editPath);
        return;
      }

      if (!ok) {
        setSubmitError(body?.error ?? "Create failed");
        return;
      }

      if (body?.id && body.collectionSlug) {
        const editPath = formatAdminURL({
          adminRoute: routes.admin,
          path: `/collections/${body.collectionSlug}/${body.id}`,
        });
        push(editPath);
      }
    },
  });
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <StudioFlowFrame
      sectionLabel={WEB_STUDIO_COLLECTION_CONFIGS["project-pages"].sectionLabel}
      currentLabel="New project page"
      title="New project page"
      description="Create a draft landing page for one fund."
      cancelHref="/web-studio/collections/project-pages"
      error={submitError}
      isSubmitting={isSubmitting}
      canSubmit={canChooseTemplate(
        templateId,
        templates.data,
        "project",
        templates,
      )}
      onSubmit={(e) => {
        e.preventDefault();
        if (form.state.isSubmitting) {
          return;
        }
        void form.handleSubmit();
      }}
    >
      <StudioTemplateField
        id={FIELD_IDS.template}
        pageType="project"
        preselectedTemplateId={templateParam}
        value={templateId}
        onValueChange={(id) => {
          setChosenTemplateId(id);
          fieldErrors.clear("template");
        }}
        galleryHref="/web-studio/templates?pageType=project"
        error={fieldErrors.errors.template}
      />
      {isSuperAdmin ? (
        <form.Field name="tenantId">
          {(field) => (
            <TenantSelectField
              id={FIELD_IDS.tenantId}
              label="Organization"
              field={field}
              options={tenants ?? []}
              disabled={tenantsIsPending || tenantsIsError}
              placeholder="Choose an organization"
              error={fieldErrors.errors.tenantId}
              onChange={() => fieldErrors.clear("tenantId")}
            >
              {tenantsIsError ? (
                <StudioFlowFieldNote tone="error">
                  {(tenantsError as Error).message}
                </StudioFlowFieldNote>
              ) : null}
            </TenantSelectField>
          )}
        </form.Field>
      ) : null}
      <form.Field name="fundId">
        {(field) => (
          <StudioSelectField
            id={FIELD_IDS.fundId}
            label="Fund"
            required
            error={fieldErrors.errors.fundId}
            items={(funds ?? []).map((f) => ({
              value: f.id,
              label: f.name?.trim() || f.id,
            }))}
            value={field.state.value}
            onValueChange={(v) => {
              field.handleChange(v);
              fieldErrors.clear("fundId");
            }}
            disabled={fundsIsPending || fundsIsError}
            placeholder={fundsIsPending ? "Loading funds…" : "Select fund"}
          >
            {fundsIsError ? (
              <StudioFlowFieldNote tone="error">
                {(fundsError as Error).message}
              </StudioFlowFieldNote>
            ) : (
              <FieldDescription>
                Title, address and summary come from the fund.
              </FieldDescription>
            )}
          </StudioSelectField>
        )}
      </form.Field>
    </StudioFlowFrame>
  );
}
