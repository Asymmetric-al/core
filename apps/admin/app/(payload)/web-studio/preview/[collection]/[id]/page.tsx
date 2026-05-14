import { renderPublicCmsPageContent } from "@asym/lib/cms/public-page-renderer";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createLocalReq } from "payload";

import type { ReactNode } from "react";

import { getPayloadClient } from "@/src/cms/get-payload";
import {
  buildWebStudioPreviewModel,
  getWebStudioPreviewCollectionLabel,
  isWebStudioPreviewCollection,
} from "@/src/cms/preview/authenticated-preview";

type PageProps = {
  params: Promise<{
    collection: string;
    id: string;
  }>;
};

export default async function WebStudioAuthenticatedPreviewPage({
  params,
}: PageProps) {
  const { collection, id } = await params;

  if (!isWebStudioPreviewCollection(collection)) {
    notFound();
  }

  const headerStore = await headers();
  const payload = await getPayloadClient();
  const req = await createLocalReq({ req: { headers: headerStore } }, payload);
  const auth = await payload.auth({ headers: headerStore, req });

  if (!auth.user) {
    redirect(
      `/login?next=${encodeURIComponent(
        `/web-studio/preview/${collection}/${id}`,
      )}`,
    );
  }

  const authedReq = await createLocalReq(
    { req: { headers: headerStore }, user: auth.user },
    payload,
  );
  const doc = await payload.findByID({
    collection,
    depth: 2,
    disableErrors: true,
    draft: true,
    id,
    overrideAccess: false,
    req: authedReq,
    user: auth.user,
  });

  if (!doc) {
    notFound();
  }

  const preview = buildWebStudioPreviewModel({ collection, doc });
  const renderedContent = renderPublicCmsPageContent(
    preview.content,
    preview.id,
  );
  const renderedLayout = renderPreviewLayout(preview.layout, preview.id);
  const label = getWebStudioPreviewCollectionLabel(collection);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-border border-b bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Authenticated Preview
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {preview.title}
            </h1>
            <p className="text-muted-foreground text-sm">{label}</p>
          </div>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 font-semibold text-sm"
            href={`/web-studio/collections/${collection}/${encodeURIComponent(id)}`}
          >
            Back to editor
          </Link>
        </div>
      </header>

      <article className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        {preview.summary ? (
          <p className="mb-8 max-w-3xl text-lg text-muted-foreground">
            {preview.summary}
          </p>
        ) : null}

        <div className="space-y-6">
          {renderedLayout}

          {renderedContent ? (
            <section className="prose prose-zinc max-w-none rounded-lg border border-border bg-card p-6">
              {renderedContent}
            </section>
          ) : null}

          {!renderedLayout && !renderedContent ? (
            <section className="rounded-lg border border-border bg-card p-6">
              <p className="text-muted-foreground text-sm">
                This draft has no previewable rich-text or layout content yet.
              </p>
            </section>
          ) : null}
        </div>
      </article>
    </main>
  );
}

type PreviewBlock = Record<string, unknown>;

function renderPreviewLayout(layout: unknown, pageId: string): ReactNode {
  if (!Array.isArray(layout)) {
    return null;
  }

  const renderedBlocks = layout
    .filter(isPreviewBlock)
    .map((block, index) =>
      renderPreviewBlock(block, `${pageId}-layout-${index}`),
    )
    .filter(Boolean);

  return renderedBlocks.length ? (
    <div className="space-y-4">{renderedBlocks}</div>
  ) : null;
}

function renderPreviewBlock(block: PreviewBlock, key: string): ReactNode {
  switch (block.blockType) {
    case "hero":
      return renderHeroBlock(block, key);
    case "call-to-action":
      return renderCallToActionBlock(block, key);
    case "rich-text":
      return renderRichTextBlock(block, key);
    case "media-feature":
      return renderMediaFeatureBlock(block, key);
    case "faq":
      return renderFaqBlock(block, key);
    case "impact-stats":
      return renderImpactStatsBlock(block, key);
    case "testimonial":
      return renderTestimonialBlock(block, key);
    default:
      return null;
  }
}

function renderHeroBlock(block: PreviewBlock, key: string) {
  const image = readPreviewMedia(block.backgroundImage);
  const href = readOptionalString(block.primaryCtaHref);
  const label = readOptionalString(block.primaryCtaLabel);

  return (
    <section
      key={key}
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      {image ? (
        <div className="relative h-64 w-full bg-muted">
          <Image
            alt={image.alt}
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 960px, 100vw"
            src={image.url}
            unoptimized
          />
        </div>
      ) : null}
      <div className="space-y-4 p-6">
        {readOptionalString(block.eyebrow) ? (
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.2em]">
            {readOptionalString(block.eyebrow)}
          </p>
        ) : null}
        <h2 className="text-3xl font-semibold tracking-tight">
          {readRequiredString(block.headline)}
        </h2>
        {readOptionalString(block.subheading) ? (
          <p className="max-w-3xl text-muted-foreground">
            {readOptionalString(block.subheading)}
          </p>
        ) : null}
        {href && label ? (
          <a
            className="inline-flex h-10 items-center rounded-md bg-foreground px-4 font-semibold text-background text-sm"
            href={href}
          >
            {label}
          </a>
        ) : null}
      </div>
    </section>
  );
}

