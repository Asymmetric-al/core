import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  USERS,
  asRole,
  fixtureIds,
  fixtureSql,
} from "./harness";
import { confirmPlatformOperator } from "../../../../packages/api/src/shared/platform-operator";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const NOT_OPERATOR = "platform: the caller is not a platform operator";
const NO_SECOND_FACTOR =
  "platform: a platform command needs a session verified with a second factor";
const NOT_REQUEST_TENANT =
  "platform: the organization asked for must be the request's own organization";
const NO_STAFF_ROW =
  "platform: the request has no live staff assignment of the caller in this organization";
const BAD_LIMIT = "platform: the history limit must be from 1 to 200";

const OPERATORS = {
  OX: { name: "Oakley Operator", email: "oakley.operator@example.org" },
  OW: { name: "Wren Operator", email: "wren.operator@example.org" },
  OV: { name: "Vale Operator", email: "vale.operator@example.org" },
  OR: { name: "Rowan Revoked", email: "rowan.revoked@example.org" },
} as const;

const HISTORY_COLUMNS = [
  "action",
  "actor_id",
  "actor_profile_id",
  "actor_role",
  "change_summary",
  "created_at",
  "debug_metadata",
  "decision_summary",
  "evidence_summary",
  "governance_state_version",
  "id",
  "identity_mode",
  "initiator_id",
  "initiator_type",
  "model_role",
  "policy_id",
  "policy_status",
  "redaction_version",
  "result",
  "run_id",
  "subagent_name",
  "target",
  "tenant_id",
  "tool_name",
];

