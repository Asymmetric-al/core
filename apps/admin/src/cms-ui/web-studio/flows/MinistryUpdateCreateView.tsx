"use client";

import { readJsonBody } from "@asym/lib/http/fetch-result";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { useConfig } from "@payloadcms/ui";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { formatAdminURL } from "payload/shared";
import { Suspense, useMemo, useState } from "react";
import { z } from "zod";

import { slugFromTitle } from "./slug";
import {
  StudioFieldError,
  StudioFlowFieldNote,
  StudioFlowFrame,
  StudioRequiredLabel,
  StudioSelectField,
  describedBy,
  studioFieldErrorId,
  useStudioFieldErrors,
} from "./studio-flow-frame";
import { StudioFlowLoading } from "./studio-flow-loading";
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
import { normalizeWebAddressSegment } from "../../../cms/web-address";
import { WEB_STUDIO_COLLECTION_CONFIGS } from "../collections/config";
import { useRouter, useSearchParams } from "../routing";

type ProfileDoc = {
  id: string | number;
  fullName?: string;
  slug?: string;
};

const formSchema = z.object({
  missionaryProfileId: z.string().min(1, "Select a missionary profile."),
  title: z.string().min(1, "Enter a title."),
  slug: z.string().min(1, "Enter a URL slug."),
  tenantId: z.string().optional(),
});

/** Field ids in screen order: the first invalid one takes focus. */
const FIELD_IDS = {
  template: "mu-template",
  tenantId: "mu-tenant",
  missionaryProfileId: "mu-profile",
  title: "mu-title",
  slug: "mu-slug",
} as const;

export function MinistryUpdateCreateView() {
  return (
    <Suspense fallback={<StudioFlowLoading />}>
      <MinistryUpdateCreateViewContent />
    </Suspense>
  );
}

