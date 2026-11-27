import { createHash, randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  MIGRATIONS,
  ageIntake,
  apply,
  attempt,
  casesOf,
  claim,
  claimEvent,
  enqueue,
  failEvent,
  giftIntake,
  giftOf,
  guardUpdate,
  identityRows,
  inTx,
  intakeRow,
  makeDue,
  moneyRows,
  paymentIntent,
  recordReference,
  report,
  role,
  requestRow,
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
  "AL-2681 WP8a part 2 rest, PR 1: unpaid intakes closed, unmatched payments and disconnected accounts parked (closes :1160, :1174; contributes :1154, :1167; W8-R24; rebase Q3; real stack, every test rolled back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function sweep(donationId: string) {
      await role(db, null);
      await db.query("SELECT set_config('app.current_tenant_id', '', true)");
      await role(db, "service_role");
      const r = await attempt(
        db,
        "SELECT public.abandon_unpaid_intake($1) AS r",
        [donationId],
      );
      await role(db, null);
      if (!r.ok) throw new Error(`sweep refused: ${r.code} ${r.message}`);
      return r.rows[0]!.r as Outcome;
    }

    async function requestsOf(donationId: string) {
      await role(db, null);
      return (
        await db.query(
          `SELECT id, request_kind, status, request_params, outcome_unknown, park_reason, attempt_count
             FROM public.donation_saga_outbox WHERE donation_id = $1 ORDER BY request_kind`,
          [donationId],
        )
      ).rows as Record<string, unknown>[];
    }

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

    describe("the sweep", () => {
      it("an intake unpaid for seven days is abandoned by the sweep with one cancel request for its PaymentIntent and no identity; a second sweep is 'closed'; six days is 'not_due'", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const young = await giftIntake(db, fx.A);
          await ageIntake(db, young.donationId, 6);
          expect(await sweep(young.donationId)).toMatchObject({
            outcome: "not_due",
          });
          const intake = await giftIntake(db, fx.A);
          const pi = paymentIntent();
          await recordReference(db, intake.donationId, pi);
          await ageIntake(db, intake.donationId, 8);
          const before = await identityRows(db, fx.A.tenant);
          const swept = await sweep(intake.donationId);
          expect(swept).toMatchObject({
            outcome: "abandoned",
            abandoned_requests: [],
          });
          expect(await intakeRow(db, intake.donationId)).toMatchObject({
            status: "abandoned",
            abandoned_by: "sweep",
            donor_id: null,
          });
          const requests = await requestsOf(intake.donationId);
          expect(requests).toEqual([
            expect.objectContaining({
              id: swept.cancel_operation_id,
              request_kind: "cancel_payment",
              status: "queued",
              request_params: {
                payment_intent: pi,
                cancellation_reason: "abandoned",
              },
            }),
          ]);
          expect(await sweep(intake.donationId)).toMatchObject({
            outcome: "closed",
            status: "abandoned",
          });
          expect(await requestsOf(intake.donationId)).toHaveLength(1);
          expect(await identityRows(db, fx.A.tenant)).toEqual(before);
          const rows = await moneyRows(db, fx.A.tenant);
          expect(rows.gifts).toEqual([]);
        }));

      it("a failed (declined) intake unpaid for seven days is abandoned too; a queued create request is abandoned with it and no cancel is written without a PaymentIntent", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const intake = await giftIntake(db, fx.A);
          const created = await enqueue(db, fx.A, intake.donationId);
          expect(created.ok).toBe(true);
          await ageIntake(db, intake.donationId, 8);
          const swept = await sweep(intake.donationId);
          expect(swept).toMatchObject({
            outcome: "abandoned",
            abandoned_requests: [created.rows[0]!.id],
            cancel_operation_id: null,
          });
          expect(await requestsOf(intake.donationId)).toEqual([
            expect.objectContaining({
              request_kind: "create_payment",
              status: "abandoned",
            }),
          ]);
        }));

      it("F4: the sweep leaves an intake alone while its create request is sending, waiting to retry after an unknown outcome, or parked, and says so (in_flight)", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          for (const target of ["sending", "retry_wait", "parked"] as const) {
            const intake = await giftIntake(db, fx.A);
            const op = (await enqueue(db, fx.A, intake.donationId)).rows[0]!
              .id as string;
            await claim(db, op);
            if (target !== "sending")
              await report(db, op, 1, {
                result: "unknown",
                retry_delay_seconds: 30,
                error_code: "stripe_timeout",
              });
            if (target === "parked")
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
            await ageIntake(db, intake.donationId, 8);
            expect(await sweep(intake.donationId)).toMatchObject({
              outcome: "in_flight",
              donation_id: intake.donationId,
            });
            expect(await intakeRow(db, intake.donationId)).toMatchObject({
              status: "pending",
              abandoned_by: null,
            });
            expect(await requestRow(db, op)).toMatchObject({ status: target });
          }
        }));

      it("a payment after the automatic close still becomes one gift, with its giver, and its queued cancel is abandoned", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const intake = await giftIntake(db, fx.A);
          const pi = paymentIntent();
          await recordReference(db, intake.donationId, pi);
          await ageIntake(db, intake.donationId, 8);
          await sweep(intake.donationId);
          const event = await storeEvent(db, fx.A, {
            pi,
            amount: intake.amount,
          });
          const outcome = await work(db, event.id);
          expect(outcome).toMatchObject({
            outcome: "applied",
            status: "completed",
          });
          expect(outcome.donor_id).toEqual(expect.any(String));
          expect(await intakeRow(db, intake.donationId)).toMatchObject({
            status: "completed",
            abandoned_by: "sweep",
          });
          expect((await moneyRows(db, fx.A.tenant)).gifts).toHaveLength(1);
          expect(await requestsOf(intake.donationId)).toEqual([
            expect.objectContaining({
              request_kind: "cancel_payment",
              status: "abandoned",
            }),
          ]);
          const again = await storeEvent(db, fx.A, {
            pi,
            amount: intake.amount,
          });
          expect(await work(db, again.id)).toMatchObject({
            outcome: "no_change",
          });
          expect((await moneyRows(db, fx.A.tenant)).gifts).toHaveLength(1);
        }));

      it("a payment after a staff abandonment opens one case with one task and link and makes no gift, observation or identity; a replay opens nothing more", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const intake = await giftIntake(db, fx.A);
          const pi = paymentIntent();
          await recordReference(db, intake.donationId, pi);
          const abandoned = await guardUpdate(
            db,
            fx.A.tenant,
            "UPDATE public.donations SET status = 'abandoned', abandoned_by = 'staff' WHERE id = $1",
            [intake.donationId],
          );
          expect(abandoned.ok).toBe(true);
          const before = await identityRows(db, fx.A.tenant);
          const event = await storeEvent(db, fx.A, {
            pi,
            amount: intake.amount,
          });
          const outcome = await work(db, event.id);
          expect(outcome).toMatchObject({
            outcome: "case_opened",
            kind: "paid_after_abandon",
          });
          const cases = await eventCases(fx.A.tenant);
          expect(cases).toEqual([
            expect.objectContaining({
              kind: "paid_after_abandon",
              event_id: event.id,
              donation_id: intake.donationId,
              payment_object_id: pi,
              links: 1,
            }),
          ]);
          const rows = await moneyRows(db, fx.A.tenant);
          expect([rows.gifts, rows.observations]).toEqual([[], []]);
          expect(await intakeRow(db, intake.donationId)).toMatchObject({
            status: "abandoned",
            donor_id: null,
          });
          expect(await identityRows(db, fx.A.tenant)).toEqual(before);
          await role(db, null);
          await db.query("SET LOCAL ROLE tenant_guard");
          await db.query("SELECT tenant_guard.enter($1)", [fx.A.tenant]);
          const replay = (
            await db.query(
              "SELECT tenant_guard.money_apply_payment_event($1) AS r",
              [event.id],
            )
          ).rows[0].r;
          await role(db, null);
          expect(replay).toMatchObject({
            outcome: "case_opened",
            case_id: cases[0]!.id,
          });
          expect(await eventCases(fx.A.tenant)).toHaveLength(1);
        }));
    });

    describe("the cancel request", () => {
      it("a cancel answered unknown, then not_performed until its budget is spent, parks with one case (rebase Q3 for every request kind)", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const intake = await giftIntake(db, fx.A);
          await recordReference(db, intake.donationId, paymentIntent());
          await ageIntake(db, intake.donationId, 8);
          const op = (await sweep(intake.donationId))
            .cancel_operation_id as string;
          let claimed = await claim(db, op);
          expect(claimed).toMatchObject({
            outcome: "claimed",
            attempt: 1,
            request_kind: "cancel_payment",
          });
          expect(
            await report(db, op, 1, {
              result: "unknown",
              retry_delay_seconds: 30,
              error_code: "stripe_timeout",
            }),
          ).toMatchObject({ outcome: "retry_scheduled" });
          for (let n = 2; n <= 5; n += 1) {
            await makeDue(db, op);
            claimed = await claim(db, op);
            expect(claimed).toMatchObject({ outcome: "claimed", attempt: n });
            await report(db, op, n, {
              result: "not_performed",
              retry_delay_seconds: 30,
              error_code: "stripe_rate_limited",
            });
          }
          await makeDue(db, op);
          expect(await claim(db, op)).toMatchObject({ outcome: "parked" });
          expect(await requestRow(db, op)).toMatchObject({
            status: "parked",
            outcome_unknown: true,
          });
          expect(await casesOf(db, op)).toHaveLength(1);
        }));

      it("a cancel's parameters name its intake's PaymentIntent and nothing else; another object is refused 23514", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const intake = await giftIntake(db, fx.A);
          await recordReference(db, intake.donationId, paymentIntent());
          const params = {
            payment_intent: paymentIntent(),
            cancellation_reason: "abandoned",
          };
          const r = await guardUpdate(
            db,
            fx.A.tenant,
            `INSERT INTO public.donation_saga_outbox
               (tenant_id, donation_id, amount, currency, idempotency_key, status, next_attempt_at,
                request_kind, provider_account_ref, livemode, request_params, request_digest)
             VALUES ($1, $2::uuid, $3, 'usd', 'gift:' || $2::uuid::text || ':cancel_payment', 'queued', now(),
                     'cancel_payment', $4, false, $5::jsonb,
                     encode(sha256(convert_to($5::jsonb::text, 'UTF8')), 'hex'))`,
            [
              fx.A.tenant,
              intake.donationId,
              intake.amount,
              fx.A.account,
              JSON.stringify(params),
            ],
          );
          expect([r.code, r.message]).toEqual([
            "23514",
            "provider_request_cancel_foreign_object",
          ]);
        }));
    });

    describe("unmatched payments", () => {
      async function unmatchedEvent(side: Side, maxAttempts: number) {
        const event = await storeEvent(db, side, {
          pi: paymentIntent(),
          amount: 4200,
        });
        await role(db, null);
        await db.query(
          "UPDATE public.stripe_connect_events SET max_attempts = $2 WHERE id = $1",
          [event.id, maxAttempts],
        );
        return event;
      }

      it("an unmatched event before its last attempt is answered unmatched and left to the failure command; at its last attempt it parks in one event-anchored case with one task and link, and the event is processed", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const event = await unmatchedEvent(fx.A, 2);
          expect(await claimEvent(db, event.id)).toMatchObject({
            outcome: "claimed",
            attempt: 1,
          });
          expect(await apply(db, event.id, 1)).toMatchObject({
            outcome: "unmatched",
            reason: "no_operation",
          });
          expect(await eventCases(fx.A.tenant)).toEqual([]);
          await failEvent(db, event.id, 1);
          expect(await claimEvent(db, event.id)).toMatchObject({
            outcome: "claimed",
            attempt: 2,
          });
          const parked = await apply(db, event.id, 2);
          expect(parked).toMatchObject({
            outcome: "parked",
            reason: "no_operation",
            payment_object_id: event.pi,
          });
          expect(await eventCases(fx.A.tenant)).toEqual([
            expect.objectContaining({
              kind: "unmatched_payment",
              event_id: event.id,
              donation_id: null,
              links: 1,
            }),
          ]);
          await role(db, null);
          const row = (
            await db.query(
              "SELECT processing_status, processing_outcome FROM public.stripe_connect_events WHERE id = $1",
              [event.id],
            )
          ).rows[0];
          expect(row).toMatchObject({
            processing_status: "processed",
            processing_outcome: expect.objectContaining({
              outcome: "parked",
              attempt: 2,
            }),
          });
          expect(await apply(db, event.id, 2)).toMatchObject({
            outcome: "parked",
            replayed: true,
          });
          expect(await eventCases(fx.A.tenant)).toHaveLength(1);
          const rows = await moneyRows(db, fx.A.tenant);
          expect([rows.intakes, rows.gifts, rows.observations]).toEqual([
            [],
            [],
            [],
          ]);
        }));
    });

    describe("a disconnected account", () => {
      async function disconnect(side: Side) {
        const id = `evt_${randomUUID().replaceAll("-", "")}`;
        const payload = {
          id,
          object: "v2.core.event",
          type: "v2.core.account.closed",
          created: new Date().toISOString(),
          livemode: false,
          related_object: {
            id: side.account,
            type: "v2.core.account",
            url: `/v2/core/accounts/${side.account}`,
          },
        };
        const raw = JSON.stringify(payload);
        await role(db, null);
        await db.query("SELECT set_config('app.current_tenant_id', '', true)");
        await role(db, "service_role");
        const eventId = (
          await db.query(
            `INSERT INTO public.stripe_connect_events
               (tenant_id, stripe_event_id, event_type, livemode, provider_account_id, event_created_at, payload_sha256, raw_payload)
             VALUES ($1, $2, 'v2.core.account.closed', false, $3, $4, $5, $6::jsonb) RETURNING id`,
            [
              side.tenant,
              id,
              side.account,
              payload.created,
              createHash("sha256").update(raw).digest("hex"),
              raw,
            ],
          )
        ).rows[0].id as string;
        await role(db, null);
        expect(await claimEvent(db, eventId)).toMatchObject({
          outcome: "claimed",
        });
        await role(db, "service_role");
        const applied = (
          await db.query(
            "SELECT public.apply_account_event($1, 1, NULL) AS r",
            [eventId],
          )
        ).rows[0].r as Outcome;
        await role(db, null);
        return applied;
      }

      it("parks its queued and known retry_wait requests with the one disconnect task, leaves an unknown retry_wait to its window, and sends nothing after", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const queued = await giftIntake(db, fx.A);
          const queuedOp = (await enqueue(db, fx.A, queued.donationId)).rows[0]!
            .id as string;
          const known = await giftIntake(db, fx.A);
          const knownOp = (await enqueue(db, fx.A, known.donationId)).rows[0]!
            .id as string;
          await claim(db, knownOp);
          await report(db, knownOp, 1, {
            result: "not_performed",
            retry_delay_seconds: 30,
            error_code: "stripe_rate_limited",
          });
          const unknown = await giftIntake(db, fx.A);
          const unknownOp = (await enqueue(db, fx.A, unknown.donationId))
            .rows[0]!.id as string;
          await claim(db, unknownOp);
          await report(db, unknownOp, 1, {
            result: "unknown",
            retry_delay_seconds: 30,
            error_code: "stripe_timeout",
          });
          const applied = await disconnect(fx.A);
          expect(applied).toMatchObject({
            outcome: "applied",
            status: "disconnected",
          });
          expect(await requestRow(db, queuedOp)).toMatchObject({
            status: "parked",
            outcome_unknown: false,
            park_reason: "binding_disconnected",
          });
          expect(await requestRow(db, knownOp)).toMatchObject({
            status: "parked",
            outcome_unknown: false,
            park_reason: "binding_disconnected",
          });
          expect(await requestRow(db, unknownOp)).toMatchObject({
            status: "retry_wait",
            outcome_unknown: true,
          });
          await role(db, null);
          const links = await db.query(
            `SELECT t.issue_type, l.record_type, l.record_id, l.relationship
               FROM public.mission_control_task_links AS l JOIN public.mission_control_tasks AS t ON t.id = l.task_id
              WHERE l.tenant_id = $1 ORDER BY l.relationship, l.record_id`,
            [fx.A.tenant],
          );
          expect(new Set(links.rows.map((r) => r.issue_type))).toEqual(
            new Set(["payment_account_disconnected"]),
          );
          expect(
            links.rows
              .filter(
                (r) =>
                  r.relationship === "provider_request_parked_disconnected",
              )
              .map((r) => r.record_id)
              .sort(),
          ).toEqual([queuedOp, knownOp].sort());
          expect(await claim(db, queuedOp)).toMatchObject({
            outcome: "parked",
            case_id: null,
          });
          await makeDue(db, unknownOp);
          expect(await claim(db, unknownOp)).toMatchObject({
            outcome: "binding_inactive",
          });
          expect(await casesOf(db, queuedOp)).toEqual([]);
        }));

      it("a known request cannot park while its binding is active, and an unsent one cannot park as unknown (23514)", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const intake = await giftIntake(db, fx.A);
          const op = (await enqueue(db, fx.A, intake.donationId)).rows[0]!
            .id as string;
          const r = await guardUpdate(
            db,
            fx.A.tenant,
            "UPDATE public.donation_saga_outbox SET status = 'parked' WHERE id = $1",
            [op],
          );
          expect([r.code, r.message]).toEqual([
            "23514",
            "provider_request_bad_move",
          ]);
          const u = await guardUpdate(
            db,
            fx.A.tenant,
            "UPDATE public.donation_saga_outbox SET status = 'parked', outcome_unknown = true WHERE id = $1",
            [op],
          );
          expect([u.code, u.message]).toEqual([
            "23514",
            "provider_request_bad_move",
          ]);
        }));

      it("F3: on a disconnected account the sweep closes no intake whose PaymentIntent would need a cancel, writes no request, and says so (binding_disconnected); one with no PaymentIntent still closes", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const withPi = await giftIntake(db, fx.A);
          await recordReference(db, withPi.donationId, paymentIntent());
          const withoutPi = await giftIntake(db, fx.A);
          await ageIntake(db, withPi.donationId, 8);
          await ageIntake(db, withoutPi.donationId, 8);
          expect(await disconnect(fx.A)).toMatchObject({
            outcome: "applied",
            status: "disconnected",
          });
          expect(await sweep(withPi.donationId)).toMatchObject({
            outcome: "binding_disconnected",
            donation_id: withPi.donationId,
          });
          expect(await requestsOf(withPi.donationId)).toEqual([]);
          expect(await intakeRow(db, withPi.donationId)).toMatchObject({
            status: "pending",
            abandoned_by: null,
          });
          expect(await sweep(withoutPi.donationId)).toMatchObject({
            outcome: "abandoned",
            cancel_operation_id: null,
          });
        }));
    });

    describe("the apply and the event cases", () => {
      it("F10: a payment success for a parked create request is evidence for its case and stages no gift, also when the intake already records that PaymentIntent", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const intake = await giftIntake(db, fx.A);
          const op = (await enqueue(db, fx.A, intake.donationId)).rows[0]!
            .id as string;
          await claim(db, op);
          await report(db, op, 1, {
            result: "unknown",
            retry_delay_seconds: 30,
            error_code: "stripe_timeout",
          });
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
          const event = await storeEvent(db, fx.A, {
            pi,
            amount: intake.amount,
            metadata: { asym_operation: op, asym_intake: intake.donationId },
          });
          expect(await work(db, event.id)).toMatchObject({
            outcome: "case_evidence",
            donation_id: intake.donationId,
          });
          expect(await giftOf(db, intake.donationId)).toBeUndefined();
          expect(await intakeRow(db, intake.donationId)).toMatchObject({
            status: "pending",
            donor_id: null,
          });
          expect(await requestRow(db, op)).toMatchObject({ status: "parked" });
        }));

      it("F13: an event case is written by the guard alone: an update by any other role, its owner included, is refused 42501", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const intake = await giftIntake(db, fx.A);
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
          const event = await storeEvent(db, fx.A, {
            pi,
            amount: intake.amount,
          });
          await work(db, event.id);
          const [opened] = await eventCases(fx.A.tenant);
          await role(db, null);
          const r = await attempt(
            db,
            "UPDATE public.payment_event_cases SET kind = kind WHERE id = $1",
            [opened!.id],
          );
          expect([r.code, r.message]).toEqual([
            "42501",
            "payment_event_case_guard_only",
          ]);
        }));
    });

    describe("the migration", () => {
      it("F8: M1's preflight refuses 55000, changing nothing, while 20261126190000's function is missing or a line-based donation exists", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const name = readdirSync(MIGRATIONS).find((n) =>
            /^20261127030000_.*\.sql$/.test(n),
          )!;
          const text = readFileSync(join(MIGRATIONS, name), "utf8");
          const preflight = /\nDO \$\$\nBEGIN\n[\s\S]*?\nEND\n\$\$;\n/.exec(
            text,
          )?.[0];
          expect(preflight).toBeDefined();
          await role(db, null);
          await db.query(
            "ALTER FUNCTION private.refuse_sealed_truncate() RENAME TO refuse_sealed_truncate_moved",
          );
          const missing = await attempt(db, preflight!);
          expect([missing.code, missing.message]).toEqual([
            "55000",
            "m1_preflight_sealed_truncate_missing",
          ]);
          await db.query(
            "ALTER FUNCTION private.refuse_sealed_truncate_moved() RENAME TO refuse_sealed_truncate",
          );
          await giftIntake(db, fx.A);
          await role(db, null);
          const present = await attempt(db, preflight!);
          expect([present.code, present.message]).toEqual([
            "55000",
            "m1_preflight_line_based_donation_exists",
          ]);
        }));

      it("F8: M3 gives a request parked before it its reason (the unknown outcome it parked for) before it validates its checks, so a database holding one applies it cleanly", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const intake = await giftIntake(db, fx.A);
          const op = (await enqueue(db, fx.A, intake.donationId)).rows[0]!
            .id as string;
          await claim(db, op);
          await report(db, op, 1, {
            result: "unknown",
            retry_delay_seconds: 30,
            error_code: "stripe_timeout",
          });
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
          const name = readdirSync(MIGRATIONS).find((n) =>
            /^20261127030200_.*\.sql$/.test(n),
          )!;
          const text = readFileSync(join(MIGRATIONS, name), "utf8");
          const check =
            /ADD CONSTRAINT donation_saga_outbox_park_reason_check\s+CHECK \(([\s\S]*?)\n    \) NOT VALID/.exec(
              text,
            )![1]!;
          const backfill =
            /\nALTER TABLE public\.donation_saga_outbox DISABLE TRIGGER donation_saga_outbox_provider_rules;[\s\S]*?ENABLE TRIGGER donation_saga_outbox_provider_rules;\n/.exec(
              text,
            )?.[0] ?? "";
          await role(db, null);
          await db.query(
            "ALTER TABLE public.donation_saga_outbox DROP CONSTRAINT donation_saga_outbox_park_reason_check",
          );
          await db.query("SET LOCAL session_replication_role = replica");
          await db.query(
            "UPDATE public.donation_saga_outbox SET park_reason = NULL WHERE id = $1",
            [op],
          );
          await db.query("SET LOCAL session_replication_role = origin");
          if (backfill) await db.query(backfill);
          await db.query(
            `ALTER TABLE public.donation_saga_outbox ADD CONSTRAINT donation_saga_outbox_park_reason_check CHECK (${check}) NOT VALID`,
          );
          const validated = await attempt(
            db,
            "ALTER TABLE public.donation_saga_outbox VALIDATE CONSTRAINT donation_saga_outbox_park_reason_check",
          );
          expect([validated.ok, validated.code ?? null]).toEqual([true, null]);
          expect(await requestRow(db, op)).toMatchObject({
            status: "parked",
            park_reason: "outcome_unknown",
          });
        }));
    });

    it("a staff-abandoned intake's gift and observation stay absent when its cancel is reported canceled; the intake stays abandoned by staff (D-18, AL-2681 fix round F14: abandoned by staff, as the title says, not aged and swept)", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await giftIntake(db, fx.A);
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
        expect(await intakeRow(db, intake.donationId)).toMatchObject({
          status: "abandoned",
          abandoned_by: "staff",
        });
        const canceled = await storeEvent(db, fx.A, {
          type: "payment_intent.canceled",
          pi,
          amount: intake.amount,
        });
        expect(await work(db, canceled.id)).toMatchObject({
          outcome: "applied",
          status: "abandoned",
        });
        expect(await intakeRow(db, intake.donationId)).toMatchObject({
          status: "abandoned",
          abandoned_by: "staff",
        });
        const rows = await moneyRows(db, fx.A.tenant);
        expect([rows.gifts, rows.observations]).toEqual([[], []]);
      }));
  },
);
