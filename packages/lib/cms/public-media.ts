/**
 * Public CMS media delivery resolution (Phase 5 (Public Website Runtime
 * Contract), ruling A12; issue #529).
 *
 * Public media reaches the browser only from the allowlist serializer's
 * public media fields, rendered through `next/image`. These helpers own the
 * fail-safe half of that contract:
 *
 * - A media value that is not a fully serialized public object — a bare
 *   relationship id (an unpopulated or non-public-eligible reference), a
 *   missing URL, or missing intrinsic dimensions — resolves to `null` and is
 *   simply not rendered. Silence, never a broken or leaking image.
 * - Serialized URLs are admin-relative (`/api/media/file/...`); resolution
 *   joins them to the CMS base origin and admits only http(s) results, so a
 *   hostile URL smuggled into a media field cannot reach `next/image`.
 */

const SAFE_IMAGE_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * The structural media shape the resolver accepts — matches
 * `SerializedPublicMedia` (`@asym/api/cms/public`) without importing it, so
 * `@asym/lib` stays dependency-light.
 */
export type PublicCmsMediaLike = {
  id?: string | null;
  alt?: string | null;
  url?: string | null;
  thumbnailURL?: string | null;
  cardURL?: string | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  filename?: string | null;
  caption?: string | null;
};

/** A media value ready for `next/image`: resolved URL + intrinsic size. */
export type RenderablePublicCmsImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string | null;
};

/**
 * Resolves a serialized public media URL against the CMS base origin.
 * Absolute http(s) URLs pass through; site-relative paths join to the base;
 * everything else (missing, protocol-relative, non-http(s) schemes,
 * unparsable base) resolves to `null`.
 */
export function resolvePublicCmsMediaUrl(
  url: unknown,
  cmsBaseUrl: string | null | undefined,
): string | null {
  if (typeof url !== "string") {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("//")) {
    return null;
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return parseSafeHttpUrl(trimmed);
  }

  if (!trimmed.startsWith("/")) {
    return null;
  }

  const base = parseSafeHttpUrl(cmsBaseUrl ?? null);
  if (!base) {
    return null;
  }

  try {
    return new URL(trimmed, base).toString();
  } catch {
    return null;
  }
}

/**
 * Reduces a serialized media value to a renderable image, fail-safe:
 *
 * - a bare id (string/number) is an unpopulated or non-public-eligible
 *   reference — `null`, never a fetch;
 * - an object without a resolvable URL or positive intrinsic dimensions is
 *   `null` (`next/image` needs both);
 * - missing alt text renders as decorative (`alt=""`), never a leak.
 */
export function resolveRenderablePublicCmsImage(
  value: unknown,
  cmsBaseUrl: string | null | undefined,
): RenderablePublicCmsImage | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const media = value as PublicCmsMediaLike;
  const src = resolvePublicCmsMediaUrl(media.url, cmsBaseUrl);
  if (!src) {
    return null;
  }

  const width = readPositiveDimension(media.width);
  const height = readPositiveDimension(media.height);
  if (width === null || height === null) {
    return null;
  }

  return {
    src,
    alt: typeof media.alt === "string" ? media.alt : "",
    width,
    height,
    caption:
      typeof media.caption === "string" && media.caption.trim()
        ? media.caption
        : null,
  };
}

function parseSafeHttpUrl(value: string | null): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const parsed = new URL(value);
    return SAFE_IMAGE_PROTOCOLS.has(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function readPositiveDimension(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.round(value);
}
