import {
  expect as baseExpect,
  test,
  type Page,
  type Route,
} from "@playwright/test";

import {
  documentScope,
  fixturePerson,
  restoreRevokedMemberships,
  revokeMembership,
  signInAs,
  signsInThroughStub,
  softNavigate,
  TENANTS,
  tenantPath,
  trackDocumentLoads,
} from "./helpers/tenant-address";

/**
 * The tenant and the assignment on every request a Mission Control page makes
 * (plan 5.2; WP2b, AL-2675). Runs in the admin surface project
 * (`-c playwright.admin.config.ts`), as the tenant-address suite does.
 *
 * Member care's API answers at the network boundary as the resolver would for
 * these fixture people: with the rows of the organization and assignment the
 * request's `x-asym-tenant` and `x-asym-assignment` headers name, and with a
 * refusal when they name no assignment of the person's, which is how the
 * resolver treats a person in two organizations, or with two staff rows in
 * one, who names none. A finance assignment holds no `care.access`, so the
 * care API refuses it. A refusal of the tenant or assignment a request named
 * carries the `x-asym-scope-refused` header, as the resolver's own refusal
 * does (council on the joined release, JB1); a refusal of a request that
 * named none, or a 403, does not.
 */
const { demo: DEMO, second: SECOND } = TENANTS;
const expect = baseExpect.configure({ timeout: 90_000 });

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "admin-boneyard",
    "Mission Control surface project only",
  );
});

function baseURL(): string {
  return test.info().project.use.baseURL!;
}

function personnel(prefix: string) {
  return Array.from({ length: 3 }, (_, index) => {
    const n = String(index + 1).padStart(2, "0");
    return {
      id: `${prefix.toLowerCase()}-${n}`,
      name: `${prefix} Person ${n}`,
      nameMissing: false,
      location: "Nairobi",
      timezone: "Africa/Nairobi",
      status: "Healthy",
      lastCheckIn: "2026-11-01T10:00:00.000Z",
      initials: `${prefix[0]}${n}`,
      role: "Field worker",
      region: "Africa",
      healthSignals: { emotional: 4, spiritual: 4, physical: 4, financial: 4 },
      careGaps: [],
    };
  });
}

type CareScope = { tenant: string; rows: ReturnType<typeof personnel> | null };

/**
 * Serves member care by the request's scope. `scopes` maps an assignment id
 * to its tenant and its rows (`null`: the assignment may not read care).
 * Returns every request's scope headers, in order; with `hold`, `heldSettled`
 * resolves once the held request's answer has been delivered or has failed
 * because its document is gone.
 */
async function serveScopedMemberCare(
  page: Page,
  scopes: Record<string, CareScope>,
  hold?: { path: RegExp; until: Promise<void> },
) {
  const seen: Array<{
    path: string;
    tenant?: string;
    assignment?: string;
    refused?: boolean;
  }> & {
    heldSettled?: Promise<"delivered" | "failed">;
  } = [];
  const answer = async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const headers = request.headers();
    const tenant = headers["x-asym-tenant"];
    const assignment = headers["x-asym-assignment"];
    const call: (typeof seen)[number] = {
      path: url.pathname,
      tenant,
      assignment,
    };
    seen.push(call);
    if (hold && hold.path.test(url.pathname)) await hold.until;
    // Read when the request is answered: a row revoked meanwhile is refused.
    const scope = assignment ? scopes[assignment] : undefined;
    if (!scope || scope.tenant !== tenant) {
      call.refused = Boolean(tenant || assignment);
      return route.fulfill({
        status: 401,
        json: { error: "Unauthorized" },
        headers: call.refused
          ? { "x-asym-scope-refused": "not_owned_or_inactive" }
          : {},
      });
    }
    if (!scope.rows) {
      return route.fulfill({ status: 403, json: { error: "Forbidden" } });
    }
    if (url.pathname.endsWith("/dashboard")) {
      return route.fulfill({
        json: {
          lastContacts: {},
          personnelTotal: scope.rows.length,
          personnel: scope.rows,
          activities: [],
          goals: [],
          requirements: [],
        },
      });
    }
    const id = url.pathname.split("/").pop();
    const person = scope.rows.find((row) => row.id === id) ?? null;
    return route.fulfill({
      status: person ? 200 : 404,
      json: {
        personnel: person,
        activities: [],
        privateNotes: [],
        goals: [],
        requirements: [],
      },
    });
  };
  await page.route("**/api/admin/member-care/**", (route) => {
    const handled = answer(route).then(
      () => "delivered" as const,
      () => "failed" as const,
    );
    if (hold && hold.path.test(new URL(route.request().url()).pathname)) {
      seen.heldSettled = handled;
    }
    return handled;
  });
  return seen;
}

function careRegion(page: Page) {
  return page.getByRole("region", { name: /Member Care personnel/i });
}

