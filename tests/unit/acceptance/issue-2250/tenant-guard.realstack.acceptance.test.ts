/**
 * #2250 real-stack acceptance (spec r1 = issue comment 6384739115 + conditions
 * 6384790093): criteria 1-5, 7-9, 11, 14-17. Runs in CI `migrate` step "Verify
 * tenant isolation (real stack)" against the migrated PG17 superuser URL; calls
 * emulate PostgREST (BEGIN; SET LOCAL ROLE ...). Skips locally without the URL.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 *
 * Amended by AL-2674 (WP1 slice 1.1a, plan 5.4; NR-13): the command schema
 * gains its first human entry point (tenant_guard.resolve_command_assignment,
 * EXECUTE for authenticated) and three postgres-owned invoker helpers that only
 * tenant_guard may execute (caller_id, request_assignment_id,
 * begin_human_command), and the guard role gains USAGE on auth and authz,
 * EXECUTE on auth.uid(), auth.jwt() and the two authz membership helpers, and
 * SELECT on authz.memberships behind a select-own policy. Criteria 4, 14, 15
 * and 17 below pin the widened inventory; everything else is unchanged.
 *
 * Amended by AL-2674 council round 2 (A4; plan 7.1): criteria 4, 14, 15 and
 * 17 pinned the command schema's functions and the guard's table grants as
 * exact lists, so the first command of a later package failed them. Each is
 * now asserted by lane, for every function the schema holds and every public
 * wrapper into it: a guard-owned function is a SECURITY DEFINER with an empty
 * search path executable by exactly one lane (authenticated or service_role);
 * a postgres-owned helper is an invoker only tenant_guard may execute; a
 * wrapper is a postgres-owned invoker granted to its target's lane. The
 * guard's table privileges are each admitted by a policy for tenant_guard and
 * are never TRUNCATE, REFERENCES, TRIGGER or MAINTAIN. #2250's own four
 * functions keep their exact rows, and what the guard may use or execute
 * outside its tables keeps its exact list: that list is the point of
 * criterion 17, and a package that widens it edits it (see "Tests a package
 * still touches" in docs/security/tenant-guard.md).
 *
 * Amended by AL-2674 A9 (plan 15.2): on Supabase's own image the migration
 * role cannot grant anything on `auth`, so the guard holds nothing there. It
 * reads the caller and the claims from the request's settings through two
 * more invoker helpers, caller_id and request_claims; criterion 17 drops USAGE
 * on auth and EXECUTE on auth.uid() and auth.jwt() and gains request_claims().
 *
 * Amended by AL-2675 (WP2a, plan 5.4 "How a command runs"), joined to the
 * list above: the guard role may execute the SQL capability function
 * authz.assignment_capabilities(uuid), which begin_human_command calls, and
 * begin_human_command takes the capability a command requires as a defaulted
 * second argument, so its signature is (uuid, text). Criterion 17 lists both.
 *
 * Amended by AL-2675 (WP2c, part 1; plan 5.4; record D-18), joined to the
 * list above: the role-change and revoke commands refuse a platform
 * operator's row. After WP2b release 2, only private.is_platform_operator
 * needs an EXECUTE grant; the guard need not inspect any other tenant.
 * Criterion 17 lists the schema usage and that function. The
 * commands' table privileges (memberships and audit_logs, each behind a
 * tenant_guard_isolation policy) are covered by the policy rule above it.
 *
 * D-18 (AL-2676, WP3a part 1): the guard also gains EXECUTE on
 * authz.caller_tenant_ids(), for active-tenant admission before entry;
 * criterion 17 lists it.
 *
 * D-18 (AL-2681, WP8a part 1, ruling W8-R32): the guard gains EXECUTE on
 * private.share_lock_tenant(uuid), which takes the tenant row FOR SHARE so a
 * command re-checks its authority under that lock; the guard still holds no
 * SELECT on public.tenants. Criterion 17 lists it.
 */
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { callsIntoCommandSchemas } from "../../../../scripts/verify/tenant-rls-catalog.mjs";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";
/** SQL builders; arguments are SQL literals (fixture UUIDs are interpolated as '<uuid>'). */
const enter = (t: string) => `select tenant_guard.enter(${t}::uuid)`;
const acq = (t: string, s: string) =>
  `select public.acquire_workflow_work_claim(p_tenant_id => ${t}, p_subject_type => 'acc2250', p_subject_id => '${s}', p_claimed_by => 'acc', p_ttl_seconds => 60) r`;
