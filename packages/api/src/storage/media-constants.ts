export const MEDIA_BUCKET = "cms-media" as const;

export const MEDIA_MAX_BYTES = 15_728_640;

export const MEDIA_MAX_PIXELS = 25_000_000;

export const MEDIA_MAX_VARIANT_BYTES = 4 * 1024 * 1024;

export const MEDIA_MAX_CONCURRENT_TRANSFORMS = 1;

export const MEDIA_PURGE_DELAY_DAYS = 35;

export const MEDIA_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type MediaMimeType = (typeof MEDIA_ALLOWED_MIME_TYPES)[number];

export const MEDIA_VARIANT_NAMES = ["w320", "w960", "w1600"] as const;

export type MediaVariantName = (typeof MEDIA_VARIANT_NAMES)[number];

export const MEDIA_VARIANT_WIDTHS: Readonly<Record<MediaVariantName, number>> =
  Object.freeze({
    w320: 320,
    w960: 960,
    w1600: 1600,
  });

export const MEDIA_VARIANT_DESCENDING_ORDER: readonly MediaVariantName[] =
  Object.freeze(["w1600", "w960", "w320"]);

export const MEDIA_STATUSES = [
  "uploading",
  "ready",
  "failed",
  "deleted",
] as const;

export type MediaStatus = (typeof MEDIA_STATUSES)[number];

export function isAllowedMediaMimeType(value: string): value is MediaMimeType {
  return (MEDIA_ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}

export function isMediaVariantName(value: string): value is MediaVariantName {
  return (MEDIA_VARIANT_NAMES as readonly string[]).includes(value);
}

export function buildMediaStagingKey(
  tenantId: string,
  assetId: string,
): string {
  return `tmp/${tenantId}/${assetId}`;
}

export function buildMediaMasterKey(
  tenantId: string,
  contentHash: string,
): string {
  return `${tenantId}/${contentHash}`;
}

export function buildMediaVariantKey(
  tenantId: string,
  contentHash: string,
  variant: MediaVariantName,
): string {
  return `${tenantId}/${contentHash}-${variant}`;
}

export function selectBoundedVariantWidths(
  sourceWidth: number,
): readonly MediaVariantName[] {
  const selected = MEDIA_VARIANT_NAMES.filter(
    (name) => MEDIA_VARIANT_WIDTHS[name] <= sourceWidth,
  );
  return selected.length > 0 ? selected : ["w320"];
}
