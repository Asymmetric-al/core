import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

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
  HOSTED_SERVICE_GRANTS,
  IN_MIGRATE_JOB,
  attempt,
  auditOf,
  casesOf,
  enterAs,
  expireLease,
  grant,
  guardIntake,
  inTx,
  makeDue,
  refusal,
  removeTwoTenants,
  role,
  rowOf,
  seedTwoTenants,
  tasksOf,
  tryClaim,
  tryReport,
  windowEndsIn,
  type Attempt,
  type Fixture,
  type Intake,
} from "./wp8a-p2r1a-harness";
import {
  createStripeProviderFake,
  failBeforeSending,
  formValues,
  hold,
  invalid,
  loseAfterActing,
  rateLimited,
  refuse,
  succeed,
  unanswered,
  type StripeProviderFake,
} from "../../../fixtures/stripe-provider-fake";

import type {
  ProviderOperationRpc,
  ProviderOperationRpcArgs,
  ProviderOperationRpcName,
  RpcResponse,
} from "../../../../packages/api/src/donate/provider-operations/run";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const TEST_KEY = "sk_test_provider_fake";
const DAY_MS = 24 * 60 * 60 * 1000;
const ROOT = fileURLToPath(new URL("../../../../", import.meta.url));
const MIGRATIONS = join(ROOT, "supabase/migrations");
const MIGRATION_SUFFIX = "_wp8a2_r1b_repair_case_insert_rule.sql";
const COMMITTED_CHECK =
  "SELECT EXISTS ( SELECT 1 FROM pg_catalog.pg_roles AS r JOIN pg_catalog.pg_class AS c ON c.oid = to_regclass('public.payment_repair_cases') JOIN pg_catalog.pg_attribute AS a ON a.attrelid = c.oid AND a.attname = 'kind' AND NOT a.attisdropped WHERE r.rolname = 'tenant_guard' AND NOT has_table_privilege(r.oid, c.oid, 'INSERT') AND has_column_privilege(r.oid, c.oid, a.attnum, 'INSERT') )";

const downOf = (text: string) => {
  const header = headerOf(text);
  const start = header.findIndex((l) => /^-- Down\b/.test(l));
  return header
    .slice(start + 1)
    .filter((l) => l.startsWith("--   ") || l === "--")
    .map((l) => (l === "--" ? "" : l.slice(5)))
    .filter((l) => !/^(BEGIN|COMMIT);$/.test(l.trim()))
    .join("\n");
};

const DEAD_LETTER_LINK = (operationId: string) => ({
  issue_type: "provider_request_dead_letter",
  urgency: "high",
  source_module: "payments",
  record_type: "donation_saga_outbox",
  record_id: operationId,
  relationship: "provider_request_dead_letter",
});
const PARKED_LINK = (caseId: string) => ({
  issue_type: "provider_request_parked",
  urgency: "high",
  source_module: "payments",
  record_type: "payment_repair_case",
  record_id: caseId,
  relationship: "provider_request_parked",
});

type ClaimArgs = ProviderOperationRpcArgs["claim_provider_operation"];
type ReportArgs = ProviderOperationRpcArgs["record_provider_operation_result"];

const answerOf = (a: Attempt): RpcResponse =>
  a.ok
    ? { data: a.rows[0]?.r ?? null, error: null }
    : { data: null, error: { code: a.code, message: a.message ?? "" } };

const loadWorker = async () => {
  const [run, adapter] = await Promise.all([
    import("../../../../packages/api/src/donate/provider-operations/run"),
    import("../../../../packages/api/src/donate/provider-operations/stripe-adapter"),
  ]);
  return {
    runProviderOperation: run.runProviderOperation,
    createStripePaymentAdapter: adapter.createStripePaymentAdapter,
  };
};

const migrationFile = () => {
  const names = readdirSync(MIGRATIONS).filter((n) =>
    n.endsWith(MIGRATION_SUFFIX),
  );
  expect(names).toHaveLength(1);
  return readFileSync(join(MIGRATIONS, names[0]!), "utf8");
};

