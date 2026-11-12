"use client";

import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
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
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";
import { useAuth } from "@payloadcms/ui";
import {
  AlertCircle,
  ArrowRight,
  FileText,
  HandHeart,
  LayoutTemplate,
  Newspaper,
  Plus,
  RotateCw,
  Target,
} from "lucide-react";
import Image from "next/image";
import { Suspense, useState } from "react";

import { PageTemplateCreateView } from "./PageTemplateCreateView";
import { StudioFlowLoading } from "./studio-flow-loading";
import {
  STUDIO_PAGE_TYPES,
  pageTypeLabel,
  useStudioTemplates,
} from "./studio-templates";
import { PAGE_TEMPLATES_SLUG } from "../../../cms/constants";
import { Link, useSearchParams } from "../routing";
import { canCreateCollection } from "../shell/admin-collections";
import { StudioLayout } from "../shell/studio-layout";

import type {
  StudioPageType,
  StudioTemplateDoc,
  StudioTemplateThumbnail,
} from "./studio-templates";

const PAGE_TYPE_ICONS: Record<StudioPageType, typeof FileText> = {
  ministry_update: Newspaper,
  missionary_giving: HandHeart,
  project: Target,
  standard: FileText,
};

const CREATE_TEMPLATE_HREF = "/web-studio/collections/page-templates/create";

function wizardHrefForPageType(
  templateId: string,
  pageType: string | undefined,
  missionaryId: string | null,
) {
  const m = missionaryId
    ? `&missionaryId=${encodeURIComponent(missionaryId)}`
    : "";
  switch (pageType) {
    case "missionary_giving":
      return `/web-studio/pages/give?template=${encodeURIComponent(templateId)}${m}`;
    case "project":
      return `/web-studio/projects/new?template=${encodeURIComponent(templateId)}`;
    case "ministry_update":
      return `/web-studio/ministry-updates/new?template=${encodeURIComponent(templateId)}`;
    default:
      return `/web-studio/pages/new-from-template?template=${encodeURIComponent(templateId)}`;
  }
}

function galleryHref(pageType: string | null, missionaryId: string | null) {
  const params = new URLSearchParams();
  if (pageType) params.set("pageType", pageType);
  if (missionaryId) params.set("missionaryId", missionaryId);
  const query = params.toString();
  return query ? `/web-studio/templates?${query}` : "/web-studio/templates";
}

/**
 * The template gallery (`/web-studio/templates`). Page Templates also serve
 * this registered view on their `/create` route (see `page-templates.ts`), so
 * Payload's import map needs no new entry; Payload then passes the
 * collection's slug and the view renders the new-template form instead.
 */
export function TemplateGalleryView({
  collectionSlug,
}: { collectionSlug?: string } = {}) {
  if (collectionSlug === PAGE_TEMPLATES_SLUG) {
    return <PageTemplateCreateView />;
  }
  return (
    <Suspense fallback={<StudioFlowLoading />}>
      <TemplateGalleryViewContent />
    </Suspense>
  );
}

