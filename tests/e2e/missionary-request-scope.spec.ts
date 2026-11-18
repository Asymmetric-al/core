import { expect as baseExpect, test } from "@playwright/test";

import {
  documentScope,
  fixturePerson,
  signInAs,
  TENANTS,
  tenantPath,
} from "./helpers/tenant-address";

/**
 * The tenant and the assignment on every request a workspace page makes
 * (plan 5.2; WP2b, AL-2675). Runs in the missionary surface project
 * (`-c playwright.missionary.config.ts`). The workspace renders with a
 * document scope, and its calls to its own API carry that scope.
 */
const { demo: DEMO, second: SECOND } = TENANTS;
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

test("a missionary in two organizations calls the workspace's own API in each, under that page's scope", async ({
  page,
}) => {
  const rows = fixturePerson("twoTenantMissionary").memberships;
  await signInAs(page, "missionary", "twoTenantMissionary", baseURL());

  for (const row of rows) {
    const call = page.waitForRequest(
      (request) => new URL(request.url()).pathname === "/api/missionary/portal",
    );
    await page.goto(tenantPath(row.tenantId, "/"));
    // The workspace renders inside a document scope: a page that lost it
    // would fail here as well as in its calls.
    expect(await documentScope(page)).toEqual({
      prefix: `/${row.tenantId}`,
      assignment: row.id,
    });
    const headers = (await call).headers();
    expect(headers["x-asym-tenant"]).toBe(row.tenantId);
    expect(headers["x-asym-assignment"]).toBe(row.id);
  }
  expect(rows.map((row) => row.tenantId)).toEqual([DEMO, SECOND]);
});
