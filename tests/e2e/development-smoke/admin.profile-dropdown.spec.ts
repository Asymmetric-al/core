import { expect, test } from "@playwright/test";

import {
  assertNoErrorBanner,
  assertNoVisibleLoginPrompt,
  collectFailureEvidence,
  ensureAuthenticated,
} from "./helpers";

/**
 * Headless verification of the admin profile dropdown fix on the
 * development deployment. Mirrors the manual Claude-in-Chrome smoke flow.
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

    // 1. Mission Control shell visible (uses the GiveHope tenant title).
    await expect(page).toHaveTitle(/Mission Control/i);
    await assertNoVisibleLoginPrompt(page);

    // 2. Open the profile dropdown.
    const profileButton = page.getByRole("button", {
      name: /open profile menu/i,
    });
    await profileButton.click();

    // 3. Old template items must be absent.
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

    // 4. Expected items present.
    const administration = page.getByRole("menuitem", {
      name: /^administration$/i,
    });
    const manageTeam = page.getByRole("menuitem", { name: /^manage team$/i });
    const about = page.getByRole("menuitem", { name: /^about$/i });
    const logout = page.getByRole("menuitem", { name: /^logout$/i });

    await expect(administration).toBeVisible();
    await expect(manageTeam).toBeVisible();
    await expect(about).toBeVisible();
    await expect(logout).toBeVisible();

    // 5. Destination hrefs.
    await expect(administration).toHaveAttribute("href", /\/admin$/);
    await expect(manageTeam).toHaveAttribute("href", /\/admin\/teams$/);

    // 6. Click Administration and confirm /admin lands.
    await administration.click();
    await page.waitForURL(/\/admin$/);

    await expect(
      page.getByRole("heading", { name: /^administration$/i }),
    ).toBeVisible();
    await expect(page.getByText(/service operational status/i)).toBeVisible();

    await assertNoErrorBanner(page);
  });
});
