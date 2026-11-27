import {
  expect as baseExpect,
  errors as playwrightErrors,
  test,
  type Locator,
  type Page,
  type Request,
  type Response as PlaywrightResponse,
  type Route,
} from "@playwright/test";
import pg from "pg";

import { adminBaseURL } from "./base-urls";
import { bodyFromPageCopy } from "./helpers/received-bodies";
import { organizationLabel, TENANTS } from "./helpers/tenant-address";
import {
  addExpiredStubSession,
  chooseOrganization,
  createDraftPage,
  deleteDocument,
  fixturePerson,
  labelSeededMedia,
  restoreMediaAlt,
  restTitles,
  signInAs,
  signsInThroughStub,
  siteOf,
  stubControl,
  switchOrganization,
  WEB_STUDIO_COOKIE,
  webStudioScope,
  writeHeaders,
} from "./helpers/web-studio";
import {
  createE2EAuthCookieValue,
  E2E_AUTH_COOKIE_NAMES,
} from "../../packages/auth/e2e-auth";

import type { PageCopy, ReceivedBody } from "./helpers/received-bodies";

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

const NO_IDLE_CONNECTION = { connection: "close" };

const MISSIONARY_IDS: Record<string, string> = {
  [DEMO]: "4f0d6c1e-2a3b-4c5d-8e6f-7a8b9c0d1e2f",
  [SECOND]: "5a1e7d2f-3b4c-4d6e-9f70-8b9c0d1e2f3a",
};

async function plantMissionary(id: string, missionaryId: string) {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  try {
    await client.query(
      "update cms.pages set family = 'missionary', missionary_id = $2 where id = $1",
      [id, missionaryId],
    );
    await client.query(
      "update cms._pages_v set version_family = 'missionary', version_missionary_id = $2 where parent_id = $1",
      [id, missionaryId],
    );
  } finally {
    await client.end();
  }
}

const STALE_MESSAGE =
  "This page was opened for a different organization. Reload the page to continue; nothing was saved.";

// Each case's own limits (council r2 CR4, r3 CR8). CI retries a failed case
// twice and the whole CMS step has a fixed limit, so a case that hangs must
// stop before it uses the step up; and a first attempt on a development
// server that has not compiled Web Studio's views yet must be able to finish.
// Measured, the whole file on one worker:
// - in CI's order (a replay of CI's own steps, load 23 to 29), after the
//   other CMS specs have compiled the views: the first case 44 s, the slowest
//   of the rest 44 s;
// - alone on a freshly started development server, four runs at load 8 to
//   30: the first case 120 s, 132 s, 168 s, and past 240 s (cut off there);
//   the slowest of the rest 21 s, 72 s, 48.5 s and 114 s;
// - again on the same server, now warm: the first case 39 s, the rest at
//   most 35.5 s.
// So a first attempt allows 180 s, and 360 s for the first case (half again
// over the 240 s at which the slowest run was cut off); a retry runs on a
// server the first attempt has compiled for, and allows 120 s (180 s for the
// first case). The step's own limit and the retry count are set elsewhere.
const FIRST_ATTEMPT_LIMIT = 180_000;
const RETRY_LIMIT = 120_000;
const FIRST_CASE_FIRST_ATTEMPT_LIMIT = 360_000;
const FIRST_CASE_RETRY_LIMIT = 180_000;

test.beforeEach(async () => {
  test.setTimeout(test.info().retry === 0 ? FIRST_ATTEMPT_LIMIT : RETRY_LIMIT);
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
 * Deletes test documents from a fresh tab in the demo organization. A
 * failure here is reported, never thrown over the case's own error.
 */
async function cleanUp(
  page: Page,
  collection: "pages" | "navigation",
  ...ids: string[]
) {
  const tab = await page.context().newPage();
  try {
    await switchOrganization(tab, base, DEMO);
    const headers = await writeHeaders(tab, base);
    for (const id of ids) {
      await tab.request.delete(`${base}/web-studio/api/${collection}/${id}`, {
        headers: { ...headers, ...NO_IDLE_CONNECTION },
      });
    }
  } catch (error) {
    console.warn(`cleanup of ${collection} ${ids.join(", ")} failed:`, error);
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

/**
 * Keeps the stale tab's own calls from reaching the server, so the only
 * refused call is the action under test and the notice can come only from it
 * (council r2 CR5): its reads are held unanswered (a tab that regains focus
 * reads again, a list or a relationship field, and in the app that read is
 * refused first), and its autosaves fail at once (a held autosave would keep
 * the Save button disabled).
 */
/**
 * Opens `url` and waits until Payload has started in the browser: its own
 * session read (`principal-links/me`, made once the page has hydrated) has been
 * answered, and no call to `/web-studio/api` and no server function (the
 * navigation rail asks for its recent documents through one) has been in
 * flight for a second.
 * A stale-tab case holds the page's calls and switches the other tab only
 * after that: on a cold server the page hydrates late, a field's value can
 * be on screen from the server's HTML before then, and start-up calls that
 * are held leave Payload's form half started, while those made after the
 * switch are refused and open the notice before the action under test.
 *
 * Only the opened page's own calls count, by the page they come from: the
 * page before it may still be starting when the navigation begins, and a
 * call it makes then ends with that document without ever being reported
 * finished or failed, which would keep this waiting for good.
 */
async function openStarted(page: Page, url: string) {
  const inFlight = new Set<Request>();
  const opened = new URL(url).pathname;
  const started = (request: Request) => {
    const isServerFunction = Boolean(request.headers()["next-action"]);
    if (
      !isServerFunction &&
      !new URL(request.url()).pathname.startsWith("/web-studio/api/")
    ) {
      return;
    }
    const from = request.headers()["referer"];
    if (!from || new URL(from).pathname !== opened) return;
    inFlight.add(request);
  };
  const ended = (request: Request) => {
    inFlight.delete(request);
  };
  page.on("request", started);
  page.on("requestfinished", ended);
  page.on("requestfailed", ended);
  try {
    // The opened page's own session read, not the previous page's (JR13).
    const session = page.waitForResponse((response) => {
      if (
        new URL(response.url()).pathname !==
        "/web-studio/api/principal-links/me"
      ) {
        return false;
      }
      const from = response.request().headers()["referer"];
      return Boolean(from) && new URL(from!).pathname === opened;
    });
    await page.goto(url);
    await session;
    await page.waitForLoadState("load");
    await expect.poll(() => inFlight.size, { intervals: [250] }).toBe(0);
  } finally {
    page.off("request", started);
    page.off("requestfinished", ended);
    page.off("requestfailed", ended);
  }
}

function requestSeen(page: Page, pathname: string) {
  let seen = false;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === pathname) seen = true;
  });
  return () => seen;
}

function refusedAutosaves(page: Page, collection: string, id: string) {
  const bodies: string[] = [];
  page.on("requestfailed", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === `/web-studio/api/${collection}/${id}` &&
      url.searchParams.get("autosave") === "true"
    ) {
      bodies.push(request.postData() ?? "");
    }
  });
  return bodies;
}

async function holdOwnCalls(page: Page) {
  await page.route(
    (url) => url.pathname.startsWith("/web-studio/api/"),
    async (route) => {
      const request = route.request();
      if (new URL(request.url()).searchParams.get("autosave") === "true") {
        await route.abort();
        return;
      }
      if (request.method() === "GET") return; // never answered
      await route.continue();
    },
  );
}

function excerptAround(text: string, title: string) {
  const at = text.indexOf(title);
  return at === -1
    ? ""
    : text.slice(Math.max(0, at - 80), at + title.length + 80);
}

async function expectAbsent(
  scope: Page | Locator,
  title: string,
  where: string,
) {
  const html =
    "content" in scope
      ? await scope.content()
      : await scope.evaluate((element) => element.outerHTML);
  expect
    .soft(excerptAround(html, title), `${where}: the DOM holds the title`)
    .toBe("");
  expect
    .soft(
      await scope.getByText(title, { exact: true }).count(),
      `${where}: elements whose text is the title`,
    )
    .toBe(0);
}

function recentLink(page: Page, title: string) {
  return page
    .getByRole("list", { name: "Recent", exact: true })
    .getByRole("link", { name: title, exact: true });
}

async function pinOpenDocument(page: Page) {
  const pin = page.getByRole("button", { name: "Pin to Studio home" });
  await expect(pin).toBeEnabled();
  await expect(pin).toHaveAttribute("aria-pressed", "false");
  await pin.click();
  await expect(pin).toHaveAttribute("aria-pressed", "true");
}

