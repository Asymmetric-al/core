import { randomUUID } from "node:crypto";

import { expect, type Page } from "@playwright/test";
import pg from "pg";

import {
  AUTH_MAIL_SECOND_TENANT_ID,
  AUTH_MAIL_TENANT_ID,
  deleteUser,
  uniqueTestEmail,
  waitForHydratedForm,
  type AuthMailEnv,
} from "./auth-mail";

/**
 * Real people, real rows and the pages' own reads for the request-scope
 * journeys (`auth-request-scope-reads.spec.ts`; WP2b, AL-2675). Everything is
 * created and removed here by the database owner, through the local stack's
 * database URL, as `auth-mail.ts` gives memberships.
 */

export const DEMO = AUTH_MAIL_TENANT_ID;
export const SECOND = AUTH_MAIL_SECOND_TENANT_ID;

/** The organizations' names, as the choosers and the shell show them (supabase/seed.sql). */
export const ORGANIZATION_NAME: Record<string, string> = {
  [DEMO]: "GiveHope Demo Organization",
  [SECOND]: "Harbor Light Mission",
};

/** The seed's people; every seeded login uses the demo password. */
export const SEEDED_PASSWORD = "demo-password";
export const SEEDED = {
  /** Staff (development, tenant administrator), donor and missionary in the demo organization. */
  owner: {
    email: "demo-owner@givehope.test",
    userId: "11111111-1111-1111-1111-111111111111",
    name: "Jordan Hale",
  },
  /** The second organization's administrator, and nothing else. */
  morgan: {
    email: "admin@harborlight.test",
    userId: "33333333-3333-3333-3333-333333333333",
    name: "Morgan Reyes",
  },
  /** A donor in both organizations, whom the portal refuses until WP3. */
  riley: {
    email: "two-organizations@donors.test",
    userId: "44444444-4444-4444-4444-444444444444",
  },
} as const;

export async function withOwner<T>(
  env: AuthMailEnv,
  run: (db: pg.Client) => Promise<T>,
): Promise<T> {
  if (!env.dbUrl) {
    throw new Error(
      "The request-scope journeys need the stack's database: run them with `bun run test:e2e:auth-mail`.",
    );
  }
  const db = new pg.Client({ connectionString: env.dbUrl });
  await db.connect();
  try {
    return await run(db);
  } finally {
    await db.end();
  }
}

/** What the database owner computes with a rule: the first column, sorted. */
export async function ownerIds(
  env: AuthMailEnv,
  sql: string,
  params: unknown[],
): Promise<string[]> {
  return withOwner(env, async (db) =>
    (await db.query(sql, params)).rows
      .map((row) => String(Object.values(row)[0]))
      .sort(),
  );
}

export type Row =
  | {
      role: "staff";
      tenantId: string;
      staffRole: "development" | "finance" | "member_care";
      admin: boolean;
    }
  | { role: "missionary" | "donor"; tenantId: string };

export interface Person {
  userId: string;
  email: string;
  password: string;
  name: string;
  /** Membership row ids by `${tenantId}:${role}`. */
  rows: Record<string, string>;
}

/**
 * A confirmed login with exactly `rows`: created through the Auth admin API,
 * as a sign-up creates one, then given its rows by the database owner in
 * place of the donor row the sign-up trigger adds in the demo organization.
 */
