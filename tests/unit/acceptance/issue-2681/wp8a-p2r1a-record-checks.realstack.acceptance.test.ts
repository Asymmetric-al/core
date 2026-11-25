import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  GUARD_TEST_GRANTS,
  GUARD_UPDATE_GRANTS,
  HOSTED_SERVICE_GRANTS,
  IN_MIGRATE_JOB,
  attempt,
  claim,
  enterAs,
  grant,
  guardIntake,
  guardUpdate,
  inTx,
  paymentIntent,
  refusal,
  replica,
  report,
  requestParams,
  role,
  rowOf,
  seedTwoTenants,
  windowEndsIn,
  type Fixture,
  type Intake,
} from "./wp8a-p2r1a-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R1a: the provider-operation record, attacks and checks (real stack; every test rolls back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const unknown = { result: "unknown", retry_delay_seconds: 30 };
    const notPerformed = { result: "not_performed", retry_delay_seconds: 30 };

    async function retryWaitRow(fx: Fixture, outcome = notPerformed) {
      const intake = await guardIntake(db, fx.A);
      expect(await claim(db, intake.operationId)).toMatchObject({
        outcome: "claimed",
        attempt: 1,
      });
      expect(await report(db, intake.operationId, 1, outcome)).toMatchObject({
        outcome: "retry_scheduled",
      });
      return intake;
    }

    async function parkedRow(fx: Fixture) {
      const intake = await guardIntake(db, fx.A, { maxAttempts: 1 });
      expect(await claim(db, intake.operationId)).toMatchObject({
        outcome: "claimed",
      });
      expect(await report(db, intake.operationId, 1, unknown)).toMatchObject({
        outcome: "parked",
      });
      return intake;
    }

    async function legacyRow(fx: Fixture) {
      await grant(db, HOSTED_SERVICE_GRANTS);
      const user = randomUUID();
      await db.query("INSERT INTO auth.users (id) VALUES ($1)", [user]);
      await role(db, "service_role");
      const begun = (
        await db.query(
          `SELECT public.begin_donation_saga($1, $2, $2, 4000, 'usd', NULL, NULL, $3, NULL, NULL, '{}'::jsonb) AS r`,
          [fx.A.tenant, user, `legacy-${randomUUID()}`],
        )
      ).rows[0].r;
      await role(db, null);
      return begun as { outbox_id: string; donation_id: string };
    }

    async function guardInsertOutbox(
      intake: Intake,
      columns: Record<string, unknown>,
      paramsFor?: (operationId: string) => unknown,
    ) {
      const operationId = (columns.id as string) ?? randomUUID();
      const params = paramsFor
        ? paramsFor(operationId)
        : requestParams(operationId, intake.donationId, intake.amount);
      const base: Record<string, unknown> = {
        id: operationId,
        tenant_id: intake.side.tenant,
        donation_id: intake.donationId,
        amount: intake.amount,
        currency: "usd",
        idempotency_key: `gift:${intake.donationId}:create_payment`,
        status: "queued",
        request_kind: "create_payment",
        provider_account_ref: intake.side.account,
        livemode: false,
        request_params: JSON.stringify(params),
      };
      const merged = { ...base, ...columns };
      const names = Object.keys(merged);
      const values = names.map((n) => merged[n]);
      await grant(db, GUARD_TEST_GRANTS);
      await enterAs(db, "tenant_guard", intake.side.tenant);
      const r = await attempt(
        db,
        `INSERT INTO public.donation_saga_outbox (${names.join(", ")}, request_digest)
         VALUES (${names.map((n, i) => (n === "request_params" ? `$${i + 1}::jsonb` : `$${i + 1}`)).join(", ")},
                 encode(sha256(convert_to($${names.indexOf("request_params") + 1}::jsonb::text, 'UTF8')), 'hex'))`,
        values,
      );
      await role(db, null);
      return r;
    }

    async function replicaAttempt(sql: string, params: unknown[] = []) {
      await role(db, null);
      await db.query("SET LOCAL session_replication_role = replica");
      const r = await attempt(db, sql, params);
      await db.query("SET LOCAL session_replication_role = origin");
      return r;
    }

    const setParams = (operationId: string, params: unknown) =>
      replicaAttempt(
        `UPDATE public.donation_saga_outbox
            SET request_params = $2::jsonb,
                request_digest = encode(sha256(convert_to($2::jsonb::text, 'UTF8')), 'hex')
          WHERE id = $1`,
        [operationId, JSON.stringify(params)],
      );

    const checkOf = (a: Attempt) => `${a.code} ${a.constraint ?? a.message}`;
    type Attempt = Awaited<ReturnType<typeof attempt>>;

    it("C8: TP4 section 6, rows 1-8, 10, 14-16, against a provider request: the trigger and the checks refuse each attack as tenant_guard, and a delete as owner or service_role", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        await grant(db, [...HOSTED_SERVICE_GRANTS, ...GUARD_UPDATE_GRANTS]);
        const late = await retryWaitRow(fx);
        await windowEndsIn(db, late.operationId, -60);
        const parked = await parkedRow(fx);
        const open = await retryWaitRow(fx);
        const t = fx.A.tenant;
        const got: Record<string, string> = {};
        got["1 claim past the deadline"] = refusal(
          await guardUpdate(
            db,
            t,
            "UPDATE public.donation_saga_outbox SET status = 'sending', attempt_count = attempt_count + 1, lease_expires_at = clock_timestamp() + interval '60 seconds' WHERE id = $1",
            [late.operationId],
          ),
        );
        got["1 claim of a parked request"] = refusal(
          await guardUpdate(
            db,
            t,
            "UPDATE public.donation_saga_outbox SET status = 'sending', attempt_count = attempt_count + 1, lease_expires_at = clock_timestamp() + interval '60 seconds' WHERE id = $1",
            [parked.operationId],
          ),
        );
        got["2 deadline moved to 48 hours"] = refusal(
          await guardUpdate(
            db,
            t,
            "UPDATE public.donation_saga_outbox SET send_deadline = first_sent_at + interval '48 hours' WHERE id = $1",
            [open.operationId],
          ),
        );
        got["2 first send time moved to now"] = refusal(
          await guardUpdate(
            db,
            t,
            "UPDATE public.donation_saga_outbox SET first_sent_at = clock_timestamp() WHERE id = $1",
            [open.operationId],
          ),
        );
        got["3 a fresh key"] = refusal(
          await guardUpdate(
            db,
            t,
            "UPDATE public.donation_saga_outbox SET idempotency_key = 'gift:fresh' WHERE id = $1",
            [open.operationId],
          ),
        );
        const changed = requestParams(open.operationId, open.donationId, 10400);
        got["4 amount changed with a matching digest"] = refusal(
          await guardUpdate(
            db,
            t,
            `UPDATE public.donation_saga_outbox SET amount = 10400, request_params = $2::jsonb,
               request_digest = encode(sha256(convert_to($2::jsonb::text, 'UTF8')), 'hex') WHERE id = $1`,
            [open.operationId, JSON.stringify(changed)],
          ),
        );
        const sameKey = await guardInsertOutbox(open, {});
        got["5 second request, same key"] =
          `${sameKey.code} ${sameKey.constraint}`;
        const freshKey = await guardInsertOutbox(open, {
          idempotency_key: `gift:${randomUUID()}:create_payment`,
        });
        got["5 second request, fresh key"] = checkOf(freshKey);
        got["6 parked set to dead_letter"] = refusal(
          await guardUpdate(
            db,
            t,
            "UPDATE public.donation_saga_outbox SET status = 'dead_letter', outcome_unknown = false WHERE id = $1",
            [parked.operationId],
          ),
        );
        got["7 parked set to failed"] = refusal(
          await guardUpdate(
            db,
            t,
            "UPDATE public.donation_saga_outbox SET status = 'failed' WHERE id = $1",
            [parked.operationId],
          ),
        );
        await windowEndsIn(db, parked.operationId, -60);
        got["7 parked back to retry past the deadline"] = refusal(
          await guardUpdate(
            db,
            t,
            "UPDATE public.donation_saga_outbox SET status = 'retry_wait', next_attempt_at = clock_timestamp() WHERE id = $1",
            [parked.operationId],
          ),
        );
        got["8 attempt_count set to 0"] = refusal(
          await guardUpdate(
            db,
            t,
            "UPDATE public.donation_saga_outbox SET attempt_count = 0 WHERE id = $1",
            [open.operationId],
          ),
        );
        for (const who of ["postgres", "service_role"]) {
          await role(db, who === "postgres" ? null : who);
          got[`10 delete as ${who}`] = refusal(
            await attempt(
              db,
              "DELETE FROM public.donation_saga_outbox WHERE id = $1",
              [open.operationId],
            ),
          );
          await role(db, null);
        }
        const other = await guardIntake(db, fx.B);
        const crossCase = await attempt(
          db,
          "INSERT INTO public.payment_repair_cases (tenant_id, kind, operation_id, donation_id) VALUES ($1, 'outcome_unknown', $2, $3)",
          [fx.A.tenant, other.operationId, other.donationId],
        );
        got["14 a tenant-one case for tenant two's request"] =
          `${crossCase.code} ${crossCase.constraint}`;
        const secondOpen = await attempt(
          db,
          "INSERT INTO public.payment_repair_cases (tenant_id, kind, operation_id, donation_id) VALUES ($1, 'outcome_unknown', $2, $3)",
          [fx.A.tenant, parked.operationId, parked.donationId],
        );
        got["15 a second open case"] =
          `${secondOpen.code} ${secondOpen.constraint}`;
        const fresh = await guardIntake(db, fx.A);
        await replica(
          db,
          "DELETE FROM public.donation_saga_outbox WHERE id = $1",
          [fresh.operationId],
        );
        const otherAccount = await guardInsertOutbox(fresh, {
          provider_account_ref: fx.B.account,
        });
        got["16 another account than the intake's"] =
          `${otherAccount.code} ${otherAccount.constraint}`;
        const otherMode = await guardInsertOutbox(fresh, { livemode: true });
        got["16 another mode than the intake's"] =
          `${otherMode.code} ${otherMode.constraint}`;

        expect(got).toEqual({
          "1 claim past the deadline": "55000 provider_request_window_passed",
          "1 claim of a parked request": "55000 provider_request_not_claimable",
          "2 deadline moved to 48 hours": "23514 provider_request_frozen",
          "2 first send time moved to now": "23514 provider_request_frozen",
          "3 a fresh key": "23514 provider_request_frozen",
          "4 amount changed with a matching digest":
            "23514 provider_request_frozen",
          "5 second request, same key":
            "23505 donation_saga_outbox_tenant_idempotency_unique",
          "5 second request, fresh key":
            "23514 donation_saga_outbox_request_check",
          "6 parked set to dead_letter": "23514 provider_request_bad_move",
          "7 parked set to failed": "23514 provider_request_bad_move",
          "7 parked back to retry past the deadline":
            "23514 provider_request_retry_outside_window",
          "8 attempt_count set to 0": "23514 provider_request_attempt_step",
          "10 delete as postgres": "23514 provider_request_sealed",
          "10 delete as service_role": "23514 provider_request_sealed",
          "14 a tenant-one case for tenant two's request":
            "23503 payment_repair_cases_operation_fk",
          "15 a second open case":
            "23505 payment_repair_cases_one_open_per_operation",
          "16 another account than the intake's":
            "23503 donation_saga_outbox_account_fk",
          "16 another mode than the intake's":
            "23503 donation_saga_outbox_account_fk",
        });
      }));

    it("C8 (guard): on a legacy_saga row the legacy-valid equivalents are accepted: a changed amount, a fresh key, attempt_count reset to 0, claim_donation_saga_event, and deleting a completed row", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        await grant(db, HOSTED_SERVICE_GRANTS);
        const legacy = await legacyRow(fx);
        await role(db, "service_role");
        const results: (number | null)[] = [];
        for (const sql of [
          "UPDATE public.donation_saga_outbox SET amount = amount + 1 WHERE id = $1",
          "UPDATE public.donation_saga_outbox SET idempotency_key = 'fresh-' || id::text WHERE id = $1",
          "UPDATE public.donation_saga_outbox SET attempt_count = 3 WHERE id = $1",
          "UPDATE public.donation_saga_outbox SET attempt_count = 0 WHERE id = $1",
        ])
          results.push((await db.query(sql, [legacy.outbox_id])).rowCount);
        const lock = randomUUID();
        const claimed = (
          await db.query(
            "SELECT public.claim_donation_saga_event($1, $2) AS r",
            [legacy.outbox_id, lock],
          )
        ).rows[0].r;
        expect(claimed).toMatchObject({ claimed: true });
        await db.query(
          "SELECT public.complete_donation_saga_event($1, $2, 'pi_legacy', NULL, '{}'::jsonb)",
          [legacy.outbox_id, lock],
        );
        results.push(
          (
            await db.query(
              "DELETE FROM public.donation_saga_outbox WHERE id = $1 AND status = 'completed'",
              [legacy.outbox_id],
            )
          ).rowCount,
        );
        await role(db, null);
        expect(results).toEqual([1, 1, 1, 1, 1]);
      }));

    it("C9: every CHECK of section 3.1 and item 1 refuses one failing row, and one NULL each where a NULL can reach it; max_attempts 0 is refused, 21 and 1000 are accepted (Q-C, no ceiling)", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const queued = await guardIntake(db, fx.A);
        const waiting = await retryWaitRow(fx);
        const legacy = await legacyRow(fx);
        const parked = await parkedRow(fx);
        const linked = await guardIntake(db, fx.A);
        expect(await claim(db, linked.operationId)).toMatchObject({
          outcome: "claimed",
        });
        expect(
          await report(db, linked.operationId, 1, {
            result: "succeeded",
            provider_object_id: paymentIntent(),
          }),
        ).toMatchObject({ outcome: "linked" });
        const set = (id: string, assignments: string) =>
          replicaAttempt(
            `UPDATE public.donation_saga_outbox SET ${assignments} WHERE id = $1`,
            [id],
          );
        const setDonation = (id: string, assignments: string) =>
          replicaAttempt(
            `UPDATE public.donations SET ${assignments} WHERE id = $1`,
            [id],
          );
        const without = async (drop: string[], fn: () => Promise<Attempt>) => {
          await role(db, null);
          await db.query("SAVEPOINT r1a_without");
          for (const name of drop)
            await db.query(
              `ALTER TABLE public.donation_saga_outbox DROP CONSTRAINT ${name}`,
            );
          const r = await fn();
          await db.query("ROLLBACK TO SAVEPOINT r1a_without");
          return r;
        };
        const q = queued.operationId;
        const w = waiting.operationId;
        const got: Record<string, string> = {};
        got["kind: a third kind"] = checkOf(await set(q, "kind = 'other'"));
        got["status: a legacy status on a provider row"] = checkOf(
          await set(w, "status = 'pending'"),
        );
        got["status: a provider status on a legacy row"] = checkOf(
          await set(legacy.outbox_id, "status = 'queued'"),
        );
        got["legacy: a request kind on a legacy row"] = checkOf(
          await set(legacy.outbox_id, "request_kind = 'create_payment'"),
        );
        got["legacy NULL: no donor on a legacy row"] = checkOf(
          await set(legacy.outbox_id, "donor_id = NULL"),
        );
        got["2: attempt 0 on a sent row"] = checkOf(
          await set(w, "attempt_count = 0"),
        );
        got["2 NULL: sent at NULL with a deadline"] = checkOf(
          await set(w, "first_sent_at = NULL"),
        );
        got["3: queued with a send time"] = checkOf(
          await set(
            q,
            "first_sent_at = now(), send_deadline = now(), attempt_count = 1",
          ),
        );
        got["3 NULL: refused never sent"] = checkOf(
          await set(q, "status = 'refused'"),
        );
        got["4: a 24-hour window"] = checkOf(
          await set(w, "send_deadline = first_sent_at + interval '24 hours'"),
        );
        got["4 NULL: a deadline with no first send (sent check removed)"] =
          checkOf(
            await without(["donation_saga_outbox_sent_check"], () =>
              set(q, "send_deadline = now()"),
            ),
          );
        got["5: a lease while waiting"] = checkOf(
          await set(w, "lease_expires_at = first_sent_at"),
        );
        got["5 NULL: a lease with no deadline"] = checkOf(
          await set(q, "status = 'sending', lease_expires_at = now()"),
        );
        got["6: a charge id as the object"] = checkOf(
          await set(linked.operationId, "provider_object_id = 'ch_r1a'"),
        );
        got["6 NULL: linked with no object"] = checkOf(
          await set(linked.operationId, "provider_object_id = NULL"),
        );
        got["7: parked_at while waiting"] = checkOf(
          await set(w, "parked_at = now()"),
        );
        got["7 NULL: parked with no parked_at"] = checkOf(
          await set(parked.operationId, "parked_at = NULL"),
        );
        got["8: parked and known"] = checkOf(
          await set(parked.operationId, "outcome_unknown = false"),
        );
        got["8: dead letter and unknown"] = checkOf(
          await set(
            w,
            "status = 'dead_letter', outcome_unknown = true, next_attempt_at = now()",
          ),
        );
        got["9: a retry due 899 seconds before the deadline"] = checkOf(
          await set(
            w,
            "next_attempt_at = send_deadline - interval '899 seconds'",
          ),
        );
        got["9 NULL: waiting with no deadline"] = checkOf(
          await set(q, "status = 'retry_wait'"),
        );
        got["10: max_attempts 0"] = checkOf(await set(q, "max_attempts = 0"));
        got["10: more attempts than allowed"] = checkOf(
          await set(w, "max_attempts = 1, attempt_count = 2"),
        );
        got["11: another request kind"] = checkOf(
          await set(q, "request_kind = 'refund'"),
        );
        got["11: a fund on a request"] = checkOf(
          await set(q, "fund_id = gen_random_uuid()"),
        );
        got["11: a digest that does not match"] = checkOf(
          await set(q, "request_digest = repeat('0', 64)"),
        );
        got["11 NULL: no request kind"] = checkOf(
          await set(q, "request_kind = NULL"),
        );
        got["11 NULL: no mode"] = checkOf(await set(q, "livemode = NULL"));
        const params = requestParams(q, queued.donationId, queued.amount) as {
          metadata: Record<string, string>;
        };
        delete (params.metadata as Record<string, string | undefined>)
          .asym_intake;
        got["11 params NULL: no asym_intake"] = checkOf(
          await setParams(q, params),
        );
        got["donations: a third intake format"] = checkOf(
          await setDonation(queued.donationId, "intake_format = 'third'"),
        );
        got["donations: a line-based intake with a fund"] = checkOf(
          await setDonation(queued.donationId, "fund_id = gen_random_uuid()"),
        );
        got["donations NULL: a line-based intake with no account"] = checkOf(
          await setDonation(queued.donationId, "provider_account_ref = NULL"),
        );
        got["donations: a legacy intake with a mode"] = checkOf(
          await setDonation(legacy.donation_id, "livemode = false"),
        );
        const withoutAll = async (
          statements: string[],
          fn: () => Promise<Attempt>,
        ) => {
          await role(db, null);
          await db.query("SAVEPOINT r1a_without_all");
          for (const statement of statements)
            await db.query(
              `ALTER TABLE public.donation_saga_outbox ${statement}`,
            );
          const r = await fn();
          await db.query("ROLLBACK TO SAVEPOINT r1a_without_all");
          return r;
        };
        const codeOf = (a: Attempt) => (a.ok ? "accepted" : `${a.code}`);
        got["kind NULL: NOT NULL refuses it first"] = codeOf(
          await set(q, "kind = NULL"),
        );
        got["status NULL (its NOT NULL and the other status checks removed)"] =
          checkOf(
            await withoutAll(
              [
                "ALTER COLUMN status DROP NOT NULL",
                ...[
                  "lease",
                  "object",
                  "parked_at",
                  "retry_window",
                  "unknown",
                  "unsent",
                ].map((c) => `DROP CONSTRAINT donation_saga_outbox_${c}_check`),
              ],
              () => set(q, "status = NULL"),
            ),
          );
        got["8 NULL: outcome_unknown NULL (its NOT NULL removed)"] = checkOf(
          await withoutAll(["ALTER COLUMN outcome_unknown DROP NOT NULL"], () =>
            set(q, "outcome_unknown = NULL"),
          ),
        );
        got["10 NULL: max_attempts NULL (its NOT NULL removed)"] = checkOf(
          await withoutAll(["ALTER COLUMN max_attempts DROP NOT NULL"], () =>
            set(q, "max_attempts = NULL"),
          ),
        );
        got["10 NULL: attempt_count NULL (its NOT NULL removed)"] = checkOf(
          await withoutAll(["ALTER COLUMN attempt_count DROP NOT NULL"], () =>
            set(q, "attempt_count = NULL"),
          ),
        );
        got["11 NULL: no account"] = checkOf(
          await set(q, "provider_account_ref = NULL"),
        );
        got["11 NULL: no request parameters"] = checkOf(
          await set(q, "request_params = NULL"),
        );
        got["11 NULL: no digest"] = checkOf(
          await set(q, "request_digest = NULL"),
        );
        got["donations NULL: intake_format NULL: NOT NULL refuses it first"] =
          codeOf(await setDonation(queued.donationId, "intake_format = NULL"));
        expect(got).toEqual({
          "kind NULL: NOT NULL refuses it first": "23502",
          "status NULL (its NOT NULL and the other status checks removed)":
            "23514 donation_saga_outbox_status_check",
          "8 NULL: outcome_unknown NULL (its NOT NULL removed)":
            "23514 donation_saga_outbox_unknown_check",
          "10 NULL: max_attempts NULL (its NOT NULL removed)":
            "23514 donation_saga_outbox_attempts_check",
          "10 NULL: attempt_count NULL (its NOT NULL removed)":
            "23514 donation_saga_outbox_attempts_check",
          "11 NULL: no account": "23514 donation_saga_outbox_request_check",
          "11 NULL: no request parameters":
            "23514 donation_saga_outbox_request_check",
          "11 NULL: no digest": "23514 donation_saga_outbox_request_check",
          "donations NULL: intake_format NULL: NOT NULL refuses it first":
            "23502",
          "kind: a third kind": "23514 donation_saga_outbox_kind_check",
          "status: a legacy status on a provider row":
            "23514 donation_saga_outbox_status_check",
          "status: a provider status on a legacy row":
            "23514 donation_saga_outbox_status_check",
          "legacy: a request kind on a legacy row":
            "23514 donation_saga_outbox_legacy_check",
          "legacy NULL: no donor on a legacy row":
            "23514 donation_saga_outbox_legacy_check",
          "2: attempt 0 on a sent row": "23514 donation_saga_outbox_sent_check",
          "2 NULL: sent at NULL with a deadline":
            "23514 donation_saga_outbox_sent_check",
          "3: queued with a send time":
            "23514 donation_saga_outbox_unsent_check",
          "3 NULL: refused never sent":
            "23514 donation_saga_outbox_unsent_check",
          "4: a 24-hour window": "23514 donation_saga_outbox_window_check",
          "4 NULL: a deadline with no first send (sent check removed)":
            "23514 donation_saga_outbox_window_check",
          "5: a lease while waiting": "23514 donation_saga_outbox_lease_check",
          "5 NULL: a lease with no deadline":
            "23514 donation_saga_outbox_lease_check",
          "6: a charge id as the object":
            "23514 donation_saga_outbox_object_check",
          "6 NULL: linked with no object":
            "23514 donation_saga_outbox_object_check",
          "7: parked_at while waiting":
            "23514 donation_saga_outbox_parked_at_check",
          "7 NULL: parked with no parked_at":
            "23514 donation_saga_outbox_parked_at_check",
          "8: parked and known": "23514 donation_saga_outbox_unknown_check",
          "8: dead letter and unknown":
            "23514 donation_saga_outbox_unknown_check",
          "9: a retry due 899 seconds before the deadline":
            "23514 donation_saga_outbox_retry_window_check",
          "9 NULL: waiting with no deadline":
            "23514 donation_saga_outbox_retry_window_check",
          "10: max_attempts 0": "23514 donation_saga_outbox_attempts_check",
          "10: more attempts than allowed":
            "23514 donation_saga_outbox_attempts_check",
          "11: another request kind":
            "23514 donation_saga_outbox_request_check",
          "11: a fund on a request": "23514 donation_saga_outbox_request_check",
          "11: a digest that does not match":
            "23514 donation_saga_outbox_request_check",
          "11 NULL: no request kind":
            "23514 donation_saga_outbox_request_check",
          "11 NULL: no mode": "23514 donation_saga_outbox_request_check",
          "11 params NULL: no asym_intake":
            "23514 donation_saga_outbox_request_params_check",
          "donations: a third intake format":
            "23514 donations_intake_format_check",
          "donations: a line-based intake with a fund":
            "23514 donations_line_based_check",
          "donations NULL: a line-based intake with no account":
            "23514 donations_line_based_check",
          "donations: a legacy intake with a mode":
            "23514 donations_legacy_header_check",
        });

        const notNull = (
          await db.query(
            `SELECT string_agg(attrelid::regclass || '.' || attname, ',' ORDER BY attrelid::regclass::text, attname) AS cols
               FROM pg_attribute
              WHERE attnotnull AND NOT attisdropped
                AND ((attrelid = 'public.donation_saga_outbox'::regclass
                      AND attname IN ('kind', 'status', 'outcome_unknown', 'max_attempts', 'attempt_count'))
                  OR (attrelid = 'public.donations'::regclass AND attname = 'intake_format'))`,
          )
        ).rows[0].cols;
        expect(notNull).toBe(
          "donation_saga_outbox.attempt_count,donation_saga_outbox.kind,donation_saga_outbox.max_attempts,donation_saga_outbox.outcome_unknown,donation_saga_outbox.status,donations.intake_format",
        );

        const budgets: string[] = [];
        for (const max of [21, 1000]) {
          const r = await set(q, `max_attempts = ${max}`);
          budgets.push(r.ok ? `${max} ok` : `${max} ${checkOf(r)}`);
        }
        expect(budgets).toEqual(["21 ok", "1000 ok"]);
        const fresh = await guardIntake(db, fx.A, { maxAttempts: 1000 });
        expect((await rowOf(db, fresh.operationId)).max_attempts).toBe(1000);
      }));

    it("C9 (finding 6; narrowed by R1b, record :1062): a provider-row check or the legacy check whose clauses the NULL matrix above does not each refuse is written '<kind test> OR (<predicate>) IS TRUE', so a NULL in any clause refuses; the attempts and window checks leave this form test because the matrix refuses a NULL in each of their clauses (max_attempts and attempt_count; first_sent_at), and the ten others stay", async () => {
      const defs = (
        await db.query(
          `SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint
            WHERE conrelid = 'public.donation_saga_outbox'::regclass AND contype = 'c'
              AND conname NOT IN ('donation_saga_outbox_amount_check', 'donation_saga_outbox_kind_check', 'donation_saga_outbox_status_check')
            ORDER BY conname COLLATE "C"`,
        )
      ).rows as { conname: string; def: string }[];
      expect(defs.map((d) => d.conname)).toEqual([
        "donation_saga_outbox_attempts_check",
        "donation_saga_outbox_lease_check",
        "donation_saga_outbox_legacy_check",
        "donation_saga_outbox_object_check",
        "donation_saga_outbox_parked_at_check",
        "donation_saga_outbox_request_check",
        "donation_saga_outbox_request_params_check",
        "donation_saga_outbox_retry_window_check",
        "donation_saga_outbox_sent_check",
        "donation_saga_outbox_unknown_check",
        "donation_saga_outbox_unsent_check",
        "donation_saga_outbox_window_check",
      ]);
      const provenByTheMatrix = [
        "donation_saga_outbox_attempts_check",
        "donation_saga_outbox_window_check",
      ];
      const sampled = defs.filter(
        (d) => !provenByTheMatrix.includes(d.conname),
      );
      expect(sampled).toHaveLength(10);
      for (const { conname, def } of sampled)
        expect(def, conname).toMatch(
          /^CHECK \(\(\(kind <> '(?:provider_request|legacy_saga)'::text\) OR \([\s\S]* IS TRUE\)\)\)$/,
        );
    });
  },
);
