import { expect as baseExpect, test, type Page } from "@playwright/test";

import { adminBaseURL } from "./base-urls";
import { organizationLabel, TENANTS } from "./helpers/tenant-address";
import {
  addExpiredStubSession,
  chooseOrganization,
  createDraftPage,
  deleteDocument,
  fixturePerson,
  restTitles,
  signInAs,
  signsInThroughStub,
  stubControl,
  switchOrganization,
  uploadMedia,
  WEB_STUDIO_COOKIE,
  webStudioScope,
  writeHeaders,
} from "./helpers/web-studio";
import {
  createE2EAuthCookieValue,
  E2E_AUTH_COOKIE_NAMES,
} from "../../packages/auth/e2e-auth";

/**
 * Web Studio under its tenant cookie (plan 5.2, "One stated exception: Web
 * Studio"; WP2b first release, slice C; AL-2675). Payload's REST routes answer
 * under `/web-studio/api`; the organization travels in a signed cookie scoped
 * to `/web-studio`, which only narrows; the admin proxy only refreshes the
 * session on those routes.
 *
 * In development fixture people sign in through signed E2E bypass cookies;
 * on a production build (`E2E_SUPABASE_STUB_URL`) through the Supabase stub,
 * which also runs the real session refresh.
 *
 * What CI proves (council C9): CI's CMS job runs this file on a development
 * server under the bypass, so each title says what holds there. There a
 * person's live rows are the signed test identity's memberships, so "no
 * longer holds a membership" means the identity is re-signed without it, and
 * "no session" means the bypass cookie is gone. Each case stands alone.
 *
 * Manual evidence, not run in CI: the same file against a production build
 * with `E2E_SUPABASE_STUB_URL` set to a running Supabase stub. There a
 * revocation goes through the stub's membership rows, an ended session is an
 * expired token the stub will not refresh, and the case marked "stub only"
 * runs the proxy's real session refresh. The handoff of each slice that
 * changes this file records those runs.
 */

const { demo: DEMO, second: SECOND } = TENANTS;
const expect = baseExpect.configure({ timeout: 90_000 });
const base = adminBaseURL;
const person = fixturePerson("twoTenants");
const rowIn = (tenant: string) =>
  person.memberships.find((m) => m.tenantId === tenant)!.id;

const STALE_MESSAGE =
  "This page was opened for a different organization. Reload the page to continue; nothing was saved.";

test.beforeEach(async () => {
  test.setTimeout(240_000);
  if (signsInThroughStub) await stubControl("reset");
});

async function signIn(page: Page) {
  await signInAs(page, "admin", "twoTenants", base);
}

async function enter(page: Page, tenant: string) {
  await page.goto(`${base}/web-studio`);
  await page.waitForURL(/\/web-studio\/organization\?next=%2Fweb-studio$/);
  await chooseOrganization(page, tenant);
  await page.waitForURL((url) => url.pathname === "/web-studio");
  await expect
    .poll(async () => (await webStudioScope(page)).tenant)
    .toBe(tenant);
}

type MarkedWindow = { __asymDocumentMark?: true };

/** Marks the open document, so a later check tells a reload from a client navigation. */
async function markDocument(page: Page) {
  await page.evaluate(() => {
    (window as unknown as MarkedWindow).__asymDocumentMark = true;
  });
}

/** Whether the marked document is still open; `null` while a navigation replaces it. */
async function sameDocument(page: Page) {
  try {
    return await page.evaluate(
      () => (window as unknown as MarkedWindow).__asymDocumentMark === true,
    );
  } catch {
    return null;
  }
}

/** Records, and accepts, any browser dialog, such as a second "leave this page?". */
function recordBrowserDialogs(page: Page) {
  const seen: string[] = [];
  page.on("dialog", (dialog) => {
    seen.push(dialog.type());
    void dialog.accept();
  });
  return seen;
}

/**
 * Deletes a test document from a fresh tab in the demo organization. A
 * failure here is reported, never thrown over the case's own error.
 */
async function cleanUp(
  page: Page,
  collection: "pages" | "navigation",
  id: string,
) {
  const tab = await page.context().newPage();
  try {
    await switchOrganization(tab, base, DEMO);
    await tab.request.delete(`${base}/web-studio/api/${collection}/${id}`, {
      headers: await writeHeaders(tab, base),
    });
  } catch (error) {
    console.warn(`cleanup of ${collection}/${id} failed:`, error);
  } finally {
    await tab.close();
  }
}

