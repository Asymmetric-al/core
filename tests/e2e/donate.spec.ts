import { expect, test } from "@playwright/test";

test.describe("Donation flow", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
    // TODO: expand when donation flow is implemented
    const byRole = page.getByRole("link", { name: /donate|give/i });
    if ((await byRole.count()) === 0) {
      await page.getByText(/donate|give/i).count();
    }
  });
});
