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
      const appCalls = tab.calls
        .slice(marks[role])
        .filter((call) => call.headers["x-n2-on-proof"] === undefined);
      const stale = appCalls.filter(
        (call) => call.headers["x-asym-scope-generation"] !== moved,
      );
      expect(
        stale.filter((call) => call.status !== 401),
        role,
      ).toEqual([]);
      expect(
        stale.some(
          (call) =>
            call.status === 401 && call.refused === "generation_mismatch",
        ),
        `${role}: ${JSON.stringify(stale.map((call) => [call.url, call.status, call.refused]))}`,
      ).toBe(true);
      expect((await documentScope(tab.page)).prefix).toBe(`/~${role}`);
    }
  } finally {
    restoreName(saved);
  }
});

test("a tab left open after the name moved to another organization cannot read or write and never renders that organization's page", async ({
  page,
}) => {
  const tabs = await openTabs(page);
  const tab = tabs.development;
  const rowInB = sql(
    `SELECT coalesce(string_agg(id::text, ','), '') FROM authz.memberships WHERE user_id = '11111111-1111-1111-1111-111111111111' AND tenant_id = '${TB}'`,
  ).split(",");
  const saved = saveName();
  try {
    moveNameToB();
    const { read, write, written } = await readAndWrite(tab);
    expect(read.status).toBe(401);
    expect(read.refused).not.toBeNull();
    expect(write.status).toBe(401);
    expect(write.refused).not.toBeNull();
    expect(written).toBe(0);

    const answers: number[] = [];
    tab.page.on("response", (response) => {
      if (response.request().isNavigationRequest())
        answers.push(response.status());
    });
    await softNavigateToWorkers(tab, "development");
    await expect.poll(() => answers.length).toBeGreaterThan(0);
    expect(answers.at(-1)).toBe(404);
    await expect(tab.page.locator("[data-tenant-scope]")).toHaveCount(0);
    for (const call of tab.calls) {
      expect(rowInB).not.toContain(call.headers["x-asym-assignment"]);
    }
  } finally {
    restoreName(saved);
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