test("a person in two organizations calls the app's own API in each, under that page's scope", async ({
  page,
}) => {
  const [inDemo, inSecond] = fixturePerson("twoTenants").memberships;
  const seen = await serveScopedMemberCare(page, {
    [inDemo!.id]: { tenant: DEMO, rows: personnel("Demo") },
    [inSecond!.id]: { tenant: SECOND, rows: personnel("Second") },
  });
  await signInAs(page, "admin", "twoTenants", baseURL());

  await page.goto(tenantPath(DEMO, "/care/directory"));
  await expect(careRegion(page).getByText("Demo Person 01")).toBeVisible();
  expect(seen.at(-1)).toMatchObject({ tenant: DEMO, assignment: inDemo!.id });

  await page.goto(tenantPath(SECOND, "/care/directory"));
  await expect(careRegion(page).getByText("Second Person 01")).toBeVisible();
  expect(seen.at(-1)).toMatchObject({
    tenant: SECOND,
    assignment: inSecond!.id,
  });
  // Every call carried the scope of the document that made it.
  for (const call of seen) {
    expect([inDemo!.id, inSecond!.id]).toContain(call.assignment);
  }
});

test("switching organization shows no row cached from the previous one", async ({
  page,
}) => {
  const [inDemo, inSecond] = fixturePerson("twoTenants").memberships;
  await serveScopedMemberCare(page, {
    [inDemo!.id]: { tenant: DEMO, rows: personnel("Demo") },
    [inSecond!.id]: { tenant: SECOND, rows: personnel("Second") },
  });
  await signInAs(page, "admin", "twoTenants", baseURL());

  await page.goto(tenantPath(DEMO, "/care/directory"));
  await expect(careRegion(page).getByText("Demo Person 01")).toBeVisible();

  // Through the chooser: a new document for the second organization.
  await page.goto("/care/directory");
  await expect(
    page.getByRole("heading", { name: "Choose an organization" }),
  ).toBeVisible();
  await page.getByRole("main").getByRole("link").nth(1).click();
  await page.waitForURL(`**/${SECOND}/care/directory`);
  await expect(careRegion(page).getByText("Second Person 01")).toBeVisible();
  await expect(page.getByText(/Demo Person/)).toHaveCount(0);

  // And by a soft move back, which the tenant guard turns into a document load.
  await softNavigate(page, tenantPath(DEMO, "/care/directory"));
  await page.waitForURL(`**/${DEMO}/care/directory`);
  await expect(careRegion(page).getByText("Demo Person 01")).toBeVisible();
  await expect(page.getByText(/Second Person/)).toHaveCount(0);
});

/*
 * What carries this line is the document load: switching assignment loads a
 * new document, so the care document's late answer has no page to land in,
 * and every cache and client of the care scope is gone with it. The case
 * asserts that load, lets the held answer settle before it looks for care
 * rows, and reads the finance document's own requests (council round 1 on
 * slice B, SB6). It fails if the switch is made soft, and if the page keeps
 * the scope it read first.
 */
test("care data loaded, a switch to the finance assignment, then a late care response: neither shows", async ({
  page,
}) => {
  const [finance, care] = fixturePerson("twoRows").memberships;
  const documents = trackDocumentLoads(page);
  let release!: () => void;
  const late = new Promise<void>((resolve) => {
    release = resolve;
  });
  const seen = await serveScopedMemberCare(
    page,
    {
      [care!.id]: { tenant: DEMO, rows: personnel("Care") },
      [finance!.id]: { tenant: DEMO, rows: null },
    },
    // Held: the care document's request for one person's record.
    { path: /\/api\/admin\/member-care\/directory\/care-02$/, until: late },
  );
  await signInAs(page, "admin", "twoRows", baseURL());

  await page.goto(tenantPath(DEMO, "/care/directory", "member_care"));
  await expect(careRegion(page).getByText("Care Person 01")).toBeVisible();
  expect(seen.at(-1)).toMatchObject({ tenant: DEMO, assignment: care!.id });

  // The care document asks for a record; its answer is held.
  const held = page.waitForRequest(/\/member-care\/directory\/care-02$/);
  await softNavigate(
    page,
    tenantPath(DEMO, "/care/directory/care-02", "member_care"),
  );
  await held;

  // The switch to the finance assignment loads a new document.
  const loadsBeforeSwitch = documents.length;
  await softNavigate(page, tenantPath(DEMO, "/care/directory", "finance"));
  await page.waitForURL(`**/${DEMO}~finance/care/directory`);
  await expect
    .poll(() => documents.slice(loadsBeforeSwitch))
    .toContain(`/${DEMO}~finance/care/directory`);
  await expect
    .poll(async () => (await documentScope(page)).assignment)
    .toBe(finance!.id);

  // Now the late care response arrives, for a document that is gone, and is
  // given time to land before anything is checked.
  release();
  expect(seen.heldSettled, "the care record request was held").toBeDefined();
  await seen.heldSettled;

  // The finance document's own requests name the finance assignment, which
  // reads no care, and nothing from the care document shows.
  await expect
    .poll(() =>
      seen.some(
        (call) =>
          call.assignment === finance!.id && call.path.endsWith("/dashboard"),
      ),
    )
    .toBe(true);
  await expect(page.getByText(/Care Person/)).toHaveCount(0);
  for (const call of seen.filter((call) => call.assignment === finance!.id)) {
    expect(call.tenant).toBe(DEMO);
  }
});

