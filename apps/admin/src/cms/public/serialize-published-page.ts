import { resolvePublicCmsCtaHref } from "@asym/lib/cms/public-page";

import type { SerializedPublicMedia } from "@asym/api/cms/public";
import type { PublicCmsPage } from "@asym/lib/cms/public-page";

/**
 * Normalizes Payload documents for **public** `pages` JSON responses.
 * Additive fields (`layout`, `pageType`, …) must stay backward compatible for `apps/donor/lib/cms/client.ts`.
 */
/** @deprecated Use `PublicCmsPage` from `@asym/lib/cms/public-page` */
export type PublicCmsPagePayload = PublicCmsPage;

export function serializePublishedPageLike(
  doc: Record<string, unknown>,
): PublicCmsPage {
  const pageType = typeof doc.pageType === "string" ? doc.pageType : null;
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

  return value
    .map((block) => serializePublicBlock(block, pageContext))
    .filter(Boolean);
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
          ? block.items.map(serializeQuestionAnswer).filter(Boolean)
          : [],
      };
    case "impact-stats":
      return {
        ...base,
        heading: readOptionalString(block.heading),
        items: Array.isArray(block.items)
          ? block.items.map(serializeStat).filter(Boolean)
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
  const sizes = media.sizes as Record<string, unknown> | undefined;
  const thumbnail = readMediaSizeUrl(sizes?.thumbnail);
  const card = readMediaSizeUrl(sizes?.card);

  const serialized: SerializedPublicMedia = {
    id:
      typeof media.id === "string" || typeof media.id === "number"
        ? String(media.id)
        : null,
    alt: readOptionalString(media.alt),
    url: readOptionalString(media.url),
    thumbnailURL: thumbnail,
    cardURL: card,
    width: typeof media.width === "number" ? media.width : null,
    height: typeof media.height === "number" ? media.height : null,
    mimeType: readOptionalString(media.mimeType),
  };

  // Present-only public fields (kept identical to the package serializer —
  // the parity baseline): the file name is public by construction, and the
  // caption is the media document's editorial caption.
  const filename = readOptionalString(media.filename);
  if (filename !== null) {
    serialized.filename = filename;
  }

  const caption = readOptionalString(media.caption);
  if (caption !== null) {
    serialized.caption = caption;
  }

  return serialized;
}

function readMediaSizeUrl(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const size = value as Record<string, unknown>;
  return readOptionalString(size.url);
}
