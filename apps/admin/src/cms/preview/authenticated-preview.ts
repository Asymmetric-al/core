import { serializePublishedPageLike } from "./serialize-published-page";

export const WEB_STUDIO_PREVIEW_COLLECTIONS = ["pages"] as const;

export type WebStudioPreviewCollection =
  (typeof WEB_STUDIO_PREVIEW_COLLECTIONS)[number];

export type WebStudioPreviewDocument = {
  content?: unknown;
  family?: unknown;
  fundId?: unknown;
  id?: unknown;
  layout?: unknown;
  missionaryId?: unknown;
  slug?: unknown;
  summary?: unknown;
  title?: unknown;
};

type WebStudioPreviewModel = {
  content?: unknown;
  id: string;
  layout?: unknown;
  summary: string | null;
  title: string;
};

export function isWebStudioPreviewCollection(
  value: string,
): value is WebStudioPreviewCollection {
  return WEB_STUDIO_PREVIEW_COLLECTIONS.includes(
    value as WebStudioPreviewCollection,
  );
}

export function getWebStudioPreviewCollectionLabel(
  _collection: WebStudioPreviewCollection,
) {
  return "Page";
}

export function buildWebStudioPreviewModel({
  doc,
}: {
  collection: WebStudioPreviewCollection;
  doc: WebStudioPreviewDocument;
}): WebStudioPreviewModel {
  const page = serializePublishedPageLike(doc as Record<string, unknown>);

  return {
    content: page.content,
    id: page.id,
    layout: page.layout,
    summary: page.summary ?? null,
    title: page.title || "Untitled page",
  };
}
