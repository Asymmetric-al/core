import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  GUARD_TEST_REVOKES,
  existingDonor,
  feeFund,
  giftIntake,
  giftOf,
  pay,
  paymentIntent,
  recordReference,
  removeTwoTenants,
  role,
  seedTwoTenants,
  storeEvent,
  work,
  worker,
  type Fixture,
} from "./wp8a-rest1-harness";
import { loadContributionDetailFromSupabase } from "../../../../packages/api/src/admin/contribution-operations/operations";
import { parseAdminContributionsParams } from "../../../../packages/api/src/admin/contributions/query";
import {
  listAdminContributions,
  summarizeAdminContributions,
} from "../../../../packages/api/src/admin/contributions/service";
import { PATCH as patchStagedGift } from "../../../../packages/api/src/admin/contributions/staged-gifts";
import { GET as getPortal } from "../../../../packages/api/src/donor-portal";
import { readMissionaryGiftHistory } from "../../../../packages/api/src/missionaries/metrics";
import { loadLineBasedGiftLines } from "../../../../packages/api/src/shared/line-based-gifts";
import { membershipsForRole } from "../../../fixtures/auth-memberships";

import type { AuthContext } from "../../../../packages/auth/context";
import type * as AuthModule from "../../../../packages/auth/context";

const url = process.env.WP8A_REST_IT_URL;
const database = process.env.WP8A_REST_IT_DATABASE_URL;
const service = process.env.WP8A_REST_IT_SERVICE_KEY;
const anon = process.env.WP8A_REST_IT_ANON_KEY;
const required = process.env.GITHUB_JOB === "local-supabase";
const ready = [url, database, service, anon].every(Boolean);

const s = vi.hoisted(() => ({ auth: null as unknown }));
vi.mock("@asym/auth/context", async (orig) => ({
  ...(await orig<typeof AuthModule>()),
  getAuthContext: async () => s.auth,
}));
vi.mock("@asym/database/supabase/admin", () => {
  let client: ReturnType<typeof createClient> | undefined;
  return {
    getAdminClient: () => {
      client ??= createClient(
        process.env.WP8A_REST_IT_URL ?? "http://127.0.0.1:1",
        process.env.WP8A_REST_IT_SERVICE_KEY ?? "no-key",
        { auth: { persistSession: false, autoRefreshToken: false } },
      );
      return { client, error: null };
    },
  };
});
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

it.runIf(required && !ready)(
  "local-supabase supplies the stack's URL, database, service key and anon key (fails, never skips)",
  () => expect(ready).toBe(true),
);

type Login = { id: string; email: string; token: string };

