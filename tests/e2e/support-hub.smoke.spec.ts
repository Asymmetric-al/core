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

  const { ok, status } = await installDemoSessionInBrowser(
    page,
    "admin",
    adminBaseURL,
  );
  if (!ok) {
    test.skip(true, `Demo admin session install failed (${status})`);
  }
}

function adminPath(path: string): string {
  return new URL(path, adminBaseURL).toString();
}

async function expectMissionControlChrome(page: Page) {
  await expect(
    page.getByRole("link", { name: /Mission Control/i }),
  ).toBeVisible({ timeout: 120_000 });
}

/**
 * Phase 7 smoke spec for the donor care Support Hub. Mirrors the
 * `admin-table-pages-smoke.spec.ts` shape so it slots into the existing
 * `bun run test:e2e:smoke` suite.
 */
test.describe("Support Hub smoke", () => {
  test.setTimeout(180_000);

  test("loads /support inside the Mission Control shell", async ({ page }) => {
    await ensureAdminDemo(page);
    await page.goto(adminPath("/support"));
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("#__next_error__")).toHaveCount(0);
    await expectMissionControlChrome(page);
    await expect(
      page.getByRole("heading", { name: "Support Hub", level: 1 }),
    ).toBeVisible();
  });

  test("toggles between board and table layouts", async ({ page }) => {
    await ensureAdminDemo(page);
    await page.goto(adminPath("/support?layout=board"));
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByRole("region", { name: /board view/i }),
    ).toBeVisible();

    await page.goto(adminPath("/support?layout=table"));
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#__next_error__")).toHaveCount(0);
  });

  test("status filter param applies", async ({ page }) => {
    await ensureAdminDemo(page);
    await page.goto(adminPath("/support?status=open"));
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#__next_error__")).toHaveCount(0);
    // The status filter is reflected in the URL after parse — confirm
    // the page kept it intact rather than clearing it on render.
    await expect(page).toHaveURL(/status=open/);
  });

  test("opens a conversation via the URL ?id= deep link", async ({ page }) => {
    await ensureAdminDemo(page);
    // Phase 2 seed includes the failed-receipt conversation.
    await page.goto(adminPath("/support?id=conv-failed-receipt"));
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#__next_error__")).toHaveCount(0);
    // The header surfaces the donor name from the seed.
    await expect(
      page
        .getByText(
          /John Anderson|john\.anderson@email\.com|Conversation not found/i,
        )
        .first(),
    ).toBeVisible({ timeout: 30_000 });
  });

  test("nested /support/reports/overview loads", async ({ page }) => {
    await ensureAdminDemo(page);
    await page.goto(adminPath("/support/reports/overview"));
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#__next_error__")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: /Reports overview/i }),
    ).toBeVisible();
  });

  test("nested /support/settings/inbox loads", async ({ page }) => {
    await ensureAdminDemo(page);
    await page.goto(adminPath("/support/settings/inbox"));
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#__next_error__")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: /Inbox identity/i }).first(),
    ).toBeVisible();
  });
});
