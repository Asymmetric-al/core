/**
 * AL-2674 real-stack acceptance (WP1 slice 1.1a; plan 5.4, 7.4, 7.5 and the
 * WP1 acceptance list in section 12): the command lane, the `platform` schema,
 * the health function, the environment marker and the reset scripts' rule.
 *
 * Proofs (brief item f): one human command called on a signed-in token
 * succeeds; a signed-in caller cannot execute a worker entry point or anything
 * else in the command schema; every `platform` command refuses a
 * non-operator. Acceptance: a reset script refuses a database that has no
 * marker.
 *
 * Runs against TENANT_GUARD_IT_ADMIN_DATABASE_URL (see ./harness.ts). The
 * reset-script cases create one throwaway database named after the target
 * database (`<name>_nomarker_<hex>`) and drop it afterwards.
 */
import { spawnSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  COMMAND_LANE_MIGRATION,
  GUARD_CLI,
  HUMAN_ENTRY_POINTS,
  IN_MIGRATE_JOB,
  PLATFORM_COMMANDS,
  PLATFORM_MIGRATION,
  asRole,
  fixtureIds,
  fixtureSql,
  migrationBody,
  nullCall,
  postAssert,
} from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("AL-2674 command lane (real stack)", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const id = fixtureIds();
  const as = asRole(db, id);
  const keyOf = (v: unknown) =>
    Object.keys(id).find((k) => id[k] === v) ?? String(v);

  beforeAll(() => db.connect());
  afterAll(() => db.end());

  async function tx(fn: () => Promise<void>) {
    await db.query("begin");
    try {
      await db.query(fixtureSql(id));
      await fn();
    } finally {
      await db.query("rollback");
    }
  }
  const one = async (sql: string, params: unknown[] = []) =>
    (await db.query(sql, params)).rows[0] as Record<string, unknown>;
  const RESOLVE = (t: string) =>
    `select public.resolve_command_assignment('${id[t]}') r`;
  const header = (m: string) => ({ "x-asym-assignment": id[m] ?? m });

  describe("proof 1: a human command on a signed-in token", () => {
    it("succeeds for a caller with one live row, and runs inside the guard for that tenant", () =>
      tx(async () => {
        const r = await as("authenticated", { sub: "U1" }, RESOLVE("TA"));
        expect(r.code, r.message).toBeNull();
        const out = r.rows[0]!.r as Record<string, unknown>;
        expect({
          ...out,
          actor_id: keyOf(out.actor_id),
          assignment_id: keyOf(out.assignment_id),
          tenant_id: keyOf(out.tenant_id),
        }).toEqual({
          actor_id: "U1",
          assignment_id: "m1",
          role: "staff",
          staff_role: "finance",
          tenant_id: "TA",
        });
        const direct = await as(
          "authenticated",
          { sub: "U1" },
          `select tenant_guard.resolve_command_assignment('${id.TA}') r`,
        );
        expect(direct.code, direct.message).toBeNull();
        expect(direct.rows[0]!.r).toEqual(out);
      }));

    it("is a SECURITY DEFINER owned by tenant_guard with an empty search path, reached through an invoker wrapper", () =>
      tx(async () => {
        const r = await db.query(
          `select p.oid::regprocedure::text fn, p.prosecdef, p.proowner::regrole::text owner, p.proconfig,
                  array(select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
                          from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                         where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner order by 1) grantees
             from pg_proc p where p.oid in ('tenant_guard.resolve_command_assignment(uuid)'::regprocedure,
                                            'public.resolve_command_assignment(uuid)'::regprocedure)
            order by 1`,
        );
        expect(r.rows).toEqual([
          {
            fn: "resolve_command_assignment(uuid)",
            prosecdef: false,
            owner: "postgres",
            proconfig: ['search_path=""'],
            grantees: ["authenticated"],
          },
          {
            fn: "tenant_guard.resolve_command_assignment(uuid)",
            prosecdef: true,
            owner: "tenant_guard",
            proconfig: ['search_path=""'],
            grantees: ["authenticated"],
          },
        ]);
      }));

    it("takes the assignment the header names, and refuses a caller with several live rows who names none", () =>
      tx(async () => {
        const none = await as("authenticated", { sub: "U2" }, RESOLVE("TA"));
        expect([none.code, none.message]).toEqual([
          "42501",
          "tenant_guard: the caller has several live assignments in this tenant and the request names none",
        ]);
        const empty = await as(
          "authenticated",
          { sub: "U2", headers: { "x-asym-assignment": " " } },
          RESOLVE("TA"),
        );
        expect(empty.code).toBe("42501");
        for (const m of ["m2a", "m2b"]) {
          const r = await as(
            "authenticated",
            { sub: "U2", headers: header(m) },
            RESOLVE("TA"),
          );
          expect(r.code, r.message).toBeNull();
          const out = r.rows[0]!.r as Record<string, unknown>;
          expect([keyOf(out.assignment_id), keyOf(out.tenant_id)]).toEqual([
            m,
            "TA",
          ]);
        }
      }));

    it.each<[string, string, string, string]>([
      ["an inactive row of the caller", "U2", "m2c", "TA"],
      ["another person's row", "U2", "m1", "TA"],
      ["the caller's row in another tenant", "U2", "m2d", "TA"],
      [
        "a row that does not exist",
        "U1",
        "00000000-0000-4000-8000-000000000000",
        "TA",
      ],
    ])("refuses an assignment header naming %s", (_name, sub, m, t) =>
      tx(async () => {
        const r = await as(
          "authenticated",
          { sub, headers: header(m) },
          RESOLVE(t),
        );
        expect([r.code, r.message]).toEqual([
          "42501",
          "tenant_guard: the selected assignment is not a live assignment of the caller in this tenant",
        ]);
      }),
    );

    it("refuses a malformed assignment header, a caller with no live row in the tenant, and a call with no session", () =>
      tx(async () => {
        const bad = await as(
          "authenticated",
          { sub: "U1", headers: { "x-asym-assignment": "not-a-uuid" } },
          RESOLVE("TA"),
        );
        expect(bad.code).toBe("22P02");
        const outsider = await as(
          "authenticated",
          { sub: "U3" },
          RESOLVE("TA"),
        );
        expect([outsider.code, outsider.message]).toEqual([
          "42501",
          "tenant_guard: the caller has no live assignment in this tenant",
        ]);
        const anonymous = await as(
          "authenticated",
          { sub: null },
          RESOLVE("TA"),
        );
        expect([anonymous.code, anonymous.message]).toEqual([
          "42501",
          "tenant_guard: a human command needs a signed-in caller",
        ]);
      }));

    it("is closed to anon and to the service key (the worker lane)", () =>
      tx(async () => {
        for (const role of ["anon", "service_role"]) {
          const r = await as(role, { sub: "U1" }, RESOLVE("TA"));
          expect(r.code, role).toBe("42501");
          expect(r.message).toMatch(
            /permission denied for function resolve_command_assignment/,
          );
        }
      }));

    it("leaves no guard tenant behind for the next transaction", async () => {
      await tx(async () => {
        const r = await as("authenticated", { sub: "U1" }, RESOLVE("TA"));
        expect(r.code, r.message).toBeNull();
      });
      const after = await one(
        "select coalesce(current_setting('app.current_tenant_id', true), '') v",
      );
      expect(after.v).toBe("");
    });
  });

  describe("proof 2: a signed-in caller can execute nothing else in the command schema", () => {
    it("authenticated may execute exactly the human entry points in tenant_guard", () =>
      tx(async () => {
        const r = await db.query(
          `select p.oid::regprocedure::text fn from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'tenant_guard' and has_function_privilege('authenticated', p.oid, 'EXECUTE') order by 1`,
        );
        expect(r.rows.map((x) => x.fn)).toEqual(HUMAN_ENTRY_POINTS);
        const usage = await one(
          `select has_schema_privilege('authenticated', 'tenant_guard', 'USAGE') a,
                  has_schema_privilege('anon', 'tenant_guard', 'USAGE') n`,
        );
        expect(usage).toEqual({ a: true, n: false });
      }));

    it("every other tenant_guard function, the worker entry points included, refuses a signed-in caller", () =>
      tx(async () => {
        const r = await db.query(
          `select p.oid::regprocedure::text fn from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'tenant_guard' order by 1`,
        );
        const others = r.rows
          .map((x) => x.fn as string)
          .filter((fn) => !HUMAN_ENTRY_POINTS.includes(fn));
        expect(others).toEqual(
          expect.arrayContaining([
            "tenant_guard.acquire_workflow_work_claim(uuid,text,text,text,integer)",
            "tenant_guard.release_workflow_work_claim(uuid,uuid,text)",
            // AL-2675: the preamble takes the capability as a defaulted
            // second argument.
            "tenant_guard.begin_human_command(uuid,text)",
            "tenant_guard.enter(uuid)",
          ]),
        );
        for (const fn of others) {
          const call = await nullCall(db, fn);
          const out = await as("authenticated", { sub: "U1" }, call);
          expect([fn, out.code], out.message).toEqual([fn, "42501"]);
          expect(out.message, fn).toMatch(/permission denied for function/);
        }
      }));

    it("the public worker wrappers refuse a signed-in caller too", () =>
      tx(async () => {
        for (const fn of [
          "public.acquire_workflow_work_claim(uuid,text,text,text,integer)",
          "public.release_workflow_work_claim(uuid,uuid,text)",
        ]) {
          const out = await as(
            "authenticated",
            { sub: "U1" },
            await nullCall(db, fn),
          );
          expect([fn, out.code]).toEqual([fn, "42501"]);
        }
      }));
  });

  describe("proof 3: every platform command refuses a non-operator", () => {
    const PROBE = `create function platform.acc2674_probe(p_reason text) returns jsonb language plpgsql security definer set search_path = '' as $$
        declare v_operator uuid := platform.require_operator();
        begin return pg_catalog.jsonb_build_object('operator', v_operator, 'reason', p_reason); end $$;
      revoke all on function platform.acc2674_probe(text) from public, anon, authenticated, service_role;
      grant execute on function platform.acc2674_probe(text) to authenticated;`;
    const commands = async () =>
      (
        await db.query(
          `select p.oid::regprocedure::text fn from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'platform' and has_function_privilege('authenticated', p.oid, 'EXECUTE') order by 1`,
        )
      ).rows.map((x) => x.fn as string);
    /** Calls every platform command as a signed-in non-operator, with and without a second factor. */
    async function everyCommandRefuses() {
      const fns = await commands();
      for (const fn of fns)
        for (const aal of ["aal1", "aal2"]) {
          const out = await as(
            "authenticated",
            { sub: "U1", aal },
            await nullCall(db, fn),
          );
          expect([fn, aal, out.code, out.message]).toEqual([
            fn,
            aal,
            "42501",
            "platform: the caller is not a platform operator",
          ]);
        }
      return fns;
    }

    it("signed-in users may use the schema and execute the platform commands and nothing else (none ship in WP1)", () =>
      tx(async () => {
        expect(await commands()).toEqual(PLATFORM_COMMANDS);
        expect(await everyCommandRefuses()).toEqual(PLATFORM_COMMANDS);
        const usage = await one(
          `select has_schema_privilege('authenticated', 'platform', 'USAGE') a,
                  has_schema_privilege('anon', 'platform', 'USAGE') n,
                  has_schema_privilege('service_role', 'platform', 'USAGE') s`,
        );
        expect(usage).toEqual({ a: true, n: false, s: true });
        const all = await db.query(
          `select p.oid::regprocedure::text fn from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'platform' order by 1`,
        );
        for (const { fn } of all.rows as { fn: string }[]) {
          if (PLATFORM_COMMANDS.includes(fn)) continue;
          const out = await as(
            "authenticated",
            { sub: "U1", aal: "aal2" },
            await nullCall(db, fn),
          );
          expect([fn, out.code]).toEqual([fn, "42501"]);
          expect(out.message, fn).toMatch(/permission denied for function/);
        }
      }));

    it("a command that follows the convention refuses every non-operator, so the loop above is not vacuous", () =>
      tx(async () => {
        await db.query(PROBE);
        expect(await commands()).toEqual([
          ...PLATFORM_COMMANDS,
          "platform.acc2674_probe(text)",
        ]);
        await everyCommandRefuses();
        const noSession = await as(
          "authenticated",
          { sub: null },
          "select platform.acc2674_probe('x')",
        );
        expect([noSession.code, noSession.message]).toEqual([
          "42501",
          "platform: a platform command needs a signed-in caller",
        ]);
        for (const role of ["anon", "service_role"]) {
          const out = await as(
            role,
            { sub: "U1", aal: "aal2" },
            "select platform.acc2674_probe('x')",
          );
          expect(out.code, role).toBe("42501");
        }
      }));

    it("the shared check fails closed until WP2c supplies the operator list, then also demands a second factor", () =>
      tx(async () => {
        await db.query(PROBE);
        const listed = await one(
          "select prosrc from pg_proc where oid = 'platform.caller_on_operator_list()'::regprocedure",
        );
        expect(String(listed.prosrc).trim()).toBe("SELECT false;");
        // Simulate WP2c: the caller is on the list.
        await db.query(
          "create or replace function platform.caller_on_operator_list() returns boolean language sql stable set search_path = '' as $$ select true $$",
        );
        const aal1 = await as(
          "authenticated",
          { sub: "U1", aal: "aal1" },
          "select platform.acc2674_probe('x') r",
        );
        expect([aal1.code, aal1.message]).toEqual([
          "42501",
          "platform: a platform command needs a session verified with a second factor",
        ]);
        const aal2 = await as(
          "authenticated",
          { sub: "U1", aal: "aal2" },
          "select platform.acc2674_probe('x') r",
        );
        expect(aal2.code, aal2.message).toBeNull();
        expect(keyOf((aal2.rows[0]!.r as { operator: string }).operator)).toBe(
          "U1",
        );
      }));
  });

  describe("the health function (plan 7.4)", () => {
    const HEALTH = "select public.platform_health() h";

    it("answers the service key with the marker and the migration heads, and nobody else", () =>
      tx(async () => {
        const r = await as("service_role", { sub: null }, HEALTH);
        expect(r.code, r.message).toBeNull();
        const h = r.rows[0]!.h as Record<string, unknown>;
        expect(Object.keys(h).sort()).toEqual([
          "applied_heads",
          "checked_at",
          "environment",
          "expected_heads",
        ]);
        expect(h.environment).toBe("disposable");
        expect(h.expected_heads).toEqual({});
        expect(Object.keys(h.applied_heads as object)).toEqual(["supabase"]);
        for (const role of ["authenticated", "anon"]) {
          const denied = await as(role, { sub: "U1" }, HEALTH);
          expect(denied.code, role).toBe("42501");
          const direct = await as(
            role,
            { sub: "U1" },
            "select platform.health()",
          );
          expect(direct.code, role).toBe("42501");
        }
      }));

    it("reports the heads the release job records, which move forward only", () =>
      tx(async () => {
        await db.query(
          "select platform.record_migration_head('supabase', '20261117034708')",
        );
        await db.query(
          "select platform.record_migration_head('payload', '20261022_002412_payload_v4_public_beta_metadata')",
        );
        const r = await as("service_role", { sub: null }, HEALTH);
        expect(
          (r.rows[0]!.h as { expected_heads: unknown }).expected_heads,
        ).toEqual({
          supabase: "20261117034708",
          payload: "20261022_002412_payload_v4_public_beta_metadata",
        });
        await db.query("savepoint s");
        await expect(
          db.query(
            "select platform.record_migration_head('supabase', '20261024150000')",
          ),
        ).rejects.toMatchObject({ code: "22023" });
        await db.query("rollback to savepoint s");
        for (const [ledger, head] of [
          ["supabase", "2026"],
          ["payload", "init"],
          ["other", "20261117034708"],
        ]) {
          await db.query("savepoint s");
          await expect(
            db.query("select platform.record_migration_head($1, $2)", [
              ledger,
              head,
            ]),
          ).rejects.toMatchObject({ code: "23514" });
          await db.query("rollback to savepoint s");
        }
        const job = await as(
          "service_role",
          { sub: null },
          "select platform.record_migration_head('supabase', '20991231000000')",
        );
        expect(job.code).toBe("42501");
      }));
  });

  describe("the environment marker (plan 7.5)", () => {
    it("a database built from source is marked disposable; the marker moves forward only", () =>
      tx(async () => {
        expect((await one("select platform.environment_kind() k")).k).toBe(
          "disposable",
        );
        const step = async (sql: string) => {
          await db.query("savepoint s");
          try {
            await db.query(sql);
            await db.query("release savepoint s");
            return null;
          } catch (e) {
            await db.query("rollback to savepoint s");
            return (e as { code?: string }).code ?? "?";
          }
        };
        expect(
          await step("select platform.advance_environment('disposable')"),
        ).toBe("22023");
        expect(
          await step("select platform.advance_environment('shared')"),
        ).toBeNull();
        expect((await one("select platform.environment_kind() k")).k).toBe(
          "shared",
        );
        expect(
          await step("update platform.environment set kind = 'disposable'"),
        ).toBe("42501");
        expect(
          await step("select platform.advance_environment('production')"),
        ).toBeNull();
        expect(
          await step("update platform.environment set kind = 'shared'"),
        ).toBe("42501");
        expect(await step("delete from platform.environment")).toBe("42501");
        expect(await step("truncate platform.environment")).toBe("42501");
        expect(
          await step(
            "insert into platform.environment (kind) values ('production')",
          ),
        ).toBe("23505");
        expect((await one("select platform.environment_kind() k")).k).toBe(
          "production",
        );
      }));

    /** Removes the marker as only the owner can, past the forward-only trigger. */
    const dropMarker = () =>
      db.query(
        `alter table platform.environment disable trigger environment_marker_forward_only;
         delete from platform.environment;
         alter table platform.environment enable always trigger environment_marker_forward_only;`,
      );
    /** Empties profiles, donors and donations without cascading (rolled back with the test). */
    const emptyPeopleAndGifts = () =>
      db.query(
        `set local session_replication_role = replica;
         delete from public.donations; delete from public.donors; delete from public.profiles;
         set local session_replication_role = origin;`,
      );
    const kind = async () =>
      (await one("select platform.environment_kind() k")).k;
    const attempt = async (sql: string) => {
      await db.query("savepoint s");
      try {
        await db.query(sql);
        await db.query("release savepoint s");
        return null;
      } catch (e) {
        await db.query("rollback to savepoint s");
        return (e as { code?: string }).code ?? "?";
      }
    };

    it("applied to a database that already holds people, the migration writes no marker, and none can be inserted as disposable", () =>
      tx(async () => {
        await dropMarker();
        // The fixture's auth users got profiles through the sign-up trigger.
        await db.query(migrationBody(PLATFORM_MIGRATION));
        expect(await kind()).toBeNull();
        expect(
          await attempt(
            "insert into platform.environment (kind) values ('disposable')",
          ),
        ).toBe("42501");
        expect(
          (await one("select platform.advance_environment('shared') k")).k,
        ).toBe("shared");
      }));

    // Council round 1, C1: a hosted rebuild clears public but keeps auth, so
    // only what a rebuild clears decides whether a database is disposable.
    it("a rebuilt database whose logins survived but whose profiles, donors and donations are empty is marked disposable", () =>
      tx(async () => {
        await dropMarker();
        await emptyPeopleAndGifts();
        expect(
          (await one("select count(*)::int n from auth.users")).n,
        ).toBeGreaterThan(0);
        expect((await one("select platform.holds_people_or_gifts() h")).h).toBe(
          false,
        );
        await db.query(migrationBody(PLATFORM_MIGRATION));
        expect(await kind()).toBe("disposable");
      }));

    it.each<[string, string]>([
      ["a profile", "insert into auth.users (id) values (gen_random_uuid())"],
      ["a donor", "insert into public.donors default values"],
      ["a donation", "insert into public.donations default values"],
    ])(
      "a database that holds %s is not marked, and an explicit disposable insert is refused",
      (_what, insert) =>
        tx(async () => {
          await dropMarker();
          await emptyPeopleAndGifts();
          await db.query(insert);
          expect(
            (await one("select platform.holds_people_or_gifts() h")).h,
          ).toBe(true);
          await db.query(migrationBody(PLATFORM_MIGRATION));
          expect(await kind()).toBeNull();
          expect(
            await attempt(
              "insert into platform.environment (kind) values ('disposable')",
            ),
          ).toBe("42501");
        }),
    );

    // Council round 1, C2: the replica role skips ordinary triggers, and
    // postgres may set it on hosted Supabase.
    it("the forward-only triggers fire always, so the replica role cannot move the marker back", () =>
      tx(async () => {
        const modes = await db.query(
          "select tgname, tgenabled from pg_trigger where tgrelid = 'platform.environment'::regclass and not tgisinternal order by 1",
        );
        expect(modes.rows).toEqual([
          { tgname: "environment_marker_forward_only", tgenabled: "A" },
          { tgname: "environment_marker_no_truncate", tgenabled: "A" },
        ]);
        await db.query("select platform.advance_environment('shared')");
        await db.query("set local session_replication_role = replica");
        expect(
          await attempt("update platform.environment set kind = 'disposable'"),
        ).toBe("42501");
        expect(await attempt("delete from platform.environment")).toBe("42501");
        expect(await attempt("truncate platform.environment")).toBe("42501");
        await db.query("set local session_replication_role = origin");
        expect(await kind()).toBe("shared");
      }));

    it("no role but the owner can read or change the marker or the heads", () =>
      tx(async () => {
        for (const role of ["anon", "authenticated", "service_role"])
          for (const sql of [
            "select * from platform.environment",
            "select * from platform.migration_heads",
            "select platform.environment_kind()",
            "select platform.advance_environment('shared')",
          ]) {
            const out = await as(role, { sub: "U1" }, sql);
            expect([role, sql, out.code]).toEqual([role, sql, "42501"]);
          }
        const rls = await db.query(
          `select c.relname, c.relrowsecurity, c.relforcerowsecurity from pg_class c
            where c.relnamespace = 'platform'::regnamespace and c.relkind = 'r' order by 1`,
        );
        expect(rls.rows).toEqual([
          {
            relname: "environment",
            relrowsecurity: true,
            relforcerowsecurity: true,
          },
          {
            relname: "migration_heads",
            relrowsecurity: true,
            relforcerowsecurity: true,
          },
        ]);
      }));
  });

  describe("the guard role's new privileges (NR-13)", () => {
    it("tenant_guard may use auth and authz and their helpers, and reads only the session caller's memberships", () =>
      tx(async () => {
        const p = await one(
          `select has_schema_privilege('tenant_guard', 'auth', 'USAGE') auth_usage,
                  has_schema_privilege('tenant_guard', 'authz', 'USAGE') authz_usage,
                  has_function_privilege('tenant_guard', 'auth.uid()', 'EXECUTE') uid,
                  has_function_privilege('tenant_guard', 'auth.jwt()', 'EXECUTE') jwt,
                  has_function_privilege('tenant_guard', 'authz.has_membership(uuid, authz.membership_role[])', 'EXECUTE') has_membership,
                  has_function_privilege('tenant_guard', 'authz.has_staff_membership(uuid, authz.staff_role[])', 'EXECUTE') has_staff,
                  has_function_privilege('tenant_guard', 'authz.is_super_admin()', 'EXECUTE') super_admin,
                  has_table_privilege('tenant_guard', 'authz.memberships', 'SELECT') sel,
                  has_table_privilege('tenant_guard', 'authz.memberships', 'INSERT, UPDATE, DELETE, TRUNCATE') write`,
        );
        expect(p).toEqual({
          auth_usage: true,
          authz_usage: true,
          uid: true,
          jwt: true,
          has_membership: true,
          has_staff: true,
          super_admin: false,
          sel: true,
          write: false,
        });
        const own = await as(
          "tenant_guard",
          { sub: "U2" },
          "select array_agg(id order by id) ids from authz.memberships",
        );
        expect(own.code, own.message).toBeNull();
        expect(
          ((own.rows[0]!.ids as string[]) ?? []).map(keyOf).sort(),
        ).toEqual(["m2a", "m2b", "m2c", "m2d"]);
        const none = await as(
          "tenant_guard",
          { sub: null },
          "select count(*)::int n from authz.memberships",
        );
        expect(none.rows[0]!.n).toBe(0);
        const role = await one(
          "select rolcanlogin, rolsuper, rolbypassrls, rolinherit from pg_roles where rolname = 'tenant_guard'",
        );
        expect(role).toEqual({
          rolcanlogin: false,
          rolsuper: false,
          rolbypassrls: false,
          rolinherit: false,
        });
      }));
  });

  // Council round 1, B1: a GRANT by a role without the grant option only
  // warns ("no privileges were granted") and the migration would commit.
  describe("the guard's privileges are asserted in the migration, not assumed", () => {
    const ASSERT = () =>
      postAssert(COMMAND_LANE_MIGRATION, "tenant_guard privileges");

    it("the post-assert passes on the migrated database", () =>
      tx(async () => {
        await db.query(ASSERT());
      }));

    it("a refused grant only warns, and the post-assert then fails the migration", () =>
      tx(async () => {
        await db.query(
          `revoke usage on schema auth from tenant_guard;
           create role acc2674_grantor nologin;
           grant usage on schema auth to acc2674_grantor;`,
        );
        await db.query("set local role acc2674_grantor");
        // No grant option: Postgres warns and grants nothing.
        await db.query("grant usage on schema auth to tenant_guard");
        await db.query("reset role");
        expect(
          (
            await one(
              "select has_schema_privilege('tenant_guard', 'auth', 'USAGE') u",
            )
          ).u,
        ).toBe(false);
        await expect(db.query(ASSERT())).rejects.toMatchObject({
          code: "42501",
          message: expect.stringContaining("USAGE on schema auth"),
        });
      }));

    it.each<[string, string]>([
      ["USAGE on schema auth", "revoke usage on schema auth from tenant_guard"],
      [
        "USAGE on schema authz",
        "revoke usage on schema authz from tenant_guard",
      ],
      [
        "EXECUTE on auth.uid()",
        "revoke execute on function auth.uid() from tenant_guard, public",
      ],
      [
        "EXECUTE on auth.jwt()",
        "revoke execute on function auth.jwt() from tenant_guard, public",
      ],
      [
        "EXECUTE on authz.has_membership(uuid, authz.membership_role[])",
        "revoke execute on function authz.has_membership(uuid, authz.membership_role[]) from tenant_guard, public",
      ],
      [
        "EXECUTE on authz.has_staff_membership(uuid, authz.staff_role[])",
        "revoke execute on function authz.has_staff_membership(uuid, authz.staff_role[]) from tenant_guard, public",
      ],
      [
        "SELECT on authz.memberships",
        "revoke select on authz.memberships from tenant_guard, public",
      ],
    ])("raises when tenant_guard lacks %s", (item, revoke) =>
      tx(async () => {
        await db.query(revoke);
        await expect(db.query(ASSERT())).rejects.toMatchObject({
          code: "42501",
          message: expect.stringContaining(item),
        });
      }),
    );
  });

  describe("definer hygiene", () => {
    const TRIGGER_FNS = [
      "public.handle_new_user()",
      "public.enforce_contribution_notification_tenant_refs()",
      "public.enforce_contribution_operation_tenant_refs()",
    ];

    it("the three trigger functions are executable by their owner only", () =>
      tx(async () => {
        for (const fn of TRIGGER_FNS) {
          const r = await one(
            `select array(select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
                            from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                           where a.privilege_type = 'EXECUTE' order by 1) g
               from pg_proc p where p.oid = $1::regprocedure`,
            [fn],
          );
          expect([fn, r.g]).toEqual([fn, ["postgres"]]);
        }
      }));

    it("sign-up still creates the profile when the inserting role has no EXECUTE on handle_new_user", () =>
      tx(async () => {
        const user = randomUUID();
        await db.query(
          `create role acc2674_auth_writer nologin;
           grant usage on schema auth to acc2674_auth_writer;
           grant insert on auth.users to acc2674_auth_writer;`,
        );
        expect(
          (
            await one(
              "select has_function_privilege('acc2674_auth_writer', 'public.handle_new_user()', 'EXECUTE') x",
            )
          ).x,
        ).toBe(false);
        await db.query("set local role acc2674_auth_writer");
        await db.query("insert into auth.users (id) values ($1)", [user]);
        await db.query("reset role");
        expect(
          (
            await one(
              "select count(*)::int n from public.profiles where id = $1",
              [user],
            )
          ).n,
        ).toBe(1);
      }));
  });

  describe("a reset script refuses a database that has no marker (WP1 acceptance)", () => {
    const admin = new pg.Client({ connectionString: ADMIN_URL });
    const base = new URL(ADMIN_URL || "postgresql://localhost/postgres");
    const scratch =
      `${base.pathname.slice(1).replace(/[^a-z0-9_]/gi, "_")}_nomarker_${randomBytes(4).toString("hex")}`.toLowerCase();
    const scratchUrl = new URL(base.toString());
    scratchUrl.pathname = `/${scratch}`;
    let created = false;

    beforeAll(async () => {
      await admin.connect();
      await admin.query(`create database ${scratch} template template0`);
      created = true;
    });
    afterAll(async () => {
      try {
        if (created) await admin.query(`drop database ${scratch} with (force)`);
      } finally {
        await admin.end();
      }
    });

    const guard = (url: string) => {
      const r = spawnSync(
        process.execPath,
        [GUARD_CLI, "--url-env", "ACC2674_TARGET"],
        {
          encoding: "utf8",
          env: { ...process.env, ACC2674_TARGET: url },
        },
      );
      return { status: r.status, out: `${r.stdout}${r.stderr}` };
    };
    async function standIn(kind: string | null) {
      const c = new pg.Client({ connectionString: scratchUrl.toString() });
      await c.connect();
      try {
        await c.query(
          `create schema if not exists platform;
           create or replace function platform.environment_kind() returns text language sql as $$ select ${kind === null ? "null" : `'${kind}'`}::text $$;`,
        );
      } finally {
        await c.end();
      }
    }

    it("passes the migrated database, which is marked disposable", () => {
      const r = guard(ADMIN_URL);
      expect(r.status, r.out).toBe(0);
    });

    it("refuses a database with no marker at all, and never prints the password", () => {
      const r = guard(scratchUrl.toString());
      expect(r.status).toBe(1);
      expect(r.out).toContain(
        `/${scratch}: it has no environment marker, so it counts as not disposable`,
      );
      if (scratchUrl.password)
        expect(r.out).not.toContain(`:${scratchUrl.password}@`);
    });

    it.each<[string | null, number, string]>([
      [null, 1, "has no environment marker"],
      ["shared", 1, "is marked shared"],
      ["production", 1, "is marked production"],
      ["disposable", 0, "marked disposable"],
    ])(
      "reads the marker from the target: %s -> exit %d",
      async (kind, status, text) => {
        await standIn(kind);
        const r = guard(scratchUrl.toString());
        expect(r.status, r.out).toBe(status);
        expect(r.out).toContain(text);
      },
    );
  });
});
