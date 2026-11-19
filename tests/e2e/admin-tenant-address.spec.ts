import { readFileSync } from "node:fs";
import path from "node:path";

import { instant } from "@next/playwright";
import { expect as baseExpect, test, type Page } from "@playwright/test";

import {
  documentScope,
  fixturePerson,
  signInAs,
  organizationLabel,
  signsInThroughStub,
  softNavigate,
  TENANTS,
  tenantPath,
  trackDocumentLoads,
  tenantFreeShellProblems,
  withServerBoundToLoopbackLiteral,
} from "./helpers/tenant-address";

/**
 * Mission Control under the tenant in the page address (plan 5.2; WP2b,
 * AL-2675). Runs in the admin surface project (`-c playwright.admin.config.ts`):
 * in development fixture people sign in through signed E2E bypass cookies; on
 * a production build (`E2E_SUPABASE_STUB_URL` set) through the Supabase stub,
 * which exercises the real-session code path. Member-care API responses are
 * fixtures served at the network boundary; no product code reads them.
 */
const { demo: DEMO, second: SECOND, foreign: FOREIGN } = TENANTS;
// A first visit compiles the route in `next dev`, which takes more than the
// default five seconds on a loaded machine.
const expect = baseExpect.configure({ timeout: 90_000 });
const production = signsInThroughStub;

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "admin-boneyard",
    "Mission Control surface project only",
  );
});

const PERSONNEL = Array.from({ length: 12 }, (_, index) => {
  const n = String(index + 1).padStart(2, "0");
  return {
    id: `p-${n}`,
    name: `Person ${n}`,
    nameMissing: false,
    location: "Nairobi",
    timezone: "Africa/Nairobi",
    status: "Healthy",
    lastCheckIn: "2026-11-01T10:00:00.000Z",
    initials: `P${n}`,
    role: "Field worker",
    region: "Africa",
    healthSignals: { emotional: 4, spiritual: 4, physical: 4, financial: 4 },
    careGaps: [],
  };
});

async function serveMemberCareFixtures(page: Page) {
  await page.route("**/api/admin/member-care/dashboard", (route) =>
    route.fulfill({
      json: {
        lastContacts: {},
        personnelTotal: PERSONNEL.length,
        personnel: PERSONNEL,
        activities: [],
        goals: [],
        requirements: [],
      },
    }),
  );
  await page.route("**/api/admin/member-care/directory/*", (route) => {
    const id = new URL(route.request().url()).pathname.split("/").pop();
    const personnel = PERSONNEL.find((person) => person.id === id) ?? null;
    return route.fulfill({
      status: personnel ? 200 : 404,
      json: {
        personnel,
        activities: [],
        privateNotes: [],
        goals: [],
        requirements: [],
      },
    });
  });
}

function baseURL(): string {
  return test.info().project.use.baseURL!;
}

