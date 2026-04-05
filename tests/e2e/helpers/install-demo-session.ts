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
 * Install demo auth using a same-origin browser fetch with credentials.
 * APIRequestContext POST does not attach Set-Cookie to the browser — this does.
 */
export async function installDemoSessionInBrowser(
  page: Page,
  role: DemoAccountRole,
): Promise<{ ok: boolean; status: number }> {
  await page.goto("/");
  return page.evaluate(async (r) => {
    const res = await fetch("/api/auth/demo-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: r }),
      credentials: "include",
    });
    return { ok: res.ok, status: res.status };
  }, role);
}
