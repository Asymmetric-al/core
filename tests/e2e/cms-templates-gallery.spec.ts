import { expect, test } from "@playwright/test";

import { adminBaseURL } from "./base-urls";
import {
  attachPayloadDbConsoleListener,
  waitForWebStudioShellOrSkip,
} from "./cms-skip-if-no-payload";

test.describe("@cms Web Studio templates gallery", () => {
  async function signInAsAdmin(page: import("@playwright/test").Page) {
    const sawPayloadDbFailure = attachPayloadDbConsoleListener(page);

    const availability = await page.request.get(
      `${adminBaseURL}/api/auth/demo-account`,
    );
    test.skip(!availability.ok(), "Demo availability endpoint is unavailable.");

    const payload = (await availability.json()) as {
      roles?: Record<string, boolean>;
      availableRoles?: Record<string, boolean>;
    };
    const roles = payload.roles ?? payload.availableRoles ?? {};
    test.skip(!roles.admin, "Admin demo account is not configured.");

    await page.goto(
      `${adminBaseURL}/login?next=${encodeURIComponent("/web-studio/templates")}`,
    );
    await page.getByRole("button", { name: "Demo Access" }).click();
    await page.waitForURL(/\/web-studio\/templates/);
    await waitForWebStudioShellOrSkip(page, sawPayloadDbFailure);
  }

  test("templates route loads native shell", async ({ page }) => {
    await signInAsAdmin(page);

    await expect(page.getByTestId("web-studio-native-shell")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /templates/i }).first(),
    ).toBeVisible();
  });
});
