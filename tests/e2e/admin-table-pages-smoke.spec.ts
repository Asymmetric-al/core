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

async function ensureSupportHubDatabase(page: Page) {
  const response = await page.request.get(`${adminBaseURL}/api/admin/support`);

  if (response.ok()) {
    return;
  }

  const body = await response.text();
  test.skip(
    body.includes("support_tickets") || body.includes("support_contacts"),
    "Support Hub database migration is not applied in this environment.",
  );
}

/** Many admin pages use `PageShell` (no `<main>`); the shell chrome is the stable signal. */
async function expectMissionControlChrome(page: Page) {
  await expect(
    page.getByRole("link", { name: /Mission Control/i }),
  ).toBeVisible({ timeout: 120_000 });
}

const TABLE_ROUTES = [
  { path: "/crm", name: "CRM" },
  { path: "/crm/notes", name: "CRM Notes" },
  { path: "/crm/relationships", name: "CRM Relationships" },
  { path: "/crm/projections", name: "CRM Projections" },
  { path: "/contributions", name: "Contributions" },
  { path: "/tasks", name: "Tasks" },
  { path: "/care", name: "Care" },
  { path: "/mobilize/locations", name: "Locations" },
] as const;

const CRM_TWENTY_SURFACES = [
  {
    path: "/crm/notes",
    heading: "CRM Notes",
    emptyState: /No CRM notes|CRM reads are not configured/i,
  },
  {
    path: "/crm/relationships",
    heading: "CRM Relationships",
    emptyState: /No CRM relationships|CRM reads are not configured/i,
  },
  {
    path: "/crm/projections",
    heading: "CRM Projections",
    emptyState: /No CRM projections|Projection names can be disabled/i,
  },
] as const;

const SUPPORT_ROUTES = [
  { path: "/support", heading: "Support Hub" },
  { path: "/support/tickets", heading: "Support Tickets" },
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
      await page.goto(adminPath(path));
      await page.waitForLoadState("domcontentloaded");

      await expect(page.locator("#__next_error__")).toHaveCount(0);
      await expectMissionControlChrome(page);
    });
  }

  test.describe("Twenty-backed CRM surfaces", () => {
    for (const { emptyState, heading, path } of CRM_TWENTY_SURFACES) {
      test(`${heading} (${path}) handles missing Twenty env without overlay`, async ({
        page,
      }) => {
        await ensureAdminDemo(page);
        await page.goto(adminPath(path));
        await page.waitForLoadState("domcontentloaded");

        await expect(page.locator("#__next_error__")).toHaveCount(0);
        await expectMissionControlChrome(page);
        await expect(
          page.getByRole("heading", { name: heading }),
        ).toBeVisible();
        await expect(page.getByText(emptyState).first()).toBeVisible({
          timeout: 120_000,
        });
      });
    }
  });

  test.describe("CRM table interactions", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
    });

    test("search filters contacts and reset shows rows again", async ({
      page,
    }) => {
      await ensureAdminDemo(page);
      await page.goto(adminPath("/crm"));
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
      await page.goto(adminPath("/crm"));
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
        if (path === "/support" || path === "/support/tickets") {
          await ensureSupportHubDatabase(page);
        }
        await page.goto(adminPath(path));
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
      await page.goto(adminPath("/support/tickets/new"));
      await page.waitForLoadState("domcontentloaded");

      await expect(page.getByLabel("Contact")).toBeVisible();
      await expect(page.getByLabel("Subject")).toBeVisible();
      await expect(page.getByLabel("Support track")).toBeVisible();
      await expect(page.getByLabel("Priority")).toBeVisible();
      await expect(page.getByLabel("Summary")).toBeVisible();
    });

    test("created ticket appears in the live list and opens in detail", async ({
      page,
    }) => {
      const subject = `Live read path smoke ${Date.now()}`;

      await ensureAdminDemo(page);
      await ensureSupportHubDatabase(page);
      await page.goto(adminPath("/support/tickets/new"));
      await page.waitForLoadState("domcontentloaded");

      await page.getByLabel("Contact").selectOption({ index: 1 });
      await page.getByLabel("Subject").fill(subject);
      await page.getByLabel("Support track").selectOption("donor_care");
      await page.getByLabel("Priority").selectOption("normal");
      await page
        .getByLabel("Summary")
        .fill("Verify that created support tickets are served by live reads.");

      const createResponse = page.waitForResponse(
        (response) =>
          response.url().includes("/api/admin/support/tickets") &&
          response.request().method() === "POST",
      );
      await page.getByRole("button", { name: "Create ticket" }).click();

      const response = await createResponse;
      expect(response.ok()).toBe(true);
      const ticket = (await response.json()) as { id: string };

      await expect(page.getByText(`Created ticket ${ticket.id}`)).toBeVisible();

      await page.goto(adminPath("/support/tickets"));
      const ticketRow = page.locator("article").filter({ hasText: subject });
      await expect(ticketRow).toBeVisible();

      await ticketRow.getByRole("link", { name: "Open thread" }).click();
      await expect(page).toHaveURL(new RegExp(`/support/tickets/${ticket.id}`));
      await expect(
        page.getByRole("heading", { name: subject }).first(),
      ).toBeVisible();
    });

    test("support hub exposes three support tracks and no timing-risk copy", async ({
      page,
    }) => {
      const timingRiskPattern = new RegExp(
        `${String.fromCharCode(83, 76, 65)}|${String.fromCharCode(83, 76, 65)} risk`,
        "i",
      );
      await ensureAdminDemo(page);
      await ensureSupportHubDatabase(page);
      await page.goto(adminPath("/support"));
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
