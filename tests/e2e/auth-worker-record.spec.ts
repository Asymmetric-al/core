import { randomUUID } from "node:crypto";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  readAuthMailEnv,
  waitForHydratedForm,
  warmUpRoutes,
} from "./helpers/auth-mail";
import {
  createPerson,
  deletePerson,
  DEMO,
  documentScopeHeaders,
  nextRead,
  SECOND,
  SEEDED,
  SEEDED_PASSWORD,
  signIn,
  withOwner,
  type Person,
} from "./helpers/request-scope-reads";

const env = readAuthMailEnv();
const runTag = randomUUID().slice(0, 6);
const partyId = randomUUID();
const workerId = randomUUID();
const workerName = `Worker Wren ${runTag}`;
const legalName = `Legal Placeholder ${runTag}`;
const alias = `Alias ${runTag}`;
const NOT_PERMITTED =
  "Only staff with the Restrict publication permission can change these settings.";
const PAGE_CONTENT = ':has(> [data-slot="page-shell-header"])';
let careStaff: Person | null = null;

async function expectAccessible(page: Page, scope?: string) {
  const builder = new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
  ]);
  const results = await (scope ? builder.include(scope) : builder).analyze();
  const serious = results.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious",
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}

async function unreviewedCount(page: Page) {
  const read = await nextRead(
    page,
    /^\/api\/admin\/workers\/unreviewed-count$/,
    () => page.goto(`/${DEMO}`),
  );
  expect(read.status).toBe(200);
  const { count } = read.json as { count: number };
  expect(Number.isInteger(count) && count >= 0).toBe(true);
  if (count === 0) {
    await expect(page.getByText(/^Security level unreviewed:/)).toHaveCount(0);
    await expect(
      page.getByText("Couldn't check workers' security levels."),
    ).toHaveCount(0);
  } else {
    await expect(
      page.getByRole("link", {
        name: /^Security level unreviewed: \d+ workers?$/,
      }),
    ).toHaveText(
      `Security level unreviewed: ${count === 1 ? "1 worker" : `${count} workers`}`,
    );
  }
  return count;
}

async function openRecord(page: Page) {
  await page.goto(`/${DEMO}/workers/${workerId}`);
  await expect(
    page.getByRole("heading", { level: 1, name: workerName }),
  ).toBeVisible();
  await waitForHydratedForm(page);
}

function sameOrigin(page: Page) {
  return { origin: new URL(page.url()).origin };
}

async function submitDialog(page: Page, action: string, submit: string) {
  const dialog = page.getByRole("dialog");
  const [reply] = await Promise.all([
    page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname ===
          `/api/admin/workers/${workerId}/${action}` &&
        response.request().method() === "POST",
    ),
    dialog.getByRole("button", { name: submit }).click(),
  ]);
  return reply;
}

