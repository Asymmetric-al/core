/**
 * #2251 real-stack acceptance, spec r2 (issue comment 6392690952, approved by
 * Samson in 6392694469): criteria 1-4 and 6, plus the §5 In 1 catalog loop.
 * Runs against the migrated database named by TENANT_GUARD_IT_ADMIN_DATABASE_URL
 * (PG17 superuser, as in CI's `migrate` job); without it the block skips,
 * except in that job, where it fails (#2250 criterion 11). Every check runs in
 * its own transaction, which is rolled back; role switches emulate PostgREST.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  D,
  DEFINER_SCHEMAS,
  F,
  MIGRATION,
  RLS_OFF,
  S,
  exceptions,
  migrationBatch,
} from "./harness";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";
const BYPASS = (owner: string) =>
  `(select r.rolsuper or r.rolbypassrls from pg_roles r where r.oid = ${owner})`;
/** §3 scope: public base tables (relkind r/p) with a live tenant_id column. */
const TARGETS = `select c.relname t, c.relrowsecurity rls, c.relforcerowsecurity force,
    ${BYPASS("c.relowner")} bypass, (select count(*)::int from pg_policy p where p.polrelid = c.oid) policies
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p') and exists (select 1 from pg_attribute a
    where a.attrelid = c.oid and a.attname = 'tenant_id' and a.attnum > 0 and not a.attisdropped)
  order by 1`;
