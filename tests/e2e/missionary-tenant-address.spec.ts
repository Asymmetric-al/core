import { readFileSync } from "node:fs";
import path from "node:path";

import { expect as baseExpect, test, type Page } from "@playwright/test";

import {
  documentScope,
  fixturePerson,
  signInAs,
  signsInThroughStub,
  softNavigate,
  TENANTS,
  tenantPath,
  trackDocumentLoads,
  tenantFreeShellProblems,
} from "./helpers/tenant-address";

/**
 * The missionary workspace under the tenant in the page address (plan 5.2;
 * WP2b, AL-2675). Runs in the missionary surface project
 * (`-c playwright.missionary.config.ts`): development signs fixture people in
 * through signed E2E bypass cookies, a production build
 * (`E2E_SUPABASE_STUB_URL` set) through the Supabase stub.
 */
const { demo: DEMO, second: SECOND, foreign: FOREIGN } = TENANTS;
// A first visit compiles the route in `next dev`, which takes more than the
// default five seconds on a loaded machine.
const expect = baseExpect.configure({ timeout: 90_000 });

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "missionary-boneyard",
    "Missionary workspace surface project only",
  );
});

function baseURL(): string {
  return test.info().project.use.baseURL!;
}

async function markDocument(page: Page) {
  await page.evaluate(() => {
    (window as unknown as { __tenantDoc?: boolean }).__tenantDoc = true;
  });
}

async function documentMarked(page: Page) {
  return page.evaluate(
    () => (window as unknown as { __tenantDoc?: boolean }).__tenantDoc === true,
  );
}

test("a deep link to an organization the missionary does not belong to is refused before the page shell", async ({
  page,
}) => {
  await signInAs(page, "missionary", "missionary", baseURL());

  for (const tenant of [SECOND, FOREIGN]) {
    const raw = await page.request.get(tenantPath(tenant, "/settings"), {
      maxRedirects: 0,
    });
    expect(raw.status()).toBe(307);
    expect(new URL(raw.headers()["location"]!, baseURL()).pathname).toBe(
      "/no-access",
    );
    expect(await raw.text()).not.toMatch(/<html|data-tenant-scope/i);
  }

  await page.goto(tenantPath(DEMO, "/settings"));
  expect((await documentScope(page)).prefix).toBe(`/${DEMO}`);
});

test("a signed-in person with no missionary row in the address's organization is stopped by the proxy", async ({
  page,
}) => {
  await signInAs(page, "missionary", "twoRows", baseURL());

  const raw = await page.request.get(tenantPath(DEMO, "/"), {
    maxRedirects: 0,
  });

  expect(raw.status()).toBe(307);
  expect(raw.headers()["location"]).toMatch(/\/(no-access|login)/);
});

test("a sub-role suffix is never kept in the missionary workspace", async ({
  page,
}) => {
  await signInAs(page, "missionary", "missionary", baseURL());

  const raw = await page.request.get(
    tenantPath(DEMO, "/settings?tab=account", "finance"),
    { maxRedirects: 0 },
  );

  expect(raw.status()).toBe(307);
  expect(raw.headers()["location"]).toMatch(
    new RegExp(`/${DEMO}/settings\\?tab=account$`),
  );
});

test("a missionary in both fixture organizations reaches each only under its own address", async ({
  page,
}) => {
  const [inDemo, inSecond] = fixturePerson("twoTenantMissionary").memberships;
  await signInAs(page, "missionary", "twoTenantMissionary", baseURL());

  await page.goto("/settings");
  await expect(
    page.getByRole("heading", { name: "Choose an organization" }),
  ).toBeVisible();
  await page.getByRole("main").getByRole("link").nth(1).click();
  await page.waitForURL(`**/${SECOND}/settings`);
  expect(await documentScope(page)).toEqual({
    prefix: `/${SECOND}`,
    assignment: inSecond!.id,
  });

  await page.goto(tenantPath(DEMO, "/settings"));
  expect(await documentScope(page)).toEqual({
    prefix: `/${DEMO}`,
    assignment: inDemo!.id,
  });

  // A soft navigation to the other organization's address reloads.
  await markDocument(page);
  await softNavigate(page, tenantPath(SECOND, "/settings"));
  await page.waitForFunction(
    () => (window as unknown as { __tenantDoc?: boolean }).__tenantDoc !== true,
    undefined,
    { timeout: 120_000 },
  );
  await expect(page.locator("[data-tenant-scope]")).toHaveAttribute(
    "data-tenant-scope",
    `/${SECOND}`,
  );
});

test("navigation between workspace pages stays soft, with the sidebar's links prefixed", async ({
  page,
}) => {
  await signInAs(page, "missionary", "missionary", baseURL());
  const documents = trackDocumentLoads(page);

  await page.goto(tenantPath(DEMO, "/settings"));
  await expect(page.locator("[data-tenant-scope]")).toHaveCount(1);
  await markDocument(page);
  const before = documents.length;

  const tasks = page
    .getByRole("navigation", { name: "Missionary workspace" })
    .getByRole("link", { name: /^Tasks/ })
    .first();
  await expect(tasks).toHaveAttribute("href", `/${DEMO}/tasks`);
  await tasks.click();
  await page.waitForURL(`**/${DEMO}/tasks`);
  await expect(
    page.locator(`a[aria-current="page"][href="/${DEMO}/tasks"]`),
  ).not.toHaveCount(0);

  expect(documents.slice(before)).toEqual([]);
  expect(await documentMarked(page)).toBe(true);
});

