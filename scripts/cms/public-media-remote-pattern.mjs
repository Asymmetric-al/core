/**
 * Derives the `next/image` remote pattern for the CMS media origin (Phase 5
 * (Public Website Runtime Contract), ruling A12; issue #529).
 *
 * Public CMS media is uploaded to and served by the admin app, so the donor
 * app's image optimizer must accept exactly that origin — and nothing else.
 * The pattern is derived from the configured `CMS_BASE_URL` (the same base
 * the donor CMS client fetches JSON from); when it is missing, the local-dev
 * default matches `apps/donor/lib/cms/client.ts`. A base URL that is not
 * http(s) yields no pattern at all (fail-safe: the optimizer proxies nothing
 * from unknown origins).
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
  const base = cmsBaseUrl?.trim() || LOCAL_DEV_CMS_BASE_URL;

  let parsed;
  try {
    parsed = new URL(base);
  } catch {
    return [];
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return [];
  }

  /** @type {CmsImageRemotePattern} */
  const pattern = {
    protocol: parsed.protocol === "http:" ? "http" : "https",
    hostname: parsed.hostname,
  };

  if (parsed.port) {
    pattern.port = parsed.port;
  }

  return [pattern];
}
