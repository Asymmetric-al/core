const DEFAULT_DONOR_ORIGIN = "http://127.0.0.1:3000";

function stripTrailingSlash(origin: string) {
  return origin.replace(/\/$/, "");
}

/**
 * Client-safe donor origin for Web Studio (browser bundle).
 *
 * Precedence: `NEXT_PUBLIC_DONOR_URL` → default dev origin.
 * Do not read `DONOR_APP_URL` here; it is server-only and is not inlined for clients.
 */
export function resolveDonorPublicOrigin(): string {
  const fromPublic = process.env.NEXT_PUBLIC_DONOR_URL;
  if (fromPublic) {
    return stripTrailingSlash(fromPublic);
  }
  return DEFAULT_DONOR_ORIGIN;
}

/**
 * Donor app origin for server-side preview (Payload `GeneratePreviewURL`, etc.).
 *
 * Precedence (single source of truth): `NEXT_PUBLIC_DONOR_URL` → `DONOR_APP_URL` → default.
 * Matches public origin when `NEXT_PUBLIC_DONOR_URL` is set; otherwise falls back to
 * server-only `DONOR_APP_URL` so preview links work in CI/server without duplicating the public var.
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
