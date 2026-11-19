/**
 * #2270 acceptance (R), Final spec r1 criteria 1-5 and 8, approved with all
 * defaults on 2026-10-24. Runs against the migrated database named by
 * TENANT_GUARD_IT_ADMIN_DATABASE_URL (#2250's migrate step); without it the
 * block skips, except in the CI `migrate` job, where it fails.
 * Every check runs in its own transaction, which is rolled back.
 * "Hosted simulation" (spec §4): in-transaction GRANT EXECUTE on the four
 * functions TO PUBLIC, anon, service_role and GRANT SELECT on the 3 CRM
 * tables TO anon, then the new migration's BEGIN..COMMIT body is re-executed,
 * as it would apply on a hosted database whose default privileges widened them.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 *
 * Amended by AL-2674 (WP1 slice 1.1a, plan 5.4; NR-13): the command role
 * tenant_guard is granted EXECUTE on the two authz membership helpers, which a
 * human command uses to judge membership. EXPECTED adds that one grantee to
 * those two rows; PUBLIC and anon stay excluded and every other set is the
 * spec's §1.2 set unchanged.
 */
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { CRM_TABLES, GRANTS, MIGRATION, POLICIES, read } from "./harness";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";
const FN = Object.keys(GRANTS);
/** §1.2 grantees plus tenant_guard on the two membership helpers (AL-2674). */
const EXPECTED: Record<string, string[]> = Object.fromEntries(
  Object.entries(GRANTS).map(([f, roles]) => [
    f,
    /^authz\.has_(staff_)?membership\(/.test(f)
      ? [...roles, "tenant_guard"].sort()
      : roles,
  ]),
);
const CUM = "public.current_user_memberships($1::uuid)";
const HELPERS = [
  "authz.is_super_admin()",
  "authz.has_membership($1::uuid)",
  "authz.has_staff_membership($1::uuid)",
];
/** Policy predicates as deparsed on develop; only the role list may change. */
const PRED =
  "(authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]))";
const LOG_INSERT =
  "(authz.is_super_admin() OR ((auth.uid() = actor_user_id) AND authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])))";
/** The predicate the second release of WP2b gives the standing policies (AL-2675). */
const PRED_NOW =
  "(( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.assignment_is('staff'::authz.membership_role) AS assignment_is)))";
void PRED;
void LOG_INSERT;

/**
 * Amended by AL-2675 (WP2b, second release; record D-18; activation review
 * Q7 and Q8): the write grants on crm_command_logs and crm_merge_candidates
 * are revoked, and their insert and update policies dropped with them, so an
 * accidental re-grant fails the catalog gate. Those three policies no longer
 * exist to be altered.
 */
const DROPPED_LATER = [
  "authz staff tenant insert crm_command_logs",
  "authz staff tenant insert crm_merge_candidates",
  "authz staff tenant update crm_merge_candidates",
];
/** The policies of POLICIES that stand on this chain. */
const STANDING = POLICIES.filter(
  ([t, c]) => !DROPPED_LATER.includes(`authz staff tenant ${c} ${t}`),
);

/**
 * The new migration's statements between BEGIN; and COMMIT;, less the
 * ALTER POLICY statements of the three policies a later migration dropped
 * (amended by AL-2675; every other statement runs as before).
 */
function migrationBody() {
  expect(existsSync(MIGRATION), `${MIGRATION} must exist (spec §6)`).toBe(true);
  const m = /^\s*BEGIN;\s*$([\s\S]*)^\s*COMMIT;\s*$/m.exec(read(MIGRATION));
  expect(m, "migration wraps its body in BEGIN; ... COMMIT;").not.toBeNull();
  return m![1]!
    .split("\n")
    .filter(
      (line) =>
        !DROPPED_LATER.some((p) => line.includes(`ALTER POLICY "${p}"`)),
    )
    .join("\n");
}

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("#2270 authz EXECUTE grants (R)", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const [TA, TB, U] = [randomUUID(), randomUUID(), randomUUID()];
  /** U's live staff row in TA (set by the fixture). */
  let staffRow = "";

  beforeAll(() => db.connect());
  afterAll(() => db.end());

  /** One check = one transaction, always rolled back. */
  async function tx(fn: () => Promise<void>) {
    await db.query("begin");
    try {
      await db.query(
        `insert into public.tenants (id, name, slug) values ($1, 'acc2270 A', 'acc2270-' || $1), ($2, 'acc2270 B', 'acc2270-' || $2);
         insert into auth.users (id) values ($3);
         insert into authz.memberships (user_id, tenant_id, role, staff_role, is_active) values
           ($3, $1, 'staff', 'member_care', true), ($3, $1, 'donor', null, true),
           ($3, $1, 'missionary', null, true), ($3, $1, 'staff', 'finance', false);
         insert into public.crm_command_logs (tenant_id, actor_user_id, action, resource_type, status)
           values ($1, $3, 'acc2270', 'acc2270', 'queued');`.replace(
          /\$(\d)/g,
          (_m, i: string) => `'${[TA, TB, U][Number(i) - 1]}'`,
        ),
      );
      staffRow = (
        await db.query(
          "select id from authz.memberships where user_id = $1 and tenant_id = $2 and role = 'staff' and is_active",
          [U, TA],
        )
      ).rows[0]!.id as string;
      await fn();
    } finally {
      await db.query("rollback");
    }
  }
  /**
   * Run one query as `role` (optionally with a JWT sub); the role never leaks.
   * Amended by AL-2675 (WP2b, second release; record D-18): the membership
   * helpers judge the one assignment the request names, so a signed-in
   * request names tenant TA and U's live staff row there, as the Data API
   * carries them. U holds three live rows in TA, so with no assignment named
   * U would hold no assignment at all (plan 5.1).
   */
  async function as(
    role: string,
    sub: string | null,
    sql: string,
    args = [TA],
  ) {
    await db.query("savepoint q");
    try {
      await db.query(`set local role ${role}`);
      await db.query(
        "select set_config('request.jwt.claim.sub', $1, true), set_config('request.headers', $2, true)",
        [
          sub ?? "",
          role === "authenticated" && sub
            ? JSON.stringify({
                "x-asym-tenant": TA,
                "x-asym-assignment": staffRow,
              })
            : "",
        ],
      );
      const r = await db.query(sql, sql.includes("$1") ? args : []);
      return { rows: r.rows as Record<string, unknown>[], code: null };
    } catch (e) {
      return { rows: [], code: (e as { code?: string }).code ?? String(e) };
    } finally {
      await db.query("rollback to savepoint q");
    }
  }
  async function hosted(reapply = true) {
    const body = reapply ? migrationBody() : "";
    for (const f of FN)
      await db.query(
        `grant execute on function ${f.startsWith("authz.") ? f : `public.${f}`} to public, anon, service_role`,
      );
    for (const t of CRM_TABLES)
      await db.query(`grant select on public.${t} to anon`);
    if (reapply) await db.query(body);
  }
  async function acl() {
    const r = await db.query(
      `select p.oid::regprocedure::text fn, p.prosecdef, p.proowner::regrole::text owner,
         array(select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
               from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
               where a.privilege_type = 'EXECUTE' order by 1) grantees
       from pg_proc p where p.oid = any($1::regprocedure[])`,
      [FN.map((f) => (f.startsWith("authz.") ? f : `public.${f}`))],
    );
    return Object.fromEntries(
      r.rows.map((x: Record<string, unknown>) => [x.fn, x]),
    ) as Record<
      string,
      { prosecdef: boolean; owner: string; grantees: string[] }
    >;
  }
  async function expectExact() {
    const got = await acl();
    expect(Object.keys(got).sort()).toEqual([...FN].sort());
    for (const f of FN) {
      expect(got[f]!.grantees, `${f} EXECUTE grantees`).toEqual(EXPECTED[f]);
      expect(got[f]!.prosecdef, `${f} stays SECURITY DEFINER`).toBe(true);
      expect(got[f]!.owner).toBe("postgres");
    }
  }

  it("C1: on the migrated database each §1.2 function has exactly the listed grantees (no PUBLIC, no anon)", () =>
    tx(expectExact));

  it("C1/OQ4: the INVOKER helpers authz.current_user_id/current_tenant_id keep PUBLIC EXECUTE", () =>
    tx(async () => {
      const r = await db.query(
        `select p.proname, p.prosecdef, exists (select 1 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
           where a.grantee = 0 and a.privilege_type = 'EXECUTE') pub
         from pg_proc p where p.pronamespace = 'authz'::regnamespace and p.proname in ('current_user_id', 'current_tenant_id') order by 1`,
      );
      expect(r.rows).toEqual([
        { proname: "current_tenant_id", prosecdef: false, pub: true },
        { proname: "current_user_id", prosecdef: false, pub: true },
      ]);
    }));

  it("C2: hosted simulation, then the migration body twice: exact §1.2 sets, no error", () =>
    tx(async () => {
      await hosted(false);
      expect((await acl())["authz.is_super_admin()"]!.grantees).toContain(
        "anon",
      );
      await db.query(migrationBody());
      await expectExact();
      await db.query(migrationBody());
      await expectExact();
    }));

  for (const sim of [false, true])
    it(`C3: ${sim ? "hosted simulation" : "plain DB"}: anon (with and without sub) and service_role get 42501 on current_user_memberships`, () =>
      tx(async () => {
        if (sim) await hosted();
        for (const [role, sub] of [
          ["anon", null],
          ["anon", U],
          ["service_role", null],
          ["service_role", U],
        ] as const)
          expect(
            (await as(role, sub, `select * from ${CUM}`)).code,
            `${role} sub=${sub ?? "none"}`,
          ).toBe("42501");
      }));

  it("C4: hosted simulation + GRANT USAGE ON SCHEMA authz TO anon: each DEFINER helper raises 42501 for anon", () =>
    tx(async () => {
      await hosted();
      await db.query("grant usage on schema authz to anon");
      for (const sub of [null, U])
        for (const h of HELPERS)
          expect((await as("anon", sub, `select ${h}`)).code, `anon ${h}`).toBe(
            "42501",
          );
    }));

  for (const sim of [false, true])
    it(`C5: ${sim ? "hosted simulation" : "plain DB"}: an authenticated staff member keeps their memberships and CRM reads`, () =>
      tx(async () => {
        if (sim) await hosted();
        const own = await as(
          "authenticated",
          U,
          `select role, staff_role from ${CUM} order by role, staff_role`,
        );
        expect(own).toEqual({
          code: null,
          rows: [
            { role: "donor", staff_role: null },
            { role: "missionary", staff_role: null },
            { role: "staff", staff_role: "member_care" },
          ],
        });
        expect(
          await as("authenticated", U, `select * from ${CUM}`, [TB]),
        ).toEqual({ code: null, rows: [] });
        for (const h of HELPERS.slice(1))
          expect(await as("authenticated", U, `select ${h} ok`)).toEqual({
            code: null,
            rows: [{ ok: true }],
          });
        expect(
          await as("authenticated", U, "select authz.is_super_admin() ok"),
        ).toEqual({ code: null, rows: [{ ok: false }] });
        for (const t of CRM_TABLES)
          expect(
            await as(
              "authenticated",
              U,
              `select count(*)::int n from public.${t} where tenant_id = $1`,
            ),
            t,
          ).toEqual({
            code: null,
            rows: [{ n: t === "crm_command_logs" ? 1 : 0 }],
          });
      }));

  it("C8: hosted simulation: anon counts 0 rows on the 3 CRM tables without error", () =>
    tx(async () => {
      await hosted();
      for (const sub of [null, U])
        for (const t of CRM_TABLES)
          expect(
            await as("anon", sub, `select count(*)::int n from public.${t}`),
            `anon ${t}`,
          ).toEqual({ code: null, rows: [{ n: 0 }] });
    }));

  // Amended by AL-2675 (WP2b, second release; record D-18): the five
  // policies that stand are TO authenticated with the predicates of this
  // chain, the tenant condition and the staff class of the request's one
  // assignment beside the super-admin branch; the three write policies whose
  // grants went are gone, and so are those grants (activation review Q7, Q8).
  it("C8: the standing policies are TO authenticated with this chain's predicates; the dropped ones are gone with their grants", () =>
    tx(async () => {
      const gone = await db.query(
        "select policyname from pg_policies where schemaname = 'public' and policyname = any($1)",
        [DROPPED_LATER],
      );
      expect(gone.rows).toEqual([]);
      for (const [t, privilege] of [
        ["crm_command_logs", "INSERT"],
        ["crm_merge_candidates", "INSERT"],
        ["crm_merge_candidates", "UPDATE"],
      ])
        expect(
          (
            await db.query(
              "select has_table_privilege('authenticated', $1, $2) ok",
              [`public.${t}`, privilege],
            )
          ).rows[0].ok,
          `${t} ${privilege}`,
        ).toBe(false);
      for (const [t, c] of STANDING) {
        const p = await db.query(
          `select cmd, roles::text[] roles, permissive, qual, with_check from pg_policies
           where schemaname = 'public' and tablename = $1 and policyname = $2`,
          [t, `authz staff tenant ${c} ${t}`],
        );
        const insert = c === "insert";
        expect(p.rows, `${c} ${t}`).toEqual([
          {
            cmd: c.toUpperCase(),
            roles: ["authenticated"],
            permissive: "PERMISSIVE",
            qual: insert ? null : PRED_NOW,
            with_check: c === "select" ? null : PRED_NOW,
          },
        ]);
      }
    }));
});
