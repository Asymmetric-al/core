import { expect, test, type Page } from "@playwright/test";

import {
  getDemoRoleMap,
  type DemoAvailabilityPayload,
} from "./helpers/demo-auth";

test.describe.configure({ timeout: 120_000 });

async function loginAsAdminDemo(page: Page, protectedPath: string) {
  const availability = await page.request.get("/api/auth/demo-account");

  await page.goto(`/login?next=${encodeURIComponent(protectedPath)}`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });

  if (availability.ok()) {
    const payload = (await availability.json()) as DemoAvailabilityPayload;
    const roles = getDemoRoleMap(payload) ?? {};

    if (roles.admin) {
      await page.getByRole("button", { name: "Demo Access" }).click();
      await page.waitForURL((url) => url.pathname === protectedPath, {
        timeout: 120_000,
      });
      return;
    }
  }

  const adminEmail =
    process.env.E2E_ADMIN_EMAIL ?? process.env.DEMO_ADMIN_EMAIL ?? "";
  const adminPassword =
    process.env.E2E_ADMIN_PASSWORD ?? process.env.DEMO_PASSWORD ?? "";

  test.skip(
    !adminEmail || !adminPassword,
    "Admin demo credentials are not configured.",
  );

  await page.getByLabel("Email", { exact: true }).fill(adminEmail);
  await page.getByLabel("Password", { exact: true }).fill(adminPassword);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => url.pathname === protectedPath, {
    timeout: 120_000,
  });
}

test.describe("Mission Control contributions live query", () => {
  test("resolves the contributions table shell", async ({ page }) => {
    await loginAsAdminDemo(page, "/contributions");

    await page.waitForSelector('[data-testid="mc-contributions-live"]', {
      timeout: 90_000,
    });
  });

  test("uses the canonical contributions href in the app shell", async ({
    page,
  }) => {
    await loginAsAdminDemo(page, "/contributions");

    const contributionsLink = page
      .getByRole("link", { name: /^Contributions$/ })
      .first();

    await expect(contributionsLink).toHaveAttribute("href", "/contributions");
    await contributionsLink.click();

    await expect(page).toHaveURL(/\/contributions$/);
    await expect(
      page.getByRole("heading", { name: /^Contributions$/ }),
    ).toBeVisible({ timeout: 90_000 });
    await page.waitForSelector('[data-testid="mc-contributions-live"]', {
      timeout: 90_000,
    });
  });
});
