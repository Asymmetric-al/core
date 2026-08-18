import { expect, test, type Page } from "@playwright/test";

import { asAdmin, asGuest } from "./fixtures/auth";
import { ADMIN_APP_ORIGIN, isAdminAppOrigin } from "./helpers/origins";
import { expectTablePageA11y } from "./helpers/table-page-a11y";

const TABLE_ROUTES = [
  "/people",
  "/campaigns",
  "/reports",
  "/contributions",
  "/giving",
  "/crm",
  "/crm/notes",
  "/crm/relationships",
  "/settings/users",
] as const;

const CRM_LOCAL_SURFACES = ["/crm/notes", "/crm/relationships"] as const;

test.describe("Admin table pages", () => {
  test("each table page stays inside the admin origin and has no console errors", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await asAdmin(page);

    for (const route of TABLE_ROUTES) {
      await page.goto(`${ADMIN_APP_ORIGIN}${route}`, {
        waitUntil: "domcontentloaded",
      });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
        timeout: 15_000,
      });
      expect(isAdminAppOrigin(page.url())).toBe(true);
    }

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("each table page exposes one heading, search, and table semantics", async ({
    page,
  }) => {
    await asAdmin(page);

    for (const route of TABLE_ROUTES) {
      await page.goto(`${ADMIN_APP_ORIGIN}${route}`, {
        waitUntil: "domcontentloaded",
      });
      await expectTablePageA11y(page);
    }
  });

  test("admin table routes reject unauthenticated guests", async ({ page }) => {
    await asGuest(page);

    for (const route of TABLE_ROUTES) {
      await page.goto(`${ADMIN_APP_ORIGIN}${route}`, {
        waitUntil: "domcontentloaded",
      });
      await expect(page).toHaveURL(/\/login/);
      expect(isAdminAppOrigin(page.url())).toBe(true);
    }
  });
});

test.describe("Local Asym CRM surfaces", () => {
  test("notes and relationships load from Asym Postgres without Twenty-owned labels", async ({
    page,
  }) => {
    await asAdmin(page);

    for (const route of CRM_LOCAL_SURFACES) {
      await page.goto(`${ADMIN_APP_ORIGIN}${route}`, {
        waitUntil: "domcontentloaded",
      });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
        timeout: 15_000,
      });
      await expect(
        page.getByText("Asym Postgres", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("Twenty CRM", { exact: true })).toHaveCount(
        0,
      );
      await expect(
        page.getByText("Twenty-backed", { exact: true }),
      ).toHaveCount(0);
    }
  });

  test("authorized staff can create a local CRM note that remains readable", async ({
    page,
  }) => {
    await asAdmin(page);
    await page.goto(`${ADMIN_APP_ORIGIN}/crm/notes`, {
      waitUntil: "domcontentloaded",
    });

    const uniqueTitle = `Local CRM note ${Date.now()}`;
    await page.getByLabel("Title").fill(uniqueTitle);
    await page.getByLabel("Body").fill("Authoritative Asym Postgres note.");
    await page.getByRole("button", { name: "Save note" }).click();

    await expect(page.getByText("CRM note saved")).toBeVisible();
    await expect(page.getByRole("cell", { name: uniqueTitle })).toBeVisible();
    await expect(page.getByText("Queued for Twenty")).toHaveCount(0);
  });
});
