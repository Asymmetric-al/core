import { expect, test } from "@playwright/test";

import { adminBaseURL } from "./base-urls";
import {
  attachPayloadDbConsoleListener,
  waitForWebStudioShellOrSkip,
} from "./cms-skip-if-no-payload";
import {
  fixturePerson,
  signInAs,
  switchOrganization,
} from "./helpers/web-studio";

test.describe("@cms Web Studio templates gallery (D-18: WP6 part 2b keys a Web Studio login by its UUID, so the gallery signs in a fixture person with a staff row, not Demo access's e2e-admin-user)", () => {
  async function signInAsAdmin(page: import("@playwright/test").Page) {
    const sawPayloadDbFailure = attachPayloadDbConsoleListener(page);
    await signInAs(page, "admin", "demoAdmin", adminBaseURL);
    await switchOrganization(
      page,
      adminBaseURL,
      fixturePerson("demoAdmin").memberships[0]!.tenantId,
      "/web-studio/templates",
    );
    await waitForWebStudioShellOrSkip(page, sawPayloadDbFailure);
  }

  test("templates route loads native shell", async ({ page }) => {
    await signInAsAdmin(page);

    await expect(page.getByTestId("web-studio-native-shell")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /template/i }).first(),
    ).toBeVisible();
  });
});
