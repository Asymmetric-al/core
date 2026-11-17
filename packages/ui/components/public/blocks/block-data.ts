/**
 * Reads one stored layout block into the shape its section renders.
 *
 * Stored blocks are untrusted: a draft can be half filled and a stored value
 * can have any shape. Each reader keeps what is usable and drops the rest, so
 * an incomplete draft still previews. Text stays text: nothing here is ever
 * rendered as markup.
 */

export type RawBlock = Readonly<Record<string, unknown>>;

export interface CallToAction {
  label: string;
  href: string;
}

export interface HeroBlockData {
  eyebrow: string | null;
  headline: string | null;
  subheading: string | null;
  backgroundImage: unknown;
  primaryAction: CallToAction | null;
}

export interface RichTextBlockData {
  heading: string | null;
  body: unknown;
}

export interface MediaFeatureBlockData {
  title: string | null;
  body: string | null;
  media: unknown;
  mediaCaption: string | null;
}

export interface CallToActionBlockData {
  headline: string | null;
  copy: string | null;
  action: CallToAction | null;
  openInNewTab: boolean;
}

export interface FaqBlockData {
  heading: string | null;
  items: Array<{ question: string | null; answer: string | null }>;
}

export interface ImpactStatsBlockData {
  heading: string | null;
  items: Array<{
    value: string | null;
    label: string | null;
    description: string | null;
  }>;
}

export interface TestimonialBlockData {
  quote: string | null;
  attribution: string | null;
  role: string | null;
}

/** Label used when a call to action has a destination but no label. */
const DEFAULT_ACTION_LABEL = "Open";

export function parseHeroBlock(raw: RawBlock): HeroBlockData {
  const label = readText(raw.primaryCtaLabel);
  const href = readText(raw.primaryCtaHref);
  return {
    eyebrow: readText(raw.eyebrow),
    headline: readText(raw.headline),
    subheading: readText(raw.subheading),
    backgroundImage: raw.backgroundImage ?? null,
    // The hero offers its button only when both halves are filled in.
    primaryAction: label && href ? { label, href } : null,
  };
}

export function parseRichTextBlock(raw: RawBlock): RichTextBlockData {
  return { heading: readText(raw.heading), body: raw.body ?? null };
}

export function parseMediaFeatureBlock(raw: RawBlock): MediaFeatureBlockData {
  return {
    title: readText(raw.title),
    body: readText(raw.body),
    media: raw.media ?? null,
    mediaCaption: readText(raw.mediaCaption),
  };
}

export function parseCallToActionBlock(raw: RawBlock): CallToActionBlockData {
  const href = readText(raw.buttonHref);
  return {
    headline: readText(raw.headline),
    copy: readText(raw.copy),
    action: href
      ? { label: readText(raw.buttonLabel) ?? DEFAULT_ACTION_LABEL, href }
      : null,
    openInNewTab: raw.openInNewTab === true,
  };
}

export function parseFaqBlock(raw: RawBlock): FaqBlockData {
  return {
    heading: readText(raw.heading),
    items: readRecords(raw.items).map((item) => ({
      question: readText(item.question),
      answer: readText(item.answer),
    })),
  };
}

export function parseImpactStatsBlock(raw: RawBlock): ImpactStatsBlockData {
  return {
    heading: readText(raw.heading),
    items: readRecords(raw.items).map((item) => ({
      value: readText(item.value),
      label: readText(item.label),
      description: readText(item.description),
    })),
  };
}

export function parseTestimonialBlock(raw: RawBlock): TestimonialBlockData {
  return {
    quote: readText(raw.quote),
    attribution: readText(raw.attribution),
    role: readText(raw.role),
  };
}

export function isRawBlock(value: unknown): value is RawBlock {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** A non-blank string, or null. */
function readText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function readRecords(value: unknown): RawBlock[] {
  return Array.isArray(value) ? value.filter(isRawBlock) : [];
}
