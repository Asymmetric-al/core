import { randomUUID } from "node:crypto";

import { expect, test, type Page, type Route } from "@playwright/test";

import { readAuthMailEnv, warmUpRoutes } from "./helpers/auth-mail";
import {
  createPerson,
  DEMO,
  deletePerson,
  nextRead,
  signIn,
  withOwner,
  type Person,
} from "./helpers/request-scope-reads";

const env = readAuthMailEnv();
const tag = randomUUID().slice(0, 6);
const workerParty = randomUUID();
const PARTNERS = /^\/api\/missionary\/donors$/;
const first = {
  name: `Lost Answer Partner ${tag}`,
  phone: "",
  location: "Kampala",
};
const second = {
  name: `Second Partner ${tag}`,
  phone: "555 0100",
  location: "Nairobi",
};
let worker: Person | null = null;

function onMissionaryProject() {
  return test.info().project.name === "auth-mail-missionary";
}

async function stored() {
  return withOwner(env!, async (db) => {
    const donors = await db.query<{
      id: string;
      name: string;
      email: string | null;
    }>(
      "select id::text, name, email from public.donors where tenant_id = $1 and missionary_id = $2 order by name",
      [DEMO, worker!.userId],
    );
    const logs = await db.query<{ n: number }>(
      "select count(*)::int n from public.crm_command_logs where tenant_id = $1 and actor_user_id = $2 and action = 'missionary.partner.create'",
      [DEMO, worker!.userId],
    );
    return { donors: donors.rows, logs: logs.rows[0]!.n };
  });
}

async function fill(page: Page, partner: typeof first) {
  const dialog = page.getByRole("dialog", { name: "Add partner" });
  await expect(dialog).toBeVisible({ timeout: 120_000 });
  await expect(dialog.getByLabel("Email")).toHaveCount(0);
  await dialog.getByLabel("Name").fill(partner.name);
  if (partner.phone) await dialog.getByLabel("Phone").fill(partner.phone);
  await dialog.getByLabel("Location").fill(partner.location);
  return dialog;
}

function partnerPosts(page: Page) {
  return page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/missionary/donors" &&
      response.request().method() === "POST",
    { timeout: 120_000 },
  );
}

test.beforeAll(async () => {
  const { project } = test.info();
  if (!env?.dbUrl || !onMissionaryProject() || !project.use.baseURL) return;
  worker = await createPerson(env, "partners", [
    { role: "missionary", tenantId: DEMO },
  ]);
  await withOwner(env, async (db) => {
    await db.query(
      `with party as (insert into public.parties (id, tenant_id, display_name) values ($1, $2, $4) returning id)
       insert into public.missionaries (tenant_id, profile_id, location, legal_entity_id, party_id)
       select tenant_id, $3, 'Field', id, (select id from party) from public.legal_entities where tenant_id = $2`,
      [workerParty, DEMO, worker!.userId, `Partner Worker ${tag}`],
    );
    await db.query(
      "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'profile_backfill')",
      [DEMO, worker!.userId, workerParty],
    );
  });
  await warmUpRoutes(project.use.baseURL, [
    "/login",
    `/${DEMO}`,
    `/${DEMO}/donors`,
    "/api/missionary/donors",
  ]);
});

test.afterAll(async () => {
  if (!env?.dbUrl || !worker) return;
  await withOwner(env, async (db) => {
    const donors = await db.query<{ party_id: string | null }>(
      "delete from public.donors where tenant_id = $1 and missionary_id = $2 returning party_id",
      [DEMO, worker!.userId],
    );
    await db.query(
      "delete from public.crm_command_logs where tenant_id = $1 and actor_user_id = $2",
      [DEMO, worker!.userId],
    );
    await db.query(
      "delete from public.account_links where tenant_id = $1 and user_id = $2",
      [DEMO, worker!.userId],
    );
    await db.query(
      "delete from public.missionaries where tenant_id = $1 and party_id = $2",
      [DEMO, workerParty],
    );
    await db.query("delete from public.parties where id = any($1::uuid[])", [
      [workerParty, ...donors.rows.map((row) => row.party_id).filter(Boolean)],
    ]);
  });
  await deletePerson(env, worker);
});

