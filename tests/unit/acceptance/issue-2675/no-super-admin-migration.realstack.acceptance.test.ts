import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, migration, read } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const SUFFIX = "_wp2c_rest_no_super_admin";
const file = () => migration(SUFFIX);
const version = () => /(\d{14})_/.exec(file())![1]!;
const code = () =>
  read(file())
    .split("\n")
    .filter((line) => !/^\s*--/.test(line))
    .map((line) => line.replace(/\s--.*$/, ""))
    .join("\n");
function downOf(text: string) {
  const lines = text.split("\n");
  const start = lines.indexOf("-- Down begins");
  const end = lines.indexOf("-- Down ends");
  if (start < 0 || end < start) throw new Error("the header has no Down block");
  return lines
    .slice(start + 1, end)
    .map((line) => line.replace(/^-- ?/, ""))
    .join("\n");
}

const BRANCH = "( SELECT authz.is_super_admin() AS is_super_admin)";
const HELPER = "( SELECT authz.staff_read() AS staff_read)";
const BARE =
  "( SELECT authz.assignment_is('staff'::authz.membership_role) AS assignment_is)";
const BASE_SUPER_ADMIN_BRANCH_KEYS = Object.freeze([
  "public.audit_logs authz staff tenant select audit_logs",
  "public.crm_command_logs authz staff tenant select crm_command_logs",
  "public.crm_record_links authz staff tenant select crm_record_links",
  "public.donations donations owner or staff select",
  "public.donor_activities donor activities owner or staff select",
  "public.donor_pledges donor pledges owner or staff select",
  "public.donors donors owner or staff select",
  "public.field_policies field_policies_read",
  "public.notification_queue authz staff tenant select notification_queue",
  "public.pdf_template_artifacts pdf template artifacts select",
  "public.pdf_template_audit_events pdf template audit events select",
  "public.pdf_template_batch_jobs pdf template batch jobs select",
  "public.pdf_template_batches pdf template batches select",
  "public.pdf_template_renders pdf template renders select",
  "public.pdf_template_versions pdf template versions select",
  "public.pdf_templates authz staff tenant select pdf_templates",
  "public.support_agents support hub staff select",
  "public.support_assignments support hub staff select",
  "public.support_audit_log support hub staff select",
  "public.support_automation_rules support hub staff select",
  "public.support_business_hours support hub staff select",
  "public.support_canned_responses support hub staff select",
  "public.support_contacts support contacts select",
  "public.support_conversation_labels support hub staff select",
  "public.support_conversations support hub staff select",
  "public.support_inbox_settings support hub staff select",
  "public.support_inboxes support hub staff select",
  "public.support_labels support hub staff select",
  "public.support_macros support hub staff select",
  "public.support_message_attachments support hub staff select",
  "public.support_messages support hub staff select",
  "public.support_notification_preferences support hub staff select",
  "public.support_saved_views support hub staff select",
  "public.support_signatures support hub staff select",
  "public.support_sla_policies support hub staff select",
  "public.support_teams support hub staff select",
  "public.support_tickets support tickets select",
]);

describe("AL-2675 WP2c rest B: the migration's form", () => {
  it("takes its locks under a limit, creates the helper first, alters the policies by table name and drops the function last, without CASCADE", () => {
    const body = code();
    expect(body).toMatch(
      /^\s*BEGIN;\s*SET LOCAL lock_timeout = '5s';\s*CREATE FUNCTION authz\.staff_read\(\)/,
    );
    const alters = [
      ...body.matchAll(/^ALTER POLICY "([^"]+)" ON public\.([a-z_]+)$/gm),
    ];
    expect(alters).toHaveLength(62);
    expect(body.match(/ALTER POLICY/g)).toHaveLength(62);
    const order = alters.map((m) => `${m[2]} ${m[1]}`);
    expect(order).toEqual([...order].sort());
    const drop = body.indexOf("DROP FUNCTION authz.is_super_admin();");
    expect(drop).toBeGreaterThan(alters.at(-1)!.index);
    expect(body.indexOf("DROP FUNCTION")).toBe(drop);
    expect(
      body.slice(drop + "DROP FUNCTION authz.is_super_admin();".length),
    ).toMatch(/^\s*COMMIT;\s*$/);
    expect(body).not.toMatch(/\bCASCADE\b/i);
  });

  it("carries the recovery header the release job reads, with a read-only check and its version, and a Down", () => {
    const text = read(file());
    const recovery = text.slice(text.indexOf("-- Recovery."));
    expect(text).toContain("-- Recovery.");
    expect(recovery).toContain(version());
    expect(recovery).toMatch(
      /SELECT to_regprocedure\('authz\.staff_read\(\)'\) IS NOT NULL/,
    );
    const down = downOf(text);
    expect(down).toMatch(/^BEGIN;/);
    expect(down).toMatch(/COMMIT;\s*$/);
    expect(down).toContain("CREATE FUNCTION authz.is_super_admin()");
    expect(down).toContain("DROP FUNCTION authz.staff_read();");
  });
});