/** The reload notice a Web Studio document opens when a call is refused. */
function staleNotice(page: Page) {
  return page.getByRole("alertdialog", {
    name: "This page belongs to another organization",
  });
}

/**
 * Acknowledges the reload notice with "Not now" whenever it stands in the
 * way, and records what it said. A stale tab can meet a refusal on its own
 * reads (a list or a relationship field fetching again) before the person
 * acts, and the notice opens once a document, so it may open before the
 * action under test or because of it.
 */
async function acknowledgeStaleNotice(page: Page) {
  const seen: string[] = [];
  const notice = staleNotice(page);
  await page.addLocatorHandler(notice, async () => {
    seen.push((await notice.textContent()) ?? "");
    await notice.getByRole("button", { name: "Not now" }).click();
  });
  return seen;
}

/** Whether the person was told: the notice is open, or was seen and acknowledged. */
async function toldToReload(page: Page, seen: string[]) {
  if (seen.length > 0) return seen[0]!.includes(STALE_MESSAGE);
  const notice = staleNotice(page);
  return (
    (await notice.isVisible()) &&
    ((await notice.textContent()) ?? "").includes(STALE_MESSAGE)
  );
}

test("@cms a person in two organizations sees each one's pages, documents and media only while it is selected", async ({
  page,
}) => {
  await signIn(page);
  const stamp = `wsten-${Date.now()}`;
  const created: Array<[string, "pages" | "media", string]> = [];

  try {
    // No choice yet: Web Studio asks, and never picks the first.
    await enter(page, DEMO);
    expect(await webStudioScope(page)).toEqual({
      tenant: DEMO,
      assignment: rowIn(DEMO),
    });
    const demoPage = await createDraftPage(page, base, `Alpha ${stamp}`);
    created.push([DEMO, "pages", demoPage]);
    created.push([
      DEMO,
      "media",
      await uploadMedia(page, base, `alpha ${stamp}`),
    ]);

    await switchOrganization(page, base, SECOND);
    // The document scope that Web Studio's pickers read follows the cookie.
    expect(await webStudioScope(page)).toEqual({
      tenant: SECOND,
      assignment: rowIn(SECOND),
    });
    const secondPage = await createDraftPage(page, base, `Bravo ${stamp}`);
    created.push([SECOND, "pages", secondPage]);
    created.push([
      SECOND,
      "media",
      await uploadMedia(page, base, `bravo ${stamp}`),
    ]);

    for (const [tenant, own, other, ownPage, otherPage] of [
      [SECOND, "Bravo", "Alpha", secondPage, demoPage],
      [DEMO, "Alpha", "Bravo", demoPage, secondPage],
    ] as const) {
      await switchOrganization(page, base, tenant);
      // What a REST call returns.
      expect(await restTitles(page, base, "pages", stamp)).toEqual([
        `${own} ${stamp}`,
      ]);
      expect(await restTitles(page, base, "media", stamp)).toEqual([
        `${own.toLowerCase()} ${stamp}`,
      ]);
      expect(
        (
          await page.request.get(
            `${base}/web-studio/api/pages/${otherPage}?draft=true`,
          )
        ).status(),
      ).toBe(404);
      // The list and the document.
      await page.goto(`${base}/web-studio/collections/pages`);
      await expect(page.getByText(`${own} ${stamp}`).first()).toBeVisible();
      await expect(page.getByText(`${other} ${stamp}`)).toHaveCount(0);
      await page.goto(`${base}/web-studio/collections/pages/${ownPage}`);
      await expect(
        page.getByRole("textbox", { name: /^Title/ }).first(),
      ).toHaveValue(`${own} ${stamp}`);
    }
  } finally {
    for (const tenant of [DEMO, SECOND]) {
      await switchOrganization(page, base, tenant);
      for (const [owner, collection, id] of created) {
        if (owner === tenant) await deleteDocument(page, base, collection, id);
      }
    }
  }
});

