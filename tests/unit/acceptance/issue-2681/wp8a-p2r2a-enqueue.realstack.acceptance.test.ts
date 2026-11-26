import { createHash, randomUUID } from "node:crypto";

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
  GUARD_TEST_GRANTS,
  HOSTED_SERVICE_GRANTS,
  IN_MIGRATE_JOB,
  enqueue,
  enterAs,
  feeFund,
  grant,
  inTx,
  insertLines,
  lineIntake,
  paymentIntent,
  recordReference,
  refusal,
  role,
  seedTwoTenants,
} from "./wp8a-p2r2a-harness";
import { runWorker } from "./wp8a-p2r2a-worker";
import {
  createStripeProviderFake,
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
      throw new Error("a test of the enqueue tried to reach the network");
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R2a: the enqueue, the one writer of a provider request (index section 5; real stack; every test rolls back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const stored = async (id: string) => {
      await role(db, null);
      return (
        await db.query(
          `SELECT kind, tenant_id, donation_id, donor_id, fund_id, missionary_id, amount, currency,
                  idempotency_key, status, attempt_count, max_attempts, request_kind, provider_account_ref,
                  livemode, request_params, request_digest, request_params::text AS params_text,
                  next_attempt_at <= clock_timestamp() AS due, first_sent_at, outcome_unknown
             FROM public.donation_saga_outbox WHERE id = $1`,
          [id],
        )
      ).rows[0] as Record<string, unknown>;
    };

    it("B1: the signature is (p_donation_id uuid) only; the stored row is index section 5's (amount, currency, account and mode of the intake, metadata of ids and cents, the method's key, the digest of the stored parameters) and passes R1a's checks", () =>
      inTx(db, async () => {
        await role(db, null);
        expect(
          (
            await db.query(
              `SELECT p.oid::regprocedure::text AS sig, pg_get_function_identity_arguments(p.oid) AS args,
                      pg_get_function_result(p.oid) AS result
                 FROM pg_proc AS p
                WHERE p.proname = 'money_enqueue_payment_request'`,
            )
          ).rows,
        ).toEqual([
          {
            sig: "tenant_guard.money_enqueue_payment_request(uuid)",
            args: "p_donation_id uuid",
            result: "uuid",
          },
        ]);
        const fx = await seedTwoTenants(db);
        const fee = await feeFund(db, fx.A);
        const rows: Record<string, unknown>[] = [];
        for (const [method, lines] of [
          [null, [{ amount: 10000 }, { fund: fee, fee: true, amount: 300 }]],
          ["card", [{ amount: 5000 }]],
          ["ach", [{ amount: 2500 }, { amount: 2500 }]],
          ["wallet", [{ amount: 700 }]],
        ] as const) {
          const intake = await lineIntake(db, fx.A, {
            method,
            lines: lines.map((l) => ({ ...l })),
          });
          const r = await enqueue(db, fx.A, intake.donationId);
          expect(r.ok, refusal(r)).toBe(true);
          const id = r.rows[0]!.id as string;
          const row = await stored(id);
          expect(row.request_digest).toBe(
            createHash("sha256")
              .update(row.params_text as string)
              .digest("hex"),
          );
          rows.push({ method, id, intake: intake.donationId, ...row });
        }
        const expectedParams = (
          r: Record<string, unknown>,
          amount: number,
          donor: number,
          cover: number,
        ) => ({
          amount,
          currency: "usd",
          metadata: {
            asym_operation: r.id,
            asym_intake: r.intake,
            gift_amount_cents: String(donor),
            cover_fees: cover > 0 ? "true" : "false",
            cover_amount_cents: String(cover),
            ...(r.method ? { payment_method: r.method } : {}),
          },
          ...(r.method === null
            ? { automatic_payment_methods: { enabled: true } }
            : {
                payment_method_types:
                  r.method === "ach" ? ["us_bank_account"] : ["card"],
              }),
        });
        expect(rows.map((r) => r.request_params)).toEqual([
          expectedParams(rows[0]!, 10300, 10000, 300),
          expectedParams(rows[1]!, 5000, 5000, 0),
          expectedParams(rows[2]!, 5000, 5000, 0),
          expectedParams(rows[3]!, 700, 700, 0),
        ]);
        for (const r of rows)
          expect(r).toMatchObject({
            kind: "provider_request",
            tenant_id: fx.A.tenant,
            donation_id: r.intake,
            donor_id: null,
            fund_id: null,
            missionary_id: null,
            currency: "usd",
            idempotency_key: `gift:${r.intake as string}:create_payment`,
            status: "queued",
            attempt_count: 0,
            max_attempts: 5,
            request_kind: "create_payment",
            provider_account_ref: fx.A.account,
            livemode: false,
            due: true,
            first_sent_at: null,
            outcome_unknown: false,
          });
      }));

    it("B2: each refusal of index section 5: not_found (another tenant, a legacy intake, none) 42501; not pending or a reference recorded 55000 intake_not_payable; a binding not active 55000 binding_inactive; no donor line or lines that do not sum 23514 intake_lines_incomplete; a second request 23505", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const got: string[] = [];
        const tryIt = async (label: string, donationId: string) =>
          got.push(`${label}: ${refusal(await enqueue(db, fx.A, donationId))}`);

        const theirs = await lineIntake(db, fx.B);
        await tryIt("another tenant", theirs.donationId);
        await grant(db, HOSTED_SERVICE_GRANTS);
        await role(db, "service_role");
        const legacy = (
          await db.query(
            "INSERT INTO public.donations (tenant_id, amount, currency) VALUES ($1, 500, 'usd') RETURNING id",
            [fx.A.tenant],
          )
        ).rows[0].id as string;
        await role(db, null);
        await tryIt("legacy", legacy);
        await tryIt("none", randomUUID());

        const processing = await lineIntake(db, fx.A, { status: "processing" });
        await tryIt("processing", processing.donationId);
        const referenced = await lineIntake(db, fx.A);
        await recordReference(db, referenced.donationId, paymentIntent());
        await tryIt("referenced", referenced.donationId);

        const restricted = await lineIntake(db, fx.A);
        await role(db, null);
        await db.query(
          "UPDATE public.payment_account_bindings SET status = 'restricted', restricted_at = now() WHERE id = $1",
          [fx.A.binding],
        );
        await tryIt("restricted binding", restricted.donationId);
        await db.query(
          "UPDATE public.payment_account_bindings SET status = 'active' WHERE id = $1",
          [fx.A.binding],
        );

        const fee = await feeFund(db, fx.A);
        const bare = async (lines: Parameters<typeof insertLines>[3]) => {
          const id = randomUUID();
          await grant(db, GUARD_TEST_GRANTS);
          await enterAs(db, "tenant_guard", fx.A.tenant);
          await db.query(
            `INSERT INTO public.donations
               (id, tenant_id, legal_entity_id, payment_account_binding_id, provider_account_ref, livemode, amount, currency)
             VALUES ($1, $2, $3, $4, $5, false, 1000, 'usd')`,
            [id, fx.A.tenant, fx.A.entity, fx.A.binding, fx.A.account],
          );
          await insertLines(db, fx.A, id, lines);
          await role(db, null);
          return id;
        };
        await tryIt("no line", await bare([]));
        await tryIt(
          "a fee line only",
          await bare([{ fund: fee, fee: true, amount: 1000 }]),
        );
        await tryIt("one cent short", await bare([{ amount: 999 }]));
        await tryIt(
          "one cent over",
          await bare([{ amount: 600 }, { amount: 401 }]),
        );

        const once = await lineIntake(db, fx.A);
        expect((await enqueue(db, fx.A, once.donationId)).ok).toBe(true);
        await tryIt("second request", once.donationId);

        expect(got.map((g) => g.replace(/(\d{5}) (\S+).*/, "$1 $2"))).toEqual([
          "another tenant: 42501 not_found",
          "legacy: 42501 not_found",
          "none: 42501 not_found",
          "processing: 55000 intake_not_payable",
          "referenced: 55000 intake_not_payable",
          "restricted binding: 55000 binding_inactive",
          "no line: 23514 intake_lines_incomplete",
          "a fee line only: 23514 intake_lines_incomplete",
          "one cent short: 23514 intake_lines_incomplete",
          "one cent over: 23514 intake_lines_incomplete",
          "second request: 23505 duplicate",
        ]);
      }));

    it("B3 (contributes :1158 and :1178): through runProviderOperation over the fake, the request sent carries the intake's amount and currency, metadata of ids and cents only and no customer; the stored row names no donor", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const fee = await feeFund(db, fx.A);
        const intake = await lineIntake(db, fx.A, {
          method: "card",
          lines: [{ amount: 2000 }, { fund: fee, fee: true, amount: 90 }],
        });
        const r = await enqueue(db, fx.A, intake.donationId);
        const operationId = r.rows[0]!.id as string;
        const fake = createStripeProviderFake();
        fake.script(succeed());
        const run = await runWorker(db, operationId, fake);
        expect(run).toMatchObject({
          sent: true,
          report: { data: { outcome: "linked" } },
        });
        const [request] = fake.requests();
        expect(request).toMatchObject({
          method: "POST",
          path: "/v1/payment_intents",
          key: `gift:${intake.donationId}:create_payment`,
          account: fx.A.account,
        });
        expect(Object.keys(request!.body).sort()).toEqual([
          "amount",
          "currency",
          "metadata",
          "payment_method_types",
        ]);
        expect(request!.body).toMatchObject({
          amount: "2090",
          currency: "usd",
          metadata: {
            asym_operation: operationId,
            asym_intake: intake.donationId,
            gift_amount_cents: "2000",
            cover_fees: "true",
            cover_amount_cents: "90",
            payment_method: "card",
          },
        });
        expect(Object.keys(request!.body.metadata as object).sort()).toEqual([
          "asym_intake",
          "asym_operation",
          "cover_amount_cents",
          "cover_fees",
          "gift_amount_cents",
          "payment_method",
        ]);
        expect(request!.rawBody).not.toMatch(/customer|email|name=/);
        await role(db, null);
        expect(
          (
            await db.query(
              "SELECT donor_id FROM public.donation_saga_outbox WHERE id = $1",
              [operationId],
            )
          ).rows[0].donor_id,
        ).toBeNull();
        expect(
          (
            await db.query(
              "SELECT donor_id FROM public.donations WHERE id = $1",
              [intake.donationId],
            )
          ).rows[0].donor_id,
        ).toBeNull();
      }));
  },
);
