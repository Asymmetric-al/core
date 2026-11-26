import { resolvePublicCmsCtaHref } from "@asym/lib/cms/public-page";

import type { SerializedPublicMedia } from "@asym/api/cms/public";
import type { PublicCmsPage } from "@asym/lib/cms/public-page";

const CTA_PAGE_TYPES: Record<string, string> = {
  standard: "standard",
  missionary: "missionary_giving",
  project: "project",
};

export function serializePublishedPageLike(
  doc: Record<string, unknown>,
): PublicCmsPage {
  const pageType =
    typeof doc.family === "string" && Object.hasOwn(CTA_PAGE_TYPES, doc.family)
      ? CTA_PAGE_TYPES[doc.family]!
      : null;
  const missionaryId =
    typeof doc.missionaryId === "string" ? doc.missionaryId : null;
  const fundId = typeof doc.fundId === "string" ? doc.fundId : null;

  return {
    id: String(doc.id),
    title: typeof doc.title === "string" ? doc.title : "",
    slug: typeof doc.slug === "string" ? doc.slug : "",
    summary: typeof doc.summary === "string" ? doc.summary : null,
    content: doc.content,
    layout: serializePublicLayout(doc.layout, {
      pageType,
      missionaryId,
      fundId,
    }),
    pageType,
    missionaryId,
    fundId,
    legacyContentFallback:
      typeof doc.legacyContentFallback === "boolean"
        ? doc.legacyContentFallback
        : null,
    updatedAt: typeof doc.updatedAt === "string" ? doc.updatedAt : undefined,
  };
}

function serializePublicLayout(
  value: unknown,
  pageContext: {
    pageType: string | null;
    missionaryId: string | null;
    fundId: string | null;
  },
) {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.flatMap((block) => {
    const mappedValue = serializePublicBlock(block, pageContext);
    return mappedValue ? [mappedValue] : [];
  });
}

function serializePublicBlock(
  value: unknown,
  pageContext: {
    pageType: string | null;
    missionaryId: string | null;
    fundId: string | null;
  },
) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const block = value as Record<string, unknown>;
  const base = readBlockBase(block);

  switch (block.blockType) {
    case "hero":
      return {
        ...base,
        eyebrow: readOptionalString(block.eyebrow),
        headline: readRequiredString(block.headline),
        subheading: readOptionalString(block.subheading),
        backgroundImage: serializePublicMedia(block.backgroundImage),
        primaryCtaLabel: readOptionalString(block.primaryCtaLabel),
        primaryCtaHref: resolvePublicCmsCtaHref({
          rawHref: block.primaryCtaHref,
          ...pageContext,
        }),
      };
    case "call-to-action":
      return {
        ...base,
        headline: readRequiredString(block.headline),
        copy: readOptionalString(block.copy),
        buttonLabel: readOptionalString(block.buttonLabel),
        buttonHref: resolvePublicCmsCtaHref({
          rawHref: block.buttonHref,
          ...pageContext,
        }),
        openInNewTab:
          typeof block.openInNewTab === "boolean" ? block.openInNewTab : false,
      };
    case "rich-text":
      return {
        ...base,
        heading: readOptionalString(block.heading),
        body: block.body,
      };
    case "media-feature":
      return {
        ...base,
        title: readOptionalString(block.title),
        body: readOptionalString(block.body),
        media: serializePublicMedia(block.media),
        mediaCaption: readOptionalString(block.mediaCaption),
      };
    case "faq":
      return {
        ...base,
        heading: readOptionalString(block.heading),
        items: Array.isArray(block.items)
          ? block.items.flatMap((item) => {
              const serialized = serializeQuestionAnswer(item);
              return serialized ? [serialized] : [];
            })
          : [],
      };
    case "impact-stats":
      return {
        ...base,
        heading: readOptionalString(block.heading),
        items: Array.isArray(block.items)
          ? block.items.flatMap((item) => {
              const serialized = serializeStat(item);
              return serialized ? [serialized] : [];
            })
          : [],
      };
    case "testimonial":
      return {
        ...base,
        quote: readRequiredString(block.quote),
        attribution: readOptionalString(block.attribution),
      };
    default:
      return base;
  }
}

function readBlockBase(block: Record<string, unknown>) {
  return {
    id: readOptionalString(block.id),
    blockName: readOptionalString(block.blockName),
    blockType: typeof block.blockType === "string" ? block.blockType : null,
  };
}

function readOptionalString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readRequiredString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function serializeQuestionAnswer(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  return {
    id: readOptionalString(item.id),
    question: readRequiredString(item.question),
    answer: readRequiredString(item.answer),
  };
}

function serializeStat(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  return {
    id: readOptionalString(item.id),
    value: readRequiredString(item.value),
    label: readRequiredString(item.label),
    description: readOptionalString(item.description),
  };
}

function serializePublicMedia(value: unknown) {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    value === null ||
    value === undefined
  ) {
    return value ?? null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const media = value as Record<string, unknown>;
  const serialized: SerializedPublicMedia = {
    id:
      typeof media.id === "string" || typeof media.id === "number"
        ? String(media.id)
        : null,
    alt: readOptionalString(media.alt),
    url: null,
    thumbnailURL: null,
    cardURL: null,
    width: null,
    height: null,
    mimeType: null,
  };

  return serialized;
}
