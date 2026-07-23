/**
 * Derives the `next/image` remote patterns for public CMS media origins
 * (Phase 5 (Public Website Runtime Contract), ruling A12; issue #529).
 *
 * Public CMS media is uploaded through the admin app. In local/dev without
 * Blob it is served from the admin origin; in hosted deployments the Payload
 * Vercel Blob adapter stores files at
 * `https://<store>.public.blob.vercel-storage.com`. The donor image optimizer
 * must accept exactly those origins — and nothing else.
 *
 * The CMS-origin pattern is derived from the configured `CMS_BASE_URL` (the
 * same base the donor CMS client fetches JSON from); when it is missing, the
 * local-dev default matches `apps/donor/lib/cms/client.ts`. A base URL that
 * is not http(s) contributes no CMS pattern. The Blob public-host pattern is
 * always included so production Blob URLs optimize without a separate env.
 */

const LOCAL_DEV_CMS_BASE_URL = "http://127.0.0.1:3030";

/**
 * @typedef {{ protocol: "http" | "https", hostname: string, port?: string }} CmsImageRemotePattern
 */

/**
 * @param {string | null | undefined} cmsBaseUrl
 * @returns {CmsImageRemotePattern[]}
 */
export function buildPublicCmsImageRemotePatterns(cmsBaseUrl) {
  /** @type {CmsImageRemotePattern[]} */
  const patterns = [];

  const base = cmsBaseUrl?.trim() || LOCAL_DEV_CMS_BASE_URL;

  let parsed;
  try {
    parsed = new URL(base);
  } catch {
    parsed = null;
  }

  if (
    parsed &&
    (parsed.protocol === "http:" || parsed.protocol === "https:")
  ) {
    /** @type {CmsImageRemotePattern} */
    const cmsPattern = {
      protocol: parsed.protocol === "http:" ? "http" : "https",
      hostname: parsed.hostname,
    };

    if (parsed.port) {
      cmsPattern.port = parsed.port;
    }

    patterns.push(cmsPattern);
  }

  // Payload `@payloadcms/storage-vercel-blob` with `access: "public"` serves
  // media from `<storeId>.public.blob.vercel-storage.com`. Next.js remote
  // patterns accept `**` as a multi-label hostname wildcard (same shape as
  // the donor `**.supabase.co` entry).
  patterns.push({
    protocol: "https",
    hostname: "**.public.blob.vercel-storage.com",
  });

  return patterns;
}
