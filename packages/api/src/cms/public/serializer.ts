import {
  resolvePublicCmsCtaHref,
  sanitizePublicCmsHref,
} from "@asym/lib/cms/public-page";

import type {
  SerializedPublicFaqItem,
  SerializedPublicImpactStat,
  SerializedPublicLayoutBlock,
  SerializedPublicMedia,
  SerializedPublicMediaValue,
  SerializedPublicNavigation,
  SerializedPublicNavigationItem,
  SerializedPublicPage,
  SerializedPublicUpdate,
} from "./serialized";

/**
 * The allowlist public serializer (Phase 5 (Public Website Runtime Contract),
 * ruling A5; deep module `public-serializer`).
 *
 * Only explicitly named public-safe fields and the typed layout-block set are
 * emitted; new or unknown fields are excluded by default. The page output is
 * behavior-compatible with the shipped published-page serialization in
 * `apps/admin` (the parity baseline the proof-slice test guards).
 */

type UnknownRecord = Record<string, unknown>;

type PageCtaContext = {
  pageType: string | null;
  missionaryId: string | null;
  fundId: string | null;
};

export function serializePublicPage(doc: UnknownRecord): SerializedPublicPage {
  const pageType = readOptionalString(doc.pageType);
  const missionaryId = readOptionalString(doc.missionaryId);
  const fundId = readOptionalString(doc.fundId);
  const ctaContext: PageCtaContext = { pageType, missionaryId, fundId };

  const page: SerializedPublicPage = {
    id: String(doc.id),
    title: readRequiredString(doc.title),
    slug: readRequiredString(doc.slug),
    summary: readOptionalString(doc.summary),
    content: doc.content,
    layout: serializePublicLayout(doc.layout, ctaContext),
    pageType,
    missionaryId,
    fundId,
    legacyContentFallback:
      typeof doc.legacyContentFallback === "boolean"
        ? doc.legacyContentFallback
        : null,
  };

  const updatedAt = readOptionalString(doc.updatedAt);
  if (updatedAt !== null) {
    page.updatedAt = updatedAt;
  }

  return page;
}

export function serializePublicNavigation(
  doc: UnknownRecord,
): SerializedPublicNavigation {
  const rawItems = Array.isArray(doc.items) ? doc.items : [];
  const items = rawItems
    .map(serializePublicNavigationItem)
    .filter((item): item is SerializedPublicNavigationItem => item !== null);

  const navigation: SerializedPublicNavigation = {
    id: String(doc.id),
    label: readRequiredString(doc.label),
    items,
  };

  const updatedAt = readOptionalString(doc.updatedAt);
  if (updatedAt !== null) {
    navigation.updatedAt = updatedAt;
  }

  return navigation;
}

export function serializePublicUpdate(
  doc: UnknownRecord,
): SerializedPublicUpdate {
  const update: SerializedPublicUpdate = {
    id: String(doc.id),
    title: readRequiredString(doc.title),
    slug: readRequiredString(doc.slug),
    excerpt: readOptionalString(doc.excerpt),
    content: doc.content,
    missionaryId: readRelationshipId(doc.missionary),
    publishedAt: readOptionalString(doc.publishedAt),
  };

  const updatedAt = readOptionalString(doc.updatedAt);
  if (updatedAt !== null) {
    update.updatedAt = updatedAt;
  }

  return update;
}

function serializePublicNavigationItem(
  value: unknown,
): SerializedPublicNavigationItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as UnknownRecord;
  return {
    id: readOptionalString(item.id),
    label: readRequiredString(item.label),
    href: sanitizePublicCmsHref(item.href),
    openInNewTab:
      typeof item.openInNewTab === "boolean" ? item.openInNewTab : false,
  };
}

function serializePublicLayout(
  value: unknown,
  ctaContext: PageCtaContext,
): SerializedPublicLayoutBlock[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value
    .map((block) => serializePublicBlock(block, ctaContext))
    .filter((block): block is SerializedPublicLayoutBlock => block !== null);
}

