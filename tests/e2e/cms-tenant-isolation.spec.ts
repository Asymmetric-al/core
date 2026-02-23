import { expect, test } from "@playwright/test";

test.describe("CMS tenant isolation", () => {
  test("unknown tenant page paths do not leak cross-tenant content", async ({
    page,
  }) => {
    await page.goto("/tenant-content-that-does-not-exist");

    await expect(page).toHaveURL(/\/login/);
  });
});
