import { expect, type Page, test } from "@playwright/test";

async function gotoHealthyHomepage(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("#__next_error__")).toHaveCount(0);
  await expect(page.locator("#hero-heading")).toBeVisible();
}

test.describe("Donation flow", () => {
  test("home page loads", async ({ page }) => {
    await gotoHealthyHomepage(page);
    await expect(page).toHaveTitle(/GiveHope/i);

    const byRole = page.getByRole("link", { name: /donate|give|support/i });
    if ((await byRole.count()) > 0) {
      await expect(byRole.first()).toBeVisible();
      return;
    }

    await expect(page.getByText(/donate|give|support/i).first()).toBeVisible();
  });
});
