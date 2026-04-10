/**
 * Normalizes Payload documents for **public** `pages` JSON responses.
 * Additive fields (`layout`, `pageType`, …) must stay backward compatible for `apps/donor/lib/cms/client.ts`.
 */
export type PublicCmsPagePayload = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content?: unknown;
  layout?: unknown;
  pageType?: string | null;
  missionaryId?: string | null;
  fundId?: string | null;
  legacyContentFallback?: boolean | null;
  updatedAt?: string;
};

export function serializePublishedPageLike(
  doc: Record<string, unknown>,
): PublicCmsPagePayload {
  return {
    id: String(doc.id),
    title: typeof doc.title === "string" ? doc.title : "",
    slug: typeof doc.slug === "string" ? doc.slug : "",
    summary: typeof doc.summary === "string" ? doc.summary : null,
    content: doc.content,
    layout: doc.layout,
    pageType: typeof doc.pageType === "string" ? doc.pageType : null,
    missionaryId: typeof doc.missionaryId === "string" ? doc.missionaryId : null,
    fundId: typeof doc.fundId === "string" ? doc.fundId : null,
    legacyContentFallback:
      typeof doc.legacyContentFallback === "boolean"
        ? doc.legacyContentFallback
        : null,
    updatedAt: typeof doc.updatedAt === "string" ? doc.updatedAt : undefined,
  };
}