test("sign-in returns to the prefixed address", async ({ page }) => {
  const raw = await page.request.get(tenantPath(DEMO, "/tasks"), {
    maxRedirects: 0,
  });

  expect(raw.status()).toBe(307);
  expect(raw.headers()["location"]).toContain(
    `/login?next=${encodeURIComponent(`/${DEMO}/tasks`)}`,
  );
});

test("sign-in, the callback's landing and the recovery steps keep the browser's host and the full address", async ({
  page,
}) => {
  // WP1.4 keeps every auth redirect relative, so the browser stays on the
  // host its session cookies belong to; the tenant address keeps the full
  // address for sign-in and takes account screens out of the tenant segment.
  const signIn = await page.request.get(tenantPath(DEMO, "/tasks?view=week"), {
    maxRedirects: 0,
  });
  expect(signIn.status()).toBe(307);
  expect(signIn.headers()["location"]).toBe(
    `/login?next=${encodeURIComponent(`/${DEMO}/tasks?view=week`)}`,
  );

  await signInAs(page, "missionary", "missionary", baseURL());
  // The sign-in callback sends a person of this app to `/`.
  const landing = await page.request.get("/", { maxRedirects: 0 });
  expect(landing.status()).toBe(307);
  expect(landing.headers()["location"]).toBe(`/${DEMO}`);

  for (const path of [
    "/forgot-password",
    "/forgot-password/reset",
    "/auth/callback",
  ]) {
    // Built by hand: the link helpers never put an account path under a
    // prefix, so this is an address typed or kept from before.
    const prefixed = await page.request.get(`/${DEMO}${path}`, {
      maxRedirects: 0,
    });
    expect(prefixed.status(), path).toBe(307);
    expect(prefixed.headers()["location"], path).toBe(path);
  }
});

/**
 * Council round 1, A7: a document loaded outside the tenant segment never
 * shows a workspace page without its document scope. Both ways in start at
 * an account screen, whose document rendered the layout's public branch.
 */
test("a refused deep link's way home enters the workspace with its one document scope", async ({
  page,
}) => {
  const [row] = fixturePerson("missionary").memberships;
  await signInAs(page, "missionary", "missionary", baseURL());
  await page.goto(tenantPath(FOREIGN, "/tasks"));
  await page.waitForURL(/\/no-access$/);

  await page.getByRole("link", { name: "Go to home" }).click();
  await page.waitForURL(new RegExp(`/${DEMO}$`));
  await expect(page.locator("[data-tenant-scope]")).toHaveCount(1);
  expect(await documentScope(page)).toEqual({
    prefix: `/${DEMO}`,
    assignment: row!.id,
  });
});

test("the chooser's way in for a person with one row enters the workspace with its one document scope", async ({
  page,
}) => {
  const [row] = fixturePerson("missionary").memberships;
  await signInAs(page, "missionary", "missionary", baseURL());
  await page.goto("/choose-organization");
  await page.waitForURL(new RegExp(`/${DEMO}$`));
  await expect(page.locator("[data-tenant-scope]")).toHaveCount(1);
  expect(await documentScope(page)).toEqual({
    prefix: `/${DEMO}`,
    assignment: row!.id,
  });
});

// Council round 1, A11: under the tenant address the two retired pages had
// become redirects streamed with status 200. They answer a real 308 again,
// keeping the tenant in the address.
test("the retired update pages answer a real permanent redirect to the feed", async ({
  page,
}) => {
  await signInAs(page, "missionary", "missionary", baseURL());

  for (const [from, to] of [
    [tenantPath(DEMO, "/ministry-updates"), tenantPath(DEMO, "/feed")],
    [tenantPath(DEMO, "/email-studio"), tenantPath(DEMO, "/feed")],
    ["/ministry-updates", "/feed"],
    ["/email-studio", "/feed"],
  ] as const) {
    const response = await page.request.get(from, { maxRedirects: 0 });
    expect(response.status(), from).toBe(308);
    expect(
      new URL(response.headers()["location"]!, baseURL()).pathname,
      from,
    ).toBe(to);
  }
});

test.describe("production build", () => {
  test.skip(!signsInThroughStub, "Measured on a production build only");

  test("every organization receives the route's one prerendered shell", async ({
    page,
  }) => {
    const shell = readFileSync(
      path.join(process.cwd(), "apps/missionary/.next/server/app/tasks.html"),
      "utf8",
    );
    // The one shell holds no tenant at all (A15).
    expect(tenantFreeShellProblems(shell)).toEqual([]);
    for (const tenant of [DEMO, SECOND]) {
      await signInAs(page, "missionary", "twoTenantMissionary", baseURL());
      const response = await page.request.get(tenantPath(tenant, "/tasks"));
      expect(response.status()).toBe(200);
      expect(response.headers()["x-nextjs-prerender"]).toBe("1");
      expect(response.headers()["x-nextjs-postponed"]).toBe("1");
      expect((await response.text()).startsWith(shell)).toBe(true);
    }
  });
});
