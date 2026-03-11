import { expect, test } from "@playwright/test";

const adminBaseURL =
  process.env.PLAYWRIGHT_ADMIN_BASE_URL || "http://127.0.0.1:3030";

test.describe("@cms CMS publish flow guards", () => {
  test("staff-only admin route redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto(`${adminBaseURL}/admin`);

    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/next=%2Fadmin/);
  });
});