test("@cms once the person no longer holds the selected membership, the next page and REST call are denied", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, SECOND);
  expect(
    (await page.request.get(`${base}/web-studio/api/pages?limit=1`)).status(),
  ).toBe(200);

  // Revoke the row in the second organization.
  if (signsInThroughStub) {
    await stubControl("revoke", { membershipId: rowIn(SECOND) });
  } else {
    await page.context().addCookies([
      {
        name: E2E_AUTH_COOKIE_NAMES.admin,
        value: await createE2EAuthCookieValue({
          userId: person.userId,
          role: person.role,
          tenantId: DEMO,
          memberships: person.memberships.filter((m) => m.tenantId !== SECOND),
        }),
        url: base,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
  }

  const rest = await page.request.get(`${base}/web-studio/api/pages?limit=1`, {
    maxRedirects: 0,
  });
  expect(rest.status()).toBe(403);
  expect(rest.headers()["content-type"]).toContain("application/json");
  expect(rest.headers()["x-asym-web-studio-refusal"]).toBe("no_selection");
  // The cookie still names the revoked row; it selects nothing, and nothing
  // falls back to the organization that is left.
  await page.goto(`${base}/web-studio/collections/pages`);
  await expect(page).toHaveURL(/\/web-studio\/organization\?next=/);
  // Only the organizations' options, not the development tools' buttons.
  await expect(
    page.getByRole("button", { name: /^[^:]+:\s+Open / }),
  ).toHaveCount(1);
});

test("@cms stub only: the admin proxy refreshes an expired session on a Web Studio REST call", async ({
  page,
}) => {
  test.skip(
    !signsInThroughStub,
    "Runs only through the Supabase stub (manual evidence): CI's bypass has no session to refresh.",
  );
  await signIn(page);
  await enter(page, DEMO);

  // An expired access token with a good refresh token: the proxy refreshes.
  await addExpiredStubSession(page.context(), base, "twoTenants", {
    refreshable: true,
  });
  const refreshed = await page.request.get(
    `${base}/web-studio/api/pages?limit=1`,
    { maxRedirects: 0 },
  );
  expect(refreshed.status()).toBe(200);
  expect(
    refreshed
      .headersArray()
      .some(
        (h) =>
          h.name.toLowerCase() === "set-cookie" &&
          /^sb-[^=]+-auth-token=/.test(h.value),
      ),
  ).toBe(true);
});

test("@cms a Web Studio REST call with no session gets JSON 401 that names the refusal, and no redirect", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const headers = await writeHeaders(page, base);

  if (signsInThroughStub) {
    await addExpiredStubSession(page.context(), base, "twoTenants", {
      refreshable: false,
    });
  } else {
    await page.context().clearCookies({ name: E2E_AUTH_COOKIE_NAMES.admin });
  }

  for (const call of [
    () =>
      page.request.get(`${base}/web-studio/api/pages?limit=1`, {
        maxRedirects: 0,
      }),
    () =>
      page.request.patch(`${base}/web-studio/api/pages/1`, {
        maxRedirects: 0,
        headers,
        data: { title: "x" },
      }),
  ]) {
    const response = await call();
    expect(response.status()).toBe(401);
    expect(response.headers()["location"]).toBeUndefined();
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(response.headers()["x-asym-web-studio-refusal"]).toBe("no_session");
    const message = "Your session has ended. Sign in again to continue.";
    expect(await response.json()).toEqual({ message, errors: [{ message }] });
  }
});

test("@cms the Web Studio cookie never reaches Mission Control's /api, and a forged one selects nothing", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);

  // Scoped to /web-studio: the browser holds it for that path and below only.
  expect(
    (await page.context().cookies(`${base}/api/health`)).some(
      (c) => c.name === WEB_STUDIO_COOKIE,
    ),
  ).toBe(false);
  const cookie = (await page.context().cookies(`${base}/web-studio`)).find(
    (c) => c.name === WEB_STUDIO_COOKIE,
  )!;
  expect(cookie).toMatchObject({
    path: "/web-studio",
    httpOnly: true,
    sameSite: "Strict",
  });

  const sent = async (path: string) => {
    const request = page.waitForRequest(
      (r) => new URL(r.url()).pathname === path,
    );
    await page.evaluate((p) => fetch(p).then(() => undefined), path);
    return (await (await request).allHeaders()).cookie ?? "";
  };
  expect(await sent("/web-studio/api/cms-users/me")).toContain(
    `${WEB_STUDIO_COOKIE}=`,
  );
  expect(await sent("/api/health")).not.toContain(WEB_STUDIO_COOKIE);

  // A cookie the server did not sign, naming a row of another person.
  await page.context().addCookies([
    {
      ...cookie,
      value: `v1.${SECOND}.00000000-0000-4000-8000-0000000e2e11.not-a-signature`,
    },
  ]);
  const rest = await page.request.get(`${base}/web-studio/api/pages?limit=1`, {
    maxRedirects: 0,
  });
  expect(rest.status()).toBe(403);
  await page.goto(`${base}/web-studio`);
  await expect(page).toHaveURL(
    /\/web-studio\/organization\?next=%2Fweb-studio$/,
  );
});