describe.skipIf(!ADMIN_URL)(
  "AL-2675 WP2c rest: the operators' picker list and the history with no organization (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    let id: Record<string, string> = {};
    const as = asRole(db, new Proxy({}, { get: (_t, k: string) => id[k] }));

    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function tx(fn: () => Promise<void>) {
      id = fixtureIds();
      for (const k of [
        ...Object.keys(OPERATORS),
        "TC",
        "mOxA",
        "mOxB",
        "mOwA",
        "mOvB",
        "mOrA",
        "mOxD",
        "mOxR",
        "hW",
        "hS",
        "hT",
      ])
        id[k] = randomUUID();
      const q = (k: string) => `'${id[k]}'`;
      const ops = Object.keys(OPERATORS).map(q).join(", ");
      await db.query("begin");
      try {
        await db.query(fixtureSql(id));
        await db.query(`
          insert into public.tenants (id, name, slug) values (${q("TC")}, 'acc2675 C', 'acc2675-' || ${q("TC")});
          insert into auth.users (id) select unnest(array[${ops}]::uuid[]);
          delete from authz.memberships where user_id = any(array[${ops}]::uuid[]);
          ${Object.entries(OPERATORS)
            .map(
              ([k, p]) =>
                `update public.profiles set display_name = '${p.name}', email = '${p.email}' where user_id = ${q(k)};`,
            )
            .join("\n")}
          insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values
            (${q("mOxA")}, ${q("OX")}, ${q("TA")}, 'staff', 'development', true, true),
            (${q("mOxB")}, ${q("OX")}, ${q("TB")}, 'staff', 'finance', false, true),
            (${q("mOwA")}, ${q("OW")}, ${q("TA")}, 'donor', null, false, true),
            (${q("mOvB")}, ${q("OV")}, ${q("TB")}, 'staff', 'development', false, true),
            (${q("mOrA")}, ${q("OR")}, ${q("TA")}, 'staff', 'hr', false, false),
            (${q("mOxD")}, ${q("OX")}, ${q("TA")}, 'donor', null, false, true),
            (${q("mOxR")}, ${q("OX")}, ${q("TA")}, 'staff', 'hr', false, false);
          insert into authz.platform_operators (user_id, added_by, reason)
            select unnest(array[${ops}]::uuid[]), 'acceptance', 'WP2c rest fixture';
          insert into public.eve_audit_events (id, tenant_id, actor_id, actor_profile_id, identity_mode,
              initiator_type, initiator_id, policy_id, policy_status, action, result,
              evidence_summary, change_summary, decision_summary, created_at, expires_at) values
            (${q("hW")}, null, 'operator:wren', ${q("OW")}, 'admin', 'user', 'wren', 'eve.governance', 'enforced',
              'kill_switch.global.set', 'succeeded', 'Global kill switch', 'Switched off everywhere', 'Allowed', '2999-01-01T00:00:01Z', '2999-07-01T00:00:00Z'),
            (${q("hS")}, null, 'service:retention', null, 'service', 'schedule', 'retention', 'eve.retention', 'enforced',
              'retention.expire', 'succeeded', 'Expired records', 'Removed expired rows', 'Allowed', '2999-01-01T00:00:02Z', '2999-07-01T00:00:00Z'),
            (${q("hT")}, ${q("TA")}, 'operator:oakley', ${q("OX")}, 'admin', 'user', 'oakley', 'eve.governance', 'enforced',
              'kill_switch.tenant.set', 'succeeded', 'Tenant kill switch', 'Switched off in A', 'Allowed', '2999-01-01T00:00:03Z', '2999-07-01T00:00:00Z');`);
        await fn();
      } finally {
        await db.query("rollback");
      }
    }

    const keyOf = (value: unknown) =>
      Object.keys(id).find((k) => id[k] === value) ?? String(value);

    function operators(
      who: string | null,
      tenant: string,
      headers?: Record<string, string>,
      aal = "aal2",
      role = "authenticated",
    ) {
      return as(
        role,
        { sub: who, aal, ...(headers ? { headers } : {}) },
        `select public.tenant_operators('${id[tenant] ?? tenant}') as r`,
      );
    }

    function history(
      who: string | null,
      limit: string,
      aal = "aal2",
      headers?: Record<string, string>,
      role = "authenticated",
    ) {
      return as(
        role,
        { sub: who, aal, ...(headers ? { headers } : {}) },
        `select public.platform_eve_history(${limit}) as r`,
      );
    }

    const scopedTo = (tenant: string) => ({ "x-asym-tenant": id[tenant]! });

    async function accepted(tenant: string, profile: string) {
      await db.query("savepoint accepts");
      try {
        await db.query(
          "select public.assert_eve_launch_profile($1, $2, 'super_admin')",
          [id[tenant], id[profile]],
        );
        return true;
      } catch {
        return false;
      } finally {
        await db.query("rollback to savepoint accepts");
      }
    }

    it("lists exactly the people the launch-permission grant accepts in the request's organization, with the name and e-mail on their profile", () =>
      tx(async () => {
        const out = await operators("OX", "TA", scopedTo("TA"));
        expect([out.code, out.message]).toEqual([null, ""]);
        const listed = out.rows[0]!.r as Array<Record<string, unknown>>;

        const people = [...USERS, ...Object.keys(OPERATORS)];
        const accepts: string[] = [];
        for (const p of people) if (await accepted("TA", p)) accepts.push(p);
        expect(listed.map((o) => keyOf(o.id)).sort()).toEqual(accepts.sort());
        expect(accepts.sort()).toEqual(["OW", "OX"]);

        expect(listed).toEqual([
          {
            id: id.OX,
            display_name: OPERATORS.OX.name,
            email: OPERATORS.OX.email,
          },
          {
            id: id.OW,
            display_name: OPERATORS.OW.name,
            email: OPERATORS.OW.email,
          },
        ]);
      }));

    it("names the request's own organization only (ruling 1): another tenant, no header, a blank or a malformed one are refused", () =>
      tx(async () => {
        const cases: Array<[Record<string, string> | undefined, string]> = [
          [scopedTo("TA"), "TB"],
          [undefined, "TA"],
          [{ "x-asym-tenant": "" }, "TA"],
          [{ "x-asym-tenant": "   " }, "TA"],
          [{ "x-asym-tenant": "not-a-uuid" }, "TA"],
          [{ "x-asym-tenant": `${id.TA}x` }, "TA"],
        ];
        for (const [headers, asked] of cases) {
          const out = await operators("OX", asked, headers);
          const what = `${JSON.stringify(headers)} asking for ${asked}`;
          expect([what, out.code, out.message]).toEqual([
            what,
            "42501",
            NOT_REQUEST_TENANT,
          ]);
        }
        for (const value of [id.TA!.toUpperCase(), ` ${id.TA} `]) {
          const out = await operators("OX", "TA", { "x-asym-tenant": value });
          expect([value, out.code]).toEqual([value, null]);
        }
        const inB = await operators("OX", "TB", scopedTo("TB"));
        expect(inB.code).toBeNull();
        expect(
          (inB.rows[0]!.r as Array<{ id: string }>).map((o) => keyOf(o.id)),
        ).toEqual(["OX", "OV"]);
      }));

    it("refuses an operator at aal1, a person who is not an operator, an operator with no live staff row there, and nobody signed in", () =>
      tx(async () => {
        const refusals: Array<
          [string, () => ReturnType<typeof history>, string]
        > = [
          [
            "OX at aal1, picker",
            () => operators("OX", "TA", scopedTo("TA"), "aal1"),
            NO_SECOND_FACTOR,
          ],
          [
            "OX at aal1, history",
            () => history("OX", "50", "aal1"),
            NO_SECOND_FACTOR,
          ],
          [
            "UADM, administrator of TA, picker",
            () => operators("UADM", "TA", scopedTo("TA")),
            NOT_OPERATOR,
          ],
          [
            "UADM, administrator of TA, history",
            () => history("UADM", "50"),
            NOT_OPERATOR,
          ],
          [
            "OX in TC, where OX holds no row",
            () => operators("OX", "TC", scopedTo("TC")),
            NO_STAFF_ROW,
          ],
          [
            "OW, whose row in TA is a donor row",
            () => operators("OW", "TA", scopedTo("TA")),
            NO_STAFF_ROW,
          ],
          [
            "OR, whose staff row in TA is revoked",
            () => operators("OR", "TA", scopedTo("TA")),
            NO_STAFF_ROW,
          ],
        ];
        for (const [what, call, message] of refusals) {
          const out = await call();
          expect([what, out.code, out.message]).toEqual([
            what,
            "42501",
            message,
          ]);
        }
        for (const [what, out] of [
          [
            "anon, picker",
            await operators(null, "TA", scopedTo("TA"), "aal2", "anon"),
          ],
          [
            "anon, history",
            await history(null, "50", "aal2", undefined, "anon"),
          ],
          [
            "service_role, picker",
            await operators(null, "TA", scopedTo("TA"), "aal2", "service_role"),
          ],
          [
            "service_role, history",
            await history(null, "50", "aal2", undefined, "service_role"),
          ],
        ] as const) {
          expect([what, out.code, out.message]).toEqual([
            what,
            "42501",
            expect.stringMatching(/^permission denied for function /),
          ]);
        }
        const nobody = await history(null, "50");
        expect(nobody.code).toBe("42501");
      }));

    it("F1 (review of #2855): finds the caller's staff row as the organization's other reads do: an organization suspended or closed, or a named assignment that is not that row, gets the one refusal that a caller with no row gets", () =>
      tx(async () => {
        const named = (row: string) => ({
          ...scopedTo("TA"),
          "x-asym-assignment": id[row] ?? row,
        });
        const noRow = await operators("OX", "TC", scopedTo("TC"));
        expect([noRow.code, noRow.message]).toEqual(["42501", NO_STAFF_ROW]);

        for (const headers of [scopedTo("TA"), named("mOxA")]) {
          const answered = await operators("OX", "TA", headers);
          expect([JSON.stringify(headers), answered.code]).toEqual([
            JSON.stringify(headers),
            null,
          ]);
          expect(
            (answered.rows[0]!.r as Array<{ id: string }>).map((o) =>
              keyOf(o.id),
            ),
          ).toEqual(["OX", "OW"]);
        }

        for (const row of ["mOxD", "mOxR", "mOxB", "mAdm", "not-a-uuid"]) {
          const refused = await operators("OX", "TA", named(row));
          expect([row, refused.code, refused.message]).toEqual([
            row,
            "42501",
            NO_STAFF_ROW,
          ]);
        }

        for (const status of ["suspended", "closed"]) {
          await db.query(
            "update public.tenants set status = $1 where id = $2",
            [status, id.TA],
          );
          for (const headers of [scopedTo("TA"), named("mOxA")]) {
            const refused = await operators("OX", "TA", headers);
            expect([status, refused.code, refused.message]).toEqual([
              status,
              "42501",
              NO_STAFF_ROW,
            ]);
          }
          await db.query(
            "update public.tenants set status = 'active' where id = $1",
            [id.TA],
          );
          expect((await operators("OX", "TA", scopedTo("TA"))).code).toBeNull();
        }
      }));

    it("refuses at the next call once the operator is taken off the list, with the same aal2 claims, and the route's operator check says no", () =>
      tx(async () => {
        expect((await operators("OX", "TA", scopedTo("TA"))).code).toBeNull();
        expect((await history("OX", "50")).code).toBeNull();

        await db.query(
          "delete from authz.platform_operators where user_id = $1",
          [id.OX],
        );

        for (const out of [
          await operators("OX", "TA", scopedTo("TA")),
          await history("OX", "50"),
          await as(
            "authenticated",
            { sub: "OX", aal: "aal2" },
            "select public.platform_operator_session() as r",
          ),
        ]) {
          expect([out.code, out.message]).toEqual(["42501", NOT_OPERATOR]);
        }

        const confirmed = await confirmPlatformOperator({
          request: new Request("http://localhost/api/admin/eve", {
            headers: { authorization: "Bearer acceptance" },
          }),
          userId: id.OX!,
          scope: null,
          client: {
            rpc: async (fn: string) => {
              const out = await as(
                "authenticated",
                { sub: "OX", aal: "aal2" },
                `select public.${fn}() as r`,
              );
              return out.code
                ? {
                    data: null,
                    error: { code: out.code, message: out.message },
                  }
                : { data: out.rows[0]!.r, error: null };
            },
          },
        });
        expect(confirmed).toBe(false);
      }));

    it("gives every operator at aal2 every change recorded with no organization, newest first, whoever acted, and never one with an organization", () =>
      tx(async () => {
        for (const [who, headers] of [
          ["OX", undefined],
          ["OX", scopedTo("TA")],
          ["OW", undefined],
          ["OV", scopedTo("TB")],
        ] as const) {
          const out = await history(who, "200", "aal2", headers);
          expect([who, out.code, out.message]).toEqual([who, null, ""]);
          const rows = out.rows[0]!.r as Array<Record<string, unknown>>;
          expect(rows.length).toBeGreaterThanOrEqual(2);
          expect(rows.slice(0, 2).map((r) => keyOf(r.id))).toEqual([
            "hS",
            "hW",
          ]);
          expect(rows.every((r) => r.tenant_id === null)).toBe(true);
          expect(rows.map((r) => r.id)).not.toContain(id.hT);
          const times = rows.map((r) => Date.parse(String(r.created_at)));
          expect(times).toEqual([...times].sort((a, b) => b - a));
          expect(Object.keys(rows[0]!).sort()).toEqual(HISTORY_COLUMNS);
          expect(rows[1]).toMatchObject({
            actor_profile_id: id.OW,
            identity_mode: "admin",
            action: "kill_switch.global.set",
          });
          expect(rows[0]).toMatchObject({
            identity_mode: "service",
            action: "retention.expire",
          });
        }
        const one = await history("OX", "1");
        expect(
          (one.rows[0]!.r as Array<{ id: string }>).map((r) => keyOf(r.id)),
        ).toEqual(["hS"]);
      }));

    it("refuses a limit outside 1 to 200", () =>
      tx(async () => {
        for (const limit of ["0", "201", "-1", "null::integer"]) {
          const out = await history("OX", limit);
          expect([limit, out.code, out.message]).toEqual([
            limit,
            "22023",
            BAD_LIMIT,
          ]);
        }
      }));

    it("is two platform commands owned by postgres with an empty search path, each behind a public invoker wrapper, EXECUTE for authenticated alone", () =>
      tx(async () => {
        const r = await db.query(
          `select p.oid::regprocedure::text as fn, p.proowner::regrole::text as owner,
                  p.prosecdef as definer, p.proconfig as config, l.lanname as language,
                  array(select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
                          from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                         where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner
                         order by 1) as grantees
             from pg_proc p join pg_language l on l.oid = p.prolang
            where p.oid in (to_regprocedure('platform.tenant_operators(uuid)'),
                            to_regprocedure('public.tenant_operators(uuid)'),
                            to_regprocedure('platform.eve_history(integer)'),
                            to_regprocedure('public.platform_eve_history(integer)'))`,
        );
        const rows = [...r.rows].sort((a, b) =>
          a.fn < b.fn ? -1 : a.fn > b.fn ? 1 : 0,
        );
        const common = {
          owner: "postgres",
          config: ['search_path=""'],
          grantees: ["authenticated"],
        };
        expect(rows).toEqual([
          {
            fn: "platform.eve_history(integer)",
            definer: true,
            language: "plpgsql",
            ...common,
          },
          {
            fn: "platform.tenant_operators(uuid)",
            definer: true,
            language: "plpgsql",
            ...common,
          },
          {
            fn: "platform_eve_history(integer)",
            definer: false,
            language: "sql",
            ...common,
          },
          {
            fn: "tenant_operators(uuid)",
            definer: false,
            language: "sql",
            ...common,
          },
        ]);
      }));
  },
);
