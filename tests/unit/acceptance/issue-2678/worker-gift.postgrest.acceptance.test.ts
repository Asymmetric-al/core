import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  database,
  required,
  service,
  url,
} from "./identity-keys.postgrest-fixture";
import { POST as donations } from "../../../../packages/api/src/donations";
import { createGraphQLHandler } from "../../../../packages/graphql/handler";
import { membershipsForRole } from "../../../fixtures/auth-memberships";

import type { AuthContext } from "../../../../packages/auth/context";
import type * as AuthModule from "../../../../packages/auth/context";

const s = vi.hoisted(() => ({
  auth: null as unknown,
  payments: [] as string[],
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
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));
vi.mock("../../../../packages/api/src/stripe/tenant-client", () => ({
  resolveTenantStripe: async () => ({
    ok: true,
    stripe: {},
    publishableKey: "pk_test_worker_gift",
  }),
}));
vi.mock("../../../../packages/api/src/donate/saga", () => ({
  processDonationSagaOutboxEvent: async ({
    outboxId,
  }: {
    outboxId: string;
  }) => {
    s.payments.push(outboxId);
    return {
      status: "completed",
      clientSecret: `secret_${outboxId}`,
      paymentIntentId: `pi_${outboxId}`,
    };
  },
}));

const PEOPLE = ["worker", "other", "split"] as const;
type Person = (typeof PEOPLE)[number];

describe.skipIf(!required && ![url, database, service].some(Boolean))(
  "AL-2678 WP5 rest 2a, fix rounds F1 and F5: a gift the call stored is answered as stored on /api/donate, POST /api/donations and GraphQL createDonation, also for a login that reaches its donor through its sole worker row; a key of another person's gift stays refused; a refusal for a donor on another Party leaves an operator's line (real saga, real PostgREST) (D-18, AL-2681 PR 2b: the legacy POST /api/donate is retired, and its leg with it)",
  () => {
    const TA = randomUUID();
    const k = Object.fromEntries(
      [
        "pWorker",
        "pOther",
        "pTo",
        "worker",
        "to",
        "dWorker",
        "dOther",
        "pSplitLink",
        "pSplitOwn",
        "dSplit",
      ].map((key) => [key, randomUUID()]),
    ) as Record<string, string>;
    const user = {} as Record<Person, string>;
    const db = new pg.Client({ connectionString: database });
    const api = (path: string, init: RequestInit) =>
      fetch(`${url}/${path}`, {
        ...init,
        headers: {
          apikey: service!,
          Authorization: `Bearer ${service}`,
          "Content-Type": "application/json",
        },
      });
    const signIn = (who: Person) => {
      s.auth = {
        userId: user[who],
        email: null,
        tenantId: TA,
        role: "donor",
        memberships: membershipsForRole("donor", TA),
        profileId: user[who],
        isAuthenticated: true,
      } as AuthContext;
    };
    const headers = (key: string) => ({
      "content-type": "application/json",
      "idempotency-key": key,
    });

    const viaDonations = async (who: Person, key: string) => {
      signIn(who);
      const response = await donations(
        new NextRequest("http://localhost/api/donations", {
          method: "POST",
          headers: headers(key),
          body: JSON.stringify({ missionaryId: k.to, amount: 2500 }),
        }),
      );
      const body = (await response.json()) as Record<string, unknown>;
      return {
        status: response.status,
        id: (body.donation as { id?: string } | null)?.id,
        body,
      };
    };
    const viaGraphQL = async (who: Person, key: string) => {
      signIn(who);
      const response = await createGraphQLHandler().POST(
        new Request("http://localhost/api/graphql", {
          method: "POST",
          headers: headers(key),
          body: JSON.stringify({
            query: `mutation { createDonation(input: { missionaryId: "${k.to}", amount: 2500 }) { id } }`,
          }),
        }),
      );
      const body = (await response.json()) as {
        data?: { createDonation: { id: string } | null } | null;
        errors?: { message: string; extensions?: { code?: string } }[];
      };
      return {
        status: body.errors?.length
          ? (body.errors[0]!.extensions?.code ?? body.errors[0]!.message)
          : 200,
        id: body.data?.createDonation?.id,
        body,
      };
    };

    const stored = async (key: string) =>
      (
        await db.query<{ donation_id: string; donor_id: string }>(
          `select o.donation_id, d.donor_id
             from public.donation_saga_outbox o
             join public.donations d on d.id = o.donation_id
            where o.tenant_id = $1 and o.idempotency_key = $2`,
          [TA, key],
        )
      ).rows;
    const outboxOf = async (key: string) =>
      (
        await db.query<{ id: string }>(
          "select id from public.donation_saga_outbox where tenant_id = $1 and idempotency_key = $2",
          [TA, key],
        )
      ).rows.map((r) => r.id);

    beforeAll(async () => {
      if (
        !url ||
        !database ||
        !service ||
        ![url, database].every((value) =>
          ["localhost", "127.0.0.1", "[::1]"].includes(new URL(value).hostname),
        )
      )
        throw Error("A disposable local Supabase stack is required");
      for (const who of PEOPLE) {
        const created = await api("auth/v1/admin/users", {
          method: "POST",
          body: JSON.stringify({
            email: `wp5rest2-gift-${who}-${TA}@example.test`,
            password: randomUUID(),
            email_confirm: true,
          }),
        });
        expect(created.ok, `Auth fixture ${who}: ${created.status}`).toBe(true);
        user[who] = (await created.json()).id;
      }
      await db.connect();
      await db.query("begin");
      try {
        await db.query(
          "insert into public.tenants (id, name, slug) values ($1::uuid, 'WP5 rest gift', 'wp5rest2-gift-' || $1::text)",
          [TA],
        );
        await db.query(
          "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'A', 'US', 'usd', 'A')",
          [TA],
        );
        await db.query(
          "delete from authz.memberships where user_id = any($1::uuid[])",
          [Object.values(user)],
        );
        for (const who of PEOPLE)
          await db.query(
            "insert into authz.memberships (id, user_id, tenant_id, role) values ($1, $2, $3, 'donor')",
            [randomUUID(), user[who], TA],
          );
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $4, 'Worker'), ($2, $4, 'Other'), ($3, $4, 'Recipient')",
          [k.pWorker, k.pOther, k.pTo, TA],
        );
        await db.query(
          "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $3, $4, $5, $3), ($2, $3, $6, null, $3)",
          [k.worker, k.to, TA, k.pWorker, user.worker, k.pTo],
        );
        await db.query(
          "insert into public.donors (id, tenant_id, party_id, profile_id, name, email) values ($1, $3, $4, null, 'Worker as donor', null), ($2, $3, $5, $6, 'Other donor', null)",
          [k.dWorker, k.dOther, TA, k.pWorker, k.pOther, user.other],
        );
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $3, 'Split linked'), ($2, $3, 'Split own')",
          [k.pSplitLink, k.pSplitOwn, TA],
        );
        await db.query(
          "insert into public.donors (id, tenant_id, party_id, profile_id, name, email) values ($1, $2, $3, $4, 'Split donor', $5)",
          [
            k.dSplit,
            TA,
            k.pSplitOwn,
            user.split,
            `wp5rest2-gift-split-${TA}@example.test`,
          ],
        );
        await db.query(
          "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'account_claim')",
          [TA, user.split, k.pSplitLink],
        );
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    });

    afterAll(async () => {
      try {
        await db.query("begin");
        for (const table of [
          "donation_saga_outbox",
          "audit_logs",
          "donations",
          "giving_target_entity_locks",
          "account_links",
          "missionaries",
          "donors",
          "parties",
          "legal_entities",
        ])
          await db.query(`delete from public.${table} where tenant_id = $1`, [
            TA,
          ]);
        await db.query("delete from authz.memberships where tenant_id = $1", [
          TA,
        ]);
        await db.query("delete from public.tenants where id = $1", [TA]);
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      } finally {
        await db.end();
        const failures: string[] = [];
        for (const who of PEOPLE)
          if (user[who]) {
            const deleted = await api(`auth/v1/admin/users/${user[who]}`, {
              method: "DELETE",
            });
            if (!deleted.ok) failures.push(`${who}: ${deleted.status}`);
          }
        expect(failures, "auth users the fixture could not delete").toEqual([]);
      }
    });

    const entries = [
      ["POST /api/donations", viaDonations, 409],
      ["GraphQL createDonation", viaGraphQL, "IDEMPOTENCY_KEY_REUSED"],
    ] as const;

    for (const [name, call, refused] of entries) {
      it(`${name}: the worker's gift is stored on the donor of its worker Party and answered as stored, fresh and retried, with one gift and one payment (red: 409 already used)`, async () => {
        const key = `worker-${name}-${randomUUID()}`;
        s.payments = [];
        const fresh = await call("worker", key);
        const retry = await call("worker", key);
        const rows = await stored(key);
        expect(
          {
            fresh: fresh.status,
            retry: retry.status,
            gifts: rows.length,
            donor: rows[0]?.donor_id,
            same: fresh.id !== undefined && fresh.id === retry.id,
            stored: fresh.id === rows[0]?.donation_id,
            payments: [...new Set(s.payments)],
          },
          JSON.stringify({ fresh: fresh.body, retry: retry.body }),
        ).toEqual({
          fresh: name === "POST /api/donations" ? 201 : 200,
          retry: name === "POST /api/donations" ? 201 : 200,
          gifts: 1,
          donor: k.dWorker,
          same: true,
          stored: true,
          payments:
            name === "GraphQL createDonation" ? [] : await outboxOf(key),
        });
      });

      it(`${name}: a key that names another person's gift is still refused, both ways, and runs no payment for it (guard)`, async () => {
        const mine = `other-${name}-${randomUUID()}`;
        const theirs = `worker-own-${name}-${randomUUID()}`;
        expect((await call("other", mine)).id).toBeTruthy();
        s.payments = [];
        const byWorker = await call("worker", mine);
        expect(byWorker.status).toBe(refused);
        expect(byWorker.id).toBeUndefined();
        expect(s.payments).toEqual([]);
        await call("worker", theirs);
        s.payments = [];
        const byOther = await call("other", theirs);
        expect(byOther.status).toBe(refused);
        expect(byOther.id).toBeUndefined();
        expect(s.payments).toEqual([]);
        expect((await stored(mine)).map((r) => r.donor_id)).toEqual([k.dOther]);
      });

      it(`${name}: a login refused because its Party has no donor while it holds one on another Party leaves one line an operator can find, with the organization and login and nothing personal, and reads the same answer (fix round F5; red: no line)`, async () => {
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});
        try {
          const refusal = await call("split", `split-${name}-${randomUUID()}`);
          const logged = spy.mock.calls.map((args) => JSON.stringify(args));
          expect(refusal.status).toBe(
            name === "GraphQL createDonation" ? "MULTIPLE_DONORS" : 409,
          );
          expect(JSON.stringify(refusal.body)).toContain(
            "Multiple donor records for this account",
          );
          expect(
            logged.filter(
              (line) => line.includes(user.split) && line.includes(TA),
            ),
            logged.join("\n"),
          ).toHaveLength(1);
          expect(logged.join("\n")).not.toContain("@example.test");
          expect(logged.join("\n")).not.toContain("Split");
        } finally {
          spy.mockRestore();
        }
        expect(
          (
            await db.query(
              "select count(*)::int n from public.donations where tenant_id = $1 and donor_id = $2",
              [TA, k.dSplit],
            )
          ).rows[0].n,
        ).toBe(0);
      });
    }
  },
);
