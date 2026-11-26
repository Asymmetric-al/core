import type {
  CmsLayoutBlocks,
  CmsRichTextDocument,
} from "../create-from-template-payload-shapes";
import type { PageFamily } from "../tenancy/page-rules";

export type PageStarter = {
  key: string;
  name: string;
  description: string;
  family: PageFamily;
  summary: string;
  layout: () => CmsLayoutBlocks;
};

function richText(text: string): CmsRichTextDocument {
  return {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text,
              version: 1,
            },
          ],
          direction: null,
          format: "",
          indent: 0,
          textFormat: 0,
          textStyle: "",
          version: 1,
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      version: 1,
    },
  };
}

function starterLayout({
  headline,
  overview,
  ctaHref,
  ctaLabel,
}: {
  headline: string;
  overview: string;
  ctaHref: string;
  ctaLabel: string;
}): CmsLayoutBlocks {
  return [
    {
      blockType: "hero",
      eyebrow: null,
      headline,
      subheading: null,
      primaryCtaLabel: ctaLabel,
      primaryCtaHref: ctaHref,
    },
    {
      blockType: "rich-text",
      heading: "Overview",
      body: richText(overview),
    },
    {
      blockType: "call-to-action",
      headline: "Take the next step",
      copy: null,
      buttonLabel: ctaLabel,
      buttonHref: ctaHref,
      openInNewTab: false,
    },
  ];
}

export const PAGE_STARTERS: readonly PageStarter[] = Object.freeze([
  {
    key: "standard",
    name: "Standard page",
    description: "About, events and campaign pages.",
    family: "standard",
    summary: "",
    layout: () =>
      starterLayout({
        headline: "Page headline",
        overview: "Tell visitors what this page is about.",
        ctaHref: "/give",
        ctaLabel: "Give",
      }),
  },
  {
    key: "missionary-giving",
    name: "Missionary giving page",
    description: "A support page for one missionary.",
    family: "missionary",
    summary: "",
    layout: () =>
      starterLayout({
        headline: "Support this ministry",
        overview: "Share how gifts support this missionary's work.",
        ctaHref: "/give",
        ctaLabel: "Give",
      }),
  },
  {
    key: "project",
    name: "Project page",
    description: "A landing page for one fund.",
    family: "project",
    summary: "",
    layout: () =>
      starterLayout({
        headline: "Support this project",
        overview:
          "Explain what this project does and what gifts make possible.",
        ctaHref: "/give",
        ctaLabel: "Give",
      }),
  },
]);

export function findPageStarter(key: string): PageStarter | null {
  return PAGE_STARTERS.find((starter) => starter.key === key) ?? null;
}
