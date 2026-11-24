import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  listMissionaryTasks,
  writeMissionaryTask,
} from "../../../../packages/api/src/missionary-portal/service";
import { donorActivitySchema } from "../../../../packages/database/collections/schemas/giving";

const url = process.env.WP5_IDENTITY_IT_URL;
const database = process.env.WP5_IDENTITY_IT_DATABASE_URL;
const anon = process.env.WP5_IDENTITY_IT_ANON_KEY;
const service = process.env.WP5_IDENTITY_IT_SERVICE_KEY;
const required = process.env.GITHUB_JOB === "local-supabase";

const PEOPLE = ["admin", "staffB", "donor", "claimed", "missionary"] as const;
type Person = (typeof PEOPLE)[number];

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "AL-2678 identity keys through PostgREST with real tokens",
  () => {
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
      ].map((k) => [k, randomUUID()]),
    ) as Record<string, string>;
    const user = {} as Record<Person, string>;
    const token = {} as Record<Person, string>;
    const assignment: Record<Person, [string, string]> = {
      admin: [TA, ids.mAdmin!],
      staffB: [TB, ids.mStaffB!],
      donor: [TA, ids.mDonor!],
      claimed: [TA, ids.mClaimed!],
      missionary: [TA, ids.mMissionary!],
    };
    let db: pg.Client | undefined;

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
      db = new pg.Client({ connectionString: database });
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
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    });

    afterAll(async () => {
      try {
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

    it("the running build's task statements work on the new keys: the donor embed resolves through missionary_tasks_donor_id_fkey, and integer and fractional sort keys come back as JSON numbers", async () => {
      const client = createClient(url!, service!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const scope = {
        supabaseAdmin: client as never,
        profileId: user.missionary,
        tenantId: TA,
        assignmentId: ids.mMissionary!,
      };
      await writeMissionaryTask(scope, "create", null, {
        title: "Call the donor",
        donor_id: ids.dDonor,
        sort_key: 100,
      });
      await writeMissionaryTask(scope, "create", null, {
        title: "Pray",
        sort_key: 15.5,
      });
      const listed = await listMissionaryTasks(scope);
      expect(listed.map((t) => [t.title, t.sort_key])).toEqual([
        ["Pray", 15.5],
        ["Call the donor", 100],
      ]);
      const raw = await api(
        `rest/v1/rpc/missionary_owned_tasks?${new URLSearchParams({ select: "id,sort_key,donor_id,donor:donors!missionary_tasks_donor_id_fkey(id,name,email,avatar_url,giving_preferences)", order: "sort_key.asc" })}`,
        {
          key: service,
          bearer: service,
          body: {
            p_profile_id: user.missionary,
            p_tenant_id: TA,
            p_assignment_id: ids.mMissionary,
          },
        },
      );
      const rows = await body(raw);
      expect(raw.status, JSON.stringify(rows)).toBe(200);
      expect(rows.map((r: { sort_key: unknown }) => typeof r.sort_key)).toEqual(
        ["number", "number"],
      );
      expect(
        rows.map((r: { donor: { id: string } | null }) => r.donor?.id ?? null),
      ).toEqual([null, ids.dDonor]);
    });

    it("the running build's follower-request embed by a column hint on donor_id still resolves, so the follower key keeps its single column in part 1", async () => {
      const response = await api(
        `rest/v1/rpc/missionary_follower_requests?${new URLSearchParams({ select: "id,donor_id,status,donor:donors!donor_id(id,name,avatar_url,status,total_given,last_gift_date)" })}`,
        {
          key: service,
          bearer: service,
          body: {
            p_profile_id: user.missionary,
            p_tenant_id: TA,
            p_assignment_id: ids.mMissionary,
          },
        },
      );
      const rows = await body(response);
      expect(response.status, JSON.stringify(rows)).toBe(200);
      expect(rows.map((r: { donor: { id: string } }) => r.donor.id)).toEqual([
        ids.dDonor,
      ]);
    });

    it("the old activity read parses with the running build's schema", async () => {
      const response = await api("rest/v1/rpc/missionary_activities", {
        key: service,
        bearer: service,
        body: {
          p_profile_id: user.missionary,
          p_tenant_id: TA,
          p_assignment_id: ids.mMissionary,
          p_donor_ids: [ids.dDonor],
        },
      });
      const rows = await body(response);
      expect(response.status, JSON.stringify(rows)).toBe(200);
      expect(rows).toHaveLength(1);
      expect(donorActivitySchema.parse(rows[0]).id).toBe(ids.aDonor);
    });

    it("a backfilled donor and a claimed donor whose donor record names no profile each read their own gifts and activities, and nobody else's", async () => {
      for (const [who, gift, activity, donor] of [
        ["donor", ids.gDonor, ids.aDonor, ids.dDonor],
        ["claimed", ids.gClaimed, ids.aClaimed, ids.dClaimed],
      ] as [Person, string, string, string][]) {
        for (const [table, expected] of [
          ["donations", gift],
          ["donor_activities", activity],
          ["donors", donor],
        ] as const) {
          const response = await as(
            who,
            `rest/v1/${table}?select=id&tenant_id=eq.${TA}`,
          );
          expect(response.status).toBe(200);
          expect(
            (await body(response)).map((r: { id: string }) => r.id),
          ).toEqual([expected]);
        }
      }
      const missionaryGifts = await as(
        "missionary",
        `rest/v1/donations?select=id&tenant_id=eq.${TA}&order=amount.asc`,
      );
      expect(
        (await body(missionaryGifts)).map((r: { id: string }) => r.id),
      ).toEqual([ids.gDonor, ids.gClaimed]);
      const otherTenant = await as(
        "staffB",
        `rest/v1/donations?select=id&tenant_id=eq.${TA}`,
      );
      expect(await body(otherTenant)).toEqual([]);
    });

    it("the running build's caller-token statements still answer a backfilled donor: the donor record by profile, the profile by id and by user_id, and the feed-preference read and upsert", async () => {
      const byProfile = await as(
        "donor",
        `rest/v1/donors?select=id&profile_id=eq.${user.donor}`,
      );
      expect(await body(byProfile)).toEqual([{ id: ids.dDonor }]);
      for (const column of ["id", "user_id"]) {
        const profile = await api(
          `rest/v1/profiles?select=id&${column}=eq.${user.donor}`,
          { bearer: token.donor },
        );
        expect(await body(profile)).toEqual([{ id: user.donor }]);
      }
      const lookup = await as(
        "donor",
        `rest/v1/donors?select=id&tenant_id=eq.${TA}&profile_id=in.(${user.donor})&limit=2`,
      );
      expect(await body(lookup)).toEqual([{ id: ids.dDonor }]);
      const upsert = await as(
        "donor",
        "rest/v1/donor_feed_preferences?on_conflict=donor_id,tenant_id&select=*",
        {
          body: {
            donor_id: ids.dDonor,
            tenant_id: TA,
            updated_at: new Date().toISOString(),
            show_org_posts: false,
          },
          headers: {
            Prefer: "resolution=merge-duplicates,return=representation",
            Accept: "application/vnd.pgrst.object+json",
          },
        },
      );
      const saved = await body(upsert);
      expect(upsert.status, JSON.stringify(saved)).toBeLessThan(300);
      expect(saved).toMatchObject({
        donor_id: ids.dDonor,
        show_org_posts: false,
      });
      const read = await as(
        "donor",
        `rest/v1/donor_feed_preferences?select=*&donor_id=eq.${ids.dDonor}&tenant_id=eq.${TA}`,
      );
      expect(
        (await body(read)).map((r: { donor_id: string }) => r.donor_id),
      ).toEqual([ids.dDonor]);
      const foreign = await as(
        "claimed",
        "rest/v1/donor_feed_preferences?on_conflict=donor_id,tenant_id",
        {
          body: { donor_id: ids.dDonor, tenant_id: TA, show_org_posts: true },
          headers: { Prefer: "resolution=merge-duplicates" },
        },
      );
      expect([401, 403]).toContain(foreign.status);
    });

    it("party_restricted is not on the Data API; staff of the tenant read a worker's legal name through the read function; a donor, a missionary and another tenant's staff do not; direct writes of the safety fields are refused and the commands set them", async () => {
      const set = await as("admin", "rest/v1/rpc/set_worker_identity", {
        body: {
          p_tenant_id: TA,
          p_party_id: ids.pMissionary,
          p_legal_name: "Legal Worker",
          p_real_country: "Country",
          p_precise_location: "Place",
          p_display_name: null,
          p_security_level: "restricted",
          p_public_alias: "Shepherd",
          p_reason: "Field security",
        },
      });
      expect(set.status, JSON.stringify(await body(set))).toBe(200);
      for (const who of ["admin", "donor", "missionary"] as Person[]) {
        const direct = await as(who, "rest/v1/party_restricted?select=*", {
          headers: { "Accept-Profile": "private" },
        });
        expect(direct.status).not.toBe(200);
        const exposed = await as(who, "rest/v1/party_restricted?select=*");
        expect(exposed.status).not.toBe(200);
      }
      const read = (who: Person) =>
        as(who, "rest/v1/rpc/read_party_restricted", {
          body: { p_party_id: ids.pMissionary },
        });
      expect(await body(await read("admin"))).toMatchObject([
        { party_id: ids.pMissionary, legal_name: "Legal Worker" },
      ]);
      for (const who of ["donor", "missionary", "staffB"] as Person[])
        expect(await body(await read(who))).toEqual([]);
      for (const [method, path, payload] of [
        [
          "PATCH",
          `rest/v1/parties?id=eq.${ids.pMissionary}`,
          { security_level: "standard" },
        ],
        [
          "PATCH",
          `rest/v1/parties?id=eq.${ids.pMissionary}`,
          { public_alias: "Other" },
        ],
        [
          "PATCH",
          `rest/v1/parties?id=eq.${ids.pMissionary}`,
          { do_not_publish: true },
        ],
        [
          "POST",
          "rest/v1/parties",
          {
            tenant_id: TA,
            display_name: "x",
            security_level: "high_risk",
            public_alias: "y",
          },
        ],
      ] as const) {
        const response = await as("admin", path, { method, body: payload });
        const error = await body(response);
        expect(response.status, `${method} ${JSON.stringify(payload)}`).toBe(
          403,
        );
        expect(error.code).toBe("42501");
      }
      const restricted = await as(
        "admin",
        "rest/v1/rpc/restrict_worker_publication",
        {
          body: {
            p_tenant_id: TA,
            p_party_id: ids.pMissionary,
            p_security_level: "high_risk",
            p_public_alias: null,
            p_do_not_publish: true,
            p_reason: "Escalated",
          },
        },
      );
      expect(await body(restricted)).toMatchObject({
        security_level: "high_risk",
        security_level_source: "manual",
        do_not_publish: true,
      });
      const projected = await as(
        "donor",
        "rest/v1/rpc/worker_public_display_name",
        {
          body: {
            p_public_alias: "Shepherd",
            p_approved_profile_display_name: null,
            p_party_display_name: "Worker",
          },
        },
      );
      expect(await body(projected)).toBe("Shepherd");
    });

    it("a claim through the Data API answers the same whether or not a donor matches, and the claimant reads only their request's status and dates", async () => {
      const inA = { "x-asym-tenant": TA };
      const started = await api("rest/v1/rpc/start_account_claim", {
        bearer: token.staffB,
        body: { p_tenant_id: TA },
        headers: inA,
      });
      expect(started.status).toBe(200);
      expect(await body(started)).toEqual({ status: "received" });
      const redeemed = await api("rest/v1/rpc/redeem_account_claim", {
        bearer: token.staffB,
        body: { p_tenant_id: TA, p_token: randomUUID() },
        headers: inA,
      });
      expect(await body(redeemed)).toEqual({ status: "refused" });
      const direct = await api(`rest/v1/account_claim_requests?select=*`, {
        bearer: token.staffB,
        headers: inA,
      });
      expect(await body(direct)).toEqual([]);
      const status = await api("rest/v1/rpc/account_claim_status", {
        bearer: token.staffB,
        body: { p_tenant_id: TA },
        headers: inA,
      });
      expect(await body(status)).toEqual([]);
    });

    it("each claim entry binds the organization it names to the request's header through the Data API (finding B3): start and redeem answer 403 (42501) to a missing or other organization's header, and the status read answers no rows", async () => {
      for (const headers of [{}, { "x-asym-tenant": TB }]) {
        for (const [path, payload] of [
          ["rest/v1/rpc/start_account_claim", { p_tenant_id: TA }],
          [
            "rest/v1/rpc/redeem_account_claim",
            { p_tenant_id: TA, p_token: randomUUID() },
          ],
        ] as const) {
          const refused = await api(path, {
            bearer: token.staffB,
            body: payload,
            headers,
          });
          expect(refused.status, `${path} ${JSON.stringify(headers)}`).toBe(
            403,
          );
          expect((await body(refused)).code).toBe("42501");
        }
        const status = await api("rest/v1/rpc/account_claim_status", {
          bearer: token.staffB,
          body: { p_tenant_id: TA },
          headers,
        });
        expect(status.status).toBe(200);
        expect(await body(status)).toEqual([]);
      }
    });
  },
);
