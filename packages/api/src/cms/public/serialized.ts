/**
 * Serialized public types — the only shapes the public runtime may consume.
 *
 * Consuming apps depend on these types and the allowlist serializer's output,
 * never on raw Payload documents or the `cms` schema (Phase 5 (Public Website
 * Runtime Contract), rulings A3/A7; ADR-0027). The page shape stays
 * additively compatible with the shipped `PublicCmsPage` contract consumed by
 * `apps/donor`.
 */

/**
 * Public media shape: normalized URLs and display metadata only. Raw Payload
 * media objects are never emitted through MEDIA FIELDS. Rich-text
 * (`content`/`body`) is an intentional Lexical-JSON pass-through, so the
 * reader implementation is contractually bound to keep populated Payload
 * documents out of rich-text nodes — see the depth rule on
 * {@link import("./reader").PublishedContentReader}.
 */
export type SerializedPublicMedia = {
  id: string | null;
  alt: string | null;
  url: string | null;
  thumbnailURL: string | null;
  cardURL: string | null;
  width: number | null;
  height: number | null;
  mimeType: string | null;
};

/**
 * A media field value after serialization. Unpopulated Payload relationships
 * arrive as bare ids (string/number) and pass through unchanged — the shipped
 * public contract behaves the same way.
 */
export type SerializedPublicMediaValue =
  | SerializedPublicMedia
  | string
  | number
  | null;

export type SerializedPublicBlockBase = {
  id: string | null;
  blockName: string | null;
  blockType: string | null;
};

export type SerializedPublicHeroBlock = SerializedPublicBlockBase & {
  eyebrow: string | null;
  headline: string;
  subheading: string | null;
  backgroundImage: SerializedPublicMediaValue;
  primaryCtaLabel: string | null;
  primaryCtaHref: string | null;
};

export type SerializedPublicCallToActionBlock = SerializedPublicBlockBase & {
  headline: string;
  copy: string | null;
  buttonLabel: string | null;
  buttonHref: string | null;
  openInNewTab: boolean;
};

export type SerializedPublicRichTextBlock = SerializedPublicBlockBase & {
  heading: string | null;
  /** Lexical rich-text JSON; rendered by the shared rich-text renderer. */
  body: unknown;
};

export type SerializedPublicMediaFeatureBlock = SerializedPublicBlockBase & {
  title: string | null;
  body: string | null;
  media: SerializedPublicMediaValue;
  mediaCaption: string | null;
};

export type SerializedPublicFaqItem = {
  id: string | null;
  question: string;
  answer: string;
};

export type SerializedPublicFaqBlock = SerializedPublicBlockBase & {
  heading: string | null;
  items: SerializedPublicFaqItem[];
};

export type SerializedPublicImpactStat = {
  id: string | null;
  value: string;
  label: string;
  description: string | null;
};

export type SerializedPublicImpactStatsBlock = SerializedPublicBlockBase & {
  heading: string | null;
  items: SerializedPublicImpactStat[];
};

export type SerializedPublicTestimonialBlock = SerializedPublicBlockBase & {
  quote: string;
  attribution: string | null;
};

/**
 * A block whose `blockType` the allowlist does not recognize: only the base
 * identity fields survive serialization. Unknown fields never leak.
 */
export type SerializedPublicUnknownBlock = SerializedPublicBlockBase;

export type SerializedPublicLayoutBlock =
  | SerializedPublicHeroBlock
  | SerializedPublicCallToActionBlock
  | SerializedPublicRichTextBlock
  | SerializedPublicMediaFeatureBlock
  | SerializedPublicFaqBlock
  | SerializedPublicImpactStatsBlock
  | SerializedPublicTestimonialBlock
  | SerializedPublicUnknownBlock;

/**
 * The serialized public page. Field-compatible with the shipped
 * `PublicCmsPage` shape (`@asym/lib/cms/public-page`) so existing donor
 * consumers keep working; `layout` is the typed allowlist block set.
 */
export type SerializedPublicPage = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  /** Lexical rich-text JSON for legacy single-column pages. */
  content: unknown;
  layout: SerializedPublicLayoutBlock[] | null;
  pageType: string | null;
  missionaryId: string | null;
  fundId: string | null;
  legacyContentFallback: boolean | null;
  updatedAt?: string;
};

export type SerializedPublicNavigationItem = {
  id: string | null;
  label: string;
  /** Sanitized href — unsafe protocols and control characters are dropped. */
  href: string | null;
  openInNewTab: boolean;
};

export type SerializedPublicNavigation = {
  id: string;
  label: string;
  items: SerializedPublicNavigationItem[];
  updatedAt?: string;
};

export type SerializedPublicUpdate = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  /** Lexical rich-text JSON. */
  content: unknown;
  /** Operational missionary reference (id only — never a populated record). */
  missionaryId: string | null;
  publishedAt: string | null;
  updatedAt?: string;
};

/** Tenant presentation summary exposed on public payloads (parity: slug only). */
export type SerializedPublicTenantSummary = {
  slug: string | null;
};
