import { expect, test } from "@playwright/test";

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
 */

test.describe("development-missionary smoke", () => {
  test.afterEach(async ({ page }, testInfo) => {
    await collectFailureEvidence(page, testInfo);
  });

  test("missionary lands on dashboard with workspace content + /donors loads", async ({
    page,
  }) => {
    // Positive auth marker: the missionary workspace heading. The dashboard
    // can flick to `/` then bounce back to `/login` on a cold session, so
    // URL-only confirmation isn't enough — wait for the heading to render.
    await ensureAuthenticated(page, {
      authenticatedMarker: (p) =>
        p.getByRole("heading", { name: /dashboard/i }),
    });

    // Dashboard is the missionary landing at `/`.
    await expect(page).toHaveURL(/\/$/);
    await expect(page).toHaveTitle(/dashboard/i);
    await assertNoVisibleLoginPrompt(page);

    // Main heading.
    await expect(
      page.getByRole("heading", { name: /dashboard/i }).first(),
    ).toBeVisible();

    // At least one missionary-relevant content area. Match any of the proven
    // surfaces: support progress, donor/partner info, recent giving, tasks,
    // ministry updates.
    const missionaryContent = page
      .getByText(
        /monthly support goal|giving breakdown|tasks (?:&|and) alerts|latest updates|ministry updates|partners|active donors/i,
      )
      .first();
    await expect(missionaryContent).toBeVisible();

    await assertNoErrorBanner(page);

    // Read-only nav probe: Partners (/donors) — proven stable in manual smoke.
    await page.goto("/donors");
    await page.waitForLoadState("domcontentloaded");

    await expect(page).toHaveURL(/\/donors(\/|$)/);
    await expect(page).toHaveTitle(/partners/i);

    // Heading or empty-state UI.
    const partnersHeading = page.getByRole("heading", { name: /partners/i });
    const emptyState = page.getByText(/no partners found/i);
    expect(
      (await partnersHeading.count()) + (await emptyState.count()),
    ).toBeGreaterThan(0);

    await assertNoErrorBanner(page);
  });
});