describe.skipIf(!ADMIN_URL)(
  "AL-2675 WP2c rest B: the migrated catalog and the Down (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());
    const rows = async (sql: string) =>
      (await db.query(sql)).rows as Record<string, unknown>[];
    const POLICIES = `select n.nspname || '.' || c.relname || ' ' || p.polname as key, p.polcmd::text as cmd,
        coalesce(pg_get_expr(p.polqual, p.polrelid), '') as using_text,
        coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') as check_text
      from pg_policy p join pg_class c on c.oid = p.polrelid join pg_namespace n on n.oid = c.relnamespace
      order by 1`;

    it("the helper is an invoker in SQL, STABLE, PARALLEL SAFE, with an empty search path, owned by postgres, for authenticated and service_role only", async () => {
      const [fn] =
        await rows(`select l.lanname, p.provolatile::text v, p.proparallel::text par, p.prosecdef,
          p.proconfig, pg_get_userbyid(p.proowner) owner, pg_get_function_result(p.oid) result,
          has_function_privilege('authenticated', p.oid, 'EXECUTE') authenticated,
          has_function_privilege('service_role', p.oid, 'EXECUTE') service_role,
          has_function_privilege('anon', p.oid, 'EXECUTE') anon,
          exists (select 1 from aclexplode(p.proacl) a where a.grantee = 0) public_execute
        from pg_proc p join pg_language l on l.oid = p.prolang
        where p.oid = to_regprocedure('authz.staff_read()')`);
      expect(fn).toEqual({
        lanname: "sql",
        v: "s",
        par: "s",
        prosecdef: false,
        proconfig: ['search_path=""'],
        owner: "postgres",
        result: "boolean",
        authenticated: true,
        service_role: true,
        anon: false,
        public_execute: false,
      });
    });

    it("the function is gone, no policy of any schema names the role, 59 reads stand on the helper and no write calls it", async () => {
      expect(
        (await rows("select to_regprocedure('authz.is_super_admin()') r"))[0]!
          .r,
      ).toBeNull();
      const all = await rows(POLICIES);
      expect(
        all.filter((p) =>
          /super_admin/i.test(`${p.using_text} ${p.check_text}`),
        ),
      ).toEqual([]);
      const onHelper = all.filter((p) =>
        `${p.using_text} ${p.check_text}`.includes("authz.staff_read()"),
      );
      expect(onHelper.filter((p) => p.cmd !== "r")).toEqual([]);
      expect(onHelper).toHaveLength(59);
    });

    const assertRestoredPolicies = (
      before: Map<string, Record<string, unknown>>,
      after: Record<string, unknown>[],
    ) => {
      const expectedBranches = new Set<string>(BASE_SUPER_ADMIN_BRANCH_KEYS);
      const restoredBranches: string[] = [];
      for (const p of after) {
        const key = p.key as string;
        const was = before.get(key)!;
        expect(was, `${key} existed before`).toBeDefined();
        const back = (was.using_text as string).replaceAll(HELPER, BARE);
        if (expectedBranches.has(key)) {
          restoredBranches.push(key);
          expect(p.using_text, key).toBe(`(${BRANCH} OR ${back})`);
        } else {
          expect(p.using_text, key).toBe(back);
        }
        expect(p.check_text, key).toBe(was.check_text);
      }
      expect(after).toHaveLength(before.size);
      expect(restoredBranches.sort()).toEqual([
        ...BASE_SUPER_ADMIN_BRANCH_KEYS,
      ]);
    };

    const downSql = () =>
      downOf(read(file()))
        .replace(/^BEGIN;/, "")
        .replace(/COMMIT;\s*$/, "");

    it("the Down, run in a transaction that is rolled back, restores the function with its grants and every branch, and drops the helper (D-18, AL-2681 PR 2a: every later migration is first taken off the ledger inside that transaction, since 20261127050000 to 20261127050400 sort after this file)", async () => {
      const before = new Map(
        (await rows(POLICIES)).map((p) => [p.key as string, p]),
      );
      await db.query("begin");
      try {
        await db.query(
          "delete from supabase_migrations.schema_migrations where version > $1",
          [version()],
        );
        await db.query(
          "insert into supabase_migrations.schema_migrations (version) values ($1) on conflict (version) do nothing",
          [version()],
        );
        await db.query(downSql());
        const [fn] =
          await rows(`select l.lanname, p.provolatile::text v, p.proparallel::text par, p.prosecdef,
            p.proconfig, pg_get_userbyid(p.proowner) owner,
            has_function_privilege('authenticated', p.oid, 'EXECUTE') authenticated,
            has_function_privilege('service_role', p.oid, 'EXECUTE') service_role,
            has_function_privilege('anon', p.oid, 'EXECUTE') anon,
            exists (select 1 from aclexplode(p.proacl) a where a.grantee = 0) public_execute
          from pg_proc p join pg_language l on l.oid = p.prolang
          where p.oid = to_regprocedure('authz.is_super_admin()')`);
        expect(fn).toEqual({
          lanname: "sql",
          v: "s",
          par: "s",
          prosecdef: true,
          proconfig: ["search_path=public"],
          owner: "postgres",
          authenticated: true,
          service_role: true,
          anon: false,
          public_execute: false,
        });
        expect(
          (await rows("select to_regprocedure('authz.staff_read()') r"))[0]!.r,
        ).toBeNull();
        assertRestoredPolicies(before, await rows(POLICIES));
      } finally {
        await db.query("rollback");
      }
    });

    it("the Down proof rejects a swapped policy pair in the Down VALUES list (D-18, AL-2681 PR 2a: later migrations taken off the ledger first, inside the transaction)", async () => {
      const before = new Map(
        (await rows(POLICIES)).map((p) => [p.key as string, p]),
      );
      const swapped = downSql().replace(
        "('support_teams', 'support hub staff select')",
        "('funds', 'tenant scoped read')",
      );
      expect(swapped).not.toBe(downSql());
      await db.query("begin");
      try {
        await db.query(
          "delete from supabase_migrations.schema_migrations where version > $1",
          [version()],
        );
        await db.query(
          "insert into supabase_migrations.schema_migrations (version) values ($1) on conflict (version) do nothing",
          [version()],
        );
        await db.query(swapped);
        const after = await rows(POLICIES);
        expect(() => assertRestoredPolicies(before, after)).toThrow();
      } finally {
        await db.query("rollback");
      }
    });

    it("the Down refuses without changing the helper or any policy when a newer migration is recorded, the ledger is empty, or the ledger is missing", async () => {
      const before = await rows(POLICIES);
      const newer = String(BigInt(version()) + 10000n);
      await db.query("begin");
      try {
        const expectRefused = async (setup: string, pattern: RegExp) => {
          await db.query("savepoint guard_case");
          await db.query(setup);
          await db.query("savepoint guard_run");
          await expect(db.query(downSql())).rejects.toThrow(pattern);
          await db.query("rollback to savepoint guard_run");
          expect(
            (await rows("select to_regprocedure('authz.staff_read()') r"))[0]!
              .r,
          ).toBe("authz.staff_read()");
          expect(
            (
              await rows("select to_regprocedure('authz.is_super_admin()') r")
            )[0]!.r,
          ).toBeNull();
          expect(await rows(POLICIES)).toEqual(before);
          await db.query("rollback to savepoint guard_case");
        };
        await expectRefused(
          `delete from supabase_migrations.schema_migrations where version > '${version()}'; insert into supabase_migrations.schema_migrations (version) values ('${version()}'), ('${newer}') on conflict (version) do nothing`,
          /Reverse every later migration first/,
        );
        await expectRefused(
          "delete from supabase_migrations.schema_migrations",
          /newest migration recorded is none/,
        );
        await expectRefused(
          "drop table supabase_migrations.schema_migrations",
          /no migration ledger/,
        );
      } finally {
        await db.query("rollback");
      }
    });
  },
);