export async function createPerson(
  env: AuthMailEnv,
  label: string,
  rows: readonly Row[],
): Promise<Person> {
  const email = uniqueTestEmail(`al2675-scope-${label}`);
  const password = `${label} scope phrase`;
  // A name of its own per run, so a page showing it shows this person.
  const last = `${label} ${randomUUID().slice(0, 4)}`;
  const response = await fetch(`${env.supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: env.serviceRoleKey,
      Authorization: `Bearer ${env.serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: "Scope", last_name: last },
    }),
  });
  expect(response.status, await response.clone().text()).toBe(200);
  const { id: userId } = (await response.json()) as { id: string };
  const ids = await withOwner(env, async (db) => {
    await db.query("delete from authz.memberships where user_id = $1", [
      userId,
    ]);
    const created: Record<string, string> = {};
    for (const row of rows) {
      const { rows: inserted } = await db.query<{ id: string }>(
        `insert into authz.memberships (user_id, tenant_id, role, staff_role, is_tenant_admin)
         values ($1, $2, $3, $4, $5) returning id`,
        [
          userId,
          row.tenantId,
          row.role,
          row.role === "staff" ? row.staffRole : null,
          row.role === "staff" ? row.admin : false,
        ],
      );
      created[`${row.tenantId}:${row.role}`] = inserted[0]!.id;
      if (row.role === "staff") {
        created[`${row.tenantId}:${row.role}:${row.staffRole}`] =
          inserted[0]!.id;
      }
    }
    return created;
  });
  return { userId, email, password, name: `Scope ${last}`, rows: ids };
}

export async function deletePerson(env: AuthMailEnv, person: Person | null) {
  if (!person) return;
  await withOwner(env, (db) =>
    db.query("delete from authz.memberships where user_id = $1", [
      person.userId,
    ]),
  );
  await deleteUser(env, person.userId);
}

/** The seeded people's membership row ids, by `${tenantId}:${role}`. */
export async function seededRows(
  env: AuthMailEnv,
  userId: string,
): Promise<Record<string, string>> {
  return withOwner(env, async (db) => {
    const { rows } = await db.query<{
      id: string;
      tenant_id: string;
      role: string;
    }>(
      `select id, tenant_id, role::text from authz.memberships
        where user_id = $1 and is_active and revoked_at is null`,
      [userId],
    );
    return Object.fromEntries(
      rows.map((row) => [`${row.tenant_id}:${row.role}`, row.id]),
    );
  });
}

/**
 * The rows the journeys read beyond the seed, in both organizations (the
 * seed's second organization holds no business data): a missionary in two
 * organizations with a record and partners in each, a donor of the second
 * organization with gifts and non-default feed preferences, and a fund there.
 */
export interface Fixtures {
  tag: string;
  missionaryInDemo: string;
  missionaryInSecond: string;
  partnerInDemo: string;
  partnersInSecond: string[];
  secondDonor: string;
  secondGifts: string[];
  secondFund: string;
  secondFeedPreferences: string;
}

