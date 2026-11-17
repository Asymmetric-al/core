/**
 * AL-2674 real-stack acceptance for the catalog gate's new assertions (plan
 * 5.4; WP1 acceptance "the catalog gate's new assertions hold on the migrated
 * database and fail on a planted violation"). The clean run goes through the
 * gate's own runner (psql). Each planted violation is created inside a
 * transaction on this suite's connection, the gate's catalog query runs in
 * that same transaction, the result is judged by the gate's evaluator against
 * the repository's lists, and the transaction is rolled back.
 *
 * Council round 1 (A1 to A5) added the rules that the guard owner owns
 * nothing outside its schema and postgres owns every platform definer; that a
 * function elsewhere calling into a command schema is an invoker wrapper with
 * a fixed path, closed to PUBLIC and anon, and open to signed-in users only
 * around their own lanes; that a fixed path is empty in the command schemas
 * and never names "$user"; that each lane's check is a real first step; and
 * that no table grant in public goes unadmitted. Each has a plant below.
 *
 * Runs against TENANT_GUARD_IT_ADMIN_DATABASE_URL (see ./harness.ts).
 */
import { readFileSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "./harness";
import {
  ANON_DEFINER_ALLOWLIST_PATH,
  TENANT_RLS_CATALOG_SQL,
  TENANT_RLS_EXCEPTIONS_PATH,
  evaluateTenantRlsCatalog,
  runTenantRlsCatalogGate,
} from "../../../../scripts/verify/tenant-rls-catalog.mjs";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const json = (file: string) =>
  JSON.parse(readFileSync(file, "utf8")) as unknown;
type Failure = { code: string; table?: string; function?: string };
/** Every function this suite plants is named acc2674_*. */
const planted = (failures: Failure[]) =>
  failures
    .filter((f) => /acc2674_/.test(String(f.function ?? f.table)))
    .map((f) => `${f.code} ${f.function ?? f.table}`)
    .sort();

const DEF = (schema: string, name: string, extra = "set search_path = ''") =>
  `create function ${schema}.${name}() returns int language sql security definer ${extra} as 'select 1';`;
const REVOKE = (fn: string) =>
  `revoke all on function ${fn} from public, anon, authenticated, service_role;`;
/** A tenant_guard human entry point with the given PL/pgSQL block, owned by the guard. */
const HUMAN_BLOCK = (name: string, block: string) =>
  `create function tenant_guard.${name}(p_tenant_id uuid) returns jsonb language plpgsql security definer set search_path = '' as $$ ${block} $$;
   ${REVOKE(`tenant_guard.${name}(uuid)`)}
   grant create on schema tenant_guard to tenant_guard;
   alter function tenant_guard.${name}(uuid) owner to tenant_guard;
   revoke create on schema tenant_guard from tenant_guard;`;
const HUMAN = (name: string, body: string) =>
  HUMAN_BLOCK(name, `begin ${body} return '{}'::jsonb; end`);
const PREAMBLE = "perform tenant_guard.begin_human_command(p_tenant_id);";

const CASES: [string, string, string[], unknown?][] = [
  [
    "a definer without a fixed search path, in public, tenant_guard and platform",
    ["public", "tenant_guard", "platform"]
      .map(
        (s) =>
          `${DEF(s, `acc2674_nosp_${s}`, "")} ${REVOKE(`${s}.acc2674_nosp_${s}()`)}`,
      )
      .join(" "),
    [
      "DEFINER_SEARCH_PATH_UNSET platform.acc2674_nosp_platform()",
      "DEFINER_SEARCH_PATH_UNSET public.acc2674_nosp_public()",
      "DEFINER_SEARCH_PATH_UNSET tenant_guard.acc2674_nosp_tenant_guard()",
    ],
  ],
  [
    "a definer left with Postgres's default PUBLIC EXECUTE",
    DEF("public", "acc2674_public"),
    [
      "DEFINER_ANON_EXECUTE public.acc2674_public()",
      "DEFINER_PUBLIC_EXECUTE public.acc2674_public()",
    ],
  ],
  [
    "the hygiene fix undone: PUBLIC EXECUTE on handle_new_user again",
    "grant execute on function public.handle_new_user() to public;",
    [],
  ],
  [
    "a definer granted to anon by name and not allowlisted",
    `${DEF("public", "acc2674_anon")} ${REVOKE("public.acc2674_anon()")} grant execute on function public.acc2674_anon() to anon;`,
    ["DEFINER_ANON_EXECUTE public.acc2674_anon()"],
  ],
  [
    "a platform definer owned by a role that does not bypass RLS",
    `create role acc2674_nobypass nosuperuser nobypassrls; ${DEF("platform", "acc2674_owner")} ${REVOKE("platform.acc2674_owner()")} alter function platform.acc2674_owner() owner to acc2674_nobypass;`,
    [
      "DEFINER_OWNER_NO_BYPASS platform.acc2674_owner()",
      "PLATFORM_DEFINER_OWNER platform.acc2674_owner()",
    ],
  ],
  // Council round 1, A1: the guard owner is exempt only in its own schema,
  // and postgres owns every platform definer.
  [
    "the council's case: a guard-owned definer in public, granted to signed-in users, that enters any tenant",
    `create function public.acc2674_as_guard(p_tenant_id uuid) returns void language plpgsql security definer set search_path = '' as $$ begin perform tenant_guard.enter(p_tenant_id); end $$;
     ${REVOKE("public.acc2674_as_guard(uuid)")} grant execute on function public.acc2674_as_guard(uuid) to authenticated;
     alter function public.acc2674_as_guard(uuid) owner to tenant_guard;`,
    [
      "DEFINER_OWNER_NO_BYPASS public.acc2674_as_guard(p_tenant_id uuid)",
      "GUARD_OWNED_OUTSIDE_SCHEMA public.acc2674_as_guard(p_tenant_id uuid)",
      "WRAPPER_DEFINER public.acc2674_as_guard(p_tenant_id uuid)",
      "WRAPPER_GRANTS_WORKER public.acc2674_as_guard(p_tenant_id uuid)",
    ],
  ],
  [
    "a guard-owned invoker function in private",
    `create function private.acc2674_guard_helper() returns int language sql set search_path = '' as 'select 1';
     ${REVOKE("private.acc2674_guard_helper()")} alter function private.acc2674_guard_helper() owner to tenant_guard;`,
    ["GUARD_OWNED_OUTSIDE_SCHEMA private.acc2674_guard_helper()"],
  ],
  [
    "a platform definer owned by a role that bypasses RLS but is not postgres",
    `create role acc2674_bypass nosuperuser bypassrls; ${DEF("platform", "acc2674_bypass_owner")} ${REVOKE("platform.acc2674_bypass_owner()")} alter function platform.acc2674_bypass_owner() owner to acc2674_bypass;`,
    ["PLATFORM_DEFINER_OWNER platform.acc2674_bypass_owner()"],
  ],
  // A2: wrappers of the command lanes.
  [
    "the council's case: a postgres-owned definer wrapper that hands the workflow claim to signed-in users",
    `create function public.acc2674_claim(p_tenant_id uuid) returns jsonb language sql security definer set search_path = '' as $$ select tenant_guard.acquire_workflow_work_claim(p_tenant_id, 'x', 'y', 'z', 60) $$;
     ${REVOKE("public.acc2674_claim(uuid)")} grant execute on function public.acc2674_claim(uuid) to authenticated;`,
    [
      "WRAPPER_DEFINER public.acc2674_claim(p_tenant_id uuid)",
      "WRAPPER_GRANTS_WORKER public.acc2674_claim(p_tenant_id uuid)",
    ],
  ],
  [
    "an invoker wrapper with no search path, left with PUBLIC EXECUTE, around the health function",
    "create function public.acc2674_health() returns jsonb language sql as 'select platform.health()';",
    [
      "WRAPPER_GRANTS_WORKER public.acc2674_health()",
      "WRAPPER_PUBLIC_EXECUTE public.acc2674_health()",
      "WRAPPER_SEARCH_PATH public.acc2674_health()",
    ],
  ],
  // A3: a fixed search path means empty in the command schemas and never "$user".
  [
    'a definer whose search path names "$user", and command-schema definers with a non-empty path',
    `${DEF("public", "acc2674_user_path", `set search_path = "$user", public`)} ${REVOKE("public.acc2674_user_path()")}
     ${DEF("platform", "acc2674_public_path", "set search_path = public")} ${REVOKE("platform.acc2674_public_path()")}`,
    [
      "DEFINER_SEARCH_PATH_UNSAFE platform.acc2674_public_path()",
      "DEFINER_SEARCH_PATH_UNSAFE public.acc2674_user_path()",
    ],
  ],
  // A4: the preamble must be the real first step.
  [
    "a human entry point whose EXCEPTION clause swallows the preamble's refusal",
    `${HUMAN_BLOCK("acc2674_swallow", `begin ${PREAMBLE} return '{}'::jsonb; exception when others then return null; end`)} grant execute on function tenant_guard.acc2674_swallow(uuid) to authenticated;`,
    [
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.acc2674_swallow(p_tenant_id uuid)",
    ],
  ],
  [
    "a human entry point whose preamble is only a comment",
    `${HUMAN("acc2674_comment", "-- perform tenant_guard.begin_human_command(p_tenant_id);\n")} grant execute on function tenant_guard.acc2674_comment(uuid) to authenticated;`,
    [
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.acc2674_comment(p_tenant_id uuid)",
    ],
  ],
  [
    "a platform command whose operator check sits in a body with an EXCEPTION clause",
    `create function platform.acc2674_swallow(p uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
       begin perform platform.require_operator(); return '{}'::jsonb; exception when others then return null; end $$;
     ${REVOKE("platform.acc2674_swallow(uuid)")} grant execute on function platform.acc2674_swallow(uuid) to authenticated;`,
    ["PLATFORM_COMMAND_NO_OPERATOR_CHECK platform.acc2674_swallow(p uuid)"],
  ],
  // A5: table grants in public.
  [
    "a table in public granted to PUBLIC, granted TRUNCATE, and readable by anon with no policy",
    `create table public.acc2674_t (id int);
     grant select on public.acc2674_t to public;
     grant truncate on public.acc2674_t to authenticated;
     grant select on public.acc2674_t to anon;`,
    [
      "GRANT_TO_PUBLIC acc2674_t",
      "GRANT_UNSAFE_PRIVILEGE acc2674_t",
      "GRANT_WITHOUT_POLICY acc2674_t",
    ],
  ],
  [
    "a human entry point the service key may also execute",
    `${HUMAN("acc2674_mixed", PREAMBLE)} grant execute on function tenant_guard.acc2674_mixed(uuid) to authenticated, service_role;`,
    ["COMMAND_LANE_MIXED tenant_guard.acc2674_mixed(p_tenant_id uuid)"],
  ],
  [
    "a tenant_guard function signed-in users may execute without the preamble",
    `${HUMAN("acc2674_nopre", "")} grant execute on function tenant_guard.acc2674_nopre(uuid) to authenticated;`,
    ["COMMAND_HUMAN_NO_PREAMBLE tenant_guard.acc2674_nopre(p_tenant_id uuid)"],
  ],
  [
    "a platform function signed-in users may execute without the operator check",
    `create function platform.acc2674_cmd(p uuid) returns jsonb language plpgsql security definer set search_path = '' as $$ begin return '{}'::jsonb; end $$;
     ${REVOKE("platform.acc2674_cmd(uuid)")} grant execute on function platform.acc2674_cmd(uuid) to authenticated;`,
    ["PLATFORM_COMMAND_NO_OPERATOR_CHECK platform.acc2674_cmd(p uuid)"],
  ],
  [
    "an invoker helper in tenant_guard left with PUBLIC EXECUTE",
    "create function tenant_guard.acc2674_helper() returns int language sql set search_path = '' as 'select 1';",
    // PUBLIC reaches both lanes, so the lane rules fire as well.
    [
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.acc2674_helper()",
      "COMMAND_LANE_MIXED tenant_guard.acc2674_helper()",
      "COMMAND_PUBLIC_EXECUTE tenant_guard.acc2674_helper()",
    ],
  ],
  [
    "an allowlisted anon read function that is volatile",
    `${DEF("public", "acc2674_read")} ${REVOKE("public.acc2674_read()")} grant execute on function public.acc2674_read() to anon;`,
    ["ANON_ALLOWLISTED_UNSAFE public.acc2674_read()"],
    { entries: [{ function: "public.acc2674_read()", reason: "fixture" }] },
  ],
  [
    "an allowlist entry for a function that does not exist",
    "",
    ["ANON_ALLOWLIST_STALE public.acc2674_gone()"],
    { entries: [{ function: "public.acc2674_gone()", reason: "fixture" }] },
  ],
];

describe.skipIf(!ADMIN_URL)("AL-2674 catalog gate (real stack)", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  beforeAll(() => db.connect());
  afterAll(() => db.end());

  /** The gate's verdict on the catalog with `sql` applied, in a rolled-back transaction. */
  async function judge(
    sql: string,
    allowlist = json(ANON_DEFINER_ALLOWLIST_PATH),
  ) {
    await db.query("begin");
    try {
      if (sql) await db.query(sql);
      const r = await db.query(TENANT_RLS_CATALOG_SQL);
      const snapshot = JSON.parse(
        Object.values(r.rows[0] as object)[0] as string,
      );
      return evaluateTenantRlsCatalog(
        snapshot,
        json(TENANT_RLS_EXCEPTIONS_PATH),
        allowlist,
      );
    } finally {
      await db.query("rollback");
    }
  }

  it("the migrated database passes the gate's runner: every definer hygienic, one human entry point, no platform command, five wrappers", () => {
    const r = runTenantRlsCatalogGate({ databaseUrl: ADMIN_URL });
    expect(r.failures).toEqual([]);
    expect(r.ok).toBe(true);
    // The wrappers: the two workflow-claim wrappers and the health wrapper
    // (service key), and the command-assignment wrapper (signed-in users).
    // AL-2675 (WP2a) adds the fifth: authz.caller_assignment, an INVOKER
    // helper executable by its owner only, which reads the request's
    // assignment header through tenant_guard.request_assignment_id() for the
    // member directory and the CRM table-preference helper.
    expect(r.counts).toMatchObject({
      anonAllowed: 0,
      humanEntryPoints: 1,
      platformCommands: 0,
      wrappers: 5,
    });
  });

  it("the anon allowlist ships empty: no SECURITY DEFINER function is open to anon", () => {
    expect(json(ANON_DEFINER_ALLOWLIST_PATH)).toMatchObject({ entries: [] });
  });

  it.each(CASES)(
    "fails on a planted violation: %s",
    async (_name, sql, expected, allowlist) => {
      const r = await judge(
        sql,
        allowlist ?? json(ANON_DEFINER_ALLOWLIST_PATH),
      );
      if (expected.length) expect(planted(r.failures)).toEqual(expected);
      else
        expect(
          r.failures.map((f: Failure) => `${f.code} ${f.function ?? f.table}`),
        ).toEqual([
          "DEFINER_PUBLIC_EXECUTE public.handle_new_user()",
          "DEFINER_ANON_EXECUTE public.handle_new_user()",
        ]);
      expect(r.ok).toBe(false);
    },
  );

  it("an allowlisted read function that is STABLE with an empty search path passes", async () => {
    const r = await judge(
      `create function public.acc2674_ok() returns int language sql stable security definer set search_path = '' as 'select 1';
       ${REVOKE("public.acc2674_ok()")} grant execute on function public.acc2674_ok() to anon;`,
      { entries: [{ function: "public.acc2674_ok()", reason: "fixture" }] },
    );
    expect(r.failures).toEqual([]);
    expect(r.counts.anonAllowed).toBe(1);
  });
});
