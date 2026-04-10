import { expect, test } from "@playwright/test";

test.describe("@cms CMS tenant isolation", () => {
  test("unknown tenant page paths do not leak cross-tenant content", async ({
    page,
  }) => {
    await page.goto("/tenant-content-that-does-not-exist");

    // Catch-all CMS route returns 404 when no published page exists (see
    // `app/(public)/[...cmsSlug]/page.tsx`); that still satisfies isolation.
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });
});
