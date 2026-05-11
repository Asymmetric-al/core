import { expect, test, type Page } from "@playwright/test";

import { adminBaseURL } from "./base-urls";
import { getDemoRoleMap } from "./helpers/demo-auth";
import { installDemoSessionInBrowser } from "./helpers/install-demo-session";

async function ensureAdminDemo(page: Page) {
  const availability = await page.request.get(
    `${adminBaseURL}/api/auth/demo-account`,
  );
  test.skip(!availability.ok(), "Demo availability endpoint is unavailable.");
  const roles = getDemoRoleMap(await availability.json()) ?? {};
  test.skip(!roles.admin, "Admin demo account is not configured.");

  const { ok, status } = await installDemoSessionInBrowser(page, "admin");
  if (!ok) {
    test.skip(true, `Demo admin session install failed (${status})`);
  }
}

test.describe("Admin PDF Studio legacy editor", () => {
  test.setTimeout(180_000);

  test("keeps PDF Studio on the explicit legacy document editor path", async ({
    page,
  }) => {
    await ensureAdminDemo(page);
    await page.goto("/pdf");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("#__next_error__")).toHaveCount(0);
    await expect(page.getByText("PDF Studio").first()).toBeVisible({
      timeout: 120_000,
    });
    await expect(
      page.getByRole("button", { name: /Export/i }).first(),
    ).toBeVisible();
    await expect(page.locator("#pdf-studio-editor")).toHaveCount(1, {
      timeout: 120_000,
    });
    await expect(page.locator("#pdf-studio-editor iframe")).toHaveCount(1, {
      timeout: 120_000,
    });
  });
});
