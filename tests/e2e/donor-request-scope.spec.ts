import { expect as baseExpect, test } from "@playwright/test";

import { installDemoSessionInBrowser } from "./helpers/install-demo-session";
import { TENANTS } from "./helpers/tenant-address";

/**
 * The donor portal's document scope (plan 12, WP2, "Interim rules until WP3";
 * WP2b, AL-2675): the portal has no tenant in its address, so its pages take
 * their scope from the person's one live donor membership, and its calls to
 * its own API carry that scope through the same wrapper as Mission Control's
 * and the workspace's.
 */
const expect = baseExpect.configure({ timeout: 90_000 });

test("the donor portal renders in the donor membership's scope and its own-API calls carry it", async ({
  page,
}) => {
  const { ok, status } = await installDemoSessionInBrowser(page, "donor");
  expect(ok, `donor demo session failed with status ${status}`).toBeTruthy();

  const call = page.waitForRequest(
    (request) => new URL(request.url()).pathname === "/api/donor/portal",
  );
  await page.goto("/donor-dashboard", {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });

  const marker = page.locator("[data-tenant-assignment]");
  await expect(marker).toHaveCount(1);
  const tenant = await marker.getAttribute("data-tenant-scope");
  const assignment = await marker.getAttribute("data-tenant-assignment");
  expect(tenant).toBe(TENANTS.demo);
  expect(assignment).toBeTruthy();

  const headers = (await call).headers();
  expect(headers["x-asym-tenant"]).toBe(tenant);
  expect(headers["x-asym-assignment"]).toBe(assignment);
});
