import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

// Exercise the built applications without a provider, bypass cookie, or live key.
assert.equal(process.env.E2E_AUTH_BYPASS, "false");
assert.equal(process.env.SKIP_ENV_VALIDATION, undefined);
assert.equal(process.env.SUPABASE_SERVICE_ROLE_KEY, undefined);
const browser = await chromium.launch({ args: ["--no-sandbox"] });
try {
  for (const [app, port] of [
    ["donor", 3005],
    ["admin", 3030],
    ["missionary", 4000],
  ]) {
    const base = `http://127.0.0.1:${port}`;
    const health = await fetch(`${base}/api/health`, {
      signal: AbortSignal.timeout(15_000),
    });
    assert.equal(
      health.status,
      503,
      `${app}: health reports unavailable full Supabase`,
    );
    const healthBody = await health.json();
    assert.equal(healthBody.status, "degraded");
    assert.equal(healthBody.observability.surface, app);
    const availability = await fetch(`${base}/api/auth/demo-account`, {
      signal: AbortSignal.timeout(15_000),
    });
    assert.equal(availability.status, 200, `${app}: availability`);
    const { availableRoles } = await availability.json();
    for (const role of ["admin", "donor", "missionary"]) {
      assert.equal(
        availableRoles?.[role],
        false,
        `${app}: ${role} demo unavailable`,
      );
    }
    assert.ok(
      availableRoles &&
        Object.values(availableRoles).every((value) => value === false),
      `${app}: demo roles must stay unavailable`,
    );
    const login = await fetch(`${base}/api/auth/demo-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "admin" }),
      signal: AbortSignal.timeout(15_000),
    });
    assert.equal(login.status, 403, `${app}: demo login must fail closed`);
    assert.equal((await login.json()).code, "DEMO_DISABLED");
    assert.equal(
      login.headers.get("set-cookie"),
      null,
      `${app}: no synthetic auth cookie`,
    );
    const protectedPath = app === "donor" ? "/donor-dashboard" : "/";
    const protectedResponse = await fetch(`${base}${protectedPath}`, {
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
    assert.ok(
      [302, 303, 307, 308].includes(protectedResponse.status),
      `${app}: protected route must redirect`,
    );
    assert.equal(
      new URL(protectedResponse.headers.get("location"), base).pathname,
      "/login",
    );
    const page = await browser.newPage();
    const response = await page.goto(`${base}/login`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    assert.ok(response?.ok(), `${app}: login document must render`);
    await page
      .locator('input[type="email"]')
      .first()
      .waitFor({ state: "visible", timeout: 30_000 });
    await page.close();
    console.log(
      `PASS ${app}: health, demo login denied, login page rendered in Chromium`,
    );
  }
} finally {
  await browser.close();
}
