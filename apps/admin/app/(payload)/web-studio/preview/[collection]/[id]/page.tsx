import { renderPublicCmsPageContent } from "@asym/lib/cms/public-page-renderer";
import {
  renderPublicBlocks,
  type PublicBlockSurface,
} from "@asym/ui/components/public/blocks";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, ButtonLink } from "@asym/ui/components/shadcn/button";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createPayloadRequest } from "payload";

import type { Metadata } from "next";

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

/**
 * Block: a draft preview must show the true current record, and its
 * `redirect()` / `notFound()` have to resolve before the response flushes.
 */
export const instant = false;

export const metadata: Metadata = { title: "Draft preview" };

export default async function WebStudioAuthenticatedPreviewPage({
  params,
}: PageProps) {
  await connection();
  const { collection, id } = await params;

  if (!isWebStudioPreviewCollection(collection)) {
    notFound();
  }

  const headerStore = await headers();
  const payload = await getPayloadClient();
  const req = await createPayloadRequest({
    payload,
    req: { headers: headerStore },
  });
  const auth = await payload.auth({ headers: headerStore, req });

  if (!auth.user) {
    redirect(
      `/login?next=${encodeURIComponent(
        `/web-studio/preview/${collection}/${id}`,
      )}`,
    );
  }

  const authedReq = await createPayloadRequest({
    payload,
    req: { headers: headerStore },
    user: auth.user,
  });
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
  const renderedBlocks = renderPublicBlocks(preview.layout, {
    keyPrefix: preview.id,
    surface: previewSurface,
  });
  const renderedLayout = renderedBlocks.length ? (
    <div className="space-y-4">{renderedBlocks}</div>
  ) : null;
  const label = getWebStudioPreviewCollectionLabel(collection);
  const status =
    doc._status === "published"
      ? "Published"
      : doc._status === "draft"
        ? "Draft"
        : null;

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="border-border border-b bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {preview.title}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground text-sm">{label}</p>
              {status ? <Badge variant="secondary">{status}</Badge> : null}
            </div>
          </div>
          <ButtonLink
            variant="outline"
            render={
              <Link
                href={`/web-studio/collections/${collection}/${encodeURIComponent(id)}`}
              >
                Back to editor
              </Link>
            }
          />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Alert role="note" variant="info">
          <AlertTitle>Private preview</AlertTitle>
          <AlertDescription>
            Only signed-in editors with access to this document can see this
            preview. It shows the latest saved version, which may be a draft.
            Unsaved changes are not included. Preview buttons do not navigate;
            their destinations are shown below them.
          </AlertDescription>
        </Alert>
      </div>

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

/**
 * How the private preview draws what a block hands its surface. Calls to
 * action are inert: an editor can see and focus them, and the destination is
 * written beside each one.
 */
const previewSurface: PublicBlockSurface = {
  renderAction: ({ label, href, emphasis, openInNewTab }) => (
    <div className="min-w-0 space-y-2">
      <Button
        type="button"
        variant={emphasis === "secondary" ? "outline" : undefined}
        disabled
        focusableWhenDisabled
      >
        {label}
      </Button>
      <p className="break-words text-sm text-muted-foreground">
        Links to {href}
        {openInNewTab ? ", in a new tab" : null}
      </p>
    </div>
  ),
  renderMedia: ({ media, slot }) => {
    const image = readPreviewMedia(media);
    if (!image) {
      return null;
    }

    return slot === "banner" ? (
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
    ) : (
      <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
        <Image
          alt={image.alt}
          className="object-cover"
          fill
          sizes="(min-width: 1024px) 384px, 100vw"
          src={image.url}
          unoptimized
        />
      </div>
    );
  },
};

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