export async function addFixtures(
  env: AuthMailEnv,
  people: { missionary: Person; donor: Person },
): Promise<Fixtures> {
  const tag = randomUUID().slice(0, 6);
  const id = () => randomUUID();
  const f: Fixtures = {
    tag,
    missionaryInDemo: id(),
    missionaryInSecond: id(),
    partnerInDemo: id(),
    partnersInSecond: [id(), id()],
    secondDonor: id(),
    secondGifts: [id(), id()],
    secondFund: id(),
    secondFeedPreferences: id(),
  };
  const { missionary, donor } = people;
  await withOwner(env, async (db) => {
    await db.query("begin");
    for (const [record, tenant, place] of [
      [f.missionaryInDemo, DEMO, `Demo field ${tag}`],
      [f.missionaryInSecond, SECOND, `Harbor field ${tag}`],
    ] as const)
      await db.query(
        `with party as (insert into public.parties (id, tenant_id, display_name) values ($1, $2, $4) returning id)
         insert into public.missionaries (id, tenant_id, profile_id, location, legal_entity_id, party_id)
         select $1, tenant_id, $3, $4, id, (select id from party) from public.legal_entities where tenant_id=$2`,
        [record, tenant, missionary.userId, place],
      );
    for (const [record, tenant] of [
      [f.missionaryInDemo, DEMO],
      [f.missionaryInSecond, SECOND],
    ] as const)
      await db.query(
        `insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($2, $3, $1, 'profile_backfill')`,
        [record, tenant, missionary.userId],
      );
    for (const [partner, tenant, name] of [
      [f.partnerInDemo, DEMO, `Demo partner ${tag}`],
      [f.partnersInSecond[0]!, SECOND, `Harbor partner A ${tag}`],
      [f.partnersInSecond[1]!, SECOND, `Harbor partner B ${tag}`],
    ] as const)
      // Named to the missionary, so the partners list shows the name rather
      // than "Anonymous partner" (packages/api/src/missionary-portal/redaction.ts).
      await db.query(
        `insert into public.donors (id, tenant_id, name, email, missionary_id, giving_preferences)
         values ($1, $2, $3, $4, $5, '{"defaultAnonymousToRecipient": false}'::jsonb)`,
        [partner, tenant, name, `${partner}@example.test`, missionary.userId],
      );
    await db.query(
      `insert into public.funds (id, tenant_id, name, legal_entity_id) select $1, tenant_id, $3, id from public.legal_entities where tenant_id=$2`,
      [f.secondFund, SECOND, `Harbor wells ${tag}`],
    );
    await db.query(
      `insert into public.donors (id, tenant_id, name, email, profile_id)
       values ($1, $2, $3, $4, $5)`,
      [f.secondDonor, SECOND, donor.name, donor.email, donor.userId],
    );
    await db.query(
      `insert into public.account_links (tenant_id, user_id, party_id, linked_via)
       select tenant_id, profile_id, party_id, 'profile_backfill' from public.donors where id = $1`,
      [f.secondDonor],
    );
    for (const [gift, amount] of [
      [f.secondGifts[0]!, 40],
      [f.secondGifts[1]!, 60],
    ] as const)
      await db.query(
        `insert into public.donations (id, tenant_id, donor_id, fund_id, amount)
         values ($1, $2, $3, $4, $5)`,
        [gift, SECOND, f.secondDonor, f.secondFund, amount],
      );
    // Not the defaults, so a read that silently fell back to them shows.
    await db.query(
      `insert into public.donor_feed_preferences
         (id, donor_id, tenant_id, show_org_posts, show_missionary_posts, follow_org, email_org_posts, email_missionary_posts)
       values ($1, $2, $3, false, true, true, true, false)`,
      [f.secondFeedPreferences, f.secondDonor, SECOND],
    );
    await db.query("commit");
  });
  return f;
}

export async function removeFixtures(env: AuthMailEnv, f: Fixtures | null) {
  if (!f) return;
  await withOwner(env, async (db) => {
    const donorIds = [f.partnerInDemo, ...f.partnersInSecond, f.secondDonor];
    const { rows: donorParties } = await db.query<{ party_id: string }>(
      "select party_id from public.donors where id = any($1::uuid[]) and party_id is not null",
      [donorIds],
    );
    const partyIds = [
      ...donorParties.map((row) => row.party_id),
      f.missionaryInDemo,
      f.missionaryInSecond,
    ];
    await db.query(
      "delete from public.account_links where party_id = any($1::uuid[])",
      [partyIds],
    );
    await db.query("delete from public.donor_feed_preferences where id = $1", [
      f.secondFeedPreferences,
    ]);
    await db.query("delete from public.donations where id = any($1::uuid[])", [
      f.secondGifts,
    ]);
    await db.query("delete from public.donors where id = any($1::uuid[])", [
      [f.partnerInDemo, ...f.partnersInSecond, f.secondDonor],
    ]);
    await db.query(
      "delete from public.giving_target_entity_locks where fund_id = $1 or missionary_id = any($2::uuid[])",
      [f.secondFund, [f.missionaryInDemo, f.missionaryInSecond]],
    );
    await db.query("delete from public.funds where id = $1", [f.secondFund]);
    await db.query(
      "delete from public.missionaries where id = any($1::uuid[])",
      [[f.missionaryInDemo, f.missionaryInSecond]],
    );
    await db.query("delete from public.parties where id = any($1::uuid[])", [
      partyIds,
    ]);
  });
}