async function expectNoStoredTitle(page: Page, stamp: string, where: string) {
  const response = await page.request.get(
    `${base}/web-studio/api/payload-preferences?limit=100&depth=0`,
  );
  expect.soft(response.status(), `${where}: status`).toBe(200);
  const body = (await response.json()) as {
    docs?: Array<{ key?: unknown; value?: unknown }>;
    hasNextPage?: unknown;
  };
  expect.soft(body.hasNextPage, `${where}: a further page`).toBe(false);
  const holding = (body.docs ?? []).flatMap((row) => {
    const value = JSON.stringify(row.value) ?? "";
    return [`Alpha ${stamp}`, `Bravo ${stamp}`]
      .filter((title) => value.includes(title))
      .map((title) => ({
        key: row.key,
        title,
        value: excerptAround(value, title),
      }));
  });
  expect.soft(holding, `${where}: rows that hold a title`).toEqual([]);
}

const BODY_READ_LIMIT = 30_000;

function copyFetchBodies() {
  const store = window as unknown as { __asymReceived?: PageCopy[] };
  if (store.__asymReceived) return;
  store.__asymReceived = [];
  const original = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const response = await original(input, init);
    const copy: PageCopy = {
      method: (
        init?.method ?? (input instanceof Request ? input.method : "GET")
      ).toUpperCase(),
      url: response.url,
      status: response.status,
      text: "",
      done: false,
    };
    store.__asymReceived?.push(copy);
    const reader = response.clone().body?.getReader();
    if (!reader) {
      copy.done = true;
      return response;
    }
    const decoder = new TextDecoder();
    void (async () => {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        copy.text += decoder.decode(value, { stream: true });
      }
    })()
      .catch((error: unknown) => {
        copy.error = error instanceof Error ? error.message : String(error);
      })
      .finally(() => {
        copy.done = true;
      });
    return response;
  };
}

