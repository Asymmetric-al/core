"use client";

import { readJsonBody } from "@asym/lib/http/fetch-result";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { useAuth, useConfig } from "@payloadcms/ui";
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
import { buildTenantsQuery, isSuperAdminUser } from "./tenant-options";
import { TENANT_REQUIRED_MESSAGE, TenantSelectField } from "./tenant-picker";
import { buildWebStudioCreateFromTemplateUrl } from "./web-studio-create-api";
import { normalizeWebAddressSegment } from "../../../cms/web-address";
import { WEB_STUDIO_COLLECTION_CONFIGS } from "../collections/config";
import { useRouter, useSearchParams } from "../routing";

const formSchema = z.object({
  title: z.string().min(1, "Enter a title."),
  slug: z.string().min(1, "Enter a URL slug."),
});

/** Field ids in screen order: the first invalid one takes focus. */
const FIELD_IDS = {
  template: "page-template",
  tenantId: "page-tenant",
  title: "title",
  slug: "slug",
} as const;

export function StandardPageFromTemplateView() {
  return (
    <Suspense fallback={<StudioFlowLoading />}>
      <StandardPageFromTemplateViewContent />
    </Suspense>
  );
}

function StandardPageFromTemplateViewContent() {
  const searchParams = useSearchParams();
  const { get: readSearchParam } = searchParams;
  const get = readSearchParam.bind(searchParams);
  const { push } = useRouter();
  const templateParam = get("template") ?? "";
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [chosenTemplateId, setChosenTemplateId] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const fieldErrors = useStudioFieldErrors(FIELD_IDS);
  const { user } = useAuth();
  const isSuperAdmin = isSuperAdminUser(user);
  const templates = useStudioTemplates();
  const templateId =
    templateParam ||
    chosenTemplateId ||
    soleTemplateId(templates.data, "standard");

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
    data: tenants,
    error: tenantsError,
    isError: tenantsIsError,
    isPending: tenantsIsPending,
  } = useQuery(
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
      if (!canChooseTemplate(templateId, templates.data, "standard", templates))
        return;
      setSubmitError(null);
      const parsed = formSchema.safeParse(value);
      const issues = parsed.success ? {} : parsed.error.flatten().fieldErrors;
      const valid = fieldErrors.report({
        template: templateId ? undefined : "Choose a template to start from.",
        tenantId:
          isSuperAdmin && !value.tenantId ? TENANT_REQUIRED_MESSAGE : undefined,
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
          targetCollection: "pages",
          templateId,
          title: parsed.data.title,
          slug: parsed.data.slug,
          ...(isSuperAdmin ? { tenantId: value.tenantId } : {}),
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
        existingId?: string;
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

  return (
    <StudioFlowFrame
      sectionLabel={WEB_STUDIO_COLLECTION_CONFIGS["pages"].sectionLabel}
      currentLabel="New page"
      title="New page"
      description="Start a draft page from a template's layout."
      cancelHref="/web-studio/collections/pages"
      error={submitError}
      isSubmitting={isSubmitting}
      canSubmit={canChooseTemplate(
        templateId,
        templates.data,
        "standard",
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
        pageType="standard"
        preselectedTemplateId={templateParam}
        value={templateId}
        onValueChange={(id) => {
          setChosenTemplateId(id);
          fieldErrors.clear("template");
        }}
        galleryHref="/web-studio/templates?pageType=standard"
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
              placeholder="e.g. About us"
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
              placeholder="e.g. about-us"
              autoComplete="off"
              aria-describedby={describedBy(
                "slug-description",
                fieldErrors.errors.slug && studioFieldErrorId(FIELD_IDS.slug),
              )}
            />
            <FieldDescription id="slug-description">
              The page address, suggested from the title.
              {normalizeWebAddressSegment(field.state.value) ? (
                <span className="mt-1 block break-all">
                  Web address: /{normalizeWebAddressSegment(field.state.value)}
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
