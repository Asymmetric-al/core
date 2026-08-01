import type { PublicRequestContext } from "./context";

/**
 * The tenant/document-derived cache-tag scheme (Phase 5 (Public Website
 * Runtime Contract), ruling A9; ADR-0030).
 *
 * Tags are for INVALIDATION ONLY — they never isolate cache entries.
 * Cache-key isolation comes from passing the resolved tenant as a function
 * argument to every `use cache` read (#525 applies the runtime). Tags respect
 * the platform limits: no commas, bounded length via stable ids, consistent
 * lowercase casing.
 */

/**
 * Name of the bounded `cacheLife` profile for published public reads. The
 * profile is a bounded expiry (about an hour — never "never"): the
 * self-healing backstop for a missed admin→public invalidation signal.
 */
export const PUBLIC_CONTENT_CACHE_LIFE_PROFILE = "public-content";

/** Vercel limit: a tag must stay within 256 BYTES; keep well under it. */
export const PUBLIC_CACHE_TAG_MAX_BYTES = 256;

const TAG_PREFIX = "public-cms";
const SEGMENT_MAX_LENGTH = 64;

/**
 * Normalizes one tag segment: lowercase, bounded, and reduced to
 * `[a-z0-9_-]` — anything else (commas, whitespace, and critically `:`, the
 * scheme's own structural delimiter) collapses to `-`, so no input can forge
 * another builder's tag structure. Stable ids (not long slugs) should be the
 * inputs; this is a guard, not an encoder.
 */
export function sanitizeCacheTagSegment(value: string | number): string {
  const normalized = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-");

  return normalized.slice(0, SEGMENT_MAX_LENGTH);
}

/** Every cached public read for the tenant (broadest invalidation handle). */
export function publicTenantCacheTag(context: PublicRequestContext): string {
  return `${TAG_PREFIX}:tenant:${sanitizeCacheTagSegment(context.cmsTenantId)}`;
}

/** Every cached read of one collection for the tenant (lists, navigation). */
export function publicCollectionCacheTag(
  context: PublicRequestContext,
  collection: string,
): string {
  return `${publicTenantCacheTag(context)}:collection:${sanitizeCacheTagSegment(collection)}`;
}

/** One document's cached reads for the tenant (detail pages). */
export function publicDocumentCacheTag(
  context: PublicRequestContext,
  collection: string,
  documentId: string | number,
): string {
  return `${publicCollectionCacheTag(context, collection)}:doc:${sanitizeCacheTagSegment(documentId)}`;
}

/**
 * Reserved Phase 2 dimension: per-site invalidation. Returns `null` until
 * Phase 2 populates `siteId` on the context (#479/#482/#485).
 */
export function publicSiteCacheTag(
  context: PublicRequestContext,
): string | null {
  if (!context.siteId) {
    return null;
  }

  return `${TAG_PREFIX}:site:${sanitizeCacheTagSegment(context.siteId)}`;
}

/**
 * Reserved Phase 2 dimension: per-locale invalidation. Returns `null` until
 * locale values ship (#483).
 */
export function publicLocaleCacheTag(locale: string | null): string | null {
  if (!locale) {
    return null;
  }

  return `${TAG_PREFIX}:locale:${sanitizeCacheTagSegment(locale)}`;
}

export type PublishedReadCacheTagInput = {
  context: PublicRequestContext;
  collection: string;
  /** Omit for list reads; provide for document/detail reads. */
  documentId?: string | number;
  /** Reserved Phase 2 locale dimension. */
  locale?: string | null;
};

/**
 * The full tag set to attach to one published read: tenant + collection
 * (+ document, + reserved site/locale when present). The publish-invalidation
 * signal (#525) revalidates by these same builders, so emitter and reader can
 * never drift.
 */
export function buildPublishedReadCacheTags(
  input: PublishedReadCacheTagInput,
): string[] {
  const { context, collection, documentId, locale } = input;

  const tags: string[] = [
    publicTenantCacheTag(context),
    publicCollectionCacheTag(context, collection),
  ];

  if (documentId !== undefined) {
    tags.push(publicDocumentCacheTag(context, collection, documentId));
  }

  const siteTag = publicSiteCacheTag(context);
  if (siteTag !== null) {
    tags.push(siteTag);
  }

  const localeTag = publicLocaleCacheTag(locale ?? null);
  if (localeTag !== null) {
    tags.push(localeTag);
  }

  return tags;
}

/** Structural validity check used by tests and the invalidation endpoint. */
export function isValidPublicCacheTag(tag: string): boolean {
  const byteLength = new TextEncoder().encode(tag).length;
  if (byteLength === 0 || byteLength > PUBLIC_CACHE_TAG_MAX_BYTES) {
    return false;
  }

  if (!tag.startsWith(`${TAG_PREFIX}:`)) {
    return false;
  }

  // Every segment between the `:` delimiters must be non-empty sanitized
  // output — this is what makes delimiter forgery structurally impossible.
  const segments = tag.split(":");
  return segments.every((segment) => /^[a-z0-9_-]+$/.test(segment));
}
