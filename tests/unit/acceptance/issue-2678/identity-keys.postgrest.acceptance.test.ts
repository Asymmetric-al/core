import { randomBytes, randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  GET as getDonations,
  POST as postDonation,
} from "../../../../packages/api/src/donations";
import { buildDonorPortalSnapshot } from "../../../../packages/api/src/donor-portal/model";
import {
  getDonorPortalSnapshot,
  getOwnedDonation,
  getOwnedStatementDonations,
  resolveDonorPortalContext,
} from "../../../../packages/api/src/donor-portal/service";
import {
  listMissionaryTasks,
  writeMissionaryTask,
} from "../../../../packages/api/src/missionary-portal/service";
import { FEED_POST_SELECT } from "../../../../packages/api/src/posts/select";
import { donorActivitySchema } from "../../../../packages/database/collections/schemas/giving";
import { postAuthorName } from "../../../../packages/database/hooks/donor-feed-posts";
import { createGraphQLHandler } from "../../../../packages/graphql/handler";
import { membershipsForRole } from "../../../fixtures/auth-memberships";

import type { AuthContext } from "../../../../packages/auth/context";
import type * as AuthModule from "../../../../packages/auth/context";

const url = process.env.WP5_IDENTITY_IT_URL;
const database = process.env.WP5_IDENTITY_IT_DATABASE_URL;
const anon = process.env.WP5_IDENTITY_IT_ANON_KEY;
const service = process.env.WP5_IDENTITY_IT_SERVICE_KEY;
const required = process.env.GITHUB_JOB === "local-supabase";

const s = vi.hoisted(() => ({
  auth: null as unknown,
  intake: null as
    | null
    | ((input: {
        missionaryId: string;
        amountCents: number;
        currency: string;
      }) => Promise<{
        donationId: string;
        outboxId: string;
        replayed: boolean;
      }>),
}));
vi.mock("@asym/auth/context", async (orig) => ({
  ...(await orig<typeof AuthModule>()),
  getAuthContext: async () => s.auth,
}));
vi.mock("@asym/database/supabase/admin", () => {
  let client: ReturnType<typeof createClient> | undefined;
  return {
    getAdminClient: () => {
      client ??= createClient(
        process.env.WP5_IDENTITY_IT_URL ?? "http://127.0.0.1:1",
        process.env.WP5_IDENTITY_IT_SERVICE_KEY ?? "no-key",
        { auth: { persistSession: false, autoRefreshToken: false } },
      );
      return { client, error: null };
    },
  };
});
vi.mock("../../../../packages/api/src/stripe/tenant-client", () => ({
  resolveTenantStripe: async () => ({ ok: true, stripe: {} }),
}));
vi.mock("../../../../packages/api/src/donate/saga", () => ({
  processDonationSagaOutboxEvent: async () => ({ status: "completed" }),
}));
vi.mock("../../../../packages/api/src/donate/begin-gift-intake", () => ({
  beginGiftIntake: async (input: {
    missionaryId: string;
    amountCents: number;
    currency: string;
  }) => ({ ok: true, ...(await s.intake!(input)) }),
}));
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const FORBIDDEN = /Legal Rowan|Profile Rowan|Party Rowan|Party Xu|Profile Vale/;
const PRIVATE_WORKER_COLUMNS = [
  "phone",
  "birth_date",
  "location",
  "region",
  "timezone",
  "social_links",
  "health_status",
  "health_signals",
  "last_check_in",
  "manual_attention",
  "party_id",
  "profile_id",
  "legal_entity_id",
  "import_batch_id",
  "tagline",
];