test.describe("AL-2678 WP5 part 2-r2b1: the worker's record in Mission Control on real sessions", () => {
  test.beforeAll(async () => {
    test.skip(
      test.info().project.name !== "auth-mail-admin",
      "Real local admin sessions only.",
    );
    if (!env?.dbUrl)
      throw new Error("The worker journeys need the local stack's database");
    await withOwner(env, async (db) => {
      await db.query(
        "insert into public.parties (id, tenant_id, display_name) values ($1, $2, $3)",
        [partyId, DEMO, workerName],
      );
      await db.query(
        `insert into public.missionaries (id, tenant_id, profile_id, legal_entity_id, party_id)
         select $1, tenant_id, null, id, $2 from public.legal_entities where tenant_id = $3 limit 1`,
        [workerId, partyId, DEMO],
      );
      await db.query(
        "insert into private.party_restricted (party_id, tenant_id, legal_name, real_country, precise_location) values ($1, $2, $3, 'Placeholder Country', 'Placeholder Place')",
        [partyId, DEMO, legalName],
      );
    });
    careStaff = await createPerson(env, `wr-care-${runTag}`, [
      { role: "staff", tenantId: DEMO, staffRole: "member_care", admin: false },
    ]);
    await warmUpRoutes(test.info().project.use.baseURL!, [
      "/login",
      `/${DEMO}`,
      `/${DEMO}/workers`,
      `/${DEMO}/workers/${workerId}`,
      `/${SECOND}/workers`,
      "/api/admin/workers",
      "/api/admin/workers/unreviewed-count",
    ]);
  });

  test.afterAll(async () => {
    if (!env?.dbUrl) return;
    try {
      await withOwner(env, async (db) => {
        await db.query(
          "delete from public.audit_logs where resource_type = 'party' and resource_id = $1",
          [partyId],
        );
        await db.query(
          "delete from private.party_restricted where party_id = $1",
          [partyId],
        );
        await db.query("delete from public.missionaries where id = $1", [
          workerId,
        ]);
        await db.query("delete from public.parties where id = $1", [partyId]);
      });
    } finally {
      await deletePerson(env, careStaff);
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  test("W1, W2: the demo owner confirms, restricts, reveals and lifts a worker, the Home count following, with no serious axe finding on either page or any dialog", async ({
    page,
  }) => {
    await signIn(page, SEEDED.owner.email, SEEDED_PASSWORD);
    const before = await unreviewedCount(page);
    expect(before).toBeGreaterThan(0);

    await page.goto(`/${DEMO}/workers?review=unreviewed`);
    const row = page.getByRole("row").filter({ hasText: workerName });
    await expect(row.getByText("Security level unreviewed")).toBeVisible();
    await expectAccessible(page, PAGE_CONTENT);
    await row.getByRole("link", { name: workerName }).click();
    await expect(page).toHaveURL(new RegExp(`/${DEMO}/workers/${workerId}$`));
    await expect(
      page.getByRole("heading", { level: 1, name: workerName }),
    ).toBeVisible();
    await expect(page.getByText("Recorded, hidden")).toBeVisible();
    await expectAccessible(page, PAGE_CONTENT);

    await page
      .getByRole("button", { name: `Confirm level for ${workerName}` })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectAccessible(page, '[role="dialog"]');
    await page.getByRole("dialog").getByLabel("Reason").fill("Reviewed");
    expect(
      (await submitDialog(page, "confirm", "Confirm level")).status(),
    ).toBe(200);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByText("Security level unreviewed").filter({ visible: true }),
    ).toHaveCount(0);
    expect(await unreviewedCount(page)).toBe(before - 1);

    await openRecord(page);
    await page.getByRole("button", { name: `Restrict ${workerName}` }).click();
    const restrict = page.getByRole("dialog");
    await expect(restrict.getByText("What it does not change.")).toBeVisible();
    await expectAccessible(page, '[role="dialog"]');
    await restrict.getByRole("radio", { name: "Restricted" }).check();
    await restrict.getByLabel("Public alias").fill(alias);
    await restrict.getByLabel("Reason").fill("Field security");
    expect((await submitDialog(page, "restrict", "Restrict")).status()).toBe(
      200,
    );
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText(`Public alias: ${alias}`)).toBeVisible();

    await page
      .getByRole("button", { name: `Show legal name for ${workerName}` })
      .click();
    await expectAccessible(page, '[role="dialog"]');
    await page.getByRole("dialog").getByLabel("Reason").fill("Visa paperwork");
    expect(
      (await submitDialog(page, "reveal", "Show legal name")).status(),
    ).toBe(200);
    const shown = page.getByRole("dialog").getByText(legalName);
    await expect(shown).toBeVisible();
    await expect(
      page.locator("[data-sentry-block]").getByText(legalName),
    ).toBeVisible();
    await expectAccessible(page, '[role="dialog"]');
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Hide" })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText(legalName)).toHaveCount(0);

    await page
      .getByRole("button", { name: `Lift restriction for ${workerName}` })
      .click();
    await expectAccessible(page, '[role="dialog"]');
    const lift = page.getByRole("dialog");
    await lift.getByRole("radio", { name: "Standard" }).check();
    await lift.getByLabel("Reason").fill("Back home");
    expect(
      (await submitDialog(page, "lift", "Lift restriction")).status(),
    ).toBe(200);
    await expect(page.getByRole("dialog")).toHaveCount(0);

    const audit = await withOwner(env!, (db) =>
      db.query(
        "select action, details from public.audit_logs where resource_type = 'party' and resource_id = $1 order by created_at",
        [partyId],
      ),
    );
    expect(audit.rows.map((r) => r.action)).toEqual([
      "worker_publication_restricted",
      "worker_publication_restricted",
      "worker_identity_revealed",
      "worker_restriction_lifted",
    ]);
    expect(JSON.stringify(audit.rows)).not.toContain(legalName);
  });

  test("W3: the record works by keyboard alone, and a dialog closed with Escape returns focus to its opener", async ({
    page,
  }) => {
    await signIn(page, SEEDED.owner.email, SEEDED_PASSWORD);
    await openRecord(page);
    const opener = page.getByRole("button", {
      name: `Restrict ${workerName}`,
    });
    for (let step = 0; step < 80; step += 1) {
      if (
        await opener.evaluate((element) => element === document.activeElement)
      )
        break;
      await page.keyboard.press("Tab");
    }
    await expect(opener).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(opener).toBeFocused();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const reason = dialog.getByLabel("Reason");
    for (let step = 0; step < 40; step += 1) {
      if (
        await reason.evaluate((element) => element === document.activeElement)
      )
        break;
      await page.keyboard.press("Tab");
    }
    await expect(reason).toBeFocused();
    await page.keyboard.type("Keyboard only");
    const submit = dialog.getByRole("button", { name: "Restrict" });
    for (let step = 0; step < 40; step += 1) {
      if (
        await submit.evaluate((element) => element === document.activeElement)
      )
        break;
      await page.keyboard.press("Tab");
    }
    await expect(submit).toBeFocused();
    const [reply] = await Promise.all([
      page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname ===
            `/api/admin/workers/${workerId}/restrict` &&
          response.request().method() === "POST",
      ),
      page.keyboard.press("Enter"),
    ]);
    expect(reply.status()).toBe(400);
    await expect(dialog.getByRole("alert")).toHaveText(
      "Choose what to change.",
    );
  });

  test("W4: member-care staff read the record without a control or the Legal name row, and a same-origin POST is refused 403", async ({
    page,
  }) => {
    await signIn(page, careStaff!.email, careStaff!.password);
    await page.goto(`/${DEMO}/workers`);
    await expect(
      page.getByRole("row").filter({ hasText: workerName }),
    ).toBeVisible();
    await openRecord(page);
    await expect(page.getByText(NOT_PERMITTED)).toBeVisible();
    await expect(page.getByText("Legal name")).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: /Restrict|Lift|Confirm|Show legal name/,
      }),
    ).toHaveCount(0);
    const headers = await documentScopeHeaders(page);
    const refused = await page.request.post(
      `/api/admin/workers/${workerId}/reveal`,
      {
        headers: { ...headers, ...sameOrigin(page) },
        data: { reason: "Curious" },
      },
    );
    expect(refused.status()).toBe(403);
    expect(await refused.json()).toMatchObject({
      error: NOT_PERMITTED,
      code: "NOT_PERMITTED",
    });
    expect(refused.headers()["cache-control"]).toBe("no-store");
  });

  test("W5: Harbor Light's administrator sees only Harbor Light's workers, and Give Hope's worker answers 404", async ({
    page,
  }) => {
    await signIn(page, SEEDED.morgan.email, SEEDED_PASSWORD);
    await page.goto(`/${SECOND}/workers`);
    const table = page.getByRole("table", { name: "Workers" });
    await expect(table.getByRole("link", { name: "Sam Ortiz" })).toBeVisible();
    await expect(table.getByText(workerName)).toHaveCount(0);
    await expect(table.getByText("Jordan Hale")).toHaveCount(0);
    const headers = await documentScopeHeaders(page);
    const record = await page.request.get(`/api/admin/workers/${workerId}`, {
      headers,
    });
    expect(record.status()).toBe(404);
    const reveal = await page.request.post(
      `/api/admin/workers/${workerId}/reveal`,
      { headers: { ...headers, ...sameOrigin(page) }, data: { reason: "x" } },
    );
    expect(reveal.status()).toBe(404);
    await page.goto(`/${SECOND}/workers/${workerId}`);
    await expect(
      page.getByRole("alert").filter({ hasText: "Worker not found." }),
    ).toBeVisible();
  });
});
