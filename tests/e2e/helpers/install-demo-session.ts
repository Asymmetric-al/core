import type { Page } from "@playwright/test";

/**
 * Demo roles accepted by POST /api/auth/demo-account.
 * Keeps call sites aligned with the API without importing app code.
 */
export type DemoAccountRole =
  | "admin"
  | "donor"
  | "missionary"
  | "delivery"
  | "ticketing"
  | "machinery";

/**
 * Install demo auth for the Playwright browser context.
 *
 * Uses `page.request` (same `APIRequestContext` / cookie jar as `page`) so
 * `Set-Cookie` from POST `/api/auth/demo-account` applies to subsequent
 * `page.goto` — unlike `fetch` inside `page.evaluate`, which can diverge from
 * `page.request` for host aliases (e.g. `127.0.0.1` vs `localhost`).
 */
export async function installDemoSessionInBrowser(
  page: Page,
  role: DemoAccountRole,
  baseURL?: string,
): Promise<{ ok: boolean; status: number }> {
  const url = baseURL
    ? new URL("/api/auth/demo-account", baseURL).toString()
    : "/api/auth/demo-account";
  const res = await page.request.post(url, {
    data: JSON.stringify({ role }),
    headers: { "Content-Type": "application/json" },
  });
  return { ok: res.ok(), status: res.status() };
}