const PEOPLE = [
  "admin",
  "staffB",
  "donor",
  "claimed",
  "missionary",
  "giver",
] as const;
const WORKERS = ["W", "V", "X"] as const;
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
        await db.query(
          "insert into public.donations (id, tenant_id, donor_id, missionary_id, amount, status, gift_date) values ($1, $4, $5, $6, 1000, 'completed', now()), ($2, $4, $5, $7, 2000, 'completed', now() - interval '1 minute'), ($3, $4, $5, $8, 500, 'pending', now() - interval '2 minutes')",
          [ids.gW, ids.gV, ids.gX, TA, ids.dGiver, ids.mW, ids.mV, ids.mX],
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
        expect(error.message, `${method} ${JSON.stringify(payload)}`).toBe(
          "permission denied for table parties",
        );
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

    describe("AL-2678 r1: a worker's name outside Mission Control (plan :1003)", () => {
      const serviceClient = () =>
        createClient(url!, service!, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
      const asDonor = (): AuthContext =>
        ({
          userId: user.giver,
          email: null,
          tenantId: TA,
          role: "donor",
          memberships: membershipsForRole("donor", TA),
          profileId: user.giver,
          isAuthenticated: true,
        }) as AuthContext;

      beforeAll(async () => {
        const restricted = await as(
          "admin",
          "rest/v1/rpc/set_worker_identity",
          {
            body: {
              p_tenant_id: TA,
              p_party_id: ids.pW,
              p_legal_name: "Legal Rowan",
              p_real_country: null,
              p_precise_location: null,
              p_display_name: null,
              p_security_level: "restricted",
              p_public_alias: "Cedar",
              p_reason: "Field security",
            },
          },
        );
        expect(restricted.status, JSON.stringify(await body(restricted))).toBe(
          200,
        );
        await db!.query("begin");
        try {
          await db!.query(
            "alter table public.parties disable trigger parties_alias_check",
          );
          await db!.query(
            "update public.parties set security_level = 'restricted', security_level_source = 'manual' where id = $1",
            [ids.pX],
          );
          await db!.query(
            "alter table public.parties enable trigger parties_alias_check",
          );
          await db!.query("commit");
        } catch (error) {
          await db!.query("rollback");
          throw error;
        }
      });

      it("with the service key the computed columns give the alias for a restricted worker, the Party name for an unrestricted one and null for a restricted worker without an alias; a post's author the same; no body holds a forbidden name", async () => {
        const workers = await api(
          `rest/v1/missionaries?select=id,worker_public_name&id=in.(${ids.mW},${ids.mV},${ids.mX})`,
          { key: service, bearer: service },
        );
        const workerRows = await body(workers);
        expect(workers.status, JSON.stringify(workerRows)).toBe(200);
        expect(
          Object.fromEntries(
            workerRows.map(
              (r: { id: string; worker_public_name: string | null }) => [
                r.id,
                r.worker_public_name,
              ],
            ),
          ),
        ).toEqual({
          [ids.mW!]: "Cedar",
          [ids.mV!]: "Party Vale",
          [ids.mX!]: null,
        });
        const posts = await api(
          `rest/v1/posts?select=id,post_author_public_name&id=in.(${ids.postW},${ids.postX})`,
          { key: service, bearer: service },
        );
        const postRows = await body(posts);
        expect(posts.status, JSON.stringify(postRows)).toBe(200);
        expect(
          Object.fromEntries(
            postRows.map(
              (r: { id: string; post_author_public_name: string | null }) => [
                r.id,
                r.post_author_public_name,
              ],
            ),
          ),
        ).toEqual({ [ids.postW!]: "Cedar", [ids.postX!]: null });
        expect(JSON.stringify([workerRows, postRows])).not.toMatch(FORBIDDEN);
      });

      it("anonymous, a donor and a staff member reach neither computed column nor its function: as a column, and over rpc with valid row arguments that the service key's call binds and answers (B4), each is refused 42501, and no name comes back", async () => {
        const rpcCalls = (): [string, Record<string, unknown>][] => [
          ["worker_public_name", { p_worker: { id: ids.mW, tenant_id: TA } }],
          [
            "post_author_public_name",
            {
              p_post: { id: ids.postW, tenant_id: TA, missionary_id: worker.W },
            },
          ],
        ];
        for (const [fn, args] of rpcCalls()) {
          const served = await api(`rest/v1/rpc/${fn}`, {
            key: service,
            bearer: service,
            body: args,
          });
          expect(
            [served.status, await body(served)],
            `service key rpc ${fn} binds the row argument`,
          ).toEqual([200, "Cedar"]);
        }
        const callers: [
          string,
          (path: string, init?: { body?: unknown }) => Promise<Response>,
        ][] = [
          ["anon", (path, init = {}) => api(path, init)],
          ["donor", (path, init = {}) => as("giver", path, init)],
          ["staff", (path, init = {}) => as("admin", path, init)],
        ];
        for (const [label, call] of callers) {
          const workers = await call(
            `rest/v1/missionaries?select=id,worker_public_name&id=eq.${ids.mW}`,
          );
          const refused = await body(workers);
          expect(workers.status, `${label} missionaries`).toBe(
            label === "anon" ? 401 : 403,
          );
          expect(
            [refused.code, refused.message],
            `${label} missionaries`,
          ).toEqual(["42501", "permission denied for table missionaries"]);
          const posts = await call(
            `rest/v1/posts?select=id,post_author_public_name&id=eq.${ids.postW}`,
          );
          const postBody = await body(posts);
          expect(
            posts.status,
            `${label} posts ${JSON.stringify(postBody)}`,
          ).toBe(label === "anon" ? 401 : 403);
          expect([postBody.code, postBody.message], `${label} posts`).toEqual([
            "42501",
            "permission denied for function post_author_public_name",
          ]);
          for (const [fn, args] of rpcCalls()) {
            const rpc = await call(`rest/v1/rpc/${fn}`, { body: args });
            const rpcBody = await body(rpc);
            expect(rpc.status, `${label} rpc ${fn}`).toBe(
              label === "anon" ? 401 : 403,
            );
            expect(
              [rpcBody.code, rpcBody.message],
              `${label} rpc ${fn}`,
            ).toEqual(["42501", `permission denied for function ${fn}`]);
          }
          expect(JSON.stringify([refused, postBody])).not.toMatch(FORBIDDEN);
        }
      });

      it("the donor portal's own code names W by the alias and V by the Party name on gifts, recurring gifts, a receipt's gift and a statement's gifts, and a gift to X as Missionary support; no response holds a forbidden name", async () => {
        const client = serviceClient();
        const snapshot = await getDonorPortalSnapshot({
          supabaseAdmin: client as never,
          profileId: user.giver,
          tenantId: TA,
        });
        expect(
          snapshot.donations.map((g) => [
            g.id,
            g.designation.name,
            g.missionary?.name,
          ]),
        ).toEqual([
          [ids.gW, "Cedar", "Cedar"],
          [ids.gV, "Party Vale", "Party Vale"],
          [ids.gX, "Missionary support", "Missionary support"],
        ]);
        expect(
          Object.fromEntries(
            snapshot.recurringGifts.map((g) => [
              g.id,
              [g.designation.name, g.missionary?.name],
            ]),
          ),
        ).toEqual({
          [ids.plW!]: ["Cedar", "Cedar"],
          [ids.plV!]: ["Party Vale", "Party Vale"],
        });
        const context = await resolveDonorPortalContext(
          client as never,
          user.giver,
          TA,
        );
        const named = (rows: Awaited<ReturnType<typeof getOwnedDonation>>[]) =>
          buildDonorPortalSnapshot({
            profile: context.profile,
            donor: context.donor,
            donations: rows,
            pledges: [],
            feedPreferences: null,
          }).donations.map((g) => [g.id, g.designation.name]);
        const receipts = [];
        for (const [gift, name] of [
          [ids.gW!, "Cedar"],
          [ids.gV!, "Party Vale"],
        ] as const) {
          const row = await getOwnedDonation({
            supabaseAdmin: client as never,
            donationId: gift,
            donorId: ids.dGiver!,
            tenantId: TA,
          });
          expect(row.missionary?.worker_public_name).toBe(name);
          expect(named([row])).toEqual([[gift, name]]);
          receipts.push(row);
        }
        const statement = await getOwnedStatementDonations({
          supabaseAdmin: client as never,
          donorId: ids.dGiver!,
          tenantId: TA,
          year: new Date().getUTCFullYear(),
        });
        expect(
          statement.map((row) => [row.id, row.missionary?.worker_public_name]),
        ).toEqual([
          [ids.gV, "Party Vale"],
          [ids.gW, "Cedar"],
        ]);
        expect(named(statement)).toEqual([
          [ids.gV, "Party Vale"],
          [ids.gW, "Cedar"],
        ]);
        expect(JSON.stringify([snapshot, receipts, statement])).not.toMatch(
          FORBIDDEN,
        );
      });

      it("the feed's exported select names W's post Cedar and X's post Missionary; GET /api/donations gives the worker's public name and a profile of only id and avatar_url; GraphQL gives Missionary.publicName; no response holds a forbidden name", async () => {
        const client = serviceClient();
        const feed = await client
          .from("posts")
          .select(FEED_POST_SELECT)
          .in("id", [ids.postW!, ids.postX!]);
        expect(feed.error, JSON.stringify(feed.error)).toBeNull();
        expect(
          Object.fromEntries(
            (feed.data ?? []).map((post) => [
              (post as { id: string }).id,
              postAuthorName(post as never),
            ]),
          ),
        ).toEqual({ [ids.postW!]: "Cedar", [ids.postX!]: "Missionary" });
        for (const post of feed.data ?? [])
          expect(
            Object.keys((post as { author: object }).author).sort(),
          ).toEqual(["avatar_url", "id"]);

        s.auth = asDonor();
        const rest = await getDonations(
          new NextRequest("http://localhost/api/donations", { method: "GET" }),
        );
        const restBody = (await rest.json()) as {
          donations?: Array<{
            id: string;
            missionary: { worker_public_name: string | null; profile: object };
          }>;
        };
        expect(rest.status, JSON.stringify(restBody)).toBe(200);
        const byGift = Object.fromEntries(
          (restBody.donations ?? []).map((d) => [d.id, d.missionary]),
        );
        expect(byGift[ids.gW!]?.worker_public_name).toBe("Cedar");
        expect(byGift[ids.gV!]?.worker_public_name).toBe("Party Vale");
        expect(byGift[ids.gX!]?.worker_public_name).toBeNull();
        for (const missionary of Object.values(byGift))
          expect(Object.keys(missionary.profile).sort()).toEqual([
            "avatar_url",
            "id",
          ]);

        const graph = await createGraphQLHandler().POST(
          new Request("http://localhost/api/graphql", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              query:
                "{ myDonations(limit: 10) { id missionary { id publicName profile { id } } } }",
            }),
          }),
        );
        const graphBody = (await graph.json()) as {
          data?: {
            myDonations: Array<{
              id: string;
              missionary: {
                publicName: string | null;
                profile: { id: string };
              };
            }>;
          };
          errors?: unknown;
        };
        expect(
          graphBody.errors,
          JSON.stringify(graphBody.errors),
        ).toBeUndefined();
        expect(
          Object.fromEntries(
            graphBody.data!.myDonations.map((d) => [
              d.id,
              d.missionary.publicName,
            ]),
          ),
        ).toEqual({
          [ids.gW!]: "Cedar",
          [ids.gV!]: "Party Vale",
          [ids.gX!]: null,
        });
        expect(JSON.stringify([feed.data, restBody, graphBody])).not.toMatch(
          FORBIDDEN,
        );
      });

      it("a donor's GET /api/donations carries none of a restricted worker's private columns (Q4)", async () => {
        s.auth = asDonor();
        const rest = await getDonations(
          new NextRequest("http://localhost/api/donations", { method: "GET" }),
        );
        const restBody = (await rest.json()) as {
          donations?: Array<{
            id: string;
            missionary: Record<string, unknown>;
          }>;
        };
        expect(rest.status, JSON.stringify(restBody)).toBe(200);
        const worker = (restBody.donations ?? []).find(
          (d) => d.id === ids.gW,
        )!.missionary;
        expect(worker.worker_public_name).toBe("Cedar");
        for (const d of restBody.donations ?? [])
          expect(
            PRIVATE_WORKER_COLUMNS.filter((c) => c in d.missionary),
            d.id,
          ).toEqual([]);
        expect(JSON.stringify(restBody)).not.toMatch(
          /\+15555550101|1981-02-02|Another place/,
        );
      });

      it("GraphQL names a worker with no profile by its public name and a null profile, without an error (F8)", async () => {
        s.auth = asDonor();
        const graph = await createGraphQLHandler().POST(
          new Request("http://localhost/api/graphql", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              query: `{ missionary(id: "${ids.mN}") { id publicName profile { id } } }`,
            }),
          }),
        );
        const graphBody = (await graph.json()) as {
          data?: { missionary: unknown };
          errors?: unknown;
        };
        expect(
          graphBody.errors,
          JSON.stringify(graphBody.errors),
        ).toBeUndefined();
        expect(graphBody.data!.missionary).toEqual({
          id: ids.mN,
          publicName: "Party Nell",
          profile: null,
        });
      });

      it("a donor's POST /api/donations returns the gift to a restricted worker with none of its private columns (Q4)", async () => {
        s.auth = asDonor();
        s.intake = async (input) => {
          const inserted = await db!.query(
            "insert into public.donations (tenant_id, donor_id, missionary_id, amount, currency, status) values ($1, $2, $3, $4, $5, 'completed') returning id",
            [
              TA,
              ids.dGiver,
              input.missionaryId,
              input.amountCents,
              input.currency,
            ],
          );
          return {
            donationId: inserted.rows[0].id as string,
            outboxId: randomUUID(),
            replayed: false,
          };
        };
        const created = await postDonation(
          new NextRequest("http://localhost/api/donations", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "idempotency-key": randomUUID(),
            },
            body: JSON.stringify({ missionaryId: ids.mW, amount: 700 }),
          }),
        );
        const body = (await created.json()) as {
          donation: { missionary: Record<string, unknown> } | null;
        };
        expect(created.status, JSON.stringify(body)).toBe(201);
        expect(body.donation!.missionary.worker_public_name).toBe("Cedar");
        expect(
          PRIVATE_WORKER_COLUMNS.filter((c) => c in body.donation!.missionary),
        ).toEqual([]);
        expect(JSON.stringify(body)).not.toMatch(FORBIDDEN);
      });
    });

    it("an unmatched claim start, a random-token redemption, a direct read and a status read through the Data API: the wiring of the claim entries (the four-way equality of matched and unmatched starts is proved in account-claims.realstack)", async () => {
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

    it("each claim entry binds the organization it names to the request's header through the Data API (finding B3; confirmation half B: the lane's exact message, blank and malformed headers, and a caller who holds a redeemed request): start and redeem answer 403 (42501) to a missing, blank, malformed or other organization's header, and the status read answers the redeemed request only under the right header", async () => {
      const mail = `wp5-c-${ids.dClaimed}@example.test`;
      await db!.query(
        `insert into public.account_claim_requests (tenant_id, donor_id, email, requested_by, status, token_sha256, token_expires_at, token_redeemed_at, donor_email_at_issue, resolved_at)
         values ($1, $2, $3, $4, 'verified', $5, now() + interval '1 hour', now(), $3, now())`,
        [TA, ids.dClaimed, mail, user.claimed, randomBytes(32)],
      );
      const statusAs = (headers: Record<string, string>) =>
        api("rest/v1/rpc/account_claim_status", {
          bearer: token.claimed,
          body: { p_tenant_id: TA },
          headers,
        });
      const right = await statusAs({ "x-asym-tenant": TA });
      expect(right.status).toBe(200);
      const rows = await body(right);
      expect(rows).toHaveLength(1);
      expect(Object.keys(rows[0]).sort()).toEqual([
        "created_at",
        "resolved_at",
        "status",
        "updated_at",
      ]);
      expect(rows[0].status).toBe("verified");
      for (const headers of [
        {},
        { "x-asym-tenant": "" },
        { "x-asym-tenant": "not-a-uuid" },
        { "x-asym-tenant": TB },
      ]) {
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
          const error = await body(refused);
          expect(error.code).toBe("42501");
          expect(error.message, `${path} ${JSON.stringify(headers)}`).toBe(
            "tenant_guard: request tenant scope is required and must match command tenant",
          );
        }
        const status = await statusAs(headers);
        expect(status.status, JSON.stringify(headers)).toBe(200);
        expect(await body(status), JSON.stringify(headers)).toEqual([]);
      }
    });
  },
);
