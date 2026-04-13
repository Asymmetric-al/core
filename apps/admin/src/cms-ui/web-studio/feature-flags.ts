function isFlagEnabled(rawValue: string | undefined): boolean {
  if (rawValue === undefined || rawValue === "") {
    return true;
  }

  return rawValue !== "false" && rawValue !== "0";
}

/**
 * Kill-switch for the Mission Control–native Pages slice in Payload Web Studio.
 * When disabled, `Pages` uses stock Payload list/edit views (rollback).
 */
export function isNativePagesWebStudioEnabled(): boolean {
  return isFlagEnabled(process.env.CMS_WEB_STUDIO_NATIVE_PAGES);
}

/**
 * Collection-level rollout flags for additional Web Studio native slices.
 * Default to enabled so the native UI is opt-out per collection.
 */
export function isNativeCollectionWebStudioEnabled(
  collectionSlug:
    | "media"
    | "missionary-giving-pages"
    | "missionary-profiles"
    | "ministry-updates"
    | "navigation"
    | "page-templates"
    | "pages"
    | "project-pages",
): boolean {
  const envMap = {
    media: process.env.CMS_WEB_STUDIO_NATIVE_MEDIA,
    "missionary-giving-pages":
      process.env.CMS_WEB_STUDIO_NATIVE_MISSIONARY_GIVING_PAGES,
    "missionary-profiles":
      process.env.CMS_WEB_STUDIO_NATIVE_MISSIONARY_PROFILES,
    "ministry-updates": process.env.CMS_WEB_STUDIO_NATIVE_MINISTRY_UPDATES,
    navigation: process.env.CMS_WEB_STUDIO_NATIVE_NAVIGATION,
    pages: process.env.CMS_WEB_STUDIO_NATIVE_PAGES,
    "project-pages": process.env.CMS_WEB_STUDIO_NATIVE_PROJECT_PAGES,
    "page-templates": process.env.CMS_WEB_STUDIO_NATIVE_PAGE_TEMPLATES,
  } as const;

  return isFlagEnabled(envMap[collectionSlug]);
}
