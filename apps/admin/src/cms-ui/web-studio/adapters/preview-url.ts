import type { GeneratePreviewURL } from "payload";

const DEFAULT_DONOR_ORIGIN = "http://127.0.0.1:3000";

function normalizeSlugPath(slug: string) {
  const trimmed = slug.trim();
  if (!trimmed || trimmed === "home") {
    return "";
  }
  return trimmed
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

/**
 * Resolves the public donor URL for a published CMS page slug (matches `[...cmsSlug]` routing).
 */
export function buildDonorPreviewPathForPageSlug(slug: string): string {
  const path = normalizeSlugPath(slug);
  return path ? `/${path}` : "/";
}

function resolveDonorOrigin(): string {
  if (process.env.NEXT_PUBLIC_DONOR_URL) {
    return process.env.NEXT_PUBLIC_DONOR_URL.replace(/\/$/, "");
  }
  if (process.env.DONOR_APP_URL) {
    return process.env.DONOR_APP_URL.replace(/\/$/, "");
  }
  return DEFAULT_DONOR_ORIGIN;
}

/**
 * Payload `admin.preview` handler for the Pages collection.
 * Opens the donor-facing published page route (drafts are not previewed here in Phase 1).
 */
export const pagesGeneratePreviewURL: GeneratePreviewURL = (doc) => {
  const slug = typeof doc.slug === "string" ? doc.slug : "";
  const path = buildDonorPreviewPathForPageSlug(slug);
  const origin = resolveDonorOrigin();
  return `${origin}${path}`;
};
