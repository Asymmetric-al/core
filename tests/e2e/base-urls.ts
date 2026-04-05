/** Donor app (default Playwright baseURL for most projects). */
export const donorBaseURL =
  process.env.PLAYWRIGHT_DONOR_URL ??
  process.env.PLAYWRIGHT_BASE_URL ??
  "http://127.0.0.1:3000";

/** Admin app (Mission Control); used by chromium-admin project only. */
export const adminBaseURL =
  process.env.PLAYWRIGHT_ADMIN_URL ?? "http://127.0.0.1:3030";

export function nextDevReadyURL(base: string): string {
  return `${base.replace(/\/$/, "")}/_next/static/`;
}
