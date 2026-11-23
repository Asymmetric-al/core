import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import pg from "pg";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  fixtureIds,
  fixtureSql,
} from "../issue-2675/harness";
import {
  ANON_DEFINER_ALLOWLIST_PATH,
  TENANT_POLICY_EXCEPTIONS_PATH,
  TENANT_RLS_CATALOG_SQL,
  TENANT_RLS_EXCEPTIONS_PATH,
  evaluateTenantRlsCatalog,
} from "../../../../scripts/verify/tenant-rls-catalog.mjs";

const ARGS = "uuid,uuid,text,text,text,text,text,text,uuid";
const COMMAND = `tenant_guard.create_crm_note(${ARGS})`;
const WRAPPER = `public.create_crm_note(${ARGS})`;

type Note = {
  title?: string;
  body?: string;
  visibility?: string | null;
  linkedId?: string | null;
  linkedType?: string | null;
  linkedLabel?: string | null;
  key?: string | null;
  tenant?: string;
};

const list = (path: string) => JSON.parse(readFileSync(path, "utf8"));

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("requires the migrate database", () =>
  expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("the CRM note command", () => {
  let db: pg.Client;
  let id: Record<string, string>;

  async function act(
    role: string,
    user: string | null,
    assignment: string | null,
    sql: string,
    params: unknown[] = [],
  ) {
    await db.query("savepoint act");
    try {
      await db.query(`set local role ${role}`);
      await db.query(
        "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', '', true), set_config('request.headers', $2, true)",
        [
          user ? JSON.stringify({ sub: id[user], role }) : "",
          JSON.stringify(
            assignment ? { "x-asym-assignment": id[assignment] } : {},
          ),
        ],
      );
      const result = await db.query(sql, params);
      await db.query("reset role");
      await db.query(
        "select set_config('request.jwt.claims', '', true), set_config('request.headers', '', true)",
      );
      await db.query("release savepoint act");
      return { rows: result.rows, code: null as string | null };
    } catch (error) {
      await db.query("rollback to savepoint act");
      return { rows: [], code: (error as { code?: string }).code ?? "?" };
    }
  }

  function create(user: string, assignment: string | null, note: Note = {}) {
    return act(
      "authenticated",
      user,
      assignment,
      "select public.create_crm_note($1, $2, $3, $4, $5, $6, $7, $8, $9) as result",
      [
        note.tenant ?? id.TA,
        note.key === undefined ? randomUUID() : note.key,
        note.title ?? "Meeting",
        note.body ?? "Summary",
        note.visibility === undefined ? "standard" : note.visibility,
        note.linkedId ?? null,
        note.linkedType ?? null,
        note.linkedLabel ?? null,
        randomUUID(),
      ],
    );
  }

  async function written(key: string) {
    const notes = await db.query(
      "select * from public.crm_notes where idempotency_key = $1",
      [key],
    );
    const logs = await db.query(
      "select * from public.crm_command_logs where idempotency_key = $1",
      [key],
    );
    return { notes: notes.rows, logs: logs.rows };
  }

  beforeEach(async () => {
    db = new pg.Client({ connectionString: ADMIN_URL });
    await db.connect();
    await db.query("begin");
    id = fixtureIds();
    id.mDevB = randomUUID();
    await db.query(fixtureSql(id));
    await db.query(
      "insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values ($1, $2, $3, 'staff', 'development', false, true)",
      [id.mDevB, id.UDEV, id.TB],
    );
  });

  afterEach(async () => {
    await db.query("rollback");
    await db.end();
  });

  it("writes the note and one log row in the selected tenant, by the session's caller", async () => {
    const key = randomUUID();
    const result = await create("UDEV", "mDev", {
      key,
      title: `About ${id.TB}`,
      body: `Tenant ${id.TB} and ${id.UADM}`,
      linkedId: id.TB,
      linkedType: "organization",
      linkedLabel: id.TB,
    });
    expect(result.code).toBeNull();
    const reply = result.rows[0].result;
    expect(reply.duplicate).toBe(false);
    const rows = await written(key);
    expect(rows.notes).toEqual([
      expect.objectContaining({
        id: reply.note.id,
        tenant_id: id.TA,
        author_profile_id: id.UDEV,
        linked_record_id: id.TB,
        visibility: "standard",
      }),
    ]);
    expect(rows.logs).toEqual([
      expect.objectContaining({
        id: reply.commandLogId,
        tenant_id: id.TA,
        actor_user_id: id.UDEV,
        actor_profile_id: id.UDEV,
        action: "crm.note.create",
        resource_type: "note",
        resource_id: reply.note.id,
        status: "succeeded",
      }),
    ]);
    const tenantB = await db.query(
      "select (select count(*) from public.crm_notes where tenant_id = $1)::int notes, (select count(*) from public.crm_command_logs where tenant_id = $1)::int logs",
      [id.TB],
    );
    expect(tenantB.rows).toEqual([{ notes: 0, logs: 0 }]);
  });

  it("keeps request content out of the log row", async () => {
    const key = randomUUID();
    const title = `Title ${randomUUID()}`;
    const body = `Body ${randomUUID()}`;
    const label = `Label ${randomUUID()}`;
    expect(
      (
        await create("UADM", "mAdm", {
          key,
          title,
          body,
          visibility: "restricted",
          linkedId: label,
          linkedType: "donor_profile",
          linkedLabel: label,
        })
      ).code,
    ).toBeNull();
    const { logs } = await written(key);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      command_payload: {},
      result_summary: {},
      error_message: null,
    });
    const text = JSON.stringify(logs[0]);
    for (const value of [title, body, label, "restricted", "donor_profile"])
      expect(text).not.toContain(value);
  });

  it("refuses a restricted note without the tenant-administrator flag in the database", async () => {
    const key = randomUUID();
    expect(
      (await create("UDEV", "mDev", { key, visibility: "restricted" })).code,
    ).toBe("42501");
    expect(await written(key)).toEqual({ notes: [], logs: [] });
    expect(
      (await create("UADM", "mAdm", { key, visibility: "restricted" })).code,
    ).toBeNull();
    expect((await written(key)).notes).toEqual([
      expect.objectContaining({ visibility: "restricted" }),
    ]);
  });

  it("refuses a caller whose selected assignment is in another tenant, writing nothing in either", async () => {
    for (const [user, assignment, tenant] of [
      ["UB", "mB", id.TA],
      ["UDEV", "mDev", id.TB],
      ["UDEV", "mDevB", id.TA],
      ["UDON", "mDonA", id.TA],
      ["UREV", "mRev", id.TA],
    ] as const) {
      const key = randomUUID();
      expect(
        (await create(user, assignment, { key, tenant })).code,
        `${user} ${assignment}`,
      ).toBe("42501");
      expect(await written(key)).toEqual({ notes: [], logs: [] });
    }
    const key = randomUUID();
    expect(
      (await create("UDEV", "mDevB", { key, tenant: id.TB })).code,
    ).toBeNull();
    expect((await written(key)).notes).toEqual([
      expect.objectContaining({ tenant_id: id.TB, author_profile_id: id.UDEV }),
    ]);
  });

  it("refuses a suspended tenant before it writes", async () => {
    await db.query(
      "update public.tenants set status = 'suspended' where id = $1",
      [id.TA],
    );
    const key = randomUUID();
    expect((await create("UADM", "mAdm", { key })).code).toBe("42501");
    expect(await written(key)).toEqual({ notes: [], logs: [] });
  });

  it("commits the note and its log row together or not at all", async () => {
    const key = randomUUID();
    await db.query(
      "insert into public.crm_command_logs (tenant_id, actor_user_id, idempotency_key, action, resource_type, status) values ($1, $2, $3, 'fixture', 'note', 'succeeded')",
      [id.TA, id.UADM, key],
    );
    expect((await create("UADM", "mAdm", { key })).code).toBe("23505");
    expect((await written(key)).notes).toEqual([]);
  });

  it("returns the first note for a retry of one submission and refuses the key for another", async () => {
    const key = randomUUID();
    const first = await create("UDEV", "mDev", { key });
    const again = await create("UDEV", "mDev", { key });
    expect(first.code).toBeNull();
    expect(again.code).toBeNull();
    expect(again.rows[0].result).toMatchObject({
      duplicate: true,
      commandLogId: first.rows[0].result.commandLogId,
      note: { id: first.rows[0].result.note.id },
    });
    for (const [user, assignment, note] of [
      ["UDEV", "mDev", { body: "Another submission" }],
      ["UDEV", "mDev", { linkedId: "donor-1", linkedType: "donor_profile" }],
      ["UADM", "mAdm", {}],
    ] as const)
      expect(
        (await create(user, assignment, { key, ...note })).code,
        `${user} ${JSON.stringify(note)}`,
      ).toBe("23505");
    const rows = await written(key);
    expect(rows.notes).toHaveLength(1);
    expect(rows.logs).toHaveLength(1);
  });

  it("refuses an invalid note before it writes", async () => {
    for (const note of [
      { key: null },
      { title: "  " },
      { title: "x".repeat(161) },
      { body: "" },
      { body: "x".repeat(10_001) },
      { visibility: null },
      { visibility: "private" },
      { linkedType: "person" },
      { linkedId: "x".repeat(161) },
      { linkedLabel: "x".repeat(161) },
    ] satisfies Note[]) {
      const key = note.key === null ? null : randomUUID();
      expect(
        (await create("UADM", "mAdm", { ...note, key })).code,
        JSON.stringify(note).slice(0, 80),
      ).toBe("22023");
    }
    const counted = await db.query(
      "select count(*)::int n from public.crm_notes where tenant_id = $1",
      [id.TA],
    );
    expect(counted.rows).toEqual([{ n: 0 }]);
  });

  it("takes the author from a profile whose id is the caller and whose user_id is empty", async () => {
    await db.query("update public.profiles set user_id = null where id = $1", [
      id.UDEV,
    ]);
    const key = randomUUID();
    expect((await create("UDEV", "mDev", { key })).code).toBeNull();
    const rows = await written(key);
    expect(rows.notes).toEqual([
      expect.objectContaining({ author_profile_id: id.UDEV }),
    ]);
    expect(rows.logs).toEqual([
      expect.objectContaining({
        actor_profile_id: id.UDEV,
        actor_user_id: id.UDEV,
      }),
    ]);
  });

  it("finds the caller's profile through a private helper that only the guard may execute", async () => {
    const helper = await db.query(
      "select r.rolname as owner, p.prosecdef as definer, p.proconfig as config, array(select coalesce(nullif(a.grantee, 0)::regrole::text, 'PUBLIC') from aclexplode(p.proacl) as a where a.privilege_type = 'EXECUTE' order by 1) as execute from pg_proc as p join pg_roles as r on r.oid = p.proowner where p.oid = 'private.caller_profile_id()'::regprocedure",
    );
    expect(helper.rows).toEqual([
      {
        owner: "postgres",
        definer: true,
        config: ['search_path=""'],
        execute: ["postgres", "tenant_guard"],
      },
    ]);
    const profiles = await db.query(
      "select has_any_column_privilege('tenant_guard', 'public.profiles', 'SELECT') as reads, (select count(*)::int from pg_policy where polrelid = 'public.profiles'::regclass and 'tenant_guard'::regrole = any(polroles)) as policies",
    );
    expect(profiles.rows).toEqual([{ reads: false, policies: 0 }]);
    const ask = (user: string | null) =>
      act(
        "tenant_guard",
        user,
        null,
        "select private.caller_profile_id() as profile",
      );
    expect((await ask("UDEV")).rows).toEqual([{ profile: id.UDEV }]);
    expect((await ask(null)).rows).toEqual([{ profile: null }]);
    await db.query("update public.profiles set user_id = null where id = $1", [
      id.UDEV,
    ]);
    expect((await ask("UDEV")).rows).toEqual([{ profile: id.UDEV }]);
    await db.query("update public.profiles set user_id = $1 where id = $2", [
      id.UDEV,
      id.UB,
    ]);
    expect((await ask("UDEV")).rows).toEqual([{ profile: id.UB }]);
    for (const role of ["authenticated", "anon", "service_role"])
      expect(
        (await act(role, "UDEV", null, "select private.caller_profile_id()"))
          .code,
        role,
      ).toBe("42501");
  });

  it("is callable only by signed-in users, through a guard-owned definer and a postgres-owned invoker", async () => {
    for (const role of ["anon", "service_role"]) {
      const key = randomUUID();
      const result = await act(
        role,
        null,
        null,
        "select public.create_crm_note($1, $2, 'Meeting', 'Summary', 'standard', null, null, null, null)",
        [id.TA, key],
      );
      expect(result.code, role).toBe("42501");
    }
    const { rows } = await db.query(
      "select n.nspname as schema, r.rolname as owner, p.prosecdef as definer, p.proconfig as config, has_function_privilege('authenticated', p.oid, 'execute') as human, has_function_privilege('service_role', p.oid, 'execute') as worker, has_function_privilege('anon', p.oid, 'execute') as anonymous from pg_proc p join pg_namespace n on n.oid = p.pronamespace join pg_roles r on r.oid = p.proowner where p.oid in ($1::regprocedure, $2::regprocedure) order by n.nspname",
      [WRAPPER, COMMAND],
    );
    expect(rows).toEqual([
      {
        schema: "public",
        owner: "postgres",
        definer: false,
        config: ['search_path=""'],
        human: true,
        worker: false,
        anonymous: false,
      },
      {
        schema: "tenant_guard",
        owner: "tenant_guard",
        definer: true,
        config: ['search_path=""'],
        human: true,
        worker: false,
        anonymous: false,
      },
    ]);
  });

  it("passes the catalog gate's command checks, and variants of it fail them", async () => {
    const judge = async () => {
      const result = await db.query({
        text: TENANT_RLS_CATALOG_SQL,
        rowMode: "array",
      });
      return evaluateTenantRlsCatalog(
        JSON.parse(result.rows[0][0]),
        list(TENANT_RLS_EXCEPTIONS_PATH),
        list(ANON_DEFINER_ALLOWLIST_PATH),
        list(TENANT_POLICY_EXCEPTIONS_PATH),
      ).failures.map(
        (failure: { code: string; function?: string }) =>
          `${failure.code} ${failure.function ?? ""}`,
      );
    };
    expect(await judge()).toEqual([]);
    const source = (
      await db.query("select pg_get_functiondef($1::regprocedure) as def", [
        COMMAND,
      ])
    ).rows[0].def as string;
    const suffix = randomUUID().replaceAll("-", "");
    const variants = {
      unregistered: source.replace("'admin.crm.manage'", "'crm.notes.write'"),
      noCapability: source.replace(", 'admin.crm.manage')", ")"),
      late: source.replace(
        "v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'admin.crm.manage');",
        "v_key := p_idempotency_key::TEXT;\n  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'admin.crm.manage');",
      ),
    };
    const names: Record<string, string> = {};
    for (const [kind, text] of Object.entries(variants)) {
      expect(text, kind).not.toBe(source);
      const name = `tenant_guard.crm_note_${kind.toLowerCase()}_${suffix}`;
      names[kind] = name;
      await db.query(
        text.replace(
          /CREATE OR REPLACE FUNCTION tenant_guard\.create_crm_note\(/,
          `CREATE FUNCTION ${name}(`,
        ),
      );
      await db.query(
        `alter function ${name}(${ARGS}) owner to tenant_guard; revoke all on function ${name}(${ARGS}) from public, anon, authenticated, service_role; grant execute on function ${name}(${ARGS}) to authenticated`,
      );
    }
    const wrapper = `public.crm_note_wrapper_${suffix}`;
    await db.query(
      `create function ${wrapper}(p_tenant_id uuid) returns jsonb language sql security invoker set search_path = '' as $$ select tenant_guard.create_crm_note(p_tenant_id, null, null, null, null, null, null, null, null) $$; revoke all on function ${wrapper}(uuid) from public, anon, authenticated, service_role; grant execute on function ${wrapper}(uuid) to authenticated, service_role`,
    );
    const failures = await judge();
    for (const kind of ["unregistered", "noCapability"])
      expect(failures, kind).toContainEqual(
        expect.stringMatching(
          new RegExp(
            `^COMMAND_CAPABILITY ${names[kind]!.replace(".", "\\.")}\\(`,
          ),
        ),
      );
    expect(failures).toContainEqual(
      expect.stringMatching(
        new RegExp(
          `^COMMAND_HUMAN_NO_PREAMBLE ${names.late!.replace(".", "\\.")}\\(`,
        ),
      ),
    );
    expect(failures).toContainEqual(
      expect.stringMatching(
        new RegExp(`^WRAPPER_GRANTS_HUMAN ${wrapper.replace(".", "\\.")}\\(`),
      ),
    );
  });
});
