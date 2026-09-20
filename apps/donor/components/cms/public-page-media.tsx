import {
  PublicCmsImage,
  PublicCmsMediaFigure,
} from "@asym/ui/components/public/cms-media";

import { readMediaBearingBlocks } from "./public-page-media-blocks";

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
            priority={index === 0}
            className="my-0"
          />
        );
      })}
    </div>
  );
}
