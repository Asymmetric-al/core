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
 * - Serialized URLs resolve only against the CMS media origin: admin-relative
 *   paths (`/api/media/file/...`) join the base, and absolute URLs are
 *   admitted only when they already live on that origin. A foreign-host or
 *   non-http(s) URL smuggled into a media field resolves to `null` instead of
 *   reaching `next/image` (whose host allowlist would turn it into a
 *   render-time error).
 */

const SAFE_IMAGE_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * The public media fields delivery resolution actually consumes — a
 * structural subset of `SerializedPublicMedia` (`@asym/api/cms/public`),
 * declared here because the workspace dependency direction points the other
 * way (`@asym/api` depends on `@asym/lib`).
 */
export type PublicCmsMediaLike = {
  alt?: string | null;
  url?: string | null;
  width?: number | null;
  height?: number | null;
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
 * Public-eligibility seam (Phase 3 [#496] anonymity/restricted-content —
 * reserved). Today every fully serialized public media object is eligible:
 * the serializer only emits public fields and non-public references arrive as
 * bare ids, which never resolve. When #496 lands, its predicates plug in
 * here — the resolver already consumes this check on every resolution.
 */
export function isPublicEligibleCmsMedia(media: PublicCmsMediaLike): boolean {
  return typeof media === "object" && media !== null;
}

/**
 * Resolves a serialized public media URL against the CMS media origin.
 * Site-relative paths join the base; absolute URLs pass only when already on
 * that origin; everything else (missing value, protocol-relative, non-http(s)
 * schemes, foreign hosts, unparsable base) resolves to `null`.
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

  const base = parseSafeHttpUrl(cmsBaseUrl ?? null);
  if (!base) {
    return null;
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    const absolute = parseSafeHttpUrl(trimmed);
    if (!absolute) {
      return null;
    }
    return new URL(absolute).origin === new URL(base).origin ? absolute : null;
  }

  if (!trimmed.startsWith("/")) {
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
 * - an object that is not public-eligible, has no resolvable URL, or lacks
 *   positive intrinsic dimensions is `null` (`next/image` needs all three);
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
  if (!isPublicEligibleCmsMedia(media)) {
    return null;
  }

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
