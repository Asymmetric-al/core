import { resolveRenderablePublicCmsImage } from "@asym/lib/cms/public-media";
import Image from "next/image";

import { cn } from "../../lib/utils";

/**
 * Public CMS media primitives (Phase 5 (Public Website Runtime Contract),
 * ruling A12; issue #529).
 *
 * The ONLY way public surfaces render CMS media: input is the allowlist
 * serializer's public media value, output is `next/image` with alt text and
 * intrinsic dimensions carried through. Anything that does not resolve to a
 * renderable image — a bare relationship id (unpopulated or
 * non-public-eligible reference), a missing URL, missing dimensions — renders
 * nothing at all. Raw Payload media objects never reach these components;
 * they accept only serialized values.
 */

type PublicCmsImageProps = {
  /** The serialized public media value (`SerializedPublicMediaValue`). */
  media: unknown;
  /** The CMS base origin serialized relative media URLs resolve against. */
  cmsBaseUrl: string | null | undefined;
  /** `next/image` responsive sizes hint. */
  sizes?: string;
  /** Set for above-the-fold imagery (hero backgrounds). */
  priority?: boolean;
  className?: string;
};

export function PublicCmsImage({
  media,
  cmsBaseUrl,
  sizes,
  priority = false,
  className,
}: PublicCmsImageProps) {
  const image = resolveRenderablePublicCmsImage(media, cmsBaseUrl);
  if (!image) {
    return null;
  }

  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      className={cn("h-auto w-full object-cover", className)}
    />
  );
}

type PublicCmsMediaFigureProps = {
  media: unknown;
  cmsBaseUrl: string | null | undefined;
  /**
   * Caption override (e.g. a block-level `mediaCaption`); falls back to the
   * media document's own caption when absent.
   */
  caption?: string | null;
  sizes?: string;
  /** Set for above-the-fold imagery (first layout media block). */
  priority?: boolean;
  className?: string;
};

export function PublicCmsMediaFigure({
  media,
  cmsBaseUrl,
  caption,
  sizes,
  priority = false,
  className,
}: PublicCmsMediaFigureProps) {
  const image = resolveRenderablePublicCmsImage(media, cmsBaseUrl);
  if (!image) {
    return null;
  }

  const figcaption = caption?.trim() ? caption : image.caption;

  return (
    <figure className={cn("my-8 space-y-3", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        priority={priority}
        className="h-auto w-full rounded-xl object-cover"
      />
      {figcaption ? (
        <figcaption className="text-center text-sm text-zinc-500">
          {figcaption}
        </figcaption>
      ) : null}
    </figure>
  );
}
