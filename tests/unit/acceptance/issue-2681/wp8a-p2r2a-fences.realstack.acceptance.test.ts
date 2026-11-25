import { createHash, randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  apply,
  attempt,
  claimEvent,
  enterAs,
  eventRow,
  inTx,
  lineIntake,
  moneyRows,
  paymentIntent,
  recordReference,
  refusal,
  role,
  seedTwoTenants,
  storeEvent,
  syncLease,
  tryApply,
  work,
} from "./wp8a-p2r2a-harness";
import { runTenantRlsCatalogGate } from "../../../../scripts/verify/tenant-rls-catalog.mjs";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const FUNCTIONS = [
  "tenant_guard.apply_payment_outcome(uuid,uuid,integer)",
  "public.apply_payment_outcome(uuid,integer)",
  "tenant_guard.money_apply_payment_event(uuid)",
  "tenant_guard.money_enqueue_payment_request(uuid)",
];
const TRIGGER_FUNCTIONS = [
  "private.donations_line_status()",
  "private.staged_gifts_generation()",
  "private.staged_gift_allocations_generation()",
  "private.payment_observations_sealed()",
  "private.donation_intake_lines_sealed()",
  "private.donation_intake_lines_balance()",
  "private.staged_gift_allocations_balance()",
];

const SQL_WORDS = new Set(
  "select where and or not in exists if elsif when then else case return values filter coalesce nullif greatest least array row on using into from as by is end loop perform insert update set begin declare over conflict any all some returning raise exception detail errcode".split(
    " ",
  ),
);