async function readBody(
  response: PlaywrightResponse,
): Promise<{ text: string } | { unread: string }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const limit = new Promise<{ unread: string }>((resolve) => {
    timer = setTimeout(
      () => resolve({ unread: `not read within ${BODY_READ_LIMIT} ms` }),
      BODY_READ_LIMIT,
    );
  });
  try {
    return await Promise.race([
      response.text().then(
        (text) => ({ text }),
        (error: Error) => ({ unread: error.message.split("\n")[0]! }),
      ),
      limit,
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function takePageCopies(page: Page) {
  await page
    .waitForFunction(
      () =>
        (
          (window as unknown as { __asymReceived?: PageCopy[] })
            .__asymReceived ?? []
        ).every((copy) => copy.done),
      undefined,
      { timeout: 5_000 },
    )
    .catch((error: unknown) => {
      if (!(error instanceof playwrightErrors.TimeoutError)) throw error;
    });
  return page.evaluate(() => {
    const store = window as unknown as { __asymReceived?: PageCopy[] };
    const copies = (store.__asymReceived ?? []).map((copy) => ({ ...copy }));
    store.__asymReceived = [];
    return copies;
  });
}

async function switchRecordingResponses(page: Page, tenant: string) {
  await page.addInitScript(copyFetchBodies);
  await page.goto(`${base}/web-studio/organization?next=%2Fweb-studio`);
  const origin = new URL(base).origin;
  const recorded = (address: string) => {
    const url = new URL(address);
    return (
      url.origin === origin &&
      !url.pathname.startsWith("/_next/") &&
      !url.pathname.startsWith("/__nextjs_font/") &&
      !url.pathname.startsWith("/web-studio/organization")
    );
  };
  const isFetch = (request: Request) =>
    ["fetch", "xhr"].includes(request.resourceType());
  const inFlight = new Set<Request>();
  const documentOf = new Map<Request, number>();
  let openDocument = 0;
  const reads: Array<Promise<ReceivedBody>> = [];
  const fetched: Array<{ key: string; url: string; status: number }> = [];
  const bodies: ReceivedBody[] = [];
  let lastStart = Date.now();
  const onRequest = (request: Request) => {
    if (!recorded(request.url())) return;
    lastStart = Date.now();
    documentOf.set(request, openDocument);
    if (!isFetch(request)) inFlight.add(request);
  };
  const onEnded = (request: Request) => {
    inFlight.delete(request);
  };
  const onNavigated = (frame: ReturnType<Page["mainFrame"]>) => {
    if (frame !== page.mainFrame()) return;
    inFlight.clear();
    openDocument += 1;
  };
  const onResponse = (response: PlaywrightResponse) => {
    if (!recorded(response.url())) return;
    const status = response.status();
    if (status >= 300 && status < 400) return;
    const request = response.request();
    const url = new URL(response.url());
    const label = `${request.method()} ${url.pathname}${url.search}`;
    if (isFetch(request) && documentOf.get(request) !== openDocument) {
      reads.push(
        readBody(response).then((body) =>
          "text" in body
            ? { url: label, status, ...body }
            : { url: label, status, leftWithItsDocument: true as const },
        ),
      );
      return;
    }
    if (isFetch(request)) {
      fetched.push({
        key: `${request.method()} ${response.url()}`,
        url: label,
        status,
      });
      return;
    }
    reads.push(
      readBody(response).then((body) => ({ url: label, status, ...body })),
    );
  };
  page.on("request", onRequest);
  page.on("requestfinished", onEnded);
  page.on("requestfailed", onEnded);
  page.on("response", onResponse);
  page.on("framenavigated", onNavigated);
  await chooseOrganization(page, tenant);
  await page.waitForURL((url) => url.pathname === "/web-studio");

  const settle = async () => {
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            (
              (window as unknown as { __asymReceived?: PageCopy[] })
                .__asymReceived ?? []
            ).some((copy) =>
              new URL(copy.url).pathname.endsWith(
                "/web-studio/api/principal-links/me",
              ),
            ),
          ),
        { message: "the open page has started (its own session read)" },
      )
      .toBe(true);
    await expect
      .poll(
        () =>
          [...inFlight]
            .map((request) => new URL(request.url()).pathname)
            .concat(
              Date.now() - lastStart < 1_500 ? ["(a call just began)"] : [],
            ),
        { message: "calls of the open page still loading", intervals: [100] },
      )
      .toEqual([]);
    const copies = await takePageCopies(page);
    for (const response of fetched.splice(0)) {
      const at = copies.findIndex(
        (copy) => `${copy.method} ${copy.url}` === response.key,
      );
      const [copy] = at === -1 ? [] : copies.splice(at, 1);
      bodies.push(
        bodyFromPageCopy({ url: response.url, status: response.status }, copy),
      );
    }
    for (const copy of copies) {
      if (recorded(copy.url)) {
        bodies.push(
          bodyFromPageCopy(
            { url: `${copy.method} ${copy.url}`, status: copy.status },
            copy,
          ),
        );
      }
    }
    bodies.push(...(await Promise.all(reads.splice(0))));
  };
  return {
    goto: async (url: string) => {
      await settle();
      await page.goto(url);
    },
    stop: async () => {
      await settle();
      page.off("request", onRequest);
      page.off("requestfinished", onEnded);
      page.off("requestfailed", onEnded);
      page.off("response", onResponse);
      page.off("framenavigated", onNavigated);
      return bodies;
    },
  };
}

function auditReceived(
  bodies: ReceivedBody[],
  title: string,
  where: (place: string) => string,
) {
  test.info().annotations.push({
    type: "answered after its document was left",
    description: `${where("responses")}: ${
      bodies
        .flatMap((body) =>
          "leftWithItsDocument" in body ? [`${body.url} (${body.status})`] : [],
        )
        .join(", ") || "none"
    }`,
  });
  expect
    .soft(
      bodies.flatMap((body) =>
        "unread" in body
          ? [`${body.url} (${body.status}): ${body.unread}`]
          : [],
      ),
      where("responses since the switch whose body could not be read"),
    )
    .toEqual([]);
  expect
    .soft(
      bodies.flatMap((body) =>
        "text" in body && body.text.includes(title)
          ? [{ url: body.url, excerpt: excerptAround(body.text, title) }]
          : [],
      ),
      where("responses received since the switch"),
    )
    .toEqual([]);
}

test("@cms a person in two organizations sees each one's pages, documents and media only while it is selected (D-18: WP6 part 2b, the media are each organization's seeded record, relabelled and put back, since staff neither upload nor delete media before part 2c)", async ({
  page,
}) => {
  // Creates and relabels in two organizations and switches four times. As
  // the first Web Studio case it also pays for compiling the list and
  // document views on a server that has not shown them yet (limits above).
  test.setTimeout(
    test.info().retry === 0
      ? FIRST_CASE_FIRST_ATTEMPT_LIMIT
      : FIRST_CASE_RETRY_LIMIT,
  );
  await signIn(page);
  const stamp = `wsten-${Date.now()}`;
  const created: Array<[string, "pages", string]> = [];
  const relabelled: Array<[string, string, string]> = [];

  try {
    // No choice yet: Web Studio asks, and never picks the first.
    await enter(page, DEMO);
    expect(await webStudioScope(page)).toEqual({
      tenant: DEMO,
      assignment: rowIn(DEMO),
    });
    const demoPage = await createDraftPage(page, base, `Alpha ${stamp}`);
    created.push([DEMO, "pages", demoPage]);
    const demoMedia = await labelSeededMedia(page, base, `alpha ${stamp}`);
    relabelled.push([DEMO, demoMedia.id, demoMedia.previousAlt]);

    await switchOrganization(page, base, SECOND);
    // The document scope that Web Studio's pickers read follows the cookie.
    expect(await webStudioScope(page)).toEqual({
      tenant: SECOND,
      assignment: rowIn(SECOND),
    });
    const secondPage = await createDraftPage(page, base, `Bravo ${stamp}`);
    created.push([SECOND, "pages", secondPage]);
    const secondMedia = await labelSeededMedia(page, base, `bravo ${stamp}`);
    relabelled.push([SECOND, secondMedia.id, secondMedia.previousAlt]);

    for (const [tenant, own, other, ownPage, otherPage] of [
      [SECOND, "Bravo", "Alpha", secondPage, demoPage],
      [DEMO, "Alpha", "Bravo", demoPage, secondPage],
    ] as const) {
      const ownTitle = `${own} ${stamp}`;
      const otherTitle = `${other} ${stamp}`;
      const where = (place: string) => `${place}, ${own}'s organization`;
      const received = await switchRecordingResponses(page, tenant);
      // What a REST call returns.
      expect(await restTitles(page, base, "pages", stamp)).toEqual([ownTitle]);
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
      await expectNoStoredTitle(page, stamp, where("stored preferences"));

      const titleField = page.getByRole("textbox", { name: /^Title/ }).first();
      await received.goto(`${base}/web-studio/collections/pages/${ownPage}`);
      await expect(titleField).toHaveValue(ownTitle);
      await pinOpenDocument(page);

      let attempt = 0;
      await expect(async () => {
        if (attempt++ > 0) {
          await received.goto(
            `${base}/web-studio/collections/pages/${ownPage}`,
          );
          await expect(titleField).toHaveValue(ownTitle, { timeout: 30_000 });
        }
        await received.goto(`${base}/web-studio/collections/pages`);
        await expect(recentLink(page, ownTitle)).toBeVisible({
          timeout: 5_000,
        });
      }).toPass({ timeout: 90_000 });

      await expect(recentLink(page, ownTitle)).toBeVisible();
      await expect(
        page.getByRole("main").getByText(ownTitle).first(),
      ).toBeVisible();
      expect
        .soft(
          await page.getByText(otherTitle).count(),
          where("the pages list, text containing the other title"),
        )
        .toBe(0);
      await expectAbsent(page, otherTitle, where("the pages list"));

      await received.goto(`${base}/web-studio`);
      await expect(recentLink(page, ownTitle)).toBeVisible();
      const card = page.getByRole("region", { name: "Your documents" });
      await expect(
        card
          .getByRole("list", { name: "Pinned documents" })
          .getByRole("link", { name: ownTitle, exact: true }),
      ).toBeVisible();
      await expectAbsent(card, otherTitle, where("Your documents, Pinned"));
      await expectAbsent(page, otherTitle, where("the Studio home, Pinned"));
      await card.getByRole("tab", { name: "Recently viewed" }).click();
      await expect(
        card
          .getByRole("list", { name: "Recently viewed documents" })
          .getByRole("link", { name: new RegExp(`^${ownTitle}`) }),
      ).toBeVisible();
      await expectAbsent(
        card,
        otherTitle,
        where("Your documents, Recently viewed"),
      );
      await expectAbsent(
        page,
        otherTitle,
        where("the Studio home, Recently viewed"),
      );
      auditReceived(await received.stop(), otherTitle, where);
    }
  } finally {
    for (const tenant of [DEMO, SECOND]) {
      await switchOrganization(page, base, tenant);
      for (const [owner, collection, id] of created) {
        if (owner === tenant) await deleteDocument(page, base, collection, id);
      }
      for (const [owner, id, alt] of relabelled) {
        if (owner === tenant) await restoreMediaAlt(page, base, id, alt);
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
  // Only the organizations' options, in the chooser's main region: since the
  // join, development tools add their own "Open …" buttons beside it.
  await expect(
    page.getByRole("main").getByRole("button", { name: /^Open / }),
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
    expect(await response.json()).toEqual({
      message,
      errors: [{ message }],
      docs: [],
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
  expect(await sent("/web-studio/api/principal-links/me")).toContain(
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

test("@cms a write to /web-studio/api from another origin is refused and changes nothing (D-18: WP6 part 2b pages carry a Site and a family)", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `wsorigin-${Date.now()}`;
  const site = await siteOf(page, base);

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
        site,
        family: "standard",
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

test("@cms Save in a page opened for one organization, after another tab switched to the other, is refused, changes nothing and asks the person to reload (D-18: WP6 part 2b pages carry a Site and a family)", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `wsstale-${Date.now()}`;
  const id = await createDraftPage(page, base, `Form ${stamp}`);
  const site = await siteOf(page, base);

  try {
    // Tab one keeps the document open for the demo organization.
    await openStarted(page, `${base}/web-studio/collections/pages/${id}`);
    const title = page.getByRole("textbox", { name: /^Title/ }).first();
    await expect(title).toHaveValue(`Form ${stamp}`);
    // Tab two switches Web Studio to the second organization.
    await holdOwnCalls(page);
    const other = await page.context().newPage();
    await switchOrganization(other, base, SECOND);

    // The editor's own Save is refused, named as a refusal, and it is the
    // Save that opens the one notice (council C2, r2 CR5).
    const autosaves = refusedAutosaves(page, "pages", id);
    await title.fill(`Retargeted ${stamp}`);
    await expect
      .poll(() =>
        autosaves.some((body) => body.includes(`Retargeted ${stamp}`)),
      )
      .toBe(true);
    await expect(staleNotice(page)).toHaveCount(0);
    const saveDraft = page.getByRole("button", { name: /^Save Draft$/i });
    await expect(saveDraft).toBeEnabled();
    const saved = page.waitForResponse(
      (r) =>
        new URL(r.url()).pathname === `/web-studio/api/pages/${id}` &&
        r.request().method() === "PATCH" &&
        !r.url().includes("autosave=true"),
    );
    await saveDraft.click();
    const save = await saved;
    expect(save.status()).toBe(409);
    expect(save.headers()["x-asym-web-studio-refusal"]).toBe("scope_mismatch");
    await expect(staleNotice(page)).toBeVisible();
    await expect(staleNotice(page)).toContainText(STALE_MESSAGE);
    await expect(page.getByRole("alertdialog")).toHaveCount(1);

    // A create from the same document is refused the same way.
    const created = await page.evaluate(
      async ({ s, site: siteId }) => {
        const response = await fetch("/web-studio/api/pages?draft=true", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: `New ${s}`,
            slug: `new-${s}`,
            site: siteId,
            family: "standard",
            _status: "draft",
          }),
        });
        return { status: response.status, body: await response.json() };
      },
      { s: stamp, site },
    );
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

    // Reload, from the notice, opens the organization the cookie now selects.
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await markDocument(page);
    await staleNotice(page).getByRole("button", { name: "Reload" }).click();
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
    await openStarted(
      page,
      `${base}/web-studio/collections/pages?search=${encodeURIComponent(stamp)}`,
    );
    const row = page.getByRole("checkbox", { name: `Select Bulk ${stamp}` });
    await expect(row).toBeVisible();
    await holdOwnCalls(page);
    const other = await page.context().newPage();
    await switchOrganization(other, base, SECOND);

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
    await expect(staleNotice(page)).toHaveCount(0);
    await markDocument(page);
    const navigations: string[] = [];
    const onFrameNavigated = (frame: ReturnType<Page["mainFrame"]>) => {
      if (frame === page.mainFrame()) {
        navigations.push(frame.url());
      }
    };
    page.on("framenavigated", onFrameNavigated);
    await page.getByRole("button", { name: "Confirm", exact: true }).click();
    const response = await deleted;
    expect(response.status()).toBe(409);
    expect(response.headers()["x-asym-web-studio-refusal"]).toBe(
      "scope_mismatch",
    );
    await expect(staleNotice(page)).toBeVisible();
    await expect(staleNotice(page)).toContainText(STALE_MESSAGE);
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    expect(navigations).toEqual([]);
    expect(await sameDocument(page)).toBe(true);
    expect((await webStudioScope(page)).tenant).toBe(DEMO);
    await expect(staleNotice(page)).toBeVisible();
    await expect(staleNotice(page)).toContainText(STALE_MESSAGE);
    page.off("framenavigated", onFrameNavigated);

    await staleNotice(page).getByRole("button", { name: "Reload" }).click();
    await expect.poll(() => sameDocument(page)).toBe(false);
    await expect
      .poll(async () => (await webStudioScope(page)).tenant)
      .toBe(SECOND);

    await switchOrganization(other, base, DEMO);
    expect(await restTitles(other, base, "pages", stamp)).toEqual([
      `Bulk ${stamp}`,
    ]);
    await other.close();
  } finally {
    await cleanUp(page, "pages", id);
  }
});

test("@cms a preferences write from a tab opened for one organization, after another tab switched to the other, answers 409 with the refusal header and asks to reload", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const key = `wp6-2a-stale-pref-${Date.now()}`;

  await openStarted(page, `${base}/web-studio/collections/pages`);
  await holdOwnCalls(page);
  const other = await page.context().newPage();
  await switchOrganization(other, base, SECOND);

  try {
    await expect(staleNotice(page)).toHaveCount(0);
    const postResult = await page.evaluate(async (prefKey) => {
      const response = await fetch(
        `/web-studio/api/payload-preferences/${prefKey}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ value: { stale: true } }),
        },
      );
      return {
        status: response.status,
        refusal: response.headers.get("x-asym-web-studio-refusal"),
        body: (await response.json()) as { message?: string },
      };
    }, key);
    expect(postResult.status).toBe(409);
    expect(postResult.refusal).toBe("scope_mismatch");
    expect(postResult.body.message).toBe(STALE_MESSAGE);
    await expect(staleNotice(page)).toBeVisible();
    await expect(staleNotice(page)).toContainText(STALE_MESSAGE);

    const deleteResult = await page.evaluate(async (prefKey) => {
      const response = await fetch(
        `/web-studio/api/payload-preferences/${prefKey}`,
        {
          method: "DELETE",
        },
      );
      return {
        status: response.status,
        refusal: response.headers.get("x-asym-web-studio-refusal"),
        body: (await response.json()) as { message?: string },
      };
    }, key);
    expect(deleteResult.status).toBe(409);
    expect(deleteResult.refusal).toBe("scope_mismatch");
    expect(deleteResult.body.message).toBe(STALE_MESSAGE);

    await expect
      .poll(async () => (await webStudioScope(other)).tenant)
      .toBe(SECOND);
    await openStarted(other, `${base}/web-studio/collections/pages`);
    const activePost = await other.evaluate(async (prefKey) => {
      const response = await fetch(
        `/web-studio/api/payload-preferences/${prefKey}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ value: { stale: false } }),
        },
      );
      return response.status;
    }, key);
    expect(activePost).toBe(200);
    const activeDelete = await other.evaluate(async (prefKey) => {
      const response = await fetch(
        `/web-studio/api/payload-preferences/${prefKey}`,
        {
          method: "DELETE",
        },
      );
      return response.status;
    }, key);
    expect(activeDelete).toBe(200);
  } finally {
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await other.close();
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

test("@cms searching, sorting and paging a list stay in the same document", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `wslist-${Date.now()}`;
  // Two pages of results at ten rows a page.
  const ids: string[] = [];
  for (let n = 1; n <= 12; n += 1) {
    ids.push(
      await createDraftPage(
        page,
        base,
        `List ${stamp} ${String(n).padStart(2, "0")}`,
      ),
    );
  }

  try {
    await page.goto(`${base}/web-studio/collections/pages`);
    await markDocument(page);

    // Payload's list replaces the query alone; each pause in typing is one
    // replace, and none may reload the page or lose a keystroke (CR1).
    const search = page.getByRole("searchbox", { name: "Search pages" });
    await search.pressSequentially(stamp, { delay: 80 });
    const row = (n: string) =>
      page.getByRole("link", { name: `List ${stamp} ${n}`, exact: true });
    await expect(page).toHaveURL(/[?&]search=/);
    // Ten of the twelve, in whatever order Payload remembers for this person.
    await expect(
      page.getByRole("link", { name: new RegExp(`^List ${stamp} \\d\\d$`) }),
    ).toHaveCount(10);
    await expect(search).toHaveValue(stamp);
    await expect(search).toBeFocused();
    expect(await sameDocument(page)).toBe(true);

    // The column header turns the order on each click. Click at least once
    // (the remembered order may already be ascending), then until it is,
    // waiting for each click to change the address.
    const title = page.getByRole("button", { name: "Title", exact: true });
    const sortedBy = () => new URL(page.url()).searchParams.get("sort");
    for (let turn = 0; turn < 4; turn += 1) {
      const before = sortedBy();
      await title.click();
      await expect.poll(sortedBy).not.toBe(before);
      if (sortedBy() === "title") break;
    }
    expect(sortedBy()).toBe("title");
    await expect(row("01")).toBeVisible();
    expect(await sameDocument(page)).toBe(true);

    // By keyboard: a development-only floating button covers the pager's
    // corner on a dev server.
    await page.getByRole("button", { name: "Go to next page" }).press("Enter");
    await expect(page).toHaveURL(/[?&]page=2/);
    await expect(row("11")).toBeVisible();
    await expect(row("01")).toHaveCount(0);
    expect(await sameDocument(page)).toBe(true);
  } finally {
    await cleanUp(page, "pages", ...ids);
  }
});

test("@cms Switch organization with unsaved changes asks once, then loads the chooser as a new document (D-18: WP6 part 2b menus belong to a Site and link to absolute addresses)", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `wsleave-${Date.now()}`;
  // Navigation keeps no versions, so its editor does not autosave and
  // Payload guards an unsaved change (pages autosave and never ask).
  const created = await page.request.post(`${base}/web-studio/api/navigation`, {
    headers: await writeHeaders(page, base),
    data: {
      site: await siteOf(page, base),
      label: `Leave ${stamp}`,
      items: [{ label: "Home", href: "https://example.org/" }],
    },
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

test("@cms two editors of one organization on a document with no versions: the second meets the lock instead of overwriting, and leaving releases it (D-18: WP6 part 2b menus belong to a Site and link to absolute addresses)", async ({
  page,
  browser,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `wslock-${Date.now()}`;
  // Navigation keeps no versions: an overwrite there could not be undone.
  const created = await page.request.post(`${base}/web-studio/api/navigation`, {
    headers: { ...(await writeHeaders(page, base)), ...NO_IDLE_CONNECTION },
    data: {
      site: await siteOf(page, base, NO_IDLE_CONNECTION),
      label: `Lock ${stamp}`,
      items: [{ label: "Home", href: "https://example.org/" }],
    },
  });
  expect(created.status()).toBe(201);
  const id = String((await created.json()).doc.id);
  const locks = async () =>
    (
      (await (
        await page.request.get(
          `${base}/web-studio/api/payload-locked-documents?where[document.value][equals]=${id}&where[document.relationTo][equals]=navigation`,
          { headers: NO_IDLE_CONNECTION },
        )
      ).json()) as { docs: unknown[] }
    ).docs.length;
  const second = await browser.newContext();

  try {
    // The first editor changes the document; Payload locks it for them.
    await page.goto(`${base}/web-studio/collections/navigation/${id}`);
    const label = page.getByRole("textbox", { name: /^Label/ }).first();
    await expect(label).toHaveValue(`Lock ${stamp}`);
    await label.fill(`First editor ${stamp}`);
    await expect.poll(locks).toBe(1);

    // The second editor, in the same organization, meets the lock.
    const other = await second.newPage();
    await signInAs(other, "admin", "demoAdmin", base);
    await other.goto(`${base}/web-studio/collections/navigation/${id}`);
    await expect(
      other.getByRole("heading", { name: "Document locked" }),
    ).toBeVisible();
    await expect(
      other.getByRole("button", { name: "Take over" }),
    ).toBeVisible();
    // A save from the second editor's page meets the lock itself: Payload's
    // `Locked` error (HTTP 423) with the message its update operation gives,
    // not a refusal of Web Studio's own (council r3 CR7).
    const save = await other.evaluate(async (doc) => {
      const response = await fetch(`/web-studio/api/navigation/${doc}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label: "Second editor" }),
      });
      return {
        status: response.status,
        refusal: response.headers.get("x-asym-web-studio-refusal"),
        body: (await response.json()) as unknown,
      };
    }, id);
    expect(save).toEqual({
      status: 423,
      refusal: null,
      body: {
        errors: [
          {
            message: `Document with ID ${id} is currently locked by another user and cannot be updated.`,
          },
        ],
      },
    });
    const stored = await (
      await page.request.get(`${base}/web-studio/api/navigation/${id}`, {
        headers: NO_IDLE_CONNECTION,
      })
    ).json();
    expect(stored.label).toBe(`Lock ${stamp}`);

    // The first editor leaves (Payload asks about the unsaved change); the
    // edit view releases the lock, and the second editor can open it freely.
    await page
      .getByRole("navigation", { name: "breadcrumb" })
      .getByRole("link", { name: "Navigation" })
      .click();
    await page.getByRole("button", { name: "Leave anyway" }).click();
    await page.waitForURL((url) =>
      url.pathname.endsWith("/web-studio/collections/navigation"),
    );
    await expect.poll(locks).toBe(0);
    await other.reload();
    await expect(
      other.getByRole("textbox", { name: /^Label/ }).first(),
    ).toHaveValue(`Lock ${stamp}`);
    await expect(
      other.getByRole("heading", { name: "Document locked" }),
    ).toHaveCount(0);
  } finally {
    await second.close();
    await cleanUp(page, "navigation", id);
  }
});

test('@cms the overview\'s "Your documents" card lists what the person viewed, in the organization selected only', async ({
  page,
}) => {
  // The card reads the person's recently viewed documents through one of
  // Payload's server functions. The name it was written with, beta.3's, is
  // not one Payload 4.0.0-beta.9 registers: every call answered 500, and the
  // card showed only "Couldn't load documents" (AL-2675).
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `wsdash-${Date.now()}`;
  const created: Array<[string, string]> = [];
  const title = page.getByRole("textbox", { name: /^Title/ }).first();

  try {
    // Viewing a document records it in the person's recently viewed list.
    const alpha = await createDraftPage(page, base, `Alpha ${stamp}`);
    created.push([DEMO, alpha]);
    await page.goto(`${base}/web-studio/collections/pages/${alpha}`);
    await expect(title).toHaveValue(`Alpha ${stamp}`);
    await switchOrganization(page, base, SECOND);
    const bravo = await createDraftPage(page, base, `Bravo ${stamp}`);
    created.push([SECOND, bravo]);
    await page.goto(`${base}/web-studio/collections/pages/${bravo}`);
    await expect(title).toHaveValue(`Bravo ${stamp}`);

    for (const [tenant, own, other] of [
      [SECOND, "Bravo", "Alpha"],
      [DEMO, "Alpha", "Bravo"],
    ] as const) {
      // The chooser lands on the overview, as it does for the person.
      await switchOrganization(page, base, tenant);
      const card = page.getByRole("region", { name: "Your documents" });
      await expect(
        card
          .getByRole("list", { name: "Pinned documents" })
          .or(card.getByText("No pinned documents")),
      ).toBeVisible();
      await card.getByRole("tab", { name: "Recently viewed" }).click();
      const viewed = card.getByRole("list", {
        name: "Recently viewed documents",
      });
      await expect(
        viewed.getByRole("link", { name: new RegExp(`^${own} ${stamp}`) }),
      ).toBeVisible();
      await expect(
        viewed.getByRole("link", { name: new RegExp(`^${other} ${stamp}`) }),
      ).toHaveCount(0);
      await expect(card.getByRole("alert")).toHaveCount(0);
    }
  } finally {
    const tab = await page.context().newPage();
    // Each page is deleted in its own organization.
    for (const [tenant, id] of created) {
      try {
        await switchOrganization(tab, base, tenant);
        await deleteDocument(tab, base, "pages", id);
      } catch (error) {
        console.warn(`cleanup of pages ${id} failed:`, error);
      }
    }
    await tab.close();
  }
});

test("@cms nothing of Payload's answers under /api, old media links are sent to the new route for this release, and Mission Control's /api answers as before (D-18: WP6 part 2b signs in as principal-links, and a media file address finds nothing until part 2c)", async ({
  page,
  request,
}) => {
  await signIn(page);
  await enter(page, DEMO);

  // A media link that still holds the old address is sent on, temporarily,
  // signed out, as the donor's image optimizer asks (council r2 CR3).
  // Playwright's own request context carries no cookie.
  const media = await request.fetch(
    `${base}/api/media/file/anything.png?width=640`,
    { maxRedirects: 0 },
  );
  expect(media.status()).toBe(307);
  expect(media.headers()["location"]).toBe(
    "/web-studio/api/media/file/anything.png?width=640",
  );
  expect(
    (
      await page.request.get(
        `${base}/web-studio/api/media/file/anything.png?width=640`,
        { maxRedirects: 0 },
      )
    ).status(),
  ).toBe(404);

  for (const [method, path] of [
    ["GET", "/api/pages?limit=1"],
    ["GET", "/api/principal-links/me"],
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
    (
      await page.request.get(`${base}/web-studio/api/principal-links/me`)
    ).status(),
  ).toBe(200);
  expect((await page.request.get(`${base}/api/health`)).status()).toBe(200);
});

// Council on the joined release, JC1: Web Studio's pages are a segment of
// their own. Sign-in with Web Studio as its next page used to replace softly
// into it; the scope provider then rendered nothing and reloaded, so every
// signed-out visit paid two renders of Payload's layout and a blank page.
test("@cms signing in with a Web Studio page next renders that page once, as one document load", async ({
  page,
}) => {
  const target = "/web-studio/collections/pages";
  const documents: string[] = [];
  const flightsBeforeDocument: string[] = [];
  page.on("request", (request) => {
    if (request.frame() !== page.mainFrame()) return;
    const url = new URL(request.url());
    if (url.pathname !== target) return;
    if (request.resourceType() === "document") {
      documents.push(url.pathname);
    } else if (
      documents.length === 0 &&
      (request.headers()["rsc"] === "1" || url.searchParams.has("_rsc"))
    ) {
      flightsBeforeDocument.push(url.href);
    }
  });

  await page.goto(`${base}/login?next=${encodeURIComponent(target)}`);
  if (signsInThroughStub) {
    // A production build, where the E2E bypass is off: the form, through
    // the Supabase stub.
    const person = fixturePerson("demoAdmin");
    await page.getByLabel("Email").fill(`${person.userId}@example.test`);
    await page.getByLabel("Password", { exact: true }).fill("stub-password");
    await page.getByRole("button", { name: "Sign in" }).click();
  } else {
    await page.getByRole("button", { name: "Demo Access" }).click();
  }
  await page.waitForURL((url) => url.pathname === target);
  // The native shell, or Web Studio's own sign-in view for a stub person
  // with no Payload account (as admin-tenant-address.spec.ts notes).
  await expect(
    page
      .getByTestId("web-studio-native-shell")
      .or(page.getByText("Web Studio", { exact: true }))
      .first(),
  ).toBeVisible();

  expect(flightsBeforeDocument).toEqual([]);
  expect(documents).toEqual([target]);
});

// Council on the joined release, JC1: the chooser is under /web-studio but
// is not a Web Studio page. When the gate sends a Web Studio page there
// during a client navigation, it lands on a new document, and nothing of
// the old organization's scope is left in it.
test("@cms a Web Studio page whose choice is gone sends the person to the chooser as a new document, with no organization's scope", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  await page.goto(`${base}/web-studio/collections/pages`);
  await expect(
    page.locator(`[data-web-studio-scope="${DEMO}"]`).first(),
  ).toBeAttached();
  await markDocument(page);

  // The choice is gone (the cookie expired or was cleared); the person holds
  // two staff rows, so the next Web Studio page asks again. The page's own
  // calls are refused meanwhile, and the notice that says so may open first;
  // the person carries on with "Not now".
  const notice = page.getByRole("alertdialog", {
    name: "Choose an organization first",
  });
  await page.addLocatorHandler(notice, async () => {
    await notice.getByRole("button", { name: "Not now" }).click();
  });
  await page.context().clearCookies({ name: WEB_STUDIO_COOKIE });
  await page
    .getByRole("link", { name: "Web Studio", exact: true })
    .first()
    .click();
  await page.waitForURL((url) => url.pathname === "/web-studio/organization");
  await expect(
    page.getByRole("heading", { name: "Choose an organization" }),
  ).toBeVisible();
  await expect.poll(() => sameDocument(page)).toBe(false);
  await expect(page.locator("[data-web-studio-scope]")).toHaveCount(0);
});

// Council on the joined release, JC2: Payload's server functions are server
// actions posted to the page's own address; they used to run in whatever
// organization the cookie selected, so a page opened for one organization,
// after another tab switched, listed the other's documents in its own.
test("@cms a server function from a page opened for one organization, after another tab switched to the other, is refused and asks the person to reload", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `wsfn-${Date.now()}`;
  const created: Array<[string, string]> = [];
  const title = page.getByRole("textbox", { name: /^Title/ }).first();

  try {
    // One page viewed in each organization, so each has a recently viewed list.
    const alpha = await createDraftPage(page, base, `Alpha ${stamp}`);
    created.push([DEMO, alpha]);
    await page.goto(`${base}/web-studio/collections/pages/${alpha}`);
    await expect(title).toHaveValue(`Alpha ${stamp}`);
    await switchOrganization(page, base, SECOND);
    const bravo = await createDraftPage(page, base, `Bravo ${stamp}`);
    created.push([SECOND, bravo]);
    await page.goto(`${base}/web-studio/collections/pages/${bravo}`);
    await expect(title).toHaveValue(`Bravo ${stamp}`);

    // Tab one: the overview, opened for the demo organization.
    await switchOrganization(page, base, DEMO);
    const card = page.getByRole("region", { name: "Your documents" });
    await expect(card.getByRole("tabpanel")).toBeVisible();
    await expect(
      card
        .getByRole("list", { name: "Pinned documents" })
        .or(card.getByText("No pinned documents")),
    ).toBeVisible();
    await expect(recentLink(page, `Alpha ${stamp}`)).toBeVisible();
    // Tab two switches Web Studio to the second organization.
    const other = await page.context().newPage();
    await switchOrganization(other, base, SECOND);

    const call = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === "/web-studio" &&
        Boolean(response.request().headers()["next-action"]),
    );
    await card.getByRole("tab", { name: "Recently viewed" }).click();
    const response = await call;

    await expect(staleNotice(page)).toBeVisible();
    await expect(staleNotice(page)).toContainText(STALE_MESSAGE);
    expect(response.request().headers()["x-asym-web-studio-tenant"]).toBe(DEMO);
    expect(response.status()).toBe(500);
    await expect(
      card.getByRole("link", { name: new RegExp(`^Bravo ${stamp}`) }),
    ).toHaveCount(0);
    await other.close();
  } finally {
    const tab = await page.context().newPage();
    for (const [tenant, id] of created) {
      try {
        await switchOrganization(tab, base, tenant);
        await deleteDocument(tab, base, "pages", id);
      } catch (error) {
        console.warn(`cleanup of pages ${id} failed:`, error);
      }
    }
    await tab.close();
  }
});

// Council on the joined release, JC3: Web Studio's cookie lasts thirty days,
// so a link from one organization's Mission Control used to open Web Studio
// in whichever organization the person last chose there.
test("@cms a link from Mission Control into Web Studio asks before working in another organization, never switches by itself, and leads back to that organization", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, SECOND);

  // Mission Control, in the demo organization, at its own address.
  const missionControlStarted = requestSeen(
    page,
    "/api/admin/workers/unreviewed-count",
  );
  await page.goto(`${base}/${DEMO}`);
  await expect.poll(missionControlStarted).toBe(true);
  const link = page.locator('a[href^="/web-studio"]').first();
  await expect(link).toHaveAttribute(
    "href",
    new RegExp(`[?&]organization=${DEMO}&assignment=${rowIn(DEMO)}(&|#|$)`),
  );
  await link.click();
  await page.waitForURL((url) => url.pathname === "/web-studio/organization");
  // The chooser's own notice; Next's route announcer is an alert too.
  await expect(
    page.getByRole("alert").filter({ hasText: "You came from" }),
  ).toHaveText(
    `You came from ${organizationLabel(DEMO)} in Mission Control. Web Studio asks before it changes the organization or the role it works in.`,
  );
  await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText(
    organizationLabel(DEMO),
  );

  // The link switched nothing: Web Studio still works in the second.
  const check = await page.context().newPage();
  await check.goto(`${base}/web-studio`);
  await expect
    .poll(async () => (await webStudioScope(check)).tenant)
    .toBe(SECOND);
  await check.close();

  // The person chooses the demo organization; its name shows in the bar,
  // and the way back is that organization's Mission Control.
  await chooseOrganization(page, DEMO);
  // A Web Studio page, which the chooser's own address is not (JR13).
  await page.waitForURL(
    (url) =>
      url.pathname.startsWith("/web-studio") &&
      !url.pathname.startsWith("/web-studio/organization"),
  );
  await expect.poll(async () => (await webStudioScope(page)).tenant).toBe(DEMO);
  const bar = page.getByRole("banner");
  await expect(bar.getByText(organizationLabel(DEMO))).toBeVisible();
  await bar.getByRole("link", { name: "Mission Control" }).click();
  await page.waitForURL((url) => url.pathname.startsWith(`/${DEMO}`));
});

// Council on the joined release, JC6: "Inside Web Studio a person in two
// organizations sees only the selected organization's missionaries and funds
// in pickers and labels." The pickers read Mission Control's own API through
// slice B's wrapper, which names the document's organization. CI's Supabase
// is a placeholder, so this case answers that API itself, by the organization
// each request names; the server's own filter is slice B's, proven by its
// request-scope specs.
test("@cms Web Studio's missionary and fund pickers, and a saved document's missionary label, name only the selected organization's (D-18: WP6 part 2b offers both pickers in New page, by starter; JC6)", async ({
  page,
}) => {
  const seen: Array<[string, string | undefined, string | undefined]> = [];
  const rows: Record<string, { missionary: string; fund: string }> = {
    [DEMO]: { missionary: "Demo Missionary", fund: "Demo Fund" },
    [SECOND]: { missionary: "Second Missionary", fund: "Second Fund" },
  };
  const answer = (kind: "missionaries" | "funds") => async (route: Route) => {
    const tenant = route.request().headers()["x-asym-tenant"];
    const assignment = route.request().headers()["x-asym-assignment"];
    seen.push([kind, tenant, assignment]);
    // The tenant and the person's row in it, as the resolver checks both
    // (JR13).
    const own =
      tenant && assignment === rowIn(tenant) ? rows[tenant] : undefined;
    if (!own) {
      await route.fulfill({ status: 403, json: { error: "No scope" } });
      return;
    }
    await route.fulfill({
      json:
        kind === "missionaries"
          ? {
              missionaries: [
                {
                  id: MISSIONARY_IDS[tenant],
                  profile: { full_name: own.missionary },
                },
              ],
            }
          : { funds: [{ id: `f-${tenant}`, name: own.fund }] },
    });
  };
  await page.route("**/api/admin/missionaries?**", answer("missionaries"));
  await page.route("**/api/admin/funds?**", answer("funds"));
  await signIn(page);

  for (const [tenant, other] of [
    [DEMO, SECOND],
    [SECOND, DEMO],
  ] as const) {
    seen.length = 0;
    if (tenant === DEMO) await enter(page, DEMO);
    else await switchOrganization(page, base, SECOND);

    await page.goto(
      `${base}/web-studio/pages/new-from-template?template=missionary-giving`,
    );
    const missionary = page.getByRole("combobox", { name: /^Missionary/ });
    await expect(missionary).toBeEnabled();
    await missionary.click();
    await expect(
      page.getByRole("option", { name: rows[tenant]!.missionary }),
    ).toBeVisible();
    await expect(
      page.getByRole("option", { name: rows[other]!.missionary }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");

    await page.goto(
      `${base}/web-studio/pages/new-from-template?template=project`,
    );
    const fund = page.getByRole("combobox", { name: /^Fund/ });
    await expect(fund).toBeEnabled();
    await fund.click();
    await expect(
      page.getByRole("option", { name: rows[tenant]!.fund }),
    ).toBeVisible();
    await expect(
      page.getByRole("option", { name: rows[other]!.fund }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");

    expect(seen.length).toBeGreaterThan(0);
    expect(
      seen.every(([, named, row]) => named === tenant && row === rowIn(tenant)),
    ).toBe(true);
  }

  const planted: Array<[string, string]> = [];
  try {
    for (const [tenant, other] of [
      [DEMO, SECOND],
      [SECOND, DEMO],
    ] as const) {
      await switchOrganization(page, base, tenant);
      const id = await createDraftPage(
        page,
        base,
        `Saved for ${tenant.slice(0, 8)} ${Date.now()}`,
      );
      planted.push([tenant, id]);
      await plantMissionary(id, MISSIONARY_IDS[tenant]!);
      seen.length = 0;
      await page.goto(`${base}/web-studio/collections/pages/${id}`);
      await expect(
        page.getByText(rows[tenant]!.missionary).first(),
      ).toBeVisible();
      await expect(page.getByText(rows[other]!.missionary)).toHaveCount(0);
      expect(seen.length).toBeGreaterThan(0);
      expect(
        seen.every(
          ([, named, row]) => named === tenant && row === rowIn(tenant),
        ),
      ).toBe(true);
    }
  } finally {
    for (const [tenant, id] of planted) {
      await switchOrganization(page, base, tenant);
      await page.request.delete(`${base}/web-studio/api/pages/${id}`, {
        headers: await writeHeaders(page, base),
      });
    }
  }
});

// Coordinator's ruling on the joined release: Payload's own logout, with
// its local strategy off, only runs the collection's afterLogout hook and
// leaves the Supabase session signed in, which a shared computer keeps.
// Web Studio's "Log out" is Mission Control's own sign-out.
test("@cms Log out in Web Studio ends the session as Mission Control's sign-out does, lands on the login page, and a Web Studio page then asks to sign in", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  await openStarted(page, `${base}/web-studio/collections/pages`);

  const signOut = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/auth/signout" &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: /account menu/ }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  expect((await signOut).status()).toBe(200);

  // The login page, as a new document, and it stays there: a signed-in
  // person who opens /login is sent on.
  await page.waitForURL((url) => url.pathname === "/login");
  await page.waitForLoadState("load");
  expect(new URL(page.url()).pathname).toBe("/login");

  // Nothing signs this browser in to the admin app any more: no Supabase
  // session cookie, no bypass cookie, and no Web Studio organization.
  const left = (await page.context().cookies(base))
    .filter((cookie) => cookie.value !== "")
    .map((cookie) => cookie.name);
  expect(
    left.filter((name) => /^sb-.+-auth-token(\.\d+)?$/.test(name)),
  ).toEqual([]);
  expect(left).not.toContain(E2E_AUTH_COOKIE_NAMES.admin);
  expect(left).not.toContain(WEB_STUDIO_COOKIE);

  const target = "/web-studio/collections/pages";
  await page.goto(`${base}${target}`);
  await page.waitForURL((url) => url.pathname === "/login");
  expect(new URL(page.url()).searchParams.get("next")).toBe(target);
});

// Check of the fix lists, JR5: an address under the chooser passed the gate
// as a Web Studio page, and its document, outside its own segment, reloaded
// without end. The proxy now sends it to the chooser before the gate.
test("@cms an address under the chooser lands on the chooser in one document load, and stays there", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);

  const loads: string[] = [];
  page.on("response", (response) => {
    const request = response.request();
    if (
      request.resourceType() === "document" &&
      request.frame() === page.mainFrame() &&
      response.status() < 300
    ) {
      loads.push(new URL(response.url()).pathname);
    }
  });
  await page.goto(`${base}/web-studio/organization/anything`);
  await page.waitForURL((url) => url.pathname === "/web-studio/organization");
  await expect(
    page.getByRole("button", { name: /^Open / }).first(),
  ).toBeVisible();

  // The same document after one of its own round trips: no reload began.
  await markDocument(page);
  await page.evaluate(() => fetch("/api/health").then((r) => r.status));
  expect(await sameDocument(page)).toBe(true);
  expect(loads).toEqual(["/web-studio/organization"]);
});

const CLIPBOARD = "_payloadClipboard";

async function clipboardOf(page: Page) {
  await page.waitForLoadState("load");
  return page
    .evaluate((key) => localStorage.getItem(key), CLIPBOARD)
    .catch(() => "a document still loading");
}

async function draftPreviewPage(page: Page) {
  const listed = (await (
    await page.request.get(
      `${base}/web-studio/api/pages?draft=true&depth=0&limit=1&where[slug][equals]=local-cms-draft-preview`,
    )
  ).json()) as { docs: Array<{ id: string }> };
  const id = listed.docs[0]?.id;
  if (!id) throw new Error("The organization has no draft preview page.");
  return String(id);
}

async function openLayoutClipboard(page: Page) {
  const layout = page.locator(".field-type.blocks-field").first();
  await expect(layout).toBeVisible();
  await layout.getByRole("button", { name: "More options" }).first().click();
  await expect(
    page.getByRole("menuitem", { name: "Copy Field" }),
  ).toBeVisible();
}

async function versionsOf(page: Page, id: string) {
  const body = (await (
    await page.request.get(
      `${base}/web-studio/api/pages/versions?depth=0&limit=10&sort=createdAt&where[parent][equals]=${id}`,
    )
  ).json()) as { docs: Array<{ id: string }> };
  return body.docs.map((doc) => String(doc.id));
}

async function lockCount(page: Page, id: string) {
  const body = (await (
    await page.request.get(
      `${base}/web-studio/api/payload-locked-documents?where[document.value][equals]=${id}&where[document.relationTo][equals]=pages`,
    )
  ).json()) as { docs: unknown[] };
  return body.docs.length;
}

async function restoreFrom(page: Page, version: string) {
  return page.evaluate(async (versionId) => {
    const response = await fetch(
      `/web-studio/api/pages/versions/${versionId}?draft=true`,
      { method: "POST", headers: { "content-type": "application/json" } },
    );
    return response.status;
  }, version);
}

test("@cms no control offers publishing until WP7: the edit view and the bulk bar show no Publish, Unpublish or Schedule, a draft still saves, and a REST publish is refused (WP6 rest, pull request 2)", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `nopublish-${Date.now()}`;
  const id = await createDraftPage(page, base, `No publish ${stamp}`);
  try {
    await page.goto(`${base}/web-studio/collections/pages/${id}`);
    const title = page.getByRole("textbox", { name: /^Title/ }).first();
    await expect(title).toHaveValue(`No publish ${stamp}`);
    await expect(page.getByRole("button", { name: /publish/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /schedule/i })).toHaveCount(
      0,
    );
    await title.fill(`Saved draft ${stamp}`);
    const saved = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === `/web-studio/api/pages/${id}` &&
        response.request().method() === "PATCH" &&
        !response.url().includes("autosave=true"),
    );
    await page.getByRole("button", { name: /^Save Draft$/i }).click();
    expect((await saved).status()).toBe(200);

    const publish = await page.request.patch(
      `${base}/web-studio/api/pages/${id}`,
      {
        headers: await writeHeaders(page, base),
        data: { _status: "published" },
      },
    );
    expect(publish.status()).toBe(400);
    expect(await publish.json()).toMatchObject({
      errors: [
        {
          name: "ValidationError",
          data: {
            errors: [
              {
                path: "_status",
                message: "Publishing is not available in Web Studio yet.",
              },
            ],
          },
        },
      ],
    });

    await page.goto(`${base}/web-studio/collections/pages`);
    await page
      .getByRole("checkbox", { name: `Select Saved draft ${stamp}` })
      .first()
      .check();
    const bar = page.getByRole("group", { name: /selected/ });
    await expect(bar.getByRole("button", { name: /^Delete/ })).toBeVisible();
    await expect(bar.getByRole("button", { name: /^Edit/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /publish/i })).toHaveCount(0);
  } finally {
    await cleanUp(page, "pages", id);
  }
});

test("@cms an editor's own lock never says another editor is active; a restore over another person's lock is refused and the holder's restore passes (WP6 rest, pull request 2; #2809 F4)", async ({
  page,
  browser,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  const stamp = `wsrestore-${Date.now()}`;
  const id = await createDraftPage(page, base, `Restore ${stamp}`);
  const second = await browser.newContext();
  try {
    for (const title of [`Second ${stamp}`, `Third ${stamp}`]) {
      const patched = await page.request.patch(
        `${base}/web-studio/api/pages/${id}?draft=true`,
        { headers: await writeHeaders(page, base), data: { title } },
      );
      expect(patched.status()).toBe(200);
    }
    const [version] = await versionsOf(page, id);
    expect(version).toBeTruthy();

    await page.route(
      (url) =>
        url.pathname === `/web-studio/api/pages/${id}` &&
        url.searchParams.get("autosave") === "true",
      (route) => route.abort(),
    );
    await page.goto(`${base}/web-studio/collections/pages/${id}`);
    const title = page.getByRole("textbox", { name: /^Title/ }).first();
    await expect(title).toHaveValue(`Third ${stamp}`);
    await title.fill(`Holder ${stamp}`);
    await expect.poll(() => lockCount(page, id)).toBe(1);
    await expect(page.getByText("Locked", { exact: true })).toHaveCount(0);

    const sameTab = await page.context().newPage();
    await sameTab.goto(`${base}/web-studio/collections/pages/${id}`);
    await expect(
      sameTab.getByRole("textbox", { name: /^Title/ }).first(),
    ).toBeVisible();
    await expect(sameTab.getByText("Locked", { exact: true })).toHaveCount(0);
    await expect(
      sameTab.getByText("Another editor is active on this document."),
    ).toHaveCount(0);
    await sameTab.close();
    await expect.poll(() => lockCount(page, id)).toBe(1);

    const other = await second.newPage();
    await signInAs(other, "admin", "demoAdmin", base);
    await other.goto(`${base}/web-studio/collections/pages/${id}`);
    await expect(
      other.getByRole("heading", { name: "Document locked" }),
    ).toBeVisible();
    expect(await restoreFrom(other, version!)).toBe(423);
    const stored = (await (
      await page.request.get(`${base}/web-studio/api/pages/${id}?draft=true`)
    ).json()) as { title: string };
    expect(stored.title).not.toBe(`Restore ${stamp}`);

    expect(await restoreFrom(page, version!)).toBe(200);
  } finally {
    await second.close();
    await cleanUp(page, "pages", id);
  }
});

test("@cms Payload's copy-and-paste store is empty after a change of organization, after sign-out from Web Studio and from Mission Control, and on the sign-in page; inside one organization it still pastes (WP6 rest, pull request 2; #2817)", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, SECOND);
  const pasteTarget = await createDraftPage(
    page,
    base,
    `Paste target ${Date.now()}`,
  );
  try {
    await page.goto(
      `${base}/web-studio/collections/pages/${await draftPreviewPage(page)}`,
    );
    await openLayoutClipboard(page);
    await page.getByRole("menuitem", { name: "Copy Field" }).click();
    await expect.poll(() => clipboardOf(page)).not.toBeNull();

    await page.goto(`${base}/web-studio/collections/pages/${pasteTarget}`);
    await openLayoutClipboard(page);
    await expect(
      page.getByRole("menuitem", { name: "Paste Field" }),
    ).toBeEnabled();
    await page.keyboard.press("Escape");

    await switchOrganization(page, base, DEMO);
    await expect.poll(() => clipboardOf(page)).toBeNull();
    await page.goto(
      `${base}/web-studio/collections/pages/${await draftPreviewPage(page)}`,
    );
    await openLayoutClipboard(page);
    await expect(
      page.getByRole("menuitem", { name: "Paste Field" }),
    ).toBeDisabled();
    await page.getByRole("menuitem", { name: "Copy Field" }).click();
    await expect.poll(() => clipboardOf(page)).not.toBeNull();

    await page.getByRole("button", { name: /account menu/ }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await page.waitForURL((url) => url.pathname === "/login");
    await expect.poll(() => clipboardOf(page)).toBeNull();

    await page.evaluate((key) => localStorage.setItem(key, "{}"), CLIPBOARD);
    await page.goto(`${base}/login`);
    await page.waitForLoadState("load");
    await expect.poll(() => clipboardOf(page)).toBeNull();

    await signIn(page);
    await page.goto(`${base}/${DEMO}`);
    await page.evaluate((key) => localStorage.setItem(key, "{}"), CLIPBOARD);
    await page.getByRole("button", { name: "Open profile menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await page.waitForURL((url) => url.pathname === "/login");
    await expect.poll(() => clipboardOf(page)).toBeNull();
  } finally {
    await signIn(page);
    await switchOrganization(page, base, SECOND);
    expect(
      (await deleteDocument(page, base, "pages", pasteTarget)).status(),
    ).toBe(200);
  }
  expect(
    (
      await page.request.get(
        `${base}/web-studio/api/pages/${pasteTarget}?draft=true`,
      )
    ).status(),
  ).toBe(404);
});

async function storedIn(tab: Page) {
  return tab.evaluate((key) => localStorage.getItem(key), CLIPBOARD);
}

const signInPage = (url: URL) => url.pathname === "/login";

test("@cms what one person copied is gone at a sign-out in Mission Control that never reaches the sign-in page, and when the next person arrives through the sign-in callback or the reset path and opens a page (WP6 rest, pull request 2, fix round F1)", async ({
  page,
}) => {
  const copyInDemo = async () => {
    await signIn(page);
    await enter(page, DEMO);
    await page.goto(
      `${base}/web-studio/collections/pages/${await draftPreviewPage(page)}`,
    );
    await openLayoutClipboard(page);
    await page.getByRole("menuitem", { name: "Copy Field" }).click();
    await expect.poll(() => clipboardOf(page)).not.toBeNull();
  };

  await copyInDemo();
  const watcher = await page.context().newPage();
  try {
    await watcher.goto(`${base}/icon.svg`);
    expect(await storedIn(watcher)).not.toBeNull();
    await page.goto(`${base}/${DEMO}`);
    await page.route(signInPage, (route) => route.abort());
    await page.getByRole("button", { name: "Open profile menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect.poll(() => storedIn(watcher)).toBeNull();
  } finally {
    await page.unroute(signInPage);
    await watcher.close();
  }

  for (const arrival of ["/auth/callback", "/forgot-password/callback"]) {
    await copyInDemo();
    await page.context().clearCookies();
    const answer = await page.request.get(
      `${base}${arrival}?code=e2e-not-a-code`,
      { maxRedirects: 0, headers: NO_IDLE_CONNECTION },
    );
    expect(answer.status()).toBe(307);
    const leftByArrival = await page.context().cookies(base);
    await signInAs(page, "admin", "demoAdmin", base);
    await page.context().addCookies(leftByArrival);
    await page.goto(`${base}/web-studio/collections/pages`);
    await page.goto(
      `${base}/web-studio/collections/pages/${await draftPreviewPage(page)}`,
    );
    await openLayoutClipboard(page);
    await expect(
      page.getByRole("menuitem", { name: "Paste Field" }),
    ).toBeDisabled();
    expect(await clipboardOf(page)).toBeNull();
    await page.keyboard.press("Escape");
  }
});

const isAuthService = (url: URL) => url.pathname.startsWith("/auth/v1/");
const isDataService = (url: URL) => url.pathname.startsWith("/rest/v1/");
const isAdminServer = (url: URL) => url.origin === new URL(base).origin;

function passwordSession(userId: string) {
  const now = Math.floor(Date.now() / 1000);
  const claims = Buffer.from(
    JSON.stringify({ sub: userId, exp: now + 3600, role: "authenticated" }),
  ).toString("base64url");
  return {
    access_token: `e30.${claims}.e2e`,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: now + 3600,
    refresh_token: "e2e-refresh-token",
    user: {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email: `${userId}@example.test`,
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {},
      created_at: "2026-11-27T00:00:00.000Z",
    },
  };
}

async function copyLayoutIn(tab: Page) {
  await tab.goto(
    `${base}/web-studio/collections/pages/${await draftPreviewPage(tab)}`,
  );
  await openLayoutClipboard(tab);
  await tab.getByRole("menuitem", { name: "Copy Field" }).click();
  await expect.poll(() => storedIn(tab)).not.toBeNull();
}

test("@cms what was copied after the sign-in page opened is gone once the next person signs in there with a password, and that person has nothing to paste (WP6 rest, pull request 2, round 2, G1)", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, SECOND);
  const stale = await page.context().newPage();
  await stale.goto(
    `${base}/web-studio/collections/pages/${await draftPreviewPage(stale)}`,
  );
  await page.goto(`${base}/${SECOND}`);
  await page.getByRole("button", { name: "Open profile menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await page.waitForURL((url) => url.pathname === "/login");
  await expect.poll(() => clipboardOf(page)).toBeNull();

  await openLayoutClipboard(stale);
  await stale.getByRole("menuitem", { name: "Copy Field" }).click();
  await expect.poll(() => storedIn(stale)).not.toBeNull();
  await stale.close();

  const next = fixturePerson("demoAdmin");
  const watcher = await page.context().newPage();
  try {
    await watcher.goto(`${base}/icon.svg`);
    await page.route(isAuthService, (route) =>
      new URL(route.request().url()).pathname === "/auth/v1/token"
        ? route.fulfill({ json: passwordSession(next.userId) })
        : route.abort(),
    );
    await page.route(isDataService, (route) => route.abort());
    await page.route(isAdminServer, (route) => route.abort());
    await page.getByLabel("Email").fill(`${next.userId}@example.test`);
    await page.getByLabel("Password").fill("e2e-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect.poll(() => storedIn(watcher)).toBeNull();
  } finally {
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await watcher.close();
  }

  await signInAs(page, "admin", "demoAdmin", base);
  await page.goto(
    `${base}/web-studio/collections/pages/${await draftPreviewPage(page)}`,
  );
  await openLayoutClipboard(page);
  await expect(
    page.getByRole("menuitem", { name: "Paste Field" }),
  ).toBeDisabled();
});

test("@cms what was copied after the organization chooser opened is gone once an organization is chosen there (WP6 rest, pull request 2, round 2, G1)", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  await page.goto(
    `${base}/web-studio/organization?next=${encodeURIComponent("/web-studio")}`,
  );
  await expect.poll(() => clipboardOf(page)).toBeNull();

  const stale = await page.context().newPage();
  await copyLayoutIn(stale);
  await stale.close();

  await chooseOrganization(page, SECOND);
  await page.waitForURL((url) => url.pathname === "/web-studio");
  await expect.poll(() => clipboardOf(page)).toBeNull();
  await page.goto(
    `${base}/web-studio/collections/pages/${await draftPreviewPage(page)}`,
  );
  await openLayoutClipboard(page);
  await expect(
    page.getByRole("menuitem", { name: "Paste Field" }),
  ).toBeDisabled();
});

test("@cms the upload dialog fits a short viewport and 200% zoom: each field and button is reached inside it, none cut off (WP6 rest, pull request 2, round 2, G4)", async ({
  page,
}) => {
  await signIn(page);
  await enter(page, DEMO);
  await page.goto(`${base}/web-studio/collections/media`);
  await page.getByRole("button", { name: "Upload image" }).click();
  const dialog = page.getByRole("dialog", { name: "Upload image" });
  await expect(dialog).toBeVisible();
  for (const size of [
    { width: 1280, height: 360 },
    { width: 640, height: 360 },
  ]) {
    await page.setViewportSize(size);
    for (const control of [
      dialog.getByLabel("Image file"),
      dialog.getByLabel("Alt text"),
      dialog.getByLabel("Credit"),
      dialog.getByLabel("Folder"),
      dialog.getByRole("button", { name: "Cancel" }),
      dialog.getByRole("button", { name: "Upload", exact: true }),
    ]) {
      await control.scrollIntoViewIfNeeded();
      await expect(control).toBeInViewport({ ratio: 1 });
    }
  }
});
