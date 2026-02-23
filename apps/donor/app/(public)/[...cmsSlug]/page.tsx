import { notFound } from "next/navigation";

import { fetchPublishedCmsPage, lexicalToPlainText } from "@/lib/cms/client";

type PageProps = {
  params: Promise<{
    cmsSlug: string[];
  }>;
};

export default async function CmsPublicPage({ params }: PageProps) {
  const { cmsSlug } = await params;
  const page = await fetchPublishedCmsPage(cmsSlug);

  if (!page) {
    notFound();
  }

  const body = lexicalToPlainText(page.content);

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
        {body ? (
          body
            .split("\n")
            .map((paragraph, index) => (
              <p key={`${page.id}-${index}`}>{paragraph}</p>
            ))
        ) : (
          <p>
            Content is available in Site Studio but has no plain-text blocks
            yet.
          </p>
        )}
      </section>
    </article>
  );
}