const headerOf = (text: string) => {
  const lines = text.split("\n");
  const end = lines.findIndex((l) => !l.startsWith("--"));
  return lines.slice(0, end);
};

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error(
        "a test of the provider worker tried to reach the network",
      );
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R1b: the provider worker against the record and the fake provider, and the repair-case INSERT rule (real stack; every test rolls back, except C4, which commits and removes its own tenants)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const sessions: pg.Client[] = [];
    beforeAll(() => db.connect());
    afterAll(async () => {
      for (const s of sessions) await s.end().catch(() => {});
      await db.end();
    });

    function rpcIn(
      client: pg.Client,
      hooks: { beforeReport?: () => Promise<void> } = {},
    ): ProviderOperationRpc {
      return async (
        fn: ProviderOperationRpcName,
        args: ProviderOperationRpcArgs[ProviderOperationRpcName],
      ) => {
        if (fn === "claim_provider_operation") {
          const a = args as ClaimArgs;
          return answerOf(
            await tryClaim(client, a.p_operation_id, a.p_lease_seconds),
          );
        }
        const a = args as ReportArgs;
        await hooks.beforeReport?.();
        return answerOf(
          await tryReport(client, a.p_operation_id, a.p_attempt, a.p_result),
        );
      };
    }

    function rpcCommitted(s: pg.Client): ProviderOperationRpc {
      return async (
        fn: ProviderOperationRpcName,
        args: ProviderOperationRpcArgs[ProviderOperationRpcName],
      ) => {
        await s.query("BEGIN");
        try {
          await s.query(
            "SELECT pg_catalog.set_config('app.current_tenant_id', '', true)",
          );
          await s.query("SET LOCAL ROLE service_role");
          const r =
            fn === "claim_provider_operation"
              ? await s.query(
                  "SELECT public.claim_provider_operation($1::uuid, $2::integer) AS r",
                  [
                    (args as ClaimArgs).p_operation_id,
                    (args as ClaimArgs).p_lease_seconds,
                  ],
                )
              : await s.query(
                  "SELECT public.record_provider_operation_result($1::uuid, $2::integer, $3::jsonb) AS r",
                  [
                    (args as ReportArgs).p_operation_id,
                    (args as ReportArgs).p_attempt,
                    JSON.stringify((args as ReportArgs).p_result),
                  ],
                );
          await s.query("COMMIT");
          return { data: r.rows[0]?.r ?? null, error: null };
        } catch (error) {
          await s.query("ROLLBACK");
          const e = error as { code?: string; message?: string };
          return {
            data: null,
            error: { code: e.code, message: e.message ?? "" },
          };
        }
      };
    }

    const adapterOver = async (fake: StripeProviderFake) =>
      (await loadWorker()).createStripePaymentAdapter({
        secretKey: TEST_KEY,
        transport: fake.transport,
      });

    const work = async (
      intake: Intake,
      fake: StripeProviderFake,
      options: {
        beforeReport?: () => Promise<void>;
        log?: (entry: unknown) => void;
      } = {},
    ) =>
      (await loadWorker()).runProviderOperation({
        rpc: rpcIn(db, { beforeReport: options.beforeReport }),
        adapter: await adapterOver(fake),
        operationId: intake.operationId,
        log: options.log,
      });

    const intakeRef = async (donationId: string) => {
      await role(db, null);
      return (
        await db.query(
          "SELECT stripe_payment_intent_id FROM public.donations WHERE id = $1",
          [donationId],
        )
      ).rows[0]?.stripe_payment_intent_id as string | null;
    };

    const storedParams = async (operationId: string) => {
      await role(db, null);
      return (
        await db.query(
          "SELECT request_params FROM public.donation_saga_outbox WHERE id = $1",
          [operationId],
        )
      ).rows[0]?.request_params as unknown;
    };

    const tasksIn = async (fx: Fixture) => {
      await role(db, null);
      const count = async (tenantId: string) =>
        (
          await db.query(
            "SELECT count(*)::int AS n FROM public.mission_control_tasks WHERE tenant_id = $1",
            [tenantId],
          )
        ).rows[0]?.n as number;
      return { A: await count(fx.A.tenant), B: await count(fx.B.tenant) };
    };

    const casesInTenant = async (tenantId: string) => {
      await role(db, null);
      return (
        await db.query(
          "SELECT count(*)::int AS n FROM public.payment_repair_cases WHERE tenant_id = $1",
          [tenantId],
        )
      ).rows[0]?.n as number;
    };

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

    async function openSession() {
      const s = new pg.Client({ connectionString: ADMIN_URL });
      s.on("error", () => {});
      await s.connect();
      sessions.push(s);
      return s;
    }

    async function releaseSessionsThenRemove(fx: Fixture) {
      const open = sessions.splice(0);
      await Promise.all(open.map((s) => s.end().catch(() => {})));
      await db.query("ROLLBACK").catch(() => {});
      await removeTwoTenants(db, fx);
    }

    async function committed<T>(fn: () => Promise<T>) {
      await db.query("BEGIN");
      try {
        const out = await fn();
        await role(db, null);
        await db.query(
          "REVOKE INSERT ON TABLE public.donations, public.donation_intake_lines FROM tenant_guard",
        );
        await db.query(
          "REVOKE INSERT (max_attempts) ON TABLE public.donation_saga_outbox FROM tenant_guard",
        );
        await db.query("COMMIT");
        return out;
      } catch (error) {
        await db.query("ROLLBACK");
        throw error;
      }
    }

    it("C1 (plan :1142): the provider acts and the response is lost: unknown, retry_scheduled; past the window the next claim parks it and nothing is sent: one open case, one task and link, one audit row, the intake unlinked, nothing in tenant B, one request and one object at the provider", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        const fake = createStripeProviderFake({ afterWindow: "forget" });
        fake.script(loseAfterActing());
        expect(await work(intake, fake)).toMatchObject({
          sent: true,
          attempt: 1,
          answer: { result: "unknown", errorCode: "stripe_connection_lost" },
          report: { error: null, data: { outcome: "retry_scheduled" } },
        });
        await windowEndsIn(db, intake.operationId, 60);
        await makeDue(db, intake.operationId);
        fake.advanceMs(DAY_MS + 1);
        const second = await work(intake, fake);
        expect(second).toMatchObject({
          sent: false,
          claim: { error: null, data: { outcome: "parked" } },
        });
        const caseId = (second.claim.data as { case_id: string }).case_id;
        const row = await rowOf(db, intake.operationId);
        expect([row.status, row.outcome_unknown, row.lease_expires_at]).toEqual(
          ["parked", true, null],
        );
        expect(await casesOf(db, intake.operationId)).toEqual([
          {
            id: caseId,
            kind: "outcome_unknown",
            resolution: null,
            resolved_at: null,
          },
        ]);
        expect(await tasksOf(db, fx.A.tenant)).toEqual([PARKED_LINK(caseId)]);
        const audit = await auditOf(db, intake.operationId);
        expect(audit.map((a) => a.action)).toEqual(["provider_request_parked"]);
        expect(audit[0]?.details).toMatchObject({ reason: "window_passed" });
        expect(await intakeRef(intake.donationId)).toBeNull();
        expect(await tasksOf(db, fx.B.tenant)).toEqual([]);
        expect(await tasksIn(fx)).toEqual({ A: 1, B: 0 });
        expect(await casesInTenant(fx.B.tenant)).toBe(0);
        expect(fake.requests()).toHaveLength(1);
        expect(fake.objects()).toHaveLength(1);
      }));

    it("C2: the same loss inside the window: the next run sends the same key and parameters, the provider replays its object, the request links and the intake names it; one object, two requests", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        const fake = createStripeProviderFake();
        fake.script(loseAfterActing());
        expect(await work(intake, fake)).toMatchObject({
          answer: { result: "unknown" },
          report: { data: { outcome: "retry_scheduled" } },
        });
        await makeDue(db, intake.operationId);
        const second = await work(intake, fake);
        const object = fake.objects()[0]?.id;
        expect(second).toMatchObject({
          sent: true,
          attempt: 2,
          answer: { result: "succeeded", providerObjectId: object },
          report: {
            error: null,
            data: { outcome: "linked", provider_object_id: object },
          },
        });
        const requests = fake.requests();
        expect(requests.map((r) => r.replayed)).toEqual([false, true]);
        expect(requests[1]?.key).toBe(requests[0]?.key);
        expect(requests[0]?.key).toBe(
          `gift:${intake.donationId}:create_payment`,
        );
        expect(requests[1]?.rawBody).toBe(requests[0]?.rawBody);
        expect(requests[0]?.body).toEqual(
          formValues(await storedParams(intake.operationId)),
        );
        expect(requests.map((r) => r.account)).toEqual([
          fx.A.account,
          fx.A.account,
        ]);
        expect(fake.objects()).toHaveLength(1);
        expect((await rowOf(db, intake.operationId)).status).toBe("linked");
        expect(await intakeRef(intake.donationId)).toBe(object);
      }));

    it("C3 (plan :1135): a killed worker: run 1 creates the object and its report is held; after the lease expires run 2 claims attempt 2 with the outcome unknown, gets the replay and links; run 1's report, released after, is 55000 stale_attempt, and run 1 stops and logs the object", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        const fake = createStripeProviderFake();
        fake.script(succeed());
        let reached!: () => void;
        const atReport = new Promise<void>((done) => {
          reached = done;
        });
        let release!: () => void;
        const gate = new Promise<void>((done) => {
          release = done;
        });
        const log = vi.fn();
        const firstSettled = work(intake, fake, {
          log,
          beforeReport: async () => {
            reached();
            await gate;
          },
        }).then(
          (value) => ({ value }),
          (error: unknown) => ({ error }),
        );
        try {
          await Promise.race([
            atReport,
            firstSettled.then((settled) => {
              throw "error" in settled
                ? settled.error
                : new Error("run 1 ended before it reached its report");
            }),
          ]);
          await expireLease(db, intake.operationId);
          let unknownBeforeReport: unknown;
          const second = await work(intake, fake, {
            beforeReport: async () => {
              unknownBeforeReport = (await rowOf(db, intake.operationId))
                .outcome_unknown;
            },
          });
          const object = fake.objects()[0]?.id;
          expect(unknownBeforeReport).toBe(true);
          expect(second).toMatchObject({
            sent: true,
            attempt: 2,
            answer: { result: "succeeded", providerObjectId: object },
            report: { error: null, data: { outcome: "linked" } },
          });
          release();
          const first = await firstSettled;
          if ("error" in first) throw first.error;
          expect(first.value).toMatchObject({
            sent: true,
            attempt: 1,
            answer: { result: "succeeded", providerObjectId: object },
            report: {
              data: null,
              error: { code: "55000", message: "stale_attempt" },
            },
          });
          expect(log).toHaveBeenCalledTimes(1);
          expect(log.mock.calls[0]?.[0]).toMatchObject({
            operationId: intake.operationId,
            attempt: 1,
            providerObjectId: object,
          });
          expect(fake.requests().map((r) => r.replayed)).toEqual([false, true]);
          expect(fake.objects()).toHaveLength(1);
          const row = await rowOf(db, intake.operationId);
          expect([
            row.status,
            row.provider_object_id,
            row.attempt_count,
          ]).toEqual(["linked", object, 2]);
        } finally {
          release();
          await firstSettled;
        }
      }));

    it("C4: two workers in two committed sessions, the first held at the provider until the second returns: one claimed, one held, one request, linked (D-18, AL-2681 R2a: the committed test grants are revoked by column and by the new lines table, never by a table REVOKE on the outbox, which would strip R2a's column INSERT)", async () => {
      await db.query("BEGIN");
      const fx = await seedTwoTenants(db);
      await db.query("COMMIT");
      const fake = createStripeProviderFake();
      let firstSettled: Promise<unknown> = Promise.resolve();
      try {
        const intake = await committed(() => guardIntake(db, fx.A));
        const [s1, s2] = [await openSession(), await openSession()];
        const { runProviderOperation } = await loadWorker();
        fake.script(hold());
        const settling = runProviderOperation({
          rpc: rpcCommitted(s1),
          adapter: await adapterOver(fake),
          operationId: intake.operationId,
        }).then(
          (value) => ({ value }),
          (error: unknown) => ({ error }),
        );
        firstSettled = settling;
        await Promise.race([
          fake.held(),
          settling.then((settled) => {
            throw "error" in settled
              ? settled.error
              : new Error("run 1 ended before the provider held it");
          }),
        ]);
        const second = await runProviderOperation({
          rpc: rpcCommitted(s2),
          adapter: await adapterOver(fake),
          operationId: intake.operationId,
        });
        expect(second).toMatchObject({
          sent: false,
          claim: { error: null, data: { outcome: "held", attempt: 1 } },
        });
        fake.release();
        const first = await settling;
        if ("error" in first) throw first.error;
        expect(first.value).toMatchObject({
          sent: true,
          attempt: 1,
          answer: { result: "succeeded" },
          report: { error: null, data: { outcome: "linked" } },
        });
        expect(fake.requests()).toHaveLength(1);
        await role(db, null);
        expect((await rowOf(db, intake.operationId)).status).toBe("linked");
      } finally {
        fake.release();
        await firstSettled;
        await releaseSessionsThenRemove(fx);
      }
    });

    it("C5: the lease expires while the provider answers: the report is 55000 lease_lost, nothing more is written and the object is logged; the next run reclaims and links by replay", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        const fake = createStripeProviderFake();
        fake.script(
          succeed({ beforeAnswer: () => expireLease(db, intake.operationId) }),
        );
        const log = vi.fn();
        const first = await work(intake, fake, { log });
        const object = fake.objects()[0]?.id;
        expect(first).toMatchObject({
          sent: true,
          attempt: 1,
          answer: { result: "succeeded", providerObjectId: object },
          report: {
            data: null,
            error: { code: "55000", message: "lease_lost" },
          },
        });
        expect(log).toHaveBeenCalledTimes(1);
        expect(log.mock.calls[0]?.[0]).toMatchObject({
          providerObjectId: object,
        });
        const row = await rowOf(db, intake.operationId);
        expect([
          row.status,
          row.attempt_count,
          row.provider_object_id,
          row.outcome_unknown,
        ]).toEqual(["sending", 1, null, false]);
        expect(await intakeRef(intake.donationId)).toBeNull();
        expect(await casesOf(db, intake.operationId)).toEqual([]);
        expect(await tasksOf(db, fx.A.tenant)).toEqual([]);
        expect(await tasksIn(fx)).toEqual({ A: 0, B: 0 });
        expect(await work(intake, fake)).toMatchObject({
          sent: true,
          attempt: 2,
          answer: { result: "succeeded", providerObjectId: object },
          report: { data: { outcome: "linked" } },
        });
        expect(fake.requests().map((r) => r.replayed)).toEqual([false, true]);
        expect(fake.objects()).toHaveLength(1);
      }));

    it("C6 (section 3.3 row 14): rate-limited first, then with 600 seconds of window left the provider acts and the response is lost: 60 + 900 > 600, so the report parks it (window_passed) with one case and one task, and nothing further is sent", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        const fake = createStripeProviderFake();
        fake.script(rateLimited(), loseAfterActing());
        expect(await work(intake, fake)).toMatchObject({
          answer: { result: "not_performed", errorCode: "stripe_rate_limited" },
          report: { data: { outcome: "retry_scheduled" } },
        });
        await windowEndsIn(db, intake.operationId, 600);
        const second = await work(intake, fake);
        expect(second).toMatchObject({
          sent: true,
          attempt: 2,
          answer: { result: "unknown" },
          report: { error: null, data: { outcome: "parked", attempt: 2 } },
        });
        const { case_id: caseId } = (second as { report: RpcResponse }).report
          .data as { case_id: string };
        expect(
          (await auditOf(db, intake.operationId))[0]?.details,
        ).toMatchObject({ reason: "window_passed", attempt: 2 });
        expect(
          (await casesOf(db, intake.operationId)).map((c) => c.id),
        ).toEqual([caseId]);
        expect(await tasksOf(db, fx.A.tenant)).toEqual([PARKED_LINK(caseId)]);
        expect(await tasksIn(fx)).toEqual({ A: 1, B: 0 });
        expect(await work(intake, fake)).toMatchObject({
          sent: false,
          claim: { data: { outcome: "parked" } },
        });
        expect(fake.requests()).toHaveLength(2);
      }));

    it("C7 (Q-A): a card refusal ends refused and known, with no task and no case", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        const fake = createStripeProviderFake();
        fake.script(refuse());
        expect(await work(intake, fake)).toMatchObject({
          answer: { result: "refused", errorCode: "stripe_card_error" },
          report: { error: null, data: { outcome: "refused" } },
        });
        const row = await rowOf(db, intake.operationId);
        expect([row.status, row.outcome_unknown, row.last_error_code]).toEqual([
          "refused",
          false,
          "stripe_card_error",
        ]);
        expect(await casesOf(db, intake.operationId)).toEqual([]);
        expect(await tasksOf(db, fx.A.tenant)).toEqual([]);
        expect(await tasksIn(fx)).toEqual({ A: 0, B: 0 });
      }));

    it("C7: rate-limited up to max_attempts (made due between runs) ends dead_letter with one task and one link, and no case", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A, { maxAttempts: 3 });
        const fake = createStripeProviderFake();
        fake.script(rateLimited(), rateLimited(), rateLimited());
        const outcomes: unknown[] = [];
        for (let n = 1; n <= 3; n += 1) {
          const run = await work(intake, fake);
          outcomes.push((run as { report?: RpcResponse }).report?.data);
          await makeDue(db, intake.operationId);
        }
        expect(outcomes).toMatchObject([
          { outcome: "retry_scheduled" },
          { outcome: "retry_scheduled" },
          { outcome: "dead_letter", attempt: 3 },
        ]);
        expect(await tasksOf(db, fx.A.tenant)).toEqual([
          DEAD_LETTER_LINK(intake.operationId),
        ]);
        expect(await tasksIn(fx)).toEqual({ A: 1, B: 0 });
        expect(await casesOf(db, intake.operationId)).toEqual([]);
        expect(fake.requests()).toHaveLength(3);
      }));

    it("C7 (Q3, Q4): a timeout then a rate limit parks with one case; unreachable or invalid to max_attempts each park with one case, never dead-letter", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const scenarios = [
          ["a timeout then a rate limit", [unanswered(), rateLimited()]],
          [
            "unreachable twice",
            [failBeforeSending("ECONNREFUSED"), failBeforeSending("ENOTFOUND")],
          ],
          ["invalid twice", [invalid(), invalid()]],
        ] as const;
        const got: string[] = [];
        for (const [label, behaviours] of scenarios) {
          const intake = await guardIntake(db, fx.A, { maxAttempts: 2 });
          const fake = createStripeProviderFake({ wait: async () => {} });
          fake.script(...behaviours);
          const results: string[] = [];
          for (let n = 1; n <= 2; n += 1) {
            const run = await work(intake, fake);
            const r = run as {
              answer?: { result: string; errorCode?: string };
              report?: RpcResponse;
            };
            results.push(
              `${r.answer?.result} ${r.answer?.errorCode} ${(r.report?.data as { outcome?: string })?.outcome}`,
            );
            await makeDue(db, intake.operationId);
          }
          const row = await rowOf(db, intake.operationId);
          got.push(
            `${label}: ${results.join("; ")}; ${row.status} unknown=${row.outcome_unknown} cases=${(await casesOf(db, intake.operationId)).length}`,
          );
        }
        expect(got).toEqual([
          "a timeout then a rate limit: unknown stripe_timeout retry_scheduled; not_performed stripe_rate_limited parked; parked unknown=true cases=1",
          "unreachable twice: unknown stripe_unreachable retry_scheduled; unknown stripe_unreachable parked; parked unknown=true cases=1",
          "invalid twice: unknown stripe_invalid_request retry_scheduled; unknown stripe_invalid_request parked; parked unknown=true cases=1",
        ]);
        expect(await tasksIn(fx)).toEqual({ A: 3, B: 0 });
        expect(
          (await tasksOf(db, fx.A.tenant)).map((t) => t.relationship),
        ).toEqual([
          "provider_request_parked",
          "provider_request_parked",
          "provider_request_parked",
        ]);
      }));

    it("C8 (Q5): a restricted binding inside the window: binding_inactive, nothing sent, nothing written", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        const fake = createStripeProviderFake();
        fake.script(rateLimited());
        expect(await work(intake, fake)).toMatchObject({
          report: { data: { outcome: "retry_scheduled" } },
        });
        await makeDue(db, intake.operationId);
        await role(db, null);
        await db.query(
          "UPDATE public.payment_account_bindings SET status = 'restricted', restricted_at = now() WHERE id = $1",
          [fx.A.binding],
        );
        const before = await rowOf(db, intake.operationId);
        expect(await work(intake, fake)).toMatchObject({
          sent: false,
          claim: {
            error: null,
            data: { outcome: "binding_inactive", binding_status: "restricted" },
          },
        });
        expect(await rowOf(db, intake.operationId)).toEqual(before);
        expect(await casesOf(db, intake.operationId)).toEqual([]);
        expect(await tasksOf(db, fx.A.tenant)).toEqual([]);
        expect(await tasksIn(fx)).toEqual({ A: 0, B: 0 });
        expect(fake.calls()).toBe(1);
      }));

    const caseInsert = (columns: Record<string, string>) => {
      const names = Object.keys(columns);
      return `INSERT INTO public.payment_repair_cases (${names.join(", ")}) VALUES (${names.map((n) => columns[n]).join(", ")})`;
    };

    it("G1: a guard INSERT of a repair case naming a resolution column, id or created_at is 42501 by privilege", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        const anchor = {
          tenant_id: `'${fx.A.tenant}'`,
          kind: "'outcome_unknown'",
          operation_id: `'${intake.operationId}'`,
          donation_id: `'${intake.donationId}'`,
        };
        const extra: [string, string][] = [
          ["id", "gen_random_uuid()"],
          ["created_at", "now()"],
          ["resolution", "'abandoned'"],
          ["resolution_reason", "'abandoned by the test'"],
          ["resolved_by", "gen_random_uuid()"],
          ["resolved_assignment_id", "gen_random_uuid()"],
          ["resolved_at", "now()"],
          ["resolution_details", "'{}'::jsonb"],
        ];
        const got: string[] = [];
        for (const [column, value] of extra) {
          await enterAs(db, "tenant_guard", fx.A.tenant);
          const r = await attempt(
            db,
            caseInsert({ ...anchor, [column]: value }),
          );
          await role(db, null);
          got.push(`${column}: ${refusal(r)}`);
        }
        expect(got).toEqual(
          extra.map(
            ([column]) =>
              `${column}: 42501 permission denied for table payment_repair_cases`,
          ),
        );
      }));

    it("G2: an owner INSERT of a case that is already resolved, wholly or in part, is 23514 payment_repair_case_created_resolved", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        const anchor = {
          tenant_id: `'${fx.A.tenant}'`,
          kind: "'outcome_unknown'",
          operation_id: `'${intake.operationId}'`,
          donation_id: `'${intake.donationId}'`,
        };
        const resolved = {
          resolution: "'abandoned'",
          resolution_reason: "'abandoned by the test'",
          resolved_by: "gen_random_uuid()",
          resolved_assignment_id: "gen_random_uuid()",
          resolved_at: "now()",
          resolution_details: "'{}'::jsonb",
        };
        await role(db, null);
        const got: string[] = [];
        got.push(
          `whole: ${refusal(await attempt(db, caseInsert({ ...anchor, ...resolved })))}`,
        );
        for (const [column, value] of Object.entries(resolved))
          got.push(
            `${column}: ${refusal(await attempt(db, caseInsert({ ...anchor, [column]: value })))}`,
          );
        expect(got).toEqual([
          "whole: 23514 payment_repair_case_created_resolved",
          ...Object.keys(resolved).map(
            (column) => `${column}: 23514 payment_repair_case_created_resolved`,
          ),
        ]);
      }));

    it("G3, G4: a case on a legacy_saga outbox row is 23514 payment_repair_case_not_provider_request, as the owner and as the guard naming only its four columns; as the guard, a case on another tenant's provider request is refused too", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const legacy = await legacyRow(fx);
        const other = await guardIntake(db, fx.B);
        const legacyCase = caseInsert({
          tenant_id: `'${fx.A.tenant}'`,
          kind: "'outcome_unknown'",
          operation_id: `'${legacy.outbox_id}'`,
          donation_id: `'${legacy.donation_id}'`,
        });
        await role(db, null);
        const owner = await attempt(db, legacyCase);
        await enterAs(db, "tenant_guard", fx.A.tenant);
        const guard = await attempt(db, legacyCase);
        const crossTenant = await attempt(
          db,
          caseInsert({
            tenant_id: `'${fx.A.tenant}'`,
            kind: "'outcome_unknown'",
            operation_id: `'${other.operationId}'`,
            donation_id: `'${other.donationId}'`,
          }),
        );
        await role(db, null);
        expect([refusal(owner), refusal(guard), crossTenant.code]).toEqual([
          "23514 payment_repair_case_not_provider_request",
          "23514 payment_repair_case_not_provider_request",
          "23514",
        ]);
        const count = (
          await db.query(
            "SELECT count(*)::int AS n FROM public.payment_repair_cases WHERE operation_id = ANY($1::uuid[])",
            [[legacy.outbox_id, other.operationId]],
          )
        ).rows[0]?.n;
        expect(count).toBe(0);
      }));

    it("G5 (guard): the guard's INSERT naming only (tenant_id, kind, operation_id, donation_id) opens a case on its tenant's provider request, as the park helper does", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        await enterAs(db, "tenant_guard", fx.A.tenant);
        const r = await attempt(
          db,
          `${caseInsert({
            tenant_id: `'${fx.A.tenant}'`,
            kind: "'outcome_unknown'",
            operation_id: `'${intake.operationId}'`,
            donation_id: `'${intake.donationId}'`,
          })} RETURNING id`,
        );
        await role(db, null);
        expect(r.ok, refusal(r)).toBe(true);
        expect(await casesOf(db, intake.operationId)).toHaveLength(1);
      }));

    const grantsRow = async () =>
      (
        await db.query(
          `SELECT (SELECT string_agg(a.grantee::regrole::text || ':' || a.privilege_type, ',' ORDER BY a.grantee::regrole::text, a.privilege_type)
                     FROM aclexplode(c.relacl) AS a WHERE a.grantee <> c.relowner) AS grants,
                  (SELECT count(*)::int FROM pg_attribute AS t WHERE t.attrelid = c.oid AND t.attacl IS NOT NULL) AS column_grants,
                  (SELECT string_agg(t.attname, ',' ORDER BY t.attname) FROM pg_attribute AS t
                    WHERE t.attrelid = c.oid AND t.attnum > 0 AND NOT t.attisdropped
                      AND has_column_privilege('tenant_guard', c.oid, t.attnum, 'INSERT')) AS guard_insert,
                  (SELECT pg_get_triggerdef(g.oid) FROM pg_trigger AS g
                    WHERE g.tgrelid = c.oid AND g.tgname = 'payment_repair_cases_rules') AS trigger
             FROM pg_class AS c WHERE c.oid = 'public.payment_repair_cases'::regclass`,
        )
      ).rows[0] as Record<string, unknown>;

    it("G6: after the migration the guard holds INSERT of exactly its four columns and the rule fires on INSERT; the header's read-only check is true; its Down, run in a rolled-back transaction, gives back R1a's grant and trigger (F27's values) and R1a's rules function, byte for byte as R1a wrote it", () =>
      inTx(db, async () => {
        await role(db, null);
        const text = migrationFile();
        const header = headerOf(text);
        const prose = header
          .map((l) => l.replace(/^--\s?/, ""))
          .join(" ")
          .replace(/\s+/g, " ");
        expect(prose).toContain(COMMITTED_CHECK);
        expect(
          Object.values((await db.query(COMMITTED_CHECK)).rows[0] ?? {}),
        ).toEqual([true]);
        expect(await grantsRow()).toEqual({
          grants: "tenant_guard:SELECT",
          column_grants: 4,
          guard_insert: "donation_id,kind,operation_id,tenant_id",
          trigger:
            "CREATE TRIGGER payment_repair_cases_rules BEFORE INSERT OR DELETE OR UPDATE ON public.payment_repair_cases FOR EACH ROW EXECUTE FUNCTION private.payment_repair_cases_rules()",
        });
        const start = header.findIndex((l) => /^-- Down\b/.test(l));
        expect(start).toBeGreaterThan(0);
        const down = header
          .slice(start + 1)
          .filter((l) => l.startsWith("--   ") || l === "--")
          .map((l) => (l === "--" ? "" : l.slice(5)))
          .filter((l) => !/^(BEGIN|COMMIT);$/.test(l.trim()))
          .join("\n");
        const r1aText = readFileSync(
          join(
            MIGRATIONS,
            "20261126020100_wp8a2_provider_operation_record.sql",
          ),
          "utf8",
        );
        const r1aStart = r1aText.indexOf(
          "CREATE FUNCTION private.payment_repair_cases_rules()",
        );
        const r1aFunction = r1aText
          .slice(r1aStart, r1aText.indexOf("\n$$;", r1aStart) + "\n$$;".length)
          .replace("CREATE FUNCTION", "CREATE OR REPLACE FUNCTION");
        const functionText = async () =>
          (
            await db.query(
              "SELECT pg_get_functiondef('private.payment_repair_cases_rules()'::regprocedure) AS def",
            )
          ).rows[0]?.def as string;
        expect(down).toContain(
          "REVOKE INSERT ON TABLE public.payment_repair_cases FROM tenant_guard;",
        );
        await db.query("SAVEPOINT r1b_down");
        await db.query(down);
        const after = await grantsRow();
        const restored = await functionText();
        await db.query(r1aFunction);
        const asR1aWroteIt = await functionText();
        await db.query("ROLLBACK TO SAVEPOINT r1b_down");
        expect(r1aStart).toBeGreaterThan(-1);
        expect(restored).toBe(asR1aWroteIt);
        expect(after).toEqual({
          grants: "tenant_guard:INSERT,tenant_guard:SELECT",
          column_grants: 0,
          guard_insert:
            "created_at,donation_id,id,kind,operation_id,resolution,resolution_details,resolution_reason,resolved_assignment_id,resolved_at,resolved_by,tenant_id",
          trigger:
            "CREATE TRIGGER payment_repair_cases_rules BEFORE DELETE OR UPDATE ON public.payment_repair_cases FOR EACH ROW EXECUTE FUNCTION private.payment_repair_cases_rules()",
        });
        expect(
          (
            await db.query(
              "SELECT pg_get_functiondef('private.payment_repair_cases_rules()'::regprocedure) AS def",
            )
          ).rows[0]?.def,
        ).toContain("payment_repair_case_created_resolved");
      }));

    it("G7 (review finding 3): the read-only check as the header writes it answers false, never an error, when the table is absent; false before this file, after its Down; true after it", () =>
      inTx(db, async () => {
        await role(db, null);
        const header = headerOf(migrationFile());
        const from = header.findIndex((l) =>
          l.includes("read-only check is true:"),
        );
        const to = header.findIndex(
          (l, i) => i > from && l.startsWith("-- Then follow"),
        );
        const check = header
          .slice(from + 1, to)
          .map((l) => l.replace(/^--\s*/, ""))
          .join("\n");
        expect(check).toMatch(/^SELECT /);
        const answer = async () => {
          const r = await attempt(db, check);
          return r.ok
            ? String(Object.values(r.rows[0] ?? {})[0])
            : `error ${r.code}`;
        };
        const got: string[] = [`after: ${await answer()}`];
        await db.query("SAVEPOINT r1b_g7");
        await db.query(downOf(migrationFile()));
        got.push(`before: ${await answer()}`);
        await db.query("ROLLBACK TO SAVEPOINT r1b_g7");
        await db.query("SAVEPOINT r1b_g7");
        await db.query(
          "ALTER TABLE public.payment_repair_cases RENAME TO payment_repair_cases_set_aside",
        );
        got.push(`absent: ${await answer()}`);
        await db.query("ROLLBACK TO SAVEPOINT r1b_g7");
        expect(got).toEqual(["after: true", "before: false", "absent: false"]);
      }));
  },
);
