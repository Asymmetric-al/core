import { expect, test, type Page } from "@playwright/test";

import { adminBaseURL } from "./base-urls";
import { getDemoRoleMap } from "./helpers/demo-auth";
import { installDemoSessionInBrowser } from "./helpers/install-demo-session";

/**
 * Behavior QA for the Radix → Base UI migration.
 *
 * Exercises the converted primitives where they are composed for real in the
 * mission-control shell (`apps/admin/app/mc-shell.tsx` + the shadcn-studio
 * blocks): DropdownMenu/Sheet triggers via Base UI `render`, Escape + focus
 * restoration, Tabs `data-active`, and menu radio items.
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

  test("notifications dropdown hosts tabs whose data-active state switches on click", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Open notifications" }).click();

    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();

    const tabs = menu.getByRole("tab");
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(2);

    await expect(tabs.first()).toHaveAttribute("data-active", "");
    await expect(tabs.nth(1)).not.toHaveAttribute("data-active", "");

    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute("data-active", "");
    await expect(tabs.first()).not.toHaveAttribute("data-active", "");
    // Interacting with the embedded tabs must not close the menu.
    await expect(menu).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("activity sheet opens with an accessible title and closes on Escape", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Open activity" }).click();

    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText("Activity").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  });

  test("language dropdown radio items reflect selection state", async ({
    page,
  }) => {
    const trigger = page.getByRole("button", { name: "Change language" });
    await trigger.click();

    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();

    const radios = menu.getByRole("menuitemradio");
    expect(await radios.count()).toBeGreaterThanOrEqual(2);
    await expect(radios.first()).toHaveAttribute("aria-checked", "true");

    const second = radios.nth(1);
    await second.click();
    // Base UI (and upstream shadcn base-maia) keep selection menus open on
    // radio-item click so the change is visible — unlike Radix, which closed.
    await expect(menu).toBeVisible();
    await expect(second).toHaveAttribute("aria-checked", "true");
    await expect(radios.first()).toHaveAttribute("aria-checked", "false");

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
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
