import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  GUARD_TEST_REVOKES,
  IN_MIGRATE_JOB,
  ageIntake,
  giftIntake,
  giftOf,
  holdsOf,
  identityRows,
  pay,
  paymentIntent,
  person,
  recordReference,
  removeTwoTenants,
  role,
  seedTwoTenants,
  staff,
  storeEvent,
  uniqueEmail,
  worker,
  type Fixture,
  type Outcome,
} from "./wp8a-rest1-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

type Settled =
  { value: unknown } | { error: { code?: string; message?: string } };

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 1: two sessions at once (identity serialized, resolution against promotion, revocation, two sweeps, two reviewers; real stack; each test commits two tenants and removes them in its finally)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const sessions: pg.Client[] = [];
    beforeAll(() => db.connect());
    afterAll(async () => {
      for (const s of sessions) await s.end().catch(() => {});
      await db.end();
    });

    async function openSession() {
      const s = new pg.Client({ connectionString: ADMIN_URL });
      s.on("error", () => {});
      await s.connect();
      sessions.push(s);
      return s;
    }

    async function pid(s: pg.Client) {
      return (await s.query("SELECT pg_backend_pid() AS p")).rows[0]
        .p as number;
    }

    async function waitsOn(waiter: number, holder: number) {
      for (let i = 0; i < 400; i += 1) {
        const r = await db.query(
          "SELECT $2 = ANY(pg_blocking_pids($1)) AS blocked",
          [waiter, holder],
        );
        if (r.rows[0].blocked) return;
        await new Promise((done) => setTimeout(done, 25));
      }
      throw new Error(`backend ${waiter} never waited on ${holder}`);
    }

    function settle(p: Promise<unknown>): Promise<Settled> {
      return p.then(
        (value) => ({ value }),
        (error: { code?: string; message?: string }) => ({ error }),
      );
    }

    async function committed(body: (fx: Fixture) => Promise<void>) {
      await db.query("BEGIN");
      const fx = await seedTwoTenants(db);
      await db.query("COMMIT");
      try {
        await body(fx);
      } finally {
        await role(db, null);
        await db.query("ROLLBACK").catch(() => {});
        for (const statement of GUARD_TEST_REVOKES) await db.query(statement);
        await removeTwoTenants(db, fx);
        await db.query(
          "DELETE FROM auth.users WHERE email LIKE 'rest1-%@example.test'",
        );
      }
    }

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

    async function storedPayment(
      fx: Fixture,
      intake: Awaited<ReturnType<typeof giftIntake>>,
    ) {
      const pi = paymentIntent();
      await recordReference(db, intake.donationId, pi);
      return storeEvent(db, fx.A, { pi, amount: intake.amount });
    }

    async function coreIn(s: pg.Client, tenant: string, eventId: string) {
      await s.query("BEGIN");
      await s.query("SET LOCAL ROLE tenant_guard");
      await s.query("SELECT tenant_guard.enter($1)", [tenant]);
      return (
        await s.query(
          "SELECT tenant_guard.money_apply_payment_event($1) AS r",
          [eventId],
        )
      ).rows[0].r as Outcome;
    }

    it("two success events with one new email at once: one Party and one donor, the second attributed to it (the email lock and the re-select on the winner)", () =>
      committed(async (fx) => {
        const email = uniqueEmail();
        const [e1, e2] = await commit(async () => {
          const a = await giftIntake(db, fx.A, {
            contact: { email, first: "Ann", last: "Lee" },
          });
          const b = await giftIntake(db, fx.A, {
            contact: { email, first: "Ann", last: "Lee" },
          });
          return [await storedPayment(fx, a), await storedPayment(fx, b)];
        });
        const s1 = await openSession();
        const s2 = await openSession();
        const first = await coreIn(s1, fx.A.tenant, e1.id);
        const second = settle(coreIn(s2, fx.A.tenant, e2.id));
        await waitsOn(await pid(s2), await pid(s1));
        await s1.query("COMMIT");
        const done = await second;
        await s2.query("COMMIT");
        expect("value" in done && (done.value as Outcome).donor_id).toBe(
          first.donor_id,
        );
        const rows = await identityRows(db, fx.A.tenant);
        expect(rows.donors.filter((d) => d.email === email)).toHaveLength(1);
        expect(rows.parties).toHaveLength(1);
      }));

    it("two gifts at once for one linked Party without a donor: one donor relationship and one donor membership", () =>
      committed(async (fx) => {
        const { login, e1, e2 } = await commit(async () => {
          const l = await person(db, fx.A, {
            link: true,
            partyName: "Linked Party",
          });
          const a = await giftIntake(db, fx.A, {
            actor: { user: l.user, email: l.email, confirmed: true },
          });
          const b = await giftIntake(db, fx.A, {
            actor: { user: l.user, email: l.email, confirmed: true },
          });
          return {
            login: l,
            e1: await storedPayment(fx, a),
            e2: await storedPayment(fx, b),
          };
        });
        const s1 = await openSession();
        const s2 = await openSession();
        const first = await coreIn(s1, fx.A.tenant, e1.id);
        const second = settle(coreIn(s2, fx.A.tenant, e2.id));
        await waitsOn(await pid(s2), await pid(s1));
        await s1.query("COMMIT");
        const done = await second;
        await s2.query("COMMIT");
        expect("value" in done && (done.value as Outcome).donor_id).toBe(
          first.donor_id,
        );
        const rows = await identityRows(db, fx.A.tenant);
        expect(
          rows.donors.filter((d) => d.party_id === login.party),
        ).toHaveLength(1);
        expect(
          rows.memberships.filter(
            (m) => m.user_id === login.user && m.role === "donor",
          ),
        ).toHaveLength(1);
      }));

    async function heldGiftCommitted(fx: Fixture, reasons = 1) {
      return commit(async () => {
        const lines = [];
        for (let i = 0; i < reasons; i += 1)
          lines.push({
            missionary: await worker(db, fx.A, "restricted"),
            amount: 5000,
          });
        if (reasons > 1) {
          await role(db, null);
          await db.query(
            "INSERT INTO public.contribution_approval_policies (tenant_id, large_gift_threshold_cents) VALUES ($1, 1) ON CONFLICT (tenant_id) DO UPDATE SET large_gift_threshold_cents = 1",
            [fx.A.tenant],
          );
        }
        const intake = await giftIntake(db, fx.A, { lines });
        await pay(db, intake);
        const gift = (await giftOf(db, intake.donationId))!;
        return {
          gift,
          holds: await holdsOf(db, gift.id as string),
          finance: await staff(db, fx.A, "finance"),
        };
      });
    }

    async function resolveIn(
      s: pg.Client,
      fx: Fixture,
      who: Awaited<ReturnType<typeof staff>>,
      holdId: string,
    ) {
      await s.query("BEGIN");
      await s.query(
        `SELECT set_config('request.jwt.claims', $1, true), set_config('request.headers', $2, true)`,
        [
          JSON.stringify({ sub: who.user, role: "authenticated" }),
          JSON.stringify({
            "x-asym-tenant": fx.A.tenant,
            "x-asym-assignment": who.assignment,
          }),
        ],
      );
      await s.query("SET LOCAL ROLE authenticated");
      return (
        await s.query(
          "SELECT public.resolve_gift_hold($1, $2, 'Reviewed the gift') AS r",
          [fx.A.tenant, holdId],
        )
      ).rows[0].r as Outcome;
    }

    async function promoteIn(s: pg.Client, giftId: string) {
      await s.query("BEGIN");
      await s.query(
        "UPDATE public.staged_gifts SET status = 'ready_to_post' WHERE id = $1",
        [giftId],
      );
    }

    it("resolution against promotion: a promotion that waits on a resolution in flight is refused while another hold stays open, and refused again when the resolution rolls back", () =>
      committed(async (fx) => {
        const { gift, holds, finance } = await heldGiftCommitted(fx, 2);
        expect(holds).toHaveLength(2);
        const s1 = await openSession();
        const s2 = await openSession();
        await resolveIn(s1, fx, finance, holds[0]!.id as string);
        const promotion = settle(promoteIn(s2, gift.id as string));
        await waitsOn(await pid(s2), await pid(s1));
        await s1.query("COMMIT");
        const refused = await promotion;
        await s2.query("ROLLBACK");
        expect(
          "error" in refused && [refused.error.code, refused.error.message],
        ).toEqual(["23514", "staged_gift_held"]);
        await resolveIn(s1, fx, finance, holds[1]!.id as string);
        const second = settle(promoteIn(s2, gift.id as string));
        await waitsOn(await pid(s2), await pid(s1));
        await s1.query("ROLLBACK");
        const again = await second;
        await s2.query("ROLLBACK");
        expect("error" in again && again.error.code).toBe("23514");
        expect(
          (await holdsOf(db, gift.id as string)).filter(
            (h) => h.resolved_at === null,
          ),
        ).toHaveLength(1);
      }));

    it("a resolution waits on a revocation of the caller's assignment in another session and is then refused 42501", () =>
      committed(async (fx) => {
        const { holds, finance } = await heldGiftCommitted(fx);
        const s1 = await openSession();
        const s2 = await openSession();
        await s1.query("BEGIN");
        await s1.query(
          "UPDATE authz.memberships SET is_active = false, revoked_at = now() WHERE id = $1",
          [finance.assignment],
        );
        const resolution = settle(
          resolveIn(s2, fx, finance, holds[0]!.id as string),
        );
        await waitsOn(await pid(s2), await pid(s1));
        await s1.query("COMMIT");
        const refused = await resolution;
        await s2.query("ROLLBACK");
        expect("error" in refused && refused.error.code).toBe("42501");
      }));

    it("two sweeps at once abandon the intake once and write one cancel request", () =>
      committed(async (fx) => {
        const intake = await commit(async () => {
          const i = await giftIntake(db, fx.A);
          await recordReference(db, i.donationId, paymentIntent());
          await ageIntake(db, i.donationId, 8);
          return i;
        });
        const s1 = await openSession();
        const s2 = await openSession();
        const sweepIn = async (s: pg.Client) => {
          await s.query("BEGIN");
          await s.query("SET LOCAL ROLE service_role");
          return (
            await s.query("SELECT public.abandon_unpaid_intake($1) AS r", [
              intake.donationId,
            ])
          ).rows[0].r as Outcome;
        };
        const first = await sweepIn(s1);
        const second = settle(sweepIn(s2));
        await waitsOn(await pid(s2), await pid(s1));
        await s1.query("COMMIT");
        const done = await second;
        await s2.query("COMMIT");
        expect(first).toMatchObject({ outcome: "abandoned" });
        expect("value" in done && done.value).toMatchObject({
          outcome: "closed",
          status: "abandoned",
        });
        await role(db, null);
        const requests = await db.query(
          "SELECT request_kind FROM public.donation_saga_outbox WHERE donation_id = $1",
          [intake.donationId],
        );
        expect(requests.rows).toEqual([{ request_kind: "cancel_payment" }]);
      }));

    it("of two reviewers with one expected status, the second is refused 40001 once the first has moved the gift", () =>
      committed(async (fx) => {
        const giftId = await commit(async () => {
          const intake = await giftIntake(db, fx.A, {
            lines: [{ amount: 6000 }, { amount: 4000 }],
          });
          await pay(db, intake);
          return (await giftOf(db, intake.donationId))!.id as string;
        });
        await db.query(
          "GRANT UPDATE ON TABLE public.staged_gifts TO service_role",
        );
        await db.query(
          "GRANT INSERT, DELETE ON TABLE public.staged_gift_allocations TO service_role",
        );
        const s1 = await openSession();
        const s2 = await openSession();
        const split = JSON.stringify([{ fund_id: fx.A.fund, amount: 10000 }]);
        try {
          await s1.query("BEGIN");
          await s1.query("SET LOCAL ROLE service_role");
          await s1.query(
            "UPDATE public.staged_gifts SET status = 'ready_to_post' WHERE id = $1 AND status = 'needs_review'",
            [giftId],
          );
          await s1.query(
            "SELECT public.replace_staged_gift_allocations($1, $2, $3::jsonb, 'ready_to_post')",
            [fx.A.tenant, giftId, split],
          );
          const second = settle(
            (async () => {
              await s2.query("BEGIN");
              await s2.query("SET LOCAL ROLE service_role");
              await s2.query(
                "SELECT public.replace_staged_gift_allocations($1, $2, $3::jsonb, 'needs_review')",
                [fx.A.tenant, giftId, split],
              );
            })(),
          );
          await waitsOn(await pid(s2), await pid(s1));
          await s1.query("COMMIT");
          const refused = await second;
          await s2.query("ROLLBACK");
          expect("error" in refused && refused.error.code).toBe("40001");
        } finally {
          await db.query(
            "REVOKE UPDATE ON TABLE public.staged_gifts FROM service_role",
          );
          await db.query(
            "REVOKE INSERT, DELETE ON TABLE public.staged_gift_allocations FROM service_role",
          );
        }
      }));
  },
);
