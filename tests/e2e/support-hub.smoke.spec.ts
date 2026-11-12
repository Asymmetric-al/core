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
    await page.route(
      adminPath("/api/admin/support/conversations"),
      async (route) => {
        await route.fulfill({
          json: {
            conversations: [
              {
                id: "conv-e2e-layout",
                tenantId: "tenant-e2e",
                inboxId: "inbox-e2e",
                subject: "Smoke fixture conversation",
                status: "open",
                priority: "normal",
                channel: "email",
                assignee: null,
                team: null,
                externalContactName: "Smoke donor",
                externalContactEmail: "smoke@example.test",
                contact: null,
                labels: [],
                unreadCount: 0,
                messageCount: 1,
                firstMessageAt: "2026-11-11T12:00:00.000Z",
                lastMessageAt: "2026-11-11T12:00:00.000Z",
                lastCustomerMessageAt: "2026-11-11T12:00:00.000Z",
                lastMessageDirection: "inbound",
                firstRespondedAt: null,
                firstResponseDueAt: null,
                nextResponseDueAt: null,
                resolvedAt: null,
                snoozedUntil: null,
                escalatedAt: null,
                boardOrder: 0,
                slaPolicyId: null,
                createdAt: "2026-11-11T12:00:00.000Z",
                updatedAt: "2026-11-11T12:00:00.000Z",
              },
            ],
          },
        });
      },
    );
    await page.setViewportSize({ width: 1920, height: 1080 });
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
    const table = page.getByRole("table");
    await expect(table).toBeVisible();
    await expect(table.getByText("Smoke fixture conversation")).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(table).toHaveCount(0);
    const cards = page.getByRole("list", { name: "Conversations" });
    await expect(cards).toBeVisible();
    await expect(
      cards.getByRole("button", {
        name: "Smoke donor Smoke fixture conversation",
        exact: true,
      }),
    ).toBeVisible();
  });

  test("status filter param applies", async ({ page }) => {
    await ensureAdminDemo(page);
    await page.goto(adminPath("/support?status=open"));
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#__next_error__")).toHaveCount(0);
    // The trigger also holds the aria-hidden chevron; assert the value slot.
    await expect(
      page
        .getByRole("combobox", { name: "Status filter" })
        .locator('[data-slot="select-value"]'),
    ).toHaveText("Open");
  });

  test("deep link to an unknown conversation id that fails to load shows the not-found state, not an error page", async ({
    page,
  }) => {
    await ensureAdminDemo(page);
    await page.route(
      adminPath("/api/admin/support/conversations/conv-e2e-does-not-exist"),
      async (route) => {
        await route.fulfill({
          status: 404,
          json: { error: "Conversation not found" },
        });
      },
    );
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
