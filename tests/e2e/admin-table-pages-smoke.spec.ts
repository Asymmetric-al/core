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

/** Many admin pages use `PageShell` (no `<main>`); the shell chrome is the stable signal. */
async function expectMissionControlChrome(page: Page) {
  await expect(
    page.getByRole("link", { name: /Mission Control/i }),
  ).toBeVisible({ timeout: 120_000 });
}

const TABLE_ROUTES = [
  { path: "/crm", name: "CRM" },
  { path: "/contributions", name: "Contributions" },
  { path: "/tasks", name: "Tasks" },
  { path: "/care", name: "Care" },
  { path: "/mobilize/locations", name: "Locations" },
] as const;

const SUPPORT_ROUTES = [
  { path: "/support", heading: "Support Hub" },
  { path: "/support/tickets", heading: "Support Tickets" },
  { path: "/support/tickets/SUP-1037", heading: "Donor dashboard question" },
  { path: "/support/tickets/new", heading: "New Support Ticket" },
  { path: "/support/contacts", heading: "Support Contacts" },
  { path: "/support/macros", heading: "Support Macros" },
  { path: "/support/knowledge", heading: "Support Knowledge" },
] as const;

test.describe("Admin table pages smoke", () => {
  test.setTimeout(180_000);
  for (const { path, name } of TABLE_ROUTES) {
    test(`${name} (${path}) loads without client error overlay`, async ({
      page,
    }) => {
      await ensureAdminDemo(page);
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");

      await expect(page.locator("#__next_error__")).toHaveCount(0);
      await expectMissionControlChrome(page);
    });
  }

  test.describe("CRM table interactions", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
    });

    test("search filters contacts and reset shows rows again", async ({
      page,
    }) => {
      await ensureAdminDemo(page);
      await page.goto("/crm");
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("#__next_error__")).toHaveCount(0);

      const search = page.getByPlaceholder("Search contacts...");
      await expect(search).toBeVisible();

      await search.fill("__no_such_contact__");
      await expect(
        page.getByRole("row", { name: /No results found/i }),
      ).toBeVisible();

      await search.fill("");
      await expect(
        page.getByRole("row", { name: /Alice Johnson/i }).first(),
      ).toBeVisible();
    });

    test("pagination advances and returns across pages", async ({ page }) => {
      await ensureAdminDemo(page);
      await page.goto("/crm");
      await page.waitForLoadState("domcontentloaded");

      await expect(page.getByText("Page 1 of 2")).toBeVisible();
      await expect(
        page.getByRole("row", { name: /Alice Johnson/i }).first(),
      ).toBeVisible();

      await page.getByRole("button", { name: "Go to next page" }).click();
      await expect(page.getByText("Page 2 of 2")).toBeVisible();
      await expect(
        page.getByRole("row", { name: /Frank Miller/i }).first(),
      ).toBeVisible();

      await page.getByRole("button", { name: "Go to previous page" }).click();
      await expect(page.getByText("Page 1 of 2")).toBeVisible();
    });
  });

  test.describe("Support Hub smoke", () => {
    for (const { path, heading } of SUPPORT_ROUTES) {
      test(`${heading} (${path}) loads without client error overlay`, async ({
        page,
      }) => {
        const hydrationMessages: string[] = [];
        page.on("console", (message) => {
          const text = message.text();
          if (text.includes("hydrated but some attributes")) {
            hydrationMessages.push(text);
          }
        });

        await ensureAdminDemo(page);
        await page.goto(path);
        await page.waitForLoadState("domcontentloaded");

        await expect(page.locator("#__next_error__")).toHaveCount(0);
        await expectMissionControlChrome(page);
        await expect(
          page.getByRole("heading", { name: heading }).first(),
        ).toBeVisible();
        expect(hydrationMessages).toEqual([]);
      });
    }

    test("new ticket exposes real form controls", async ({ page }) => {
      await ensureAdminDemo(page);
      await page.goto("/support/tickets/new");
      await page.waitForLoadState("domcontentloaded");

      await expect(page.getByLabel("Contact")).toBeVisible();
      await expect(page.getByLabel("Subject")).toBeVisible();
      await expect(page.getByLabel("Support track")).toBeVisible();
      await expect(page.getByLabel("Priority")).toBeVisible();
      await expect(page.getByLabel("Summary")).toBeVisible();
    });

    test("support hub exposes three support tracks and no timing-risk copy", async ({
      page,
    }) => {
      const timingRiskPattern = new RegExp(
        `${String.fromCharCode(83, 76, 65)}|${String.fromCharCode(83, 76, 65)} risk`,
        "i",
      );
      await ensureAdminDemo(page);
      await page.goto("/support");
      await page.waitForLoadState("domcontentloaded");

      await expect(page.getByText("Donor Care").first()).toBeVisible();
      await expect(
        page.getByText("Mobilization / Interested in Joining").first(),
      ).toBeVisible();
      await expect(
        page.getByText("Existing Missionary Support").first(),
      ).toBeVisible();
      await expect(page.getByText(timingRiskPattern)).toHaveCount(0);
    });
  });
});
