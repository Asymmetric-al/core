/**
 * WP0 (#2672), council round 2 on stage 1, item B5: the legacy staged-gift
 * edit replaces a gift's allocation split through
 * `public.replace_staged_gift_allocations`. The function takes the status the
 * caller checked and refuses, under the row lock it already takes, when the
 * gift's status is no longer that one, so a refund or a posting that lands
 * between the handler's check and the call leaves the split as it was.
 *
 * Runs against the migrated database named by
 * TENANT_GUARD_IT_ADMIN_DATABASE_URL; without it the block skips, except in
 * the CI `migrate` job, where it fails. Every check makes its own fixtures
 * with fresh IDs. The single-session checks run in one transaction each,
 * rolled back; the race check commits its fixtures and deletes them after.
 */
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";
const FN = "public.replace_staged_gift_allocations";
const CALL = `select ${FN}($1::uuid, $2::uuid, $3::jsonb, $4::text)`;
/** The conflict code the edit handler turns into 409. */
const CHANGED = "40001";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

interface Fixture {
  tenantId: string;
  donationId: string;
  giftId: string;
}

const ORIGINAL_SPLIT = [{ amount: 10_000, memo: "original" }];
const NEW_SPLIT = [
  { amount: 6_000, memo: "new A" },
  { amount: 4_000, memo: "new B" },
];

