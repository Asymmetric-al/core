import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runWorker } from "./wp8a-p2r2a-worker";
import {
  committedWorld,
  ADMIN_URL,
  HOSTED_SERVICE_GRANTS,
  IN_MIGRATE_JOB,
  admitHosts,
  apply,
  attempt,
  begin,
  begun,
  claim,
  claimEvent,
  expireLease,
  feeFund,
  grant,
  guestContact,
  inTx,
  intakeCounts,
  makeDue,
  removeRest2aTenants,
  role,
  seedTwoTenants,
  storeEvent,
  work,
  type Fixture,
  type GiftRequest,
  type Side,
} from "./wp8a-rest2a-harness";
import {
  runProviderOperation,
  type ProviderOperationRpc,
  type ProviderOperationRpcArgs,
  type ProviderOperationRpcName,
} from "../../../../packages/api/src/donate/provider-operations/run";
import { createStripePaymentAdapter } from "../../../../packages/api/src/donate/provider-operations/stripe-adapter";
import {
  createStripeProviderFake,
  hold,
  loseAfterActing,
  type StripeProviderFake,
} from "../../../fixtures/stripe-provider-fake";

function autocommitWorker(
  client: pg.Client,
  operationId: string,
  fake: StripeProviderFake,
) {
  const call = async (sql: string, params: unknown[]) => {
    try {
      const res = await client.query(sql, params);
      return { data: res.rows[0].r as unknown, error: null };
    } catch (e) {
      const err = e as { code?: string; message?: string };
      return {
        data: null,
        error: { code: err.code, message: err.message ?? "" },
      };
    }
  };
  const rpc: ProviderOperationRpc = (
    fn: ProviderOperationRpcName,
    args:
      | ProviderOperationRpcArgs["claim_provider_operation"]
      | ProviderOperationRpcArgs["record_provider_operation_result"],
  ) =>
    fn === "claim_provider_operation" && "p_lease_seconds" in args
      ? call(
          "SELECT public.claim_provider_operation($1::uuid, $2::integer) AS r",
          [args.p_operation_id, args.p_lease_seconds],
        )
      : fn === "record_provider_operation_result" && "p_result" in args
        ? call(
            "SELECT public.record_provider_operation_result($1::uuid, $2::integer, $3::jsonb) AS r",
            [
              args.p_operation_id,
              args.p_attempt,
              JSON.stringify(args.p_result),
            ],
          )
        : Promise.reject(new Error(`unexpected RPC ${fn}`));
  return runProviderOperation({
    rpc,
    adapter: createStripePaymentAdapter({
      secretKey: "sk_test_provider_fake",
      transport: fake.transport,
    }),
    operationId,
  });
}

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 2a: the integrated gate (W8-R22, plan :1134, :1135; real stack, the provider fake)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function legacyGift(client: pg.Client, side: Side) {
      const user = randomUUID();
      await grant(client, HOSTED_SERVICE_GRANTS);
      await client.query("INSERT INTO auth.users (id) VALUES ($1)", [user]);
      await role(client, "service_role");
      const r = (
        await client.query(
          `SELECT public.begin_donation_saga($1, $2, $2, 4000, 'usd', NULL, NULL, $3, NULL, NULL, '{}'::jsonb) AS r`,
          [side.tenant, user, `legacy-${randomUUID()}`],
        )
      ).rows[0].r as { donation_id: string; outbox_id: string };
      await role(client, null);
      return r;
    }

    async function legacyRows(client: pg.Client, tenant: string) {
      return (
        await client.query(
          `SELECT d.id, d.status, d.intake_format, o.status AS outbox_status, o.attempt_count
             FROM public.donations AS d JOIN public.donation_saga_outbox AS o ON o.donation_id = d.id
            WHERE d.tenant_id = $1 AND d.intake_format = 'legacy_header' ORDER BY d.id`,
          [tenant],
        )
      ).rows;
    }

    async function effects(
      client: pg.Client,
      tenant: string,
      donationId: string,
      email: string,
    ) {
      return (
        await client.query(
          `SELECT (SELECT count(*)::int FROM public.donations WHERE id = $2) AS intakes,
                  (SELECT count(*)::int FROM public.donation_saga_outbox WHERE donation_id = $2 AND request_kind = 'create_payment') AS creates,
                  (SELECT count(*)::int FROM public.staged_gifts WHERE donation_id = $2) AS gifts,
                  (SELECT count(*)::int FROM public.payment_observations WHERE tenant_id = $1 AND donation_id = $2) AS observations,
                  (SELECT count(*)::int FROM public.donors WHERE tenant_id = $1 AND email = $3) AS donors,
                  (SELECT count(DISTINCT party_id)::int FROM public.donors WHERE tenant_id = $1 AND email = $3) AS parties,
                  (SELECT stripe_payment_intent_id FROM public.donations WHERE id = $2) AS payment,
                  (SELECT status FROM public.donations WHERE id = $2) AS status`,
          [tenant, donationId, email],
        )
      ).rows[0] as Record<string, unknown>;
    }

    async function expireEventLease(eventId: string) {
      await role(db, null);
      await db.query("SAVEPOINT gate_lease");
      await db.query("SET LOCAL session_replication_role = replica");
      await db.query(
        "UPDATE public.stripe_connect_events SET lease_expires_at = clock_timestamp() - interval '1 second' WHERE id = $1",
        [eventId],
      );
      await db.query("SET LOCAL session_replication_role = origin");
      await db.query("RELEASE SAVEPOINT gate_lease");
    }

    it("a fault at each step boundary, then a retry, gives exactly one of each effect, and legacy traffic beside it keeps its own reading", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const hosts = await admitHosts(db, fx.A);
        await feeFund(db, fx.A);
        const fake = createStripeProviderFake();
        const legacyBefore = await legacyGift(db, fx.A);

        const request: GiftRequest = {
          host: hosts.site,
          key: randomUUID(),
          lines: [{ fund: fx.A.fund, amount: 5000 }],
          fee: 175,
          contact: guestContact(),
        };
        const first = begun(await begin(db, request));
        const lost = begun(await begin(db, request));
        expect(lost).toEqual({ ...first, outcome: "replayed" });

        await claim(db, first.operation_id);
        await expireLease(db, first.operation_id);

        fake.script(loseAfterActing());
        const unknown = await runWorker(db, first.operation_id, fake);
        expect(unknown).toMatchObject({
          sent: true,
          answer: { result: "unknown" },
        });
        await makeDue(db, first.operation_id);

        const crashed = await runWorker(db, first.operation_id, fake, {
          dropReport: true,
        });
        expect(crashed).toMatchObject({
          sent: true,
          answer: { result: "succeeded" },
        });
        await expireLease(db, first.operation_id);
        await makeDue(db, first.operation_id);

        const recorded = await runWorker(db, first.operation_id, fake);
        expect(recorded).toMatchObject({
          sent: true,
          answer: { result: "succeeded" },
        });
        expect(fake.objects()).toHaveLength(1);
        const pi = fake.objects()[0]!.id;
        const sentCreates = fake
          .requests()
          .filter(
            (q) => q.method === "POST" && /\/payment_intents$/.test(q.path),
          );
        expect(sentCreates.length).toBeGreaterThan(0);
        for (const sent of sentCreates) {
          expect(sent.body.payment_method_types).toEqual(["card"]);
          expect(sent.body).not.toHaveProperty("automatic_payment_methods");
          expect(sent.account).toBe(fx.A.account);
        }

        const legacyBetween = await legacyGift(db, fx.A);
        await role(db, null);
        const legacyWritten = await legacyRows(db, fx.A.tenant);

        const event = await storeEvent(db, fx.A, {
          pi,
          amount: 5175,
          metadata: {
            asym_operation: first.operation_id,
            asym_intake: first.donation_id,
          },
        });
        const firstClaim = await claimEvent(db, event.id);
        expect(firstClaim.outcome).toBe("claimed");
        const stagedCount = async () => {
          await role(db, null);
          return (
            await db.query(
              "SELECT count(*)::int AS n FROM public.staged_gifts WHERE donation_id = $1",
              [first.donation_id],
            )
          ).rows[0].n as number;
        };
        await db.query("SAVEPOINT gate_apply");
        expect(
          await apply(db, event.id, firstClaim.attempt as number),
        ).toMatchObject({ outcome: "applied" });
        expect(await stagedCount()).toBe(1);
        await db.query("ROLLBACK TO SAVEPOINT gate_apply");
        expect(await stagedCount()).toBe(0);
        await expireEventLease(event.id);
        expect((await work(db, event.id)).outcome).toBe("applied");

        await role(db, "service_role");
        const second = await attempt(
          db,
          `INSERT INTO public.stripe_connect_events
             (tenant_id, stripe_event_id, event_type, livemode, provider_account_id, event_created_at, payload_sha256, raw_payload)
           SELECT tenant_id, stripe_event_id, event_type, livemode, provider_account_id, event_created_at, payload_sha256, raw_payload
             FROM public.stripe_connect_events WHERE id = $1`,
          [event.id],
        );
        await role(db, null);
        expect(second.code).toBe("23505");
        expect(await claimEvent(db, event.id)).toMatchObject({
          claimed: false,
          terminal: true,
        });

        await role(db, null);
        expect(
          await effects(
            db,
            fx.A.tenant,
            first.donation_id,
            String(request.contact!.email),
          ),
        ).toEqual({
          intakes: 1,
          creates: 1,
          gifts: 1,
          observations: 1,
          donors: 1,
          parties: 1,
          payment: pi,
          status: "completed",
        });
        const legacy = await legacyRows(db, fx.A.tenant);
        expect(legacy.map((r) => r.id).sort()).toEqual(
          [legacyBefore.donation_id, legacyBetween.donation_id].sort(),
        );
        expect(legacy).toEqual(legacyWritten);
        expect(
          legacy.every(
            (r) =>
              r.intake_format === "legacy_header" && r.status === "processing",
          ),
        ).toBe(true);
      }));

    it("an intake rolled back mid-traffic leaves nothing, and the same key then commits once", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const hosts = await admitHosts(db, fx.A);
        const request: GiftRequest = {
          host: hosts.site,
          key: randomUUID(),
          lines: [{ fund: fx.A.fund, amount: 2200 }],
          contact: guestContact(),
        };
        const before = await intakeCounts(db, fx.A.tenant);
        await db.query("SAVEPOINT gate_rollback");
        begun(await begin(db, request));
        await db.query("ROLLBACK TO SAVEPOINT gate_rollback");
        expect(await intakeCounts(db, fx.A.tenant)).toEqual(before);
        expect(begun(await begin(db, request)).outcome).toBe("created");
        expect(begun(await begin(db, request)).outcome).toBe("replayed");
        expect(await intakeCounts(db, fx.A.tenant)).toMatchObject({
          intakes: before.intakes! + 1,
          requests: before.requests! + 1,
          keys: before.keys! + 1,
        });
      }));

    describe("committed, removed in finally", () => {
      it("two workers on one request: one claims and sends, the other sends nothing; two sessions claiming one event: one claims", async () => {
        const s1 = new pg.Client({ connectionString: ADMIN_URL });
        const s2 = new pg.Client({ connectionString: ADMIN_URL });
        const opened: pg.Client[] = [];
        let fx: Fixture | undefined;
        let fake: StripeProviderFake | undefined;
        let firstWorker: Promise<unknown> | undefined;
        try {
          await s1.connect();
          opened.push(s1);
          await s2.connect();
          opened.push(s2);
          for (const s of opened) await s.query("SET ROLE service_role");
          const world = await committedWorld(db);
          fx = world.fx;
          const hosts = world.hosts;
          await db.query("BEGIN");
          const r = begun(
            await begin(db, {
              host: hosts.site,
              key: randomUUID(),
              lines: [{ fund: fx.A.fund, amount: 3300 }],
              contact: guestContact(),
            }),
          );
          await db.query("COMMIT");
          fake = createStripeProviderFake();
          fake.script(hold());
          const running = autocommitWorker(s1, r.operation_id, fake);
          firstWorker = running;
          expect(
            await Promise.race([
              fake.held(1).then(() => "held"),
              running.then(() => "returned before sending"),
            ]),
          ).toBe("held");
          const secondWorker = await autocommitWorker(s2, r.operation_id, fake);
          expect(secondWorker.sent).toBe(false);
          expect(secondWorker.claim.error).toBeNull();
          expect(secondWorker.claim.data).not.toMatchObject({
            outcome: "claimed",
          });
          fake.release();
          const done = await running;
          expect("answer" in done && done.answer).toMatchObject({
            result: "succeeded",
          });
          expect(fake.objects()).toHaveLength(1);

          const pi = fake.objects()[0]!.id;
          await db.query("BEGIN");
          const event = await storeEvent(db, fx.A, {
            pi,
            amount: 3300,
            metadata: {
              asym_operation: r.operation_id,
              asym_intake: r.donation_id,
            },
          });
          await db.query("COMMIT");
          const claims = await Promise.all(
            [s1, s2].map((s) =>
              s
                .query(
                  "SELECT public.claim_provider_event($1::uuid, 300) AS r",
                  [event.id],
                )
                .then((res) => res.rows[0].r as Record<string, unknown>),
            ),
          );
          expect(claims.filter((c) => c.claimed === true)).toHaveLength(1);
          const winner = claims.find((c) => c.claimed === true)!;
          const session = claims[0] === winner ? s1 : s2;
          const applied = (
            await session.query(
              "SELECT public.apply_payment_outcome($1::uuid, $2) AS r",
              [event.id, winner.attempt],
            )
          ).rows[0].r as Record<string, unknown>;
          expect(applied.outcome).toBe("applied");
          expect(
            (
              await db.query(
                "SELECT count(*)::int AS n FROM public.staged_gifts WHERE donation_id = $1",
                [r.donation_id],
              )
            ).rows[0].n,
          ).toBe(1);
        } finally {
          fake?.release();
          await firstWorker?.catch(() => undefined);
          for (const s of opened) await s.end().catch(() => undefined);
          await db.query("ROLLBACK").catch(() => undefined);
          if (fx) await removeRest2aTenants(db, fx);
        }
      });
    });
  },
);
