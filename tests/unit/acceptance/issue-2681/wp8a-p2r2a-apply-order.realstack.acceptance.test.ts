import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  apply,
  claimEvent,
  core,
  coreOutcome,
  digest,
  eventRow,
  feeFund,
  inTx,
  lineIntake,
  missionary,
  moneyRows,
  paymentIntent,
  recordReference,
  role,
  seedTwoTenants,
  storeEvent,
  succeeded,
  syncLease,
  tryApply,
  work,
  type Fixture,
  type LineIntake,
  type StoredEvent,
} from "./wp8a-p2r2a-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R2a: the apply, order and duplicates (plan :1137; real stack; every test rolls back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function paid(fx: Fixture, options = {}) {
      const intake = await lineIntake(db, fx.A, options);
      const pi = paymentIntent();
      await recordReference(db, intake.donationId, pi);
      return { intake, pi };
    }

    const event = (
      fx: Fixture,
      pi: string,
      type: string,
      created: number,
      intake: LineIntake,
    ) =>
      storeEvent(db, fx.A, {
        type,
        pi,
        amount: intake.amount,
        created,
      });

    const intakeStatus = async (donationId: string) => {
      await role(db, null);
      return (
        await db.query("SELECT status FROM public.donations WHERE id = $1", [
          donationId,
        ])
      ).rows[0]?.status as string;
    };

    it("C1 (:1137): the same event twice: the second claim is terminal; the entry called again with the same attempt returns the stored outcome with replayed: true; the money rows' digest is unchanged", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const { intake, pi } = await paid(fx);
        const e = await storeEvent(db, fx.A, succeeded(pi, intake.amount));
        const first = await work(db, e.id);
        expect(first).toMatchObject({
          outcome: "applied",
          effect: "succeeded",
          status: "completed",
          donation_id: intake.donationId,
          payment_object_id: pi,
          attempt: 1,
          replayed: false,
          event_id: e.id,
          tenant_id: fx.A.tenant,
        });
        const before = digest(await moneyRows(db, fx.A.tenant));
        const second = await claimEvent(db, e.id);
        expect(second).toMatchObject({
          claimed: false,
          terminal: true,
          outcome: "processed",
        });
        const replay = await apply(db, e.id, 1);
        expect(replay).toEqual({ ...first, replayed: true });
        expect(digest(await moneyRows(db, fx.A.tenant))).toBe(before);
        expect((await eventRow(db, e.id)).processing_status).toBe("processed");
        expect(await syncLease(db, fx.A)).toBeNull();
      }));

    it("C2 (:1137): two events with one success: the second is no_change; one success observation, one staged gift with its lines once, one audit row", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const { intake, pi } = await paid(fx, {
          lines: [{ amount: 6000 }, { amount: 4300 }],
        });
        const e1 = await storeEvent(db, fx.A, succeeded(pi, intake.amount));
        const e2 = await storeEvent(db, fx.A, succeeded(pi, intake.amount));
        expect((await work(db, e1.id)).outcome).toBe("applied");
        const second = await work(db, e2.id);
        expect(second).toMatchObject({
          outcome: "no_change",
          effect: "succeeded",
        });
        expect(second.staged_gift_id).toBeUndefined();
        const rows = await moneyRows(db, fx.A.tenant);
        expect(rows.observations.map((o) => o.effect_kind)).toEqual([
          "succeeded",
        ]);
        expect(rows.gifts).toHaveLength(1);
        expect(rows.allocations.map((a) => a.amount)).toEqual(["6000", "4300"]);
        expect(rows.audit).toHaveLength(1);
        expect((await eventRow(db, e2.id)).processing_status).toBe("processed");
      }));

    it("C3 (:1137; Q-F): reordered: a success, then an older processing report, is stale and the intake stays completed; a failure, then an older processing report, is stale; processing, failure, success make one gift", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const a = await paid(fx);
        const success = await event(
          fx,
          a.pi,
          "payment_intent.succeeded",
          2000,
          a.intake,
        );
        const olderProcessing = await event(
          fx,
          a.pi,
          "payment_intent.processing",
          1000,
          a.intake,
        );
        expect((await work(db, success.id)).outcome).toBe("applied");
        expect(await work(db, olderProcessing.id)).toMatchObject({
          outcome: "stale",
          effect: "processing",
          status: "completed",
        });
        expect(await intakeStatus(a.intake.donationId)).toBe("completed");

        const b = await paid(fx);
        const failure = await event(
          fx,
          b.pi,
          "payment_intent.payment_failed",
          2000,
          b.intake,
        );
        const older = await event(
          fx,
          b.pi,
          "payment_intent.processing",
          1000,
          b.intake,
        );
        expect(await work(db, failure.id)).toMatchObject({
          outcome: "applied",
          status: "failed",
        });
        expect(await work(db, older.id)).toMatchObject({
          outcome: "stale",
          status: "failed",
        });
        expect(await intakeStatus(b.intake.donationId)).toBe("failed");

        const c = await paid(fx);
        const steps: string[] = [];
        for (const [type, at] of [
          ["payment_intent.processing", 1000],
          ["payment_intent.payment_failed", 1100],
          ["payment_intent.succeeded", 1200],
        ] as const) {
          const e = await event(fx, c.pi, type, at, c.intake);
          const r = await work(db, e.id);
          steps.push(`${r.outcome} ${r.status}`);
        }
        expect(steps).toEqual([
          "applied processing",
          "applied failed",
          "applied completed",
        ]);
        const rows = await moneyRows(db, fx.A.tenant);
        expect(
          rows.gifts.filter((g) => g.donation_id === c.intake.donationId),
        ).toHaveLength(1);
        expect(rows.gifts).toHaveLength(2);
      }));

    it("C4 (Q-F): a failure and a processing report in the same second: the second applied is stale and the intake keeps the first's status", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const { intake, pi } = await paid(fx);
        const failure = await event(
          fx,
          pi,
          "payment_intent.payment_failed",
          5000,
          intake,
        );
        const processing = await event(
          fx,
          pi,
          "payment_intent.processing",
          5000,
          intake,
        );
        expect((await work(db, failure.id)).status).toBe("failed");
        expect(await work(db, processing.id)).toMatchObject({
          outcome: "stale",
          status: "failed",
        });
        const rows = await moneyRows(db, fx.A.tenant);
        expect(rows.observations.map((o) => o.effect_kind)).toEqual([
          "payment_failed",
          "processing",
        ]);
        expect(rows.audit).toHaveLength(1);
      }));

    it("C12 (index section 6; contributes :1160 and :1161): a failed payment makes the intake failed with no staged gift and no donor; a later success on the same payment makes one gift; a canceled payment is final", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const { intake, pi } = await paid(fx);
        const failed = await event(
          fx,
          pi,
          "payment_intent.payment_failed",
          100,
          intake,
        );
        expect(await work(db, failed.id)).toMatchObject({
          outcome: "applied",
          status: "failed",
        });
        let rows = await moneyRows(db, fx.A.tenant);
        expect(rows.gifts).toEqual([]);
        await role(db, null);
        expect(
          (
            await db.query(
              "SELECT donor_id FROM public.donations WHERE id = $1",
              [intake.donationId],
            )
          ).rows[0].donor_id,
        ).toBeNull();
        const later = await event(
          fx,
          pi,
          "payment_intent.succeeded",
          200,
          intake,
        );
        const done = await work(db, later.id);
        expect(done).toMatchObject({ outcome: "applied", status: "completed" });
        rows = await moneyRows(db, fx.A.tenant);
        expect(rows.gifts).toHaveLength(1);
        expect(rows.gifts[0]).toMatchObject({
          donor_id: null,
          status: "needs_review",
          donor_match_status: "needs_review",
          review_reason: "identity_pending",
        });

        const second = await paid(fx);
        const canceled = await event(
          fx,
          second.pi,
          "payment_intent.canceled",
          100,
          second.intake,
        );
        expect(await work(db, canceled.id)).toMatchObject({
          outcome: "applied",
          effect: "canceled",
          status: "failed",
        });
        const again = await event(
          fx,
          second.pi,
          "payment_intent.canceled",
          300,
          second.intake,
        );
        expect(await work(db, again.id)).toMatchObject({
          outcome: "no_change",
        });
        const processing = await event(
          fx,
          second.pi,
          "payment_intent.processing",
          400,
          second.intake,
        );
        expect(await work(db, processing.id)).toMatchObject({
          outcome: "stale",
        });
        expect(await intakeStatus(second.intake.donationId)).toBe("failed");
      }));

    it("C13: the copy: the allocations equal the intake's lines in number, order, targets, fee flag and amount; the gift carries the intake's tenant, entity, amount, currency, payment and Stripe event, split for more than one line, and no donor or header target", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const fee = await feeFund(db, fx.A);
        const worker = await missionary(db, fx.A);
        const { intake, pi } = await paid(fx, {
          lines: [
            { amount: 5000 },
            { missionary: worker, amount: 4000 },
            { fund: fee, fee: true, amount: 300 },
          ],
        });
        const e = await storeEvent(db, fx.A, succeeded(pi, intake.amount));
        const r = await work(db, e.id);
        const rows = await moneyRows(db, fx.A.tenant);
        expect(rows.gifts).toEqual([
          {
            id: r.staged_gift_id,
            donation_id: intake.donationId,
            legal_entity_id: fx.A.entity,
            amount: "9300",
            currency: "usd",
            status: "needs_review",
            donor_match_status: "needs_review",
            allocation_status: "split",
            review_reason: "identity_pending",
            stripe_payment_intent_id: pi,
            stripe_event_id: e.stripeEventId,
            donor_id: null,
            fund_id: null,
            missionary_id: null,
            intake_format: "line_based",
          },
        ]);
        await role(db, null);
        const lines = (
          await db.query(
            `SELECT line_number, fund_id, missionary_id, is_fee_cover, amount
               FROM public.donation_intake_lines WHERE donation_id = $1 ORDER BY line_number`,
            [intake.donationId],
          )
        ).rows;
        expect(
          rows.allocations.map(({ staged_gift_id, intake_format, ...a }) => {
            expect([staged_gift_id, intake_format]).toEqual([
              r.staged_gift_id,
              "line_based",
            ]);
            return a;
          }),
        ).toEqual(lines);
        expect(rows.audit).toEqual([
          {
            action: "payment_applied",
            resource_type: "donation",
            resource_id: intake.donationId,
            details: {
              event_id: e.id,
              stripe_event_id: e.stripeEventId,
              effect: "succeeded",
              status_before: "pending",
              status_after: "completed",
              staged_gift_id: r.staged_gift_id,
            },
          },
        ]);
        const single = await paid(fx);
        const s = await storeEvent(
          db,
          fx.A,
          succeeded(single.pi, single.intake.amount),
        );
        await work(db, s.id);
        await role(db, null);
        expect(
          (
            await db.query(
              "SELECT allocation_status FROM public.staged_gifts WHERE donation_id = $1",
              [single.intake.donationId],
            )
          ).rows[0].allocation_status,
        ).toBe("single_allocation");
      }));

    it("C14 (index 4.6): re-entry: the core called again on an applied, a stale and a contradicted event returns no_change or the recorded contradiction, writes nothing and raises no 23505", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const { intake, pi } = await paid(fx);
        const applied = await event(
          fx,
          pi,
          "payment_intent.succeeded",
          2000,
          intake,
        );
        const stale = await event(
          fx,
          pi,
          "payment_intent.processing",
          1000,
          intake,
        );
        const contradicted = await event(
          fx,
          pi,
          "payment_intent.canceled",
          3000,
          intake,
        );
        const outcomes: Record<string, unknown>[] = [];
        for (const e of [applied, stale, contradicted] as StoredEvent[])
          outcomes.push(coreOutcome(await core(db, fx.A.tenant, e.id)));
        expect(outcomes.map((o) => `${o.outcome} ${o.reason ?? ""}`)).toEqual([
          "applied ",
          "stale ",
          "contradiction cancel_after_success",
        ]);
        const before = digest(await moneyRows(db, fx.A.tenant));
        const again: Record<string, unknown>[] = [];
        for (const e of [applied, stale, contradicted] as StoredEvent[])
          again.push(coreOutcome(await core(db, fx.A.tenant, e.id)));
        expect(again).toEqual([
          {
            outcome: "no_change",
            effect: "succeeded",
            payment_object_id: pi,
            donation_id: intake.donationId,
            status: "completed",
          },
          {
            outcome: "no_change",
            effect: "processing",
            payment_object_id: pi,
            donation_id: intake.donationId,
            status: "completed",
          },
          outcomes[2],
        ]);
        expect(digest(await moneyRows(db, fx.A.tenant))).toBe(before);
        const attemptOnApplied = await tryApply(db, applied.id, 1);
        expect(attemptOnApplied.ok).toBe(false);
        expect(attemptOnApplied.code).toBe("55000");
      }));
  },
);
