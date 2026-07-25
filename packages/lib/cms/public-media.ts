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
 * - Serialized URLs resolve only against allowed public media origins:
 *   admin-relative paths (`/api/media/file/...`) join the CMS base, absolute
 *   URLs on that CMS origin pass through, and absolute URLs on the configured
 *   Vercel Blob public host (`*.public.blob.vercel-storage.com`) pass when
 *   production storage is Blob-backed. A foreign-host or non-http(s) URL
 *   smuggled into a media field resolves to `null` instead of reaching
 *   `next/image` (whose host allowlist would turn it into a render-time
 *   error).
 */

const SAFE_IMAGE_PROTOCOLS = new Set(["http:", "https:"]);

/** The only CMS-origin route admitted by the donor `next/image` config. */
const CMS_MEDIA_FILE_PATH_PREFIX = "/api/media/file/";

/**
 * Host suffix for Payload's Vercel Blob adapter when `access: "public"`
 * (the only access mode the adapter supports today). Store id is the single
 * DNS label before this suffix — see `@payloadcms/storage-vercel-blob`.
 */
const VERCEL_BLOB_PUBLIC_HOST_SUFFIX = ".public.blob.vercel-storage.com";

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
 * reserved). Today every fully serialized public media object is eligible,
 * because eligibility is enforced upstream by the #523 policy chain: the
 * published-content choke-point reads with `overrideAccess: false` under the
 * tenant-constrained public-read access policy, Payload depopulates any
 * media relationship that policy denies (cross-tenant refs arrive as bare
 * ids, which never resolve), and the serializer only emits public fields.
 * When #496 lands, its predicates plug in here — the resolver already
 * consumes this check on every resolution.
 */
export function isPublicEligibleCmsMedia(media: PublicCmsMediaLike): boolean {
  return typeof media === "object" && media !== null;
}

/**
 * Resolves a serialized public media URL against allowed public media
 * origins. Site-relative paths join the CMS base (and must stay on that
 * origin's media-file route after resolution); absolute URLs pass only on the
 * CMS origin's media-file route or the Vercel Blob public host; everything
 * else (missing value, protocol-relative, non-http(s) schemes, foreign hosts,
 * backslash host tricks, unparsable base for relative paths) resolves to
 * `null`.
 */
export function resolvePublicCmsMediaUrl(
  url: unknown,
  cmsBaseUrl: string | null | undefined,
): string | null {
  if (typeof url !== "string") {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return null;
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    const absolute = parseSafeHttpUrl(trimmed);
    if (!absolute) {
      return null;
    }

    if (isVercelBlobPublicMediaUrl(absolute)) {
      return absolute;
    }

    const base = parseSafeHttpUrl(cmsBaseUrl ?? null);
    if (!base) {
      return null;
    }

    return isCmsMediaFileUrl(absolute, base) ? absolute : null;
  }

  if (!trimmed.startsWith("/")) {
    return null;
  }

  const base = parseSafeHttpUrl(cmsBaseUrl ?? null);
  if (!base) {
    return null;
  }

  try {
    const resolved = new URL(trimmed, base);
    if (!SAFE_IMAGE_PROTOCOLS.has(resolved.protocol)) {
      return null;
    }
    // Site-relative inputs must remain on the CMS media route after URL
    // joining (closes `/\evil.example.org/...` host-escape via backslash
    // normalization and keeps the resolver aligned with `next/image`).
    return isCmsMediaFileUrl(resolved.toString(), base)
      ? resolved.toString()
      : null;
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

function isCmsMediaFileUrl(url: string, cmsBaseUrl: string): boolean {
  const parsed = new URL(url);
  const base = new URL(cmsBaseUrl);

  return (
    parsed.origin === base.origin &&
    parsed.pathname.startsWith(CMS_MEDIA_FILE_PATH_PREFIX)
  );
}

/**
 * True when `url` is an https URL on a Vercel Blob public store host
 * (`<storeId>.public.blob.vercel-storage.com`). Store id is a single DNS
 * label (no extra dots), matching the adapter's token-derived base URL.
 */
export function isVercelBlobPublicMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    if (!hostname.endsWith(VERCEL_BLOB_PUBLIC_HOST_SUFFIX)) {
      return false;
    }

    const storeId = hostname.slice(
      0,
      hostname.length - VERCEL_BLOB_PUBLIC_HOST_SUFFIX.length,
    );
    return /^[a-z0-9]+$/.test(storeId);
  } catch {
    return false;
  }
}

function readPositiveDimension(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const rounded = Math.round(value);
  return rounded > 0 ? rounded : null;
}
