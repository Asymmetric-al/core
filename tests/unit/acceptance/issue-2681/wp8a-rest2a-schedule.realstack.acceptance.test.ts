import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  ageIntake,
  begin,
  begun,
  claim,
  claimEvent,
  expireLease,
  inTx,
  paymentIntent,
  rest2aWorld,
  role,
  storeEvent,
  type Outcome,
} from "./wp8a-rest2a-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 2a: what the money schedule reads and reconciles (record 1012, issue 2776; real stack, every test rolled back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const world = () => rest2aWorld(db);

    describe("the reconciliation reads each mapped account (record 1012, issue 2776)", () => {
      async function reconcile(
        accountRow: string,
        snapshot: Record<string, unknown>,
      ) {
        await role(db, "service_role");
        await db.query("SAVEPOINT rest2a_reconcile");
        try {
          const r = (
            await db.query(
              "SELECT public.reconcile_payment_account($1, $2::jsonb) AS r",
              [accountRow, JSON.stringify(snapshot)],
            )
          ).rows[0].r as Outcome;
          await db.query("RELEASE SAVEPOINT rest2a_reconcile");
          return r;
        } catch (e) {
          await db.query("ROLLBACK TO SAVEPOINT rest2a_reconcile");
          const err = e as { code?: string; message?: string };
          return { refusal: `${err.code} ${err.message}` } as Outcome;
        } finally {
          await role(db, null);
        }
      }

      it("a reading that agrees changes nothing; one that disagrees opens one drift task and never moves the binding", () =>
        inTx(db, async () => {
          const w = await world();
          await role(db, null);
          const accountRow = (
            await db.query(
              "SELECT id FROM public.payment_provider_accounts WHERE tenant_id = $1",
              [w.A.tenant],
            )
          ).rows[0].id as string;
          const reading = {
            id: w.A.account,
            livemode: false,
            closed: false,
            card_payments_status: "active",
          };
          expect(await reconcile(accountRow, reading)).toMatchObject({
            outcome: "in_line",
            binding_status: "active",
          });
          const closed = await reconcile(accountRow, {
            ...reading,
            closed: true,
          });
          expect(closed).toMatchObject({
            outcome: "drift_flagged",
            observed: "disconnected",
            binding_status: "active",
          });
          expect(
            await reconcile(accountRow, {
              ...reading,
              card_payments_status: "inactive",
            }),
          ).toMatchObject({
            outcome: "already_flagged",
            task_id: closed.task_id,
          });
          await role(db, null);
          const binding = (
            await db.query(
              "SELECT status FROM public.payment_account_bindings WHERE id = $1",
              [w.A.binding],
            )
          ).rows[0].status;
          expect(binding).toBe("active");
          const tasks = (
            await db.query(
              `SELECT t.id, array(SELECT l.record_type || ':' || l.record_id FROM public.mission_control_task_links AS l
                                   WHERE l.task_id = t.id) AS links
                 FROM public.mission_control_tasks AS t
                WHERE t.tenant_id = $1 AND t.issue_type = 'payment_account_drift'`,
              [w.A.tenant],
            )
          ).rows;
          expect(tasks).toEqual([
            {
              id: closed.task_id,
              links: [`payment_account_binding:${w.A.binding}`],
            },
          ]);
        }));

      it("a reading of another account or mode is refused; only service_role calls it", () =>
        inTx(db, async () => {
          const w = await world();
          await role(db, null);
          const accountRow = (
            await db.query(
              "SELECT id FROM public.payment_provider_accounts WHERE tenant_id = $1",
              [w.A.tenant],
            )
          ).rows[0].id as string;
          expect(
            await reconcile(accountRow, {
              id: w.B.account,
              livemode: false,
              closed: true,
            }),
          ).toEqual({
            refusal: "22023 snapshot_mismatch",
          });
          expect(
            await reconcile(accountRow, {
              id: w.A.account,
              livemode: true,
              closed: true,
            }),
          ).toEqual({
            refusal: "22023 snapshot_mismatch",
          });
          await role(db, null);
          const rows = (
            await db.query(
              `SELECT r, has_function_privilege(r, 'public.reconcile_payment_account(uuid,jsonb)', 'EXECUTE') AS can
                 FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS r ORDER BY r`,
            )
          ).rows;
          expect(rows.map((r) => r.can)).toEqual([false, false, true]);
        }));

      async function accountsDue(limit: number) {
        await role(db, "service_role");
        const rows = (
          await db.query(
            "SELECT id, detail FROM public.money_due_work($1) WHERE kind = 'account'",
            [limit],
          )
        ).rows as Array<{ id: string; detail: string }>;
        await role(db, null);
        return rows;
      }

      async function eligibleAccounts() {
        await role(db, null);
        return (
          await db.query(
            `SELECT a.id, a.reconciled_at
               FROM public.payment_provider_accounts AS a
               JOIN public.payment_account_bindings AS b
                 ON b.tenant_id = a.tenant_id AND b.legal_entity_id = a.legal_entity_id
                AND b.provider_account_ref = a.provider_account_id AND b.livemode = a.livemode
              WHERE a.livemode = false AND b.status IN ('pending', 'active', 'restricted')`,
          )
        ).rows as Array<{ id: string; reconciled_at: string | null }>;
      }

      it("F5: every connected test account whose binding is pending, active or restricted is read within ceil(N / limit) ticks: N accounts, a limit of N - 1, two ticks; a pending binding is listed", () =>
        inTx(db, async () => {
          const w = await world();
          await role(db, null);
          await db.query(
            "UPDATE public.payment_account_bindings SET status = 'pending' WHERE id = $1",
            [w.B.binding],
          );
          const eligible = (await eligibleAccounts()).map((a) => a.id).sort();
          const limit = eligible.length - 1;
          const first = await accountsDue(limit);
          expect(first).toHaveLength(limit);
          for (const row of first)
            await reconcile(row.id, {
              id: row.detail,
              livemode: false,
              closed: false,
              card_payments_status: "active",
            });
          const second = await accountsDue(limit);
          expect(
            [...new Set([...first, ...second].map((r) => r.id))].sort(),
          ).toEqual(eligible);
        }));

      it("F5: a reconciliation whose provider read failed is stamped and counted, opens nothing and moves no binding, and its account goes behind those never read", () =>
        inTx(db, async () => {
          const w = await world();
          await role(db, null);
          const rowOf = async (tenant: string) =>
            (
              await db.query(
                "SELECT id FROM public.payment_provider_accounts WHERE tenant_id = $1 AND livemode = false",
                [tenant],
              )
            ).rows[0].id as string;
          const failedRow = await rowOf(w.A.tenant);
          const freshRow = await rowOf(w.B.tenant);
          expect(
            await reconcile(failedRow, {
              id: w.A.account,
              livemode: false,
              read_failed: true,
            }),
          ).toMatchObject({ outcome: "read_failed", binding_status: "active" });
          await role(db, null);
          const drift = (
            await db.query(
              "SELECT count(*)::int AS n FROM public.mission_control_tasks WHERE tenant_id = $1 AND issue_type = 'payment_account_drift'",
              [w.A.tenant],
            )
          ).rows[0].n;
          expect(drift).toBe(0);
          const accounts = await eligibleAccounts();
          const failedAccount = accounts.find((a) => a.id === failedRow);
          expect(failedAccount).toBeDefined();
          expect(failedAccount!.reconciled_at).toBeInstanceOf(Date);
          const neverRead = accounts.filter((a) => a.reconciled_at === null);
          expect(neverRead.map((a) => a.id)).toContain(freshRow);
          const due = (await accountsDue(neverRead.length)).map((r) => r.id);
          expect(due).toContain(freshRow);
          expect(due).not.toContain(failedRow);
          const all = (await accountsDue(accounts.length)).map((r) => r.id);
          expect(all).toContain(failedRow);
          expect(all.indexOf(failedRow)).toBeGreaterThan(
            Math.max(...neverRead.map((a) => all.indexOf(a.id))),
          );
        }));
    });

    describe("the due work the schedule reads (one function, nothing to do leaves at once)", () => {
      async function due() {
        await role(db, "service_role");
        const rows = (
          await db.query(
            "SELECT kind, id, detail FROM public.money_due_work(50) ORDER BY kind, id",
          )
        ).rows as Array<{ kind: string; id: string; detail: string | null }>;
        await role(db, null);
        return rows;
      }

      async function backdate(table: string, column: string, id: string) {
        await role(db, null);
        await db.query("SAVEPOINT rest2a_backdate");
        await db.query("SET LOCAL session_replication_role = replica");
        await db.query(
          `UPDATE public.${table} SET ${column} = clock_timestamp() - interval '3 minutes' WHERE id = $1`,
          [id],
        );
        await db.query("SET LOCAL session_replication_role = origin");
        await db.query("RELEASE SAVEPOINT rest2a_backdate");
      }

      async function storeAccountEvent(side: {
        tenant: string;
        account: string;
      }) {
        await role(db, null);
        return (
          await db.query(
            `INSERT INTO public.stripe_connect_events
               (tenant_id, stripe_event_id, event_type, livemode, provider_account_id, event_created_at, payload_sha256, raw_payload)
             VALUES ($1, $2, 'v2.core.account.updated', false, $3, now(), repeat('a', 64), '{}'::jsonb)
             RETURNING id`,
            [
              side.tenant,
              `evt_${randomUUID().replaceAll("-", "")}`,
              side.account,
            ],
          )
        ).rows[0].id as string;
      }

      it("names a request due again, a request whose lease ran out, an intake unpaid for seven days, events no one finished and each mapped account; nothing the route is still doing", () =>
        inTx(db, async () => {
          const w = await world();
          const gift = async (amount: number) =>
            begun(
              await begin(db, {
                host: w.hostsA.site,
                lines: [{ fund: w.A.fund, amount }],
              }),
            );
          const fresh = await gift(1000);
          const queued = await gift(1100);
          await backdate(
            "donation_saga_outbox",
            "next_attempt_at",
            queued.operation_id,
          );
          const leased = await gift(1200);
          await claim(db, leased.operation_id);
          await expireLease(db, leased.operation_id);
          const old = await gift(1300);
          await ageIntake(db, old.donation_id, 8);
          const justStored = await storeEvent(db, w.A, { pi: paymentIntent() });
          const stale = await storeEvent(db, w.A, { pi: paymentIntent() });
          await backdate("stripe_connect_events", "received_at", stale.id);
          const accountEvent = await storeAccountEvent(w.A);
          await backdate("stripe_connect_events", "received_at", accountEvent);
          await role(db, null);
          const mapped = (
            await db.query(
              "SELECT id FROM public.payment_provider_accounts WHERE tenant_id = $1",
              [w.A.tenant],
            )
          ).rows[0].id as string;
          const watched = [
            fresh.operation_id,
            queued.operation_id,
            leased.operation_id,
            old.operation_id,
            old.donation_id,
            fresh.donation_id,
            justStored.id,
            stale.id,
            accountEvent,
            mapped,
          ];
          const mine = (await due()).filter((r) => watched.includes(r.id));
          const expected = [
            { kind: "account", id: mapped, detail: w.A.account },
            {
              kind: "account_event",
              id: accountEvent,
              detail: `v2.core.account.updated|${w.A.account}`,
            },
            {
              kind: "operation",
              id: queued.operation_id,
              detail: "create_payment",
            },
            {
              kind: "operation",
              id: leased.operation_id,
              detail: "create_payment",
            },
            {
              kind: "payment_event",
              id: stale.id,
              detail: "payment_intent.succeeded",
            },
            { kind: "unpaid", id: old.donation_id, detail: null },
          ];
          const order = (r: { kind: string; id: string }) =>
            `${r.kind}/${r.id}`;
          expect(mine.sort((a, b) => order(a).localeCompare(order(b)))).toEqual(
            expected.sort((a, b) => order(a).localeCompare(order(b))),
          );
          await role(db, null);
          await db.query(
            "UPDATE public.stripe_connect_events SET processing_status = 'failed', next_attempt_at = now() + interval '1 hour', failed_at = now(), process_attempts = 1 WHERE id = $1",
            [stale.id],
          );
          await db.query(
            "UPDATE public.payment_account_bindings SET status = 'disconnected', disconnected_at = now() WHERE id = $1",
            [w.A.binding],
          );
          const after = (await due()).map((r) => r.id);
          expect(after).not.toContain(stale.id);
          expect(after).not.toContain(mapped);
        }));

      it("T3: names a failed event that is due again and an event whose claim lease ran out", () =>
        inTx(db, async () => {
          const w = await world();
          const failedDue = await storeEvent(db, w.A, { pi: paymentIntent() });
          await role(db, null);
          await db.query(
            "UPDATE public.stripe_connect_events SET processing_status = 'failed', next_attempt_at = now() - interval '1 second', failed_at = now(), process_attempts = 1 WHERE id = $1",
            [failedDue.id],
          );
          const leased = await storeEvent(db, w.A, { pi: paymentIntent() });
          expect((await claimEvent(db, leased.id)).claimed).toBe(true);
          await backdate(
            "stripe_connect_events",
            "lease_expires_at",
            leased.id,
          );
          const listed = (await due())
            .filter((r) => r.kind === "payment_event")
            .map((r) => r.id);
          expect(listed).toEqual(
            expect.arrayContaining([failedDue.id, leased.id]),
          );
        }));

      it("only service_role reads it", () =>
        inTx(db, async () => {
          await role(db, null);
          const rows = (
            await db.query(
              `SELECT r, has_function_privilege(r, 'public.money_due_work(integer)', 'EXECUTE') AS can
                 FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS r ORDER BY r`,
            )
          ).rows;
          expect(rows.map((r) => r.can)).toEqual([false, false, true]);
        }));
    });
  },
);
