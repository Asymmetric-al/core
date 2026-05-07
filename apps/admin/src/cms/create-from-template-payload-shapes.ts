/**
 * Structural types for `create-from-template-endpoint.ts`.
 *
 * Payload writes the full definitions to `apps/admin/payload-types.ts` via
 * `payload generate:types` (file is gitignored). These shapes must stay aligned
 * with that output so `tsc` works in CI and fresh clones without codegen.
 */
import type {
  MinistryUpdate,
  MissionaryGivingPage,
  Page,
  PageTemplate,
  ProjectPage,
} from "../../payload-types";

/** Block array copied from a page template into new documents. */
export type CmsLayoutBlocks = NonNullable<PageTemplate["defaultLayout"]>;
export type CmsRichTextValue = Page["content"];

export type PageTemplateForCreate = Pick<
  PageTemplate,
  "tenant" | "pageType" | "defaultLayout" | "templateKey" | "defaultSummary"
>;

export type PageCreateFields = {
  tenant: number;
  title: string;
  slug: string;
  summary?: string;
  pageType: Page["pageType"];
  template: number;
  layout: Page["layout"];
  content: CmsRichTextValue;
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
  pageType: MissionaryGivingPage["pageType"];
  layout: MissionaryGivingPage["layout"];
};

export type ProjectPageCreateFields = {
  tenant: number;
  fundId: string;
  templateKey: string;
  template: number;
  title: string;
  slug: string;
  summary?: string;
  pageType: ProjectPage["pageType"];
  layout: ProjectPage["layout"];
};

export type MinistryUpdateCreateFields = {
  tenant: number;
  missionary: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: MinistryUpdate["content"];
};
