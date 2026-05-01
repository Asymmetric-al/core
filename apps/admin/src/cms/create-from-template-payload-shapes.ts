/**
 * Structural types for `create-from-template-endpoint.ts`.
 *
 * Payload writes the full definitions to `apps/admin/payload-types.ts` via
 * `payload generate:types` (file is gitignored). These shapes must stay aligned
 * with that output so `tsc` works in CI and fresh clones without codegen.
 */

/** Block array copied from a page template into new documents. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO(payload-codegen): mirrors generated Payload block unions that are unavailable in fresh clones
export type CmsLayoutBlocks = any[];

type PayloadPageType = "standard" | "missionary_giving" | "project";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO(payload-codegen): mirrors generated Payload Lexical state that is unavailable in fresh clones
type LexicalRichTextContent = any;

export type PageTemplateForCreate = {
  tenant?: unknown;
  pageType?: PayloadPageType | "ministry_update";
  defaultLayout?: unknown;
  templateKey?: string;
  defaultSummary?: string | null;
};

export type PageCreateFields = {
  tenant: number;
  title: string;
  slug: string;
  summary?: string;
  pageType: PayloadPageType;
  template: number;
  layout: CmsLayoutBlocks;
  content: LexicalRichTextContent;
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
  pageType: "missionary_giving";
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
  pageType: "project";
  layout: CmsLayoutBlocks;
};

export type MinistryUpdateCreateFields = {
  tenant: number;
  missionary: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: LexicalRichTextContent;
};