const rel = (t: string, id: string) =>
  `select public.release_workflow_work_claim(p_tenant_id => ${t}, p_claim_id => '${id}', p_status => 'released') r`;
const ins = (t: string, s: string) =>
  `insert into public.workflow_work_claims (tenant_id, subject_type, subject_id, claimed_by, expires_at) values (${t}, 'acc2250', '${s}', 'acc', pg_catalog.now() + interval '1 hour')`;
const CLAIMS = "public.workflow_work_claims";
/**
 * The candidates for criteria 14/15: every function in tenant_guard and every
 * public function whose text mentions it (no overloads allowed). Which public
 * ones are wrappers is decided on their text with comments removed
 * (`isGuardFunction`): amended by council round 3 (lens 1 A4; record D-18),
 * because a raw-text match made a public function whose comment names
 * `tenant_guard.x(` fail this suite for no safety reason. The candidate set is
 * wider than before, so a call with a comment inside its qualified name is
 * still found.
 */
const FN = `select n.nspname || '.' || p.proname f, p.*, p.prosrc || coalesce(pg_get_function_sqlbody(p.oid), '') body
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'tenant_guard'
     or (n.nspname = 'public' and (p.prosrc || coalesce(pg_get_function_sqlbody(p.oid), '')) ~ 'tenant_guard')`;
/** A function of criteria 14/15: in tenant_guard, or a public function whose code calls into it. */
const isGuardFunction = (fn: { f: string; body: string }) =>
  fn.f.startsWith("tenant_guard.") ||
  callsIntoCommandSchemas(fn.body).some((t: string) =>
    t.startsWith("tenant_guard."),
  );
const SP_OK = `(proconfig && array['search_path=""', 'search_path=pg_catalog', 'search_path=pg_catalog, public'])`;
const TG_ACQ = "tenant_guard.acquire_workflow_work_claim";
const TG_REL = "tenant_guard.release_workflow_work_claim";
const TG = "'tenant_guard'::regrole";
/** #2250's own functions: the claim pair and its public wrappers. */
const CLAIM_FNS = `'${TG_ACQ}', '${TG_REL}', 'public.acquire_workflow_work_claim', 'public.release_workflow_work_claim'`;
/** EXECUTE grantees besides the owner, or '-' for none. */
const GRANTEES = `(select coalesce(string_agg(distinct case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end, '+'), '-')
   from aclexplode(proacl) a where a.privilege_type = 'EXECUTE' and a.grantee <> proowner)`;

/**
 * Catalog checks, one block each: "title" line, SQL returning one column `v`,
 * then "=> expected v". Blocks are separated by a blank line.
 */
