const DEFAULT_DONOR_ORIGIN = "http://127.0.0.1:3000";

/**
 * Donor app origin for CMS preview / “Open site” links from Mission Control Web Studio.
 *
 * Resolution order (keep in sync everywhere):
 * 1. `NEXT_PUBLIC_DONOR_URL` — available in the browser bundle for client components.
 * 2. `DONOR_APP_URL` — server-only; use for `GeneratePreviewURL` and server contexts
 *    (declared in `packages/env` for validation when set).
 */
export function resolveDonorOrigin(): string {
  const fromPublic = process.env.NEXT_PUBLIC_DONOR_URL;
  if (fromPublic) {
    return fromPublic.replace(/\/$/, "");
  }
  const fromServer = process.env.DONOR_APP_URL;
  if (fromServer) {
    return fromServer.replace(/\/$/, "");
  }
  return DEFAULT_DONOR_ORIGIN;
}
