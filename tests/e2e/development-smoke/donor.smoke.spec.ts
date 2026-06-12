import { expect, test } from "@playwright/test";

import {
  assertNoErrorBanner,
  assertNoVisibleLoginPrompt,
  collectFailureEvidence,
  ensureAuthenticated,
} from "./helpers";

/**
 * Headless donor smoke flow against the development deployment.
 * Read-only navigation; no forms submitted, no data mutated.
 *
 * Project: development-donor (see playwright.development-smoke.config.ts).
 *
 * The donor app's `/` is a public marketing landing; the authenticated donor
 * surface lives at `/donor-dashboard`. We `ensureAuthenticated` first
 * (handles the login flow if needed) then drive the dashboard directly.
 */

test.describe("development-donor smoke", () => {
  test.afterEach(async ({ page }, testInfo) => {
    await collectFailureEvidence(page, testInfo);
  });

  test("donor lands on /donor-dashboard with greeting + giving summary + updates", async ({
    page,
  }) => {
    // Donor `/` is the public marketing page; drive auth via the protected
    // dashboard path so the /login redirect (with ?next=/donor-dashboard)
    // fires reliably. Positive auth marker: the dashboard greeting.
    await ensureAuthenticated(page, {
      targetPath: "/donor-dashboard",
      authenticatedMarker: (p) =>
        p.getByText(/^(good (morning|afternoon|evening)),/i),
    });

    await expect(page).toHaveURL(/\/donor-dashboard(\/|$)/);
    await assertNoVisibleLoginPrompt(page);

    // Greeting visible. The dev user has no display name; the app falls back
    // to the role label "Partner" in the greeting.
    await expect(
      page.getByText(/^(good (morning|afternoon|evening)),/i).first(),
    ).toBeVisible();

    // Giving summary content: at least one of YTD giving, recurring giving,
    // or giving total should be visible.
    const givingSummary = page
      .getByText(/total given ytd|active support|recurring|impact/i)
      .first();
    await expect(givingSummary).toBeVisible();

    // At least one field update / ministry update area.
    const updates = page.getByText(/field update|ministry updates/i).first();
    await expect(updates).toBeVisible();

    await assertNoErrorBanner(page);

    // Optional read-only nav probe: Giving History.
    const history = page.getByRole("link", {
      name: /donation history|giving history/i,
    });
    if (await history.count()) {
      await history.first().click();
      await page.waitForURL(/\/donor-dashboard\/history(\/|$)/, {
        timeout: 30_000,
      });
      await expect(
        page.getByRole("heading", { name: /giving history/i }),
      ).toBeVisible();
      await assertNoErrorBanner(page);
    }
  });
});
