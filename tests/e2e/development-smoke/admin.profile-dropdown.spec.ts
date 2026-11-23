import { expect, test } from "@playwright/test";

import {
  assertNoErrorBanner,
  assertNoVisibleLoginPrompt,
  collectFailureEvidence,
  ensureAuthenticated,
} from "./helpers";
import { parseTenantAddress } from "../../../packages/auth/tenant-address";

/**
 * Headless check of the Mission Control profile menu on the development
 * deployment: the old template items stay gone and Administration lands on
 * /admin.
 *
 * Project: development-admin (see playwright.development-smoke.config.ts).
 *
 * Signed-in pages live under the tenant in the page address (plan 5.2;
 * AL-2675). Mission Control is its own deployment, with its own proxy, so
 * this flow carries the same hosted proof of record D-19 as the missionary
 * workspace's (council round 2, AR8): a tenant page renders with its
 * document scope, no response carries the proxy's rewrite marker or its
 * request-header overrides, and a tenant address whose inner path names
 * another host is refused.
 *
 * The account. One QA account signs in to all three apps
 * (`.github/workflows/qa-smoke-preview-deploy.yml`, `QA_TEST_EMAIL`), and
 * each app lands a person by the live rows of its own class. The account
 * must hold exactly one live row of each class: one staff row (any
 * sub-role) for Mission Control, one missionary row and one donor row. With
 * two rows of a class, in one tenant or in several, that app sends it to the
 * organization chooser, and its smoke fails at the first check; with none,
 * to /no-access. This cannot be checked from here.
 */

/** Response headers only the proxy's internals may carry; none reaches a browser. */
const INTERNAL_HEADERS =
  /^(x-asym-tenant-rewrite|x-middleware-request-|x-middleware-override-headers)/i;

test.describe("development-admin profile dropdown", () => {
  test.afterEach(async ({ page }, testInfo) => {
    await collectFailureEvidence(page, testInfo);
  });

  test("profile dropdown shows only the corrected item set and Administration lands on /admin", async ({
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

    // Authenticated marker on admin: the Mission Control header always renders
    // the "Open profile menu" button once the shell hydrates.
    await ensureAuthenticated(page, {
      authenticatedMarker: (p) =>
        p.getByRole("button", { name: /open profile menu/i }),
    });

    // The person's one organization: `/<tenant>`, with no sub-role for one
    // staff row.
    const home = parseTenantAddress(new URL(page.url()).pathname);
    expect(home, page.url()).not.toBeNull();
    const prefix = home!.prefix;
    await expect(page).toHaveTitle(/Mission Control/i);
    await assertNoVisibleLoginPrompt(page);
    // Rendered with its document scope, for the tenant its address names.
    await expect(page.locator("[data-tenant-scope]")).toHaveCount(1);
    await expect(page.locator("[data-tenant-scope]")).toHaveAttribute(
      "data-tenant-scope",
      prefix,
    );

    const profileButton = page.getByRole("button", {
      name: /open profile menu/i,
    });
    await profileButton.click();

    // Items from the original menu template must be absent.
    for (const oldLabel of [
      "My account",
      "Settings",
      "Customization",
      "Add team account",
    ]) {
      await expect(
        page.getByRole("menuitem", { name: new RegExp(`^${oldLabel}$`, "i") }),
      ).toHaveCount(0);
    }

    const administration = page.getByRole("menuitem", {
      name: /^administration$/i,
    });
    const staffDirectory = page.getByRole("menuitem", {
      name: /^members$/i,
    });
    const about = page.getByRole("menuitem", { name: /^about$/i });
    const logout = page.getByRole("menuitem", { name: /^sign out$/i });

    await expect(administration).toBeVisible();
    await expect(staffDirectory).toBeVisible();
    await expect(about).toBeVisible();
    await expect(logout).toBeVisible();

    // Under the tenant prefix: a link without it would leave the document's
    // scope.
    await expect(administration).toHaveAttribute("href", `${prefix}/admin`);
    await expect(staffDirectory).toHaveAttribute(
      "href",
      `${prefix}/admin/teams`,
    );

    await administration.click();
    await page.waitForURL((url) => url.pathname === `${prefix}/admin`);
    await expect(page.locator("[data-tenant-scope]")).toHaveAttribute(
      "data-tenant-scope",
      prefix,
    );

    await expect(
      page.getByRole("heading", { name: /^administration$/i }),
    ).toBeVisible();
    await expect(page.getByText(/people and access/i)).toBeVisible();

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
