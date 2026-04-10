/**
 * Kill-switch for the Mission Control–native Pages slice in Payload Web Studio.
 * When disabled, `Pages` uses stock Payload list/edit views (rollback).
 *
 * Set `CMS_WEB_STUDIO_NATIVE_PAGES=false` to disable (default: enabled).
 */
export function isNativePagesWebStudioEnabled(): boolean {
  const raw = process.env.CMS_WEB_STUDIO_NATIVE_PAGES;
  if (raw === undefined || raw === "") {
    return true;
  }
  return raw !== "false" && raw !== "0";
}