function MinistryUpdateCreateViewContent() {
  const searchParams = useSearchParams();
  const { get: readSearchParam } = searchParams;
  const get = readSearchParam.bind(searchParams);
  const { push } = useRouter();
  const templateParam = get("template") ?? "";
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [chosenTemplateId, setChosenTemplateId] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const fieldErrors = useStudioFieldErrors(FIELD_IDS);
  const templates = useStudioTemplates();
  const templateId =
    templateParam ||
    chosenTemplateId ||
    soleTemplateId(templates.data, "ministry_update");

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

  const form = useForm({
    defaultValues: {
      missionaryProfileId: "",
      title: "",
      slug: "",
      tenantId: "",
    },
    onSubmit: async ({ value }) => {
      if (
        !canChooseTemplate(
          templateId,
          templates.data,
          "ministry_update",
          templates,
        )
      )
        return;
      setSubmitError(null);
      const parsed = formSchema.safeParse(value);
      const issues = parsed.success ? {} : parsed.error.flatten().fieldErrors;
      const valid = fieldErrors.report({
        template: templateId ? undefined : "Choose a template to start from.",
        tenantId:
          isSuperAdmin && !value.tenantId ? TENANT_REQUIRED_MESSAGE : undefined,
        missionaryProfileId: issues.missionaryProfileId?.[0],
        title: issues.title?.[0],
        slug: issues.slug?.[0],
      });
      if (!valid || !parsed.success) {
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
      }).catch(() => null);

      if (!res) {
        setSubmitError(
          "Unable to create draft. Check your connection and try again.",
        );
        return;
      }

      // Read the payload for both branches (error responses carry data) with
      // the status check made before the body is consumed.
      const { ok, body } = await readJsonBody<{
        id?: string;
        collectionSlug?: string;
        error?: string;
        fieldErrors?: { slug?: string[] };
      }>(res);

      if (!ok) {
        if (body?.fieldErrors?.slug?.[0])
          fieldErrors.report({ slug: body.fieldErrors.slug[0] });
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
  const tenantId = useStore(form.store, (state) => state.values.tenantId);
  const needsOrganization = isSuperAdmin && !tenantId;
  const profileParams = new URLSearchParams({
    limit: "200",
    pagination: "false",
    depth: "0",
    draft: "true",
  });
  if (isSuperAdmin && tenantId)
    profileParams.set("where[tenant][equals]", tenantId);
  const profilesUrl = `${serverURL}${formatAdminURL({ apiRoute: routes.api, path: "/missionary-profiles" })}?${profileParams}`;
  const {
    data: profiles,
    error: profilesError,
    isError: profilesIsError,
    isPending: profilesIsPending,
  } = useQuery({
    queryKey: ["web-studio", "missionary-profiles", profilesUrl],
    enabled: !needsOrganization,
    queryFn: async () => {
      const res = await fetch(profilesUrl, { credentials: "include" });
      if (!res.ok)
        throw new Error("Missionary profiles didn't load. Try again.");
      const json = (await res.json()) as { docs?: ProfileDoc[] };
      return json.docs ?? [];
    },
  });

  return (
    <StudioFlowFrame
      sectionLabel={
        WEB_STUDIO_COLLECTION_CONFIGS["ministry-updates"].sectionLabel
      }
      currentLabel="New update"
      title="New ministry update"
      description="Start a draft update for a missionary's supporters."
      cancelHref="/web-studio/collections/ministry-updates"
      error={submitError}
      isSubmitting={isSubmitting}
      canSubmit={canChooseTemplate(
        templateId,
        templates.data,
        "ministry_update",
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
        pageType="ministry_update"
        preselectedTemplateId={templateParam}
        value={templateId}
        onValueChange={(id) => {
          setChosenTemplateId(id);
          fieldErrors.clear("template");
        }}
        galleryHref="/web-studio/templates?pageType=ministry_update"
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
              onChange={() => {
                fieldErrors.clear("tenantId");
                form.setFieldValue("missionaryProfileId", "");
                fieldErrors.clear("missionaryProfileId");
              }}
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

      <form.Field name="missionaryProfileId">
        {(field) => (
          <StudioSelectField
            id={FIELD_IDS.missionaryProfileId}
            label="Missionary profile"
            required
            error={fieldErrors.errors.missionaryProfileId}
            items={(profiles ?? []).map((p) => ({
              value: String(p.id),
              label: p.fullName ?? p.slug ?? String(p.id),
            }))}
            value={field.state.value}
            onValueChange={(v) => {
              field.handleChange(v);
              fieldErrors.clear("missionaryProfileId");
            }}
            disabled={needsOrganization || profilesIsPending || profilesIsError}
            placeholder={
              needsOrganization
                ? "Choose an organization first"
                : profilesIsPending
                  ? "Loading profiles…"
                  : "Select profile"
            }
          >
            <StudioFlowFieldNote>
              Up to 200 profiles are shown. If a profile is missing, ask an
              administrator to check it.
            </StudioFlowFieldNote>
            {profilesIsError ? (
              <StudioFlowFieldNote tone="error">
                {(profilesError as Error).message}
              </StudioFlowFieldNote>
            ) : null}
          </StudioSelectField>
        )}
      </form.Field>

      <form.Field name="title">
        {(field) => (
          <Field data-invalid={fieldErrors.errors.title ? true : undefined}>
            <FieldLabel htmlFor={FIELD_IDS.title}>
              <StudioRequiredLabel>Title</StudioRequiredLabel>
            </FieldLabel>
            <Input
              id={FIELD_IDS.title}
              required
              aria-invalid={fieldErrors.errors.title ? true : undefined}
              aria-describedby={describedBy(
                fieldErrors.errors.title && studioFieldErrorId(FIELD_IDS.title),
              )}
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
                fieldErrors.clear("title");
                if (!slugEdited) {
                  const slug = slugFromTitle(e.target.value);
                  form.setFieldValue("slug", slug);
                  if (slug) fieldErrors.clear("slug");
                }
              }}
              onBlur={field.handleBlur}
              placeholder="e.g. Spring newsletter"
              autoComplete="off"
            />
            <StudioFieldError
              fieldId={FIELD_IDS.title}
              message={fieldErrors.errors.title}
            />
          </Field>
        )}
      </form.Field>

      <form.Field name="slug">
        {(field) => (
          <Field data-invalid={fieldErrors.errors.slug ? true : undefined}>
            <FieldLabel htmlFor={FIELD_IDS.slug}>
              <StudioRequiredLabel>URL slug</StudioRequiredLabel>
            </FieldLabel>
            <Input
              id={FIELD_IDS.slug}
              required
              aria-invalid={fieldErrors.errors.slug ? true : undefined}
              value={field.state.value}
              onChange={(e) => {
                setSlugEdited(true);
                field.handleChange(e.target.value);
                fieldErrors.clear("slug");
              }}
              onBlur={field.handleBlur}
              placeholder="e.g. spring-newsletter"
              autoComplete="off"
              aria-describedby={describedBy(
                "mu-slug-description",
                fieldErrors.errors.slug && studioFieldErrorId(FIELD_IDS.slug),
              )}
            />
            <FieldDescription id="mu-slug-description">
              The update&apos;s address, suggested from the title.
              {normalizeWebAddressSegment(field.state.value) ? (
                <span className="mt-1 block break-all">
                  Web address segment:{" "}
                  {normalizeWebAddressSegment(field.state.value)}
                </span>
              ) : null}
            </FieldDescription>
            <StudioFieldError
              fieldId={FIELD_IDS.slug}
              message={fieldErrors.errors.slug}
            />
          </Field>
        )}
      </form.Field>
    </StudioFlowFrame>
  );
}
