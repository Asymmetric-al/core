import { WEB_STUDIO_ADMIN_COLLECTIONS } from "./admin-collections";
import {
  WEB_STUDIO_COLLECTION_CONFIGS,
  getEnabledWebStudioCollections,
} from "../collections/config";

import type { WebStudioCollectionSlug } from "../collections/config";

const ADMIN_ROUTE = "/web-studio";

const DOCUMENT_SUBVIEW_LABELS: Record<string, string> = {
  api: "API",
  preview: "Live preview",
  versions: "Versions",
};

const ROOT_VIEW_LABELS: Record<string, string> = {
  account: "Account",
};

function segmentsAfterAdmin(pathname: string): string[] | null {
  const trimmed = pathname.replace(/\/+$/, "");
  if (trimmed !== ADMIN_ROUTE && !trimmed.startsWith(`${ADMIN_ROUTE}/`)) {
    return null;
  }
  return trimmed
    .slice(ADMIN_ROUTE.length)
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
}

function isEnabledNativeCollection(
  slug: string | undefined,
): slug is WebStudioCollectionSlug {
  return getEnabledWebStudioCollections().some(
    (collection) => collection.slug === slug,
  );
}

/** Routes with their own StudioLayout must not render template chrome twice. */
export function isWebStudioNativeTemplateRoute(pathname: string): boolean {
  const segments = segmentsAfterAdmin(pathname);
  if (!segments) return false;
  if (segments.length === 0) return true;
  if (segments.length === 1 && segments[0] === "account") return true;
  const [area, collection, documentId, ...rest] = segments;
  if (
    area === "collections" &&
    WEB_STUDIO_ADMIN_COLLECTIONS.some((entry) => entry.slug === collection)
  ) {
    return documentId === undefined;
  }
  if (area !== "collections" || !isEnabledNativeCollection(collection)) {
    return false;
  }
  if (documentId === undefined) return true;
  // The trash list renders the native list view itself; a trashed document
  // (`trash/<id>`) keeps Payload's restore / delete-permanently view.
  if (documentId === "trash") return rest.length === 0;
  return rest.length === 0;
}

export type WebStudioStockRouteLabels = {
  sectionLabel?: string;
  sectionHref?: string;
  currentLabel?: string;
};

/**
 * Breadcrumb labels for a stock Payload screen. `collectionLabels` carries
 * Payload's plural labels for collections Web Studio does not own; Studio
 * collections use their configured section labels and the administration
 * lists their rail titles. Document titles are not
 * known outside the document view, so a document reads "Document".
 */
export function describeWebStudioStockRoute(
  pathname: string,
  collectionLabels: Record<string, string>,
): WebStudioStockRouteLabels {
  const segments = segmentsAfterAdmin(pathname) ?? [];
  const [area, collection, documentId, subView] = segments;

  if (area !== "collections" || !collection) {
    const label = area ? (ROOT_VIEW_LABELS[area] ?? undefined) : undefined;
    return label ? { sectionLabel: label } : {};
  }

  const studioConfig =
    collection in WEB_STUDIO_COLLECTION_CONFIGS
      ? WEB_STUDIO_COLLECTION_CONFIGS[collection as WebStudioCollectionSlug]
      : undefined;
  // Administration lists use the titles the rail and Studio home show.
  const adminTitle = WEB_STUDIO_ADMIN_COLLECTIONS.find(
    (entry) => entry.slug === collection,
  )?.title;
  const sectionLabel =
    studioConfig?.sectionLabel ??
    adminTitle ??
    collectionLabels[collection] ??
    collection;

  if (!documentId) {
    return { sectionLabel };
  }

  const currentLabel =
    documentId === "trash"
      ? "Trash"
      : subView
        ? (DOCUMENT_SUBVIEW_LABELS[subView] ?? "Document")
        : "Document";

  return {
    sectionLabel,
    sectionHref: `${ADMIN_ROUTE}/collections/${collection}`,
    currentLabel,
  };
}

/**
 * The document a stock sub-view (Versions, API) belongs to, from Payload's
 * own step nav (collection › document › view), so the bar can name it as
 * Payload's breadcrumb did. Null on the document itself, or before Payload
 * has set the trail.
 */
export function documentCrumbFromStepNav(
  stepNav: ReadonlyArray<{ label?: unknown; url?: string }>,
  pathname: string,
): { label: string; href: string } | null {
  const [area, collection, documentId, subView] =
    segmentsAfterAdmin(pathname) ?? [];
  if (area !== "collections" || !collection || !documentId || !subView) {
    return null;
  }
  const href = `${ADMIN_ROUTE}/collections/${collection}/${documentId}`;
  const item = stepNav.find((entry) => entry.url === href);
  return item && typeof item.label === "string" && item.label
    ? { label: item.label, href }
    : null;
}
