import { expect, test } from "@playwright/test";

const adminBaseURL =
  process.env.PLAYWRIGHT_ADMIN_BASE_URL || "http://127.0.0.1:3030";

test.describe("@cms CMS admin access guards", () => {
  test("payload admin route redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto(`${adminBaseURL}/admin`);

    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/next=%2Fadmin/);
  });
});
