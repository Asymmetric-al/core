import { resolveDonorOrigin } from "./resolve-donor-origin";

import type { GeneratePreviewURL } from "payload";

export { resolveDonorOrigin };

type PreviewCollectionSlug =
  | "ministry-updates"
  | "missionary-giving-pages"
  | "pages"
  | "project-pages";

function normalizeSlugPath(slug: string) {
  const trimmed = slug.trim();
  if (!trimmed || trimmed === "home") {
    return "";
  }
  return trimmed
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

/**
 * Resolves the public donor URL for a published CMS page slug (matches `[...cmsSlug]` routing).
 */
export function buildDonorPreviewPathForPageSlug(slug: string): string {
  const path = normalizeSlugPath(slug);
  return path ? `/${path}` : "/";
}

function readDocumentId(doc: Record<string, unknown>) {
  if (typeof doc.id === "string" || typeof doc.id === "number") {
    return String(doc.id);
  }

  return null;
}

export function buildWebStudioAuthenticatedPreviewPath({
  collectionSlug,
  id,
}: {
  collectionSlug: PreviewCollectionSlug;
  id: string | number;
}): string {
  return `/web-studio/preview/${encodeURIComponent(collectionSlug)}/${encodeURIComponent(
    String(id),
  )}`;
}

export function createWebStudioAuthenticatedPreviewURL(
  collectionSlug: PreviewCollectionSlug,
): GeneratePreviewURL {
  return (doc) => {
    const id = readDocumentId(doc as Record<string, unknown>);
    if (!id) {
      return `/web-studio/collections/${encodeURIComponent(collectionSlug)}`;
    }

    return buildWebStudioAuthenticatedPreviewPath({ collectionSlug, id });
  };
}

/**
 * Payload `admin.preview` handler for the Pages collection.
 * Opens the authenticated Web Studio preview route. Public donor routes stay
 * published-only and never receive draft content.
 */
export const pagesGeneratePreviewURL =
  createWebStudioAuthenticatedPreviewURL("pages");
