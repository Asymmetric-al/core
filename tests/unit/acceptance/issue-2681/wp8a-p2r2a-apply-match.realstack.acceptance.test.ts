import { randomUUID } from "node:crypto";

import pg from "pg";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  apply,
  claimEvent,
  enqueue,
  eventRow,
  expireLease,
  failEvent,
  inTx,
  lineIntake,
  moneyRows,
  paymentIntent,
  recordReference,
  role,
  rowOf,
  seedTwoTenants,
  storeEvent,
  syncLease,
  tryClaim,
  work,
  type Outcome,
  type Side,
} from "./wp8a-p2r2a-harness";
import { runWorker } from "./wp8a-p2r2a-worker";
import {
  createStripeProviderFake,
  loseAfterActing,
  succeed,
} from "../../../fixtures/stripe-provider-fake";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error("a test of the payment apply tried to reach the network");
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R2a: the apply, the operation match and contradictions (TP4 :280; real stack; every test rolls back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function requested(side: Side, amount = 10300) {
      const intake = await lineIntake(db, side, { lines: [{ amount }] });
      const r = await enqueue(db, side, intake.donationId);
      if (!r.ok) throw new Error(`enqueue refused: ${r.code} ${r.message}`);
      return { intake, operationId: r.rows[0]!.id as string };
    }

    async function setRequest(operationId: string, sql: string) {
      await role(db, null);
      await db.query("SAVEPOINT r2a_request");
      await db.query("SET LOCAL session_replication_role = replica");
      await db.query(
        `UPDATE public.donation_saga_outbox SET ${sql} WHERE id = $1`,
        [operationId],
      );
      await db.query("SET LOCAL session_replication_role = origin");
      await db.query("RELEASE SAVEPOINT r2a_request");
    }

    const sentAt = `first_sent_at = now(), send_deadline = now() + interval '23 hours', attempt_count = 1`;

    const metadataOf = (operationId: string, donationId: string) => ({
      asym_operation: operationId,
      asym_intake: donationId,
    });

    const intakeRef = async (donationId: string) => {
      await role(db, null);
      return (
        await db.query(
          "SELECT stripe_payment_intent_id, status FROM public.donations WHERE id = $1",
          [donationId],
        )
      ).rows[0] as { stripe_payment_intent_id: string | null; status: string };
    };

    it("C5 (rebase 10.3 row 11; ruling Q-B): a crash between the provider's answer and the report: the success event names the request, the apply records the reference and makes one gift, and the withheld report then links; in a second run the worker instead reclaims, the fake replays and the request links, and the event then applies; either way one object and one gift", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const first = await requested(fx.A);
        const fake = createStripeProviderFake();
        fake.script(succeed());
        let applied: Outcome | undefined;
        const run = await runWorker(db, first.operationId, fake, {
          beforeReport: async () => {
            const object = fake.objects()[0]!;
            expect(object.metadata).toMatchObject(
              metadataOf(first.operationId, first.intake.donationId),
            );
            const e = await storeEvent(db, fx.A, {
              pi: object.id,
              amount: object.amount,
              metadata: object.metadata,
            });
            applied = await work(db, e.id);
            expect((await rowOf(db, first.operationId)).status).toBe("sending");
          },
        });
        const object = fake.objects()[0]!.id;
        expect(applied).toMatchObject({
          outcome: "applied",
          status: "completed",
          payment_object_id: object,
        });
        expect(run).toMatchObject({
          sent: true,
          report: {
            error: null,
            data: { outcome: "linked", provider_object_id: object },
          },
        });
        expect((await rowOf(db, first.operationId)).status).toBe("linked");
        expect(await intakeRef(first.intake.donationId)).toEqual({
          stripe_payment_intent_id: object,
          status: "completed",
        });

        const second = await requested(fx.A);
        const replaying = createStripeProviderFake();
        replaying.script(loseAfterActing());
        const crashed = await runWorker(db, second.operationId, replaying, {
          dropReport: true,
        });
        expect(crashed).toMatchObject({ sent: true, attempt: 1 });
        await expireLease(db, second.operationId);
        const reclaimed = await runWorker(db, second.operationId, replaying);
        const replayed = replaying.objects()[0]!;
        expect(reclaimed).toMatchObject({
          attempt: 2,
          report: {
            data: { outcome: "linked", provider_object_id: replayed.id },
          },
        });
        expect(replaying.requests().map((r) => r.replayed)).toEqual([
          false,
          true,
        ]);
        const e = await storeEvent(db, fx.A, {
          pi: replayed.id,
          amount: replayed.amount,
          metadata: replayed.metadata,
        });
        expect(await work(db, e.id)).toMatchObject({
          outcome: "applied",
          status: "completed",
        });
        expect(replaying.objects()).toHaveLength(1);
        const rows = await moneyRows(db, fx.A.tenant);
        expect(rows.gifts.map((g) => g.donation_id).sort()).toEqual(
          [first.intake.donationId, second.intake.donationId].sort(),
        );
        expect(rows.observations).toHaveLength(2);
      }));

    it("C6: unmatched (no asym_operation, an unknown one, one of another account): nothing is written and the event stays processing; record_provider_event_failure then releases the account's sync lease; once the reference is recorded the next attempt applies", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const { intake, operationId } = await requested(fx.A);
        const other = await requested(fx.B);
        const pi = paymentIntent();
        const cases: [string, Record<string, unknown>, string][] = [
          ["none", {}, "no_operation"],
          [
            "upper-case",
            { asym_operation: operationId.toUpperCase() },
            "no_operation",
          ],
          ["unknown", { asym_operation: randomUUID() }, "unknown_operation"],
          [
            "another account's",
            { asym_operation: other.operationId },
            "unknown_operation",
          ],
        ];
        for (const [label, metadata, reason] of cases) {
          const before = JSON.stringify(await moneyRows(db, fx.A.tenant));
          const e = await storeEvent(db, fx.A, {
            pi,
            amount: intake.amount,
            metadata,
          });
          const r = await work(db, e.id);
          expect([label, r.outcome, r.reason]).toEqual([
            label,
            "unmatched",
            reason,
          ]);
          expect(JSON.stringify(await moneyRows(db, fx.A.tenant))).toBe(before);
          expect((await eventRow(db, e.id)).processing_status).toBe(
            "processing",
          );
          expect(await syncLease(db, fx.A)).toBe(e.id);
          expect(await failEvent(db, e.id, 1)).toMatchObject({
            outcome: "failed",
          });
          expect(await syncLease(db, fx.A)).toBeNull();
        }
        const late = await storeEvent(db, fx.A, {
          pi,
          amount: intake.amount,
          metadata: {},
        });
        expect((await work(db, late.id)).outcome).toBe("unmatched");
        await failEvent(db, late.id, 1);
        await recordReference(db, intake.donationId, pi);
        await role(db, null);
        await db.query(
          "UPDATE public.stripe_connect_events SET next_attempt_at = now() - interval '1 second' WHERE id = $1",
          [late.id],
        );
        const claimed = await claimEvent(db, late.id);
        expect(claimed).toMatchObject({ outcome: "claimed", attempt: 2 });
        expect(await apply(db, late.id, 2)).toMatchObject({
          outcome: "applied",
          status: "completed",
          attempt: 2,
        });
        expect(await syncLease(db, fx.A)).toBeNull();
      }));

    it("C8 (TP2 section 4): an event on the other tenant's account that names this tenant's payment, request and intake is unmatched, and this tenant is unchanged", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const { intake, operationId } = await requested(fx.A);
        const pi = paymentIntent();
        await recordReference(db, intake.donationId, pi);
        const beforeA = JSON.stringify(await moneyRows(db, fx.A.tenant));
        const e = await storeEvent(db, fx.B, {
          pi,
          amount: intake.amount,
          metadata: metadataOf(operationId, intake.donationId),
        });
        expect(await work(db, e.id)).toMatchObject({
          outcome: "unmatched",
          tenant_id: fx.B.tenant,
        });
        expect(JSON.stringify(await moneyRows(db, fx.A.tenant))).toBe(beforeA);
        expect((await moneyRows(db, fx.B.tenant)).tasks).toEqual([]);
      }));

    it("C9 (ruling Q-A): each contradiction writes one task and one link and changes no money row; the intake's reference stays NULL on the operation match; the event is processed with its reason; a linked or adopted request whose intake already names its object meets an event of another PaymentIntent as intake_names_another_object (review finding 4: index 4.3 (b) checks the intake before the request's status), and request_linked is reached only from a state no writer leaves, as the guard of the last branch", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const got: string[] = [];
        const check = async (
          label: string,
          make: () => Promise<{
            eventId: string;
            donationId: string;
            refBefore: string | null;
          }>,
          reason: string,
        ) => {
          const made = await make();
          const before = await moneyRows(db, fx.A.tenant);
          const r = await work(db, made.eventId);
          const after = await moneyRows(db, fx.A.tenant);
          expect(after.tasks.length - before.tasks.length).toBe(1);
          const { tasks: _t1, ...moneyBefore } = before;
          const { tasks: _t2, ...moneyAfter } = after;
          expect(moneyAfter).toEqual(moneyBefore);
          expect(
            (await intakeRef(made.donationId)).stripe_payment_intent_id,
          ).toBe(made.refBefore);
          const task = after.tasks.find((t) => t.record_id === made.eventId);
          expect(task).toMatchObject({
            issue_type: "payment_contradiction",
            urgency: "high",
            source_module: "payments",
            status: "open",
            record_type: "stripe_connect_event",
            record_id: made.eventId,
            relationship: "payment_contradiction",
            metadata: { reason, donation_id: made.donationId },
          });
          const row = await eventRow(db, made.eventId);
          expect(row.processing_status).toBe("processed");
          expect(row.processing_outcome).toMatchObject({
            outcome: "contradiction",
            reason,
          });
          got.push(`${label}: ${r.outcome} ${r.reason}`);
        };
        const sent = async (status = "sending") => {
          const q = await requested(fx.A);
          await setRequest(
            q.operationId,
            `${sentAt}, status = '${status}'${status === "sending" ? ", lease_expires_at = clock_timestamp() + interval '5 minutes'" : ", next_attempt_at = clock_timestamp()"}`,
          );
          return q;
        };
        const byMatch =
          (
            q: Awaited<ReturnType<typeof requested>>,
            event: Record<string, unknown> = {},
            metadata = metadataOf(q.operationId, q.intake.donationId),
          ) =>
          async () => ({
            eventId: (
              await storeEvent(db, fx.A, {
                pi: paymentIntent(),
                amount: q.intake.amount,
                metadata,
                ...event,
              })
            ).id,
            donationId: q.intake.donationId,
            refBefore: null,
          });
        const s1 = await sent();
        await check(
          "amount",
          byMatch(s1, { amount: 10299 }),
          "amount_mismatch",
        );
        const s2 = await sent();
        await check(
          "received",
          byMatch(s2, { received: 10299 }),
          "amount_mismatch",
        );
        const s3 = await sent("retry_wait");
        await check(
          "currency",
          byMatch(s3, { currency: "eur" }),
          "amount_mismatch",
        );
        const s4 = await sent();
        await check(
          "asym_intake",
          byMatch(s4, {}, metadataOf(s4.operationId, randomUUID())),
          "operation_mismatch",
        );
        const s5 = await sent();
        const theirs = paymentIntent();
        await recordReference(db, s5.intake.donationId, theirs);
        await check(
          "another object",
          async () => ({ ...(await byMatch(s5)()), refBefore: theirs }),
          "intake_names_another_object",
        );
        const queued = await requested(fx.A);
        await check("queued", byMatch(queued), "request_queued");
        for (const status of ["refused", "dead_letter"]) {
          const q = await sent();
          await setRequest(
            q.operationId,
            `status = '${status}', lease_expires_at = NULL`,
          );
          await check(status, byMatch(q), `request_${status}`);
        }
        const abandoned = await requested(fx.A);
        await setRequest(abandoned.operationId, "status = 'abandoned'");
        await check("abandoned", byMatch(abandoned), "request_abandoned");
        const linkedElsewhere = await sent();
        await setRequest(
          linkedElsewhere.operationId,
          `status = 'linked', lease_expires_at = NULL, provider_object_id = '${paymentIntent()}'`,
        );
        await check(
          "linked, the intake naming no payment (a state no writer leaves: the ELSE branch's guard)",
          byMatch(linkedElsewhere),
          "request_linked",
        );
        const linked = await sent();
        const linkedObject = paymentIntent();
        await setRequest(
          linked.operationId,
          `status = 'linked', lease_expires_at = NULL, provider_object_id = '${linkedObject}'`,
        );
        await recordReference(db, linked.intake.donationId, linkedObject);
        await check(
          "linked, the intake naming its object",
          async () => ({
            ...(await byMatch(linked)()),
            refBefore: linkedObject,
          }),
          "intake_names_another_object",
        );
        const adopted = await sent();
        const adoptedObject = paymentIntent();
        await setRequest(
          adopted.operationId,
          `status = 'adopted', lease_expires_at = NULL, outcome_unknown = false, parked_at = now(), park_reason = 'outcome_unknown', provider_object_id = '${adoptedObject}'`,
        );
        await recordReference(db, adopted.intake.donationId, adoptedObject);
        await check(
          "adopted, the intake naming its object",
          async () => ({
            ...(await byMatch(adopted)()),
            refBefore: adoptedObject,
          }),
          "intake_names_another_object",
        );

        const direct = await lineIntake(db, fx.A);
        const pi = paymentIntent();
        await recordReference(db, direct.donationId, pi);
        await check(
          "direct amount",
          async () => ({
            eventId: (
              await storeEvent(db, fx.A, { pi, amount: direct.amount - 1 })
            ).id,
            donationId: direct.donationId,
            refBefore: pi,
          }),
          "amount_mismatch",
        );
        await work(
          db,
          (await storeEvent(db, fx.A, { pi, amount: direct.amount })).id,
        );
        await check(
          "cancel after success",
          async () => ({
            eventId: (
              await storeEvent(db, fx.A, {
                type: "payment_intent.canceled",
                pi,
                amount: direct.amount,
              })
            ).id,
            donationId: direct.donationId,
            refBefore: pi,
          }),
          "cancel_after_success",
        );
        const canceled = await lineIntake(db, fx.A);
        const cpi = paymentIntent();
        await recordReference(db, canceled.donationId, cpi);
        await work(
          db,
          (
            await storeEvent(db, fx.A, {
              type: "payment_intent.canceled",
              pi: cpi,
              amount: canceled.amount,
            })
          ).id,
        );
        await check(
          "success after cancel",
          async () => ({
            eventId: (
              await storeEvent(db, fx.A, { pi: cpi, amount: canceled.amount })
            ).id,
            donationId: canceled.donationId,
            refBefore: cpi,
          }),
          "success_after_cancel",
        );
        expect(got).toEqual([
          "amount: contradiction amount_mismatch",
          "received: contradiction amount_mismatch",
          "currency: contradiction amount_mismatch",
          "asym_intake: contradiction operation_mismatch",
          "another object: contradiction intake_names_another_object",
          "queued: contradiction request_queued",
          "refused: contradiction request_refused",
          "dead_letter: contradiction request_dead_letter",
          "abandoned: contradiction request_abandoned",
          "linked, the intake naming no payment (a state no writer leaves: the ELSE branch's guard): contradiction request_linked",
          "linked, the intake naming its object: contradiction intake_names_another_object",
          "adopted, the intake naming its object: contradiction intake_names_another_object",
          "direct amount: contradiction amount_mismatch",
          "cancel after success: contradiction cancel_after_success",
          "success after cancel: contradiction success_after_cancel",
        ]);
      }));

    it("C9 (Q-B): an operation match on a sent request whose amounts agree records the intake's reference once and applies, leaving the request as it was", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const q = await requested(fx.A);
        await setRequest(
          q.operationId,
          `${sentAt}, status = 'retry_wait', next_attempt_at = clock_timestamp()`,
        );
        const before = await rowOf(db, q.operationId);
        const pi = paymentIntent();
        const e = await storeEvent(db, fx.A, {
          pi,
          amount: q.intake.amount,
          metadata: metadataOf(q.operationId, q.intake.donationId),
        });
        expect(await work(db, e.id)).toMatchObject({
          outcome: "applied",
          payment_object_id: pi,
          status: "completed",
        });
        expect(await rowOf(db, q.operationId)).toEqual(before);
        expect(await intakeRef(q.intake.donationId)).toEqual({
          stripe_payment_intent_id: pi,
          status: "completed",
        });
      }));

    it("C10 (TP4 section 10 item 5): a parked request: case_evidence with its open case, and nothing else is written", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const q = await requested(fx.A);
        const fake = createStripeProviderFake();
        fake.script(succeed());
        await setRequest(q.operationId, "max_attempts = 1");
        expect(
          await runWorker(db, q.operationId, fake, { dropReport: true }),
        ).toMatchObject({ sent: true, attempt: 1 });
        await expireLease(db, q.operationId);
        const parked = (await tryClaim(db, q.operationId)).rows[0]!
          .r as Outcome;
        expect(parked).toMatchObject({ outcome: "parked" });
        const before = await moneyRows(db, fx.A.tenant);
        const object = fake.objects()[0]!;
        const e = await storeEvent(db, fx.A, {
          pi: object.id,
          amount: object.amount,
          metadata: object.metadata,
        });
        expect(await work(db, e.id)).toEqual({
          outcome: "case_evidence",
          effect: "succeeded",
          payment_object_id: object.id,
          donation_id: q.intake.donationId,
          case_id: parked.case_id,
          attempt: 1,
          replayed: false,
          event_id: e.id,
          tenant_id: fx.A.tenant,
        });
        expect(await moneyRows(db, fx.A.tenant)).toEqual(before);
        expect((await rowOf(db, q.operationId)).status).toBe("parked");
        expect((await eventRow(db, e.id)).processing_status).toBe("processed");
      }));
  },
);
