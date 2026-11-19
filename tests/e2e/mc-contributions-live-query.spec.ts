import { expect, test, type Page } from "@playwright/test";

import {
  getDemoRoleMap,
  type DemoAvailabilityPayload,
} from "./helpers/demo-auth";
import { demoTenantPath } from "./helpers/tenant-address";
import { DEMO_TENANT_ID } from "../../packages/auth/constants";
import { buildTenantPrefix } from "../../packages/auth/tenant-address";

test.describe.configure({ timeout: 120_000 });

async function loginAsAdminDemo(page: Page, protectedPath: string) {
  const availability = await page.request.get("/api/auth/demo-account");

  await page.goto(`/login?next=${encodeURIComponent(protectedPath)}`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });

  if (availability.ok()) {
    const payload = (await availability.json()) as DemoAvailabilityPayload;
    const roles = getDemoRoleMap(payload) ?? {};

    if (roles.admin) {
      await page.getByRole("button", { name: "Demo Access" }).click();
      // The demo admin's one organization (plan 5.2).
      await page.waitForURL(
        (url) => url.pathname === demoTenantPath(protectedPath),
        {
          timeout: 120_000,
        },
      );
      return;
    }
  }

  const adminEmail =
    process.env.E2E_ADMIN_EMAIL ?? process.env.DEMO_ADMIN_EMAIL ?? "";
  const adminPassword =
    process.env.E2E_ADMIN_PASSWORD ?? process.env.DEMO_PASSWORD ?? "";

  test.skip(
    !adminEmail || !adminPassword,
    "Admin demo credentials are not configured.",
  );

  await page.getByLabel("Email", { exact: true }).fill(adminEmail);
  await page.getByLabel("Password", { exact: true }).fill(adminPassword);
  await page.getByRole("button", { name: "Sign In" }).click();
  // The named organization's address for the page, exactly, and the page
  // rendered in that organization: not any tenant prefix (council round 1,
  // A24). The demo admin's organization unless E2E_ADMIN_TENANT_ID names
  // the configured admin's.
  const prefix = buildTenantPrefix(
    process.env.E2E_ADMIN_TENANT_ID ?? DEMO_TENANT_ID,
    null,
  );
  await page.waitForURL((url) => url.pathname === `${prefix}${protectedPath}`, {
    timeout: 120_000,
  });
  await expect(page.locator("[data-tenant-scope]")).toHaveAttribute(
    "data-tenant-scope",
    prefix,
    { timeout: 90_000 },
  );
}

test.describe("Mission Control contributions live query", () => {
  test("resolves the contributions table shell", async ({ page }) => {
    await loginAsAdminDemo(page, "/contributions");

    await page.waitForSelector('[data-testid="mc-contributions-live"]', {
      timeout: 90_000,
    });
  });

  test("uses the canonical contributions href in the app shell", async ({
    page,
  }) => {
    await loginAsAdminDemo(page, "/contributions");

    const contributionsLink = page
      .getByRole("link", { name: /^Contributions$/ })
      .first();

    await expect(contributionsLink).toHaveAttribute(
      "href",
      demoTenantPath("/contributions"),
    );
    await contributionsLink.click();

    await expect(page).toHaveURL(/\/contributions$/);
    await expect(
      page.getByRole("heading", { name: /^Contributions$/ }),
    ).toBeVisible({ timeout: 90_000 });
    await page.waitForSelector('[data-testid="mc-contributions-live"]', {
      timeout: 90_000,
    });
  });
});