function personLink(page: Page, name: string) {
  return page
    .getByRole("region", { name: /Member Care personnel/i })
    .getByRole("link", { name: new RegExp(name) })
    .first();
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

async function waitForNewDocument(page: Page) {
  await page.waitForFunction(
    () => (window as unknown as { __tenantDoc?: boolean }).__tenantDoc !== true,
    undefined,
    { timeout: 120_000 },
  );
}

test("a deep link to a tenant the person does not belong to is refused before the page shell, and switches nothing", async ({
  page,
}) => {
  await signInAs(page, "admin", "demoAdmin", baseURL());

  for (const tenant of [SECOND, FOREIGN]) {
    const raw = await page.request.get(tenantPath(tenant, "/care/directory"), {
      maxRedirects: 0,
    });
    const body = await raw.text();
    expect(raw.status()).toBe(307);
    expect(new URL(raw.headers()["location"]!, baseURL()).pathname).toBe(
      "/no-access",
    );
    // The proxy answered: no page markup, no shell, no scope.
    expect(body).not.toMatch(/<html|<body|data-tenant-scope/i);
  }

  await page.goto(tenantPath(SECOND, "/care"));
  await expect(page).toHaveURL(/\/no-access$/);

  // The person's own organization is untouched.
  await page.goto(tenantPath(DEMO, "/care"));
  expect((await documentScope(page)).prefix).toBe(`/${DEMO}`);
});

// Council on the joined release, JB8: on a real session the proxy's own
// membership decision refuses (/no-access); under the development bypass a
// role the app does not allow is never admitted (packages/auth/middleware.ts),
// so the request reads as signed out (/login). Each mode asserts its answer.
test("a signed-in person with only a missionary row is refused by the proxy, or under the bypass never admitted", async ({
  page,
}) => {
  await signInAs(page, "admin", "missionary", baseURL());

  const raw = await page.request.get(tenantPath(DEMO, "/"), {
    maxRedirects: 0,
  });

  // A missionary row is not a staff row: the proxy refuses, or, in
  // development, never admits the bypass role at all.
  expect(raw.status()).toBe(307);
  expect(new URL(raw.headers()["location"]!, baseURL()).pathname).toBe(
    signsInThroughStub ? "/no-access" : "/login",
  );
  expect(await raw.text()).not.toMatch(/data-tenant-scope/);
});

test("the page renders with the scope the proxy decided, so the rewrite stayed inside the server", async ({
  page,
}) => {
  const admin = fixturePerson("demoAdmin");
  await signInAs(page, "admin", "demoAdmin", baseURL());

  // Forged scope headers from the client are ignored.
  const html = await (
    await page.request.get(tenantPath(DEMO, "/care"), {
      headers: {
        "x-asym-tenant": SECOND,
        "x-asym-assignment": fixturePerson("twoTenants").memberships[1]!.id,
        "x-asym-address-prefix": `/${SECOND}`,
      },
    })
  ).text();

  // Record D-19: a rewrite treated as external would have rendered this page
  // with no scope, or failed loudly.
  expect(html).toContain(`data-tenant-scope="/${DEMO}"`);
  expect(html).toContain(
    `data-tenant-assignment="${admin.memberships[0]!.id}"`,
  );
});

test("a page address that names a sub-role the person does not hold opens under their one assignment", async ({
  page,
}) => {
  await signInAs(page, "admin", "demoAdmin", baseURL());

  const raw = await page.request.get(
    tenantPath(DEMO, "/care?tab=open", "finance"),
    { maxRedirects: 0 },
  );
  expect(raw.status()).toBe(307);
  expect(raw.headers()["location"]).toMatch(
    new RegExp(`/${DEMO}/care\\?tab=open$`),
  );

  await page.goto(tenantPath(DEMO, "/care", "finance"));
  await expect(page).toHaveURL(new RegExp(`/${DEMO}/care$`));
  expect(await documentScope(page)).toEqual({
    prefix: `/${DEMO}`,
    assignment: fixturePerson("demoAdmin").memberships[0]!.id,
  });
});

test("a person with finance and member-care rows chooses one and acts under it, and an unheld suffix never acts", async ({
  page,
}) => {
  const person = fixturePerson("twoRows");
  const [finance, care] = person.memberships;
  await serveMemberCareFixtures(page);
  await signInAs(page, "admin", "twoRows", baseURL());

  for (const address of [
    tenantPath(DEMO, "/care/directory"),
    tenantPath(DEMO, "/care/directory", "hr"),
  ]) {
    const raw = await page.request.get(address, { maxRedirects: 0 });
    expect(raw.status()).toBe(307);
    expect(raw.headers()["location"]).toContain(
      `/choose-organization?tenant=${DEMO}&next=%2Fcare%2Fdirectory`,
    );
  }

  await page.goto(tenantPath(DEMO, "/care/directory", "hr"));
  await expect(
    page.getByRole("heading", {
      name: `Choose your role in ${organizationLabel(DEMO)}`,
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /HR/ })).toHaveCount(0);

  await markDocument(page);
  await page.getByRole("link", { name: /Member care/ }).click();
  await page.waitForURL(`**/${DEMO}~member_care/care/directory`);
  await expect(personLink(page, "Person 01")).toBeVisible();
  expect(await documentMarked(page)).toBe(false);
  expect(await documentScope(page)).toEqual({
    prefix: `/${DEMO}~member_care`,
    assignment: care!.id,
  });

  // The finance row is reachable only under its own suffix.
  await page.goto(tenantPath(DEMO, "/care/directory", "finance"));
  expect((await documentScope(page)).assignment).toBe(finance!.id);
});

test("a user with memberships in both fixture tenants reaches each organization only under its own address", async ({
  page,
}) => {
  const [inDemo, inSecond] = fixturePerson("twoTenants").memberships;
  await signInAs(page, "admin", "twoTenants", baseURL());

  // No tenant in the address: the person chooses.
  await page.goto("/care");
  await expect(
    page.getByRole("heading", { name: "Choose an organization" }),
  ).toBeVisible();
  // One option per organization, listed in tenant-ID order.
  const links = page.getByRole("main").getByRole("link");
  await expect(links).toHaveCount(2);
  await links.nth(1).click();
  await page.waitForURL(`**/${SECOND}/care`);
  expect(await documentScope(page)).toEqual({
    prefix: `/${SECOND}`,
    assignment: inSecond!.id,
  });

  await page.goto(tenantPath(DEMO, "/care"));
  expect(await documentScope(page)).toEqual({
    prefix: `/${DEMO}`,
    assignment: inDemo!.id,
  });

  await page.goto(tenantPath(FOREIGN, "/care"));
  await expect(page).toHaveURL(/\/no-access$/);
});

test("an address whose tenant segment or suffix differs from the document's scope renders nothing and reloads", async ({
  page,
}) => {
  await serveMemberCareFixtures(page);
  const documents = trackDocumentLoads(page);

  // Another organization.
  await signInAs(page, "admin", "twoTenants", baseURL());
  await page.goto(tenantPath(DEMO, "/care/directory"));
  await expect(personLink(page, "Person 01")).toBeVisible();
  await markDocument(page);
  let before = documents.length;
  await softNavigate(page, tenantPath(SECOND, "/care/directory"));
  await waitForNewDocument(page);
  await expect(personLink(page, "Person 01")).toBeVisible();
  expect(documents.length).toBeGreaterThan(before);
  expect((await documentScope(page)).prefix).toBe(`/${SECOND}`);

  // Another assignment in the same organization.
  await signInAs(page, "admin", "twoRows", baseURL());
  await page.goto(tenantPath(DEMO, "/care/directory", "finance"));
  await expect(personLink(page, "Person 01")).toBeVisible();
  await markDocument(page);
  before = documents.length;
  await softNavigate(page, tenantPath(DEMO, "/care/directory", "member_care"));
  await waitForNewDocument(page);
  await expect(personLink(page, "Person 01")).toBeVisible();
  expect(documents.length).toBeGreaterThan(before);
  expect((await documentScope(page)).prefix).toBe(`/${DEMO}~member_care`);

  // An address that lost its prefix never renders a tenant page: the proxy
  // sends this person (two rows) to the chooser, outside the signed-in
  // layout, whose options load new documents.
  await softNavigate(page, "/care");
  await page.waitForURL(/\/choose-organization\?tenant=/);
  await expect(page.locator("[data-tenant-scope]")).toHaveCount(0);
});

test("navigation between the list and a detail page stays soft, with every address prefixed", async ({
  page,
}) => {
  await serveMemberCareFixtures(page);
  await signInAs(page, "admin", "demoAdmin", baseURL());
  const documents = trackDocumentLoads(page);
  const prefix = `/${DEMO}`;

  await page.goto(tenantPath(DEMO, "/care/directory"));
  await expect(personLink(page, "Person 01")).toBeVisible();
  await markDocument(page);
  const before = documents.length;

  expect(await personLink(page, "Person 01").getAttribute("href")).toBe(
    `${prefix}/care/directory/p-01`,
  );
  await personLink(page, "Person 01").click();
  await page.waitForURL(`**${prefix}/care/directory/p-01`);
  await expect(
    page.getByRole("heading", { level: 1, name: "Person 01" }),
  ).toBeVisible();
  const breadcrumbs = await page
    .getByRole("navigation", { name: /breadcrumb/i })
    .getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(breadcrumbs).toContain(`${prefix}/care`);

  // Back through the sidebar; the active entry is found on the route path.
  await page
    .getByRole("link", { name: "Directory", exact: true })
    .first()
    .click();
  await page.waitForURL(`**${prefix}/care/directory`);
  await expect(personLink(page, "Person 02")).toBeVisible();
  await expect(
    page.locator(`a[aria-current="page"][href="${prefix}/care/directory"]`),
  ).not.toHaveCount(0);

  // A row click navigates with the router, not a link.
  await page
    .getByRole("region", { name: /Member Care personnel/i })
    .getByRole("row", { name: /Person 02/ })
    .getByText("Nairobi")
    .first()
    .click();
  await page.waitForURL(`**${prefix}/care/directory/p-02`);
  await expect(
    page.getByRole("heading", { level: 1, name: "Person 02" }),
  ).toBeVisible();

  expect(documents.slice(before)).toEqual([]);
  expect(await documentMarked(page)).toBe(true);
});

test("a server redirect keeps the tenant prefix", async ({ page }) => {
  await signInAs(page, "admin", "demoAdmin", baseURL());

  await page.goto(tenantPath(DEMO, "/contributions/gift-1"));
  await page.waitForURL(`**/${DEMO}/contributions?gift=gift-1`);
});

test("sign-in returns to the prefixed address", async ({ page }) => {
  const raw = await page.request.get(tenantPath(DEMO, "/care?tab=open"), {
    maxRedirects: 0,
  });

  expect(raw.status()).toBe(307);
  expect(raw.headers()["location"]).toContain(
    `/login?next=${encodeURIComponent(`/${DEMO}/care?tab=open`)}`,
  );
});

test("sign-in, the callback's landing and the recovery steps keep the browser's host and the full address", async ({
  page,
}) => {
  // WP1.4 keeps every auth redirect relative, so the browser stays on the
  // host its session cookies belong to; the tenant address keeps the full
  // address for sign-in and takes account screens out of the tenant segment.
  const signIn = await page.request.get(tenantPath(DEMO, "/care?tab=open"), {
    maxRedirects: 0,
  });
  expect(signIn.status()).toBe(307);
  expect(signIn.headers()["location"]).toBe(
    `/login?next=${encodeURIComponent(`/${DEMO}/care?tab=open`)}`,
  );

  await signInAs(page, "admin", "demoAdmin", baseURL());
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

// Council round 2, AR1: the CRM list wrote its address from the route path,
// with no tenant prefix, on every change of search, filter, sort or view; the
// document then reloaded at the bare address, and the proxy sent a person in
// two organizations to the chooser. The list's address keeps its prefix and
// the document stays the same.
for (const [person, tenant] of [
  ["demoAdmin", DEMO],
  ["twoTenants", SECOND],
] as const) {
  test(`changing the CRM search keeps the document and its tenant address (${person})`, async ({
    page,
  }) => {
    await signInAs(page, "admin", person, baseURL());
    const crm = tenantPath(tenant, "/crm");
    await page.goto(crm);
    await expect(page.locator("[data-tenant-scope]")).toHaveAttribute(
      "data-tenant-scope",
      `/${tenant}`,
      { timeout: 90_000 },
    );
    const search = page.getByRole("searchbox", { name: "Search CRM records" });
    await expect(search).toBeVisible();
    await page.waitForLoadState("networkidle");
    const documents = trackDocumentLoads(page);
    await markDocument(page);

    await search.fill("__no_such_contact__");
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === crm &&
        url.searchParams.get("q") === "__no_such_contact__",
    );
    await page.waitForLoadState("networkidle");

    expect(documents).toEqual([]);
    expect(await documentMarked(page)).toBe(true);
    await expect(search).toHaveValue("__no_such_contact__");
    await expect(page.locator("[data-tenant-scope]")).toHaveAttribute(
      "data-tenant-scope",
      `/${tenant}`,
    );
  });
}

test.describe("production build", () => {
  test.skip(!production, "Measured on a production build only");

  // Record D-19, council round 1, A19: bound to the loopback IP literal, the
  // same build answers a tenant page with the guard's 500, never with the
  // page rendered without its tenant; bound by the loopback name, as every
  // harness now binds it, it renders the page.
  test("a server bound to 127.0.0.1 answers a tenant page with the guard's 500, the one bound by name renders it", async ({
    page,
  }) => {
    const home = tenantPath(DEMO, "/");
    const literalPort = Number(new URL(baseURL()).port) + 1;
    await withServerBoundToLoopbackLiteral(
      "admin",
      literalPort,
      async (literal) => {
        await signInAs(page, "admin", "demoAdmin", literal);
        const refused = await page.request.get(`${literal}${home}`, {
          maxRedirects: 0,
        });
        expect(refused.status()).toBe(500);
        expect(await refused.text()).toMatch(/rewrite left the server/);
      },
    );

    await signInAs(page, "admin", "demoAdmin", baseURL());
    const rendered = await page.request.get(home, { maxRedirects: 0 });
    expect(rendered.status()).toBe(200);
    expect(await rendered.text()).toContain(`data-tenant-scope="/${DEMO}"`);
  });

  test("a person who signs in through the form reaches Web Studio from Mission Control without an error page", async ({
    page,
  }) => {
    // Council round 1, A6. The form signs in with a soft navigation, so the
    // document stays the one loaded at /login; Mission Control then fixes the
    // document's scope, and Web Studio lies outside the tenant segment.
    const person = fixturePerson("demoAdmin");
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.context().clearCookies();
    const documents = trackDocumentLoads(page);
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill(`${person.userId}@example.test`);
    await page.getByLabel("Password", { exact: true }).fill("stub-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(new RegExp(`/${DEMO}$`));
    await expect(page.locator("[data-tenant-scope]")).toHaveCount(1);
    const signedIn = [...documents];

    await page
      .getByRole("link", { name: "Web Studio", exact: true })
      .first()
      .click();
    await page.waitForURL(/\/web-studio(\/|$)/);
    await page.waitForLoadState("networkidle");
    const toWebStudio = documents.slice(signedIn.length);
    test.info().annotations.push({
      type: "documents",
      description: `after sign-in: ${signedIn.join(" ")}; after Web Studio: ${toWebStudio.join(" ") || "(none: a soft navigation)"}`,
    });
    // Council round 2, AR2: each crossing of the tenant segment's boundary is
    // a document load. The sign-in loads the tenant's address (A10), so the
    // document that renders Mission Control is not the one loaded at /login;
    // the link loads /web-studio, outside the segment.
    expect.soft(signedIn).toContain(`/${DEMO}`);
    expect.soft(toWebStudio[0]).toBe("/web-studio");
    // Web Studio's own page, not Mission Control's and not an error page. The
    // stub's person has no Web Studio (Payload) account, so Web Studio shows
    // its sign-in view, whose one mark is the Web Studio brand (it has no
    // heading or landmark); a person with an account sees the native shell.
    // Mission Control's chrome, which also names Web Studio, is gone.
    await expect(
      page
        .getByTestId("web-studio-native-shell")
        .or(page.getByText("Web Studio", { exact: true }))
        .first(),
    ).toBeVisible({ timeout: 60_000 });
    await expect(
      page.getByRole("button", { name: /open profile menu/i }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Something went wrong" }),
    ).toHaveCount(0);
    expect(await page.title()).not.toBe("Admin error");
    expect(
      pageErrors.filter((message) =>
        message.includes("does not match the document's scope"),
      ),
    ).toEqual([]);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("every tenant receives the route's one prerendered shell", async ({
    page,
  }) => {
    const shellFile = path.join(
      process.cwd(),
      "apps/admin/.next/server/app/care/directory.html",
    );
    const shell = readFileSync(shellFile, "utf8");
    // The one shell holds no tenant at all (A15).
    expect(tenantFreeShellProblems(shell)).toEqual([]);
    const served: string[] = [];
    for (const [person, tenant] of [
      ["demoAdmin", DEMO],
      ["twoTenants", SECOND],
    ] as const) {
      await signInAs(page, "admin", person, baseURL());
      const response = await page.request.get(
        tenantPath(tenant, "/care/directory"),
      );
      expect(response.status()).toBe(200);
      expect(response.headers()["x-nextjs-prerender"]).toBe("1");
      expect(response.headers()["x-nextjs-postponed"]).toBe("1");
      served.push(await response.text());
    }
    for (const body of served) {
      expect(body.startsWith(shell)).toBe(true);
    }
  });

  test("a link to the detail page commits under instant()", async ({
    page,
  }) => {
    test.skip(
      process.env.INSTANT_NAV_RIG !== "1",
      "Requires the testing API (EXPOSE_TESTING_API=1)",
    );
    await serveMemberCareFixtures(page);
    await signInAs(page, "admin", "demoAdmin", baseURL());
    await page.goto(tenantPath(DEMO, "/care/directory"));
    await expect(personLink(page, "Person 01")).toBeVisible();

    await instant(page, async () => {
      await personLink(page, "Person 01").click();
      await expect(
        page.getByRole("region", { name: /Member Care personnel/i }),
      ).toHaveCount(0);
    });
    await expect(
      page.getByRole("heading", { level: 1, name: "Person 01" }),
    ).toBeVisible();
  });
});
