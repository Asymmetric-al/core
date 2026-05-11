/**
 * Structural types for `create-from-template-endpoint.ts`.
 *
 * Payload writes the full definitions to `apps/admin/payload-types.ts` via
 * `payload generate:types` (file is gitignored). These shapes must stay aligned
 * with that output so `tsc` works in CI and fresh clones without codegen.
 */

/** Block array copied from a page template into new documents. */
export type CmsRichTextValue = {
  [k: string]: unknown;
  root: {
    type: string;
    children: {
      [k: string]: unknown;
      type: unknown;
      version: number;
    }[];
    direction: "ltr" | "rtl" | null;
    format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    indent: number;
    version: number;
  };
};

export type CmsLayoutBlock =
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
      body: CmsRichTextValue;
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
      items: {
        question: string;
        answer: string;
        id?: string | null;
      }[];
      id?: string | null;
      blockName?: string | null;
      blockType: "faq";
    }
  | {
      heading?: string | null;
      items: {
        label: string;
        value: string;
        description?: string | null;
        id?: string | null;
      }[];
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

export type CmsLayoutBlocks = CmsLayoutBlock[];

export type CmsPageType = "standard" | "missionary_giving" | "project";
export type CmsTemplatePageType = CmsPageType | "ministry_update";

export type PageTemplateForCreate = {
  tenant?: unknown;
  pageType?: CmsTemplatePageType;
  defaultLayout?: unknown;
  templateKey?: string;
  defaultSummary?: string | null;
};

export type PageCreateFields = {
  tenant: number;
  title: string;
  slug: string;
  summary?: string | null;
  pageType: CmsPageType;
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
  summary?: string | null;
  pageType: CmsPageType;
  layout: CmsLayoutBlocks;
};

export type ProjectPageCreateFields = {
  tenant: number;
  fundId: string;
  templateKey: string;
  template: number;
  title: string;
  slug: string;
  summary?: string | null;
  pageType: CmsPageType;
  layout: CmsLayoutBlocks;
};

export type MinistryUpdateCreateFields = {
  tenant: number;
  missionary: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: CmsRichTextValue;
};