describe.skipIf(!ADMIN_URL)(
  "WP0 staged-gift allocation replacement checks the gift's status (B5)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const other = new pg.Client({ connectionString: ADMIN_URL });

    beforeAll(async () => {
      await db.connect();
      await other.connect();
    });
    afterAll(async () => {
      await Promise.allSettled([db.end(), other.end()]);
    });

    /** A tenant, a donation, a staged gift in `status` and one allocation. */
    async function makeFixture(
      client: pg.Client,
      status: string,
    ): Promise<Fixture> {
      const tenantId = randomUUID();
      const donationId = randomUUID();
      const giftId = randomUUID();
      await client.query(
        "insert into public.tenants (id, name, slug) values ($1::uuid, 'b5 tenant', 'b5-' || $1::text)",
        [tenantId],
      );
      await client.query(
        "insert into public.donations (id, tenant_id, amount) values ($1, $2, 10000)",
        [donationId, tenantId],
      );
      await client.query(
        "insert into public.staged_gifts (id, tenant_id, donation_id, amount, status) values ($1, $2, $3, 10000, $4)",
        [giftId, tenantId, donationId, status],
      );
      await client.query(
        "insert into public.staged_gift_allocations (tenant_id, staged_gift_id, amount, memo) values ($1, $2, 10000, 'original')",
        [tenantId, giftId],
      );
      return { tenantId, donationId, giftId };
    }

    async function split(client: pg.Client, giftId: string) {
      const { rows } = await client.query(
        "select amount::int, memo from public.staged_gift_allocations where staged_gift_id = $1 order by amount desc",
        [giftId],
      );
      return rows;
    }

    /** One check = one transaction, always rolled back. */
    async function tx(fn: () => Promise<void>) {
      await db.query("begin");
      try {
        await fn();
      } finally {
        await db.query("rollback");
      }
    }

    /**
     * Calls the function as service_role, the only role granted EXECUTE, in
     * a savepoint, so a refusal leaves the transaction usable. Returns the
     * SQLSTATE of a refusal, or null.
     */
    async function callAsService(
      fixture: Fixture,
      expectedStatus: string | null,
    ): Promise<string | null> {
      // Hosted Supabase gives service_role write access to public tables;
      // the compat bootstrap mirrors only SELECT. Grant what the function
      // touches, inside the rolled-back transaction, so a refusal can only
      // come from the function's own check.
      await db.query(
        "grant select, update on public.staged_gifts to service_role; grant select, insert, delete on public.staged_gift_allocations to service_role",
      );
      await db.query("savepoint call");
      await db.query("set local role service_role");
      try {
        await db.query(CALL, [
          fixture.tenantId,
          fixture.giftId,
          JSON.stringify(NEW_SPLIT),
          expectedStatus,
        ]);
        await db.query("release savepoint call");
        await db.query("reset role");
        return null;
      } catch (error) {
        await db.query("rollback to savepoint call");
        await db.query("reset role");
        return (error as { code?: string }).code ?? "unknown";
      }
    }

    it("has one signature, which takes the checked status, with its owner, search path and grants", async () => {
      const { rows } = await db.query(
        `select pg_get_function_identity_arguments(p.oid) as args,
                pg_get_userbyid(p.proowner) as owner,
                p.prosecdef as definer,
                p.proconfig as config,
                coalesce((select array_agg(e.who order by e.who)
                            from (select case when a.grantee = 0 then 'PUBLIC' else pg_get_userbyid(a.grantee)::text end as who
                                    from aclexplode(p.proacl) a where a.privilege_type = 'EXECUTE') e), '{}')::text[] as executors
           from pg_proc p
          where p.pronamespace = 'public'::regnamespace
            and p.proname = 'replace_staged_gift_allocations'`,
      );
      expect(rows).toEqual([
        {
          args: "p_tenant_id uuid, p_staged_gift_id uuid, p_allocations jsonb, p_expected_status text",
          owner: "postgres",
          definer: false,
          config: ["search_path=public"],
          executors: ["postgres", "service_role"],
        },
      ]);
    });

    it("replaces the split of a gift still in the status the caller checked", () =>
      tx(async () => {
        const fixture = await makeFixture(db, "needs_review");
        expect(await callAsService(fixture, "needs_review")).toBeNull();
        expect(await split(db, fixture.giftId)).toEqual(NEW_SPLIT);
      }));

    it.each(["refunded", "posted", "ready_to_post"])(
      "refuses a gift whose status moved to %s since the check, and keeps its split",
      (moved) =>
        tx(async () => {
          const fixture = await makeFixture(db, "needs_review");
          // The refund, posting or approval lands after the handler checked
          // the gift and before it calls the function.
          await db.query(
            "update public.staged_gifts set status = $2 where id = $1",
            [fixture.giftId, moved],
          );
          expect(await callAsService(fixture, "needs_review")).toBe(CHANGED);
          expect(await split(db, fixture.giftId)).toEqual(ORIGINAL_SPLIT);
        }),
    );

    it("refuses a call that names no checked status", () =>
      tx(async () => {
        const fixture = await makeFixture(db, "needs_review");
        expect(await callAsService(fixture, null)).toBe("22023");
        expect(await split(db, fixture.giftId)).toEqual(ORIGINAL_SPLIT);
      }));

    it("waits on a refund in flight and refuses once it commits: the check runs under the lock", async () => {
      const fixture = await makeFixture(db, "needs_review");
      try {
        // A refund locks the gift and changes its status, not yet committed.
        await other.query("begin");
        await other.query(
          "select 1 from public.staged_gifts where id = $1 for update",
          [fixture.giftId],
        );
        await other.query(
          "update public.staged_gifts set status = 'refunded' where id = $1",
          [fixture.giftId],
        );

        await db.query("begin");
        const { rows: pidRows } = await db.query(
          "select pg_backend_pid() as pid",
        );
        const call = db
          .query(CALL, [
            fixture.tenantId,
            fixture.giftId,
            JSON.stringify(NEW_SPLIT),
            "needs_review",
          ])
          .then(
            () => null,
            (error: { code?: string }) => error.code ?? "unknown",
          );

        // The call waits on the refund's row lock.
        await expect
          .poll(
            async () =>
              (
                await other.query(
                  "select wait_event_type from pg_stat_activity where pid = $1",
                  [pidRows[0].pid],
                )
              ).rows[0]?.wait_event_type,
            { timeout: 10_000 },
          )
          .toBe("Lock");

        await other.query("commit");
        expect(await call).toBe(CHANGED);
        await db.query("rollback");
        expect(await split(db, fixture.giftId)).toEqual(ORIGINAL_SPLIT);
      } finally {
        await other.query("rollback").catch(() => undefined);
        await db.query("rollback").catch(() => undefined);
        // The donation's delete cascades to the gift and its allocations;
        // tenants do not cascade to donations.
        await db.query("delete from public.donations where id = $1", [
          fixture.donationId,
        ]);
        await db.query("delete from public.tenants where id = $1", [
          fixture.tenantId,
        ]);
      }
    });
  },
);
