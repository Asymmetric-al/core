import { expect, test, type Page } from "@playwright/test";

import { adminBaseURL } from "./base-urls";
import { getDemoRoleMap } from "./helpers/demo-auth";
import { installDemoSessionInBrowser } from "./helpers/install-demo-session";
import {
  demoTenantPath,
  fixturePerson,
  signInAs,
  TENANTS,
} from "./helpers/tenant-address";

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

/** A signed-in page in the demo admin's one organization (plan 5.2). */
function adminPath(path: string): string {
  return new URL(demoTenantPath(path), adminBaseURL).toString();
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
  const brand = page.getByRole("link", { name: /Mission Control/i });
  const mobileSearch = page.getByRole("banner").getByRole("button", {
    name: "Open Mission Control search",
    exact: true,
  });
  await expect(brand.or(mobileSearch).first()).toBeVisible({
    timeout: 120_000,
  });
}

const TABLE_ROUTES: ReadonlyArray<{
  path: string;
  name: string;
  crmApi?: string;
}> = [
  { path: "/crm", name: "CRM", crmApi: "/api/admin/crm/records" },
  { path: "/crm/notes", name: "CRM Notes", crmApi: "/api/admin/crm/notes" },
  {
    path: "/crm/relationships",
    name: "CRM Relationships",
    crmApi: "/api/admin/crm/relationships",
  },
  { path: "/contributions", name: "Contributions" },
  { path: "/tasks", name: "Tasks" },
  { path: "/care", name: "Care" },
  { path: "/mobilize/locations", name: "Locations" },
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
  for (const { path, name, crmApi } of TABLE_ROUTES) {
    test(`${name} (${path}) loads without client error overlay`, async ({
      page,
    }) => {
      const bypassRead = crmApi && process.env.E2E_AUTH_BYPASS === "true";
      if (bypassRead) {
        const session = await installDemoSessionInBrowser(
          page,
          "admin",
          adminBaseURL,
        );
        expect(session.ok).toBe(true);
      } else {
        await ensureAdminDemo(page);
      }
      const [tagOptions] = await Promise.all([
        bypassRead && path === "/crm"
          ? page.waitForResponse(
              (response) =>
                new URL(response.url()).pathname === "/api/admin/crm/tags" &&
                response.request().method() === "GET",
              { timeout: 120_000 },
            )
          : null,
        page.goto(adminPath(path), { waitUntil: "domcontentloaded" }),
      ]);
      if (bypassRead) {
        const refusal = await page.request.get(
          new URL(crmApi, adminBaseURL).href,
          {
            headers: { "x-asym-tenant": TENANTS.demo },
          },
        );
        expect(refusal.status()).toBe(401);
        expect(await refusal.json()).toMatchObject({
          code: "SESSION_REQUIRED",
        });
        if (tagOptions) {
          expect(tagOptions.status()).toBe(401);
          const search = page.getByRole("searchbox", {
            name: "Search CRM records",
          });
          await expect(search).toBeVisible();
          const term = "shell-session-check";
          const [searched] = await Promise.all([
            page.waitForResponse(
              (reply) => {
                const url = new URL(reply.url());
                return (
                  url.pathname === crmApi && url.searchParams.get("q") === term
                );
              },
              { timeout: 120_000 },
            ),
            search.fill(term),
          ]);
          expect(searched.status()).toBe(401);
        }
        await expect(
          page.getByText("A Supabase session is required.").first(),
        ).toBeVisible({ timeout: 120_000 });
      }

      await expect(page.locator("#__next_error__")).toHaveCount(0);
      await expectMissionControlChrome(page);
      if (path === "/care" && process.env.E2E_AUTH_BYPASS === "true") {
        const careRefusal = await page.request.get(
          new URL("/api/admin/member-care/dashboard", adminBaseURL).href,
          {
            headers: { "x-asym-tenant": TENANTS.demo },
          },
        );
        expect(careRefusal.status()).toBe(403);
        const note = page.getByRole("note");
        await expect(note).toBeVisible({ timeout: 120_000 });
        await expect(note).toContainText(/No access to Member Care/i);
        await expect(page.getByText(/Check your connection/i)).toHaveCount(0);
        await page.getByRole("link", { name: "Go to home" }).click();
        await expect(page).toHaveURL(new RegExp(`/${TENANTS.demo}/?$`));
      }
    });
  }

  test("Care API refuses a sessionless member_care bypass fixture with 401 SESSION_REQUIRED", async ({
    page,
  }) => {
    test.skip(
      process.env.E2E_AUTH_BYPASS !== "true",
      "E2E bypass session check only",
    );
    const careAssignment = fixturePerson("twoRows").memberships.find(
      (membership) => membership.staffRole === "member_care",
    );
    expect(careAssignment).toBeDefined();
    await signInAs(page, "admin", "twoRows", adminBaseURL);
    const refusal = await page.request.get(
      new URL("/api/admin/member-care/dashboard", adminBaseURL).href,
      {
        headers: {
          "x-asym-tenant": TENANTS.demo,
          "x-asym-assignment": careAssignment!.id,
        },
      },
    );
    expect(refusal.status()).toBe(401);
    expect(await refusal.json()).toMatchObject({
      code: "SESSION_REQUIRED",
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
