import { expect, test } from "@playwright/test";

import { parseTenantAddress } from "../../../packages/auth/tenant-address";

import {
  assertNoErrorBanner,
  assertNoVisibleLoginPrompt,
  collectFailureEvidence,
  ensureAuthenticated,
} from "./helpers";

/**
 * Headless missionary smoke flow against the development deployment.
 * Read-only navigation; no forms submitted, no data mutated.
 *
 * Project: development-missionary (see playwright.development-smoke.config.ts).
 *
 * Signed-in pages live under the tenant in the page address (plan 5.2;
 * AL-2675). This is the one suite that runs against a hosted deployment, so
 * it also carries the hosted proof of record D-19 (council round 1, A4 and
 * A16): a tenant page renders with its document scope, no response carries
 * the proxy's rewrite marker or its request-header overrides, and a tenant
 * address whose inner path names another host is refused.
 */

/** Response headers only the proxy's internals may carry; none reaches a browser. */
const INTERNAL_HEADERS =
  /^(x-asym-tenant-rewrite|x-middleware-request-|x-middleware-override-headers)/i;

test.describe("development-missionary smoke", () => {
  test.afterEach(async ({ page }, testInfo) => {
    await collectFailureEvidence(page, testInfo);
  });

  test("missionary lands on dashboard with workspace content + /donors loads", async ({
    page,
  }) => {
    const leaked: string[] = [];
    page.on("response", (response) => {
      for (const name of Object.keys(response.headers())) {
        if (INTERNAL_HEADERS.test(name)) {
          leaked.push(`${name} on ${new URL(response.url()).pathname}`);
        }
      }
    });

    // Positive auth marker: the missionary workspace heading. The dashboard
    // can flick to its address then bounce back to `/login` on a cold
    // session, so URL-only confirmation isn't enough: wait for the heading.
    await ensureAuthenticated(page, {
      authenticatedMarker: (page) =>
        page.getByRole("heading", { name: /^welcome back(?:, .+)?$/i }),
    });

    // The person's one organization's home: `/<tenant>`.
    const home = parseTenantAddress(new URL(page.url()).pathname);
    expect(home, page.url()).not.toBeNull();
    expect(home!.innerPathname).toBe("/");
    const prefix = home!.prefix;
    await expect(page).toHaveTitle(/dashboard/i);
    await assertNoVisibleLoginPrompt(page);
    // Rendered with its document scope, for the tenant its address names.
    await expect(page.locator("[data-tenant-scope]")).toHaveCount(1);
    await expect(page.locator("[data-tenant-scope]")).toHaveAttribute(
      "data-tenant-scope",
      prefix,
    );

    await expect(
      page.getByRole("heading", { name: /^welcome back(?:, .+)?$/i }).first(),
    ).toBeVisible();

    const missionaryContent = page
      .getByRole("heading", {
        name: /^monthly support$|^giving by month$/i,
      })
      .first();
    await expect(missionaryContent).toBeVisible();

    await assertNoErrorBanner(page);

    // Read-only nav probe: Partners — proven stable in manual smoke. The bare
    // address lands on the same organization's.
    await page.goto("/donors");
    await page.waitForLoadState("domcontentloaded");

    await expect(page).toHaveURL((url) => url.pathname === `${prefix}/donors`);
    await expect(page).toHaveTitle(/partners/i);
    await expect(page.locator("[data-tenant-scope]")).toHaveAttribute(
      "data-tenant-scope",
      prefix,
    );

    const partnersHeading = page.getByRole("heading", { name: /partners/i });
    const emptyState = page.getByText(/no partners found/i);
    expect(
      (await partnersHeading.count()) + (await emptyState.count()),
    ).toBeGreaterThan(0);

    await assertNoErrorBanner(page);

    // A tenant address whose inner path names another host is refused, or
    // redirected on this origin; never fetched from that host. `.invalid`
    // never resolves, so even a fault would reach no one.
    const origin = new URL(page.url()).origin;
    const crossing = await page.request.get(
      `${origin}${prefix}//example.invalid/latest/meta-data`,
      { maxRedirects: 0 },
    );
    const location = crossing.headers()["location"];
    if (location) {
      expect(crossing.status()).toBeGreaterThanOrEqual(300);
      expect(crossing.status()).toBeLessThan(400);
      expect(new URL(location, origin).origin).toBe(origin);
    } else {
      expect(crossing.status()).toBe(404);
    }

    expect(leaked).toEqual([]);
  });
});
