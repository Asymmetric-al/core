import { resolveRenderablePublicCmsImage } from "@asym/lib/cms/public-media";
import {
  PublicCmsImage,
  PublicCmsMediaFigure,
} from "@asym/ui/components/public/cms-media";

import type {
  SerializedPublicHeroBlock,
  SerializedPublicMediaFeatureBlock,
} from "@asym/api/cms/public";

/**
 * Renders the media of a published CMS page's layout blocks (Phase 5 (Public
 * Website Runtime Contract), ruling A12; issue #529).
 *
 * This is the public media delivery seam and nothing more: hero background
 * images and media-feature figures (with their captions) render through the
 * shared `next/image` primitives, consuming only the allowlist serializer's
 * public media fields. Block text and every other block type render nothing
 * here — the generalizable page template that renders the full block set is
 * the proof-slice ticket (#530), which extends this seam rather than
 * replacing it. A media value that does not resolve to a renderable public
 * image (a bare reference id, missing URL or dimensions, foreign host)
 * renders nothing — fail-safe by construction, never a broken image.
 */

const PAGE_MEDIA_SIZES = "(min-width: 1024px) 896px, 100vw";

type MediaBearingBlock =
  | { kind: "hero-image"; key: string; block: SerializedPublicHeroBlock }
  | {
      kind: "media-figure";
      key: string;
      block: SerializedPublicMediaFeatureBlock;
    };

export function readMediaBearingBlocks(
  layout: unknown,
  cmsBaseUrl: string | null | undefined,
): MediaBearingBlock[] {
  if (!Array.isArray(layout)) {
    return [];
  }

  const blocks: MediaBearingBlock[] = [];
  layout.forEach((value, index) => {
    if (!value || typeof value !== "object") {
      return;
    }

    const block = value as { blockType?: unknown; id?: unknown };
    const key = typeof block.id === "string" ? block.id : `block-${index}`;

    if (block.blockType === "hero") {
      const hero = block as SerializedPublicHeroBlock;
      if (resolveRenderablePublicCmsImage(hero.backgroundImage, cmsBaseUrl)) {
        blocks.push({ kind: "hero-image", key, block: hero });
      }
      return;
    }

    if (block.blockType === "media-feature") {
      const feature = block as SerializedPublicMediaFeatureBlock;
      if (resolveRenderablePublicCmsImage(feature.media, cmsBaseUrl)) {
        blocks.push({ kind: "media-figure", key, block: feature });
      }
    }
  });

  return blocks;
}

type PublicCmsPageMediaProps = {
  layout: unknown;
  cmsBaseUrl: string | null | undefined;
};

export function PublicCmsPageMedia({
  layout,
  cmsBaseUrl,
}: PublicCmsPageMediaProps) {
  const blocks = readMediaBearingBlocks(layout, cmsBaseUrl);
  if (!blocks.length) {
    return null;
  }

  return (
    <div className="mb-10 space-y-10">
      {blocks.map((entry, index) => {
        if (entry.kind === "hero-image") {
          return (
            <PublicCmsImage
              key={entry.key}
              media={entry.block.backgroundImage}
              cmsBaseUrl={cmsBaseUrl}
              sizes={PAGE_MEDIA_SIZES}
              priority={index === 0}
              className="rounded-2xl"
            />
          );
        }

        return (
          <PublicCmsMediaFigure
            key={entry.key}
            media={entry.block.media}
            cmsBaseUrl={cmsBaseUrl}
            caption={entry.block.mediaCaption}
            sizes={PAGE_MEDIA_SIZES}
            className="my-0"
          />
        );
      })}
    </div>
  );
}
