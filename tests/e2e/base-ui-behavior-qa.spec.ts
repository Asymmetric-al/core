import { expect, test, type Page } from "@playwright/test";

import { adminBaseURL } from "./base-urls";
import { getDemoRoleMap } from "./helpers/demo-auth";
import { installDemoSessionInBrowser } from "./helpers/install-demo-session";

/**
 * Behavior QA for the Radix → Base UI migration.
 *
 * Exercises the converted primitives where they are composed for real in the
 * mission-control shell (`apps/admin/app/mc-shell.tsx` + the profile menu
 * block): DropdownMenu triggers via Base UI `render`, Escape + focus
 * restoration, and link-composed sidebar buttons. The shell's demo language,
 * activity and notification menus were removed (ADR-0027 names the bell
 * hard-coded presentation), so their cases went with them.
 */

async function ensureAdminDemo(page: Page) {
  const availability = await page.request.get(
    `${adminBaseURL}/api/auth/demo-account`,
  );
  test.skip(!availability.ok(), "Demo availability endpoint is unavailable.");
  const roles = getDemoRoleMap(await availability.json()) ?? {};
  test.skip(!roles.admin, "Admin demo account is not configured.");

  const { ok, status } = await installDemoSessionInBrowser(
    page,
    "admin",
    adminBaseURL,
  );
  if (!ok) {
    test.skip(true, `Demo admin session install failed (${status})`);
  }
}

test.describe("Base UI behavior QA (mission-control shell)", () => {
  test.setTimeout(180_000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await ensureAdminDemo(page);
    await page.goto(new URL("/", adminBaseURL).toString());
    await expect(
      page.getByRole("link", { name: /Mission Control/i }),
    ).toBeVisible({ timeout: 120_000 });
  });

  test("profile dropdown opens via render trigger and closes on Escape with focus restored", async ({
    page,
  }) => {
    const trigger = page.getByRole("button", { name: "Open profile menu" });
    await trigger.click();

    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("sidebar renders link-composed menu buttons that navigate", async ({
    page,
  }) => {
    const crmLink = page.getByRole("link", { name: "CRM", exact: true });
    await expect(crmLink).toBeVisible();
    await crmLink.click();
    // Generous timeout: in dev the /crm route may compile on first navigation.
    await expect(page).toHaveURL(/\/crm/, { timeout: 60_000 });
    await expect(page.locator("#__next_error__")).toHaveCount(0);
  });
});