test("@cms a write to /web-studio/api from another origin is refused and changes nothing", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `wsorigin-${Date.now()}`;

  const response = await page.request.post(
    `${base}/web-studio/api/pages?draft=true`,
    {
      headers: {
        ...(await writeHeaders(page, base)),
        origin: "https://evil.example",
      },
      data: {
        title: `Cross ${stamp}`,
        slug: stamp,
        pageType: "standard",
        _status: "draft",
      },
    },
  );

  expect(response.status()).toBe(403);
  expect(await response.json()).toEqual({
    errors: [
      {
        message: "Web Studio only accepts changes made from Web Studio itself.",
      },
    ],
  });
  expect(await restTitles(page, base, "pages", stamp)).toEqual([]);
});

test("@cms Save in a page opened for one organization, after another tab switched to the other, is refused, changes nothing and asks the person to reload", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `wsstale-${Date.now()}`;
  const id = await createDraftPage(page, base, `Form ${stamp}`);

  try {
    // Tab one keeps the document open for the demo organization.
    await page.goto(`${base}/web-studio/collections/pages/${id}`);
    const title = page.getByRole("textbox", { name: /^Title/ }).first();
    await expect(title).toHaveValue(`Form ${stamp}`);
    // Tab two switches Web Studio to the second organization.
    const other = await page.context().newPage();
    await switchOrganization(other, base, SECOND);

    // The editor's own Save is refused, named as a refusal, and the person
    // is told, in one notice (council C2).
    const seen = await acknowledgeStaleNotice(page);
    await title.fill(`Retargeted ${stamp}`);
    const saved = page.waitForResponse(
      (r) =>
        new URL(r.url()).pathname === `/web-studio/api/pages/${id}` &&
        r.request().method() === "PATCH" &&
        !r.url().includes("autosave=true"),
    );
    await page.getByRole("button", { name: /^Save Draft$/i }).click();
    const save = await saved;
    expect(save.status()).toBe(409);
    expect(save.headers()["x-asym-web-studio-refusal"]).toBe("scope_mismatch");
    await expect.poll(() => toldToReload(page, seen)).toBe(true);
    expect(await page.getByRole("alertdialog").count()).toBeLessThanOrEqual(1);

    // A create from the same document is refused the same way.
    const created = await page.evaluate(async (s) => {
      const response = await fetch("/web-studio/api/pages?draft=true", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: `New ${s}`,
          slug: `new-${s}`,
          pageType: "standard",
          _status: "draft",
        }),
      });
      return { status: response.status, body: await response.json() };
    }, stamp);
    expect(created.status).toBe(409);
    expect(created.body.message).toBe(STALE_MESSAGE);

    // Nothing changed in either organization.
    expect(await restTitles(other, base, "pages", stamp)).toEqual([]);
    await switchOrganization(other, base, DEMO);
    expect(await restTitles(other, base, "pages", stamp)).toEqual([
      `Form ${stamp}`,
    ]);
    await switchOrganization(other, base, SECOND);
    await other.close();

    // Reload, from the notice while it is open, opens the organization the
    // cookie now selects.
    await page.removeLocatorHandler(staleNotice(page));
    await markDocument(page);
    if (await staleNotice(page).isVisible()) {
      await staleNotice(page).getByRole("button", { name: "Reload" }).click();
    } else {
      await page.reload();
    }
    await expect.poll(() => sameDocument(page)).toBe(false);
    await expect
      .poll(async () => (await webStudioScope(page)).tenant)
      .toBe(SECOND);
  } finally {
    await cleanUp(page, "pages", id);
  }
});

test("@cms bulk delete in a list opened for one organization, after another tab switched to the other, is refused, deletes nothing and asks the person to reload", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `wsbulk-${Date.now()}`;
  const id = await createDraftPage(page, base, `Bulk ${stamp}`);

  try {
    await page.goto(
      `${base}/web-studio/collections/pages?search=${encodeURIComponent(stamp)}`,
    );
    const row = page.getByRole("checkbox", { name: `Select Bulk ${stamp}` });
    await expect(row).toBeVisible();
    const other = await page.context().newPage();
    await switchOrganization(other, base, SECOND);
    const seen = await acknowledgeStaleNotice(page);

    await row.check();
    await page
      .locator("[data-web-studio-bulk-delete]")
      .getByRole("button", { name: "Delete" })
      .click();
    await expect(page.getByText("Confirm deletion")).toBeVisible();
    // Payload deletes, or moves to trash, with one call for the selection.
    const deleted = page.waitForResponse(
      (r) =>
        new URL(r.url()).pathname === "/web-studio/api/pages" &&
        ["DELETE", "PATCH"].includes(r.request().method()),
    );
    await page.getByRole("button", { name: "Confirm", exact: true }).click();
    const response = await deleted;
    expect(response.status()).toBe(409);
    expect(response.headers()["x-asym-web-studio-refusal"]).toBe(
      "scope_mismatch",
    );
    await expect.poll(() => toldToReload(page, seen)).toBe(true);

    await switchOrganization(other, base, DEMO);
    expect(await restTitles(other, base, "pages", stamp)).toEqual([
      `Bulk ${stamp}`,
    ]);
    await other.close();
  } finally {
    await cleanUp(page, "pages", id);
  }
});