const CATALOG = `
4: tenant_guard is NOLOGIN NOSUPERUSER NOBYPASSRLS NOCREATEROLE NOCREATEDB NOINHERIT
select concat_ws(',', rolcanlogin, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolinherit) v from pg_roles where rolname = 'tenant_guard'
=> f,f,f,f,f,f

4: tenant_guard owns no relation, owns only SECURITY DEFINER functions in its own schema, and owns the claim pair
select (select count(*) from pg_class where relowner = ${TG})
  || ' ' || (select count(*) from pg_proc where proowner = ${TG} and (pronamespace <> 'tenant_guard'::regnamespace or not prosecdef))
  || ' ' || (select string_agg(oid::regproc::text, ',' order by oid::regproc::text) from pg_proc where proowner = ${TG} and oid::regproc::text in ('${TG_ACQ}', '${TG_REL}')) v
=> 0 0 ${TG_ACQ},${TG_REL}

4: tenant_guard has CREATE on no schema
select coalesce(string_agg(nspname, ','), 'none') v from pg_namespace where has_schema_privilege('tenant_guard', oid, 'CREATE')
=> none

4/17: the only member is postgres (WITH INHERIT FALSE, SET TRUE); tenant_guard is a member of no role
select (select string_agg(distinct member::regrole || ' inherit=' || inherit_option || ' set=' || set_option, ',') from pg_auth_members where roleid = ${TG})
  || ' memberships=' || (select count(*) from pg_auth_members where member = ${TG}) v
=> postgres inherit=false set=true memberships=0

4: policy tenant_guard_isolation is FOR ALL TO {tenant_guard} keyed on tenant_guard.current_tenant_id()
select concat_ws(' | ', polcmd, polroles::regrole[]::text, pg_get_expr(polqual, polrelid), pg_get_expr(polwithcheck, polrelid)) v
  from pg_policy where polrelid = 'public.workflow_work_claims'::regclass and polname = 'tenant_guard_isolation'
=> * | {tenant_guard} | (tenant_id = tenant_guard.current_tenant_id()) | (tenant_id = tenant_guard.current_tenant_id())

17: every relation or column privilege of tenant_guard is SELECT, INSERT, UPDATE or DELETE on a table whose row security admits the guard for that command; the claims grants are among them
select (select count(*) from (
    select c.oid, c.relkind, c.relrowsecurity, a.privilege_type, a.grantee from pg_class c, aclexplode(c.relacl) a where a.grantee = ${TG}
    union all select c.oid, c.relkind, c.relrowsecurity, a.privilege_type, a.grantee from pg_attribute t join pg_class c on c.oid = t.attrelid, aclexplode(t.attacl) a where a.grantee = ${TG}) g
  where g.relkind not in ('r', 'p') or not g.relrowsecurity or g.privilege_type not in ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
     or not exists (select 1 from pg_policy p where p.polrelid = g.oid and p.polroles @> array[g.grantee]
                      and p.polcmd in ('*', case g.privilege_type when 'SELECT' then 'r' when 'INSERT' then 'a' when 'UPDATE' then 'w' when 'DELETE' then 'd' end::"char")))
  || ' ' || (select string_agg(a.privilege_type, ',' order by a.privilege_type) from aclexplode((select relacl from pg_class where oid = '${CLAIMS}'::regclass)) a where a.grantee = ${TG}) v
=> 0 INSERT,SELECT,UPDATE

17: everything else granted to tenant_guard (schemas, functions it does not own, databases) equals the inventory
select string_agg(e, ', ' order by e) v from (
  select 'schema ' || nspname || ' ' || a.privilege_type e from pg_namespace, aclexplode(nspacl) a where a.grantee = ${TG}
  union all select p.oid::regprocedure || ' ' || a.privilege_type from pg_proc p, aclexplode(p.proacl) a where a.grantee = ${TG} and p.proowner <> a.grantee
  union all select 'database ' || datname from pg_database, aclexplode(datacl) a where a.grantee = ${TG}) s
=> authz.assignment_capabilities(uuid) EXECUTE, authz.caller_tenant_ids() EXECUTE, authz.has_membership(uuid,authz.membership_role[]) EXECUTE, authz.has_staff_membership(uuid,authz.staff_role[]) EXECUTE, authz.request_tenant_id() EXECUTE, private.caller_profile_id() EXECUTE, private.is_platform_operator(uuid) EXECUTE, private.profile_display_name(uuid) EXECUTE, private.share_lock_tenant(uuid) EXECUTE, schema authz USAGE, schema private USAGE, schema public USAGE, schema tenant_guard USAGE, tenant_guard.begin_human_command(uuid,text) EXECUTE, tenant_guard.caller_id() EXECUTE, tenant_guard.current_tenant_id() EXECUTE, tenant_guard.enter(uuid) EXECUTE, tenant_guard.request_assignment_id() EXECUTE, tenant_guard.request_claims() EXECUTE

17: no DELETE/TRUNCATE on claims; no SELECT on tenants, profiles, donation_saga_outbox, on the table or on any column
select concat_ws(',', has_table_privilege('tenant_guard', 'public.workflow_work_claims', 'DELETE'), has_table_privilege('tenant_guard', 'public.workflow_work_claims', 'TRUNCATE'),
  has_table_privilege('tenant_guard', 'public.tenants', 'SELECT'), has_table_privilege('tenant_guard', 'public.profiles', 'SELECT'), has_table_privilege('tenant_guard', 'public.donation_saga_outbox', 'SELECT'),
  has_any_column_privilege('tenant_guard', 'public.tenants', 'SELECT'), has_any_column_privilege('tenant_guard', 'public.profiles', 'SELECT'), has_any_column_privilege('tenant_guard', 'public.donation_saga_outbox', 'SELECT')) v
=> f,f,f,f,f,f,f,f

15: old release(uuid, text) is gone; release(uuid, uuid, text) and acquire return jsonb
select concat_ws(' ', coalesce(to_regprocedure('public.release_workflow_work_claim(uuid,text)')::text, 'gone'),
  pg_get_function_result(to_regprocedure('public.release_workflow_work_claim(uuid,uuid,text)')),
  pg_get_function_result(to_regprocedure('public.acquire_workflow_work_claim(uuid,text,text,text,integer)'))) v
=> gone jsonb jsonb

14: every tenant_guard-owned function is SECURITY DEFINER with SET search_path = '' (or pg_catalog[, public]), the claim pair among them
select (select count(*) from pg_proc where proowner = ${TG} and not (prosecdef and coalesce(${SP_OK}, false)))
  || ' ' || (select string_agg(oid::regproc || ' ' || ${SP_OK}, ', ' order by oid::regproc::text) from pg_proc where proowner = ${TG} and prosecdef and oid::regproc::text in ('${TG_ACQ}', '${TG_REL}')) v
=> 0 ${TG_ACQ} true, ${TG_REL} true

14/15: #2250's four functions: owner, DEFINER, search_path pinned, explicit ACL (not NULL), exact EXECUTE grantees besides the owner
select string_agg(concat_ws(' ', f, pg_get_userbyid(proowner), prosecdef, coalesce(${SP_OK}, false), proacl is not null, ${GRANTEES}), ', ' order by f) v
  from (${FN}) x where f in (${CLAIM_FNS})
=> public.acquire_workflow_work_claim postgres f t t service_role, public.release_workflow_work_claim postgres f t t service_role, ${TG_ACQ} tenant_guard t t t service_role, ${TG_REL} tenant_guard t t t service_role
`
  .trim()
  .split("\n\n")
  .map((block) => {
    const lines = block.split("\n");
    return [lines[0]!, lines.slice(1, -1).join("\n"), lines.at(-1)!.slice(3)];
  });

