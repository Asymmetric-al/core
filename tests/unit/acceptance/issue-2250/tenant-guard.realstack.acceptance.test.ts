/**
 * #2250 real-stack acceptance (spec r1 = issue comment 6384739115 + conditions
 * 6384790093): criteria 1-5, 7-9, 11, 14-17. Runs in CI `migrate` step "Verify
 * tenant isolation (real stack)" against the migrated PG17 superuser URL; calls
 * emulate PostgREST (BEGIN; SET LOCAL ROLE ...). Skips locally without the URL.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

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
/** The 6 functions of criteria 14/15 (no overloads allowed). */
const FN = `select n.nspname || '.' || p.proname f, p.* from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'tenant_guard' or (n.nspname = 'public' and p.proname in ('acquire_workflow_work_claim', 'release_workflow_work_claim'))`;
const SP_OK = `(proconfig && array['search_path=""', 'search_path=pg_catalog', 'search_path=pg_catalog, public'])`;
const TG_ACQ = "tenant_guard.acquire_workflow_work_claim";
const TG_REL = "tenant_guard.release_workflow_work_claim";
const TG = "'tenant_guard'::regrole";

/**
 * Catalog checks, one block each: "title" line, SQL returning one column `v`,
 * then "=> expected v". Blocks are separated by a blank line.
 */
const CATALOG = `
4: tenant_guard is NOLOGIN NOSUPERUSER NOBYPASSRLS NOCREATEROLE NOCREATEDB NOINHERIT
select concat_ws(',', rolcanlogin, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolinherit) v from pg_roles where rolname = 'tenant_guard'
=> f,f,f,f,f,f

4: tenant_guard owns no relation and exactly the 2 guarded functions
select (select count(*) from pg_class where relowner = ${TG}) || ' ' || (select string_agg(oid::regproc::text, ',' order by oid::regproc::text) from pg_proc where proowner = ${TG}) v
=> 0 ${TG_ACQ},${TG_REL}

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

17: every ACL entry granted to tenant_guard (relations, columns, schemas, functions, databases) equals the inventory
select string_agg(e, ', ' order by e) v from (
  select c.oid::regclass || ' ' || a.privilege_type e from pg_class c, aclexplode(c.relacl) a where a.grantee = ${TG}
  union all select attrelid::regclass || '.' || attname from pg_attribute, aclexplode(attacl) a where a.grantee = ${TG}
  union all select 'schema ' || nspname || ' ' || a.privilege_type from pg_namespace, aclexplode(nspacl) a where a.grantee = ${TG}
  union all select p.oid::regprocedure || ' ' || a.privilege_type from pg_proc p, aclexplode(p.proacl) a where a.grantee = ${TG} and p.proowner <> a.grantee
  union all select 'database ' || datname from pg_database, aclexplode(datacl) a where a.grantee = ${TG}) s
=> public.workflow_work_claims INSERT, public.workflow_work_claims SELECT, public.workflow_work_claims UPDATE, schema public USAGE, schema tenant_guard USAGE, tenant_guard.current_tenant_id() EXECUTE, tenant_guard.enter(uuid) EXECUTE

17: no DELETE/TRUNCATE on claims; no SELECT on tenants, profiles, donation_saga_outbox
select concat_ws(',', has_table_privilege('tenant_guard', 'public.workflow_work_claims', 'DELETE'), has_table_privilege('tenant_guard', 'public.workflow_work_claims', 'TRUNCATE'),
  has_table_privilege('tenant_guard', 'public.tenants', 'SELECT'), has_table_privilege('tenant_guard', 'public.profiles', 'SELECT'), has_table_privilege('tenant_guard', 'public.donation_saga_outbox', 'SELECT')) v
=> f,f,f,f,f

15: old release(uuid, text) is gone; release(uuid, uuid, text) and acquire return jsonb
select concat_ws(' ', coalesce(to_regprocedure('public.release_workflow_work_claim(uuid,text)')::text, 'gone'),
  pg_get_function_result(to_regprocedure('public.release_workflow_work_claim(uuid,uuid,text)')),
  pg_get_function_result(to_regprocedure('public.acquire_workflow_work_claim(uuid,text,text,text,integer)'))) v
=> gone jsonb jsonb

14: exactly 2 tenant_guard-owned SECURITY DEFINER functions, each SET search_path = '' (or pg_catalog[, public])
select string_agg(oid::regproc || ' ' || ${SP_OK}, ', ' order by oid::regproc::text) v from pg_proc where proowner = ${TG} and prosecdef
=> ${TG_ACQ} true, ${TG_REL} true

14/15: the 6 functions: owner, DEFINER, search_path pinned, explicit ACL (not NULL), exact EXECUTE grantees besides the owner
select string_agg(concat_ws(' ', f, pg_get_userbyid(proowner), prosecdef, coalesce(${SP_OK}, false), proacl is not null,
  (select coalesce(string_agg(distinct case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end, '+'), '-')
   from aclexplode(proacl) a where a.privilege_type = 'EXECUTE' and a.grantee <> proowner)), ', ' order by f) v from (${FN}) x
=> public.acquire_workflow_work_claim postgres f t t service_role, public.release_workflow_work_claim postgres f t t service_role, ${TG_ACQ} tenant_guard t t t service_role, tenant_guard.current_tenant_id postgres f t t tenant_guard, tenant_guard.enter postgres f t t tenant_guard, ${TG_REL} tenant_guard t t t service_role
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
    await db
      .query(`delete from public.tenants where id in (${a}, ${b})`)
      .catch(() => undefined);
    await db.end();
  });

  it.each(CATALOG)("%s", async (_title, sql, want) =>
    expect(await v(sql)).toBe(want),
  );

  it("14: function bodies are schema-qualified under the empty search_path", async () => {
    const fns = (
      await db.query(
        `select f, prosrc, coalesce(proargnames, '{}') a from (${FN}) x`,
      )
    ).rows;
    expect(fns.length).toBe(6);
    for (const f of fns) {
      expect(bareTargets(f.prosrc, f.a), f.f).toEqual([]);
      expect(f.prosrc, f.f).not.toMatch(
        /(?<![\w.])(enter|current_tenant_id|set_config|current_setting)\s*\(/i,
      );
    }
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
