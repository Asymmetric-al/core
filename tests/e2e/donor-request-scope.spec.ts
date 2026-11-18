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

// A cold development server's first compile takes longer than Playwright's
// default 30 seconds (the first case ran in 29.7 s); the same limit as the
// Mission Control surface's, as for the missionary request-scope spec.
test.describe.configure({ timeout: 180_000 });

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

/**
 * Record D-41 (council round 1 on slice B, SB2): leaving the portal is a
 * document load, and outside it the scope functions return nothing. The donor
 * app has one root layout, so "Give again" is a soft navigation from the
 * portal to the public checkout, whose first own-API request (its runtime
 * config, `GET /api/donate`) must name no tenant or assignment.
 */
test("leaving the portal for the public checkout loads a new document, and its own-API request carries no scope", async ({
  page,
}) => {
  const { ok, status } = await installDemoSessionInBrowser(page, "donor");
  expect(ok, `donor demo session failed with status ${status}`).toBeTruthy();

  // The seeded donor has no paid gift; give the portal one, so it offers
  // "Give again" to that gift's missionary.
  const missionary = {
    id: "20000000-0000-0000-0000-000000000001",
    name: "Fixture Missionary",
    avatarUrl: null,
  };
  await page.route("**/api/donor/portal", async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    const response = await route.fetch();
    const snapshot = (await response.json()) as { donations?: unknown[] };
    snapshot.donations = [
      {
        id: "e2e-paid-gift",
        date: "2026-11-01",
        amountCents: 5000,
        amount: 50,
        currency: "USD",
        status: "Paid",
        type: "One-Time",
        method: "Card",
        receiptUrl: "/api/donor/receipts/e2e-paid-gift",
        statementYear: 2026,
        designation: {
          id: missionary.id,
          name: missionary.name,
          type: "missionary",
          avatarUrl: null,
        },
        missionary,
        fund: null,
      },
      ...(snapshot.donations ?? []),
    ];
    await route.fulfill({ response, json: snapshot });
  });

  // The checkout's first own-API request, with every header it carried.
  const checkoutHeaders = new Promise<Record<string, string>>((resolve) => {
    void page.route("**/api/donate", async (route) => {
      if (route.request().method() !== "GET") return route.continue();
      resolve(await route.request().allHeaders());
      await route.fulfill({ json: { publishableKey: null } });
    });
  });

  await page.goto("/donor-dashboard", {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await expect(page.locator("[data-tenant-assignment]")).toHaveCount(1);
  // A mark that lives exactly as long as this document.
  await page.evaluate(() => {
    (window as Window & { __portalDocument?: true }).__portalDocument = true;
  });

  await page
    .getByRole("link", { name: `Give to ${missionary.name} again` })
    .click();

  const headers = await checkoutHeaders;
  expect(headers["x-asym-tenant"]).toBeUndefined();
  expect(headers["x-asym-assignment"]).toBeUndefined();
  // Leaving the portal loaded the checkout as a new document.
  await page.waitForURL(/\/checkout\?/);
  await page.waitForFunction(
    () => !(window as Window & { __portalDocument?: true }).__portalDocument,
    undefined,
    { timeout: 60_000 },
  );
});