/** Bare (unqualified) targets after FROM|JOIN|INTO|UPDATE|TABLE, ignoring declared variables (criterion 14 lint). */
function bareTargets(src: string, args: string[]): string[] {
  const body = src.replace(/--[^\n]*/g, "").replace(/'(?:[^']|'')*'/g, "''");
  const decl = /\bdeclare\b([\s\S]*?)\bbegin\b/i.exec(body)?.[1] ?? "";
  const ok = new Set([..."set skip nowait strict of only".split(" "), ...args]);
  for (const m of decl.matchAll(/(\w+)\s+[^;]+;/g)) ok.add(m[1]!.toLowerCase());
  return [
    ...body.matchAll(
      /(?<!\bdistinct\s+)\b(?:from|join|into|update|table)\s+([a-z_][\w$.]*)/gi,
    ),
  ]
    .map((m) => m[1]!)
    .filter((t) => !t.includes(".") && !ok.has(t.toLowerCase()));
}

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "11: the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("#2250 tenant_guard on the real stack", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const [A, B] = [randomUUID(), randomUUID()];
  const [a, b] = [`'${A}'`, `'${B}'`];
  const ids: Record<string, string> = {};
  const v = async (sql: string) => (await db.query(sql)).rows[0]?.v;
  const snapshot = () =>
    v(
      `select count(*) || string_agg(row_to_json(c)::text, ',' order by id) v from ${CLAIMS} c where tenant_id in (${a}, ${b})`,
    );
  const status = (id: string, col = "status") =>
    v(`select ${col}::text v from ${CLAIMS} where id = '${id}'`);

  /**
   * One PostgREST-style transaction as `role`, one statement per script line.
   * `done` counts the statements that succeeded; `last` is the last result's first row.
   */
  async function tx(role: string, script: string, end = "commit") {
    const res: pg.QueryResult[] = [];
    const out = (err = "", code = "") => {
      const [n, last] = [res.at(-1)?.rowCount, res.at(-1)?.rows[0]];
      return { err, code, done: res.length, n, last };
    };
    try {
      await db.query(`begin; set local role ${role}`);
      for (const sql of script.trim().split("\n"))
        res.push(await db.query(sql));
      await db.query(end);
      return out();
    } catch (e) {
      await db.query("rollback");
      return out((e as Error).message, (e as { code: string }).code);
    }
  }
  const tg = (script: string, end?: string) => tx("tenant_guard", script, end);
  /** A wrapper call as service_role: "err|<jsonb key values...>". */
  async function rpc(sql: string, ...keys: string[]) {
    const r = await tx("service_role", sql);
    return [r.err, ...keys.map((k) => r.last?.r?.[k])].join("|");
  }

  beforeAll(async () => {
    await db.connect();
    await db.query("set search_path = ''");
    await db.query(
      `insert into public.tenants (id, name, slug) values (${a}, 'acc2250 A', 'acc2250-${A}'), (${b}, 'acc2250 B', 'acc2250-${B}')`,
    );
    ids.a = await v(`${ins(a, "seed")} returning id::text v`);
    ids.b = await v(`${ins(b, "seed")} returning id::text v`);
  });
  afterAll(async () => {
    await db.query("rollback");
    await db.query(
      `delete from public.workflow_work_claims where tenant_id in (${a}, ${b})`,
    );
    await db.query(`delete from public.tenants where id in (${a}, ${b})`);
    await db.end();
  });

  it.each(CATALOG)("%s", async (_title, sql, want) =>
    expect(await v(sql)).toBe(want),
  );

  /**
   * Each function of criteria 14/15 that does not keep the invariants of its
   * lane, as "name: shape", and the names checked.
   */
  async function laneProblems() {
    const fns = (
      (
        await db.query(
          `select f, pg_get_userbyid(proowner) owner, prosecdef definer, coalesce(${SP_OK}, false) sp,
                  proacl is not null acl, ${GRANTEES} grantees, body
             from (${FN}) x order by f`,
        )
      ).rows as {
        f: string;
        owner: string;
        definer: boolean;
        sp: boolean;
        acl: boolean;
        grantees: string;
        body: string;
      }[]
    ).filter(isGuardFunction);
    const lane = new Map(fns.map((fn) => [fn.f, fn.grantees]));
    const shape = (fn: (typeof fns)[number]) =>
      `${fn.owner} ${fn.definer ? "definer" : "invoker"} sp=${fn.sp} acl=${fn.acl} ${fn.grantees}`;
    const problems: string[] = [];
    for (const fn of fns) {
      let expected: string[];
      if (fn.f.startsWith("tenant_guard.") && fn.owner === "tenant_guard")
        // An entry point: one lane, never both, never PUBLIC or anon.
        expected = ["authenticated", "service_role"].map(
          (g) => `tenant_guard definer sp=true acl=true ${g}`,
        );
      else if (fn.f.startsWith("tenant_guard."))
        // A helper: only the guard runs it.
        expected = ["postgres invoker sp=true acl=true tenant_guard"];
      else {
        // A wrapper: the lane of what it calls in tenant_guard, read from
        // its code with comments removed.
        const targets = callsIntoCommandSchemas(fn.body).filter((t: string) =>
          t.startsWith("tenant_guard."),
        );
        const human = targets.every(
          (t: string) => lane.get(t) === "authenticated",
        );
        expected = [
          `postgres invoker sp=true acl=true ${human ? "authenticated" : "service_role"}`,
        ];
      }
      if (!expected.includes(shape(fn))) problems.push(`${fn.f}: ${shape(fn)}`);
    }
    return { problems, names: fns.map((fn) => fn.f) };
  }

  it("14/15: every function in tenant_guard, and every public wrapper into it, keeps the invariants of its lane", async () => {
    const { problems, names } = await laneProblems();
    expect(problems).toEqual([]);
    // The derivation is not vacuous: #2250's four functions are among them.
    expect(names).toEqual(
      expect.arrayContaining(CLAIM_FNS.replaceAll("'", "").split(", ")),
    );
  });

  // Council round 3, lens 1 A4: the suite matches code, not comments.
  it("14/15: a public function whose comment names a guard function is not a wrapper; one that calls it still is", async () => {
    await db.query("begin");
    try {
      await db.query(
        `create function public.acc2250_comment_only() returns int language plpgsql set search_path = ''
           as $$ begin -- tenant_guard.acquire_workflow_work_claim(...) is not called here
           return 1; end $$;
         create function public.acc2250_definer_call(p_tenant_id uuid) returns jsonb language sql security definer set search_path = ''
           as $$ select tenant_guard/**/.acquire_workflow_work_claim(p_tenant_id, 'x', 'y', 'z', 60) $$;
         revoke all on function public.acc2250_definer_call(uuid) from public, anon, authenticated, service_role;
         grant execute on function public.acc2250_definer_call(uuid) to authenticated;`,
      );
      const { problems, names } = await laneProblems();
      expect(names).not.toContain("public.acc2250_comment_only");
      expect(problems).toEqual([
        "public.acc2250_definer_call: postgres definer sp=true acl=true authenticated",
      ]);
      const bodies = await schemaQualifiedProblems();
      expect(bodies.names).not.toContain("public.acc2250_comment_only");
      expect(bodies.names).toContain("public.acc2250_definer_call");
    } finally {
      await db.query("rollback");
    }
  });

  /** The functions of criteria 14/15 whose bodies are not schema-qualified. */
  async function schemaQualifiedProblems() {
    const fns = (
      await db.query(
        `select f, prosrc, body, coalesce(proargnames, '{}') a from (${FN}) x`,
      )
    ).rows.filter(isGuardFunction);
    const problems: string[] = [];
    for (const f of fns) {
      for (const target of bareTargets(f.prosrc, f.a))
        problems.push(`${f.f}: bare ${target}`);
      if (
        /(?<![\w.])(enter|current_tenant_id|set_config|current_setting)\s*\(/i.test(
          f.prosrc,
        )
      )
        problems.push(`${f.f}: unqualified guard helper or setting`);
    }
    return { problems, names: fns.map((f) => f.f as string) };
  }

  it("14: function bodies are schema-qualified under the empty search_path", async () => {
    const { problems, names } = await schemaQualifiedProblems();
    expect(problems).toEqual([]);
    expect(names).toEqual(
      expect.arrayContaining(CLAIM_FNS.replaceAll("'", "").split(", ")),
    );
  });

  it("1: after enter(A) an unfiltered read sees only A; with the GUC unset it sees 0 rows", async () => {
    const r = await tg(`${enter(a)}
      select string_agg(distinct tenant_id::text, ',') || bool_or(id = '${ids.a}') v from ${CLAIMS}`);
    expect(r.err + r.last?.v).toBe(`${A}true`);
    const u = await tg(`select count(*) v from ${CLAIMS}`);
    expect(u.err + u.last?.v).toBe("0");
  });

  it("16(i): GUC '' makes current_tenant_id() NULL and the guard query return 0 rows", async () => {
    const r =
      await tg(`select pg_catalog.set_config('app.current_tenant_id', '', true)
      select coalesce(tenant_guard.current_tenant_id()::text, 'null') || (select count(*) from ${CLAIMS}) v`);
    expect(r.err + r.last?.v).toBe("null0");
  });

  it("2: inside enter(A) a tenant B INSERT fails 42501 and a B UPDATE hits 0 rows; B is byte-identical", async () => {
    const before = await snapshot();
    const i = await tg(`${enter(a)}\n${ins(b, "cross")}`);
    expect(`${i.done} ${i.code}`).toBe("1 42501");
    const u = await tg(`${enter(a)}
      update ${CLAIMS} set claimed_by = 'hijack' where id = '${ids.b}'`);
    expect(u.err + u.n).toBe("0");
    expect(await snapshot()).toBe(before);
  });

  it("7: a guarded write followed by RAISE leaves no row", async () => {
    const r = await tg(
      `do $$ begin perform tenant_guard.enter(${a}); ${ins(a, "atomic")}; raise exception 'acc2250-atomic'; end $$`,
    );
    expect(r.err).toContain("acc2250-atomic");
    expect(await snapshot()).not.toContain('"atomic"');
  });

  it("9: a JWT carrying tenant B does not widen enter(A); authenticated with the GUC = B still reads 0 claims", async () => {
    const jwt = JSON.stringify({ app_metadata: { tenant_id: B } });
    const r =
      await tg(`select pg_catalog.set_config('request.jwt.claims', '${jwt}', true)
      ${enter(a)}
      select string_agg(distinct tenant_id::text, ',') v from ${CLAIMS}`);
    expect(r.err + r.last?.v).toBe(A);
    const u = await tx(
      "authenticated",
      `select pg_catalog.set_config('app.current_tenant_id', ${b}, true)
      select count(*)::int v from ${CLAIMS}`,
    );
    expect(u.code === "42501" || u.last?.v === 0).toBe(true);
  });

  it("3: acquire(A) creates an A claim and echoes tenant_id = A", async () => {
    const r = await tx("service_role", acq(a, "acq"));
    expect(`${r.err}|${r.last?.r?.acquired}|${r.last?.r?.tenant_id}`).toBe(
      `|true|${A}`,
    );
    expect(await status(r.last?.r?.claim_id, "tenant_id")).toBe(A);
  });

  it("3: release(A, B's claim) returns released false and B stays active", async () => {
    expect(await rpc(rel(a, ids.b!), "released")).toBe("|false");
    expect(await status(ids.b!)).toBe("active");
  });

  it("3: release(A, A's claim) releases it", async () => {
    const id = (await tx("service_role", acq(a, "rel"))).last?.r?.claim_id;
    expect(await rpc(rel(a, id), "released", "tenant_id")).toBe(`|true|${A}`);
    expect(await status(id)).toBe("released");
  });

  it("3: a duplicate active claim still returns acquired false", async () => {
    await tx("service_role", acq(a, "dup"));
    expect(await rpc(acq(a, "dup"), "acquired", "tenant_id")).toBe(
      `|false|${A}`,
    );
  });

  it("5: a NULL tenant raises in both wrappers (not 'undefined function') before any write", async () => {
    const before = await snapshot();
    for (const sql of [acq("NULL", "null"), rel("NULL", ids.a!)]) {
      const r = await tx("service_role", sql);
      expect(r.err !== "" && r.code !== "42883", `${r.code} ${r.err}`).toBe(
        true,
      );
    }
    expect((await snapshot()) + (await status(ids.a!))).toBe(`${before}active`);
  });

  it("16(i): '' as p_tenant_id raises 22P02 in both wrappers", async () => {
    const codes = [
      (await tx("service_role", acq("''", "e"))).code,
      (await tx("service_role", rel("''", ids.a!))).code,
    ];
    expect(codes.join()).toBe("22P02,22P02");
  });

  it("8: app.current_tenant_id is transaction-local: a fresh transaction on the same pooled connection sees it unset or empty after the guarded call's COMMIT (and ROLLBACK)", async () => {
    for (const end of ["commit", "rollback"]) {
      const r = await tx("service_role", acq(a, `guc-${end}`), end);
      expect(r.err + r.last?.r?.tenant_id).toBe(A);
      const next = await tx(
        "service_role",
        "select coalesce(current_setting('app.current_tenant_id', true), '') v",
      );
      expect(next.err + next.last?.v).toBe("");
    }
  });

  it("uppercase tenant id is the same tenant (compared as uuid): echo is A, and re-entering A in upper case is allowed", async () => {
    const U = `'${A.toUpperCase()}'`;
    expect(await rpc(acq(U, "upper"), "acquired", "tenant_id")).toBe(
      `|true|${A}`,
    );
    expect((await tg(`${enter(a)}\n${enter(U)}`, "rollback")).err).toBe("");
  });

  it("5: enter(B) after enter(A) in one transaction raises; re-entering A is allowed", async () => {
    expect((await tg(`${enter(a)}\n${enter(a)}`, "rollback")).done).toBe(2);
    const r = await tg(`${enter(a)}\n${enter(b)}`, "rollback");
    expect(`${r.done} ${r.err === ""}`).toBe("1 false");
  });

  it("5: a forced GUC readback mismatch raises (enter() mutated inside a rolled-back transaction)", async () => {
    const def = String(
      await v(
        "select pg_get_functiondef('tenant_guard.enter(uuid)'::regprocedure) v",
      ),
    );
    const forced = def.replace(
      /(set_config\s*\(\s*'app\.current_tenant_id'\s*,\s*)([^,]+?)(\s*,\s*true\s*\))/i,
      `$1'${randomUUID()}'$3`,
    );
    expect(forced).not.toBe(def);
    await db.query(`begin; ${forced}; set local role tenant_guard`);
    await expect(db.query(enter(a))).rejects.toThrow();
    await db.query("rollback");
  });
});
