import { expect, test, type Page } from "@playwright/test";

import {
  bumpGeneration,
  claimsOf,
  documentScope,
  dropHome,
  LOCATION,
  locationsOf,
  moveNameToB,
  P_EMAIL,
  P_ID,
  Q_EMAIL,
  proofReady,
  recordOwnApi,
  recordReloadNotices,
  reloadNoticesSeen,
  restoreName,
  restoreRow,
  revokeRow,
  saveName,
  sendAs,
  signIn,
  sql,
  staffRow,
  TA,
  TB,
  type OwnApiCall,
} from "./helpers/n2-on";
import { judgeStaleCalls } from "./helpers/n2-on-judge";

test.skip(!proofReady(), "run through `bun run test:e2e:n2-on`");

type Role = "development" | "finance";

interface Tab {
  page: Page;
  calls: OwnApiCall[];
  claims: Record<string, string>;
}

async function openTabs(page: Page): Promise<Record<Role, Tab>> {
  await recordReloadNotices(page.context());
  await signIn(page, P_EMAIL);
  const tabs = {} as Record<Role, Tab>;
  for (const role of ["development", "finance"] as const) {
    const tab = role === "development" ? page : await page.context().newPage();
    const calls = recordOwnApi(tab);
    const read = tab.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/admin/api/admin/contributions",
    );
    await tab.goto(`/admin/~${role}/contributions`);
    expect((await read).status()).toBe(200);
    expect((await documentScope(tab)).prefix).toBe(`/~${role}`);
    tabs[role] = { page: tab, calls, claims: claimsOf(calls[0]!) };
  }
  return tabs;
}

async function readAndWrite(tab: Tab) {
  const before = locationsOf(TA);
  const read = await sendAs(
    tab.page,
    "/admin/api/admin/contributions",
    tab.claims,
  );
  const write = await sendAs(
    tab.page,
    "/admin/api/admin/locations",
    tab.claims,
    {
      method: "POST",
      body: LOCATION,
    },
  );
  return { read, write, written: locationsOf(TA) - before };
}

async function softNavigateToWorkers(tab: Tab, role: Role) {
  await tab.page.locator(`a[href="/admin/~${role}/workers"]`).first().click();
}

test.afterEach(() => {
  sql(`DELETE FROM public.locations WHERE title = '${LOCATION.title}'`);
});

test("a tab left open after the name's generation moved cannot read or write, shows the reload notice and, reloaded, is served at the new generation", async ({
  page,
}) => {
  const tabs = await openTabs(page);
  const saved = saveName();
  const marks = {
    development: tabs.development.calls.length,
    finance: tabs.finance.calls.length,
  };
  try {
    const moved = String(bumpGeneration());
    for (const role of ["development", "finance"] as const) {
      const tab = tabs[role];
      const { read, write, written } = await readAndWrite(tab);
      expect(read, role).toMatchObject({
        status: 401,
        refused: "generation_mismatch",
      });
      expect(write, role).toMatchObject({
        status: 401,
        refused: "generation_mismatch",
      });
      expect(written, role).toBe(0);

      const reloaded = tab.page.waitForEvent("load");
      await softNavigateToWorkers(tab, role);
      await reloaded;
      await expect
        .poll(() =>
          tab.calls.some(
            (call) =>
              call.headers["x-asym-scope-generation"] === moved &&
              call.status === 200,
          ),
        )
        .toBe(true);
      expect(await reloadNoticesSeen(tab.page), role).toBeGreaterThanOrEqual(1);
      const appCalls = () =>
        tab.calls
          .slice(marks[role])
          .filter((call) => call.headers["x-n2-on-proof"] === undefined);
      await expect
        .poll(() => judgeStaleCalls(appCalls(), moved).pending.length, {
          message: `${role}: a stale call is still pending`,
        })
        .toBe(0);
      const judged = judgeStaleCalls(appCalls(), moved);
      expect(
        judged.transportErrors.map((call) => [call.url, call.failure]),
        `${role}: a stale call failed in transport`,
      ).toEqual([]);
      expect(
        judged.served.map((call) => [call.url, call.status]),
        role,
      ).toEqual([]);
      expect(
        judged.refused,
        `${role}: ${JSON.stringify(judged)}`,
      ).toBeGreaterThanOrEqual(1);
      expect((await documentScope(tab.page)).prefix).toBe(`/~${role}`);
    }
  } finally {
    restoreName(saved);
  }
});

