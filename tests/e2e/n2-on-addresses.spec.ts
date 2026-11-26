import { expect, test, type Page } from "@playwright/test";

import {
  addressCarriesNoScope,
  claimsOf,
  documentScope,
  generation,
  LOCATION,
  locationsOf,
  P_EMAIL,
  proofReady,
  Q_EMAIL,
  recordOwnApi,
  sendAs,
  signIn,
  sql,
  staffRow,
  TA,
} from "./helpers/n2-on";

test.skip(!proofReady(), "run through `bun run test:e2e:n2-on`");

function watchAddresses(page: Page): string[] {
  const seen: string[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) seen.push(frame.url());
  });
  page.on("request", (request) => {
    if (request.isNavigationRequest()) seen.push(request.url());
  });
  page.on("response", (response) => {
    const location = response.headers()["location"];
    if (location) seen.push(new URL(location, response.url()).href);
  });
  return seen;
}

test.afterAll(() => {
  sql(`DELETE FROM public.locations WHERE title = '${LOCATION.title}'`);
});

test("Q works through five pages and a reload with no organization ID and no ~ in any address", async ({
  page,
}) => {
  const seen = watchAddresses(page);
  await signIn(page, Q_EMAIL);
  await expect(page).toHaveURL(/\/admin$/);
  const calls = recordOwnApi(page);
  const qRow = sql(
    `SELECT id FROM authz.memberships WHERE user_id = '55555555-5555-5555-5555-555555555555' AND tenant_id = '${TA}' AND role = 'staff'`,
  );
  await expect.poll(async () => (await documentScope(page)).prefix).toBe("");

  const pages = [
    "Workers",
    "Tasks",
    "Browse CRM",
    "View notes",
    "View care directory",
  ];
  for (const name of pages) {
    await page.getByRole("link", { name, exact: true }).first().click();
    await expect
      .poll(() => new URL(page.url()).pathname, { message: name })
      .not.toBe("/admin");
    await expect.poll(async () => (await documentScope(page)).prefix).toBe("");
    await page.getByRole("link", { name: "Home", exact: true }).first().click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/admin");
  }
  await page.reload();
  await expect
    .poll(async () => (await documentScope(page)).assignment)
    .toBe(qRow);

  expect(
    new Set(seen.map((address) => new URL(address).pathname)).size,
  ).toBeGreaterThanOrEqual(6);
  expect(seen.filter((address) => !addressCarriesNoScope(address))).toEqual([]);
  expect(calls.length).toBeGreaterThan(0);
  for (const call of calls) {
    expect(call.headers["x-asym-assignment"], call.url).toBe(qRow);
    expect(call.headers["x-asym-scope-generation"], call.url).toBe(
      String(generation()),
    );
  }
});

test("P works under /~development and /~finance in two tabs, each reading and writing as its own row", async ({
  page,
  context,
}) => {
  await signIn(page, P_EMAIL);
  await expect(page).toHaveURL(/\/admin\/choose-organization\?next=%2F$/);
  await expect
    .poll(() =>
      page
        .getByRole("link")
        .evaluateAll((anchors) =>
          anchors.map((anchor) => anchor.getAttribute("href")),
        ),
    )
    .toEqual(["/admin/~finance", "/admin/~development"]);

  const tabs = {
    development: page,
    finance: await context.newPage(),
  } as const;
  const rows = {
    development: staffRow(TA, "development"),
    finance: staffRow(TA, "finance"),
  };
  const current = String(generation());
  const before = locationsOf(TA);

  for (const role of ["development", "finance"] as const) {
    const tab = tabs[role];
    const calls = recordOwnApi(tab);
    const read = tab.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/admin/api/admin/contributions",
    );
    await tab.goto(`/admin/~${role}/contributions`);
    expect((await read).status()).toBe(200);
    expect(await documentScope(tab)).toEqual({
      prefix: `/~${role}`,
      assignment: rows[role],
    });
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      expect(call.headers["x-asym-tenant"], call.url).toBe(TA);
      expect(call.headers["x-asym-assignment"], call.url).toBe(rows[role]);
      expect(call.headers["x-asym-scope-generation"], call.url).toBe(current);
    }
    const written = await sendAs(
      tab,
      "/admin/api/admin/locations",
      claimsOf(calls[0]!),
      { method: "POST", body: LOCATION },
    );
    expect(written.status, role).toBeLessThan(300);
  }

  expect(locationsOf(TA)).toBe(before + 2);
  expect(rows.development).not.toBe(rows.finance);
});
