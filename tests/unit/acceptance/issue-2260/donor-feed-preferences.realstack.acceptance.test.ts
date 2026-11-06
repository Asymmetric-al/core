/**
 * #2260 real-stack acceptance (spec r2 = issue comment 6386169035, edited in
 * place with addendum 6407195511; r1 approved with all defaults in 6386178623):
 * criteria 1-16. Runs in CI `migrate` step "Verify tenant isolation (real
 * stack)" through that step's explicit path list (In 6). The PG17 superuser
 * URL TENANT_GUARD_IT_ADMIN_DATABASE_URL only creates and drops a private
 * database (#2400 OQ2), built like CI with the compatibility bootstrap, every
 * forward migration and the seed; the migration re-runs (12, 13, 15) never
 * lock tables in the shared database. Without the URL the DB block skips,
 * except in the CI `migrate` job, where it fails.
 *
 * Every check is one transaction, always rolled back, with the fixture created
 * inside it. Calls emulate PostgREST: SET LOCAL ROLE plus request.jwt.claims
 * (read by auth.jwt()) and request.jwt.claim.sub (read by auth.uid()).
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, readdirSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { MIGRATION, POLICIES, migrationBatch } from "./harness";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";
const T = "public.donor_feed_preferences";
const PRIVS = [
  "SELECT",
  "INSERT",
  "UPDATE",
  "DELETE",
  "TRUNCATE",
  "REFERENCES",
  "TRIGGER",
];
/** Criterion 12: the exact ACL after the migration (service_role is compared before/after instead). */
const ACL = {
  anon: [],
  authenticated: ["INSERT", "SELECT", "UPDATE"],
  PUBLIC: [],
};

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("#2260 donor_feed_preferences own rows (R)", () => {
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  // Generated identifier contains only ASCII letters, digits and underscores.
  const database = `acc2260_${randomUUID().replaceAll("-", "")}`;
  const url = new URL(ADMIN_URL || "postgresql://localhost/postgres");
  url.pathname = `/${database}`;
  const db = new pg.Client({ connectionString: url.toString() });
  let created = false;
  const u = () => randomUUID();
  /** Tenants A/B; U1, U2 donors in A; U3 donor in B; S staff in A (no donor); one row per donor. */
  const id: Record<string, string> = {};
  for (const k of "A B U1 U2 U3 S D1 D2 D3 P1 P2 P3".split(" ")) id[k] = u();
  const q = (s: string) => `'${id[s]}'`;
  const FIXTURE =
    `insert into public.tenants (id, name, slug) values (:A, 'acc2260 A', 'acc2260-' || :A), (:B, 'acc2260 B', 'acc2260-' || :B);
    insert into auth.users (id) values (:U1), (:U2), (:U3), (:S);
    insert into public.profiles (id, user_id, tenant_id, role) values (:U1, :U1, :A, 'donor'), (:U2, :U2, :A, 'donor'), (:U3, :U3, :B, 'donor'), (:S, :S, :A, 'donor')
      on conflict (id) do update set user_id = excluded.user_id, tenant_id = excluded.tenant_id, role = excluded.role;
    insert into authz.memberships (user_id, tenant_id, role, staff_role, is_active) values (:S, :A, 'staff', 'finance', true);
    insert into public.donors (id, tenant_id, profile_id) values (:D1, :A, :U1), (:D2, :A, :U2), (:D3, :B, :U3);
    insert into ${T} (id, donor_id, tenant_id) values (:P1, :D1, :A), (:P2, :D2, :A), (:P3, :D3, :B);`.replace(
      /:([A-Z]\d?)\b/g,
      (_m, k: string) => q(k),
    );

  beforeAll(async () => {
    await admin.connect();
    // Never clone the busy shared database: CREATE DATABASE ... TEMPLATE needs
    // its other sessions disconnected. Build the same schema from template0.
    await admin.query(`CREATE DATABASE ${database} TEMPLATE template0`);
    created = true;
    const files = [
      "scripts/sql/supabase-compat-bootstrap.sql",
      ...readdirSync("supabase/migrations")
        .filter((f) => /^\d{14}_.+\.sql$/.test(f))
        .sort()
        .map((f) => `supabase/migrations/${f}`),
      "supabase/seed.sql",
    ];
    for (const file of files) {
      // Same foundation transaction boundary as CI's supabase-migrations.mjs.
      const r = spawnSync(
        process.env.PSQL_BIN?.trim() || "psql",
        [
          url.toString(),
          "-X",
          "-q",
          "-v",
          "ON_ERROR_STOP=1",
          ...(file.endsWith("/20260214090000_foundation_1_schema.sql")
            ? ["--single-transaction"]
            : []),
          "-f",
          file,
        ],
        { encoding: "utf8", timeout: 30_000 },
      );
      // Do not echo stderr: connection failures may contain credentials.
      expect(
        r.status,
        `migration/bootstrap failed: ${file} (${r.error?.name ?? "psql"})`,
      ).toBe(0);
    }
    await db.connect();
  });
  afterAll(async () => {
    try {
      await db.end();
    } finally {
      try {
        if (created)
          await admin.query(`DROP DATABASE ${database} WITH (FORCE)`);
      } finally {
        await admin.end();
      }
    }
  });

  async function tx(fn: () => Promise<void>) {
    await db.query("begin");
    try {
      await db.query(FIXTURE);
      await fn();
    } finally {
      await db.query("rollback");
    }
  }
  /** JWT claims for `user` with app_metadata.tenant_id = `tenant` (undefined: no tenant_id key). */
  const claims = (user: string, tenant?: string) =>
    JSON.stringify({
      sub: id[user],
      role: "authenticated",
      app_metadata:
        tenant === undefined ? {} : { tenant_id: id[tenant] ?? tenant },
    });
  type Who = { role: string; user?: string; tenant?: string };
  const U1A: Who = { role: "authenticated", user: "U1", tenant: "A" };
  /** One statement as `who`; rolled back unless `keep`. Returns rows, rowCount, SQLSTATE. */
  async function as(who: Who, sql: string, keep = false) {
    await db.query("savepoint q");
    try {
      await db.query(`set local role ${who.role}`);
      await db.query(
        "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', $2, true)",
        who.user ? [claims(who.user, who.tenant), id[who.user]] : ["", ""],
      );
      const r = await db.query(sql);
      await db.query(
        "reset role; select set_config('request.jwt.claims', '', true), set_config('request.jwt.claim.sub', '', true)",
      );
      await db.query(keep ? "release savepoint q" : "rollback to savepoint q");
      return {
        rows: r.rows as Record<string, unknown>[],
        n: r.rowCount,
        code: null,
      };
    } catch (e) {
      await db.query("rollback to savepoint q");
      return {
        rows: [],
        n: null,
        code: (e as { code?: string }).code ?? String(e),
      };
    }
  }
  const ids = async (who: Who, where = "true") =>
    (await as(who, `select id from ${T} where ${where} order by id`)).rows.map(
      (r) => r.id,
    );
  const ins = (donor: string, tenant: string) =>
    `insert into ${T} (donor_id, tenant_id) values (${q(donor)}, ${q(tenant)})`;
  const upd = (set: string, row: string) =>
    `update ${T} set ${set} where id = ${q(row)}`;
  /** Admin delete, so a later INSERT can only fail on RLS (never 23505). */
  const drop = (row: string) =>
    db.query(`delete from ${T} where id = ${q(row)}`);
  /** Re-run the migration file inside the current transaction; returns the error, if any. */
  async function rerun() {
    expect(existsSync(MIGRATION), `${MIGRATION} must exist (In 1)`).toBe(true);
    await db.query("savepoint m");
    try {
      await db.query(migrationBatch());
      await db.query("release savepoint m");
      return null;
    } catch (e) {
      await db.query("rollback to savepoint m");
      return (e as Error).message;
    }
  }
  /** role -> sorted privileges on the table (PUBLIC from the ACL itself). */
  async function acl() {
    const { rows } = await db.query(
      `select r, coalesce(array_agg(p order by p) filter (where has_table_privilege(r, '${T}', p)), '{}') ps
       from unnest(array['anon', 'authenticated', 'service_role']) r, unnest($1::text[]) p group by r
       union all select 'PUBLIC', coalesce((select array_agg(distinct a.privilege_type order by a.privilege_type)
         from pg_class c, aclexplode(c.relacl) a where c.oid = '${T}'::regclass and a.grantee = 0), '{}')`,
      [PRIVS],
    );
    return Object.fromEntries(rows.map((x) => [x.r, x.ps])) as Record<
      string,
      string[]
    >;
  }
  async function exactAcl(serviceRole: string[]) {
    const got = await acl();
    expect(got).toEqual({ ...ACL, service_role: serviceRole });
    const cols = await db.query(
      `select attname, attacl::text from pg_attribute where attrelid = '${T}'::regclass and attacl is not null
       union all select column_name, grantee from information_schema.column_privileges where table_schema = 'public' and table_name = 'donor_feed_preferences' and grantee = 'anon'`,
    );
    expect(cols.rows, "no column-level grant to anon or authenticated").toEqual(
      [],
    );
  }
  async function policyShape() {
    const { rows } = await db.query(
      `select policyname, roles::text, cmd, qual, with_check from pg_policies where schemaname = 'public' and tablename = 'donor_feed_preferences' order by policyname`,
    );
    expect(rows.map((r) => [r.policyname, r.roles, r.cmd])).toEqual(
      Object.entries(POLICIES).map(([n, c]) => [n, "{authenticated}", c]),
    );
    for (const r of rows)
      for (const e of [r.qual, r.with_check].filter(Boolean)) {
        expect(e, r.policyname).toContain("auth.uid()");
        expect(e, r.policyname).toContain("authz.current_tenant_id()");
      }
    expect(
      rows.find((r) => r.cmd === "UPDATE")?.with_check,
      "UPDATE has WITH CHECK",
    ).toBeTruthy();
    const c = await db.query(
      `select relrowsecurity, relforcerowsecurity from pg_class where oid = '${T}'::regclass`,
    );
    expect(c.rows[0]).toEqual({
      relrowsecurity: true,
      relforcerowsecurity: true,
    });
  }
  async function crossUserDenied() {
    expect(await ids(U1A, `id = ${q("P2")}`)).toEqual([]);
    expect((await as(U1A, upd("show_org_posts = false", "P2"))).n).toBe(0);
    await drop("P2");
    expect((await as(U1A, ins("D2", "A"))).code).toBe("42501");
  }
  async function anonDenied() {
    const anon = { role: "anon" };
    for (const sql of [
      `select * from ${T}`,
      ins("D1", "A"),
      upd("show_org_posts = false", "P1"),
      `delete from ${T} where id = ${q("P1")}`,
    ])
      expect((await as(anon, sql)).code, sql).toBe("42501");
  }

  it("1: U1 in tenant A reads exactly U1's row", () =>
    tx(async () => expect(await ids(U1A)).toEqual([id.P1])));

  it("2: U1 upserts its own row; a second upsert updates the same row", () =>
    tx(async () => {
      await drop("P1");
      const up = `insert into ${T} (donor_id, tenant_id, show_org_posts) values (${q("D1")}, ${q("A")}, false)
        on conflict (donor_id, tenant_id) do update set show_org_posts = excluded.show_org_posts returning id`;
      const [a, b] = [await as(U1A, up, true), await as(U1A, up, true)];
      expect([a.code, b.code, b.n]).toEqual([null, null, 1]);
      expect(b.rows[0]?.id).toBe(a.rows[0]?.id);
      const n = await db.query(
        `select count(*)::int n from ${T} where donor_id = ${q("D1")} and tenant_id = ${q("A")}`,
      );
      expect(n.rows[0].n).toBe(1);
    }));

  it("3: U1 updates its own row (1 row)", () =>
    tx(async () =>
      expect((await as(U1A, upd("show_org_posts = false", "P1"))).n).toBe(1),
    ));

  it.each([
    ["no tenant_id", undefined],
    ["a non-UUID tenant_id", "not-a-uuid"],
  ])(
    "4: with %s, U1 reads 0 rows, cannot insert (42501), updates 0 rows",
    (_n, tenant) =>
      tx(async () => {
        const who = { role: "authenticated", user: "U1", tenant };
        expect(await ids(who)).toEqual([]);
        expect((await as(who, upd("show_org_posts = false", "P1"))).n).toBe(0);
        await drop("P1");
        expect((await as(who, ins("D1", "A"))).code).toBe("42501");
      }),
  );

  it("5: U1 cannot read, update or insert U2's row (same tenant)", () =>
    tx(crossUserDenied));

  it("6: U1 cannot see U3's tenant-B row, even filtering on tenant B", () =>
    tx(async () => {
      expect(await ids(U1A, `tenant_id = ${q("B")}`)).toEqual([]);
      expect(await ids(U1A, `id = ${q("P3")}`)).toEqual([]);
    }));

  it("7: U1 cannot write across tenants or donors (42501)", () =>
    tx(async () => {
      expect(
        (await as(U1A, upd(`tenant_id = ${q("B")}`, "P1"))).code,
        "move to B",
      ).toBe("42501");
      expect(
        (await as(U1A, upd(`donor_id = ${q("D2")}`, "P1"))).code,
        "move to U2",
      ).toBe("42501");
      await drop("P1");
      expect((await as(U1A, ins("D1", "B"))).code, "tenant B").toBe("42501");
      await drop("P3");
      expect((await as(U1A, ins("D3", "A"))).code, "tenant-B donor").toBe(
        "42501",
      );
    }));

  it("8: U1 with a JWT tenant B (no donor there) reads 0 rows and cannot insert", () =>
    tx(async () => {
      const who = { role: "authenticated", user: "U1", tenant: "B" };
      expect(await ids(who)).toEqual([]);
      await drop("P1");
      expect((await as(who, ins("D1", "B"))).code).toBe("42501");
      expect((await as(who, ins("D1", "A"))).code).toBe("42501");
    }));

  it("9: staff S in tenant A reads 0 rows", () =>
    tx(async () =>
      expect(
        await ids({ role: "authenticated", user: "S", tenant: "A" }),
      ).toEqual([]),
    ));

  it("10: anon SELECT, INSERT, UPDATE and DELETE raise 42501", () =>
    tx(anonDenied));

  it("11: U1 cannot DELETE its own row or TRUNCATE (42501)", () =>
    tx(async () => {
      expect(
        (await as(U1A, `delete from ${T} where id = ${q("P1")}`)).code,
      ).toBe("42501");
      expect((await as(U1A, `truncate ${T}`)).code).toBe("42501");
    }));

  it("12: exact ACL; service_role keeps the privileges it had before the migration", () =>
    tx(async () => {
      const before = (await acl()).service_role!;
      await exactAcl(before);
      expect(await rerun()).toBeNull();
      await exactAcl(before);
    }));

  it("13: with hosted default grants emulated, re-running the migration restores the ACL; 5 and 10 still deny", () =>
    tx(async () => {
      await db.query(
        `grant all on ${T} to PUBLIC, anon, authenticated, service_role; grant select (show_org_posts) on ${T} to anon`,
      );
      expect(await rerun()).toBeNull();
      await exactAcl(PRIVS.slice().sort());
      await crossUserDenied();
      await anonDenied();
    }));

  it("14: policy shape and RLS flags", () => tx(policyShape));

  it("15: the migration applies a second time; 12 and 14 still hold", () =>
    tx(async () => {
      const before = (await acl()).service_role!;
      expect(await rerun()).toBeNull();
      expect(await rerun()).toBeNull();
      await exactAcl(before);
      await policyShape();
    }));

  it("16: service_role sees every row in tenants A and B", () =>
    tx(async () => {
      // Hosted default privileges give service_role table access; CI's plain DB may not.
      await db.query(`grant select on ${T} to service_role`);
      expect(
        await ids(
          { role: "service_role" },
          `tenant_id in (${q("A")}, ${q("B")})`,
        ),
      ).toEqual([id.P1, id.P2, id.P3].sort());
    }));
});
