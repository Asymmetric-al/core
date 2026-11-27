import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  GUARD_TEST_GRANTS,
  HOSTED_SERVICE_GRANTS,
  IN_MIGRATE_JOB,
  R2A_FILES,
  attempt,
  enqueue,
  enterAs,
  feeFund,
  grant,
  inTx,
  insertLines,
  lineIntake,
  missionary,
  r2aMigration,
  refusal,
  role,
  seedTwoTenants,
  type Side,
} from "./wp8a-p2r2a-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const COMMITTED_CHECKS = [
  "SELECT EXISTS (SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid = to_regclass('public.funds') AND attname = 'is_reserved_fee_cover' AND NOT attisdropped)",
  "SELECT to_regclass('public.donation_intake_lines') IS NOT NULL",
  "SELECT EXISTS (SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid = to_regclass('public.staged_gift_allocations') AND attname = 'line_number' AND NOT attisdropped)",
  "SELECT to_regclass('public.payment_observations') IS NOT NULL",
  "SELECT to_regprocedure('public.apply_payment_outcome(uuid,integer)') IS NOT NULL",
];

const flatten = (text: string) =>
  text
    .split("\n")
    .filter((l) => l.startsWith("--"))
    .map((l) => l.replace(/^--\s*/, ""))
    .join(" ")
    .replace(/\s+/g, " ");

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R2a: the schema of the paid intake (index sections 3.1 and 3.2; real stack; every test rolls back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const code = async (sql: string, params: unknown[] = []) => {
      const r = await attempt(db, sql, params);
      return r.ok ? "ok" : `${r.code} ${r.message}`;
    };

    const LINE_BALANCE =
      "public.donation_intake_lines_balance, public.donations_intake_lines_balance";

    const atCommit = async (fn: () => Promise<unknown>) => {
      await db.query("SAVEPOINT r2a_commit");
      try {
        await fn();
        await role(db, null);
      } catch (error) {
        await db.query("ROLLBACK TO SAVEPOINT r2a_commit");
        throw error;
      }
      try {
        await db.query(`SET CONSTRAINTS ${LINE_BALANCE} IMMEDIATE`);
      } catch (error) {
        await db.query("ROLLBACK TO SAVEPOINT r2a_commit");
        await db.query(`SET CONSTRAINTS ${LINE_BALANCE} DEFERRED`);
        const e = error as { code?: string; message?: string };
        return `${e.code} ${e.message}`;
      }
      await db.query(`SET CONSTRAINTS ${LINE_BALANCE} DEFERRED`);
      await db.query("RELEASE SAVEPOINT r2a_commit");
      return "ok";
    };

    async function bareIntake(side: Side, amount: number) {
      const id = randomUUID();
      await grant(db, GUARD_TEST_GRANTS);
      await enterAs(db, "tenant_guard", side.tenant);
      await db.query(
        `INSERT INTO public.donations
           (id, tenant_id, legal_entity_id, payment_account_binding_id, provider_account_ref, livemode, amount, currency)
         VALUES ($1, $2, $3, $4, $5, false, $6, 'usd')`,
        [id, side.tenant, side.entity, side.binding, side.account, amount],
      );
      return id;
    }

    it("A0: the five migrations exist once each by suffix, each header carries its committed check, and each check is true here", async () => {
      for (const [i, name] of R2A_FILES.entries()) {
        const file = r2aMigration(name);
        const check = COMMITTED_CHECKS[i]!;
        expect(flatten(file.text)).toContain(check.replace(/^SELECT /, ""));
        expect(file.text).toMatch(/^BEGIN;\nSET LOCAL lock_timeout = '5s';\n/m);
        expect(file.text).toMatch(
          /\nCOMMIT;\n\nSELECT pg_notify\('pgrst', 'reload schema'\);\n$/,
        );
        expect((await db.query(`${check} AS v`)).rows[0].v).toBe(true);
      }
    });

    it("A1: funds.is_reserved_fee_cover is generated, NOT NULL and false for a NULL purpose; the key is (tenant, id, entity, flag), nondeferrable; the backfill gives every entity one reserved fund and inserts nothing when run again; the preflight raises on an inactive reserved fund with counts only", () =>
      inTx(db, async () => {
        await role(db, null);
        expect(
          (
            await db.query(
              `SELECT a.attnotnull, a.attgenerated, pg_get_expr(d.adbin, d.adrelid) AS expr,
                      (SELECT pg_get_constraintdef(c.oid) || ' ' || c.condeferrable
                         FROM pg_constraint AS c
                        WHERE c.conname = 'funds_tenant_entity_fee_cover_key') AS key
                 FROM pg_attribute AS a
                 JOIN pg_attrdef AS d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
                WHERE a.attrelid = 'public.funds'::regclass AND a.attname = 'is_reserved_fee_cover'`,
            )
          ).rows,
        ).toEqual([
          {
            attnotnull: true,
            attgenerated: "s",
            expr: "(NOT (system_purpose IS DISTINCT FROM 'fee_cover'::text))",
            key: "UNIQUE (tenant_id, id, legal_entity_id, is_reserved_fee_cover) false",
          },
        ]);
        const fx = await seedTwoTenants(db);
        const fee = await feeFund(db, fx.A);
        expect(
          (
            await db.query(
              "SELECT id = $1 AS fee, is_reserved_fee_cover FROM public.funds WHERE id IN ($1, $2) ORDER BY 1",
              [fee, fx.A.fund],
            )
          ).rows,
        ).toEqual([
          { fee: false, is_reserved_fee_cover: false },
          { fee: true, is_reserved_fee_cover: true },
        ]);

        const text = r2aMigration("fee_cover_key").text;
        const backfill =
          /INSERT INTO public\.funds \(tenant_id[\s\S]*?DO NOTHING;/.exec(
            text,
          )![0];
        const first = await db.query(backfill);
        const without = async () =>
          (
            await db.query(
              `SELECT count(*)::int AS n FROM public.legal_entities AS e
                WHERE (SELECT count(*) FROM public.funds AS f
                        WHERE f.legal_entity_id = e.id AND f.is_reserved_fee_cover) <> 1`,
            )
          ).rows[0].n as number;
        expect(first.rowCount).toBeGreaterThanOrEqual(3);
        expect(await without()).toBe(0);
        expect((await db.query(backfill)).rowCount).toBe(0);
        expect(
          (
            await db.query(
              `SELECT name, currency, tenant_id = $2 AS tenant FROM public.funds
                WHERE legal_entity_id = $1 AND is_reserved_fee_cover`,
              [fx.A.otherEntity, fx.A.tenant],
            )
          ).rows,
        ).toEqual([{ name: "Fee cover", currency: "usd", tenant: true }]);

        const preflight =
          /DO \$\$\nDECLARE\n  v_inactive[\s\S]*?\nEND\n\$\$;/.exec(text)![0];
        expect(await code(preflight)).toBe("ok");
        await db.query(
          "UPDATE public.funds SET is_active = false WHERE id = $1",
          [fee],
        );
        const refused = await attempt(db, preflight);
        expect([refused.code, refused.message]).toEqual([
          "55000",
          "fee_cover_fund_inactive",
        ]);
        await db.query("SAVEPOINT detail");
        const detail = await db
          .query(preflight)
          .catch((e: { detail?: string }) => e.detail);
        await db.query("ROLLBACK TO SAVEPOINT detail");
        expect(detail).toMatch(
          /^\d+ reserved fee-cover funds are not active; nothing was changed\.$/,
        );
      }));

    it("A2: lines: a donor line on the reserved fund, a fee line on an ordinary fund, a line or target of the other entity or tenant is 23503; at commit a sum one cent off, no donor line or no line is 23514; a line updated, deleted or added after commit is 23514", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const fee = await feeFund(db, fx.A);
        const otherEntityFund = randomUUID();
        await db.query(
          "INSERT INTO public.funds (id, tenant_id, legal_entity_id, name) VALUES ($1, $2, $3, 'Other entity fund')",
          [otherEntityFund, fx.A.tenant, fx.A.otherEntity],
        );
        const otherEntityWorker = await missionary(db, fx.A, fx.A.otherEntity);
        await role(db, null);
        await db.query("SAVEPOINT r2a_keys");
        const id = await bareIntake(fx.A, 1000);
        const line = (
          over: Record<string, unknown>,
          as: "tenant_guard" | "postgres" = "tenant_guard",
        ) => {
          const v = {
            tenant_id: fx.A.tenant,
            donation_id: id,
            legal_entity_id: fx.A.entity,
            line_number: 1,
            fund_id: fx.A.fund as string | null,
            missionary_id: null as string | null,
            is_fee_cover: false,
            amount: 1000,
            ...over,
          };
          return (async () => {
            if (as === "tenant_guard")
              await enterAs(db, "tenant_guard", fx.A.tenant);
            else await role(db, null);
            const names = Object.keys(v);
            const r = await code(
              `INSERT INTO public.donation_intake_lines (${names.join(", ")}) VALUES (${names.map((_, i) => `$${i + 1}`).join(", ")})`,
              Object.values(v),
            );
            await role(db, null);
            return r.replace(/^(\d{5}) .*"(\w+)".*$/, "$1 $2");
          })();
        };
        expect([
          await line({ fund_id: fee }),
          await line({ fund_id: fx.A.fund, is_fee_cover: true }),
          await line({ fund_id: otherEntityFund }),
          await line({
            legal_entity_id: fx.A.otherEntity,
            fund_id: otherEntityFund,
          }),
          await line({ fund_id: null, missionary_id: otherEntityWorker }),
          await line(
            { tenant_id: fx.B.tenant, fund_id: fx.B.fund },
            "postgres",
          ),
          await line({ fund_id: fx.B.fund }, "postgres"),
        ]).toEqual([
          "23503 donation_intake_lines_fund_fk",
          "23503 donation_intake_lines_fund_fk",
          "23503 donation_intake_lines_fund_fk",
          "23503 donation_intake_lines_intake_fk",
          "23503 donation_intake_lines_missionary_fk",
          "23503 donation_intake_lines_intake_fk",
          "23503 donation_intake_lines_fund_fk",
        ]);
        expect([
          await line({ fund_id: null, missionary_id: null }),
          await line({
            fund_id: null,
            missionary_id: otherEntityWorker,
            is_fee_cover: true,
          }),
          await line({ line_number: 0 }),
          await line({ line_number: 101 }),
          await line({ amount: 0 }),
        ]).toEqual([
          "23514 donation_intake_lines_one_target_check",
          "23514 donation_intake_lines_fee_fund_check",
          "23514 donation_intake_lines_line_number_check",
          "23514 donation_intake_lines_line_number_check",
          "23514 donation_intake_lines_amount_check",
        ]);

        await role(db, null);
        await db.query("ROLLBACK TO SAVEPOINT r2a_keys");
        const unbalanced = async (lines: Parameters<typeof insertLines>[3]) =>
          atCommit(async () => {
            const d = await bareIntake(fx.A, 1000);
            await insertLines(db, fx.A, d, lines);
          });
        const verdict = (s: string) => s.replace(/^(\d{5}) (\w+).*$/, "$1 $2");
        expect(
          [
            await unbalanced([{ amount: 999 }]),
            await unbalanced([{ amount: 600 }, { amount: 401 }]),
            await unbalanced([{ fund: fee, fee: true, amount: 1000 }]),
            await unbalanced([]),
            await unbalanced([
              { amount: 700 },
              { fund: fee, fee: true, amount: 300 },
            ]),
          ].map(verdict),
        ).toEqual([
          "23514 donation_intake_lines_unbalanced",
          "23514 donation_intake_lines_unbalanced",
          "23514 donation_intake_lines_unbalanced",
          "23514 donation_intake_lines_unbalanced",
          "ok",
        ]);

        const done = await lineIntake(db, fx.A, {
          lines: [{ amount: 400 }, { amount: 600 }],
        });
        await role(db, null);
        await db.query(`SET CONSTRAINTS ${LINE_BALANCE} IMMEDIATE`);
        const after: string[] = [];
        for (const as of ["tenant_guard", "postgres"]) {
          if (as === "tenant_guard") {
            await grant(db, [
              "GRANT UPDATE, DELETE ON TABLE public.donation_intake_lines TO tenant_guard",
            ]);
            await enterAs(db, "tenant_guard", fx.A.tenant);
          } else await role(db, null);
          after.push(
            verdict(
              await code(
                "UPDATE public.donation_intake_lines SET amount = amount + 1 WHERE donation_id = $1 AND line_number = 1",
                [done.donationId],
              ),
            ),
            verdict(
              await code(
                "DELETE FROM public.donation_intake_lines WHERE donation_id = $1 AND line_number = 2",
                [done.donationId],
              ),
            ),
          );
        }
        await role(db, null);
        after.push(
          verdict(
            await code(
              `INSERT INTO public.donation_intake_lines
                 (tenant_id, donation_id, legal_entity_id, line_number, fund_id, is_fee_cover, amount)
               VALUES ($1, $2, $3, 3, $4, false, 1)`,
              [fx.A.tenant, done.donationId, fx.A.entity, fx.A.fund],
            ),
          ),
        );
        expect(after).toEqual([
          "23514 donation_intake_lines_sealed",
          "23514 donation_intake_lines_sealed",
          "23514 donation_intake_lines_sealed",
          "23514 donation_intake_lines_sealed",
          "23514 donation_intake_lines_unbalanced",
        ]);
      }));

    it("A5: on a line-based intake, completed to failed or processing, failed to pending, or a changed payment_method is 23514 for every role; the allowed moves pass; (guard) R1a's A4 still holds: service_role moves the status and sets donor_id", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        await grant(db, [...HOSTED_SERVICE_GRANTS]);
        const intake = await lineIntake(db, fx.A, { method: "card" });
        const move = async (to: string, as = "postgres") => {
          await role(db, as === "postgres" ? null : as);
          if (as === "tenant_guard")
            await enterAs(db, "tenant_guard", fx.A.tenant);
          const r = await code(
            "UPDATE public.donations SET status = $2 WHERE id = $1",
            [intake.donationId, to],
          );
          await role(db, null);
          return `${to}: ${r.replace(/^(\d{5}) (\w+).*$/, "$1 $2")}`;
        };
        expect([
          await move("pending"),
          await move("processing", "tenant_guard"),
          await move("failed", "service_role"),
          await move("pending"),
          await move("processing"),
          await move("completed", "tenant_guard"),
          await move("failed"),
          await move("processing", "service_role"),
          await move("pending", "tenant_guard"),
          await move("refunded"),
        ]).toEqual([
          "pending: ok",
          "processing: ok",
          "failed: ok",
          "pending: 23514 donation_line_status_move",
          "processing: ok",
          "completed: ok",
          "failed: 23514 donation_line_status_move",
          "processing: 23514 donation_line_status_move",
          "pending: 23514 donation_line_status_move",
          "refunded: 23514 donation_line_status_move",
        ]);
        const method: string[] = [];
        for (const [as, value] of [
          ["postgres", "ach"],
          ["service_role", null],
        ] as const) {
          await role(db, as === "postgres" ? null : as);
          method.push(
            await code(
              "UPDATE public.donations SET payment_method = $2 WHERE id = $1",
              [intake.donationId, value],
            ),
          );
        }
        await role(db, null);
        expect(
          method.map((m) => m.replace(/^(\d{5}) (\w+).*$/, "$1 $2")),
        ).toEqual([
          "23514 donation_line_intake_sealed",
          "23514 donation_line_intake_sealed",
        ]);
        expect(
          await code(
            "INSERT INTO public.donations (tenant_id, amount, currency, payment_method) VALUES ($1, 1, 'usd', 'cheque')",
            [fx.A.tenant],
          ),
        ).toBe("ok");
        const other = await lineIntake(db, fx.A);
        const user = randomUUID();
        await db.query("INSERT INTO auth.users (id) VALUES ($1)", [user]);
        const donor = (
          await db.query(
            "INSERT INTO public.donors (tenant_id, party_id, email) VALUES ($1, public.donor_party_for_insert($1, null, null, $2), $2) RETURNING id",
            [fx.A.tenant, `${user}@example.org`],
          )
        ).rows[0].id as string;
        await role(db, "service_role");
        expect(
          await code(
            "UPDATE public.donations SET status = 'completed', donor_id = $2 WHERE id = $1",
            [other.donationId, donor],
          ),
        ).toBe("ok");
        await role(db, null);
        expect(
          (
            await db.query(
              "SELECT status, donor_id FROM public.donations WHERE id = $1",
              [other.donationId],
            )
          ).rows,
        ).toEqual([{ status: "completed", donor_id: donor }]);
      }));

    it("A6: a provider row whose amount or currency is not its intake's is 23503 donation_saga_outbox_intake_amount_fk; (guard) a legacy outbox row is untouched by the key", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await lineIntake(db, fx.A);
        const insertAs = async (amount: number, currency: string) => {
          const id = randomUUID();
          const params = {
            amount,
            currency,
            metadata: { asym_operation: id, asym_intake: intake.donationId },
            automatic_payment_methods: { enabled: true },
          };
          await enterAs(db, "tenant_guard", fx.A.tenant);
          const r = await code(
            `INSERT INTO public.donation_saga_outbox
               (id, tenant_id, donation_id, amount, currency, idempotency_key, status, next_attempt_at,
                request_kind, provider_account_ref, livemode, request_params, request_digest)
             VALUES ($1, $2, $3, $4, $5, 'gift:' || $3::uuid::text || ':create_payment', 'queued', now(),
                     'create_payment', $6, false, $7::jsonb,
                     encode(sha256(convert_to($7::jsonb::text, 'UTF8')), 'hex'))`,
            [
              id,
              fx.A.tenant,
              intake.donationId,
              amount,
              currency,
              fx.A.account,
              JSON.stringify(params),
            ],
          );
          await role(db, null);
          return r.replace(/^(\d{5}) .*"(\w+)".*$/, "$1 $2");
        };
        expect([
          await insertAs(intake.amount - 1, "usd"),
          await insertAs(intake.amount, "eur"),
          await insertAs(intake.amount, "usd"),
        ]).toEqual([
          "23503 donation_saga_outbox_intake_amount_fk",
          "23503 donation_saga_outbox_intake_amount_fk",
          "ok",
        ]);
        expect((await enqueue(db, fx.A, intake.donationId)).code).toBe("23505");

        await grant(db, HOSTED_SERVICE_GRANTS);
        await role(db, "service_role");
        const legacy = (
          await db.query(
            "INSERT INTO public.donations (tenant_id, amount, currency) VALUES ($1, 500, 'usd') RETURNING id",
            [fx.A.tenant],
          )
        ).rows[0].id as string;
        const donor = (
          await db.query(
            "INSERT INTO public.donors (tenant_id, party_id, email) VALUES ($1, public.donor_party_for_insert($1, null, null, $2), $2) RETURNING id",
            [fx.A.tenant, `${randomUUID()}@example.org`],
          )
        ).rows[0].id as string;
        expect(
          refusal(
            await attempt(
              db,
              `INSERT INTO public.donation_saga_outbox (tenant_id, donation_id, donor_id, amount, currency, idempotency_key)
               VALUES ($1, $2, $3, 999, 'eur', $4)`,
              [fx.A.tenant, legacy, donor, `legacy-${randomUUID()}`],
            ),
          ),
        ).toBe("undefined undefined");
        await role(db, null);
      }));
  },
);
