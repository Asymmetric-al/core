import {
  expect as baseExpect,
  test,
  type Locator,
  type Page,
} from "@playwright/test";

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

/**
 * Waits until React has hydrated `control`, then two frames. A click on a
 * server-rendered link before hydration follows the anchor natively, which
 * is a document load whatever the page's code would have done, so a
 * crossing case would pass for the wrong reason (as slice A's AR12 waits
 * for the workspace's chrome).
 */
async function waitForHydrated(page: Page, control: Locator) {
  await expect(control).toBeVisible();
  await expect
    .poll(() =>
      control.evaluate((element) =>
        Object.keys(element).some((key) => key.startsWith("__reactFiber$")),
      ),
    )
    .toBe(true);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

interface LoggedRequest {
  path: string;
  kind: string;
  method: string;
  failed?: string;
}

/** Every request this page makes to one of `paths`, in order, by kind. */
function logRequests(page: Page, paths: readonly string[]) {
  const log: LoggedRequest[] = [];
  const entries = new Map<unknown, LoggedRequest>();
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (!paths.includes(path)) return;
    const entry = {
      path,
      kind: request.isNavigationRequest()
        ? `navigation:${request.resourceType()}`
        : request.resourceType(),
      method: request.method(),
    };
    entries.set(request, entry);
    log.push(entry);
  });
  page.on("requestfailed", (request) => {
    const entry = entries.get(request);
    if (entry) entry.failed = request.failure()?.errorText ?? "failed";
  });
  return log;
}

const ofPath = (log: readonly LoggedRequest[], path: string) =>
  log.filter((entry) => entry.path === path);

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
 * Record D-41 (council round 1 on slice B, SB2; council round 2, BR2):
 * leaving the portal is one document load at the click, and outside it the
 * scope functions return nothing. The checkout's own-API request (its
 * runtime config, `GET /api/donate`) names no tenant or assignment, and is
 * sent once: the checkout never renders on the portal's document first.
 */
test("leaving the portal for the public checkout loads one new document, whose own-API requests carry no scope", async ({
  page,
}) => {
  const { ok, status } = await installDemoSessionInBrowser(page, "donor");
  expect(ok, `donor demo session failed with status ${status}`).toBeTruthy();

  // The portal offers "Give again" for the donor's newest paid gift. Whatever
  // the seed holds, one is added, dated now, so the link is there and leads
  // to the checkout for a seeded missionary.
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
        date: new Date().toISOString(),
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

  // Every runtime-config request the checkout makes, with every header it
  // carried.
  const configHeaders: Record<string, string>[] = [];
  await page.route("**/api/donate", async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    configHeaders.push(await route.request().allHeaders());
    await route.fulfill({ json: { publishableKey: null } });
  });

  const log = logRequests(page, ["/checkout", "/api/donate"]);

  // What the checkout itself costs when loaded directly: one document and
  // its runtime-config requests. A production build sends one; on a
  // development server React's StrictMode runs the checkout's config effect
  // twice in one document, the first cancelled by its own cleanup. Leaving
  // the portal must cost exactly that, and nothing from the portal's
  // document.
  let from = log.length;
  await page.goto(`/checkout?missionary_id=${missionary.id}`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await page.waitForLoadState("networkidle");
  const direct = log.slice(from);
  const directConfigRequests = ofPath(direct, "/api/donate").filter(
    (entry) => entry.method === "GET",
  ).length;
  expect(directConfigRequests).toBeGreaterThanOrEqual(1);
  expect(directConfigRequests).toBeLessThanOrEqual(2);

  await page.goto("/donor-dashboard", {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await expect(page.locator("[data-tenant-assignment]")).toHaveCount(1);
  const giveAgain = page.getByRole("link", { name: /^Give to .+ again$/ });
  await waitForHydrated(page, giveAgain);
  // A mark that lives exactly as long as this document.
  await page.evaluate(() => {
    (window as Window & { __portalDocument?: true }).__portalDocument = true;
  });
  from = log.length;
  const configFrom = configHeaders.length;

  await giveAgain.click();

  // Leaving the portal loaded the checkout as a new document.
  await page.waitForURL(/\/checkout\?/);
  await page.waitForFunction(
    () => !(window as Window & { __portalDocument?: true }).__portalDocument,
    undefined,
    { timeout: 60_000 },
  );
  await page.waitForLoadState("networkidle");
  const leaving = log.slice(from);
  // Once, as a document, and first: the checkout never rendered on the
  // portal's document (which would have asked for it as a router request,
  // and sent its runtime-config request from there, before the reload).
  expect(ofPath(leaving, "/checkout")).toEqual([
    { path: "/checkout", kind: "navigation:document", method: "GET" },
  ]);
  expect(leaving[0]).toEqual({
    path: "/checkout",
    kind: "navigation:document",
    method: "GET",
  });
  // The checkout's runtime-config requests, exactly as many as a direct
  // load sends, all from its own document.
  expect(
    ofPath(leaving, "/api/donate").filter((entry) => entry.method === "GET"),
  ).toHaveLength(directConfigRequests);
  // None of them named a tenant or an assignment.
  const leavingHeaders = configHeaders.slice(configFrom);
  expect(leavingHeaders).toHaveLength(directConfigRequests);
  for (const headers of leavingHeaders) {
    expect(headers["x-asym-tenant"]).toBeUndefined();
    expect(headers["x-asym-assignment"]).toBeUndefined();
  }
});

/**
 * Council round 2, BR2: entering the portal from the public site is one
 * document load at the click, through the public footer's "Donor Portal"
 * link, never a render on the public page's document followed by a reload.
 */
test("entering the portal from the public footer loads it as one new document", async ({
  page,
}) => {
  const { ok, status } = await installDemoSessionInBrowser(page, "donor");
  expect(ok, `donor demo session failed with status ${status}`).toBeTruthy();

  await page.goto("/about", {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  const portalLink = page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Donor Portal" });
  await waitForHydrated(page, portalLink);
  await page.evaluate(() => {
    (window as Window & { __publicDocument?: true }).__publicDocument = true;
  });
  const log = logRequests(page, ["/donor-dashboard"]);

  await portalLink.click();

  await page.waitForURL(/\/donor-dashboard$/);
  await expect(page.locator("[data-tenant-assignment]")).toHaveCount(1);
  await page.waitForFunction(
    () => !(window as Window & { __publicDocument?: true }).__publicDocument,
    undefined,
    { timeout: 60_000 },
  );
  await page.waitForLoadState("networkidle");
  // Once, as a document that did not fail: no router request for the portal
  // from the public page's document first.
  expect(log).toEqual([
    { path: "/donor-dashboard", kind: "navigation:document", method: "GET" },
  ]);
});
