import { test } from "@playwright/test";

test.describe("Donor giving history (live query)", () => {
  test("resolves giving history UI after navigation", async ({ page }) => {
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
