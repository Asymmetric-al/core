"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { useConfig } from "@payloadcms/ui";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatAdminURL } from "payload/shared";
import { Suspense, useMemo } from "react";

import { PAGE_TEMPLATES_SLUG } from "../../../cms/constants";
import { StudioLayout } from "../shell/studio-layout";

type TemplateDoc = {
  id: string | number;
  name?: string;
  templateKey?: string;
  pageType?: string;
  description?: string | null;
};

function buildTemplatesUrl(serverURL: string, apiRoute: string) {
  const path = formatAdminURL({
    apiRoute,
    path: `/${PAGE_TEMPLATES_SLUG}`,
  });
  return `${serverURL}${path}?limit=100&pagination=false&depth=0`;
}

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

export function TemplateGalleryView() {
  return (
    <Suspense fallback={null}>
      <TemplateGalleryViewContent />
    </Suspense>
  );
}

function TemplateGalleryViewContent() {
  const searchParams = useSearchParams();
  const { get: readSearchParam } = searchParams;
  const get = readSearchParam.bind(searchParams);
  const pageTypeFilter = String(get("pageType") ?? "");
  const missionaryContext = get("missionaryId");

  const {
    config: { routes, serverURL },
  } = useConfig();

  const {
    data: templates,
    error: templatesError,
    isError: templatesIsError,
    isPending: templatesIsPending,
  } = useQuery({
    queryKey: ["web-studio", "page-templates", serverURL, routes.api],
    queryFn: async () => {
      const res = await fetch(
        `${buildTemplatesUrl(serverURL, routes.api)}&draft=true`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) {
        throw new Error("Failed to load templates");
      }
      const json = (await res.json()) as { docs?: TemplateDoc[] };
      return json.docs ?? [];
    },
  });

  const filtered = useMemo(() => {
    const docs = templates ?? [];
    if (!pageTypeFilter) {
      return docs;
    }
    return docs.filter((d) => d.pageType === pageTypeFilter);
  }, [pageTypeFilter, templates]);

  return (
    <StudioLayout sectionLabel="Templates" currentLabel="Gallery">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <h1 className="font-semibold text-2xl tracking-tight">
            Template gallery
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Choose a published template to start a draft. Standard pages,
            missionary giving pages, project pages, and ministry update starters
            each have their own create flow.
          </p>
          {pageTypeFilter ? (
            <p className="mt-2 text-muted-foreground text-xs">
              Filtered to{" "}
              <Badge variant="secondary" className="text-[10px]">
                {pageTypeFilter}
              </Badge>
              .{" "}
              <Button variant="link" className="h-auto p-0 text-xs" asChild>
                <Link href="/web-studio/templates">Clear filter</Link>
              </Button>
            </p>
          ) : null}
        </div>

        {templatesIsError ? (
          <p className="text-destructive text-sm">
            {(templatesError as Error)?.message ?? "Could not load templates."}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templatesIsPending
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse border-border">
                  <CardHeader>
                    <div className="h-5 w-2/3 rounded bg-muted" />
                    <div className="mt-2 h-4 w-full rounded bg-muted" />
                  </CardHeader>
                </Card>
              ))
            : filtered.map((template) => {
                const id = String(template.id);
                const href = wizardHrefForPageType(
                  id,
                  template.pageType,
                  missionaryContext,
                );
                return (
                  <Card key={id} className="border-border">
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base">
                          {template.name ?? id}
                        </CardTitle>
                        {template.pageType ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase"
                          >
                            {template.pageType}
                          </Badge>
                        ) : null}
                      </div>
                      {template.description ? (
                        <CardDescription className="line-clamp-3">
                          {template.description}
                        </CardDescription>
                      ) : null}
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      {template.templateKey ? (
                        <p className="text-muted-foreground text-xs">
                          Key:{" "}
                          <span className="font-mono">
                            {template.templateKey}
                          </span>
                        </p>
                      ) : null}
                      <Button
                        size="sm"
                        className="w-full font-semibold uppercase"
                        asChild
                      >
                        <Link href={href}>Start from template</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {!templatesIsPending && filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No templates match this filter. Create templates in the Page
            Templates collection or adjust the query string.
          </p>
        ) : null}
      </div>
    </StudioLayout>
  );
}
