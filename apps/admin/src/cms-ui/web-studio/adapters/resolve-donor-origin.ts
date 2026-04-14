const DEFAULT_DONOR_ORIGIN = "http://127.0.0.1:3000";

function stripTrailingSlash(origin: string) {
  return origin.replace(/\/$/, "");
}

/**
 * Donor app origin for Web Studio preview (Payload `GeneratePreviewURL`, native live preview, etc.).
 *
 * Precedence: `NEXT_PUBLIC_DONOR_URL` → `DONOR_APP_URL` → dev default.
 */
export function resolveDonorOrigin(): string {
  const fromPublic = process.env.NEXT_PUBLIC_DONOR_URL;
  if (fromPublic) {
    return stripTrailingSlash(fromPublic);
  }
  const fromServer = process.env.DONOR_APP_URL;
  if (fromServer) {
    return stripTrailingSlash(fromServer);
  }
  return DEFAULT_DONOR_ORIGIN;
}