function renderCallToActionBlock(block: PreviewBlock, key: string) {
  const href = readOptionalString(block.buttonHref);
  const label = readOptionalString(block.buttonLabel) ?? "Open";

  return (
    <section key={key} className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {readRequiredString(block.headline)}
          </h2>
          {readOptionalString(block.copy) ? (
            <p className="text-muted-foreground">
              {readOptionalString(block.copy)}
            </p>
          ) : null}
        </div>
        {href ? (
          <a
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-border px-4 font-semibold text-sm"
            href={href}
          >
            {label}
          </a>
        ) : null}
      </div>
    </section>
  );
}

function renderRichTextBlock(block: PreviewBlock, key: string) {
  const body = renderPublicCmsPageContent(block.body, key);

  return (
    <section key={key} className="rounded-lg border border-border bg-card p-6">
      {readOptionalString(block.heading) ? (
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          {readOptionalString(block.heading)}
        </h2>
      ) : null}
      <div className="prose prose-zinc max-w-none">{body}</div>
    </section>
  );
}

function renderMediaFeatureBlock(block: PreviewBlock, key: string) {
  const image = readPreviewMedia(block.media);

  return (
    <section
      key={key}
      className="grid gap-6 rounded-lg border border-border bg-card p-6 md:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] md:items-center"
    >
      <div className="space-y-3">
        {readOptionalString(block.title) ? (
          <h2 className="text-2xl font-semibold tracking-tight">
            {readOptionalString(block.title)}
          </h2>
        ) : null}
        {readOptionalString(block.body) ? (
          <p className="text-muted-foreground">
            {readOptionalString(block.body)}
          </p>
        ) : null}
      </div>
      {image ? (
        <figure className="space-y-2">
          <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-muted">
            <Image
              alt={image.alt}
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 384px, 100vw"
              src={image.url}
              unoptimized
            />
          </div>
          {readOptionalString(block.mediaCaption) ? (
            <figcaption className="text-muted-foreground text-xs">
              {readOptionalString(block.mediaCaption)}
            </figcaption>
          ) : null}
        </figure>
      ) : null}
    </section>
  );
}

function renderFaqBlock(block: PreviewBlock, key: string) {
  const items = Array.isArray(block.items)
    ? block.items.filter(isPreviewBlock)
    : [];

  return (
    <section key={key} className="rounded-lg border border-border bg-card p-6">
      {readOptionalString(block.heading) ? (
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          {readOptionalString(block.heading)}
        </h2>
      ) : null}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={`${key}-item-${index}`} className="space-y-1">
            <h3 className="font-semibold">
              {readRequiredString(item.question)}
            </h3>
            <p className="text-muted-foreground">
              {readRequiredString(item.answer)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function renderImpactStatsBlock(block: PreviewBlock, key: string) {
  const items = Array.isArray(block.items)
    ? block.items.filter(isPreviewBlock)
    : [];

  return (
    <section key={key} className="rounded-lg border border-border bg-card p-6">
      {readOptionalString(block.heading) ? (
        <h2 className="mb-5 text-2xl font-semibold tracking-tight">
          {readOptionalString(block.heading)}
        </h2>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item, index) => (
          <div key={`${key}-stat-${index}`} className="space-y-1">
            <p className="text-3xl font-semibold">
              {readRequiredString(item.value)}
            </p>
            <p className="font-medium text-sm">
              {readRequiredString(item.label)}
            </p>
            {readOptionalString(item.description) ? (
              <p className="text-muted-foreground text-sm">
                {readOptionalString(item.description)}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function renderTestimonialBlock(block: PreviewBlock, key: string) {
  return (
    <section key={key} className="rounded-lg border border-border bg-card p-6">
      <blockquote className="text-xl leading-relaxed">
        &quot;{readRequiredString(block.quote)}&quot;
      </blockquote>
      {readOptionalString(block.attribution) ? (
        <p className="mt-4 font-semibold text-muted-foreground text-sm">
          {readOptionalString(block.attribution)}
        </p>
      ) : null}
    </section>
  );
}

function readPreviewMedia(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const media = value as Record<string, unknown>;
  const url =
    readOptionalString(media.cardURL) ??
    readOptionalString(media.thumbnailURL) ??
    readOptionalString(media.url);

  if (!url) {
    return null;
  }

  return {
    alt: readOptionalString(media.alt) ?? "",
    url,
  };
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function readRequiredString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isPreviewBlock(value: unknown): value is PreviewBlock {
  return Boolean(value && typeof value === "object");
}
