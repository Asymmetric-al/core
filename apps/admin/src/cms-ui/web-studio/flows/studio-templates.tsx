"use client";

import { buttonVariants } from "@asym/ui/components/shadcn/button";
import { FieldTitle } from "@asym/ui/components/shadcn/field";
import { LayoutTemplate } from "lucide-react";
import { useId } from "react";

import { StudioSelectField } from "./studio-flow-frame";
import { PAGE_STARTERS } from "../../../cms/starters";
import { Link } from "../routing";

export type StudioPageFamily = "standard" | "missionary" | "project";

export type StudioTemplateDoc = {
  id: string;
  name: string;
  templateKey: string;
  family: StudioPageFamily;
  description: string;
};

export const STUDIO_PAGE_FAMILIES: Record<
  StudioPageFamily,
  { label: string; description: string }
> = {
  standard: {
    label: "Standard page",
    description: "About, events and campaign pages.",
  },
  missionary: {
    label: "Giving page",
    description: "A support page for one missionary.",
  },
  project: {
    label: "Project page",
    description: "A landing page for one fund.",
  },
};

export function pageFamilyLabel(family: string | undefined): string | null {
  if (!family) return null;
  return family in STUDIO_PAGE_FAMILIES
    ? STUDIO_PAGE_FAMILIES[family as StudioPageFamily].label
    : null;
}

export const STUDIO_TEMPLATES: readonly StudioTemplateDoc[] = PAGE_STARTERS.map(
  (starter) => ({
    id: starter.key,
    name: starter.name,
    templateKey: starter.key,
    family: starter.family,
    description: starter.description,
  }),
);

export function findStudioTemplate(id: string): StudioTemplateDoc | null {
  return STUDIO_TEMPLATES.find((template) => template.id === id) ?? null;
}

export function StudioTemplateField({
  id,
  preselectedTemplateId,
  value,
  onValueChange,
  galleryHref,
  error,
}: {
  id?: string;
  preselectedTemplateId: string;
  value: string;
  onValueChange: (value: string) => void;
  galleryHref: string;
  error?: string;
}) {
  const titleId = useId();
  const chosen = findStudioTemplate(preselectedTemplateId);

  if (chosen) {
    return (
      <div
        role="group"
        aria-labelledby={titleId}
        className="flex flex-col gap-2"
      >
        <FieldTitle id={titleId}>Template</FieldTitle>
        <div
          data-chosen-template=""
          className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 py-2 pr-2 pl-3"
        >
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <LayoutTemplate
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            <p className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{chosen.name}</span>
              <span className="text-xs text-muted-foreground">
                {STUDIO_PAGE_FAMILIES[chosen.family].label} template
              </span>
            </p>
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

  return (
    <StudioSelectField
      id={id}
      label="Template"
      items={STUDIO_TEMPLATES.map((template) => ({
        value: template.id,
        label: template.name,
      }))}
      value={value}
      onValueChange={onValueChange}
      required
      error={error}
      placeholder="Select template"
    />
  );
}
