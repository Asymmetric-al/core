import { expect, test } from "@playwright/test";

import { adminBaseURL } from "./base-urls";

function adminPath(path: string): string {
  return new URL(path, adminBaseURL).toString();
}

test("admin login screen renders shared auth UI", async ({ page }) => {
  await page.goto(adminPath("/login"));
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

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
