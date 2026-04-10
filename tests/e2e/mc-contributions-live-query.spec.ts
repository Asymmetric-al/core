import { test } from "@playwright/test";

test.describe("Mission Control contributions live query", () => {
  test("resolves the contributions table shell", async ({ page }) => {
    await page.goto("/contributions", {
      waitUntil: "domcontentloaded",
      timeout: 120_000,
    });

    await page.waitForSelector('[data-testid="mc-contributions-live"]', {
      timeout: 90_000,
    });
  });
});
