import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  GUARD_TEST_REVOKES,
  existingDonor,
  giftIntake,
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
import { listAdminContributions } from "../../../../packages/api/src/admin/contributions/service";
import { GET as getPortal } from "../../../../packages/api/src/donor-portal";
import { readMissionaryGiftHistory } from "../../../../packages/api/src/missionaries/metrics";
import { membershipsForRole } from "../../../fixtures/auth-memberships";

import type { AuthContext } from "../../../../packages/auth/context";
import type * as AuthModule from "../../../../packages/auth/context";

const url = process.env.WP8A_REST_IT_URL;
const database = process.env.WP8A_REST_IT_DATABASE_URL;
const service = process.env.WP8A_REST_IT_SERVICE_KEY;
const required = process.env.GITHUB_JOB === "local-supabase";

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

it.runIf(required && ![url, database, service].every(Boolean))(
  "local-supabase supplies the stack's URL, database and service key (fails, never skips)",
  () => expect([url, database, service].every(Boolean)).toBe(true),
);

describe.skipIf(![url, database, service].every(Boolean))(
  "AL-2681 WP8a part 2 rest, PR 1: what a person reads of a line-based gift, through the routes and readers they use, beside a legacy gift whose reading does not change (closes :1161; :1162 in part; F12; real stack and PostgREST; the fixture commits and is removed in afterAll)",
  () => {
    const db = new pg.Client({ connectionString: database });
    const admin = () =>
      createClient(url!, service!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    let fx: Fixture;
    const ids: Record<string, string> = {};

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

    beforeAll(async () => {
      await db.connect();
      fx = await commit(() => seedTwoTenants(db));
      await commit(async () => {
        const login = (
          await db.query(
            "INSERT INTO auth.users (id, email, email_confirmed_at) VALUES (gen_random_uuid(), 'rest1-reads-' || gen_random_uuid() || '@example.test', now()) RETURNING id, email",
          )
        ).rows[0] as { id: string; email: string };
        ids.login = login.id;
        ids.party = (
          await db.query(
            "INSERT INTO public.parties (tenant_id, display_name) VALUES ($1, 'Pat Linked') RETURNING id",
            [fx.A.tenant],
          )
        ).rows[0].id;
        await db.query(
          "INSERT INTO public.account_links (tenant_id, user_id, party_id, linked_via) VALUES ($1, $2, $3, 'account_claim')",
          [fx.A.tenant, ids.login, ids.party],
        );
        await db.query(
          "INSERT INTO authz.memberships (user_id, tenant_id, role, is_active) VALUES ($1, $2, 'donor', true)",
          [ids.login, fx.A.tenant],
        );
        ids.donor = (
          await db.query(
            "INSERT INTO public.donors (tenant_id, party_id, name) VALUES ($1, $2, 'Pat Linked') RETURNING id",
            [fx.A.tenant, ids.party],
          )
        ).rows[0].id;
        ids.legacy = (
          await db.query(
            "INSERT INTO public.donations (tenant_id, donor_id, fund_id, amount, currency, status, gift_date) VALUES ($1, $2, $3, 2500, 'usd', 'completed', now()) RETURNING id",
            [fx.A.tenant, ids.donor, fx.A.fund],
          )
        ).rows[0].id;
        ids.worker = await worker(db, fx.A, "standard");
        const actor = { user: ids.login, email: login.email, confirmed: true };
        const paid = await giftIntake(db, fx.A, {
          actor,
          anonymous: true,
          lines: [{ missionary: ids.worker, amount: 10000 }],
        });
        ids.paid = paid.donationId;
        await pay(db, paid);
        const declined = await giftIntake(db, fx.A, { actor });
        ids.declined = declined.donationId;
        const declinedPi = paymentIntent();
        await recordReference(db, declined.donationId, declinedPi);
        await work(
          db,
          (
            await storeEvent(db, fx.A, {
              type: "payment_intent.payment_failed",
              pi: declinedPi,
              amount: declined.amount,
            })
          ).id,
        );
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
      });
    }, 120_000);

    afterAll(async () => {
      try {
        if (fx) await removeTwoTenants(db, fx);
        if (ids.login)
          await db.query("DELETE FROM auth.users WHERE id = $1", [ids.login]);
      } finally {
        await db.end();
      }
    });

    const authFor = (tenant: string): AuthContext =>
      ({
        userId: ids.login,
        email: null,
        tenantId: tenant,
        role: "donor",
        memberships: membershipsForRole("donor", tenant),
        profileId: ids.login,
        isAuthenticated: true,
        assignment: {
          assignmentId: "00000000-0000-4000-8000-000000000001",
          userId: ids.login,
          tenantId: tenant,
          revision: "1",
          membershipRole: "donor",
          staffRole: null,
          isTenantAdmin: false,
        },
      }) as AuthContext;

    async function portal(tenant: string) {
      s.auth = authFor(tenant);
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
        [ids.declined, ids.legacy, ids.paid, ids.retried].sort(),
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

    it("organization B's portal for the same login shows none of A's gifts", async () => {
      const { status } = await portal(fx.B.tenant);
      expect(status).toBe(404);
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
