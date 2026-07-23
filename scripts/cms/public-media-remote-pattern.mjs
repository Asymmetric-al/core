/**
 * Derives the `next/image` remote patterns for public CMS media origins
 * (Phase 5 (Public Website Runtime Contract), ruling A12; issue #529).
 *
 * Public CMS media is uploaded through the admin app and served from the
 * Payload media file route (`/api/media/file/<filename>`) on the admin
 * origin; in hosted deployments the Payload Vercel Blob adapter stores the
 * bytes at `https://<store>.public.blob.vercel-storage.com` behind that same
 * route. The donor image optimizer must accept exactly those origins — and,
 * on the CMS origin, exactly the media file route: omitted `port`/`pathname`
 * imply `**` wildcards (Next.js `remotePatterns` docs), which would let the
 * optimizer proxy any path on the admin host.
 *
 * `search` is deliberately left open on the CMS pattern: with Payload access
 * control in front of Blob storage, the cloud-storage plugin appends
 * `?prefix=<...>` to media URLs (`@payloadcms/plugin-cloud-storage`
 * afterRead hook) while local-dev URLs carry no query at all, so a single
 * exact `search` match cannot admit both. The `pathname` scope bounds what
 * the optimizer will fetch to the media file route.
 *
 * The CMS-origin pattern is derived from the configured `CMS_BASE_URL` (the
 * same base the donor CMS client fetches JSON from); when it is missing, the
 * local-dev default matches `apps/donor/lib/cms/client.ts`. A base URL that
 * is not http(s) contributes no CMS pattern. The Blob public-host pattern is
 * always included so production Blob URLs optimize without a separate env.
 */

const LOCAL_DEV_CMS_BASE_URL = "http://127.0.0.1:3030";

/** The Payload media file route on the CMS origin — the only public media path. */
const CMS_MEDIA_FILE_PATHNAME = "/api/media/file/**";

/**
 * @typedef {{ protocol: "http" | "https", hostname: string, port: string, pathname?: string }} CmsImageRemotePattern
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

  if (parsed && (parsed.protocol === "http:" || parsed.protocol === "https:")) {
    patterns.push({
      protocol: parsed.protocol === "http:" ? "http" : "https",
      hostname: parsed.hostname,
      // `URL#port` is "" for default ports; an explicit empty string blocks
      // custom ports instead of the omitted-field `**` wildcard.
      port: parsed.port,
      pathname: CMS_MEDIA_FILE_PATHNAME,
    });
  }

  // Payload `@payloadcms/storage-vercel-blob` with `access: "public"` serves
  // media from `<storeId>.public.blob.vercel-storage.com`. Next.js remote
  // patterns accept `**` as a multi-label hostname wildcard (same shape as
  // the donor `**.supabase.co` entry). The store id is token-derived and not
  // available to the donor build, so the pathname stays unscoped here.
  patterns.push({
    protocol: "https",
    hostname: "**.public.blob.vercel-storage.com",
    port: "",
  });

  return patterns;
}
