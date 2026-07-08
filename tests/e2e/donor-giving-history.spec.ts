import { expect, test } from "@playwright/test";

import { installDemoSessionInBrowser } from "./helpers/install-demo-session";

test.describe("Donor giving history (live query)", () => {
  test("resolves giving history UI after navigation", async ({ page }) => {
    const { ok, status } = await installDemoSessionInBrowser(page, "donor");

    expect(ok, `donor demo session failed with status ${status}`).toBeTruthy();

    await page.goto("/donor-dashboard/history", {
      waitUntil: "domcontentloaded",
      timeout: 120_000,
    });
    await page.waitForSelector(
      '[data-testid="giving-history-live"], [data-testid="giving-history-unlinked"]',
      { timeout: 90_000 },
    );
  });
});
