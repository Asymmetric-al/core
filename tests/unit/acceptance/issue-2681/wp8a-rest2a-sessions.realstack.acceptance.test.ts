import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  BEGIN_SQL,
  IN_MIGRATE_JOB,
  blockedBy,
  launch,
  pidOf,
  said,
  twoSessions,
  begin,
  beginArgs,
  begun,
  claim,
  claimEvent,
  guestContact,
  intakeCounts,
  paymentIntent,
  report,
  storeEvent,
  verifiedActor,
  work,
  type Fixture,
  type GiftRequest,
  type Hosts,
} from "./wp8a-rest2a-harness";

const outcomeOf = (a: Awaited<ReturnType<typeof launch>>) =>
  a.ok ? (a.rows[0]!.r as { outcome: string }).outcome : said(a);

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 2a: two sessions at once (committed, removed in finally; real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    describe("a change committed while the command waits on its lock", () => {
      function race(
        change: (fx: Fixture, hosts: Hosts, s1: pg.Client) => Promise<void>,
        request: (fx: Fixture, hosts: Hosts) => GiftRequest = (fx, hosts) => ({
          host: hosts.site,
          lines: [{ fund: fx.A.fund, amount: 1000 }],
        }),
      ) {
        return twoSessions(db, ADMIN_URL, async (s1, s2, fx, hosts) => {
          const pid2 = await pidOf(s2);
          await s1.query("BEGIN");
          await change(fx, hosts, s1);
          await s2.query("BEGIN");
          await s2.query("SET LOCAL ROLE service_role");
          const pending = launch(s2, BEGIN_SQL, beginArgs(request(fx, hosts)));
          const waited = await blockedBy(db, pid2);
          await s1.query("COMMIT");
          const outcome = said(await pending);
          await s2.query("ROLLBACK");
          return {
            waited,
            outcome,
            counts: await intakeCounts(db, fx.A.tenant),
            countsB: await intakeCounts(db, fx.B.tenant),
          };
        });
      }

      it("(a) the name loses its activation while the command waits on the name: host_not_admitted, nothing written", async () => {
        const r = await race((_fx, hosts, s1) =>
          s1
            .query(
              "UPDATE public.site_domains SET activation_proved_at = NULL WHERE host = $1",
              [hosts.site],
            )
            .then(() => undefined),
        );
        expect(r).toMatchObject({
          waited: true,
          outcome: "42501 host_not_admitted",
          counts: { intakes: 0, keys: 0 },
        });
      });

      it("(b) the Site turns inactive while the command waits on the Site: host_not_admitted, nothing written", async () => {
        const r = await race((_fx, hosts, s1) =>
          s1
            .query(
              "UPDATE public.sites SET status = 'inactive' WHERE id = $1",
              [hosts.siteId],
            )
            .then(() => undefined),
        );
        expect(r).toMatchObject({
          waited: true,
          outcome: "42501 host_not_admitted",
          counts: { intakes: 0, keys: 0 },
        });
      });

      it("(c) the organization is suspended while the command waits on it: organization_inactive, nothing written", async () => {
        const r = await race((fx, _hosts, s1) =>
          s1
            .query(
              "UPDATE public.tenants SET status = 'suspended' WHERE id = $1",
              [fx.A.tenant],
            )
            .then(() => undefined),
        );
        expect(r).toMatchObject({
          waited: true,
          outcome: "55000 organization_inactive",
          counts: { intakes: 0, keys: 0 },
        });
      });

      it("(d) the name moves to another organization between the wrapper's resolution and the guard's lock: host_not_admitted, nothing written in either", async () => {
        const r = await race(async (fx, hosts, s1) => {
          await s1.query("DELETE FROM public.site_domains WHERE host = $1", [
            hosts.site,
          ]);
          const siteB = (
            await s1.query(
              "INSERT INTO public.sites (tenant_id, name) VALUES ($1, 'Taken over') RETURNING id",
              [fx.B.tenant],
            )
          ).rows[0].id as string;
          await s1.query(
            `INSERT INTO public.site_domains (host, tenant_id, site_id, surfaces, expected_project,
               control_proved_at, attached_at, routing_proved_at, https_proved_at, sign_in_ready_at, activation_proved_at)
             VALUES ($1, $2, $3, ARRAY['website'], 'donor', now(), now(), now(), now(), now(), now())`,
            [hosts.site, fx.B.tenant, siteB],
          );
        });
        expect(r).toMatchObject({
          waited: true,
          outcome: "42501 host_not_admitted",
          counts: { intakes: 0, keys: 0 },
          countsB: { intakes: 0, keys: 0 },
        });
      });

      it("(e) the organization's home moves to another name while a signed-in gift waits on the home record: host_not_admitted, nothing written", async () => {
        const r = await race(
          async (fx, _hosts, s1) => {
            const moved = `moved-${randomUUID().slice(0, 8)}.give.example.test`;
            await s1.query(
              `INSERT INTO public.site_domains (host, tenant_id, site_id, surfaces, expected_project,
                 control_proved_at, attached_at, routing_proved_at, https_proved_at, sign_in_ready_at, activation_proved_at)
               VALUES ($1, $2, NULL, ARRAY['donor_account'], 'donor', now(), now(), now(), now(), now(), now())`,
              [moved, fx.A.tenant],
            );
            await s1.query(
              "UPDATE public.donor_portal_hosts SET primary_domain = $2 WHERE tenant_id = $1",
              [fx.A.tenant, moved],
            );
          },
          (fx, hosts) => ({
            host: hosts.home,
            surface: "donor_account",
            lines: [{ fund: fx.A.fund, amount: 1000 }],
            actor: verifiedActor(),
          }),
        );
        expect(r).toMatchObject({
          waited: true,
          outcome: "42501 host_not_admitted",
          counts: { intakes: 0, keys: 0 },
        });
      });
    });

    it("two sessions posting one key: the second waits for the first and answers its intake; one intake, one request", () =>
      twoSessions(db, ADMIN_URL, async (s1, s2, fx, hosts) => {
        const request: GiftRequest = {
          host: hosts.site,
          key: randomUUID(),
          lines: [{ fund: fx.A.fund, amount: 2000 }],
          contact: guestContact(),
        };
        const pid2 = await pidOf(s2);
        await s1.query("BEGIN");
        await s1.query("SET LOCAL ROLE service_role");
        const first = (await s1.query(BEGIN_SQL, beginArgs(request))).rows[0]
          .r as Record<string, unknown>;
        await s2.query("BEGIN");
        await s2.query("SET LOCAL ROLE service_role");
        const second = launch(s2, BEGIN_SQL, beginArgs(request));
        const waited = await blockedBy(db, pid2);
        await s1.query("COMMIT");
        const answer = await second;
        expect({ waited, answer: said(answer) }).toEqual({
          waited: true,
          answer: "committed",
        });
        await s2.query("COMMIT");
        expect(answer.ok && answer.rows[0]!.r).toEqual({
          ...first,
          outcome: "replayed",
        });
        expect(await intakeCounts(db, fx.A.tenant)).toMatchObject({
          intakes: 1,
          requests: 1,
          keys: 1,
        });
      }));

    it("F2: a deferral and an apply that holds the account and then wants the gift end with no deadlock: the deferral waits for the account, then defers", () =>
      twoSessions(db, ADMIN_URL, async (s1, s2, fx, hosts) => {
        await db.query("BEGIN");
        const r = begun(
          await begin(db, {
            host: hosts.site,
            lines: [{ fund: fx.A.fund, amount: 4000 }],
          }),
        );
        const pi = paymentIntent();
        const claimed = await claim(db, r.operation_id);
        await report(db, r.operation_id, claimed.attempt as number, {
          result: "succeeded",
          provider_object_id: pi,
        });
        const paid = await storeEvent(db, fx.A, {
          pi,
          amount: 4000,
          metadata: {
            asym_operation: r.operation_id,
            asym_intake: r.donation_id,
          },
        });
        expect((await work(db, paid.id)).outcome).toBe("applied");
        const refund = await storeEvent(db, fx.A, {
          type: "charge.refunded",
          payload: (e) => ({
            ...e,
            data: {
              object: {
                id: `ch_${randomUUID().replaceAll("-", "").slice(0, 20)}`,
                object: "charge",
                amount: 4000,
                amount_refunded: 4000,
                currency: "usd",
                payment_intent: pi,
                livemode: false,
              },
            },
          }),
        });
        const other = await storeEvent(db, fx.A, { pi: paymentIntent() });
        const refundClaim = await claimEvent(db, refund.id);
        await db.query("COMMIT");
        expect(refundClaim.claimed).toBe(true);
        const pid1 = await pidOf(s1);
        await s2.query("BEGIN");
        await s2.query(
          "SELECT 1 FROM public.stripe_connect_events WHERE id = $1 FOR NO KEY UPDATE",
          [other.id],
        );
        await s2.query(
          `SELECT 1 FROM public.payment_provider_accounts
            WHERE tenant_id = $1 AND provider_account_id = $2 AND livemode = false FOR NO KEY UPDATE`,
          [fx.A.tenant, fx.A.account],
        );
        await s1.query("SET ROLE service_role");
        const deferral = launch(
          s1,
          "SELECT public.defer_payment_event($1, $2) AS r",
          [refund.id, refundClaim.attempt],
        );
        const waited = await blockedBy(db, pid1);
        const gift = await launch(
          s2,
          "SELECT 1 FROM public.donations WHERE id = $1 FOR NO KEY UPDATE",
          [r.donation_id],
        );
        await s2.query(gift.ok ? "COMMIT" : "ROLLBACK");
        const deferred = await deferral;
        expect({
          waited,
          gift: said(gift),
          deferred: outcomeOf(deferred),
        }).toEqual({ waited: true, gift: "committed", deferred: "deferred" });
      }));

    it("F5: two reconciliations of one drifted account open one drift task; the second waits and finds it", () =>
      twoSessions(db, ADMIN_URL, async (s1, s2, fx) => {
        const account = (
          await db.query(
            "SELECT id FROM public.payment_provider_accounts WHERE tenant_id = $1 AND livemode = false",
            [fx.A.tenant],
          )
        ).rows[0].id as string;
        const closed = JSON.stringify({
          id: fx.A.account,
          livemode: false,
          closed: true,
        });
        const sql =
          "SELECT public.reconcile_payment_account($1, $2::jsonb) AS r";
        const pid2 = await pidOf(s2);
        for (const client of [s1, s2])
          await client.query("SET ROLE service_role");
        await s1.query("BEGIN");
        const first = await launch(s1, sql, [account, closed]);
        await s2.query("BEGIN");
        const second = launch(s2, sql, [account, closed]);
        const waited = await blockedBy(db, pid2);
        await s1.query("COMMIT");
        const answer = await second;
        await s2.query(answer.ok ? "COMMIT" : "ROLLBACK");
        const tasks = (
          await db.query(
            `SELECT count(*)::int AS n FROM public.mission_control_tasks
              WHERE tenant_id = $1 AND issue_type = 'payment_account_drift'`,
            [fx.A.tenant],
          )
        ).rows[0].n as number;
        expect({
          waited,
          first: outcomeOf(first),
          second: outcomeOf(answer),
          tasks,
        }).toEqual({
          waited: true,
          first: "drift_flagged",
          second: "already_flagged",
          tasks: 1,
        });
      }));
  },
);
