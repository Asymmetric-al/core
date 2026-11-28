import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  BEGIN_SQL,
  IN_MIGRATE_JOB,
  accountClosedEvent,
  admitHosts,
  begin,
  beginArgs,
  begun,
  blockedBy,
  claim,
  feeFund,
  giftIntake,
  inTx,
  launch,
  makeDue,
  pidOf,
  replica,
  report,
  requestRow,
  role,
  said,
  seedTwoTenants,
  twoSessions,
} from "./wp8a-rest2a-harness";

const CLAIM_SQL = "SELECT public.claim_provider_operation($1::uuid, 300) AS r";
const APPLY_SQL = "SELECT public.apply_account_event($1, 1, NULL) AS r";

const outcomeOf = (a: Awaited<ReturnType<typeof launch>>) =>
  a.ok ? (a.rows[0]!.r as { outcome: string }).outcome : said(a);

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 2b item zero: issue 2857 items 18, 19, 35 and 36 (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function committed<T>(fn: () => Promise<T>): Promise<T> {
      await db.query("BEGIN");
      try {
        const value = await fn();
        await db.query("COMMIT");
        return value;
      } catch (error) {
        await db.query("ROLLBACK");
        throw error;
      }
    }

    async function claimIn(session: pg.Client, operationId: string) {
      await session.query("BEGIN");
      await session.query("SET LOCAL ROLE service_role");
      await session.query(
        "SELECT pg_catalog.set_config('app.current_tenant_id', '', true)",
      );
      return launch(session, CLAIM_SQL, [operationId]);
    }

    describe("item 18: the worker's claim reads the organization and the binding under lock", () => {
      it("a queued create_payment of a suspended organization answers organization_inactive and is not claimed", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const hosts = await admitHosts(db, fx.A);
          await feeFund(db, fx.A);
          const gift = begun(
            await begin(db, {
              host: hosts.site,
              lines: [{ fund: fx.A.fund, amount: 1500 }],
            }),
          );
          await role(db, null);
          await db.query(
            "UPDATE public.tenants SET status = 'suspended' WHERE id = $1",
            [fx.A.tenant],
          );
          expect(await claim(db, gift.operation_id)).toMatchObject({
            outcome: "organization_inactive",
            organization_status: "suspended",
          });
          expect(await requestRow(db, gift.operation_id)).toMatchObject({
            status: "queued",
            attempt_count: 0,
          });
        }));

      it("two sessions: the organization is suspended while the claim waits on it: organization_inactive, nothing claimed", () =>
        twoSessions(db, ADMIN_URL, async (s1, s2, fx, hosts) => {
          await committed(() => feeFund(db, fx.A));
          const gift = await committed(async () =>
            begun(
              await begin(db, {
                host: hosts.site,
                lines: [{ fund: fx.A.fund, amount: 1500 }],
              }),
            ),
          );
          const pid2 = await pidOf(s2);
          await s1.query("BEGIN");
          await s1.query(
            "UPDATE public.tenants SET status = 'suspended' WHERE id = $1",
            [fx.A.tenant],
          );
          const pending = claimIn(s2, gift.operation_id);
          const waited = await blockedBy(db, pid2);
          await s1.query("COMMIT");
          const answer = await pending;
          await s2.query("COMMIT");
          expect({ waited, outcome: outcomeOf(answer) }).toEqual({
            waited: true,
            outcome: "organization_inactive",
          });
          expect(await requestRow(db, gift.operation_id)).toMatchObject({
            status: "queued",
            attempt_count: 0,
          });
        }));

      it("two sessions: the binding is disconnected while the claim waits on it: binding_inactive, and a request whose outcome is unknown is not sent again", () =>
        twoSessions(db, ADMIN_URL, async (s1, s2, fx, hosts) => {
          await committed(() => feeFund(db, fx.A));
          const gift = await committed(async () => {
            const g = begun(
              await begin(db, {
                host: hosts.site,
                lines: [{ fund: fx.A.fund, amount: 1500 }],
              }),
            );
            await claim(db, g.operation_id);
            await report(db, g.operation_id, 1, {
              result: "unknown",
              retry_delay_seconds: 30,
              error_code: "stripe_timeout",
            });
            await makeDue(db, g.operation_id);
            return g;
          });
          const eventId = await committed(() => accountClosedEvent(db, fx.A));
          const pid2 = await pidOf(s2);
          await s1.query("BEGIN");
          await s1.query("SET LOCAL ROLE service_role");
          const applied = (await s1.query(APPLY_SQL, [eventId])).rows[0].r as {
            status: string;
          };
          expect(applied.status).toBe("disconnected");
          const pending = claimIn(s2, gift.operation_id);
          const waited = await blockedBy(db, pid2);
          await s1.query("COMMIT");
          const answer = await pending;
          await s2.query("COMMIT");
          expect({ waited, outcome: outcomeOf(answer) }).toEqual({
            waited: true,
            outcome: "binding_inactive",
          });
          expect(await requestRow(db, gift.operation_id)).toMatchObject({
            status: "retry_wait",
            outcome_unknown: true,
            attempt_count: 1,
          });
        }));
    });

    describe("item 19: a disconnect opens a staff-visible task for a request whose outcome is unknown", () => {
      it("the unknown request is linked to the disconnect task, keeps its status, and is never sent again", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const hosts = await admitHosts(db, fx.A);
          await feeFund(db, fx.A);
          const gift = begun(
            await begin(db, {
              host: hosts.site,
              lines: [{ fund: fx.A.fund, amount: 1500 }],
            }),
          );
          await claim(db, gift.operation_id);
          await report(db, gift.operation_id, 1, {
            result: "unknown",
            retry_delay_seconds: 30,
            error_code: "stripe_timeout",
          });
          const eventId = await accountClosedEvent(db, fx.A);
          await role(db, "service_role");
          const applied = (await db.query(APPLY_SQL, [eventId])).rows[0].r as {
            task_id: string;
            status: string;
          };
          await role(db, null);
          expect(applied.status).toBe("disconnected");
          const links = (
            await db.query(
              `SELECT t.id AS task, t.issue_type, l.record_type, l.relationship, l.metadata ->> 'status' AS status
                 FROM public.mission_control_task_links AS l
                 JOIN public.mission_control_tasks AS t ON t.id = l.task_id AND t.tenant_id = l.tenant_id
                WHERE l.tenant_id = $1 AND l.record_id = $2`,
              [fx.A.tenant, gift.operation_id],
            )
          ).rows;
          expect(links).toEqual([
            {
              task: applied.task_id,
              issue_type: "payment_account_disconnected",
              record_type: "donation_saga_outbox",
              relationship: "provider_request_outcome_unknown_disconnected",
              status: "retry_wait",
            },
          ]);
          expect(await requestRow(db, gift.operation_id)).toMatchObject({
            status: "retry_wait",
            outcome_unknown: true,
          });
          await makeDue(db, gift.operation_id);
          expect(await claim(db, gift.operation_id)).toMatchObject({
            outcome: "binding_inactive",
          });
        }));

      it("two sessions: a first send claimed while the disconnect waits on its binding is linked to the disconnect task as sending", () =>
        twoSessions(db, ADMIN_URL, async (s1, s2, fx, hosts) => {
          await committed(() => feeFund(db, fx.A));
          const gift = await committed(async () =>
            begun(
              await begin(db, {
                host: hosts.site,
                lines: [{ fund: fx.A.fund, amount: 1500 }],
              }),
            ),
          );
          const eventId = await committed(() => accountClosedEvent(db, fx.A));
          const pid2 = await pidOf(s2);
          const claimed = await claimIn(s1, gift.operation_id);
          expect(outcomeOf(claimed)).toBe("claimed");
          await s2.query("BEGIN");
          await s2.query("SET LOCAL ROLE service_role");
          const applying = launch(s2, APPLY_SQL, [eventId]);
          const waited = await blockedBy(db, pid2);
          await s1.query("COMMIT");
          const applied = await applying;
          await s2.query("COMMIT");
          expect({ waited, applied: said(applied) }).toEqual({
            waited: true,
            applied: "committed",
          });
          const task = applied.ok
            ? (applied.rows[0]!.r as { task_id: string }).task_id
            : null;
          const links = (
            await db.query(
              `SELECT l.task_id AS task, l.relationship, l.metadata ->> 'status' AS status
                 FROM public.mission_control_task_links AS l
                WHERE l.tenant_id = $1 AND l.record_id = $2`,
              [fx.A.tenant, gift.operation_id],
            )
          ).rows;
          expect(links).toEqual([
            {
              task,
              relationship: "provider_request_outcome_unknown_disconnected",
              status: "sending",
            },
          ]);
          expect(await requestRow(db, gift.operation_id)).toMatchObject({
            status: "sending",
            attempt_count: 1,
          });
        }));
    });

    describe("issue 2857 item 18, completed: a refused claim is not offered again at once", () => {
      it("25 refused requests of a suspended organization do not keep another organization's due request from the worker", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const hostsA = await admitHosts(db, fx.A);
          const hostsB = await admitHosts(db, fx.B);
          await feeFund(db, fx.A);
          await feeFund(db, fx.B);
          const refused: string[] = [];
          for (let i = 0; i < 25; i += 1)
            refused.push(
              begun(
                await begin(db, {
                  host: hostsA.site,
                  lines: [{ fund: fx.A.fund, amount: 1000 + i }],
                }),
              ).operation_id,
            );
          const other = begun(
            await begin(db, {
              host: hostsB.site,
              lines: [{ fund: fx.B.fund, amount: 1500 }],
            }),
          ).operation_id;
          await replica(
            db,
            `UPDATE public.donation_saga_outbox AS o
                SET next_attempt_at = timestamptz '2000-01-01 00:00:00+00' + make_interval(secs => r.n)
               FROM unnest($1::uuid[]) WITH ORDINALITY AS r(id, n)
              WHERE o.id = r.id`,
            [refused],
          );
          await replica(
            db,
            "UPDATE public.donation_saga_outbox SET next_attempt_at = timestamptz '2000-01-01 01:00:00+00' WHERE id = $1",
            [other],
          );
          await role(db, null);
          await db.query(
            "UPDATE public.tenants SET status = 'suspended' WHERE id = $1",
            [fx.A.tenant],
          );
          for (const id of refused)
            expect(await claim(db, id)).toMatchObject({
              outcome: "organization_inactive",
            });
          await role(db, "service_role");
          const due = (
            await db.query(
              "SELECT d.id FROM public.money_due_work(25) AS d WHERE d.kind = 'operation'",
            )
          ).rows.map((row) => row.id as string);
          await role(db, null);
          expect(due).toContain(other);
          expect(due.filter((id) => refused.includes(id))).toEqual([]);
        }));
    });

    describe("item 35: two requests with one key serialize before the first read", () => {
      it("the second request waits for the first before it reads the key, so it is answered from the stored gift (here 409 idempotency_key_reused, its details differing) and never from a check made while the first was uncommitted (here target_not_found)", () =>
        twoSessions(db, ADMIN_URL, async (s1, s2, fx, hosts) => {
          await committed(() => feeFund(db, fx.A));
          const key = randomUUID();
          const pid2 = await pidOf(s2);
          await s1.query("BEGIN");
          await s1.query("SET LOCAL ROLE service_role");
          await s1.query(
            BEGIN_SQL,
            beginArgs({
              host: hosts.site,
              key,
              lines: [{ fund: fx.A.fund, amount: 2500 }],
            }),
          );
          await s2.query("BEGIN");
          await s2.query("SET LOCAL ROLE service_role");
          const second = launch(
            s2,
            BEGIN_SQL,
            beginArgs({
              host: hosts.site,
              key,
              lines: [{ fund: fx.B.fund, amount: 2500 }],
            }),
          );
          const waited = await blockedBy(db, pid2);
          await s1.query("COMMIT");
          const answer = await second;
          await s2.query("ROLLBACK");
          expect({ waited, answer: said(answer) }).toEqual({
            waited: true,
            answer: "23505 idempotency_key_reused",
          });
        }));
    });

    describe("item 36: a login's lifetime counts its donorless gifts without the 251-row list", () => {
      it("252 settled donorless gifts of one login are all counted", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const user = randomUUID();
          for (let i = 0; i < 252; i += 1)
            await giftIntake(db, fx.A, {
              actor: { user, email: null, confirmed: true },
              lines: [{ amount: 100 }],
            });
          await replica(
            db,
            "UPDATE public.donations SET status = 'completed' WHERE tenant_id = $1 AND intake_format = 'line_based'",
            [fx.A.tenant],
          );
          await role(db, "service_role");
          const lifetime = (
            await db.query(
              "SELECT * FROM public.donor_portal_login_lifetime($1, $2, $3)",
              [fx.A.tenant, randomUUID(), user],
            )
          ).rows;
          await role(db, null);
          expect(lifetime).toEqual([
            { given_cents: "25200", gift_count: "252" },
          ]);
        }));
    });
  },
);
