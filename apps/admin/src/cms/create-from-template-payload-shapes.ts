/**
 * Structural types for `create-from-template-endpoint.ts`.
 *
 * Payload writes the full definitions to `apps/admin/payload-types.ts` via
 * `payload generate:types` (file is gitignored). These committed structural
 * shapes must stay aligned with the subset this endpoint reads and writes so
 * `tsc` works in CI and fresh clones without codegen.
 */

type CmsRelationship = number | { id: string | number } | null;
type CmsPageType =
  | "standard"
  | "missionary_giving"
  | "project"
  | "ministry_update";
type CmsRichTextDocument = {
  root: {
    type: string;
    children: Array<{
      type: unknown;
      version: number;
      [key: string]: unknown;
    }>;
    direction: "ltr" | "rtl" | null;
    format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    indent: number;
    version: number;
  };
  [key: string]: unknown;
};
type CmsLayoutBlock =
  | {
      eyebrow?: string | null;
      headline: string;
      subheading?: string | null;
      backgroundImage?: number | null;
      primaryCtaLabel?: string | null;
      primaryCtaHref?: string | null;
      id?: string | null;
      blockName?: string | null;
      blockType: "hero";
    }
  | {
      heading?: string | null;
      body: CmsRichTextDocument;
      id?: string | null;
      blockName?: string | null;
      blockType: "rich-text";
    }
  | {
      title?: string | null;
      body?: string | null;
      media: number;
      mediaCaption?: string | null;
      id?: string | null;
      blockName?: string | null;
      blockType: "media-feature";
    }
  | {
      headline: string;
      copy?: string | null;
      buttonLabel: string;
      buttonHref: string;
      openInNewTab?: boolean | null;
      id?: string | null;
      blockName?: string | null;
      blockType: "call-to-action";
    }
  | {
      heading?: string | null;
      items: Array<{
        question: string;
        answer: string;
        id?: string | null;
      }>;
      id?: string | null;
      blockName?: string | null;
      blockType: "faq";
    }
  | {
      heading?: string | null;
      items: Array<{
        label: string;
        value: string;
        description?: string | null;
        id?: string | null;
      }>;
      id?: string | null;
      blockName?: string | null;
      blockType: "impact-stats";
    }
  | {
      quote: string;
      attribution: string;
      role?: string | null;
      id?: string | null;
      blockName?: string | null;
      blockType: "testimonial";
    };

/** Block array copied from a page template into new documents. */
export type CmsLayoutBlocks = CmsLayoutBlock[];
export type CmsRichTextValue = CmsRichTextDocument;

export type PageTemplateForCreate = {
  tenant: CmsRelationship;
  pageType: CmsPageType;
  defaultLayout?: CmsLayoutBlocks | null;
  templateKey: string;
  defaultSummary?: string | null;
};

export type PageCreateFields = {
  tenant: number;
  title: string;
  slug: string;
  summary?: string;
  pageType: Exclude<CmsPageType, "ministry_update">;
  template: number;
  layout: CmsLayoutBlocks;
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
  content: CmsRichTextValue;
};
