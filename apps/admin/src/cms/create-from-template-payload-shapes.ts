/**
 * Structural types for `create-from-template-endpoint.ts`.
 *
 * Payload writes the full definitions to `apps/admin/payload-types.ts` via
 * `payload generate:types` (file is gitignored). These shapes must stay aligned
 * with that output so `tsc` works in CI and fresh clones without codegen.
 */

/** Block array copied from a page template into new documents. */
export type CmsLayoutBlocks = unknown[];

export type PageTemplateForCreate = {
  tenant?: unknown;
  pageType?: string;
  defaultLayout?: unknown;
  templateKey?: string;
  defaultSummary?: string | null;
};

export type PageCreateFields = {
  tenant: number;
  title: string;
  slug: string;
  summary?: string;
  pageType: string;
  template: number;
  layout: CmsLayoutBlocks;
  content: unknown;
  legacyContentFallback: boolean;
};

export type MissionaryGivingPageCreateFields = {
  tenant: number;
  missionaryId: string;
  missionaryProfile?: number;
  templateKey: string;
  template: number;
  title: string;
  slug: string;
  summary?: string;
  pageType: string;
  layout: CmsLayoutBlocks;
};

export type ProjectPageCreateFields = {
  tenant: number;
  fundId: string;
  templateKey: string;
  template: number;
  title: string;
  slug: string;
  summary?: string;
  pageType: string;
  layout: CmsLayoutBlocks;
};

export type MinistryUpdateCreateFields = {
  tenant: number;
  missionary: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: unknown;
};