describe.skipIf(!ready)(
  "AL-2681 WP8a part 2 rest, PR 1: what a person reads of a line-based gift, through the routes, readers and Data API they use, beside a legacy gift whose reading does not change (closes :1161; :1162 in part; fix round F1, F2, F5, F7, F12; real stack and PostgREST; the fixture commits and is removed in afterAll)",
  () => {
    const db = new pg.Client({ connectionString: database });
    const admin = () =>
      createClient(url!, service!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    let fx: Fixture;
    const ids: Record<string, string> = {};
    const amounts: Record<string, number> = {};
    const logins: Record<string, Login> = {};
    const assignments: Record<string, string> = {};
    const manyGifts: string[] = [];

    async function commit<T>(step: () => Promise<T>) {
      await db.query("BEGIN");
      try {
        const value = await step();
        await role(db, null);
        for (const statement of GUARD_TEST_REVOKES) await db.query(statement);
        await db.query("COMMIT");
        return value;
      } catch (error) {
        await db.query("ROLLBACK");
        throw error;
      }
    }

    async function signedIn(label: string): Promise<Login> {
      const credentials = {
        email: `rest1-reads-${label}-${randomUUID().slice(0, 8)}@example.test`,
        password: randomUUID(),
      };
      const created = await fetch(`${url}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: service!,
          Authorization: `Bearer ${service}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ ...credentials, email_confirm: true }),
      });
      if (!created.ok) throw new Error(`auth user ${label}: ${created.status}`);
      const id = ((await created.json()) as { id: string }).id;
      const login = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: anon!, "content-type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!login.ok) throw new Error(`sign-in ${label}: ${login.status}`);
      const token = ((await login.json()) as { access_token: string })
        .access_token;
      return { id, email: credentials.email, token };
    }

    async function membership(user: string, roleName: string, staff?: string) {
      return (
        await db.query(
          `INSERT INTO authz.memberships (user_id, tenant_id, role, staff_role, is_active)
           VALUES ($1, $2, $3, $4, true) RETURNING id`,
          [user, fx.A.tenant, roleName, staff ?? null],
        )
      ).rows[0].id as string;
    }

    async function linkedParty(user: string, name: string) {
      const party = (
        await db.query(
          "INSERT INTO public.parties (tenant_id, display_name) VALUES ($1, $2) RETURNING id",
          [fx.A.tenant, name],
        )
      ).rows[0].id as string;
      await db.query(
        "INSERT INTO public.account_links (tenant_id, user_id, party_id, linked_via) VALUES ($1, $2, $3, 'account_claim')",
        [fx.A.tenant, user, party],
      );
      return party;
    }

    async function declinedBy(actor: {
      user: string;
      email: string;
      confirmed: boolean;
    }) {
      const intake = await giftIntake(db, fx.A, { actor });
      const pi = paymentIntent();
      await recordReference(db, intake.donationId, pi);
      await work(
        db,
        (
          await storeEvent(db, fx.A, {
            type: "payment_intent.payment_failed",
            pi,
            amount: intake.amount,
          })
        ).id,
      );
      return intake;
    }

    beforeAll(async () => {
      await db.connect();
      fx = await commit(() => seedTwoTenants(db));
      logins.alice = await signedIn("alice");
      logins.missionary = await signedIn("missionary");
      logins.staffer = await signedIn("staffer");
      await commit(async () => {
        ids.login = logins.alice!.id;
        ids.aliceEmail = `rest1-reads-donor-${randomUUID().slice(0, 8)}@example.test`;
        ids.party = await linkedParty(ids.login, "Pat Linked");
        assignments.alice = await membership(ids.login, "donor");
        ids.donor = (
          await db.query(
            "INSERT INTO public.donors (tenant_id, party_id, name, email) VALUES ($1, $2, 'Pat Linked', $3) RETURNING id",
            [fx.A.tenant, ids.party, ids.aliceEmail],
          )
        ).rows[0].id;
        ids.legacy = (
          await db.query(
            "INSERT INTO public.donations (tenant_id, donor_id, fund_id, amount, currency, status, gift_date) VALUES ($1, $2, $3, 2500, 'usd', 'completed', now()) RETURNING id",
            [fx.A.tenant, ids.donor, fx.A.fund],
          )
        ).rows[0].id;
        ids.worker = await worker(db, fx.A, "standard");
        const actor = {
          user: ids.login,
          email: logins.alice!.email,
          confirmed: true,
        };
        const paid = await giftIntake(db, fx.A, {
          actor,
          anonymous: true,
          lines: [{ missionary: ids.worker, amount: 10000 }],
        });
        ids.paid = paid.donationId;
        await pay(db, paid);
        ids.declined = (await declinedBy(actor)).donationId;
        const retried = await giftIntake(db, fx.A, { actor });
        ids.retried = retried.donationId;
        const retriedPi = paymentIntent();
        await recordReference(db, retried.donationId, retriedPi);
        await work(
          db,
          (
            await storeEvent(db, fx.A, {
              type: "payment_intent.payment_failed",
              pi: retriedPi,
              amount: retried.amount,
            })
          ).id,
        );
        await work(
          db,
          (
            await storeEvent(db, fx.A, {
              pi: retriedPi,
              amount: retried.amount,
            })
          ).id,
        );
        const pending = await giftIntake(db, fx.A, { actor });
        ids.pending = pending.donationId;
        const abandoned = await giftIntake(db, fx.A, { actor });
        ids.abandoned = abandoned.donationId;
        await role(db, null);
        await db.query("SET LOCAL session_replication_role = replica");
        await db.query(
          "UPDATE public.donations SET created_at = now() - interval '8 days' WHERE id = $1",
          [ids.abandoned],
        );
        await db.query("SET LOCAL session_replication_role = origin");
        await db.query("SET LOCAL ROLE service_role");
        await db.query("SELECT public.abandon_unpaid_intake($1)", [
          ids.abandoned,
        ]);
        await role(db, null);
        const restricted = await worker(db, fx.A, "restricted");
        const held = await giftIntake(db, fx.A, {
          lines: [{ missionary: restricted, amount: 4000 }],
        });
        ids.held = held.donationId;
        await pay(db, held);
        ids.otherDonor = await existingDonor(db, fx.B, {
          name: "Other Org",
          email: null,
        });

        ids.bee = (
          await db.query(
            "INSERT INTO auth.users (id, email, email_confirmed_at) VALUES (gen_random_uuid(), 'rest1-reads-bee-' || gen_random_uuid() || '@example.test', now()) RETURNING id",
          )
        ).rows[0].id;
        const beeEmail = (
          await db.query("SELECT email FROM auth.users WHERE id = $1", [
            ids.bee,
          ])
        ).rows[0].email as string;
        const attributed = await giftIntake(db, fx.A, {
          actor: { user: ids.bee, email: beeEmail, confirmed: false },
          contact: { email: ids.aliceEmail, first: "Pat", last: "Linked" },
        });
        ids.attributed = attributed.donationId;
        await pay(db, attributed);
        const beeParty = await linkedParty(ids.bee, "Bee Giver");
        await membership(ids.bee, "donor");
        ids.beeDonor = (
          await db.query(
            "INSERT INTO public.donors (tenant_id, party_id, name) VALUES ($1, $2, 'Bee Giver') RETURNING id",
            [fx.A.tenant, beeParty],
          )
        ).rows[0].id;
        const beeActor = { user: ids.bee, email: beeEmail, confirmed: true };
        const relinked = await giftIntake(db, fx.A, { actor: beeActor });
        ids.relinked = relinked.donationId;
        await pay(db, relinked);
        await role(db, null);
        await db.query(
          "UPDATE public.donations SET donor_id = $2 WHERE id = $1",
          [ids.relinked, ids.donor],
        );
        ids.beeDeclined = (await declinedBy(beeActor)).donationId;
        const processing = await giftIntake(db, fx.A, { actor: beeActor });
        ids.beeProcessing = processing.donationId;
        amounts.beeProcessing = processing.amount;
        const processingPi = paymentIntent();
        await recordReference(db, processing.donationId, processingPi);
        await work(
          db,
          (
            await storeEvent(db, fx.A, {
              type: "payment_intent.processing",
              pi: processingPi,
              amount: processing.amount,
            })
          ).id,
        );

        const missionaryParty = await linkedParty(
          logins.missionary!.id,
          "Missionary Login",
        );
        ids.missionaryRow = (
          await db.query(
            "INSERT INTO public.missionaries (tenant_id, legal_entity_id, party_id, profile_id) VALUES ($1, $2, $3, $4) RETURNING id",
            [fx.A.tenant, fx.A.entity, missionaryParty, logins.missionary!.id],
          )
        ).rows[0].id;
        assignments.missionary = await membership(
          logins.missionary!.id,
          "missionary",
        );
        ids.received = (
          await db.query(
            "INSERT INTO public.donations (tenant_id, donor_id, missionary_id, amount, currency, status, gift_date) VALUES ($1, $2, $3, 1500, 'usd', 'completed', now()) RETURNING id",
            [fx.A.tenant, ids.donor, ids.missionaryRow],
          )
        ).rows[0].id;
        assignments.staffer = await membership(
          logins.staffer!.id,
          "staff",
          "development",
        );

        ids.feeFund = await feeFund(db, fx.A);
        const feeCovered = await giftIntake(db, fx.A, {
          lines: [{ amount: 10000 }, { fee: true, amount: 300 }],
        });
        await pay(db, feeCovered);
        ids.feeGift = (await giftOf(db, feeCovered.donationId))!.id as string;
      });
      await commit(async () => {
        for (let n = 0; n < 250; n += 1)
          manyGifts.push(
            (
              await giftIntake(db, fx.B, {
                contact: null,
                lines: Array.from({ length: 5 }, () => ({ amount: 100 })),
              })
            ).donationId,
          );
      });
    }, 300_000);

    afterAll(async () => {
      try {
        if (fx) await removeTwoTenants(db, fx);
        const users = [
          ids.bee,
          ...Object.values(logins).map((login) => login.id),
        ].filter(Boolean);
        if (users.length)
          await db.query("DELETE FROM auth.users WHERE id = ANY($1::uuid[])", [
            users,
          ]);
      } finally {
        await db.end();
      }
    });

    const authFor = (tenant: string, user = ids.login!): AuthContext =>
      ({
        userId: user,
        email: null,
        tenantId: tenant,
        role: "donor",
        memberships: membershipsForRole("donor", tenant),
        profileId: user,
        isAuthenticated: true,
        assignment: {
          assignmentId: "00000000-0000-4000-8000-000000000001",
          userId: user,
          tenantId: tenant,
          revision: "1",
          membershipRole: "donor",
          staffRole: null,
          isTenantAdmin: false,
        },
      }) as AuthContext;

    const financeFor = (tenant: string): AuthContext =>
      ({
        userId: logins.staffer!.id,
        email: null,
        tenantId: tenant,
        role: "staff",
        profileId: logins.staffer!.id,
        isAuthenticated: true,
        memberships: [
          {
            tenantId: tenant,
            role: "staff",
            staffRole: "finance",
            isActive: true,
            isTenantAdmin: false,
          },
        ],
        assignment: {
          assignmentId: "00000000-0000-4000-8000-000000000002",
          userId: logins.staffer!.id,
          tenantId: tenant,
          revision: "1",
          membershipRole: "staff",
          staffRole: "finance",
          isTenantAdmin: false,
        },
      }) as unknown as AuthContext;

    async function portal(tenant: string, user = ids.login!) {
      s.auth = authFor(tenant, user);
      const response = await getPortal(
        new Request("http://localhost/api/donor/portal", {
          headers: { "x-asym-tenant": tenant },
        }) as never,
      );
      return {
        status: response.status,
        body: (await response.json()) as Record<string, unknown>,
      };
    }

    const giftIdsOf = (body: Record<string, unknown>) =>
      (body.portal as { donations: { id: string }[] }).donations
        .map((g) => g.id)
        .sort();

    const asUser = (who: string) =>
      createClient(url!, anon!, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          headers: {
            Authorization: `Bearer ${logins[who]!.token}`,
            "x-asym-tenant": fx.A.tenant,
            "x-asym-assignment": assignments[who]!,
          },
        },
      });

    it("the donor portal (GET /api/donor/portal): a paid line-based gift awaiting review reads Received and is designated from its line by the worker's public name; a declined one reads Failed; a retry on another card is one gift; unpaid and abandoned intakes are absent; the legacy gift reads as before; the anonymous choice does not hide the giver from themself", async () => {
      const { status, body } = await portal(fx.A.tenant);
      expect(status).toBe(200);
      const gifts = (
        body.portal as {
          donations: {
            id: string;
            status: string;
            designation: { type: string; name: string };
          }[];
        }
      ).donations;
      const byId = Object.fromEntries(gifts.map((g) => [g.id, g]));
      expect(Object.keys(byId).sort()).toEqual(
        [
          ids.declined,
          ids.legacy,
          ids.paid,
          ids.retried,
          ids.attributed,
          ids.relinked,
          ids.received,
        ].sort(),
      );
      expect(byId[ids.paid!]).toMatchObject({
        status: "Received",
        designation: { type: "missionary", name: "Field partner" },
      });
      expect(byId[ids.declined!]!.status).toBe("Failed");
      expect(byId[ids.retried!]!.status).toBe("Received");
      expect(byId[ids.legacy!]).toMatchObject({
        status: "Paid",
        designation: { type: "fund" },
      });
    });

    it("F2: a signed-in person sees their own donor's gifts and, of the gifts they made, only those with no donor yet: B's gift attributed to Alice by her email and B's gift moved to Alice by finance are Alice's and not B's; B's declined and processing gifts are B's alone", async () => {
      const alice = await portal(fx.A.tenant, ids.login);
      const bee = await portal(fx.A.tenant, ids.bee);
      expect([alice.status, bee.status]).toEqual([200, 200]);
      expect(giftIdsOf(alice.body)).toEqual(
        expect.arrayContaining([ids.attributed, ids.relinked]),
      );
      expect(giftIdsOf(alice.body)).not.toEqual(
        expect.arrayContaining([ids.beeDeclined]),
      );
      expect(giftIdsOf(alice.body)).not.toEqual(
        expect.arrayContaining([ids.beeProcessing]),
      );
      expect(giftIdsOf(bee.body)).toEqual(
        [ids.beeDeclined, ids.beeProcessing].sort(),
      );
    });

    it("organization B's portal for the same login shows none of A's gifts", async () => {
      const { status } = await portal(fx.B.tenant);
      expect(status).toBe(404);
    });

    it("F1: through the Data API no signed-in person reads which login made a gift or with which address: the attributed donor, the receiving missionary and a staff member each read the row, asking for those columns is refused, and every browser reader's select=* still gets its rows without them", async () => {
      for (const [who, rowId] of [
        ["alice", ids.attributed],
        ["missionary", ids.received],
        ["staffer", ids.attributed],
      ] as const) {
        const client = asUser(who);
        const readable = await client
          .from("donations")
          .select("id")
          .eq("id", rowId!);
        expect([who, readable.error, readable.data]).toEqual([
          who,
          null,
          [{ id: rowId }],
        ]);
        const asked = await client
          .from("donations")
          .select("id, actor_user_id, actor_email, actor_email_confirmed")
          .eq("id", rowId!);
        expect([who, asked.data, asked.error?.code]).toEqual([
          who,
          null,
          "42703",
        ]);
        const star = await client
          .from("donations")
          .select("*")
          .eq("id", rowId!);
        expect([who, star.error, star.data?.length]).toEqual([who, null, 1]);
        for (const key of [
          "actor_user_id",
          "actor_email",
          "actor_email_confirmed",
        ])
          expect(star.data![0]).not.toHaveProperty(key);
        const contacts = await client
          .from("donation_intake_contacts")
          .select("donation_id")
          .limit(1);
        expect([who, contacts.data, contacts.error?.code]).toEqual([
          who,
          null,
          "42501",
        ]);
      }
    });

    it("Mission Control's contribution detail shows a held gift's holds and names the anonymous giver to finance; an abandoned or unpaid intake is not found; organization B gets not found on A's line-based gift", async () => {
      const client = admin();
      const held = await loadContributionDetailFromSupabase({
        supabaseAdmin: client as never,
        tenantId: fx.A.tenant,
        contributionId: ids.held!,
      });
      expect(
        (
          held as {
            stagedGift: {
              holds: { reason: string; resolvedAt: string | null }[];
            };
          }
        ).stagedGift.holds,
      ).toEqual([
        expect.objectContaining({
          reason: "restricted_worker",
          resolvedAt: null,
        }),
      ]);
      const paid = await loadContributionDetailFromSupabase({
        supabaseAdmin: client as never,
        tenantId: fx.A.tenant,
        contributionId: ids.paid!,
      });
      expect(JSON.stringify(paid)).toContain("Pat Linked");
      for (const [tenant, id] of [
        [fx.A.tenant, ids.abandoned],
        [fx.A.tenant, ids.pending],
        [fx.B.tenant, ids.paid],
      ] as const)
        await expect(
          loadContributionDetailFromSupabase({
            supabaseAdmin: client as never,
            tenantId: tenant,
            contributionId: id!,
          }),
        ).rejects.toMatchObject({ status: 404 });
    });

    it("Mission Control's contribution list reads paid and declined line-based gifts and the legacy one, never an unpaid or abandoned intake, and organization B's list has none of them", async () => {
      const client = admin();
      const listed = await listAdminContributions(
        client as never,
        fx.A.tenant,
        parseAdminContributionsParams(new URLSearchParams("limit=100")),
      );
      const listedIds = (
        listed as unknown as { rows: { id: string }[] }
      ).rows.map((c) => c.id);
      for (const id of [
        ids.paid,
        ids.declined,
        ids.retried,
        ids.held,
        ids.legacy,
      ])
        expect(listedIds).toContain(id);
      for (const id of [ids.pending, ids.abandoned])
        expect(listedIds).not.toContain(id);
      const other = await listAdminContributions(
        client as never,
        fx.B.tenant,
        parseAdminContributionsParams(new URLSearchParams("limit=100")),
      );
      expect((other as unknown as { rows: unknown[] }).rows).toEqual([]);
    });

    it("F5: Mission Control's summary counts no unpaid or abandoned line-based intake: the pending count and amount are the processing gift's alone", async () => {
      const summary = await summarizeAdminContributions(
        admin() as never,
        fx.A.tenant,
        parseAdminContributionsParams(new URLSearchParams()),
      );
      expect(summary).toMatchObject({
        pendingCount: 1,
        pendingAmount: amounts.beeProcessing,
      });
    });

    it("F7: finance reviews a fee-covered line-based gift through PATCH /api/admin/contributions/staged-gifts/:id: keeping the fee-cover line as stored is admitted; changing it or leaving it out is refused 400 with nothing written", async () => {
      const allocationsOf = async () =>
        (
          await db.query(
            `SELECT fund_id, amount, missionary_id, memo, is_fee_cover
               FROM public.staged_gift_allocations
              WHERE staged_gift_id = $1 ORDER BY is_fee_cover, line_number`,
            [ids.feeGift],
          )
        ).rows;
      const review = async (allocations: unknown[]) => {
        s.auth = financeFor(fx.A.tenant);
        const response = await patchStagedGift(
          new Request(
            `http://localhost/api/admin/contributions/staged-gifts/${ids.feeGift}`,
            {
              method: "PATCH",
              headers: {
                "content-type": "application/json",
                cookie: "sb-local-auth-token=session",
                "x-asym-tenant": fx.A.tenant,
              },
              body: JSON.stringify({ allocations }),
            },
          ) as never,
        );
        return response.status;
      };
      const before = await allocationsOf();
      expect(
        await review([
          { fundId: fx.A.fund, amount: 10100 },
          { fundId: ids.feeFund, amount: 200 },
        ]),
      ).toBe(400);
      expect(await review([{ fundId: fx.A.fund, amount: 10300 }])).toBe(400);
      expect(await allocationsOf()).toEqual(before);
      expect(
        await review([
          { fundId: fx.A.fund, amount: 10000, memo: "reviewed" },
          { fundId: ids.feeFund, amount: 300 },
        ]),
      ).toBe(200);
      expect(await allocationsOf()).toEqual([
        {
          fund_id: fx.A.fund,
          amount: 10000,
          missionary_id: null,
          memo: "reviewed",
          is_fee_cover: false,
        },
        expect.objectContaining({
          fund_id: ids.feeFund,
          amount: 300,
          missionary_id: null,
          is_fee_cover: true,
        }),
      ]);
    });

    it("F12: the gift-lines read returns every line past the Data API's 1,000-row cap: 250 gifts of five lines are 1,250 lines", async () => {
      const lines = await loadLineBasedGiftLines(
        admin() as never,
        fx.B.tenant,
        manyGifts,
      );
      expect(lines.size).toBe(250);
      expect([...lines.values()].reduce((n, l) => n + l.length, 0)).toBe(1250);
    });

    it("the missionary's gift history and support total leave a line-based gift out until it posts, so neither the anonymous nor any other line-based giver reaches the worker", async () => {
      const history = await readMissionaryGiftHistory(
        admin() as never,
        ids.worker!,
        "2000-01-01T00:00:00Z",
      );
      expect(history.error).toBeNull();
      expect(history.data).toEqual([]);
    });
  },
);
