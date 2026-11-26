import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  GUARD_TEST_REVOKES,
  IN_MIGRATE_JOB,
  apply,
  claimEvent,
  enqueue,
  inTx,
  lineIntake,
  moneyRows,
  paymentIntent,
  recordReference,
  removeTwoTenants,
  role,
  seedTwoTenants,
  storeEvent,
  syncLease,
  type Fixture,
  type Outcome,
} from "./wp8a-p2r2a-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R2a: two applies on one payment (index 4.1, 4.8; real stack; C7 (b), the two C14 races and B2 commit and remove their own tenants)",
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

    type Settled = { value: Outcome } | { error: unknown };

    async function heldOnLock(
      watcher: pg.Client,
      pid: number,
      early: { settled?: Settled },
      blocker: number,
    ) {
      for (let i = 0; i < 200; i += 1) {
        if (early.settled !== undefined) return false;
        const r = await watcher.query(
          `SELECT a.wait_event_type = 'Lock' AND $2 = ANY(pg_blocking_pids($1)) AS held
             FROM pg_stat_activity AS a WHERE a.pid = $1`,
          [pid, blocker],
        );
        if (r.rows[0]?.held === true) return true;
        await new Promise((done) => setTimeout(done, 25));
      }
      return false;
    }

    function directCore(s: pg.Client, tenant: string, eventId: string) {
      const early: { settled?: Settled } = {};
      const pending: Promise<Settled> = (async () => {
        await s.query("BEGIN");
        await s.query("SET LOCAL ROLE tenant_guard");
        await s.query("SELECT tenant_guard.enter($1)", [tenant]);
        return (
          await s.query(
            "SELECT tenant_guard.money_apply_payment_event($1) AS r",
            [eventId],
          )
        ).rows[0].r as Outcome;
      })().then(
        (value) => ({ value }),
        (error: unknown) => ({ error }),
      );
      void pending.then((settled) => {
        early.settled = settled;
      });
      return { early, pending };
    }

    async function nothingApplied(
      tenant: string,
      donationId: string,
      eventId: string,
    ) {
      await role(db, null);
      return (
        await db.query(
          `SELECT (SELECT count(*) FROM public.payment_observations WHERE event_id = $3)::int AS observations,
                  (SELECT count(*) FROM public.staged_gifts WHERE donation_id = $2)::int AS gifts,
                  (SELECT count(*) FROM public.staged_gift_allocations WHERE tenant_id = $1)::int AS allocations,
                  (SELECT status FROM public.donations WHERE id = $2) AS status,
                  (SELECT count(*) FROM public.audit_logs WHERE tenant_id = $1 AND action = 'payment_applied')::int AS audit,
                  (SELECT count(*) FROM public.mission_control_task_links
                    WHERE record_id = $3::text AND relationship = 'payment_contradiction')::int AS links`,
          [tenant, donationId, eventId],
        )
      ).rows[0] as Record<string, unknown>;
    }

    it("C7 (a): while event 1 holds the account's sync lease, event 2's claim answers account_busy; after event 1 completes, event 2 claims and applies as no_change", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await lineIntake(db, fx.A);
        const pi = paymentIntent();
        await recordReference(db, intake.donationId, pi);
        const e1 = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        const e2 = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        expect(await claimEvent(db, e1.id)).toMatchObject({
          outcome: "claimed",
        });
        expect(await claimEvent(db, e2.id)).toMatchObject({
          claimed: false,
          outcome: "account_busy",
        });
        expect(await apply(db, e1.id, 1)).toMatchObject({ outcome: "applied" });
        expect(await syncLease(db, fx.A)).toBeNull();
        expect(await claimEvent(db, e2.id)).toMatchObject({
          outcome: "claimed",
          attempt: 1,
        });
        expect(await apply(db, e2.id, 1)).toMatchObject({
          outcome: "no_change",
          effect: "succeeded",
        });
        const rows = await moneyRows(db, fx.A.tenant);
        expect([
          rows.observations.length,
          rows.gifts.length,
          rows.audit.length,
        ]).toEqual([1, 1, 1]);
      }));

    it("C7 (b), the adoption race: two committed sessions call tenant_guard.money_apply_payment_event directly, after tenant_guard.enter, on two success events of one payment; the intake's lock serializes them: one applied, one no_change; one terminal observation, one staged gift, one audit row", async () => {
      await db.query("BEGIN");
      const fx: Fixture = await seedTwoTenants(db);
      await db.query("COMMIT");
      try {
        await db.query("BEGIN");
        const intake = await lineIntake(db, fx.A, {
          lines: [{ amount: 7000 }, { amount: 3300 }],
        });
        const pi = paymentIntent();
        await recordReference(db, intake.donationId, pi);
        const e1 = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        const e2 = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        await role(db, null);
        for (const revoke of GUARD_TEST_REVOKES) await db.query(revoke);
        await db.query("COMMIT");

        const [s1, s2, watcher] = [
          await openSession(),
          await openSession(),
          await openSession(),
        ];
        const pid1 = (await s1.query("SELECT pg_backend_pid() AS pid")).rows[0]
          .pid as number;
        const pid2 = (await s2.query("SELECT pg_backend_pid() AS pid")).rows[0]
          .pid as number;
        const coreIn = async (s: pg.Client, eventId: string) => {
          await s.query("BEGIN");
          await s.query("SET LOCAL ROLE tenant_guard");
          await s.query("SELECT tenant_guard.enter($1)", [fx.A.tenant]);
          return s.query(
            "SELECT tenant_guard.money_apply_payment_event($1) AS r",
            [eventId],
          );
        };
        const first = (await coreIn(s1, e1.id)).rows[0].r as Outcome;
        const early: { settled?: { value: Outcome } | { error: unknown } } = {};
        const pending = coreIn(s2, e2.id).then(
          (r) => ({ value: r.rows[0].r as Outcome }),
          (error: unknown) => ({ error }),
        );
        void pending.then((settled) => {
          early.settled = settled;
        });
        expect(await heldOnLock(watcher, pid2, early, pid1)).toBe(true);
        expect(early.settled).toBeUndefined();
        await s1.query("COMMIT");
        const settled = await pending;
        if ("error" in settled) throw settled.error;
        await s2.query("COMMIT");
        expect(first).toMatchObject({
          outcome: "applied",
          status: "completed",
        });
        expect(settled.value).toMatchObject({
          outcome: "no_change",
          effect: "succeeded",
        });
        const rows = await moneyRows(db, fx.A.tenant);
        expect(rows.observations.map((o) => o.effect_kind)).toEqual([
          "succeeded",
        ]);
        expect(rows.gifts).toHaveLength(1);
        expect(rows.allocations).toHaveLength(2);
        expect(rows.audit).toHaveLength(1);
        await role(db, null);
        expect(
          (
            await db.query(
              `SELECT has_table_privilege('tenant_guard', 'public.donations', 'INSERT') AS donations,
                      has_table_privilege('tenant_guard', 'public.donation_intake_lines', 'INSERT') AS lines`,
            )
          ).rows[0],
        ).toEqual({ donations: false, lines: false });
      } finally {
        const open = sessions.splice(0);
        await Promise.all(open.map((s) => s.end().catch(() => {})));
        await db.query("ROLLBACK").catch(() => {});
        await removeTwoTenants(db, fx);
      }
    });

    it("C14 (review finding 1; the operation match): a direct call of the core passes its first contradiction lookup and its direct lookup, and waits on the request's row lock, which a holder session took first; the holder records the event's contradiction through the core (request_queued), links the request through R1a's claim and succeeded report, which records the intake's payment reference, and commits; the call resumes, takes the intake's lock and returns the recorded contradiction: no observation, staged gift, allocation, status change or audit row exists for the event", async () => {
      await db.query("BEGIN");
      const fx: Fixture = await seedTwoTenants(db);
      await db.query("COMMIT");
      try {
        await db.query("BEGIN");
        const intake = await lineIntake(db, fx.A);
        const queued = await enqueue(db, fx.A, intake.donationId);
        expect(queued.ok).toBe(true);
        const operationId = queued.rows[0]!.id as string;
        const pi = paymentIntent();
        const e = await storeEvent(db, fx.A, {
          pi,
          amount: intake.amount,
          metadata: {
            asym_operation: operationId,
            asym_intake: intake.donationId,
          },
        });
        await role(db, null);
        for (const revoke of GUARD_TEST_REVOKES) await db.query(revoke);
        await db.query("COMMIT");

        const [holder, caller, watcher] = [
          await openSession(),
          await openSession(),
          await openSession(),
        ];
        const pid = (await caller.query("SELECT pg_backend_pid() AS pid"))
          .rows[0].pid as number;
        const holderPid = (await holder.query("SELECT pg_backend_pid() AS pid"))
          .rows[0].pid as number;
        await holder.query("BEGIN");
        await holder.query(
          "SELECT id FROM public.donation_saga_outbox WHERE id = $1 FOR NO KEY UPDATE",
          [operationId],
        );
        const call = directCore(caller, fx.A.tenant, e.id);
        expect(await heldOnLock(watcher, pid, call.early, holderPid)).toBe(
          true,
        );

        await holder.query("SET LOCAL ROLE tenant_guard");
        await holder.query("SELECT tenant_guard.enter($1)", [fx.A.tenant]);
        const recorded = (
          await holder.query(
            "SELECT tenant_guard.money_apply_payment_event($1) AS r",
            [e.id],
          )
        ).rows[0].r as Outcome;
        await holder.query("RESET ROLE");
        await holder.query(
          "SELECT pg_catalog.set_config('app.current_tenant_id', '', true)",
        );
        await holder.query("SET LOCAL ROLE service_role");
        const claimed = (
          await holder.query(
            "SELECT public.claim_provider_operation($1, 300) AS r",
            [operationId],
          )
        ).rows[0].r as Outcome;
        const linked = (
          await holder.query(
            "SELECT public.record_provider_operation_result($1, $2, $3::jsonb) AS r",
            [
              operationId,
              claimed.attempt,
              JSON.stringify({ result: "succeeded", provider_object_id: pi }),
            ],
          )
        ).rows[0].r as Outcome;
        await holder.query("COMMIT");
        const settled = await call.pending;
        if ("error" in settled) throw settled.error;
        await caller.query("COMMIT");

        expect(recorded).toMatchObject({
          outcome: "contradiction",
          reason: "request_queued",
        });
        expect(linked).toMatchObject({
          outcome: "linked",
          provider_object_id: pi,
        });
        expect(settled.value).toEqual(recorded);
        expect(
          await nothingApplied(fx.A.tenant, intake.donationId, e.id),
        ).toEqual({
          observations: 0,
          gifts: 0,
          allocations: 0,
          status: "pending",
          audit: 0,
          links: 1,
        });
      } finally {
        const open = sessions.splice(0);
        await Promise.all(open.map((s) => s.end().catch(() => {})));
        await db.query("ROLLBACK").catch(() => {});
        await removeTwoTenants(db, fx);
      }
    });

    it("C14 (review finding 1; the direct lookup): a direct call of the core passes its first contradiction lookup and waits on the intake's row lock, the intake already naming the payment; the holder of that lock writes, as the owner, the payment_contradiction task and link of the event (the state the operation match leaves when a report records the reference after the contradiction) and commits; the call resumes and returns that contradiction, writing nothing", async () => {
      await db.query("BEGIN");
      const fx: Fixture = await seedTwoTenants(db);
      await db.query("COMMIT");
      try {
        await db.query("BEGIN");
        const intake = await lineIntake(db, fx.A);
        const pi = paymentIntent();
        await recordReference(db, intake.donationId, pi);
        const e = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        await role(db, null);
        for (const revoke of GUARD_TEST_REVOKES) await db.query(revoke);
        await db.query("COMMIT");

        const [holder, caller, watcher] = [
          await openSession(),
          await openSession(),
          await openSession(),
        ];
        const pid = (await caller.query("SELECT pg_backend_pid() AS pid"))
          .rows[0].pid as number;
        const holderPid = (await holder.query("SELECT pg_backend_pid() AS pid"))
          .rows[0].pid as number;
        await holder.query("BEGIN");
        await holder.query(
          "SELECT id FROM public.donations WHERE id = $1 FOR NO KEY UPDATE",
          [intake.donationId],
        );
        const call = directCore(caller, fx.A.tenant, e.id);
        expect(await heldOnLock(watcher, pid, call.early, holderPid)).toBe(
          true,
        );
        const task = (
          await holder.query(
            `INSERT INTO public.mission_control_tasks
               (tenant_id, title, description, status, urgency, source_module, issue_type, created_by_kind)
             VALUES ($1, 'Payment event contradicts its intake', 'Recorded by the R2a suite.', 'open', 'high',
                     'payments', 'payment_contradiction', 'system')
             RETURNING id`,
            [fx.A.tenant],
          )
        ).rows[0].id as string;
        await holder.query(
          `INSERT INTO public.mission_control_task_links
             (tenant_id, task_id, record_type, record_id, relationship, metadata)
           VALUES ($1, $2, 'stripe_connect_event', $3, 'payment_contradiction',
                   jsonb_build_object('reason', 'request_queued', 'donation_id', $4::uuid,
                                      'operation_id', NULL, 'payment_object_id', $5::text))`,
          [fx.A.tenant, task, e.id, intake.donationId, pi],
        );
        await holder.query("COMMIT");
        const settled = await call.pending;
        if ("error" in settled) throw settled.error;
        await caller.query("COMMIT");

        expect(settled.value).toEqual({
          outcome: "contradiction",
          reason: "request_queued",
          task_id: task,
          effect: "succeeded",
          payment_object_id: pi,
          donation_id: intake.donationId,
        });
        expect(
          await nothingApplied(fx.A.tenant, intake.donationId, e.id),
        ).toEqual({
          observations: 0,
          gifts: 0,
          allocations: 0,
          status: "pending",
          audit: 0,
          links: 1,
        });
      } finally {
        const open = sessions.splice(0);
        await Promise.all(open.map((s) => s.end().catch(() => {})));
        await db.query("ROLLBACK").catch(() => {});
        await removeTwoTenants(db, fx);
      }
    });

    it("B2 (bot round): the enqueue reads its binding FOR SHARE: while a holder session has moved the binding to restricted and not committed, a committed-session enqueue waits on that row (the holder among its blocking pids); after the holder commits it is 55000 binding_inactive and no request exists", async () => {
      await db.query("BEGIN");
      const fx: Fixture = await seedTwoTenants(db);
      await db.query("COMMIT");
      try {
        await db.query("BEGIN");
        const intake = await lineIntake(db, fx.A);
        await role(db, null);
        for (const revoke of GUARD_TEST_REVOKES) await db.query(revoke);
        await db.query("COMMIT");

        const [holder, caller, watcher] = [
          await openSession(),
          await openSession(),
          await openSession(),
        ];
        const pid = (await caller.query("SELECT pg_backend_pid() AS pid"))
          .rows[0].pid as number;
        const holderPid = (await holder.query("SELECT pg_backend_pid() AS pid"))
          .rows[0].pid as number;
        await holder.query("BEGIN");
        await holder.query(
          "UPDATE public.payment_account_bindings SET status = 'restricted', restricted_at = now() WHERE id = $1",
          [fx.A.binding],
        );
        const early: { settled?: Settled } = {};
        const pending: Promise<Settled> = (async () => {
          await caller.query("BEGIN");
          await caller.query("SET LOCAL ROLE tenant_guard");
          await caller.query("SELECT tenant_guard.enter($1)", [fx.A.tenant]);
          return (
            await caller.query(
              "SELECT tenant_guard.money_enqueue_payment_request($1) AS r",
              [intake.donationId],
            )
          ).rows[0].r as Outcome;
        })().then(
          (value) => ({ value }),
          (error: unknown) => ({ error }),
        );
        void pending.then((settled) => {
          early.settled = settled;
        });
        expect(await heldOnLock(watcher, pid, early, holderPid)).toBe(true);
        await holder.query("COMMIT");
        const settled = await pending;
        await caller.query("ROLLBACK");
        expect("error" in settled).toBe(true);
        const e = (settled as { error: { code?: string; message?: string } })
          .error;
        expect([e.code, e.message]).toEqual(["55000", "binding_inactive"]);
        await role(db, null);
        expect(
          (
            await db.query(
              "SELECT count(*)::int AS n FROM public.donation_saga_outbox WHERE donation_id = $1",
              [intake.donationId],
            )
          ).rows[0].n,
        ).toBe(0);
      } finally {
        const open = sessions.splice(0);
        await Promise.all(open.map((s) => s.end().catch(() => {})));
        await db.query("ROLLBACK").catch(() => {});
        await removeTwoTenants(db, fx);
      }
    });
  },
);
