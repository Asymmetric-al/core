"use client";

import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { cn } from "@asym/ui/lib/utils";
import {
  ArrowRight,
  FileText,
  HandHeart,
  LayoutTemplate,
  Target,
} from "lucide-react";
import { Suspense } from "react";

import { StudioFlowLoading } from "./studio-flow-loading";
import {
  STUDIO_PAGE_FAMILIES,
  STUDIO_TEMPLATES,
  pageFamilyLabel,
} from "./studio-templates";
import { Link, useSearchParams } from "../routing";
import { StudioLayout } from "../shell/studio-layout";

import type { StudioPageFamily, StudioTemplateDoc } from "./studio-templates";

const FAMILY_ICONS: Record<StudioPageFamily, typeof FileText> = {
  missionary: HandHeart,
  project: Target,
  standard: FileText,
};

function createHref(templateId: string, missionaryId: string | null) {
  const params = new URLSearchParams({ template: templateId });
  if (missionaryId) params.set("missionaryId", missionaryId);
  return `/web-studio/pages/new-from-template?${params.toString()}`;
}

function galleryHref(family: string | null, missionaryId: string | null) {
  const params = new URLSearchParams();
  if (family) params.set("family", family);
  if (missionaryId) params.set("missionaryId", missionaryId);
  const query = params.toString();
  return query ? `/web-studio/templates?${query}` : "/web-studio/templates";
}

export function TemplateGalleryView() {
  return (
    <Suspense fallback={<StudioFlowLoading />}>
      <TemplateGalleryViewContent />
    </Suspense>
  );
}

function FamilyFilter({
  current,
  missionaryId,
}: {
  current: string;
  missionaryId: string | null;
}) {
  const options = [
    { value: "", label: "All" },
    ...(Object.keys(STUDIO_PAGE_FAMILIES) as StudioPageFamily[]).map(
      (value) => ({
        value,
        label: STUDIO_PAGE_FAMILIES[value].label,
      }),
    ),
  ];
  return (
    <nav aria-label="Page type" className="min-w-0">
      <ul className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg bg-muted p-1">
        {options.map((option) => {
          const active = option.value === current;
          return (
            <li key={option.value || "all"}>
              <Link
                href={galleryHref(option.value || null, missionaryId)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TemplateCard({
  template,
  missionaryId,
}: {
  template: StudioTemplateDoc;
  missionaryId: string | null;
}) {
  const Icon = FAMILY_ICONS[template.family] ?? LayoutTemplate;
  return (
    <li className="flex">
      <article className="flex w-full">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <CardTitle>
                  <h2>{template.name}</h2>
                </CardTitle>
                <CardDescription>
                  <span className="line-clamp-2">{template.description}</span>
                </CardDescription>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {pageFamilyLabel(template.family)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardFooter>
            <Link
              href={createHref(template.id, missionaryId)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full",
              )}
            >
              Use template
              <span className="sr-only">: {template.name}</span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </CardFooter>
        </Card>
      </article>
    </li>
  );
}

function TemplateGalleryViewContent() {
  const searchParams = useSearchParams();
  const { get: readSearchParam } = searchParams;
  const get = readSearchParam.bind(searchParams);
  const familyFilter = String(get("family") ?? "");
  const missionaryContext = get("missionaryId");
  const filtered = STUDIO_TEMPLATES.filter(
    (template) => !familyFilter || template.family === familyFilter,
  );
  const filterLabel = pageFamilyLabel(familyFilter)?.toLowerCase();

  return (
    <StudioLayout sectionLabel="Template gallery">
      <PageShell
        title="Template gallery"
        description={
          missionaryContext
            ? "Choose a giving page layout for the selected missionary."
            : "Start a new page from a starting layout."
        }
        density="compact"
      >
        <div className="flex flex-col gap-6">
          <FamilyFilter
            current={familyFilter}
            missionaryId={missionaryContext}
          />
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <LayoutTemplate aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>
                    {filterLabel
                      ? `No ${filterLabel} templates`
                      : "No templates yet"}
                  </EmptyTitle>
                  <EmptyDescription>
                    Templates hold the starting layout for new pages.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Link
                    href={galleryHref(null, missionaryContext)}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    Show all templates
                  </Link>
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  missionaryId={missionaryContext}
                />
              ))}
            </ul>
          )}
        </div>
      </PageShell>
    </StudioLayout>
  );
}
