const donorPort = Number(process.env.PLAYWRIGHT_PORT || 3005);
const adminPort = Number(process.env.PLAYWRIGHT_ADMIN_PORT || 3030);

/** Donor app (default Playwright baseURL for most projects). */
export const donorBaseURL =
  process.env.PLAYWRIGHT_DONOR_URL ??
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://localhost:${donorPort}`;

/** Admin app (Mission Control); used by chromium-admin project only. */
export const adminBaseURL =
  process.env.PLAYWRIGHT_ADMIN_URL ??
  process.env.PLAYWRIGHT_ADMIN_BASE_URL ??
  `http://localhost:${adminPort}`;

/**
 * Next dev responds to `/_next/static/` with redirects (308) in some setups,
 * and page routes can trigger cold compiles after CI has already started the
 * app. The health endpoint is the same readiness signal CI waits on directly.
 */
export function nextDevReadyURL(base: string): string {
  return `${base.replace(/\/$/, "")}/api/health`;
}