test.describe("Add Partner in the missionary workspace (AL-2678 WP5 rest; fix round F1 and F7: a name and a phone, no e-mail, and the adding missionary sees the partner named)", () => {
  test.beforeEach(() => {
    test.skip(!onMissionaryProject(), "The missionary workspace only.");
    test.skip(!env?.dbUrl, "Needs the local stack's database.");
  });

  test("adds a partner from both of the Partners page's buttons, and a retry from the other button after a lost answer returns the partner already stored instead of a second one", async ({
    page,
  }) => {
    await signIn(page, worker!.email, worker!.password);
    const before = await nextRead(page, PARTNERS, () =>
      page.goto(`/${DEMO}/donors`),
    );
    expect(before.status).toBe(200);
    expect((before.json as { donors: unknown[] }).donors).toEqual([]);
    const buttons = page.getByRole("button", {
      name: "Add partner",
      exact: true,
    });
    await expect(buttons).toHaveCount(2, { timeout: 120_000 });

    const lost: number[] = [];
    const loseTheAnswer = async (route: Route) => {
      if (route.request().method() !== "POST") return route.fallback();
      const reached = await route.fetch();
      lost.push(reached.status());
      await route.abort("failed");
    };
    await page.route("**/api/missionary/donors", loseTheAnswer);
    await buttons.first().click();
    let dialog = await fill(page, first);
    await dialog
      .getByRole("button", { name: "Add Partner", exact: true })
      .click();
    await expect(
      page.getByText("We couldn't confirm the partner was added."),
    ).toBeVisible({ timeout: 120_000 });
    expect(lost).toEqual([201]);
    await page.unroute("**/api/missionary/donors", loseTheAnswer);
    const afterLost = await stored();
    expect(afterLost.donors.map((donor) => donor.name)).toEqual([first.name]);
    expect(afterLost.logs).toBe(1);
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();

    await buttons.last().click();
    dialog = await fill(page, first);
    const retried = partnerPosts(page);
    await dialog
      .getByRole("button", { name: "Add Partner", exact: true })
      .click();
    const retry = await retried;
    expect(retry.status()).toBe(200);
    expect(await retry.json()).toMatchObject({
      donorId: afterLost.donors[0]!.id,
      duplicate: true,
    });
    await expect(page.getByText("Partner added successfully")).toBeVisible();
    await expect(dialog).toBeHidden();
    expect(await stored()).toEqual(afterLost);

    await buttons.first().click();
    dialog = await fill(page, second);
    const added = partnerPosts(page);
    const listed = await nextRead(page, PARTNERS, async () => {
      await dialog
        .getByRole("button", { name: "Add Partner", exact: true })
        .click();
      expect((await added).status()).toBe(201);
    });
    const after = await stored();
    expect(after.donors.map((donor) => [donor.name, donor.email])).toEqual([
      [first.name, null],
      [second.name, null],
    ]);
    expect(after.logs).toBe(2);
    const rows = (
      listed.json as {
        donors: {
          id: string;
          name: string;
          email: string;
          phone: string;
          is_anonymous: boolean;
        }[];
      }
    ).donors;
    expect(rows.map((donor) => donor.id).sort()).toEqual(
      after.donors.map((donor) => donor.id).sort(),
    );
    expect(
      rows.map(({ name, email, phone, is_anonymous }) => ({
        name,
        email,
        phone,
        is_anonymous,
      })),
    ).toEqual([
      { name: first.name, email: "", phone: "", is_anonymous: false },
      {
        name: second.name,
        email: "",
        phone: second.phone,
        is_anonymous: false,
      },
    ]);
    await expect(page.getByText(second.name).first()).toBeVisible();
    await expect(page.getByText("Anonymous partner")).toHaveCount(0);
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  });
});
