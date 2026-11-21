/**
 * AL-2675 (WP2c, part 1; plan 5.1, 5.4 and 12 WP2c) real-stack acceptance for
 * the platform operator list and the shared operator check:
 *   - "The operator list has row security forced and no privilege for
 *     signed-in or anonymous users" (plan 5.4);
 *   - the one read function says whether the caller is on the list, and
 *     answers "no" without raising for anyone else (plan 5.4);
 *   - the shared check refuses a person who is not on the list, refuses an
 *     operator whose session has no second factor and passes an operator
 *     whose session has one (plan 12, WP2c acceptance). Here the assurance
 *     level is the request's claim, as PostgREST sets it; the Auth server's
 *     own enrolment and challenge are proved by
 *     `tests/unit/acceptance/issue-2675/operator-mfa.localstack.test.ts`;
 *   - `platform.caller_on_operator_list()` keeps stage 1's signature, owner
 *     and grants (record section 9).
 *
 * Runs against the migrated database named by
 * TENANT_GUARD_IT_ADMIN_DATABASE_URL; without it the block skips, except in
 * the CI `migrate` job, where it fails. Every check runs in its own
 * transaction, always rolled back; callers are emulated as PostgREST does it
 * (../issue-2674/harness.ts).
 */
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, asRole } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const NOT_OPERATOR = "platform: the caller is not a platform operator";
const NO_SECOND_FACTOR =
  "platform: a platform command needs a session verified with a second factor";
const NO_CALLER = "platform: a platform command needs a signed-in caller";

