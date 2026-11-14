import {
  DEMO_PROFILE_ID,
  DEMO_TENANT_ID,
} from "../../../packages/auth/constants";

import type { Page } from "@playwright/test";

/**
 * Demo roles accepted by POST /api/auth/demo-account.
 * Keeps call sites aligned with the API without importing app code.
 */
export type DemoAccountRole =
  "admin" | "donor" | "missionary" | "delivery" | "ticketing" | "machinery";

async function installHermeticDonorClientIdentity(page: Page, origin: string) {
  const userId = "e2e-donor-user";
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const user = {
    id: userId,
    aud: "authenticated",
    role: "authenticated",
    email: "hermetic-donor@example.test",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    created_at: "2026-11-11T00:00:00.000Z",
  };
  const accessToken = [
    { alg: "HS256", typ: "JWT" },
    {
      sub: userId,
      exp: expiresAt,
      aud: "authenticated",
      role: "authenticated",
    },
  ]
    .map((part) => Buffer.from(JSON.stringify(part)).toString("base64url"))
    .concat("hermetic-not-a-real-signature")
    .join(".");
  const session = {
    access_token: accessToken,
    refresh_token: "hermetic-not-a-real-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: expiresAt,
    user,
  };
  const headers = { "access-control-allow-origin": origin };
  await page.route(
    "https://example.supabase.co/auth/v1/user",
    async (route) => {
      if (route.request().method() !== "GET") return route.abort();
      await route.fulfill({ json: user, headers });
    },
  );
  await page.route(
    "https://example.supabase.co/rest/v1/profiles?*",
    async (route) => {
      const request = route.request();
      const requestedUser = new URL(request.url()).searchParams.get("user_id");
      if (request.method() !== "GET" || requestedUser !== "eq." + userId) {
        return route.abort();
      }
      await route.fulfill({
        json: {
          id: DEMO_PROFILE_ID,
          user_id: userId,
          tenant_id: DEMO_TENANT_ID,
          role: "donor",
        },
        headers,
      });
    },
  );
  await page.context().addCookies([
    {
      name: "sb-example-auth-token",
      value:
        "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url"),
      url: origin + "/",
      httpOnly: false,
      secure: origin.startsWith("https:"),
      sameSite: "Lax",
    },
  ]);
}

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
  if (
    res.ok() &&
    role === "donor" &&
    process.env.ASYM_E2E_REQUIRE_HERMETIC_SUPABASE === "1" &&
    process.env.E2E_AUTH_BYPASS === "true" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL === "https://example.supabase.co"
  ) {
    const appURL = new URL(res.url());
    const payload = (await res.json().catch(() => null)) as {
      ok?: boolean;
      role?: string;
      bypass?: boolean;
    } | null;
    if (
      ["http:", "https:"].includes(appURL.protocol) &&
      ["localhost", "127.0.0.1", "[::1]"].includes(appURL.hostname) &&
      !appURL.username &&
      !appURL.password &&
      payload?.ok === true &&
      payload.role === role &&
      payload.bypass === true
    ) {
      await installHermeticDonorClientIdentity(page, appURL.origin);
    }
  }
  return { ok: res.ok(), status: res.status() };
}