function unqualifiedCalls(definition: string) {
  const body = definition
    .slice(definition.indexOf("AS $"))
    .replace(/--[^\n]*/g, "")
    .replace(/'(?:[^']|'')*'/g, "''");
  const names = new Set<string>();
  for (const m of body.matchAll(/(^|[^.\w"])([a-z_][a-z0-9_]*)\s*\(/gi)) {
    const name = m[2]!.toLowerCase();
    if (!SQL_WORDS.has(name)) names.add(name);
  }
  return [...names].sort();
}

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R2a: the entry's fences, the stored event's checks and the privileges (index sections 3.5, 4.1, 4.2; real stack; every test rolls back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const paid = async (fx: Awaited<ReturnType<typeof seedTwoTenants>>) => {
      const intake = await lineIntake(db, fx.A);
      const pi = paymentIntent();
      await recordReference(db, intake.donationId, pi);
      return { intake, pi };
    };

    it("C11: the fences: a wrong attempt is 55000 stale_attempt; an expired lease, an event not processing, or the account's sync lease held by another event is 55000 lease_lost; each writes nothing", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const { intake, pi } = await paid(fx);
        const e = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        const before = JSON.stringify(await moneyRows(db, fx.A.tenant));
        const code = async (attemptNo: number) => {
          const r = await tryApply(db, e.id, attemptNo);
          return r.ok ? `ok ${r.rows[0]!.r.outcome}` : `${r.code} ${r.message}`;
        };
        expect(await code(0)).toBe("55000 lease_lost");
        expect(await claimEvent(db, e.id)).toMatchObject({
          outcome: "claimed",
          attempt: 1,
        });
        expect([await code(2), await code(0)]).toEqual([
          "55000 stale_attempt",
          "55000 stale_attempt",
        ]);
        await role(db, null);
        await db.query(
          "UPDATE public.stripe_connect_events SET lease_expires_at = clock_timestamp() - interval '1 second' WHERE id = $1",
          [e.id],
        );
        expect(await code(1)).toBe("55000 lease_lost");
        await db.query(
          "UPDATE public.stripe_connect_events SET lease_expires_at = clock_timestamp() + interval '5 minutes' WHERE id = $1",
          [e.id],
        );
        const other = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        await db.query(
          "UPDATE public.payment_provider_accounts SET sync_lease_event_id = $2 WHERE tenant_id = $1",
          [fx.A.tenant, other.id],
        );
        expect(await code(1)).toBe("55000 lease_lost");
        await db.query(
          "UPDATE public.payment_provider_accounts SET sync_lease_event_id = $2 WHERE tenant_id = $1",
          [fx.A.tenant, e.id],
        );
        expect(JSON.stringify(await moneyRows(db, fx.A.tenant))).toBe(before);
        expect(await code(1)).toBe("ok applied");
        expect(await syncLease(db, fx.A)).toBeNull();
      }));

    it("C11: the stored event is checked against its row before anything is read or written: account, mode, type, id, object, creation time; a PaymentIntent that is not one of this mode with integer amounts, a lower-case currency and metadata: 22023 payment_event_malformed; a type outside the four is ignored_type and the event is completed", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const { intake, pi } = await paid(fx);
        const base = { pi, amount: intake.amount };
        type P = Record<string, unknown>;
        const pio = (p: P) => (p.data as { object: P }).object;
        const cases: [string, (p: P) => P][] = [
          ["account", (p) => ({ ...p, account: "acct_Other0001" })],
          ["mode", (p) => ({ ...p, livemode: true })],
          ["mode as text", (p) => ({ ...p, livemode: "false" })],
          ["type", (p) => ({ ...p, type: "payment_intent.canceled" })],
          ["id", (p) => ({ ...p, id: "evt_Another0001" })],
          ["object", (p) => ({ ...p, object: "Event" })],
          ["created", (p) => ({ ...p, created: (p.created as number) + 1 })],
          ["created as text", (p) => ({ ...p, created: String(p.created) })],
          ["not a PaymentIntent", (p) => ((pio(p).object = "charge"), p)],
          ["id not pi_", (p) => ((pio(p).id = "ch_1234"), p)],
          ["amount 10300.5", (p) => ((pio(p).amount = 10300.5), p)],
          ["amount as text", (p) => ((pio(p).amount = "10300"), p)],
          ["received as text", (p) => ((pio(p).amount_received = "10300"), p)],
          ["received missing", (p) => (delete pio(p).amount_received, p)],
          ["currency upper case", (p) => ((pio(p).currency = "USD"), p)],
          ["object mode", (p) => ((pio(p).livemode = true), p)],
          ["metadata", (p) => ((pio(p).metadata = null), p)],
        ];
        const got: string[] = [];
        for (const [label, payload] of cases) {
          const e = await storeEvent(db, fx.A, { ...base, payload });
          await claimEvent(db, e.id);
          const r = await tryApply(db, e.id, 1);
          got.push(`${label}: ${r.ok ? "ok" : `${r.code} ${r.message}`}`);
          await role(db, null);
          await db.query(
            "UPDATE public.payment_provider_accounts SET sync_lease_event_id = NULL, sync_lease_expires_at = NULL WHERE tenant_id = $1",
            [fx.A.tenant],
          );
        }
        for (const [label, rawText] of [
          [
            "amount 10300.0",
            (t: string) => t.replace('"amount":10300,', '"amount":10300.0,'),
          ],
          [
            "received 10300.0",
            (t: string) =>
              t.replace(
                '"amount_received":10300,',
                '"amount_received":10300.0,',
              ),
          ],
        ] as const) {
          const e = await storeEvent(db, fx.A, { ...base, rawText });
          await claimEvent(db, e.id);
          const r = await tryApply(db, e.id, 1);
          got.push(`${label}: ${r.ok ? "ok" : `${r.code} ${r.message}`}`);
          await role(db, null);
          await db.query(
            "UPDATE public.payment_provider_accounts SET sync_lease_event_id = NULL, sync_lease_expires_at = NULL WHERE tenant_id = $1",
            [fx.A.tenant],
          );
        }
        expect(got).toEqual(
          [...cases.map(([l]) => l), "amount 10300.0", "received 10300.0"].map(
            (l) => `${l}: 22023 payment_event_malformed`,
          ),
        );
        expect((await moneyRows(db, fx.A.tenant)).observations).toEqual([]);

        const text = '{"id":"evt_x","amount":1e2,"other":100.0}';
        expect(
          (await db.query("SELECT $1::jsonb::text AS t", [text])).rows[0].t,
        ).toBe('{"id": "evt_x", "other": 100.0, "amount": 100}');

        const ignored = await storeEvent(db, fx.A, {
          type: "charge.succeeded",
          payload: (p) => ({ ...p, data: { object: { object: "charge" } } }),
        });
        expect(await work(db, ignored.id)).toEqual({
          outcome: "ignored_type",
          attempt: 1,
          replayed: false,
          event_id: ignored.id,
          tenant_id: fx.A.tenant,
        });
        expect(await eventRow(db, ignored.id)).toMatchObject({
          processing_status: "processed",
          lease_expires_at: null,
          processing_outcome: { outcome: "ignored_type", attempt: 1 },
        });
        expect(await syncLease(db, fx.A)).toBeNull();
      }));

    it("D1: the function table of index section 3.5; anon and authenticated get 42501 on the wrapper and the entry; the entry called with another tenant is 42501; the wrapper on an event with no tenant answers unknown_anchor; the catalog gate passes", () =>
      inTx(db, async () => {
        await role(db, null);
        const table = (
          await db.query(
            `SELECT p.oid::regprocedure::text AS f, pg_get_userbyid(p.proowner) AS owner, p.prosecdef AS definer,
                    p.proconfig AS config,
                    (SELECT coalesce(string_agg(DISTINCT CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE a.grantee::regrole::text END, '+'), '-')
                       FROM aclexplode(p.proacl) AS a WHERE a.privilege_type = 'EXECUTE' AND a.grantee <> p.proowner) AS execute
               FROM pg_proc AS p
              WHERE p.oid = ANY($1::regprocedure[])
              ORDER BY 1`,
            [[...FUNCTIONS, ...TRIGGER_FUNCTIONS]],
          )
        ).rows;
        const sp = ['search_path=""'];
        const row = (
          f: string,
          owner: string,
          definer: boolean,
          execute: string,
        ) => ({
          f,
          owner,
          definer,
          config: sp,
          execute,
        });
        expect(table).toEqual([
          row(
            "apply_payment_outcome(uuid,integer)",
            "postgres",
            false,
            "service_role",
          ),
          row("private.donation_intake_lines_balance()", "postgres", true, "-"),
          row("private.donation_intake_lines_sealed()", "postgres", false, "-"),
          row("private.donations_line_status()", "postgres", false, "-"),
          row("private.payment_observations_sealed()", "postgres", false, "-"),
          row(
            "private.staged_gift_allocations_balance()",
            "postgres",
            true,
            "-",
          ),
          row(
            "private.staged_gift_allocations_generation()",
            "postgres",
            false,
            "-",
          ),
          row("private.staged_gifts_generation()", "postgres", false, "-"),
          row(
            "tenant_guard.apply_payment_outcome(uuid,uuid,integer)",
            "tenant_guard",
            true,
            "service_role",
          ),
          row(
            "tenant_guard.money_apply_payment_event(uuid)",
            "postgres",
            false,
            "tenant_guard",
          ),
          row(
            "tenant_guard.money_enqueue_payment_request(uuid)",
            "postgres",
            false,
            "tenant_guard",
          ),
        ]);
        const gate = runTenantRlsCatalogGate({ databaseUrl: ADMIN_URL });
        expect(gate.failures).toEqual([]);
        expect(gate.ok).toBe(true);

        const fx = await seedTwoTenants(db);
        const { intake, pi } = await paid(fx);
        const e = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        await claimEvent(db, e.id);
        const denied: string[] = [];
        for (const who of ["anon", "authenticated"])
          for (const [sql, params] of [
            ["SELECT public.apply_payment_outcome($1, 1)", [e.id]],
            [
              "SELECT tenant_guard.apply_payment_outcome($1, $2, 1)",
              [fx.A.tenant, e.id],
            ],
          ] as const) {
            await role(db, who);
            denied.push(`${who} ${(await attempt(db, sql, [...params])).code}`);
            await role(db, null);
          }
        expect(denied).toEqual([
          "anon 42501",
          "anon 42501",
          "authenticated 42501",
          "authenticated 42501",
        ]);
        await db.query(
          "SELECT pg_catalog.set_config('app.current_tenant_id', '', true)",
        );
        await role(db, "service_role");
        const crossed = await attempt(
          db,
          "SELECT tenant_guard.apply_payment_outcome($1, $2, 1)",
          [fx.B.tenant, e.id],
        );
        await role(db, null);
        expect(refusal(crossed)).toBe("42501 not_found");
        const tenantless = (
          await db.query(
            `INSERT INTO public.stripe_connect_events
               (stripe_event_id, event_type, livemode, event_created_at, payload_sha256, raw_payload, processing_status)
             VALUES ($1, 'payment_intent.succeeded', false, now(), $2, '{}'::jsonb, 'ignored') RETURNING id`,
            [
              `evt_${randomUUID().replaceAll("-", "")}`,
              createHash("sha256").update("{}").digest("hex"),
            ],
          )
        ).rows[0].id as string;
        for (const id of [tenantless, randomUUID()]) {
          await role(db, "service_role");
          expect(
            (
              await db.query(
                "SELECT public.apply_payment_outcome($1, 1) AS r",
                [id],
              )
            ).rows[0].r,
          ).toEqual({ outcome: "unknown_anchor", event_id: id });
          await role(db, null);
        }
        expect(await apply(db, e.id, 1)).toMatchObject({ outcome: "applied" });
        await enterAs(db, "tenant_guard", fx.B.tenant);
        expect(
          (
            await attempt(
              db,
              "SELECT tenant_guard.money_apply_payment_event($1)",
              [e.id],
            )
          ).code,
        ).toBe("42501");
        await role(db, null);
      }));

    it("D1 (static): M5's four functions and R2a's seven trigger functions name their columns (no * and no %ROWTYPE) and call no unqualified built-in", () =>
      inTx(db, async () => {
        await role(db, null);
        const defs = (
          await db.query(
            "SELECT p.oid::regprocedure::text AS f, pg_get_functiondef(p.oid) AS d FROM pg_proc AS p WHERE p.oid = ANY($1::regprocedure[]) ORDER BY 1",
            [[...FUNCTIONS, ...TRIGGER_FUNCTIONS]],
          )
        ).rows as { f: string; d: string }[];
        expect(defs).toHaveLength(11);
        const findings = defs.flatMap(({ f, d }) => {
          const body = d.replace(/'(?:[^']|'')*'/g, "''");
          return [
            ...(/(SELECT|RETURNING|,)\s+\*|\.\*|%ROWTYPE/i.test(body)
              ? [`${f}: * or %ROWTYPE`]
              : []),
            ...unqualifiedCalls(d).map((name) => `${f}: unqualified ${name}()`),
          ];
        });
        expect(findings).toEqual([]);
        expect(
          unqualifiedCalls(
            "AS $$ BEGIN PERFORM format('%s', 1); SELECT pg_catalog.count(*) FROM public.t (a, b); IF (x) THEN NULL; END IF; END $$",
          ),
        ).toEqual(["format"]);
      }));
  },
);