function serializePublicBlock(
  value: unknown,
  ctaContext: PageCtaContext,
): SerializedPublicLayoutBlock | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const block = value as UnknownRecord;
  const base = {
    id: readOptionalString(block.id),
    blockName: readOptionalString(block.blockName),
  };

  switch (block.blockType) {
    case "hero":
      return {
        ...base,
        blockType: "hero",
        eyebrow: readOptionalString(block.eyebrow),
        headline: readRequiredString(block.headline),
        subheading: readOptionalString(block.subheading),
        backgroundImage: serializePublicMediaValue(block.backgroundImage),
        primaryCtaLabel: readOptionalString(block.primaryCtaLabel),
        primaryCtaHref: resolvePublicCmsCtaHref({
          rawHref: block.primaryCtaHref,
          ...ctaContext,
        }),
      };
    case "call-to-action":
      return {
        ...base,
        blockType: "call-to-action",
        headline: readRequiredString(block.headline),
        copy: readOptionalString(block.copy),
        buttonLabel: readOptionalString(block.buttonLabel),
        buttonHref: resolvePublicCmsCtaHref({
          rawHref: block.buttonHref,
          ...ctaContext,
        }),
        openInNewTab:
          typeof block.openInNewTab === "boolean" ? block.openInNewTab : false,
      };
    case "rich-text":
      return {
        ...base,
        blockType: "rich-text",
        heading: readOptionalString(block.heading),
        body: block.body,
      };
    case "media-feature":
      return {
        ...base,
        blockType: "media-feature",
        title: readOptionalString(block.title),
        body: readOptionalString(block.body),
        media: serializePublicMediaValue(block.media),
        mediaCaption: readOptionalString(block.mediaCaption),
      };
    case "faq":
      return {
        ...base,
        blockType: "faq",
        heading: readOptionalString(block.heading),
        items: serializeItems(block.items, serializeFaqItem),
      };
    case "impact-stats":
      return {
        ...base,
        blockType: "impact-stats",
        heading: readOptionalString(block.heading),
        items: serializeItems(block.items, serializeImpactStat),
      };
    case "testimonial":
      return {
        ...base,
        blockType: "testimonial",
        quote: readRequiredString(block.quote),
        attribution: readOptionalString(block.attribution),
      };
    default:
      return null;
  }
}

function serializeItems<T>(
  value: unknown,
  serializeItem: (item: unknown) => T | null,
): T[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(serializeItem).filter((item): item is T => item !== null);
}

function serializeFaqItem(value: unknown): SerializedPublicFaqItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as UnknownRecord;
  return {
    id: readOptionalString(item.id),
    question: readRequiredString(item.question),
    answer: readRequiredString(item.answer),
  };
}

function serializeImpactStat(
  value: unknown,
): SerializedPublicImpactStat | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as UnknownRecord;
  return {
    id: readOptionalString(item.id),
    value: readRequiredString(item.value),
    label: readRequiredString(item.label),
    description: readOptionalString(item.description),
  };
}

function serializePublicMediaValue(value: unknown): SerializedPublicMediaValue {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const media = value as UnknownRecord;
  const sizes =
    media.sizes && typeof media.sizes === "object"
      ? (media.sizes as UnknownRecord)
      : undefined;

  const serialized: SerializedPublicMedia = {
    id:
      typeof media.id === "string" || typeof media.id === "number"
        ? String(media.id)
        : null,
    alt: readOptionalString(media.alt),
    url: readOptionalString(media.url),
    thumbnailURL: readMediaSizeUrl(sizes?.thumbnail),
    cardURL: readMediaSizeUrl(sizes?.card),
    width: typeof media.width === "number" ? media.width : null,
    height: typeof media.height === "number" ? media.height : null,
    mimeType: readOptionalString(media.mimeType),
  };

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

function readMediaSizeUrl(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return readOptionalString((value as UnknownRecord).url);
}

/**
 * Reads a Payload relationship value down to its id: bare ids pass through,
 * populated documents reduce to their `id` — the full record never leaks.
 */
function readRelationshipId(value: unknown): string | null {
  if (typeof value === "string" && value) {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    const related = value as UnknownRecord;
    if (typeof related.id === "string" || typeof related.id === "number") {
      return String(related.id);
    }
  }

  return null;
}

function readOptionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readRequiredString(value: unknown): string {
  return typeof value === "string" ? value : "";
}