function PageTypeFilter({
  current,
  missionaryId,
}: {
  current: string;
  missionaryId: string | null;
}) {
  const options = [
    { value: "", label: "All" },
    ...(Object.keys(STUDIO_PAGE_TYPES) as StudioPageType[]).map((value) => ({
      value,
      label: STUDIO_PAGE_TYPES[value].label,
    })),
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

/** Smaller than this on either side, an image is a placeholder, not a layout. */
const MIN_THUMBNAIL_SIDE = 32;

/**
 * The thumbnail worth showing: a loaded media document with a URL whose
 * known size is not placeholder-sized (seed data uses a 1x1 pixel). A
 * preview supports choosing a template; it never dominates the card.
 */
function usableThumbnail(
  value: StudioTemplateDoc["thumbnail"],
): StudioTemplateThumbnail | null {
  if (!value || typeof value !== "object" || !value.url) return null;
  const tooSmall = [value.width, value.height].some(
    (side) => typeof side === "number" && side < MIN_THUMBNAIL_SIDE,
  );
  return tooSmall ? null : value;
}

function TemplateCard({
  template,
  missionaryId,
}: {
  template: StudioTemplateDoc;
  missionaryId: string | null;
}) {
  const id = String(template.id);
  const type = template.pageType as StudioPageType | undefined;
  const Icon = (type && PAGE_TYPE_ICONS[type]) || LayoutTemplate;
  const typeLabel = pageTypeLabel(template.pageType);
  const thumbnail = usableThumbnail(template.thumbnail);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
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
                  <h2>{template.name ?? id}</h2>
                </CardTitle>
                <CardDescription>
                  <span className="line-clamp-2">
                    {template.description ||
                      (type
                        ? STUDIO_PAGE_TYPES[type].description
                        : "A starting layout for new pages.")}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {thumbnail?.url ? (
              thumbnail.url === failedUrl ? (
                <p className="mb-3 flex h-20 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                  Preview unavailable
                </p>
              ) : (
                <Image
                  src={thumbnail.url}
                  alt={
                    thumbnail.alt?.trim() ||
                    `${template.name ?? id} layout preview`
                  }
                  width={960}
                  height={540}
                  unoptimized
                  className="mb-3 max-h-36 w-full rounded-lg bg-muted object-contain"
                  onError={() => setFailedUrl(thumbnail.url ?? null)}
                />
              )
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              {typeLabel ? <Badge variant="outline">{typeLabel}</Badge> : null}
              {template._status === "draft" ? (
                <Badge variant="info">Draft</Badge>
              ) : null}
              {template.templateKey ? (
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {template.templateKey}
                </span>
              ) : null}
            </div>
          </CardContent>
          <CardFooter>
            <Link
              href={wizardHrefForPageType(id, template.pageType, missionaryId)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full",
              )}
            >
              Use template
              <span className="sr-only">: {template.name ?? id}</span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </CardFooter>
        </Card>
      </article>
    </li>
  );
}

function TemplateGallerySkeleton() {
  return (
    <ul
      aria-busy="true"
      aria-label="Loading templates"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index}>
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <Skeleton className="size-9 shrink-0" />
                <div className="flex w-full flex-col gap-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-8 w-full" />
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function TemplateGalleryViewContent() {
  const searchParams = useSearchParams();
  const { get: readSearchParam } = searchParams;
  const get = readSearchParam.bind(searchParams);
  const pageTypeFilter = String(get("pageType") ?? "");
  const missionaryContext = get("missionaryId");
  const templates = useStudioTemplates({ populateThumbnail: true });
  // Same gate as the Page Templates list's create button.
  const { permissions } = useAuth();
  const canCreateTemplate = canCreateCollection(
    permissions,
    PAGE_TEMPLATES_SLUG,
  );

  const filtered = (templates.data ?? []).filter(
    (template) => !pageTypeFilter || template.pageType === pageTypeFilter,
  );
  const filterLabel = pageTypeLabel(pageTypeFilter)?.toLowerCase();

  return (
    <StudioLayout sectionLabel="Template gallery">
      <PageShell
        title="Template gallery"
        description={
          missionaryContext
            ? "Choose a giving page layout for the selected missionary."
            : "Start a new page from a saved layout."
        }
        density="compact"
        actions={
          canCreateTemplate ? (
            <Link
              href={CREATE_TEMPLATE_HREF}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Plus aria-hidden="true" />
              New template
            </Link>
          ) : null
        }
      >
        <div className="flex flex-col gap-6">
          {/* Filters only while there are templates to filter. */}
          {templates.isError ? null : (
            <PageTypeFilter
              current={pageTypeFilter}
              missionaryId={missionaryContext}
            />
          )}
          {templates.isPending ? (
            <TemplateGallerySkeleton />
          ) : templates.isError ? (
            <div role="alert" className="rounded-xl border border-dashed">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <AlertCircle aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>Couldn&apos;t load templates</EmptyTitle>
                  <EmptyDescription>
                    {(templates.error as Error).message}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void templates.refetch()}
                  >
                    <RotateCw aria-hidden="true" />
                    Retry
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          ) : filtered.length === 0 ? (
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
                    {canCreateTemplate
                      ? null
                      : " Ask a Web Studio administrator to add one."}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  {filterLabel ? (
                    <Link
                      href={galleryHref(null, missionaryContext)}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      Show all templates
                    </Link>
                  ) : null}
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((template) => (
                <TemplateCard
                  key={String(template.id)}
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