describe.skipIf(!ADMIN_URL)(
  "AL-2675 WP2c: the operator list and the shared operator check (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    let id: Record<string, string> = {};
    const as = asRole(db, new Proxy({}, { get: (_t, k: string) => id[k] }));

    beforeAll(() => db.connect());
    afterAll(() => db.end());

    /** One check = one transaction: OP is on the list, PERSON is not. */
    async function tx(fn: () => Promise<void>) {
      id = { OP: randomUUID(), PERSON: randomUUID() };
      await db.query("begin");
      try {
        await db.query("insert into auth.users (id) values ($1), ($2)", [
          id.OP,
          id.PERSON,
        ]);
        await db.query(
          "insert into authz.platform_operators (user_id, added_by, reason) values ($1, 'acceptance', 'WP2c fixture')",
          [id.OP],
        );
        await fn();
      } finally {
        await db.query("rollback");
      }
    }

    async function one(sql: string, params: unknown[] = []) {
      return (await db.query(sql, params)).rows[0] as Record<string, unknown>;
    }

    /** Owner, rights, search path and EXECUTE grantees other than the owner. */
    async function shape(signature: string) {
      return one(
        `select p.proowner::regrole::text as owner, p.prosecdef as definer, p.proconfig as config,
                pg_get_function_result(p.oid) as result,
                array(select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
                        from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                       where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner
                       order by 1) as grantees
           from pg_proc p where p.oid = $1::regprocedure`,
        [signature],
      );
    }

    it("the list has row security forced, no policy and no privilege for anyone but its owner", () =>
      tx(async () => {
        const table = await one(
          `select c.relowner::regrole::text as owner, c.relrowsecurity as rls, c.relforcerowsecurity as forced,
                  (select count(*)::int from pg_policy p where p.polrelid = c.oid) as policies,
                  array(select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
                          from aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a
                         where a.grantee <> c.relowner order by 1) as grantees,
                  array(select a.attname::text from pg_attribute a
                         where a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
                           and a.attacl is not null order by 1) as column_grants
             from pg_class c where c.oid = 'authz.platform_operators'::regclass`,
        );
        expect(table).toEqual({
          owner: "postgres",
          rls: true,
          forced: true,
          policies: 0,
          grantees: [],
          column_grants: [],
        });
        for (const role of ["anon", "authenticated", "service_role"])
          for (const sql of [
            "select * from authz.platform_operators",
            "insert into authz.platform_operators (user_id, added_by, reason) select id, 'x', 'x' from auth.users limit 1",
            "delete from authz.platform_operators",
          ]) {
            const out = await as(role, { sub: "OP", aal: "aal2" }, sql);
            expect([role, sql, out.code]).toEqual([role, sql, "42501"]);
          }
      }));

    it("a login on the list cannot be deleted while it is there", () =>
      tx(async () => {
        await db.query("savepoint del");
        await expect(
          db.query("delete from auth.users where id = $1", [id.OP]),
        ).rejects.toMatchObject({ code: "23503" });
        await db.query("rollback to savepoint del");
      }));

    it("the read function answers true for an operator and false, without raising, for anyone else, at either level", () =>
      tx(async () => {
        for (const aal of ["aal1", "aal2"]) {
          const op = await as(
            "authenticated",
            { sub: "OP", aal },
            "select public.caller_is_platform_operator() as v",
          );
          expect([aal, op.code, op.rows]).toEqual([aal, null, [{ v: true }]]);
          const person = await as(
            "authenticated",
            { sub: "PERSON", aal },
            "select public.caller_is_platform_operator() as v",
          );
          expect([aal, person.code, person.rows]).toEqual([
            aal,
            null,
            [{ v: false }],
          ]);
        }
        const noSession = await as(
          "authenticated",
          { sub: null },
          "select public.caller_is_platform_operator() as v",
        );
        expect([noSession.code, noSession.rows]).toEqual([
          null,
          [{ v: false }],
        ]);
        for (const role of ["anon", "service_role"]) {
          const out = await as(
            role,
            { sub: "OP", aal: "aal2" },
            "select public.caller_is_platform_operator() as v",
          );
          expect([role, out.code]).toEqual([role, "42501"]);
        }
      }));

    it("the read function is a postgres-owned definer in public with an empty search path, for signed-in users only", () =>
      tx(async () => {
        expect(await shape("public.caller_is_platform_operator()")).toEqual({
          owner: "postgres",
          definer: true,
          config: ['search_path=""'],
          result: "boolean",
          grantees: ["authenticated"],
        });
      }));

    it("the shared check refuses a person who is not on the list, at either level", () =>
      tx(async () => {
        for (const fn of [
          "public.platform_operator_session()",
          "platform.operator_session()",
        ])
          for (const aal of ["aal1", "aal2"]) {
            const out = await as(
              "authenticated",
              { sub: "PERSON", aal },
              `select ${fn} as r`,
            );
            expect([fn, aal, out.code, out.message]).toEqual([
              fn,
              aal,
              "42501",
              NOT_OPERATOR,
            ]);
          }
      }));

    it("the shared check refuses an operator whose session has no second factor", () =>
      tx(async () => {
        for (const caller of [{ aal: "aal1" }, {}]) {
          const out = await as(
            "authenticated",
            { sub: "OP", ...caller },
            "select public.platform_operator_session() as r",
          );
          expect([out.code, out.message]).toEqual(["42501", NO_SECOND_FACTOR]);
        }
      }));

    it("the shared check passes an operator whose session has the second factor, and returns the operator", () =>
      tx(async () => {
        const out = await as(
          "authenticated",
          { sub: "OP", aal: "aal2" },
          "select public.platform_operator_session() as r",
        );
        expect(out.code, out.message).toBeNull();
        expect(out.rows).toEqual([{ r: { operator_id: id.OP } }]);
      }));

    it("the shared check refuses a removed operator at the next call", () =>
      tx(async () => {
        await db.query(
          "delete from authz.platform_operators where user_id = $1",
          [id.OP],
        );
        const out = await as(
          "authenticated",
          { sub: "OP", aal: "aal2" },
          "select public.platform_operator_session() as r",
        );
        expect([out.code, out.message]).toEqual(["42501", NOT_OPERATOR]);
        const read = await as(
          "authenticated",
          { sub: "OP", aal: "aal2" },
          "select public.caller_is_platform_operator() as v",
        );
        expect(read.rows).toEqual([{ v: false }]);
      }));

    it("the shared check refuses a request with no signed-in caller, and anyone but a signed-in user", () =>
      tx(async () => {
        const out = await as(
          "authenticated",
          { sub: null },
          "select public.platform_operator_session() as r",
        );
        expect([out.code, out.message]).toEqual(["42501", NO_CALLER]);
        for (const role of ["anon", "service_role"]) {
          const denied = await as(
            role,
            { sub: "OP", aal: "aal2" },
            "select public.platform_operator_session() as r",
          );
          expect([role, denied.code]).toEqual([role, "42501"]);
        }
      }));

    it("caller_on_operator_list keeps stage 1's signature, owner and grants, and reads the list for the session caller", () =>
      tx(async () => {
        expect(await shape("platform.caller_on_operator_list()")).toEqual({
          owner: "postgres",
          definer: false,
          config: ['search_path=""'],
          result: "boolean",
          grantees: [],
        });
        // As the owner, which is how a platform command calls it.
        for (const [who, expected] of [
          ["OP", true],
          ["PERSON", false],
        ] as const) {
          await db.query("savepoint c");
          await db.query(
            "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', '', true)",
            [JSON.stringify({ sub: id[who], role: "authenticated" })],
          );
          const r = await one("select platform.caller_on_operator_list() as v");
          await db.query("rollback to savepoint c");
          expect([who, r.v]).toEqual([who, expected]);
        }
      }));

    it("the shared check names nothing in auth, and the command and its wrapper follow the platform convention", () =>
      tx(async () => {
        expect(await shape("platform.operator_session()")).toEqual({
          owner: "postgres",
          definer: true,
          config: ['search_path=""'],
          result: "jsonb",
          grantees: ["authenticated"],
        });
        expect(await shape("public.platform_operator_session()")).toEqual({
          owner: "postgres",
          definer: false,
          config: ['search_path=""'],
          result: "jsonb",
          grantees: ["authenticated"],
        });
        const bodies = await one(
          `select string_agg(p.prosrc, ' ') as src from pg_proc p
             where p.oid in ('platform.caller_on_operator_list()'::regprocedure,
                             'platform.require_operator()'::regprocedure,
                             'platform.operator_session()'::regprocedure)`,
        );
        expect(String(bodies.src)).not.toMatch(/(?<![\w$."])"?auth"?\s*\./i);
      }));
  },
);
