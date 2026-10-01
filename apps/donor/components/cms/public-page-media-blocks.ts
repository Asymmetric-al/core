import { resolveRenderablePublicCmsImage } from "@asym/lib/cms/public-media";

import type {
  SerializedPublicHeroBlock,
  SerializedPublicMediaFeatureBlock,
} from "@asym/api/cms/public";

export type MediaBearingBlock =
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
