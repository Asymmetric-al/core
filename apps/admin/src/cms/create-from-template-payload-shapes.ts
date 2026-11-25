export type CmsPageFamily = "standard" | "missionary" | "project";

export type CmsRichTextDocument = {
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

export type CmsLayoutBlock =
  | {
      eyebrow?: string | null;
      headline: string;
      subheading?: string | null;
      backgroundImage?: string | null;
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
      media: string;
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

export type CmsLayoutBlocks = CmsLayoutBlock[];
export type CmsRichTextValue = CmsRichTextDocument;

export type PageCreateFields = {
  site: string;
  family: CmsPageFamily;
  title: string;
  slug: string;
  summary?: string | null;
  templateKey: string;
  missionaryId?: string | null;
  fundId?: string | null;
  layout: CmsLayoutBlocks;
  content: CmsRichTextValue;
  legacyContentFallback: boolean;
};
