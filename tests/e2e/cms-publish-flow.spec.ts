import { expect, test } from "@playwright/test";

const adminBaseURL =
  process.env.PLAYWRIGHT_ADMIN_BASE_URL || "http://localhost:3030";

test.describe("@cms CMS publish flow guards", () => {
  test("staff-only admin route redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto(`${adminBaseURL}/web-studio`);

    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/next=%2Fweb-studio/);
  });

  test("authenticated preview route redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto(`${adminBaseURL}/web-studio/preview/pages/draft_123`);

    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(
      /next=%2Fweb-studio%2Fpreview%2Fpages%2Fdraft_123/,
    );
  });
});