/** Signs in through the app's own form, with a real Auth session. */
export async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await waitForHydratedForm(page);
  // A development server that compiles on demand can reload the sign-in page
  // again and again while it compiles (see warmUpRoutes in auth-mail.ts): a
  // reload drops a form in flight, and a page that keeps reloading never
  // holds the button still. So each attempt loads the page afresh, fills it
  // and sends it; a refused sign-in stays on /login and fails below.
  const away = (url: URL) => !url.pathname.startsWith("/login");
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      if (attempt > 1) {
        await page.goto("/login");
        await waitForHydratedForm(page);
      }
      await page.getByLabel("Email").fill(email, { timeout: 60_000 });
      await page
        .getByLabel("Password", { exact: true })
        .fill(password, { timeout: 60_000 });
      await page
        .getByRole("button", { name: "Sign in" })
        .click({ timeout: 60_000 });
      // Wait for the landing, so the next navigation does not abort it.
      await page.waitForURL(away, { timeout: 60_000 });
      return;
    } catch {
      if (away(new URL(page.url()))) return;
    }
  }
  await expect(page, "signed in and left /login").toHaveURL(away);
}

export interface PageRead {
  path: string;
  status: number;
  json: unknown;
  /** The scope headers the page's own request carried. */
  tenant: string | undefined;
  assignment: string | undefined;
}

/** Every GET the page makes to a path matching `path`, as it answers. */
export function collectReads(page: Page, path: RegExp): PageRead[] {
  const reads: PageRead[] = [];
  page.on("response", async (response) => {
    const request = response.request();
    const url = new URL(response.url());
    if (request.method() !== "GET" || !path.test(url.pathname)) return;
    const headers = request.headers();
    let json: unknown = null;
    try {
      json = await response.json();
    } catch {
      json = null;
    }
    reads.push({
      path: `${url.pathname}${url.search}`,
      status: response.status(),
      json,
      tenant: headers["x-asym-tenant"],
      assignment: headers["x-asym-assignment"],
    });
  });
  return reads;
}

/**
 * The latest GET to `path` that the page makes after `action` and whose body
 * could be read. A read the previous page started is answered after that
 * page is gone, with a body no longer available, so it does not count.
 */
export async function nextRead(
  page: Page,
  path: RegExp,
  action: () => Promise<unknown>,
): Promise<PageRead> {
  const reads = collectReads(page, path);
  await action();
  await expect
    .poll(() => reads.some((read) => read.json !== null), {
      message: `a readable answer to ${path}`,
      timeout: 120_000,
    })
    .toBe(true);
  return reads.filter((read) => read.json !== null).at(-1)!;
}

/** The tenant and assignment the page was rendered for (its document scope). */
export async function documentScopeHeaders(page: Page) {
  const marker = page.locator("[data-tenant-scope]").first();
  const prefix = (await marker.getAttribute("data-tenant-scope")) ?? "";
  const assignment =
    (await marker.getAttribute("data-tenant-assignment")) ?? "";
  const tenant = /^\/([0-9a-f-]{36})/.exec(prefix)?.[1] ?? "";
  return { "x-asym-tenant": tenant, "x-asym-assignment": assignment };
}

/**
 * Removes the two scope headers from every request the page makes, as a
 * stale tab would send them. Returns how many requests had one to remove.
 */
export async function stripScopeHeaders(
  page: Page,
): Promise<{ count: number }> {
  const stripped = { count: 0 };
  await page.route("**/*", async (route) => {
    const headers = { ...route.request().headers() };
    if ("x-asym-tenant" in headers || "x-asym-assignment" in headers)
      stripped.count += 1;
    delete headers["x-asym-tenant"];
    delete headers["x-asym-assignment"];
    await route.continue({ headers });
  });
  return stripped;
}

/** Counts the documents the page loads (main-frame navigations that reach the server). */
export function countDocumentLoads(page: Page): { count: number } {
  const loads = { count: 0 };
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame())
      loads.count += 1;
  });
  return loads;
}

export const sorted = (values: readonly string[]) => [...values].sort();
