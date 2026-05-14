import { serializePublishedPageLike } from "../public/serialize-published-page";

export const WEB_STUDIO_PREVIEW_COLLECTIONS = [
  "ministry-updates",
  "missionary-giving-pages",
  "pages",
  "project-pages",
] as const;

export type WebStudioPreviewCollection =
  (typeof WEB_STUDIO_PREVIEW_COLLECTIONS)[number];

export type WebStudioPreviewDocument = {
  content?: unknown;
  excerpt?: unknown;
  id?: unknown;
  layout?: unknown;
  slug?: unknown;
  summary?: unknown;
  title?: unknown;
};

export type WebStudioPreviewModel = {
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
  collection: WebStudioPreviewCollection,
) {
  switch (collection) {
    case "ministry-updates":
      return "Ministry Update";
    case "missionary-giving-pages":
      return "Missionary Giving Page";
    case "pages":
      return "Page";
    case "project-pages":
      return "Project Page";
  }
}

export function buildWebStudioPreviewModel({
  collection,
  doc,
}: {
  collection: WebStudioPreviewCollection;
  doc: WebStudioPreviewDocument;
}): WebStudioPreviewModel {
  if (collection === "ministry-updates") {
    return {
      content: doc.content,
      id: String(doc.id ?? "preview"),
      layout: undefined,
      summary: typeof doc.excerpt === "string" ? doc.excerpt : null,
      title: typeof doc.title === "string" ? doc.title : "Untitled update",
    };
  }

  const page = serializePublishedPageLike(doc as Record<string, unknown>);

  return {
    content: page.content,
    id: page.id,
    layout: page.layout,
    summary: page.summary ?? null,
    title: page.title || "Untitled page",
  };
}
