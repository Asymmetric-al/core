import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  GUARD_TEST_GRANTS,
  GUARD_WIDE_INSERT_GRANTS,
  IN_MIGRATE_JOB,
  attempt,
  enterAs,
  grant,
  guardIntake,
  inTx,
  paymentIntent,
  refusal,
  replica,
  requestParams,
  role,
  seedTwoTenants,
  type Intake,
} from "./wp8a-p2r1a-harness";
import { GIFT_PROCESSING_FEE_METADATA_KEYS } from "../../../../packages/api/src/donate/payment-intent";
import { paymentMethodTypesFromFeeMetadata } from "../../../../packages/api/src/donate/saga";

import type { GiftProcessingFeeStripeMetadata } from "../../../../packages/api/src/donate/fee-policy";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R1a: the provider-operation record, request parameters (real stack; every test rolls back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

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

    it("C10: each parameter rule (Q2, amended) refuses its breach and admits card, ach, wallet and automatic methods", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        const op = intake.operationId;
        const base = () =>
          requestParams(
            op,
            intake.donationId,
            intake.amount,
            "usd",
            "card",
          ) as Record<string, unknown> & { metadata: Record<string, unknown> };
        const variants: [string, () => unknown][] = [
          ["an extra top-level key", () => ({ ...base(), description: "x" })],
          [
            "the amount as a string",
            () => ({ ...base(), amount: String(intake.amount) }),
          ],
          ["another amount", () => ({ ...base(), amount: intake.amount + 1 })],
          ["another currency", () => ({ ...base(), currency: "eur" })],
          [
            "an extra metadata key",
            () => {
              const p = base();
              p.metadata.worker = "jane";
              return p;
            },
          ],
          [
            "a boolean metadata value",
            () => {
              const p = base();
              p.metadata.cover_fees = true;
              return p;
            },
          ],
          [
            "a number metadata value",
            () => {
              const p = base();
              p.metadata.gift_amount_cents = 100;
              return p;
            },
          ],
          [
            "a null metadata value",
            () => {
              const p = base();
              p.metadata.estimated_fee_cents = null;
              return p;
            },
          ],
          [
            "asym_intake not the intake",
            () => {
              const p = base();
              p.metadata.asym_intake = randomUUID();
              return p;
            },
          ],
          [
            "asym_operation not the row",
            () => {
              const p = base();
              p.metadata.asym_operation = randomUUID();
              return p;
            },
          ],
          [
            "no asym_operation",
            () => {
              const p = base();
              delete p.metadata.asym_operation;
              return p;
            },
          ],
          [
            "payment_method us_bank_account",
            () => {
              const p = base();
              p.metadata.payment_method = "us_bank_account";
              return p;
            },
          ],
          [
            "free-text payment_method_types",
            () => ({ ...base(), payment_method_types: "card" }),
          ],
          [
            "mismatched payment_method_types",
            () => ({
              ...base(),
              payment_method_types: ["us_bank_account"],
            }),
          ],
          [
            "both method keys",
            () => ({
              ...base(),
              automatic_payment_methods: { enabled: true },
            }),
          ],
          [
            "neither method key",
            () => {
              const p = base();
              delete p.payment_method_types;
              return p;
            },
          ],
          [
            "types with no payment_method",
            () => {
              const p = base();
              delete p.metadata.payment_method;
              return p;
            },
          ],
          [
            "automatic methods disabled",
            () => {
              const p = base();
              delete p.payment_method_types;
              delete p.metadata.payment_method;
              return { ...p, automatic_payment_methods: { enabled: false } };
            },
          ],
          [
            "a zero gift amount",
            () => {
              const p = base();
              p.metadata.gift_amount_cents = "0";
              return p;
            },
          ],
          [
            "cents with a leading zero",
            () => {
              const p = base();
              p.metadata.cover_amount_cents = "0300";
              return p;
            },
          ],
          [
            "cover_fees not true or false",
            () => {
              const p = base();
              p.metadata.cover_fees = "yes";
              return p;
            },
          ],
          ["not an object", () => [base()]],
        ];
        const got: string[] = [];
        for (const [label, make] of variants)
          got.push(`${label}: ${checkOf(await setParams(op, make()))}`);
        expect(got).toEqual(
          variants.map(
            ([label]) =>
              `${label}: 23514 donation_saga_outbox_request_params_check`,
          ),
        );
        const admitted: string[] = [];
        for (const method of ["card", "ach", "wallet", undefined] as const) {
          const p = requestParams(
            op,
            intake.donationId,
            intake.amount,
            "usd",
            method,
          ) as {
            metadata: Record<string, string>;
          };
          p.metadata.gift_amount_cents = "10000";
          p.metadata.cover_fees = "true";
          p.metadata.cover_amount_cents = "300";
          p.metadata.estimated_fee_cents = "0";
          const r = await setParams(op, p);
          admitted.push(
            `${method ?? "automatic"}: ${r.ok ? "ok" : checkOf(r)}`,
          );
        }
        expect(admitted).toEqual([
          "card: ok",
          "ach: ok",
          "wallet: ok",
          "automatic: ok",
        ]);
      }));

    it("C13: the parameter rule pins its source: its metadata keys are GIFT_PROCESSING_FEE_METADATA_KEYS and the two asym_* keys; each payment_method of the donate schema maps as paymentMethodTypesFromFeeMetadata; other values and free text are refused", () =>
      inTx(db, async () => {
        const def = (
          await db.query(
            "SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = 'public.donation_saga_outbox'::regclass AND conname = 'donation_saga_outbox_request_params_check'",
          )
        ).rows[0]?.def as string;
        expect(def).toBeTruthy();
        const arrays = [...def.matchAll(/ARRAY\[([^\]]+)\]/g)].map((m) =>
          [...m[1]!.matchAll(/'([^']+)'::text/g)].map((k) => k[1]!),
        );
        const metadataKeys = arrays.find((keys) =>
          keys.includes("asym_operation"),
        );
        expect([...(metadataKeys ?? [])].sort()).toEqual(
          [
            ...GIFT_PROCESSING_FEE_METADATA_KEYS,
            "asym_operation",
            "asym_intake",
          ].sort(),
        );
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        const op = intake.operationId;
        const got: string[] = [];
        for (const method of ["card", "ach", "wallet"] as const) {
          const fee: GiftProcessingFeeStripeMetadata = {
            gift_amount_cents: "10000",
            cover_fees: "true",
            payment_method: method,
            cover_amount_cents: "300",
            estimated_fee_cents: "300",
          };
          const p = {
            ...requestParams(op, intake.donationId, intake.amount),
            metadata: {
              asym_operation: op,
              asym_intake: intake.donationId,
              ...fee,
            },
            payment_method_types: paymentMethodTypesFromFeeMetadata(fee),
          } as Record<string, unknown>;
          delete p.automatic_payment_methods;
          const r = await setParams(op, p);
          got.push(`${method}: ${r.ok ? "ok" : checkOf(r)}`);
        }
        for (const [method, types] of [
          ["paypal", ["card"]],
          ["card", ["card", "us_bank_account"]],
          ["ach", "us_bank_account"],
        ] as const) {
          const p = {
            amount: intake.amount,
            currency: "usd",
            metadata: {
              asym_operation: op,
              asym_intake: intake.donationId,
              payment_method: method,
            },
            payment_method_types: types,
          };
          const r = await setParams(op, p);
          got.push(
            `${method} ${JSON.stringify(types)}: ${r.ok ? "ok" : checkOf(r)}`,
          );
        }
        expect(got).toEqual([
          "card: ok",
          "ach: ok",
          "wallet: ok",
          'paypal ["card"]: 23514 donation_saga_outbox_request_params_check',
          'card ["card","us_bank_account"]: 23514 donation_saga_outbox_request_params_check',
          'ach "us_bank_account": 23514 donation_saga_outbox_request_params_check',
        ]);
      }));

    it("C14: rule I: a guard INSERT that is not queued, unsent, unleased, unlinked and known is 23514 provider_request_created_unsent (D-18, AL-2681 R2a: the guard's outbox INSERT is now its enqueue's thirteen columns, so this rolled-back test grants the table INSERT to reach rule I)", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        await grant(db, GUARD_WIDE_INSERT_GRANTS);
        await replica(
          db,
          "DELETE FROM public.donation_saga_outbox WHERE id = $1",
          [intake.operationId],
        );
        const cases: [string, Record<string, unknown>][] = [
          ["sending", { status: "sending" }],
          ["the default status", { status: "pending" }],
          ["an attempt", { attempt_count: 1 }],
          ["a first send time", { first_sent_at: new Date().toISOString() }],
          ["a deadline", { send_deadline: new Date().toISOString() }],
          ["a lease", { lease_expires_at: new Date().toISOString() }],
          ["an object", { provider_object_id: paymentIntent() }],
          ["parked_at", { parked_at: new Date().toISOString() }],
          ["outcome_unknown", { outcome_unknown: true }],
        ];
        const got: string[] = [];
        for (const [label, columns] of cases)
          got.push(
            `${label}: ${refusal(await guardInsertOutbox(intake, columns))}`,
          );
        expect(got).toEqual(
          cases.map(
            ([label]) => `${label}: 23514 provider_request_created_unsent`,
          ),
        );
        const fine = await guardInsertOutbox(intake, {});
        expect(fine.ok, refusal(fine)).toBe(true);
      }));
  },
);
