import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import pg from "pg";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

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

it("documents the server-minted key as this release's exception", () => {
  const doc = readFileSync("docs/security/tenant-guard.md", "utf8").replace(
    /\s+/g,
    " ",
  );
  expect(doc).toContain(
    "A request that sends no `Idempotency-Key` gets a key the server mints for it, so a retry of that request is not idempotent: this is kept for this release only, for browser tabs still on the previous build, and refusing a request without the header is owed to a later release.",
  );
  expect(
    readFileSync("docs/security/tenant-guard.md", "utf8")
      .split("\n")
      .filter(
        (line) =>
          line.startsWith("5. ") &&
          line.includes("The one platform command so far"),
      ),
  ).toEqual([]);
});

const LEGACY_PROFILE_ROWS =
  "alter table public.profiles drop constraint profiles_user_id_matches_id, alter column user_id drop not null";
const SUITE_TITLE =
  "the CRM note command (D-18: AL-2676: human commands require x-asym-tenant)";

describe.skipIf(!ADMIN_URL)(SUITE_TITLE, () => {
  let db: pg.Client;
  let id: Record<string, string>;

  async function act(
    role: string,
    user: string | null,
    assignment: string | null,
    sql: string,
    params: unknown[] = [],
    tenant?: string,
  ) {
    await db.query("savepoint act");
    try {
      await db.query(`set local role ${role}`);
      const headers: Record<string, string> = {};
      if (tenant) headers["x-asym-tenant"] = tenant;
      if (assignment) headers["x-asym-assignment"] = id[assignment]!;
      await db.query(
        "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', '', true), set_config('request.headers', $2, true)",
        [
          user ? JSON.stringify({ sub: id[user], role }) : "",
          JSON.stringify(headers),
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
    const tenant = note.tenant ?? id.TA;
    return act(
      "authenticated",
      user,
      assignment,
      "select public.create_crm_note($1, $2, $3, $4, $5, $6, $7, $8, $9) as result",
      [
        tenant,
        note.key === undefined ? randomUUID() : note.key,
        note.title ?? "Meeting",
        note.body ?? "Summary",
        note.visibility === undefined ? "standard" : note.visibility,
        note.linkedId ?? null,
        note.linkedType ?? null,
        note.linkedLabel ?? null,
        randomUUID(),
      ],
      tenant,
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

  it("keeps one key apart in two tenants", async () => {
    const key = randomUUID();
    expect((await create("UDEV", "mDev", { key })).code).toBeNull();
    await db.query("select set_config('app.current_tenant_id', '', true)");
    expect(
      (await create("UDEV", "mDevB", { key, tenant: id.TB })).code,
    ).toBeNull();
    const rows = await written(key);
    expect(rows.notes.map((note) => note.tenant_id).sort()).toEqual(
      [id.TA, id.TB].sort(),
    );
    expect(rows.logs.map((log) => log.tenant_id).sort()).toEqual(
      [id.TA, id.TB].sort(),
    );
    for (const tenant of [id.TA, id.TB]) {
      const note = rows.notes.find((row) => row.tenant_id === tenant);
      expect(rows.logs.find((row) => row.tenant_id === tenant)).toMatchObject({
        resource_id: note.id,
      });
    }
  });

  it("applies the same rules when the inner command is called directly", async () => {
    const call = (
      user: string,
      assignment: string,
      tenant: string,
      key: string,
    ) =>
      act(
        "authenticated",
        user,
        assignment,
        "select tenant_guard.create_crm_note($1, $2, 'Meeting', 'Summary', 'standard', null, null, null, null) as result",
        [tenant, key],
        tenant,
      );
    const refused = randomUUID();
    expect((await call("UB", "mB", id.TA, refused)).code).toBe("42501");
    expect((await call("UDEV", "mDev", id.TB, refused)).code).toBe("42501");
    expect(await written(refused)).toEqual({ notes: [], logs: [] });
    const key = randomUUID();
    expect((await call("UDEV", "mDev", id.TA, key)).code).toBeNull();
    expect((await written(key)).notes).toEqual([
      expect.objectContaining({ tenant_id: id.TA, author_profile_id: id.UDEV }),
    ]);
    expect(
      (
        await act(
          "authenticated",
          "UDEV",
          "mDev",
          "select tenant_guard.create_crm_note($1, $2, 'Meeting', 'Summary', 'restricted', null, null, null, null)",
          [id.TA, randomUUID()],
          id.TA,
        )
      ).code,
    ).toBe("42501");
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

  it("trims tabs, newlines and other whitespace from what it stores", async () => {
    const key = randomUUID();
    expect(
      (
        await create("UDEV", "mDev", {
          key,
          title: "\t Meeting\n",
          body: "\r\n Summary \t",
          linkedId: "\t",
          linkedType: "donor_profile",
          linkedLabel: "\n Donor \t",
        })
      ).code,
    ).toBeNull();
    expect((await written(key)).notes).toEqual([
      expect.objectContaining({
        title: "Meeting",
        body: "Summary",
        linked_record_id: null,
        linked_record_label: "Donor",
      }),
    ]);
  });

  it("refuses an invalid note before it writes", async () => {
    for (const note of [
      { key: null },
      { title: "  " },
      { title: "\t\n" },
      { title: "x".repeat(161) },
      { body: "" },
      { body: "\n\t \r" },
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

  it("takes the author from a profile whose id is the caller and whose user_id is empty (D-18, AL-2678: since W5-R3 a profile's user_id equals its id, so the legacy row is planted with that check lifted inside the test's rolled-back transaction)", async () => {
    await db.query(LEGACY_PROFILE_ROWS);
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

  it("finds the caller's profile through a private helper that only the guard may execute (D-18, AL-2678: since W5-R3 a profile's user_id equals its id, so the legacy row is planted with that check lifted inside the test's rolled-back transaction)", async () => {
    await db.query(LEGACY_PROFILE_ROWS);
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
    expect((await ask("UB")).rows).toEqual([{ profile: null }]);
    for (const role of ["authenticated", "anon", "service_role"])
      expect(
        (await act(role, "UDEV", null, "select private.caller_profile_id()"))
          .code,
        role,
      ).toBe("42501");
  });

  it("never takes a profile linked to another user as the caller's own (D-18, AL-2678: since W5-R3 a profile's user_id equals its id, so the legacy row is planted with that check lifted inside the test's rolled-back transaction)", async () => {
    await db.query(LEGACY_PROFILE_ROWS);
    await db.query("update public.profiles set user_id = null where id = $1", [
      id.UDEV,
    ]);
    await db.query("update public.profiles set user_id = $1 where id = $2", [
      id.UDEV,
      id.UB,
    ]);
    const refused = randomUUID();
    expect(
      (await create("UB", "mB", { key: refused, tenant: id.TB })).code,
    ).toBe("42501");
    expect(await written(refused)).toEqual({ notes: [], logs: [] });
    await db.query("select set_config('app.current_tenant_id', '', true)");
    const linked = randomUUID();
    expect((await create("UDEV", "mDev", { key: linked })).code).toBeNull();
    const rows = await written(linked);
    expect(rows.notes).toEqual([
      expect.objectContaining({ author_profile_id: id.UB }),
    ]);
    expect(rows.logs).toEqual([
      expect.objectContaining({
        actor_profile_id: id.UB,
        actor_user_id: id.UDEV,
      }),
    ]);
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

describe.skipIf(!ADMIN_URL)(
  "the CRM note command against a membership change in flight (committed) (D-18: AL-2676: human commands require x-asym-tenant)",
  () => {
    const admin = new pg.Client({ connectionString: ADMIN_URL });
    const one = new pg.Client({ connectionString: ADMIN_URL });
    const two = new pg.Client({ connectionString: ADMIN_URL });
    const tenant = randomUUID();
    const users: string[] = [];
    let twoPid = 0;

    const CHANGES = {
      demotion:
        "update authz.memberships set is_tenant_admin = false where id = $1",
      revocation:
        "update authz.memberships set is_active = false, revoked_at = now() where id = $1",
    } as const;

    beforeAll(async () => {
      await Promise.all([admin.connect(), one.connect(), two.connect()]);
      twoPid = (await two.query("select pg_backend_pid() as p")).rows[0]!.p;
      await admin.query(
        "insert into public.tenants (id, name, slug) values ($1, 'wp4a2b race', $2)",
        [tenant, `wp4a2b-race-${tenant}`],
      );
    });

    afterAll(async () => {
      try {
        await admin.query("rollback");
        await one.query("rollback");
        await two.query("rollback");
        await admin.query("begin");
        await admin.query(
          "delete from public.crm_command_logs where tenant_id = $1",
          [tenant],
        );
        await admin.query("delete from public.crm_notes where tenant_id = $1", [
          tenant,
        ]);
        await admin.query(
          "delete from authz.memberships where tenant_id = $1 or user_id = any($2::uuid[])",
          [tenant, users],
        );
        await admin.query("delete from public.tenants where id = $1", [tenant]);
        await admin.query("delete from auth.users where id = any($1::uuid[])", [
          users,
        ]);
        await admin.query("commit");
      } finally {
        await Promise.all([admin.end(), one.end(), two.end()]);
      }
    });

    beforeEach(async () => {
      await admin.query("rollback");
      await one.query("rollback");
      await two.query("rollback");
    });

    async function administrator() {
      const user = randomUUID();
      const assignment = randomUUID();
      users.push(user);
      await admin.query("insert into auth.users (id) values ($1)", [user]);
      await admin.query("delete from authz.memberships where user_id = $1", [
        user,
      ]);
      await admin.query(
        "insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin) values ($1, $2, $3, 'staff', 'development', true)",
        [assignment, user, tenant],
      );
      return { user, assignment };
    }

    async function begin(
      client: pg.Client,
      person: { user: string; assignment: string },
    ) {
      await client.query("begin");
      await client.query("set local role authenticated");
      await client.query(
        "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', '', true), set_config('request.headers', $2, true)",
        [
          JSON.stringify({ sub: person.user, role: "authenticated" }),
          JSON.stringify({
            "x-asym-tenant": tenant,
            "x-asym-assignment": person.assignment,
          }),
        ],
      );
    }

    function create(client: pg.Client, key: string) {
      return client
        .query(
          "select public.create_crm_note($1, $2, 'Pastoral', 'Sensitive detail', 'restricted', null, null, null, null) as result",
          [tenant, key],
        )
        .then(
          (r) => ({
            code: null as string | null,
            result: r.rows[0].result as {
              duplicate: boolean;
              note: { id: string; body: string };
            } | null,
          }),
          (e: { code?: string }) => ({ code: e.code ?? "?", result: null }),
        );
    }

    async function waitsOnLock() {
      for (let i = 0; i < 100; i += 1) {
        const r = await admin.query(
          "select wait_event_type from pg_stat_activity where pid = $1",
          [twoPid],
        );
        if (r.rows[0]?.wait_event_type === "Lock") return true;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return false;
    }

    async function stored(key: string) {
      const r = await admin.query(
        "select (select count(*)::int from public.crm_notes where tenant_id = $1 and idempotency_key = $2) as notes, (select count(*)::int from public.crm_command_logs where tenant_id = $1 and idempotency_key = $2) as logs",
        [tenant, key],
      );
      return r.rows[0];
    }

    it.each([
      ["demotion", "commits", "fresh"],
      ["demotion", "commits", "retry"],
      ["revocation", "commits", "fresh"],
      ["revocation", "commits", "retry"],
      ["demotion", "rolls back", "fresh"],
      ["demotion", "rolls back", "retry"],
      ["revocation", "rolls back", "fresh"],
      ["revocation", "rolls back", "retry"],
    ] as const)(
      "waits for a %s that holds the caller's assignment; when it %s, a %s restricted note is refused or proceeds on the committed row",
      async (change, outcome, kind) => {
        const person = await administrator();
        const key = randomUUID();
        if (kind === "retry") {
          await begin(one, person);
          expect((await create(one, key)).code).toBeNull();
          await one.query("commit");
        }
        await admin.query("begin");
        await admin.query(CHANGES[change], [person.assignment]);
        await begin(two, person);
        const pending = create(two, key);
        expect(await waitsOnLock()).toBe(true);
        await admin.query(outcome === "commits" ? "commit" : "rollback");
        const reply = await pending;
        const before = kind === "retry" ? 1 : 0;
        if (outcome === "commits") {
          expect(reply).toEqual({ code: "42501", result: null });
          await two.query("rollback");
          expect(await stored(key)).toEqual({ notes: before, logs: before });
        } else {
          expect(reply.code).toBeNull();
          expect(reply.result?.duplicate).toBe(kind === "retry");
          await two.query("commit");
          expect(await stored(key)).toEqual({ notes: 1, logs: 1 });
        }
      },
    );

    it.each([
      ["demotion", "rolls back"],
      ["demotion", "commits"],
      ["revocation", "rolls back"],
      ["revocation", "commits"],
    ] as const)(
      "lets no %s take the assignment while a retry waits on the first submission; when that %s, the retry acts on the authority it holds",
      async (change, outcome) => {
        const person = await administrator();
        const key = randomUUID();
        await begin(one, person);
        expect((await create(one, key)).code).toBeNull();
        await begin(two, person);
        const pending = create(two, key);
        expect(await waitsOnLock()).toBe(true);
        await admin.query("begin");
        await admin.query("set local lock_timeout = '300ms'");
        const attempt = await admin
          .query(CHANGES[change], [person.assignment])
          .then(
            () => null,
            (e: { code?: string }) => e.code ?? "?",
          );
        await admin.query("rollback");
        expect(attempt).toBe("55P03");
        await one.query(outcome === "commits" ? "commit" : "rollback");
        const reply = await pending;
        expect(reply.code).toBeNull();
        expect(reply.result?.duplicate).toBe(outcome === "commits");
        await two.query("commit");
        expect(await stored(key)).toEqual({ notes: 1, logs: 1 });
        await admin.query(CHANGES[change], [person.assignment]);
      },
    );
  },
);
