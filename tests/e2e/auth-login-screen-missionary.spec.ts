import { expect, test } from "@playwright/test";

test("missionary login screen renders shared auth UI", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await expect(page.getByTestId("auth-signout")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Donors" })).toHaveCount(0);

  const signInVisible = await page
    .getByRole("button", { name: "Sign In" })
    .isVisible()
    .catch(() => false);
  const demoVisible = await page
    .getByRole("button", { name: "Demo Access" })
    .isVisible()
    .catch(() => false);

  expect(signInVisible || demoVisible).toBe(true);
});
