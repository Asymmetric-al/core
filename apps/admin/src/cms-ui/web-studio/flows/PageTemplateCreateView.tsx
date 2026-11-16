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
import { formatAdminURL } from "payload/shared";
import { Suspense, useState } from "react";

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
import { STUDIO_PAGE_TYPES } from "./studio-templates";
import {
  TENANT_REQUIRED_MESSAGE,
  TenantSelectField,
  useSuperAdminTenantOptions,
} from "./tenant-picker";
import { PAGE_TEMPLATES_SLUG } from "../../../cms/constants";
import { WEB_STUDIO_COLLECTION_CONFIGS } from "../collections/config";
import { useRouter } from "../routing";

import type { StudioPageType } from "./studio-templates";

/** Field ids in screen order: the first invalid one takes focus. */
const FIELD_IDS = {
  tenantId: "template-tenant",
  name: "template-name",
  pageType: "template-page-type",
  templateKey: "template-key",
} as const;

const PAGE_TYPE_ITEMS = (
  Object.keys(STUDIO_PAGE_TYPES) as StudioPageType[]
).map((value) => ({ value, label: STUDIO_PAGE_TYPES[value].label }));

type PayloadCreateResponse = {
  doc?: { id?: string | number };
  errors?: Array<{ message?: string }>;
  message?: string;
};

/**
 * The Page Templates create route. Payload's stock create view saves an
 * empty draft as soon as it renders for an autosave collection, so every
 * visit left an "Untitled (N)" template behind. This flow saves nothing
 * until the editor submits a name, page type and key; the new draft then
 * opens in the template editor, where autosave carries on as before.
 */
export function PageTemplateCreateView() {
  return (
    <Suspense fallback={<StudioFlowLoading />}>
      <PageTemplateCreateViewContent />
    </Suspense>
  );
}

function PageTemplateCreateViewContent() {
  const { push } = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [keyEdited, setKeyEdited] = useState(false);
  const fieldErrors = useStudioFieldErrors(FIELD_IDS);
  const {
    config: { routes, serverURL },
  } = useConfig();
  const {
    isSuperAdmin,
    tenants,
    tenantsError,
    tenantsIsError,
    tenantsIsPending,
  } = useSuperAdminTenantOptions();

  const createUrl = `${serverURL}${formatAdminURL({
    apiRoute: routes.api,
    path: `/${PAGE_TEMPLATES_SLUG}`,
  })}?draft=true&depth=0`;

  const form = useForm({
    defaultValues: {
      tenantId: "",
      name: "",
      pageType: "standard" as string,
      templateKey: "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      const name = value.name.trim();
      const templateKey = value.templateKey.trim();
      const valid = fieldErrors.report({
        tenantId:
          isSuperAdmin && !value.tenantId ? TENANT_REQUIRED_MESSAGE : undefined,
        name: name ? undefined : "Enter a name.",
        pageType: value.pageType ? undefined : "Choose a page type.",
        templateKey: templateKey ? undefined : "Enter a template key.",
      });
      if (!valid) {
        return;
      }

      const res = await fetch(createUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          templateKey,
          pageType: value.pageType,
          // Other editors' tenant comes from their session on the server.
          ...(isSuperAdmin ? { tenant: value.tenantId } : {}),
        }),
      }).catch(() => null);

      if (!res) {
        setSubmitError(
          "Unable to create draft. Check your connection and try again.",
        );
        return;
      }

      const { ok, body } = await readJsonBody<PayloadCreateResponse>(res);
      const id = body?.doc?.id;
      if (!ok || id === undefined || id === null) {
        setSubmitError(
          body?.errors?.[0]?.message ?? body?.message ?? "Create failed",
        );
        return;
      }

      push(
        formatAdminURL({
          adminRoute: routes.admin,
          path: `/collections/${PAGE_TEMPLATES_SLUG}/${id}`,
        }),
      );
    },
  });
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <StudioFlowFrame
      sectionLabel={
        WEB_STUDIO_COLLECTION_CONFIGS["page-templates"].sectionLabel
      }
      currentLabel="New template"
      title="New template"
      description="Name a starting layout. You add its sections in the editor."
      cancelHref="/web-studio/templates"
      error={submitError}
      isSubmitting={isSubmitting}
      canSubmit
      onSubmit={(e) => {
        e.preventDefault();
        if (form.state.isSubmitting) {
          return;
        }
        void form.handleSubmit();
      }}
    >
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

      <form.Field name="name">
        {(field) => (
          <Field data-invalid={fieldErrors.errors.name ? true : undefined}>
            <FieldLabel htmlFor={FIELD_IDS.name}>
              <StudioRequiredLabel>Name</StudioRequiredLabel>
            </FieldLabel>
            <Input
              id={FIELD_IDS.name}
              required
              aria-invalid={fieldErrors.errors.name ? true : undefined}
              aria-describedby={describedBy(
                fieldErrors.errors.name && studioFieldErrorId(FIELD_IDS.name),
              )}
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
                fieldErrors.clear("name");
                if (!keyEdited) {
                  const key = slugFromTitle(e.target.value);
                  form.setFieldValue("templateKey", key);
                  if (key) fieldErrors.clear("templateKey");
                }
              }}
              onBlur={field.handleBlur}
              placeholder="e.g. Spring appeal"
              autoComplete="off"
            />
            <StudioFieldError
              fieldId={FIELD_IDS.name}
              message={fieldErrors.errors.name}
            />
          </Field>
        )}
      </form.Field>

      <form.Field name="pageType">
        {(field) => (
          <StudioSelectField
            id={FIELD_IDS.pageType}
            label="Page type"
            required
            error={fieldErrors.errors.pageType}
            items={PAGE_TYPE_ITEMS}
            value={field.state.value}
            onValueChange={(v) => {
              field.handleChange(v);
              fieldErrors.clear("pageType");
            }}
            placeholder="Select page type"
          >
            <FieldDescription>
              New pages of this type can start from the template.
            </FieldDescription>
          </StudioSelectField>
        )}
      </form.Field>

      <form.Field name="templateKey">
        {(field) => (
          <Field
            data-invalid={fieldErrors.errors.templateKey ? true : undefined}
          >
            <FieldLabel htmlFor={FIELD_IDS.templateKey}>
              <StudioRequiredLabel>Template key</StudioRequiredLabel>
            </FieldLabel>
            <Input
              id={FIELD_IDS.templateKey}
              required
              aria-invalid={fieldErrors.errors.templateKey ? true : undefined}
              aria-describedby={describedBy(
                "template-key-description",
                fieldErrors.errors.templateKey &&
                  studioFieldErrorId(FIELD_IDS.templateKey),
              )}
              value={field.state.value}
              onChange={(e) => {
                setKeyEdited(true);
                field.handleChange(e.target.value);
                fieldErrors.clear("templateKey");
              }}
              onBlur={field.handleBlur}
              placeholder="e.g. spring-appeal"
              autoComplete="off"
            />
            <FieldDescription id="template-key-description">
              A short code for the template, suggested from the name.
            </FieldDescription>
            <StudioFieldError
              fieldId={FIELD_IDS.templateKey}
              message={fieldErrors.errors.templateKey}
            />
          </Field>
        )}
      </form.Field>
    </StudioFlowFrame>
  );
}
