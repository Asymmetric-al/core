"use client";

import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { FieldTitle } from "@asym/ui/components/shadcn/field";
import { useAuth, useConfig } from "@payloadcms/ui";
import { useQuery } from "@tanstack/react-query";
import { LayoutTemplate } from "lucide-react";
import { formatAdminURL } from "payload/shared";
import { useId } from "react";

import { StudioFlowFieldNote, StudioSelectField } from "./studio-flow-frame";
import { PAGE_TEMPLATES_SLUG } from "../../../cms/constants";
import { Link } from "../routing";
import { canCreateCollection } from "../shell/admin-collections";

/** The template's layout image, as Payload's media document (depth 1). */
export type StudioTemplateThumbnail = {
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

export type StudioTemplateDoc = {
  id: string | number;
  name?: string;
  templateKey?: string;
  pageType?: string;
  description?: string | null;
  _status?: "draft" | "published";
  thumbnail?: string | number | StudioTemplateThumbnail | null;
};

export type StudioPageType =
  "ministry_update" | "missionary_giving" | "project" | "standard";

export const STUDIO_PAGE_TYPES: Record<
  StudioPageType,
  { label: string; description: string }
> = {
  standard: {
    label: "Standard page",
    description: "About, events and campaign pages.",
  },
  missionary_giving: {
    label: "Giving page",
    description: "A support page for one missionary.",
  },
  project: {
    label: "Project page",
    description: "A landing page for one fund.",
  },
  ministry_update: {
    label: "Ministry update",
    description: "News from a missionary's field.",
  },
};

export function pageTypeLabel(pageType: string | undefined): string | null {
  if (!pageType) return null;
  return pageType in STUDIO_PAGE_TYPES
    ? STUDIO_PAGE_TYPES[pageType as StudioPageType].label
    : pageType;
}

/** Published and draft templates, shared by the gallery and the create flows. */
export function useStudioTemplates({
  enabled = true,
  populateThumbnail = false,
}: { enabled?: boolean; populateThumbnail?: boolean } = {}) {
  const {
    config: { routes, serverURL },
  } = useConfig();

  return useQuery({
    queryKey: [
      "web-studio",
      "page-templates",
      serverURL,
      routes.api,
      populateThumbnail,
    ],
    enabled,
    queryFn: async () => {
      const path = formatAdminURL({
        apiRoute: routes.api,
        path: `/${PAGE_TEMPLATES_SLUG}`,
      });
      const res = await fetch(
        `${serverURL}${path}?limit=100&pagination=false&depth=${populateThumbnail ? 1 : 0}&draft=true`,
        { credentials: "include" },
      );
      if (!res.ok) {
        throw new Error(
          "Templates didn't load. Check your connection and try again.",
        );
      }
      const json = (await res.json()) as { docs?: StudioTemplateDoc[] };
      return json.docs ?? [];
    },
  });
}

/**
 * The template step of a create flow. Opened from the gallery, the choice is
 * already made and shown with a way back; opened directly (Studio home, list
 * "New" buttons), the flow asks for a template of its page type here.
 */
export function StudioTemplateField({
  id,
  pageType,
  preselectedTemplateId,
  value,
  onValueChange,
  galleryHref,
  error,
}: {
  /** The select's id, for focusing it when no template is chosen. */
  id?: string;
  pageType: StudioPageType;
  preselectedTemplateId: string;
  value: string;
  onValueChange: (value: string) => void;
  galleryHref: string;
  error?: string;
}) {
  // Always on: opened from the gallery the list is already cached, and the
  // chosen template's name confirms the pick.
  const templates = useStudioTemplates();
  const titleId = useId();
  const { permissions } = useAuth();
  const canCreateTemplate = canCreateCollection(
    permissions,
    PAGE_TEMPLATES_SLUG,
  );
  const selectedId = preselectedTemplateId || value;
  const chosen = templates.data?.find(
    (template) => String(template.id) === selectedId,
  );
  const problem = templates.isError
    ? "Templates didn't load. Check your connection and try again."
    : templates.isPending || !selectedId
      ? null
      : !chosen
        ? "This template no longer exists or is unavailable."
        : chosen.pageType !== pageType
          ? `Choose a ${STUDIO_PAGE_TYPES[pageType].label.toLowerCase()} template for this draft.`
          : null;
  const problemNote = problem ? (
    <Alert variant="destructive">
      <AlertDescription>
        <p>{problem}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href={galleryHref}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Choose a template
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={templates.isFetching}
            onClick={() => void templates.refetch()}
          >
            Try again
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  ) : null;

  if (preselectedTemplateId) {
    const chosenName =
      chosen?.name?.trim() || (chosen ? String(chosen.id) : null);
    const chosenType = pageTypeLabel(chosen?.pageType);
    return (
      <div
        role="group"
        aria-labelledby={titleId}
        className="flex flex-col gap-2"
      >
        <FieldTitle id={titleId}>Template</FieldTitle>
        {problemNote}
        <div
          data-chosen-template=""
          className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 py-2 pr-2 pl-3"
        >
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <LayoutTemplate
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            {chosenName ? (
              <p className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{chosenName}</span>
                {chosenType ? (
                  <span className="text-xs text-muted-foreground">
                    {chosenType} template
                  </span>
                ) : null}
              </p>
            ) : (
              <p className="truncate">
                {templates.isPending
                  ? "Loading template…"
                  : "Template unavailable"}
              </p>
            )}
          </div>
          <Link
            href={galleryHref}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Change
          </Link>
        </div>
      </div>
    );
  }

  const options = (templates.data ?? [])
    .filter((template) => template.pageType === pageType)
    .map((template) => ({
      value: String(template.id),
      label: template.name?.trim() || String(template.id),
    }));
  const noun = STUDIO_PAGE_TYPES[pageType].label.toLowerCase();

  return (
    <StudioSelectField
      id={id}
      label="Template"
      items={options}
      value={value}
      onValueChange={onValueChange}
      required
      error={error}
      disabled={
        templates.isPending || templates.isError || options.length === 0
      }
      placeholder={
        templates.isPending ? "Loading templates…" : "Select template"
      }
    >
      {problemNote ??
        (!templates.isPending && options.length === 0 ? (
          <StudioFlowFieldNote>
            No {noun} templates yet.{" "}
            {canCreateTemplate ? (
              <Link
                href="/web-studio/collections/page-templates/create"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Create a template
              </Link>
            ) : (
              "Ask a Web Studio administrator to add one."
            )}
          </StudioFlowFieldNote>
        ) : null)}
    </StudioSelectField>
  );
}

/**
 * Whether a create flow can go ahead on the template step: one is chosen, or
 * the type has templates to choose from (then a missing choice is a field
 * error). With none to choose, the field's note explains and submit waits.
 */
export function canChooseTemplate(
  templateId: string,
  templates: StudioTemplateDoc[] | undefined,
  pageType: StudioPageType,
  query: { isPending: boolean; isError: boolean },
): boolean {
  if (query.isPending || query.isError) return false;
  return (
    (Boolean(templateId) &&
      (templates ?? []).some(
        (template) =>
          String(template.id) === templateId && template.pageType === pageType,
      )) ||
    (!templateId &&
      (templates ?? []).some((template) => template.pageType === pageType))
  );
}

/** Auto-picks the only template of a type so a direct visit needs no extra step. */
export function soleTemplateId(
  templates: StudioTemplateDoc[] | undefined,
  pageType: StudioPageType,
): string {
  const matches = (templates ?? []).filter(
    (template) => template.pageType === pageType,
  );
  return matches.length === 1 ? String(matches[0]!.id) : "";
}
