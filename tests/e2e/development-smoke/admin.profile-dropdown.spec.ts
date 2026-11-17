import { expect, test } from "@playwright/test";

import {
  assertNoErrorBanner,
  assertNoVisibleLoginPrompt,
  collectFailureEvidence,
  ensureAuthenticated,
} from "./helpers";

/**
 * Headless check of the Mission Control profile menu on the development
 * deployment: the old template items stay gone and Administration lands on
 * /admin.
 *
 * Project: development-admin (see playwright.development-smoke.config.ts).
 */

test.describe("development-admin profile dropdown", () => {
  test.afterEach(async ({ page }, testInfo) => {
    await collectFailureEvidence(page, testInfo);
  });

  test("profile dropdown shows only the corrected item set and Administration lands on /admin", async ({
    page,
  }) => {
    // Authenticated marker on admin: the Mission Control header always renders
    // the "Open profile menu" button once the shell hydrates.
    await ensureAuthenticated(page, {
      authenticatedMarker: (p) =>
        p.getByRole("button", { name: /open profile menu/i }),
    });

    await expect(page).toHaveTitle(/Mission Control/i);
    await assertNoVisibleLoginPrompt(page);

    const profileButton = page.getByRole("button", {
      name: /open profile menu/i,
    });
    await profileButton.click();

    // Items from the original menu template must be absent.
    for (const oldLabel of [
      "My account",
      "Settings",
      "Customization",
      "Add team account",
    ]) {
      await expect(
        page.getByRole("menuitem", { name: new RegExp(`^${oldLabel}$`, "i") }),
      ).toHaveCount(0);
    }

    const administration = page.getByRole("menuitem", {
      name: /^administration$/i,
    });
    const staffDirectory = page.getByRole("menuitem", {
      name: /^staff directory$/i,
    });
    const about = page.getByRole("menuitem", { name: /^about$/i });
    const logout = page.getByRole("menuitem", { name: /^sign out$/i });

    await expect(administration).toBeVisible();
    await expect(staffDirectory).toBeVisible();
    await expect(about).toBeVisible();
    await expect(logout).toBeVisible();

    await expect(administration).toHaveAttribute("href", /\/admin$/);
    await expect(staffDirectory).toHaveAttribute("href", /\/admin\/teams$/);

    await administration.click();
    await page.waitForURL(/\/admin$/);

    await expect(
      page.getByRole("heading", { name: /^administration$/i }),
    ).toBeVisible();
    await expect(page.getByText(/people and access/i)).toBeVisible();

    await assertNoErrorBanner(page);
  });
});
