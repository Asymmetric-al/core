import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, expect } from "vitest";

export const url = process.env.WP5_IDENTITY_IT_URL;
export const database = process.env.WP5_IDENTITY_IT_DATABASE_URL;
export const anon = process.env.WP5_IDENTITY_IT_ANON_KEY;
export const service = process.env.WP5_IDENTITY_IT_SERVICE_KEY;
export const required = process.env.GITHUB_JOB === "local-supabase";

export const PEOPLE = [
  "admin",
  "staffB",
  "donor",
  "claimed",
  "missionary",
  "giver",
] as const;
export const WORKERS = ["W", "V", "X"] as const;
export type Person = (typeof PEOPLE)[number];

export function identityKeysFixture() {
  const TA = randomUUID();
  const TB = randomUUID();
  const ids = Object.fromEntries(
    [
      "mAdmin",
      "mStaffB",
      "mDonor",
      "mClaimed",
      "mMissionary",
      "pDonor",
      "pClaimed",
      "pMissionary",
      "dDonor",
      "dClaimed",
      "mi",
      "gDonor",
      "gClaimed",
      "aDonor",
      "aClaimed",
      "mGiver",
      "pGiver",
      "dGiver",
      "pW",
      "pV",
      "pX",
      "mW",
      "mV",
      "mX",
      "gW",
      "gV",
      "gX",
      "plW",
      "plV",
      "postW",
      "postX",
      "pN",
      "mN",
    ].map((k) => [k, randomUUID()]),
  ) as Record<string, string>;
  const user = {} as Record<Person, string>;
  const token = {} as Record<Person, string>;
  const worker = {} as Record<(typeof WORKERS)[number], string>;
  const assignment: Record<Person, [string, string]> = {
    admin: [TA, ids.mAdmin!],
    staffB: [TB, ids.mStaffB!],
    donor: [TA, ids.mDonor!],
    claimed: [TA, ids.mClaimed!],
    missionary: [TA, ids.mMissionary!],
    giver: [TA, ids.mGiver!],
  };
  const state: { db: pg.Client | undefined } = { db: undefined };

  async function api(
    path: string,
    init: {
      key?: string;
      bearer?: string;
      body?: unknown;
      method?: string;
      headers?: Record<string, string>;
    } = {},
  ) {
    return fetch(`${url}/${path}`, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      headers: {
        apikey: init.key ?? anon!,
        Authorization: `Bearer ${init.bearer ?? anon!}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  }
  const as = (
    who: Person,
    path: string,
    init: {
      body?: unknown;
      method?: string;
      headers?: Record<string, string>;
    } = {},
  ) =>
    api(path, {
      ...init,
      bearer: token[who],
      headers: {
        "x-asym-tenant": assignment[who][0],
        "x-asym-assignment": assignment[who][1],
        ...init.headers,
      },
    });
  const body = async (response: Response) => {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };

  beforeAll(async () => {
    if (
      !url ||
      !database ||
      !anon ||
      !service ||
      ![url, database].every((value) =>
        ["localhost", "127.0.0.1", "[::1]"].includes(new URL(value).hostname),
      )
    )
      throw Error("A disposable local Supabase stack is required");
    for (const who of PEOPLE) {
      const credentials = {
        email: `wp5-${who}-${TA}@example.test`,
        password: randomUUID(),
      };
      const created = await api("auth/v1/admin/users", {
        key: service,
        bearer: service,
        body: { ...credentials, email_confirm: true },
      });
      expect(created.ok, `Auth fixture ${who}: ${created.status}`).toBe(true);
      user[who] = (await created.json()).id;
      const login = await api("auth/v1/token?grant_type=password", {
        body: credentials,
      });
      expect(login.ok, `Sign-in ${who}: ${login.status}`).toBe(true);
      token[who] = (await login.json()).access_token;
    }
    for (const w of WORKERS) {
      const created = await api("auth/v1/admin/users", {
        key: service,
        bearer: service,
        body: {
          email: `wp5-worker-${w}-${TA}@example.test`,
          password: randomUUID(),
          email_confirm: true,
        },
      });
      expect(created.ok, `Auth fixture worker ${w}: ${created.status}`).toBe(
        true,
      );
      worker[w] = (await created.json()).id;
    }
    const db = new pg.Client({ connectionString: database });
    state.db = db;
    await db.connect();
    await db.query("begin");
    try {
      await db.query(
        "insert into public.tenants (id, name, slug) values ($1::uuid, 'WP5 A', 'wp5-a-' || $1::text), ($2::uuid, 'WP5 B', 'wp5-b-' || $2::text)",
        [TA, TB],
      );
      await db.query(
        "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'A', 'US', 'usd', 'A'), ($2, $2, 'B', 'US', 'usd', 'B')",
        [TA, TB],
      );
      await db.query(
        "delete from authz.memberships where user_id = any($1::uuid[])",
        [Object.values(user)],
      );
      await db.query(
        `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin) values
             ($1, $6, $11, 'staff', 'development', true), ($2, $7, $12, 'staff', 'development', false),
             ($3, $8, $11, 'donor', null, false), ($4, $9, $11, 'donor', null, false), ($5, $10, $11, 'missionary', null, false)`,
        [
          ids.mAdmin,
          ids.mStaffB,
          ids.mDonor,
          ids.mClaimed,
          ids.mMissionary,
          user.admin,
          user.staffB,
          user.donor,
          user.claimed,
          user.missionary,
          TA,
          TB,
        ],
      );
      await db.query(
        "insert into public.parties (id, tenant_id, display_name) values ($1, $4, 'Donor'), ($2, $4, 'Claimed'), ($3, $4, 'Worker')",
        [ids.pDonor, ids.pClaimed, ids.pMissionary, TA],
      );
      await db.query(
        "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $4, $2)",
        [ids.mi, TA, ids.pMissionary, user.missionary],
      );
      await db.query(
        `insert into public.donors (id, tenant_id, party_id, profile_id, missionary_id, name, email) values
             ($1, $3, $4, $5, $6, 'Donor', $8),
             ($2, $3, $7, null, $6, 'Claimed', $9)`,
        [
          ids.dDonor,
          ids.dClaimed,
          TA,
          ids.pDonor,
          user.donor,
          user.missionary,
          ids.pClaimed,
          `wp5-d-${ids.dDonor}@example.test`,
          `wp5-c-${ids.dClaimed}@example.test`,
        ],
      );
      await db.query(
        "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'profile_backfill'), ($1, $4, $5, 'account_claim'), ($1, $6, $7, 'profile_backfill')",
        [
          TA,
          user.donor,
          ids.pDonor,
          user.claimed,
          ids.pClaimed,
          user.missionary,
          ids.pMissionary,
        ],
      );
      await db.query(
        "insert into public.donations (id, tenant_id, donor_id, missionary_id, amount) values ($1, $3, $4, $6, 100), ($2, $3, $5, $6, 200)",
        [ids.gDonor, ids.gClaimed, TA, ids.dDonor, ids.dClaimed, ids.mi],
      );
      await db.query(
        "insert into public.donor_activities (id, tenant_id, donor_id, type, title) values ($1, $3, $4, 'note', 'Donor note'), ($2, $3, $5, 'note', 'Claimed note')",
        [ids.aDonor, ids.aClaimed, TA, ids.dDonor, ids.dClaimed],
      );
      await db.query(
        "insert into public.follower_requests (tenant_id, donor_id, missionary_id) values ($1, $2, $3)",
        [TA, ids.dDonor, user.missionary],
      );
      await db.query(
        "delete from authz.memberships where user_id = any($1::uuid[])",
        [[user.giver, ...Object.values(worker)]],
      );
      await db.query(
        "insert into authz.memberships (id, user_id, tenant_id, role) values ($1, $2, $3, 'donor')",
        [ids.mGiver, user.giver, TA],
      );
      await db.query(
        "insert into public.parties (id, tenant_id, display_name) values ($1, $5, 'Giver'), ($2, $5, 'Party Rowan'), ($3, $5, 'Party Vale'), ($4, $5, 'Party Xu')",
        [ids.pGiver, ids.pW, ids.pV, ids.pX, TA],
      );
      await db.query(
        "update public.profiles set display_name = 'Profile Rowan', full_name = 'Profile Rowan', first_name = 'Profile', last_name = 'Rowan' where id = $1",
        [worker.W],
      );
      await db.query(
        "update public.profiles set display_name = 'Profile Vale', full_name = 'Profile Vale', first_name = 'Profile', last_name = 'Vale' where id = $1",
        [worker.V],
      );
      await db.query(
        "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $4, $5, $6, $4), ($2, $4, $7, $8, $4), ($3, $4, $9, $10, $4)",
        [
          ids.mW,
          ids.mV,
          ids.mX,
          TA,
          ids.pW,
          worker.W,
          ids.pV,
          worker.V,
          ids.pX,
          worker.X,
        ],
      );
      await db.query(
        "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Party Nell')",
        [ids.pN, TA],
      );
      await db.query(
        "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id, phone, birth_date, location) values ($1, $2, $3, null, $2, '+15555550100', '1980-01-01', 'Precise place')",
        [ids.mN, TA, ids.pN],
      );
      await db.query(
        "update public.missionaries set phone = '+15555550101', birth_date = '1981-02-02', location = 'Another place', tagline = 'Tagline' where id = $1",
        [ids.mW],
      );
      await db.query(
        "insert into public.donors (id, tenant_id, party_id, profile_id, name, email) values ($1, $2, $3, $4, 'Giver', $5)",
        [
          ids.dGiver,
          TA,
          ids.pGiver,
          user.giver,
          `wp5-g-${ids.dGiver}@example.test`,
        ],
      );
      await db.query(
        "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'profile_backfill')",
        [TA, user.giver, ids.pGiver],
      );
      const giftYear = new Date().getUTCFullYear();
      await db.query(
        "insert into public.donations (id, tenant_id, donor_id, missionary_id, amount, status, gift_date) values ($1, $4, $5, $6, 1000, 'completed', $9::date), ($2, $4, $5, $7, 2000, 'completed', $10::date), ($3, $4, $5, $8, 500, 'pending', $11::date)",
        [
          ids.gW,
          ids.gV,
          ids.gX,
          TA,
          ids.dGiver,
          ids.mW,
          ids.mV,
          ids.mX,
          `${giftYear}-01-03`,
          `${giftYear}-01-02`,
          `${giftYear}-01-01`,
        ],
      );
      await db.query(
        "insert into public.donor_pledges (id, tenant_id, donor_id, missionary_id, amount, status) values ($1, $3, $4, $5, 100, 'active'), ($2, $3, $4, $6, 200, 'active')",
        [ids.plW, ids.plV, TA, ids.dGiver, ids.mW, ids.mV],
      );
      await db.query(
        "insert into public.posts (id, tenant_id, missionary_id, content, visibility, status) values ($1, $3, $4, 'From W', 'public', 'published'), ($2, $3, $5, 'From X', 'public', 'published')",
        [ids.postW, ids.postX, TA, worker.W, worker.X],
      );
      await db.query("commit");
    } catch (error) {
      await db.query("rollback");
      throw error;
    }
  });

  afterAll(async () => {
    try {
      const db = state.db;
      if (db) {
        await db.query("begin");
        try {
          for (const sql of [
            "delete from public.audit_logs where tenant_id = any($1::uuid[])",
            "delete from public.account_claim_requests where tenant_id = any($1::uuid[])",
            "delete from public.account_links where tenant_id = any($1::uuid[])",
            "delete from private.party_restricted where tenant_id = any($1::uuid[])",
            "delete from public.missionary_tasks where tenant_id = any($1::uuid[])",
            "delete from public.follower_requests where tenant_id = any($1::uuid[])",
            "delete from public.donor_feed_preferences where tenant_id = any($1::uuid[])",
            "delete from public.donor_activities where tenant_id = any($1::uuid[])",
            "delete from public.posts where tenant_id = any($1::uuid[])",
            "delete from public.donor_pledges where tenant_id = any($1::uuid[])",
            "delete from public.donations where tenant_id = any($1::uuid[])",
            "delete from public.giving_target_entity_locks where tenant_id = any($1::uuid[])",
            "delete from public.donors where tenant_id = any($1::uuid[])",
            "delete from public.missionaries where tenant_id = any($1::uuid[])",
            "delete from public.parties where tenant_id = any($1::uuid[])",
            "delete from public.legal_entities where tenant_id = any($1::uuid[])",
            "delete from authz.memberships where tenant_id = any($1::uuid[])",
            "delete from public.tenants where id = any($1::uuid[])",
          ])
            await db.query(sql, [[TA, TB]]);
          await db.query("commit");
        } catch (error) {
          await db.query("rollback");
          throw error;
        } finally {
          await db.end();
        }
      }
    } finally {
      for (const w of WORKERS)
        if (worker[w])
          expect(
            (
              await api(`auth/v1/admin/users/${worker[w]}`, {
                key: service,
                bearer: service,
                method: "DELETE",
              })
            ).ok,
          ).toBe(true);
      for (const who of PEOPLE)
        if (user[who])
          expect(
            (
              await api(`auth/v1/admin/users/${user[who]}`, {
                key: service,
                bearer: service,
                method: "DELETE",
              })
            ).ok,
          ).toBe(true);
    }
  });

  return {
    TA,
    TB,
    ids,
    user,
    token,
    worker,
    assignment,
    api,
    as,
    body,
    get db() {
      return state.db;
    },
  };
}
