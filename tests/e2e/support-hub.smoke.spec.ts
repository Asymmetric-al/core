import { expect, test, type Page } from "@playwright/test";

import { adminBaseURL } from "./base-urls";
import { getDemoRoleMap } from "./helpers/demo-auth";
import { installDemoSessionInBrowser } from "./helpers/install-demo-session";

/** Required setup is broken: fail under CI (the smoke gate), skip locally. */
function requireDemoSetup(reason: string) {
  if (process.env.CI) {
    throw new Error(`Required E2E setup unavailable: ${reason}`);
  }
  test.skip(true, reason);
}

async function ensureAdminDemo(page: Page) {
  const availability = await page.request.get(
    `${adminBaseURL}/api/auth/demo-account`,
  );
  if (!availability.ok()) {
    requireDemoSetup("Demo availability endpoint is unavailable.");
  }
  const roles = getDemoRoleMap(await availability.json()) ?? {};
  if (!roles.admin) {
    requireDemoSetup("Admin demo account is not configured.");
  }

  const { ok, status } = await installDemoSessionInBrowser(
    page,
    "admin",
    adminBaseURL,
  );
  if (!ok) {
    requireDemoSetup(`Demo admin session install failed (${status})`);
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

  test("clicking Table switches the inbox from board to table layout", async ({
    page,
  }) => {
    await ensureAdminDemo(page);
    await page.goto(adminPath("/support?layout=board"));
    await page.waitForLoadState("domcontentloaded");
    const boardRegion = page.getByRole("region", { name: /board view/i });
    await expect(boardRegion).toBeVisible();

    const layout = page.getByRole("group", { name: "Inbox layout" });
    await layout.getByRole("button", { name: "Table" }).click();

    await expect(layout.getByRole("button", { name: "Table" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(layout.getByRole("button", { name: "Board" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(boardRegion).toHaveCount(0);
    // Without seeded records the table may be empty; either proves the switch.
    await expect(
      page
        .getByRole("table")
        .or(page.getByText("No conversations match your filters"))
        .first(),
    ).toBeVisible();
  });

  test("status filter param applies", async ({ page }) => {
    await ensureAdminDemo(page);
    await page.goto(adminPath("/support?status=open"));
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#__next_error__")).toHaveCount(0);
    await expect(
      page.getByRole("combobox", { name: "Status filter" }),
    ).toHaveText("Open");
  });

  test("deep link to an unknown conversation id that fails to load shows the not-found state, not an error page", async ({
    page,
  }) => {
    await ensureAdminDemo(page);
    await page.goto(adminPath("/support?id=conv-e2e-does-not-exist"));
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#__next_error__")).toHaveCount(0);
    await expect(page.getByText("Conversation not found").first()).toBeVisible({
      timeout: 30_000,
    });
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
