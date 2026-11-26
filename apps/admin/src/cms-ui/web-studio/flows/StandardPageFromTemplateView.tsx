"use client";

import { appPathname } from "@asym/database/document-reload";
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
import { fetchStudioFunds } from "./studio-funds";
import {
  fetchStudioMissionaries,
  studioMissionaryOptions,
} from "./studio-missionaries";
import {
  STUDIO_TEMPLATES,
  StudioTemplateField,
  findStudioTemplate,
} from "./studio-templates";
import { buildWebStudioCreateFromTemplateUrl } from "./web-studio-create-api";
import { normalizeWebAddressSegment } from "../../../cms/web-address";
import { WEB_STUDIO_COLLECTION_CONFIGS } from "../collections/config";
import { useRouter, useSearchParams } from "../routing";

const formSchema = z.object({
  title: z.string().min(1, "Enter a title."),
  slug: z.string().min(1, "Enter a URL slug."),
});

const FIELD_IDS = {
  template: "page-template",
  site: "page-site",
  reference: "page-reference",
  title: "title",
  slug: "slug",
} as const;

export const NO_SITE_NOTE =
  "This organization has no Site in Web Studio yet, so pages cannot be created.";

type SiteOption = { id: string };

function useStudioSites() {
  const {
    config: { routes, serverURL },
  } = useConfig();
  return useQuery({
    queryKey: ["web-studio", "site-presentations", serverURL, routes.api],
    queryFn: async () => {
      const path = formatAdminURL({
        apiRoute: routes.api,
        path: "/site-presentations",
      });
      const res = await fetch(
        `${serverURL}${path}?limit=100&pagination=false&depth=0`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Sites didn't load. Try again.");
      const json = (await res.json()) as { docs?: SiteOption[] };
      return (json.docs ?? []).map((doc) => ({ id: String(doc.id) }));
    },
  });
}

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
  const missionaryParam = get("missionaryId") ?? "";
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [chosenTemplateId, setChosenTemplateId] = useState("");
  const [chosenSite, setChosenSite] = useState("");
  const [reference, setReference] = useState(missionaryParam);
  const [slugEdited, setSlugEdited] = useState(false);
  const fieldErrors = useStudioFieldErrors(FIELD_IDS);
  const templateId =
    (findStudioTemplate(templateParam) ? templateParam : "") ||
    chosenTemplateId ||
    (STUDIO_TEMPLATES.length === 1 ? STUDIO_TEMPLATES[0]!.id : "");
  const template = findStudioTemplate(templateId);
  const family = template?.family ?? "standard";

  const sites = useStudioSites();
  const siteId =
    chosenSite || (sites.data?.length === 1 ? sites.data[0]!.id : "");
  const noSite = sites.isSuccess && sites.data.length === 0;

  const missionaries = useQuery({
    queryKey: ["web-studio", "admin-missionaries"],
    queryFn: ({ signal }) => fetchStudioMissionaries(signal),
    enabled: family === "missionary",
  });
  const funds = useQuery({
    queryKey: ["web-studio", "admin-funds"],
    queryFn: ({ signal }) => fetchStudioFunds(signal),
    enabled: family === "project",
  });
  const referenceReady =
    family === "standard" ||
    (family === "missionary" ? missionaries.isSuccess : funds.isSuccess);
  const referenceOptions =
    family === "missionary"
      ? studioMissionaryOptions(missionaries.data ?? [])
      : (funds.data ?? []).map((fund) => ({
          value: fund.id,
          label: fund.name?.trim() || fund.id,
        }));

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

  const form = useForm({
    defaultValues: {
      title: "",
      slug: "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      const parsed = formSchema.safeParse(value);
      const issues = parsed.success ? {} : parsed.error.flatten().fieldErrors;
      const standard = family === "standard";
      const valid = fieldErrors.report({
        template: template ? undefined : "Choose a template to start from.",
        site: siteId ? undefined : "Choose a Site for this page.",
        reference:
          standard || reference
            ? undefined
            : family === "missionary"
              ? "Choose a missionary."
              : "Choose a fund.",
        title: standard ? issues.title?.[0] : undefined,
        slug: standard ? issues.slug?.[0] : undefined,
      });
      if (!valid || !template || (standard && !parsed.success)) {
        return;
      }

      const res = await fetch(createUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          starterKey: template.templateKey,
          site: siteId,
          ...(standard
            ? { title: value.title, slug: value.slug }
            : family === "missionary"
              ? { missionaryId: reference }
              : { fundId: reference }),
        }),
      }).catch(() => null);

      if (!res) {
        setSubmitError(
          "Unable to create draft. Check your connection and try again.",
        );
        return;
      }

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
        push(
          appPathname(
            formatAdminURL({
              adminRoute: routes.admin,
              path: `/collections/${body.collectionSlug}/${body.id}`,
            }),
          ),
        );
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
      canSubmit={
        Boolean(template) && !noSite && !sites.isPending && referenceReady
      }
      onSubmit={(e) => {
        e.preventDefault();
        if (form.state.isSubmitting || !referenceReady) {
          return;
        }
        void form.handleSubmit();
      }}
    >
      <StudioTemplateField
        id={FIELD_IDS.template}
        preselectedTemplateId={templateParam}
        value={templateId}
        onValueChange={(id) => {
          setChosenTemplateId(id);
          setReference("");
          fieldErrors.clear("template");
        }}
        galleryHref="/web-studio/templates"
        error={fieldErrors.errors.template}
      />
      <StudioSelectField
        id={FIELD_IDS.site}
        label="Site"
        items={(sites.data ?? []).map((site) => ({
          value: site.id,
          label: `Site ${site.id}`,
        }))}
        value={siteId}
        onValueChange={(id) => {
          setChosenSite(id);
          fieldErrors.clear("site");
        }}
        required
        error={fieldErrors.errors.site}
        disabled={sites.isPending || sites.isError || noSite}
        placeholder={sites.isPending ? "Loading Sites…" : "Choose a Site"}
      >
        {sites.isError ? (
          <StudioFlowFieldNote tone="error">
            {(sites.error as Error).message}
          </StudioFlowFieldNote>
        ) : noSite ? (
          <StudioFlowFieldNote>{NO_SITE_NOTE}</StudioFlowFieldNote>
        ) : null}
      </StudioSelectField>
      {family === "standard" ? (
        <>
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
                    fieldErrors.errors.title &&
                      studioFieldErrorId(FIELD_IDS.title),
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
                    fieldErrors.errors.slug &&
                      studioFieldErrorId(FIELD_IDS.slug),
                  )}
                />
                <FieldDescription id="slug-description">
                  The page address, suggested from the title.
                  {normalizeWebAddressSegment(field.state.value) ? (
                    <span className="mt-1 block break-all">
                      Web address: /
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
        </>
      ) : (
        <StudioSelectField
          id={FIELD_IDS.reference}
          label={family === "missionary" ? "Missionary" : "Fund"}
          items={referenceOptions}
          value={reference}
          onValueChange={(id) => {
            setReference(id);
            fieldErrors.clear("reference");
          }}
          required
          error={fieldErrors.errors.reference}
          disabled={
            family === "missionary"
              ? missionaries.isPending || missionaries.isError
              : funds.isPending || funds.isError
          }
          placeholder={
            family === "missionary" ? "Choose a missionary" : "Choose a fund"
          }
        >
          {(family === "missionary" ? missionaries.isError : funds.isError) ? (
            <StudioFlowFieldNote tone="error">
              {family === "missionary"
                ? "The missionary directory didn't load. Try again."
                : "Funds didn't load. Try again."}
            </StudioFlowFieldNote>
          ) : null}
        </StudioSelectField>
      )}
    </StudioFlowFrame>
  );
}
