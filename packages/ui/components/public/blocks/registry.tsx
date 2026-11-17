import {
  isRawBlock,
  parseCallToActionBlock,
  parseFaqBlock,
  parseHeroBlock,
  parseImpactStatsBlock,
  parseMediaFeatureBlock,
  parseRichTextBlock,
  parseTestimonialBlock,
  type RawBlock,
} from "./block-data";
import {
  CallToActionSection,
  FaqSection,
  HeroSection,
  ImpactStatsSection,
  MediaFeatureSection,
  RichTextSection,
  TestimonialSection,
  type PublicBlockSectionProps,
} from "./block-sections";

import type { PublicBlockSurface } from "./surface";
import type { ComponentType, ReactNode } from "react";

/**
 * The one list of layout block types that Core renders.
 *
 * Web Studio's private preview renders through it today. The public site
 * renders through it from WP7, so every block type that previews also renders
 * live (NC-02). A block type is declared here and nowhere else: adding one
 * means adding an entry, and a stored block whose type has no entry is not
 * rendered.
 */

interface BlockRenderContext {
  key: string;
  surface: PublicBlockSurface;
}

export interface PublicBlockDefinition<TData> {
  /** Reads a stored block into the data its section renders. */
  parse(raw: RawBlock): TData;
  /** Reads and renders a stored block. */
  render(raw: RawBlock, context: BlockRenderContext): ReactNode;
}

function defineBlock<TData>(
  parse: (raw: RawBlock) => TData,
  Section: ComponentType<PublicBlockSectionProps<TData>>,
): PublicBlockDefinition<TData> {
  return {
    parse,
    render: (raw, { key, surface }) => (
      <Section key={key} blockKey={key} data={parse(raw)} surface={surface} />
    ),
  };
}

export const publicBlockRegistry = {
  hero: defineBlock(parseHeroBlock, HeroSection),
  "rich-text": defineBlock(parseRichTextBlock, RichTextSection),
  "media-feature": defineBlock(parseMediaFeatureBlock, MediaFeatureSection),
  "call-to-action": defineBlock(parseCallToActionBlock, CallToActionSection),
  faq: defineBlock(parseFaqBlock, FaqSection),
  "impact-stats": defineBlock(parseImpactStatsBlock, ImpactStatsSection),
  testimonial: defineBlock(parseTestimonialBlock, TestimonialSection),
} as const;

export type PublicBlockType = keyof typeof publicBlockRegistry;

export const PUBLIC_BLOCK_TYPES = Object.freeze(
  Object.keys(publicBlockRegistry) as PublicBlockType[],
);

export function isPublicBlockType(value: unknown): value is PublicBlockType {
  // Own keys only, so `constructor` or `__proto__` never count as a type.
  return typeof value === "string" && Object.hasOwn(publicBlockRegistry, value);
}

/**
 * Renders a stored layout, in order, through the registry. Entries that are
 * not blocks, and blocks whose type the registry does not declare, are
 * dropped. Returns an empty list when nothing renders, so the caller can say
 * that there is nothing to show.
 */
export function renderPublicBlocks(
  layout: unknown,
  options: { keyPrefix: string; surface: PublicBlockSurface },
): ReactNode[] {
  if (!Array.isArray(layout)) {
    return [];
  }

  const rendered: ReactNode[] = [];
  for (const entry of layout) {
    if (!isRawBlock(entry) || !isPublicBlockType(entry.blockType)) {
      continue;
    }

    const definition: PublicBlockDefinition<unknown> =
      publicBlockRegistry[entry.blockType];
    rendered.push(
      definition.render(entry, {
        key: `${options.keyPrefix}-layout-${rendered.length}`,
        surface: options.surface,
      }),
    );
  }

  return rendered;
}