test("a moved name refuses A's old document; a fresh navigation redirects a one-row member to B's bare address (D-18, the one-row redirect replaces the old 404)", async ({
  page,
  browser,
}) => {
  const tabs = await openTabs(page);
  const tab = tabs.development;
  const rowInB = sql(
    `SELECT id FROM authz.memberships WHERE user_id = '${P_ID}' AND tenant_id = '${TB}' AND role = 'staff' AND is_active`,
  );
  expect(rowInB).toMatch(/^[0-9a-f-]{36}$/);
  const visitor = await browser.newContext({
    baseURL: process.env.N2_ON_BASE_URL,
  });
  const q = await visitor.newPage();
  const saved = saveName();
  try {
    await signIn(q, Q_EMAIL);
    await tab.page.evaluate((otherRow) => {
      const selector = `[data-tenant-assignment="${otherRow}"]`;
      const observer = new MutationObserver((changes) => {
        for (const change of changes) {
          if (
            document.querySelector(selector) ||
            [...change.addedNodes].some(
              (node) =>
                node instanceof Element &&
                (node.matches(selector) || node.querySelector(selector)),
            )
          ) {
            sessionStorage.setItem(
              "n2-on:old-document-rendered-another-row",
              "yes",
            );
          }
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
      });
      window.addEventListener(
        "pagehide",
        () => sessionStorage.setItem("n2-on:replaced-document", "yes"),
        { once: true },
      );
    }, rowInB);
    moveNameToB();
    const { read, write, written } = await readAndWrite(tab);
    expect(read.status).toBe(401);
    expect(read.refused).not.toBeNull();
    expect(write.status).toBe(401);
    expect(write.refused).not.toBeNull();
    expect(written).toBe(0);

    const oldAddress = "/admin/~development/workers";
    const redirected = tab.page.waitForResponse(
      (answer) =>
        answer.request().isNavigationRequest() &&
        answer.status() === 307 &&
        new URL(answer.url()).pathname === oldAddress,
    );
    await softNavigateToWorkers(tab, "development");
    const answer = await redirected;
    expect(answer.headers()["cache-control"]).toContain("no-store");
    expect(new URL(answer.headers().location!, answer.url()).pathname).toBe(
      "/admin/workers",
    );
    await expect(tab.page).toHaveURL(/\/admin\/workers$/);
    expect(await documentScope(tab.page)).toEqual({
      prefix: "",
      assignment: rowInB,
    });
    expect(
      await tab.page.evaluate(() => [
        sessionStorage.getItem("n2-on:replaced-document"),
        sessionStorage.getItem("n2-on:old-document-rendered-another-row"),
      ]),
    ).toEqual(["yes", null]);

    const front = new URL(process.env.N2_ON_BASE_URL!);
    const cookie = (await visitor.cookies(front.href))
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");
    const rscRefusal = await q.request.get(
      `http://localhost:${front.port}${oldAddress}`,
      { maxRedirects: 0, headers: { host: front.host, cookie, rsc: "1" } },
    );
    expect(rscRefusal.status()).toBe(307);
    expect(new URL(rscRefusal.headers().location!, front).pathname).toBe(
      "/admin/no-access",
    );
    expect(await rscRefusal.text()).not.toContain(rowInB);

    const denied = q.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === oldAddress &&
        response.request().isNavigationRequest(),
    );
    await q.goto(oldAddress);
    await expect(q).toHaveURL(/\/admin\/no-access$/);
    await expect(q.locator("[data-tenant-scope]")).toHaveCount(0);
    const refusal = await denied;
    expect(refusal.status()).toBe(307);
    expect(new URL(refusal.headers().location!, refusal.url()).pathname).toBe(
      "/admin/no-access",
    );
  } finally {
    restoreName(saved);
    await visitor.close();
  }
});

test("a revoked finance row is refused in its tab while the development tab is still served", async ({
  page,
}) => {
  const tabs = await openTabs(page);
  const finance = staffRow(TA, "finance");
  try {
    revokeRow(finance);
    expect(
      await sendAs(
        tabs.finance.page,
        "/admin/api/admin/contributions",
        tabs.finance.claims,
      ),
    ).toMatchObject({ status: 401, refused: "not_owned_or_inactive" });
    expect(
      await sendAs(
        tabs.development.page,
        "/admin/api/admin/contributions",
        tabs.development.claims,
      ),
    ).toMatchObject({ status: 200, refused: null });
  } finally {
    restoreRow(finance);
  }
});

test("a tab left open after the name stopped being home gets 404 no-store on its next request", async ({
  page,
}) => {
  const tabs = await openTabs(page);
  const saved = saveName();
  try {
    dropHome();
    const read = await sendAs(
      tabs.development.page,
      "/admin/api/admin/contributions",
      tabs.development.claims,
    );
    expect(read.status).toBe(404);
    expect(read.cacheControl).toBe("no-store");
    const reload = await tabs.development.page.reload();
    expect(reload?.status()).toBe(404);
    expect(reload?.headers()["cache-control"]).toBe("no-store");
  } finally {
    restoreName(saved);
  }
});
