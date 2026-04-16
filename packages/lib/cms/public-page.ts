/**
 * JSON shape for `page` in public CMS read APIs (`/api/cms/public/pages/*`, etc.).
 * Keep additive fields backward compatible for donor consumers.
 */
export type PublicCmsPage = {
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
