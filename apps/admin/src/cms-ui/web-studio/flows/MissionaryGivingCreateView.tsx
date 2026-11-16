"use client";

import { readJsonBody } from "@asym/lib/http/fetch-result";
import { FieldDescription } from "@asym/ui/components/shadcn/field";
import { useConfig } from "@payloadcms/ui";
import { useForm, useStore } from "@tanstack/react-form";
import { formatAdminURL } from "payload/shared";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  StudioFlowFieldNote,
  StudioFlowFrame,
  StudioSelectField,
  useStudioFieldErrors,
} from "./studio-flow-frame";
import { StudioFlowLoading } from "./studio-flow-loading";
import {
  studioMissionaryOptions,
  useStudioMissionaries,
} from "./studio-missionaries";
import {
  StudioTemplateField,
  canChooseTemplate,
  soleTemplateId,
  useStudioTemplates,
} from "./studio-templates";
import {
  TENANT_REQUIRED_MESSAGE,
  TenantSelectField,
  useSuperAdminTenantOptions,
} from "./tenant-picker";
import { buildWebStudioCreateFromTemplateUrl } from "./web-studio-create-api";
import { WEB_STUDIO_COLLECTION_CONFIGS } from "../collections/config";
import { useRouter, useSearchParams } from "../routing";

/** Field ids in screen order: the first invalid one takes focus. */
const FIELD_IDS = {
  template: "giving-template",
  tenantId: "giving-tenant",
  missionaryId: "giving-missionary",
} as const;

export function MissionaryGivingCreateView() {
  return (
    <Suspense fallback={<StudioFlowLoading />}>
      <MissionaryGivingCreateViewContent />
    </Suspense>
  );
}

function MissionaryGivingCreateViewContent() {
  const searchParams = useSearchParams();
  const { get: readSearchParam } = searchParams;
  const get = readSearchParam.bind(searchParams);
  const { push } = useRouter();
  const templateParam = get("template") ?? "";
  const preselectedMissionaryId = get("missionaryId") ?? "";
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [chosenTemplateId, setChosenTemplateId] = useState("");
  const fieldErrors = useStudioFieldErrors(FIELD_IDS);
  const templates = useStudioTemplates();
  const templateId =
    templateParam ||
    chosenTemplateId ||
    soleTemplateId(templates.data, "missionary_giving");

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

  const {
    data: missionaries,
    error: missionariesError,
    isError: missionariesIsError,
    isPending: missionariesIsPending,
  } = useStudioMissionaries();
  const {
    isSuperAdmin,
    tenants,
    tenantsError,
    tenantsIsError,
    tenantsIsPending,
  } = useSuperAdminTenantOptions();

  const form = useForm({
    defaultValues: {
      missionaryId: preselectedMissionaryId,
      tenantId: "",
    },
    onSubmit: async ({ value }) => {
      if (missionariesIsPending || missionariesIsError) return;
      if (
        !canChooseTemplate(
          templateId,
          templates.data,
          "missionary_giving",
          templates,
        )
      )
        return;
      setSubmitError(null);
      const valid = fieldErrors.report({
        template: templateId ? undefined : "Choose a template to start from.",
        tenantId:
          isSuperAdmin && !value.tenantId ? TENANT_REQUIRED_MESSAGE : undefined,
        missionaryId: value.missionaryId ? undefined : "Select a missionary.",
      });
      if (!valid) {
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
        toast.info("This giving page already exists, so we opened it.");
        const editPath = formatAdminURL({
          adminRoute: routes.admin,
          path: `/collections/missionary-giving-pages/${body.existingId}`,
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

  useEffect(() => {
    if (preselectedMissionaryId) {
      form.setFieldValue("missionaryId", preselectedMissionaryId);
    }
  }, [form, preselectedMissionaryId]);

  const galleryHref = preselectedMissionaryId
    ? `/web-studio/templates?pageType=missionary_giving&missionaryId=${encodeURIComponent(preselectedMissionaryId)}`
    : "/web-studio/templates?pageType=missionary_giving";

  return (
    <StudioFlowFrame
      sectionLabel={
        WEB_STUDIO_COLLECTION_CONFIGS["missionary-giving-pages"].sectionLabel
      }
      currentLabel="New giving page"
      title="New giving page"
      description="Create a draft support page for one missionary."
      cancelHref="/web-studio/collections/missionary-giving-pages"
      error={submitError}
      isSubmitting={isSubmitting}
      canSubmit={
        !missionariesIsPending &&
        !missionariesIsError &&
        canChooseTemplate(
          templateId,
          templates.data,
          "missionary_giving",
          templates,
        )
      }
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
        pageType="missionary_giving"
        preselectedTemplateId={templateParam}
        value={templateId}
        onValueChange={(id) => {
          setChosenTemplateId(id);
          fieldErrors.clear("template");
        }}
        galleryHref={galleryHref}
        error={fieldErrors.errors.template}
      />
      {isSuperAdmin ? (
        <form.Field name="tenantId">
          {(field) => (
            <TenantSelectField
              id={FIELD_IDS.tenantId}
              label="Organization"
              field={field}
              options={tenants}
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

      <form.Field name="missionaryId">
        {(field) => (
          <StudioSelectField
            id={FIELD_IDS.missionaryId}
            label="Missionary"
            required
            error={fieldErrors.errors.missionaryId}
            items={studioMissionaryOptions(missionaries ?? [])}
            value={field.state.value}
            onValueChange={(v) => {
              field.handleChange(v);
              fieldErrors.clear("missionaryId");
            }}
            disabled={missionariesIsPending || missionariesIsError}
            placeholder={
              missionariesIsPending
                ? "Loading missionaries…"
                : "Select missionary"
            }
          >
            {missionariesIsError ? (
              <StudioFlowFieldNote tone="error">
                {(missionariesError as Error).message}
              </StudioFlowFieldNote>
            ) : (
              <FieldDescription>
                Title and address come from the missionary&apos;s profile.
              </FieldDescription>
            )}
          </StudioSelectField>
        )}
      </form.Field>
    </StudioFlowFrame>
  );
}
