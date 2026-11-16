import { formatAdminURL, PREFERENCE_KEYS } from "payload/shared";

/**
 * Payload 4 keeps each user's pins in the `pinned-documents` preference as
 * `{ items: [{ id, collectionSlug }] }`; its stock dashboard widget reads and
 * writes the same record, so pins made in either place show in both. These
 * helpers mirror `@payloadcms/ui` `widgets/RecentlyViewed/pinnedPreferences`
 * (not a public export of the package).
 */
export type PinnedDocumentRef = {
  id: string | number;
  collectionSlug: string;
};

export function pinnedDocumentsURL({
  apiRoute,
  serverURL,
}: {
  apiRoute: string;
  serverURL?: string;
}): string {
  return formatAdminURL({
    apiRoute,
    path: `/payload-preferences/${PREFERENCE_KEYS.PINNED_DOCUMENTS}`,
    serverURL,
  });
}

export const pinnedDocumentKey = ({ id, collectionSlug }: PinnedDocumentRef) =>
  `${collectionSlug}:${String(id)}`;

/** Valid, de-duplicated pins from a stored preference value. */
export function getPinnedItems(value: unknown): PinnedDocumentRef[] {
  if (
    !value ||
    typeof value !== "object" ||
    !Array.isArray((value as { items?: unknown }).items)
  ) {
    return [];
  }
  const seen = new Set<string>();
  return (value as { items: unknown[] }).items.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { id, collectionSlug } = item as Partial<PinnedDocumentRef>;
    if (
      typeof collectionSlug !== "string" ||
      (typeof id !== "string" && typeof id !== "number")
    ) {
      return [];
    }
    const key = pinnedDocumentKey({ id, collectionSlug });
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ id, collectionSlug }];
  });
}

export async function readPinnedDocuments(
  url: string,
): Promise<PinnedDocumentRef[]> {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("Unable to read pins");
  const preference = (await response.json()) as { value?: unknown };
  return getPinnedItems(preference.value);
}

async function savePinnedDocuments(url: string, items: PinnedDocumentRef[]) {
  const response = await fetch(url, {
    body: JSON.stringify({ value: { items } }),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok) throw new Error("Unable to save pins");
}

/** Pin or unpin one document, serialized across same-origin admin tabs. */
export async function updatePinnedDocument({
  document,
  shouldPin,
  url,
}: {
  document: PinnedDocumentRef;
  shouldPin: boolean;
  url: string;
}): Promise<void> {
  const update = async () => {
    const existing = await readPinnedDocuments(url);
    const key = pinnedDocumentKey(document);
    if (shouldPin && existing.some((item) => pinnedDocumentKey(item) === key)) {
      return;
    }
    const remaining = existing.filter(
      (item) => pinnedDocumentKey(item) !== key,
    );
    const ref = { id: document.id, collectionSlug: document.collectionSlug };
    await savePinnedDocuments(url, shouldPin ? [ref, ...remaining] : remaining);
  };
  // Same lock name as Payload's widget, so the two never interleave writes.
  if (typeof navigator !== "undefined" && navigator.locks) {
    await navigator.locks.request(`payload:pinned-documents:${url}`, update);
  } else {
    await update();
  }
}

/** React Query key for the Studio home's Payload dashboard lists. */
export const DASHBOARD_DOCUMENTS_QUERY_KEY = [
  "web-studio",
  "dashboard-documents",
] as const;

/** React Query key for the signed-in user's pins. */
export const PINNED_DOCUMENTS_QUERY_KEY = [
  "web-studio",
  "pinned-documents",
] as const;