/*
 * Council on the joined release, JB1: plan 5.2, "a refused assignment or a
 * change of signed-in user reloads too". The second tab signs in as another
 * person; the session is the browser's, so the first tab now holds the second
 * person's session under the first person's scope.
 *
 * On a production build the session cookie is the page's to read, and the
 * first tab sees the change before it sends anything: its next request
 * carries no scope at all. Under the development sign-in bypass the identity
 * cookie is httpOnly, so the page cannot see the change; there the requests
 * it sends before the first answer still name the first person's assignment,
 * and the server refuses every one of them with the scope-refused mark: none
 * is answered under that assignment. In both, the tab loads a new document,
 * under the second person's scope, and shows nothing of the first person's.
 */
test("two tabs: the second signs in as another person, and the first tab's next request does not carry the first person's assignment, and the tab reloads", async ({
  page,
}) => {
  const [first] = fixturePerson("twoTenants").memberships;
  const [second] = fixturePerson("demoAdmin").memberships;
  const scopes: Record<string, CareScope> = {
    [first!.id]: { tenant: DEMO, rows: personnel("Demo") },
  };
  const seen = await serveScopedMemberCare(page, scopes);
  await signInAs(page, "admin", "twoTenants", baseURL());
  await page.goto(tenantPath(DEMO, "/care/directory"));
  await expect(careRegion(page).getByText("Demo Person 01")).toBeVisible();
  expect(seen.at(-1)).toMatchObject({ tenant: DEMO, assignment: first!.id });

  // The second tab signs in as another person, with a row in the same
  // organization; what the server now answers is that person's.
  const other = await page.context().newPage();
  await signInAs(other, "admin", "demoAdmin", baseURL());
  delete scopes[first!.id];
  scopes[second!.id] = { tenant: DEMO, rows: personnel("Admin") };
  await other.close();

  const documents = trackDocumentLoads(page);
  const callsBefore = seen.length;
  // The first tab's next request: it opens a record.
  await softNavigate(page, tenantPath(DEMO, "/care/directory/demo-02"));

  await expect.poll(() => documents.length).toBeGreaterThan(0);
  await expect
    .poll(async () => (await documentScope(page)).assignment)
    .toBe(second!.id);
  await expect(page.getByText(/Demo Person/)).toHaveCount(0);

  const after = seen.slice(callsBefore);
  const naming = after.filter((call) => call.assignment === first!.id);
  if (signsInThroughStub) {
    expect(naming).toEqual([]);
  } else {
    for (const call of naming) expect(call.refused).toBe(true);
  }
});

/*
 * Council on the joined release, JB1 (c) and JB6: plan WP2 acceptance, "…and
 * the same holds after the care row is revoked". Care data is on screen; the
 * care row is revoked while a request of the page is in flight, and that
 * request reaches the resolver after the revoke. No switch of assignment and
 * no document load comes first: what clears the care data is the refusal. The
 * page shows no care data, cached or late, and the document reloads, where the
 * proxy decides: the person's one row left in the organization is the finance
 * row, so the new document is the finance one, which reads no care.
 */
test("care data on screen, the care row revoked, then the page's delayed request is refused: neither the cached nor the late data shows", async ({
  page,
}) => {
  const [finance, care] = fixturePerson("twoRows").memberships;
  let release!: () => void;
  const late = new Promise<void>((resolve) => {
    release = resolve;
  });
  const scopes: Record<string, CareScope> = {
    [care!.id]: { tenant: DEMO, rows: personnel("Care") },
    [finance!.id]: { tenant: DEMO, rows: null },
  };
  const seen = await serveScopedMemberCare(page, scopes, {
    path: /\/api\/admin\/member-care\/directory\/care-02$/,
    until: late,
  });
  await signInAs(page, "admin", "twoRows", baseURL());
  try {
    await page.goto(tenantPath(DEMO, "/care/directory", "member_care"));
    await expect(careRegion(page).getByText("Care Person 01")).toBeVisible();

    // A request of the care document, for one record, is in flight.
    const held = page.waitForRequest(/\/member-care\/directory\/care-02$/);
    await softNavigate(
      page,
      tenantPath(DEMO, "/care/directory/care-02", "member_care"),
    );
    await held;

    // The care row is revoked; the request reaches the resolver afterwards.
    await revokeMembership(page, "admin", "twoRows", care!.id, baseURL());
    delete scopes[care!.id];
    const documents = trackDocumentLoads(page);
    release();
    expect(seen.heldSettled, "the care record request was held").toBeDefined();
    expect(await seen.heldSettled).toBe("delivered");
    const refused = seen.find((call) => call.path.endsWith("/care-02"));
    expect(refused).toMatchObject({ assignment: care!.id, refused: true });

    await expect.poll(() => documents.length).toBeGreaterThan(0);
    await expect
      .poll(async () => await documentScope(page))
      .toEqual({ prefix: `/${DEMO}`, assignment: finance!.id });
    await expect(page.getByText(/Care Person/)).toHaveCount(0);
  } finally {
    await restoreRevokedMemberships();
  }
});
