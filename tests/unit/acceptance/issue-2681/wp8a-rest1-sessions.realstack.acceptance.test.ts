import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  GUARD_TEST_REVOKES,
  IN_MIGRATE_JOB,
  accountClosedEvent,
  ageIntake,
  claim,
  enqueue,
  giftIntake,
  giftOf,
  holdsOf,
  identityRows,
  intakeRow,
  makeDue,
  pay,
  paymentIntent,
  person,
  recordReference,
  removeTwoTenants,
  report,
  requestRow,
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
  "AL-2681 WP8a part 2 rest, PR 1: two sessions at once (identity serialized, resolution against promotion, revocation, two sweeps, two reviewers, and the fix round's F3, F4 and F9: the sweep, the apply, the disconnect and the worker in one order, the first threshold audited; real stack; each test commits two tenants, closes its sessions, then removes the tenants in its finally)",
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

    const backend = new WeakMap<pg.Client, number>();

    async function opened() {
      const s = await openSession();
      backend.set(s, await pid(s));
      return s;
    }

    const pidOf = (s: pg.Client) => backend.get(s)!;

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

    async function settledOrWaiting(p: Promise<Settled>, waiter: number) {
      let done = false;
      void p.then(() => {
        done = true;
      });
      for (let i = 0; i < 400; i += 1) {
        if (done) return;
        const r = await db.query(
          "SELECT cardinality(pg_blocking_pids($1)) > 0 AS blocked",
          [waiter],
        );
        if (r.rows[0].blocked) return;
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      throw new Error(`backend ${waiter} neither finished nor waited`);
    }

    async function finish(s: pg.Client, result: Settled) {
      await s.query("value" in result ? "COMMIT" : "ROLLBACK");
    }

    async function sweepIn(s: pg.Client, donationId: string) {
      await s.query("BEGIN");
      await s.query("SELECT set_config('app.current_tenant_id', '', true)");
      await s.query("SET LOCAL ROLE service_role");
      return (
        await s.query("SELECT public.abandon_unpaid_intake($1) AS r", [
          donationId,
        ])
      ).rows[0].r as Outcome;
    }

    async function closeIn(s: pg.Client, eventId: string) {
      await s.query("BEGIN");
      await s.query("SELECT set_config('app.current_tenant_id', '', true)");
      await s.query("SET LOCAL ROLE service_role");
      return (
        await s.query("SELECT public.apply_account_event($1, 1, NULL) AS r", [
          eventId,
        ])
      ).rows[0].r as Outcome;
    }

    async function committed(body: (fx: Fixture) => Promise<void>) {
      await db.query("BEGIN");
      const fx = await seedTwoTenants(db);
      await db.query("COMMIT");
      try {
        await body(fx);
      } finally {
        for (const s of sessions.splice(0)) await s.end().catch(() => {});
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

    it("of two reviewers with one expected status, the second is refused 40001 once the first has moved the gift (both as the owner: the race is the writer's lock and status, and no committed grant is needed)", () =>
      committed(async (fx) => {
        const giftId = await commit(async () => {
          const intake = await giftIntake(db, fx.A, {
            lines: [{ amount: 6000 }, { amount: 4000 }],
          });
          await pay(db, intake);
          return (await giftOf(db, intake.donationId))!.id as string;
        });
        const s1 = await openSession();
        const s2 = await openSession();
        const split = JSON.stringify([{ fund_id: fx.A.fund, amount: 10000 }]);
        await s1.query("BEGIN");
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
      }));

    async function cancelsOf(donationId: string) {
      await role(db, null);
      return (
        await db.query(
          `SELECT id, status, park_reason, request_params ->> 'payment_intent' AS pi
             FROM public.donation_saga_outbox
            WHERE donation_id = $1 AND request_kind = 'cancel_payment'`,
          [donationId],
        )
      ).rows as Record<string, unknown>[];
    }

    it("F3: the sweep and an apply naming the intake's queued create request take the request before the intake, so neither waits on the other in a cycle (40P01 before); the sweep waits on the intake's holder and the apply on the sweep (D-18, AL-2681 issue 2857 item 12: who waits on whom is asserted)", () =>
      committed(async (fx) => {
        const { intake, event } = await commit(async () => {
          const i = await giftIntake(db, fx.A);
          const op = (await enqueue(db, fx.A, i.donationId)).rows[0]!
            .id as string;
          await ageIntake(db, i.donationId, 8);
          const e = await storeEvent(db, fx.A, {
            pi: paymentIntent(),
            amount: i.amount,
            metadata: { asym_operation: op, asym_intake: i.donationId },
          });
          return { intake: i, event: e };
        });
        const holder = await opened();
        const sweeper = await opened();
        const applier = await opened();
        await holder.query("BEGIN");
        await holder.query(
          "SELECT 1 FROM public.donations WHERE id = $1 FOR NO KEY UPDATE",
          [intake.donationId],
        );
        const swept = settle(sweepIn(sweeper, intake.donationId));
        await waitsOn(pidOf(sweeper), pidOf(holder));
        const applied = settle(coreIn(applier, fx.A.tenant, event.id));
        await waitsOn(pidOf(applier), pidOf(sweeper));
        await holder.query("ROLLBACK");
        const sweptResult = await swept;
        await finish(sweeper, sweptResult);
        const appliedResult = await applied;
        await finish(applier, appliedResult);
        expect([sweptResult, appliedResult]).toEqual([
          { value: expect.objectContaining({ outcome: "abandoned" }) },
          { value: expect.any(Object) },
        ]);
      }));

    it("F3 and F4: a worker's claim of the queued create request between the sweep's read and its write: the sweep waits for the request, then answers in_flight and closes nothing (23514 provider_request_bad_move before)", () =>
      committed(async (fx) => {
        const { intake, op } = await commit(async () => {
          const i = await giftIntake(db, fx.A);
          const o = (await enqueue(db, fx.A, i.donationId)).rows[0]!
            .id as string;
          await ageIntake(db, i.donationId, 8);
          return { intake: i, op: o };
        });
        const claimer = await opened();
        const sweeper = await opened();
        await claimer.query("BEGIN");
        expect(await claim(claimer, op)).toMatchObject({ outcome: "claimed" });
        const swept = settle(sweepIn(sweeper, intake.donationId));
        await waitsOn(pidOf(sweeper), pidOf(claimer));
        await claimer.query("COMMIT");
        const done = await swept;
        await finish(sweeper, done);
        expect(done).toEqual({
          value: expect.objectContaining({
            outcome: "in_flight",
            donation_id: intake.donationId,
          }),
        });
        expect(await intakeRow(db, intake.donationId)).toMatchObject({
          status: "pending",
          abandoned_by: null,
        });
        expect(await requestRow(db, op)).toMatchObject({ status: "sending" });
      }));

    it("F4: the sweep and the create request's result at once: an intake the sweep closes never holds a PaymentIntent without a cancel request for it", () =>
      committed(async (fx) => {
        const { intake, op } = await commit(async () => {
          const i = await giftIntake(db, fx.A);
          const o = (await enqueue(db, fx.A, i.donationId)).rows[0]!
            .id as string;
          await claim(db, o);
          await ageIntake(db, i.donationId, 8);
          return { intake: i, op: o };
        });
        const sweeper = await opened();
        const recorder = await opened();
        const first = await sweepIn(sweeper, intake.donationId);
        const pi = paymentIntent();
        const recorded = settle(
          (async () => {
            await recorder.query("BEGIN");
            return report(recorder, op, 1, {
              result: "succeeded",
              provider_object_id: pi,
            });
          })(),
        );
        await settledOrWaiting(recorded, pidOf(recorder));
        await sweeper.query("COMMIT");
        const done = await recorded;
        await finish(recorder, done);
        const second = await commit(async () => {
          await db.query(
            "SELECT set_config('app.current_tenant_id', '', true)",
          );
          await role(db, "service_role");
          const r = (
            await db.query("SELECT public.abandon_unpaid_intake($1) AS r", [
              intake.donationId,
            ])
          ).rows[0].r as Outcome;
          await role(db, null);
          return r;
        });
        expect(first).toMatchObject({ outcome: "in_flight" });
        expect(second).toMatchObject({ outcome: "abandoned" });
        const row = await intakeRow(db, intake.donationId);
        expect(row).toMatchObject({
          status: "abandoned",
          stripe_payment_intent_id: pi,
        });
        expect(await cancelsOf(intake.donationId)).toEqual([
          expect.objectContaining({ status: "queued", pi }),
        ]);
      }));

    it("F3: a worker's claim of the queued cancel between the paid apply's read and its write: the apply waits for the request, then completes and leaves the claimed cancel alone (23514 provider_request_bad_move before)", () =>
      committed(async (fx) => {
        const { intake, cancel, event } = await commit(async () => {
          const i = await giftIntake(db, fx.A);
          const pi = paymentIntent();
          await recordReference(db, i.donationId, pi);
          await ageIntake(db, i.donationId, 8);
          await db.query(
            "SELECT set_config('app.current_tenant_id', '', true)",
          );
          await role(db, "service_role");
          const swept = (
            await db.query("SELECT public.abandon_unpaid_intake($1) AS r", [
              i.donationId,
            ])
          ).rows[0].r as Outcome;
          await role(db, null);
          const e = await storeEvent(db, fx.A, { pi, amount: i.amount });
          return {
            intake: i,
            cancel: swept.cancel_operation_id as string,
            event: e,
          };
        });
        const claimer = await opened();
        const applier = await opened();
        await claimer.query("BEGIN");
        expect(await claim(claimer, cancel)).toMatchObject({
          outcome: "claimed",
        });
        const applied = settle(coreIn(applier, fx.A.tenant, event.id));
        await waitsOn(pidOf(applier), pidOf(claimer));
        await claimer.query("COMMIT");
        const done = await applied;
        await finish(applier, done);
        expect(done).toEqual({
          value: expect.objectContaining({
            outcome: "applied",
            status: "completed",
          }),
        });
        expect(await requestRow(db, cancel)).toMatchObject({
          status: "sending",
        });
        expect(await giftOf(db, intake.donationId)).toBeDefined();
      }));

    it("F3: the paid apply on a swept intake and the cancel's result at once both finish (a guard of the order: the apply takes the cancel before the intake, the result takes it first too)", () =>
      committed(async (fx) => {
        const { intake, cancel, event } = await commit(async () => {
          const i = await giftIntake(db, fx.A);
          const pi = paymentIntent();
          await recordReference(db, i.donationId, pi);
          await ageIntake(db, i.donationId, 8);
          await db.query(
            "SELECT set_config('app.current_tenant_id', '', true)",
          );
          await role(db, "service_role");
          const swept = (
            await db.query("SELECT public.abandon_unpaid_intake($1) AS r", [
              i.donationId,
            ])
          ).rows[0].r as Outcome;
          await role(db, null);
          await claim(db, swept.cancel_operation_id as string);
          const e = await storeEvent(db, fx.A, { pi, amount: i.amount });
          return {
            intake: i,
            cancel: swept.cancel_operation_id as string,
            event: e,
          };
        });
        const recorder = await opened();
        const applier = await opened();
        await recorder.query("BEGIN");
        const recorded = await report(recorder, cancel, 1, {
          result: "refused",
          error_code: "payment_intent_unexpected_state",
        });
        const applied = settle(coreIn(applier, fx.A.tenant, event.id));
        await settledOrWaiting(applied, pidOf(applier));
        await recorder.query("COMMIT");
        const done = await applied;
        await finish(applier, done);
        expect(recorded).toMatchObject({ outcome: expect.any(String) });
        expect(done).toEqual({
          value: expect.objectContaining({ outcome: "applied" }),
        });
        expect(await giftOf(db, intake.donationId)).toBeDefined();
      }));

    it("F3: a worker's claim landing between the disconnect's read of its waiting requests and its parking of them: the disconnect parks only the requests it locked and commits (23514 provider_request_bad_move before)", () =>
      committed(async (fx) => {
        const { queued, known, eventId } = await commit(async () => {
          const x = await giftIntake(db, fx.A);
          const q = (await enqueue(db, fx.A, x.donationId)).rows[0]!
            .id as string;
          const y = await giftIntake(db, fx.A);
          const k = (await enqueue(db, fx.A, y.donationId)).rows[0]!
            .id as string;
          await claim(db, k);
          return {
            queued: q,
            known: k,
            eventId: await accountClosedEvent(db, fx.A),
          };
        });
        const holder = await opened();
        const closer = await opened();
        const claimer = await opened();
        await holder.query("BEGIN");
        await holder.query(
          "SELECT 1 FROM public.donation_saga_outbox WHERE id = $1 FOR NO KEY UPDATE",
          [queued],
        );
        const closing = settle(closeIn(closer, eventId));
        await waitsOn(pidOf(closer), pidOf(holder));
        await commit(async () => {
          await report(db, known, 1, {
            result: "not_performed",
            retry_delay_seconds: 30,
            error_code: "stripe_rate_limited",
          });
          await makeDue(db, known);
        });
        await claimer.query("BEGIN");
        expect(await claim(claimer, known)).toMatchObject({
          outcome: "claimed",
          attempt: 2,
        });
        await holder.query("ROLLBACK");
        await settledOrWaiting(closing, pidOf(closer));
        await claimer.query("COMMIT");
        const done = await closing;
        await finish(closer, done);
        expect(done).toEqual({
          value: expect.objectContaining({
            outcome: "applied",
            status: "disconnected",
          }),
        });
        expect(await requestRow(db, queued)).toMatchObject({
          status: "parked",
          park_reason: "binding_disconnected",
        });
        expect(await requestRow(db, known)).toMatchObject({
          status: "sending",
        });
      }));

    it("F3: a sweep's cancel and a disconnect at once: the cancel ends parked and linked to the disconnect task, never left queued on a closed account", () =>
      committed(async (fx) => {
        const { intake, eventId } = await commit(async () => {
          const i = await giftIntake(db, fx.A);
          await recordReference(db, i.donationId, paymentIntent());
          await ageIntake(db, i.donationId, 8);
          return { intake: i, eventId: await accountClosedEvent(db, fx.A) };
        });
        const sweeper = await opened();
        const closer = await opened();
        const swept = await sweepIn(sweeper, intake.donationId);
        const closing = settle(closeIn(closer, eventId));
        await settledOrWaiting(closing, pidOf(closer));
        await sweeper.query("COMMIT");
        const done = await closing;
        await finish(closer, done);
        expect(swept).toMatchObject({ outcome: "abandoned" });
        expect(done).toEqual({
          value: expect.objectContaining({
            outcome: "applied",
            status: "disconnected",
          }),
        });
        const cancels = await cancelsOf(intake.donationId);
        expect(cancels).toEqual([
          expect.objectContaining({
            status: "parked",
            park_reason: "binding_disconnected",
          }),
        ]);
        const links = await db.query(
          `SELECT t.issue_type, l.relationship
             FROM public.mission_control_task_links AS l
             JOIN public.mission_control_tasks AS t ON t.id = l.task_id AND t.tenant_id = l.tenant_id
            WHERE l.record_type = 'donation_saga_outbox' AND l.record_id = $1`,
          [String(cancels[0]!.id)],
        );
        expect(links.rows).toEqual([
          {
            issue_type: "payment_account_disconnected",
            relationship: "provider_request_parked_disconnected",
          },
        ]);
      }));

    it("issue 2857 item 15: the enqueue takes the intake's binding before the intake: while another session holds the binding, the waiting enqueue holds no lock on the intake", () =>
      committed(async (fx) => {
        const intake = await commit(() => giftIntake(db, fx.A));
        const holder = await opened();
        const enqueuer = await opened();
        const prober = await opened();
        await holder.query("BEGIN");
        await holder.query(
          "SELECT 1 FROM public.payment_account_bindings WHERE id = $1 FOR NO KEY UPDATE",
          [fx.A.binding],
        );
        const enqueued = settle(
          (async () => {
            await enqueuer.query("BEGIN");
            await enqueuer.query("SET LOCAL ROLE tenant_guard");
            await enqueuer.query("SELECT tenant_guard.enter($1)", [
              fx.A.tenant,
            ]);
            return (
              await enqueuer.query(
                "SELECT tenant_guard.money_enqueue_payment_request($1) AS r",
                [intake.donationId],
              )
            ).rows[0].r as unknown;
          })(),
        );
        await waitsOn(pidOf(enqueuer), pidOf(holder));
        await prober.query("BEGIN");
        const probe = await prober
          .query(
            "SELECT 1 FROM public.donations WHERE id = $1 FOR NO KEY UPDATE NOWAIT",
            [intake.donationId],
          )
          .then(
            () => "free",
            (error: { code?: string }) => error.code,
          );
        await prober.query("ROLLBACK");
        await holder.query("ROLLBACK");
        const done = await enqueued;
        await finish(enqueuer, done);
        expect(probe).toBe("free");
        expect("value" in done).toBe(true);
      }));

    it("F9: two first writes of the large-gift threshold at once: the second records the first's value as the one it replaced", () =>
      committed(async (fx) => {
        const admin = await commit(async () => {
          await db.query(
            "DELETE FROM public.contribution_approval_policies WHERE tenant_id = $1",
            [fx.A.tenant],
          );
          return staff(db, fx.A, "admin");
        });
        const setIn = async (s: pg.Client, cents: number) => {
          await s.query("BEGIN");
          await s.query(
            `SELECT set_config('request.jwt.claims', $1, true),
                    set_config('request.jwt.claim.sub', '', true),
                    set_config('request.headers', $2, true),
                    set_config('app.current_tenant_id', '', true)`,
            [
              JSON.stringify({ sub: admin.user, role: "authenticated" }),
              JSON.stringify({
                "x-asym-tenant": admin.tenant,
                "x-asym-assignment": admin.assignment,
              }),
            ],
          );
          await s.query("SET LOCAL ROLE authenticated");
          return (
            await s.query(
              "SELECT public.set_large_gift_threshold($1, $2, 'the first threshold') AS r",
              [fx.A.tenant, cents],
            )
          ).rows[0].r as Outcome;
        };
        const s1 = await opened();
        const s2 = await opened();
        await setIn(s1, 10000);
        const second = settle(setIn(s2, 25000));
        await waitsOn(pidOf(s2), pidOf(s1));
        await s1.query("COMMIT");
        const done = await second;
        await finish(s2, done);
        expect("value" in done).toBe(true);
        await role(db, null);
        const audits = await db.query(
          `SELECT details ->> 'before' AS before, details ->> 'after' AS after
             FROM public.audit_logs
            WHERE tenant_id = $1 AND action = 'large_gift_threshold_set'
            ORDER BY created_at, id`,
          [fx.A.tenant],
        );
        expect(audits.rows).toEqual([
          { before: null, after: "10000" },
          { before: "10000", after: "25000" },
        ]);
      }));
  },
);
