import { expect, test, type Page } from "@playwright/test";

import { getDemoRoleMap } from "./helpers/demo-auth";

async function ensureAdminDemo(page: Page) {
  const availability = await page.request.get("/api/auth/demo-account");
  test.skip(!availability.ok(), "Demo availability endpoint is unavailable.");
  const roles = getDemoRoleMap(await availability.json()) ?? {};
  test.skip(!roles.admin, "Admin demo account is not configured.");

  await page.request.post("/api/auth/demo-account", {
    data: { role: "admin" },
  });
}

const TABLE_ROUTES = [
  { path: "/crm", name: "CRM" },
  { path: "/contributions", name: "Contributions" },
  { path: "/tasks", name: "Tasks" },
  { path: "/care", name: "Care" },
  { path: "/mobilize/locations", name: "Locations" },
] as const;

test.describe("Admin table pages smoke", () => {
  for (const { path, name } of TABLE_ROUTES) {
    test(`${name} (${path}) loads without client error overlay`, async ({
      page,
    }) => {
      await ensureAdminDemo(page);
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");

      await expect(page.locator("#__next_error__")).toHaveCount(0);
      await expect(page.getByRole("main")).toBeVisible();
    });
  }
});
