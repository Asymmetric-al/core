import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  accountClosedEvent,
  ageIntake,
  attempt,
  casesOf,
  claim,
  enqueue,
  giftIntake,
  giftOf,
  guardUpdate,
  inTx,
  intakeRow,
  makeDue,
  paymentIntent,
  recordReference,
  report,
  requestRow,
  role,
  seedTwoTenants,
  storeEvent,
  work,
  type Outcome,
  type Side,
} from "./wp8a-rest1-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 2a, item zero (issue 2857 items 1, 2, 4, 13 and 14; real stack, every test rolled back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function eventCases(tenant: string) {
      await role(db, null);
      return (
        await db.query(
          `SELECT c.id, c.kind, c.event_id, c.donation_id, c.payment_object_id,
                  (SELECT count(*)::int FROM public.mission_control_task_links AS l
                    WHERE l.record_type = 'payment_event_case' AND l.record_id = c.id::text) AS links
             FROM public.payment_event_cases AS c WHERE c.tenant_id = $1 ORDER BY c.created_at`,
          [tenant],
        )
      ).rows as Record<string, unknown>[];
    }

    async function coreReplay(tenant: string, eventId: string) {
      await role(db, null);
      await db.query("SET LOCAL ROLE tenant_guard");
      await db.query("SELECT tenant_guard.enter($1)", [tenant]);
      const r = (
        await db.query(
          "SELECT tenant_guard.money_apply_payment_event($1) AS r",
          [eventId],
        )
      ).rows[0].r as Outcome;
      await role(db, null);
      return r;
    }

    async function disconnect(side: Side) {
      const eventId = await accountClosedEvent(db, side);
      await role(db, "service_role");
      const applied = (
        await db.query("SELECT public.apply_account_event($1, 1, NULL) AS r", [
          eventId,
        ])
      ).rows[0].r as Outcome;
      await role(db, null);
      return applied;
    }

    async function parkedCreate(side: Side, outcome: "unknown" | "known") {
      const intake = await giftIntake(db, side);
      const op = (await enqueue(db, side, intake.donationId)).rows[0]!
        .id as string;
      await claim(db, op);
      await report(
        db,
        op,
        1,
        outcome === "unknown"
          ? {
              result: "unknown",
              retry_delay_seconds: 30,
              error_code: "stripe_timeout",
            }
          : {
              result: "not_performed",
              retry_delay_seconds: 30,
              error_code: "stripe_rate_limited",
            },
      );
      return { intake, op };
    }

    it("item 1: a paid event for an intake whose create request a disconnect parked opens one case on that intake, with one task and link, and stages nothing; a replay opens nothing more", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const { intake, op } = await parkedCreate(fx.A, "known");
        expect(await disconnect(fx.A)).toMatchObject({
          status: "disconnected",
        });
        expect(await requestRow(db, op)).toMatchObject({
          status: "parked",
          park_reason: "binding_disconnected",
        });
        const pi = paymentIntent();
        const event = await storeEvent(db, fx.A, {
          pi,
          amount: intake.amount,
          metadata: { asym_operation: op, asym_intake: intake.donationId },
        });
        expect(await work(db, event.id)).toMatchObject({
          outcome: "case_opened",
          kind: "paid_while_parked",
        });
        const cases = await eventCases(fx.A.tenant);
        expect(cases).toEqual([
          expect.objectContaining({
            kind: "paid_while_parked",
            event_id: event.id,
            donation_id: intake.donationId,
            payment_object_id: pi,
            links: 1,
          }),
        ]);
        expect(await giftOf(db, intake.donationId)).toBeUndefined();
        expect(await intakeRow(db, intake.donationId)).toMatchObject({
          status: "pending",
        });
        expect(await coreReplay(fx.A.tenant, event.id)).toMatchObject({
          outcome: "case_opened",
          case_id: cases[0]!.id,
        });
        expect(await eventCases(fx.A.tenant)).toHaveLength(1);
      }));

    it("item 1: a paid event for a parked create whose outcome is unknown stays the evidence of that request's open repair case", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const { intake, op } = await parkedCreate(fx.A, "unknown");
        for (let n = 2; n <= 5; n += 1) {
          await makeDue(db, op);
          await claim(db, op);
          await report(db, op, n, {
            result: "not_performed",
            retry_delay_seconds: 30,
            error_code: "stripe_rate_limited",
          });
        }
        await makeDue(db, op);
        expect(await claim(db, op)).toMatchObject({ outcome: "parked" });
        const [repair] = await casesOf(db, op);
        const caseId = repair!.id as string;
        const event = await storeEvent(db, fx.A, {
          pi: paymentIntent(),
          amount: intake.amount,
          metadata: { asym_operation: op, asym_intake: intake.donationId },
        });
        expect(await work(db, event.id)).toMatchObject({
          outcome: "case_evidence",
          case_id: caseId,
        });
        expect(await eventCases(fx.A.tenant)).toEqual([]);
      }));

    it("item 2: a success after a staff abandonment opens its paid_after_abandon case also when the create request is parked", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const { intake, op } = await parkedCreate(fx.A, "unknown");
        expect(
          (
            await guardUpdate(
              db,
              fx.A.tenant,
              "UPDATE public.donation_saga_outbox SET status = 'parked' WHERE id = $1",
              [op],
            )
          ).ok,
        ).toBe(true);
        const pi = paymentIntent();
        await recordReference(db, intake.donationId, pi);
        expect(
          (
            await guardUpdate(
              db,
              fx.A.tenant,
              "UPDATE public.donations SET status = 'abandoned', abandoned_by = 'staff' WHERE id = $1",
              [intake.donationId],
            )
          ).ok,
        ).toBe(true);
        const event = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        expect(await work(db, event.id)).toMatchObject({
          outcome: "case_opened",
          kind: "paid_after_abandon",
        });
        expect(await eventCases(fx.A.tenant)).toEqual([
          expect.objectContaining({
            kind: "paid_after_abandon",
            donation_id: intake.donationId,
            links: 1,
          }),
        ]);
        expect(await giftOf(db, intake.donationId)).toBeUndefined();
      }));

    it("item 14: the apply's audit row names the cancel requests its update changed", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await giftIntake(db, fx.A);
        const pi = paymentIntent();
        await recordReference(db, intake.donationId, pi);
        await ageIntake(db, intake.donationId, 8);
        await role(db, "service_role");
        const swept = (
          await db.query("SELECT public.abandon_unpaid_intake($1) AS r", [
            intake.donationId,
          ])
        ).rows[0].r as Outcome;
        await role(db, null);
        const event = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        expect(await work(db, event.id)).toMatchObject({
          outcome: "applied",
          status: "completed",
        });
        const audited = (
          await db.query(
            `SELECT details -> 'cancel_requests_abandoned' AS cancels
               FROM public.audit_logs
              WHERE tenant_id = $1 AND resource_id = $2 AND details ? 'cancel_requests_abandoned'`,
            [fx.A.tenant, intake.donationId],
          )
        ).rows;
        expect(audited).toEqual([{ cancels: [swept.cancel_operation_id] }]);
        expect(
          await requestRow(db, swept.cancel_operation_id as string),
        ).toMatchObject({ status: "abandoned" });
      }));

    it("item 4: the database keeps one receipt snapshot per correction and kind: a second of the same kind is refused 23505, the other kind is admitted", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        await role(db, null);
        const donation = (
          await db.query(
            "INSERT INTO public.donations (tenant_id, fund_id, amount, currency, status) VALUES ($1, $2, 2500, 'usd', 'completed') RETURNING id",
            [fx.A.tenant, fx.A.fund],
          )
        ).rows[0].id as string;
        const adjustment = (
          await db.query(
            `INSERT INTO public.contribution_adjustments
               (tenant_id, donation_id, adjustment_type, status, effective_values, reason, source_surface)
             VALUES ($1, $2, 'amount_correction', 'applied', '{"amountCents": 2000}'::jsonb, 'data entry error', 'contribution_hub')
             RETURNING id`,
            [fx.A.tenant, donation],
          )
        ).rows[0].id as string;
        const snapshot = (kind: string) =>
          attempt(
            db,
            `INSERT INTO public.contribution_receipt_snapshots (tenant_id, donation_id, adjustment_id, kind)
             VALUES ($1, $2, $3, $4)`,
            [fx.A.tenant, donation, adjustment, kind],
          );
        expect((await snapshot("pdf")).ok).toBe(true);
        const second = await snapshot("pdf");
        expect([second.ok, second.code]).toEqual([false, "23505"]);
        expect((await snapshot("email")).ok).toBe(true);
      }));

    it("item 13: on donations the field-policy rows say what the grants say: donor and missionary see is_anonymous and abandoned_by as authenticated may select them, and no column authenticated may select is contact data", () =>
      inTx(db, async () => {
        await role(db, null);
        const flags = (
          await db.query(
            `SELECT f.field_key, f.surface, f.visible,
                    has_column_privilege('authenticated', 'public.donations', f.field_key, 'SELECT') AS granted
               FROM public.field_policies AS f
              WHERE f.record_type = 'donations'
                AND f.field_key IN ('is_anonymous', 'abandoned_by')
                AND f.surface IN ('donor', 'missionary')
              ORDER BY f.field_key, f.surface`,
          )
        ).rows as {
          field_key: string;
          surface: string;
          visible: boolean;
          granted: boolean;
        }[];
        expect(flags).toHaveLength(4);
        for (const flag of flags)
          expect([
            flag.field_key,
            flag.surface,
            flag.visible,
            flag.granted,
          ]).toEqual([flag.field_key, flag.surface, true, true]);
        expect(
          (
            await db.query(
              `SELECT DISTINCT f.field_key
                 FROM public.field_policies AS f
                WHERE f.record_type = 'donations'
                  AND f.sensitivity_category::text = 'contact'
                  AND has_column_privilege('authenticated', 'public.donations', f.field_key, 'SELECT')`,
            )
          ).rows,
        ).toEqual([]);
      }));
  },
);
