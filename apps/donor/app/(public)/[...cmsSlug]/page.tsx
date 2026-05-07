import { renderPublicCmsPageContent } from "@asym/lib/cms/public-page-renderer";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { fetchPublishedCmsPageResult } from "@/lib/cms/client";

type PageProps = {
  params: Promise<{
    cmsSlug: string[];
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { cmsSlug } = await params;
  const result = await fetchPublishedCmsPageResult(cmsSlug);
  if (result.status !== "found") {
    return { title: "Page not found" };
  }

  const { page } = result;
  return {
    title: page.title,
    description: page.summary ?? undefined,
  };
}

export default async function CmsPublicPage({ params }: PageProps) {
  const { cmsSlug } = await params;
  const result = await fetchPublishedCmsPageResult(cmsSlug);

  if (result.status === "unavailable") {
    throw new Error(result.error);
  }

  if (result.status !== "found") {
    notFound();
  }

  const { page } = result;
  const renderedContent = renderPublicCmsPageContent(page.content, page.id);

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-3">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500">
          Site Studio Page
        </p>
        <h1 className="text-balance text-4xl font-bold text-zinc-900 sm:text-5xl">
          {page.title}
        </h1>
        {page.summary ? (
          <p className="text-lg text-zinc-600">{page.summary}</p>
        ) : null}
      </header>

      <section className="prose prose-zinc max-w-none">
        {renderedContent ? (
          renderedContent
        ) : (
          <p>
            Content is available in Site Studio but has no published rich-text
            blocks yet.
          </p>
        )}
      </section>
    </article>
  );
}
