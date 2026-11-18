import { expect as baseExpect, test, type Page } from "@playwright/test";

import { adminBaseURL } from "./base-urls";
import { TENANTS } from "./helpers/tenant-address";
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
 */

const { demo: DEMO, second: SECOND } = TENANTS;
const expect = baseExpect.configure({ timeout: 90_000 });
const base = adminBaseURL;
const person = fixturePerson("twoTenants");
const rowIn = (tenant: string) =>
  person.memberships.find((m) => m.tenantId === tenant)!.id;

test.describe.configure({ mode: "serial" });

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

test("@cms revoking a membership denies Web Studio at the next request, pages and REST alike", async ({
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
  // The cookie still names the revoked row; it selects nothing, and nothing
  // falls back to the organization that is left.
  await page.goto(`${base}/web-studio/collections/pages`);
  await expect(page).toHaveURL(/\/web-studio\/organization\?next=/);
  await expect(page.getByRole("button", { name: /Open/ })).toHaveCount(1);
});

test("@cms an ended session on a Web Studio REST call gets JSON 401 and no redirect, and a live one is refreshed", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const headers = await writeHeaders(page, base);

  if (signsInThroughStub) {
    // An expired access token with a good refresh token: the proxy refreshes.
    await addExpiredStubSession(page.context(), base, "twoTenants", {
      refreshable: true,
    });
    const refreshed = await page.request.get(
      `${base}/web-studio/api/pages?limit=1`,
      {
        maxRedirects: 0,
      },
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
    expect(await response.json()).toEqual({
      errors: [
        { message: "Your session has ended. Sign in again to continue." },
      ],
    });
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

test("@cms a save from a page opened for one organization, after Web Studio switched to the other, is refused and changes nothing", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `wsstale-${Date.now()}`;
  const id = await createDraftPage(page, base, `Form ${stamp}`);

  try {
    // Tab one keeps the document open for the demo organization.
    await page.goto(`${base}/web-studio/collections/pages/${id}`);
    await expect(
      page.getByRole("textbox", { name: /^Title/ }).first(),
    ).toHaveValue(`Form ${stamp}`);
    // Tab two switches Web Studio to the second organization.
    const other = await page.context().newPage();
    await switchOrganization(other, base, SECOND);

    // Saves from tab one go out as its own document makes them.
    const results = await page.evaluate(
      async ({ id: docId, stamp: s }) => {
        const send = async (url: string, method: string, body: object) => {
          const response = await fetch(url, {
            method,
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
          });
          return { status: response.status, body: await response.json() };
        };
        return [
          await send(`/web-studio/api/pages/${docId}?draft=true`, "PATCH", {
            title: `Retargeted ${s}`,
          }),
          await send("/web-studio/api/pages?draft=true", "POST", {
            title: `New ${s}`,
            slug: `new-${s}`,
            pageType: "standard",
            _status: "draft",
          }),
        ];
      },
      { id, stamp },
    );
    for (const result of results) {
      expect(result.status).toBe(409);
      expect(result.body.errors[0].message).toMatch(/Reload the page/);
    }

    // Nothing changed in either organization.
    expect(await restTitles(other, base, "pages", stamp)).toEqual([]);
    await switchOrganization(other, base, DEMO);
    expect(await restTitles(other, base, "pages", stamp)).toEqual([
      `Form ${stamp}`,
    ]);
    await other.close();
  } finally {
    await switchOrganization(page, base, DEMO);
    await deleteDocument(page, base, "pages", id);
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
