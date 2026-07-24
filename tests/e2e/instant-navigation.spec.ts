import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

/**
 * Instant Navigation guardrail (Next.js 16.3, `cacheComponents` +
 * `partialPrefetching`). Asserts the `/workers` route shell renders without
 * waiting for the network, per docs/ai/rules/frontend.md.
 */
test.describe("Instant navigation (donor public site)", () => {
  test("navbar navigation to /workers renders the route shell instantly", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#__next_error__")).toHaveCount(0);

    const mobileMenuTrigger = page.getByRole("button", { name: "Open menu" });
    if (await mobileMenuTrigger.isVisible()) {
      await mobileMenuTrigger.click();
    }

    await instant(page, async () => {
      await page
        .locator('a[href="/workers"]')
        .filter({ visible: true })
        .first()
        .click();

      await expect(
        page.getByRole("heading", { level: 1, name: /field/i }),
      ).toBeVisible();
    });
  });
});