/** Criterion 3 fixture tables: F (donors, donations, funds), S (outbox, email_templates), D. */
const PARITY = [
  "donors",
  "donations",
  "funds",
  "donation_saga_outbox",
  "email_templates",
  "donor_merge_candidates",
];
type Target = {
  t: string;
  rls: boolean;
  force: boolean;
  bypass: boolean;
  policies: number;
};

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("#2251 tenant table RLS posture (R)", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const [TA, TB, U] = [randomUUID(), randomUUID(), randomUUID()];
  const [DA, DB] = [randomUUID(), randomUUID()];
  const CLAIMS_A = JSON.stringify({
    sub: U,
    role: "authenticated",
    app_metadata: { tenant_id: TA },
  });

  beforeAll(() => db.connect());
  afterAll(() => db.end());

  const q = async <T = Record<string, unknown>>(
    sql: string,
    args?: unknown[],
  ) => (await db.query(sql, args)).rows as T[];
  const targets = () => q<Target>(TARGETS);

  /** One check = one transaction, always rolled back; `seed` adds the two-tenant fixture. */
  async function tx(fn: () => Promise<void>, seed = false) {
    await db.query("begin");
    try {
      if (seed) await fixture();
      await fn();
    } finally {
      await db.query("rollback");
    }
  }
  async function fixture() {
    const sql = `insert into public.tenants (id, name, slug) values (:A, 'acc2251 A', 'acc2251-' || :A), (:B, 'acc2251 B', 'acc2251-' || :B);
      insert into auth.users (id) values (:U);
      insert into authz.memberships (user_id, tenant_id, role, staff_role, is_active) values (:U, :A, 'staff', 'finance', true);
      insert into public.donors (id, tenant_id) values (:DA, :A), (:DB, :B);
      insert into public.donations (tenant_id, donor_id) values (:A, :DA), (:B, :DB);
      insert into public.donation_saga_outbox (tenant_id, donation_id, donor_id, amount, idempotency_key)
        select tenant_id, id, donor_id, 100, 'acc2251-' || id from public.donations where tenant_id in (:A, :B);
      insert into public.donor_merge_candidates (tenant_id, existing_donor_id, confidence) values (:A, :DA, 'low'), (:B, :DB, 'low');
      insert into public.email_templates (tenant_id, name) values (:A, 'acc2251'), (:B, 'acc2251');
      insert into public.funds (tenant_id, name) values (:A, 'acc2251'), (:B, 'acc2251');`;
    const ids: Record<string, string> = { A: TA, B: TB, U, DA, DB };
    await db.query(
      sql.replace(/:(DA|DB|A|B|U)\b/g, (_m, k: string) => `'${ids[k]}'`),
    );
  }
  /** Run one statement as `role` with the given JWT claims (or none); nothing leaks. */
  async function as(
    role: string,
    claims: string | null,
    sql: string,
    args: unknown[] = [],
  ) {
    await db.query("savepoint q");
    try {
      await db.query(`set local role ${role}`);
      await db.query(
        "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', $2, true)",
        [claims ?? "", claims ? U : ""],
      );
      const r = await db.query(sql, args);
      return {
        rows: r.rows as Record<string, unknown>[],
        count: r.rowCount,
        code: null as string | null,
      };
    } catch (e) {
      return {
        rows: [],
        count: null,
        code: (e as { code?: string }).code ?? String(e),
      };
    } finally {
      await db.query("rollback to savepoint q");
    }
  }
  /** Re-run the migration file inside the current transaction; returns the error, if any. */
  async function rerun(): Promise<{ code?: string; message: string } | null> {
    expect(
      existsSync(MIGRATION),
      `${MIGRATION} must exist (spec §5 In 1)`,
    ).toBe(true);
    await db.query("savepoint m");
    try {
      await db.query(migrationBatch());
      await db.query("release savepoint m");
      return null;
    } catch (e) {
      await db.query("rollback to savepoint m");
      return e as { code?: string; message: string };
    }
  }
  const ownerless = () =>
    db.query(
      "create role it_owner nologin nobypassrls; grant usage on schema public to it_owner",
    );

  describe("criterion 1: catalog posture", () => {
    it("§3's 143 tables are all public tenant tables", () =>
      tx(async () => {
        const live = new Set((await targets()).map((x) => x.t));
        expect(
          [...Object.keys(S), ...D, ...F].filter((t) => !live.has(t)),
        ).toEqual([]);
      }));

    it("every public tenant table has ENABLE and FORCE row level security", () =>
      tx(async () => {
        const bad = (await targets()).filter((x) => !x.rls || !x.force);
        expect(bad.map((x) => `${x.t} rls=${x.rls} force=${x.force}`)).toEqual(
          [],
        );
      }));

    it("every public tenant table has >= 1 policy or an exception entry", () =>
      tx(async () => {
        const listed = new Set(exceptions().map((x) => x.table));
        const bad = (await targets()).filter(
          (x) => x.policies === 0 && !listed.has(x.t),
        );
        expect(bad.map((x) => x.t)).toEqual([]);
      }));

    it("no stale entry: each listed table is a public tenant table, ENABLE+FORCE, with 0 policies", () =>
      tx(async () => {
        const live = new Map((await targets()).map((x) => [x.t, x]));
        const e = exceptions();
        expect(e.length).toBeGreaterThanOrEqual(85);
        const bad = e
          .map((x) => [x.table, live.get(x.table)] as const)
          .filter(([, l]) => !l || !l.rls || !l.force || l.policies !== 0)
          .map(
            ([t, l]) =>
              `${t}: ${l ? `rls=${l.rls} force=${l.force} policies=${l.policies}` : "not a public tenant table"}`,
          );
        expect(bad).toEqual([]);
      }));
  });

  it("criterion 2: an owner without BYPASSRLS is bound by RLS on an F and a D table", () =>
    tx(async () => {
      await ownerless();
      for (const t of ["donors", "donor_merge_candidates"])
        await db.query(`alter table public.${t} owner to it_owner`);
      for (const t of ["donors", "donor_merge_candidates"]) {
        const sel = await as(
          "it_owner",
          null,
          `select count(*)::int n from public.${t}`,
        );
        expect(sel, `${t} select`).toMatchObject({
          code: null,
          rows: [{ n: 0 }],
        });
        const upd = await as(
          "it_owner",
          null,
          `update public.${t} set tenant_id = tenant_id`,
        );
        expect(upd, `${t} update`).toMatchObject({ code: null, count: 0 });
      }
      const ins = await as(
        "it_owner",
        null,
        "insert into public.donor_merge_candidates (tenant_id, existing_donor_id, confidence) values ($1, $2, 'low')",
        [TA, DA],
      );
      expect(ins.code, "D-table insert").toBe("42501");
    }, true));

  it("criterion 3: anon, authenticated (tenant A) and service_role see the same rows and errors as with FORCE off", () =>
    tx(async () => {
      const forced = (await targets()).filter(
        (x) => PARITY.includes(x.t) && x.rls && x.force,
      );
      expect(
        forced.map((x) => x.t).sort(),
        "fixture tables are ENABLE+FORCE",
      ).toEqual([...PARITY].sort());
      // Hosted default privileges give service_role SELECT on every public table; CI's plain DB does not.
      await db.query(
        `grant select on ${PARITY.map((t) => `public.${t}`).join(", ")} to service_role`,
      );
      const read = async () => {
        const out: Record<string, unknown> = {};
        for (const [role, claims] of [
          ["anon", null],
          ["authenticated", CLAIMS_A],
          ["service_role", null],
        ] as const)
          for (const t of PARITY) {
            const r = await as(
              role,
              claims,
              `select tenant_id::text tid from public.${t} where tenant_id = any($1::uuid[]) order by 1`,
              [[TA, TB]],
            );
            out[`${role} ${t}`] = r.code ?? r.rows.map((x) => x.tid);
          }
        return out;
      };
      const after = await read();
      expect(
        after["service_role donors"],
        "fixture is visible to service_role",
      ).toEqual([TA, TB].sort());
      expect(
        after["authenticated donors"],
        "tenant-A staff sees tenant A only",
      ).toEqual([TA]);
      for (const t of PARITY) {
        await db.query(`alter table public.${t} no force row level security`);
        if (RLS_OFF.includes(t))
          await db.query(`alter table public.${t} disable row level security`);
      }
      expect(after).toEqual(await read());
    }, true));

  describe("criterion 4: owner invariant and fail-closed precondition", () => {
    it("no tenant table and no app SECURITY DEFINER function has an owner without rolsuper/rolbypassrls", () =>
      tx(async () => {
        const tables = (await targets())
          .filter((x) => !x.bypass)
          .map((x) => x.t);
        const fns = await q<{
          f: string;
          owner: string;
          schema: string;
          bypass: boolean;
        }>(
          `select p.oid::regprocedure::text f, pg_get_userbyid(p.proowner) owner, n.nspname schema, ${BYPASS("p.proowner")} bypass
             from pg_proc p join pg_namespace n on n.oid = p.pronamespace where p.prosecdef`,
        );
        const bad = fns.filter(
          (x) => DEFINER_SCHEMAS.includes(x.schema) && !x.bypass,
        );
        expect({
          tables,
          functions: bad.map((x) => `${x.f} (${x.owner})`),
        }).toEqual({ tables: [], functions: [] });
        const exempt = fns.filter((x) => x.owner === "tenant_guard");
        console.info(
          `#2251 C4 exempt tenant_guard-owned DEFINER functions: ${exempt.map((x) => x.f).join(", ")}`,
        );
        expect(exempt.filter((x) => x.schema !== "tenant_guard")).toEqual([]);
      }));

    it("re-running the migration raises, naming the table, when a target table's owner lacks BYPASSRLS", () =>
      tx(async () => {
        await ownerless();
        await db.query(
          "alter table public.donor_merge_candidates owner to it_owner",
        );
        const err = await rerun();
        expect(err?.message ?? "applied without error").toContain(
          "donor_merge_candidates",
        );
      }));

    it("re-running the migration raises, naming the function, when an app DEFINER function's owner lacks BYPASSRLS", () =>
      tx(async () => {
        await ownerless();
        await db.query(
          "alter function public.handle_new_user() owner to it_owner",
        );
        const err = await rerun();
        expect(err?.message ?? "applied without error").toContain(
          "handle_new_user",
        );
      }));
  });

  it("criterion 6: re-running the migration succeeds and changes no RLS flag and no pg_policies row", () =>
    tx(async () => {
      const snap = async () => ({
        flags:
          await q(`select c.oid::regclass::text t, c.relrowsecurity, c.relforcerowsecurity from pg_class c
          join pg_namespace n on n.oid = c.relnamespace where n.nspname not in ('pg_catalog', 'information_schema') and c.relkind in ('r', 'p') order by 1`),
        policies: await q(
          "select schemaname, tablename, policyname, permissive, roles::text, cmd, qual, with_check from pg_policies order by 1, 2, 3",
        ),
      });
      const before = await snap();
      expect(await rerun()).toBeNull();
      expect(await snap()).toEqual(before);
    }));

  it("§5 In 1: the loop reads the catalog, so a new tenant table is forced and a non-tenant table is not", () =>
    tx(async () => {
      await db.query(
        "create table public.acc2251_probe (id int, tenant_id uuid); create table public.acc2251_plain (id int)",
      );
      expect(await rerun()).toBeNull();
      const r = await q<{ t: string; f: string }>(
        `select relname t, relrowsecurity || '/' || relforcerowsecurity f from pg_class
          where oid in ('public.acc2251_probe'::regclass, 'public.acc2251_plain'::regclass) order by 1`,
      );
      expect(r).toEqual([
        { t: "acc2251_plain", f: "false/false" },
        { t: "acc2251_probe", f: "true/true" },
      ]);
    }));
});