test("@cms a link clicked in a page opened before another tab switched organization reloads into the organization now chosen", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `wsnav-${Date.now()}`;
  const id = await createDraftPage(page, base, `Nav ${stamp}`);

  try {
    await page.goto(`${base}/web-studio/collections/pages/${id}`);
    await expect(
      page.getByRole("textbox", { name: /^Title/ }).first(),
    ).toHaveValue(`Nav ${stamp}`);
    await markDocument(page);
    const other = await page.context().newPage();
    await switchOrganization(other, base, SECOND);
    await other.close();
    // The person may first be told the page is stale; they carry on.
    await acknowledgeStaleNotice(page);

    // Inside Web Studio a link is a client navigation; the page it renders
    // belongs to the second organization, so the document reloads (C1).
    await page
      .getByRole("link", { name: "Web Studio", exact: true })
      .first()
      .click();
    await page.waitForURL((url) => url.pathname === "/web-studio");
    await expect.poll(() => sameDocument(page)).toBe(false);
    await expect
      .poll(async () => (await webStudioScope(page)).tenant)
      .toBe(SECOND);
    await page.getByRole("button", { name: /account menu/ }).click();
    await expect(
      page.getByRole("menu").getByText(organizationLabel(SECOND)),
    ).toBeVisible();
  } finally {
    await cleanUp(page, "pages", id);
  }
});

test("@cms Switch organization with unsaved changes asks once, then loads the chooser as a new document", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `wsleave-${Date.now()}`;
  // Navigation keeps no versions, so its editor does not autosave and
  // Payload guards an unsaved change (pages autosave and never ask).
  const created = await page.request.post(`${base}/web-studio/api/navigation`, {
    headers: await writeHeaders(page, base),
    data: { label: `Leave ${stamp}`, items: [{ label: "Home", href: "/" }] },
  });
  expect(created.status()).toBe(201);
  const id = String((await created.json()).doc.id);
  const browserDialogs = recordBrowserDialogs(page);

  try {
    await page.goto(`${base}/web-studio/collections/navigation/${id}`);
    const label = page.getByRole("textbox", { name: /^Label/ }).first();
    await expect(label).toHaveValue(`Leave ${stamp}`);
    await markDocument(page);
    await label.fill(`Unsaved ${stamp}`);

    await page.getByRole("button", { name: /account menu/ }).click();
    await page.getByRole("menuitem", { name: "Switch organization" }).click();
    // Payload's own question, once; then a document load (C1), with no
    // second question from the browser.
    await page.getByRole("button", { name: "Leave anyway" }).click();
    await page.waitForURL((url) => url.pathname === "/web-studio/organization");
    await expect(
      page.getByRole("heading", { name: "Choose an organization" }),
    ).toBeVisible();
    expect(await sameDocument(page)).toBe(false);
    expect(browserDialogs).toEqual([]);
  } finally {
    await cleanUp(page, "navigation", id);
  }
});

test("@cms nothing of Payload's answers under /api, and Mission Control's /api answers as before", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);

  for (const [method, path] of [
    ["GET", "/api/pages?limit=1"],
    ["GET", "/api/cms-users/me"],
    ["GET", "/api/media/file/anything.png"],
    ["POST", "/api/graphql"],
  ] as const) {
    const response = await page.request.fetch(`${base}${path}`, {
      method,
      maxRedirects: 0,
      headers: { origin: base, "content-type": "application/json" },
      ...(method === "POST" ? { data: { query: "{ __typename }" } } : {}),
    });
    expect(response.status(), path).toBe(404);
  }
  expect(
    (await page.request.get(`${base}/web-studio/api/cms-users/me`)).status(),
  ).toBe(200);
  expect((await page.request.get(`${base}/api/health`)).status()).toBe(200);
});
