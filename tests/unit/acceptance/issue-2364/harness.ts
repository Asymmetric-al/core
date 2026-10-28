/** #2364 r1 (6393840865), pins 6419786982 corrected by 6445921397.
 * Acceptance-owned. Private database lifecycle follows #2402/#2312.
 */
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import pg from "pg";
import { expect } from "vitest";

export const MIG = "supabase/migrations";
export const NAME = "20261026105000_missionaries_server_only_reads.sql";
export const FORWARD = `${MIG}/${NAME}`;
export const OWN = "missionaries own row key read";
export const KEYS = ["id", "profile_id"];
export const read = (p: string) =>
  existsSync(p) ? readFileSync(p, "utf8") : "";
export const code = (s: string) => s.replace(/--[^\n]*|\/\*[\s\S]*?\*\//g, " ");
export const literal = (s: string) => `'${s.replaceAll("'", "''")}'`;
export function git(...args: string[]) {
  const r = spawnSync("git", args, { encoding: "utf8" });
  expect(r.status, `git ${args[0]}`).toBe(0);
  return r.stdout.trim();
}

export class Stack {
  readonly database = `acc2364_${randomUUID().replaceAll("-", "")}`;
  readonly id: Record<string, string> = Object.fromEntries(
    "A B donor missionary other staff foreign pD pM pO pS pB dD dO dB mA mOther mB giftD giftM giftOther giftB"
      .split(" ")
      .map((k) => [k, randomUUID()]),
  );
  readonly admin: pg.Client;
  readonly db: pg.Client;
  readonly url: URL;
  created = false;
  constructor(url: string) {
    this.admin = new pg.Client({ connectionString: url });
    this.url = new URL(url);
    this.url.pathname = `/${this.database}`;
    this.db = new pg.Client({ connectionString: this.url.toString() });
  }
  q(k: string) {
    return literal(this.id[k]!);
  }
  async rows(sql: string, params: unknown[] = []) {
    return (await this.db.query(sql, params)).rows as Record<string, unknown>[];
  }
  async open() {
    await this.admin.connect();
    await this.admin.query(
      `create database ${this.database} template template0`,
    );
    this.created = true;
    // Stop at the real predecessor, rather than simulating old grants on a
    // post-state database. Both sides of each comparison use these same rows.
    for (const file of [
      "scripts/sql/supabase-compat-bootstrap.sql",
      ...readdirSync(MIG)
        .filter((f) => /^\d{14}_.+\.sql$/.test(f) && f < NAME)
        .sort()
        .map((f) => `${MIG}/${f}`),
      "supabase/seed.sql",
    ]) {
      const r = spawnSync(
        process.env.PSQL_BIN?.trim() || "psql",
        [
          this.url.toString(),
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
      // Never echo stderr or the URI: connection errors can contain secrets.
      expect(
        r.status,
        `bootstrap/migration ${file} (${r.error?.name ?? "psql"})`,
      ).toBe(0);
    }
    await this.db.connect();
    // Plain-PG bootstrap omits hosted Supabase's service-role table defaults.
    // Establish that predecessor ACL before measuring preservation; never
    // repair grants after applying the migration under test.
    await this.db.query("grant all on public.missionaries to service_role");
  }
  async close() {
    try {
      await this.db.end();
    } finally {
      try {
        if (this.created)
          await this.admin.query(`drop database ${this.database} with (force)`);
      } finally {
        await this.admin.end();
      }
    }
  }
  async fixture() {
    const q = (k: string) => this.q(k);
    const actors = ["donor", "missionary", "other", "staff", "foreign"];
    // profiles.id references auth.users(id) (profiles_id_fkey), so the distinct
    // profile ids must exist in auth.users too; the handle_new_user trigger then
    // auto-creates a profile per inserted user, which we remove before seeding ours.
    const users = [...actors, "pD", "pM", "pO", "pS", "pB"];
    await this.db.query(`insert into public.tenants(id,name,slug) values
      (${q("A")},'acc2364 A',${q("A")}),(${q("B")},'acc2364 B',${q("B")});
      insert into auth.users(id) values ${users.map((k) => `(${q(k)})`).join(",")};
      delete from public.profiles where id in (${users.map(q).join(",")});
      delete from authz.memberships where user_id in (${users.map(q).join(",")});`);
    for (const [p, user, tenant] of [
      ["pD", "donor", "A"],
      ["pM", "missionary", "A"],
      ["pO", "other", "A"],
      ["pS", "staff", "A"],
      ["pB", "foreign", "B"],
    ])
      await this.db.query(
        "insert into public.profiles(id,user_id,tenant_id,role) values($1,$2,$3,'donor')",
        [this.id[p!], this.id[user!], this.id[tenant!]],
      );
    await this.db
      .query(`insert into authz.memberships(user_id,tenant_id,role,staff_role,is_active) values
      (${q("staff")},${q("A")},'staff','finance',true),(${q("missionary")},${q("A")},'missionary',null,true);
      insert into public.donors(id,tenant_id,profile_id) values
      (${q("dD")},${q("A")},${q("pD")}),(${q("dO")},${q("A")},${q("pO")}),(${q("dB")},${q("B")},${q("pB")});
      insert into public.missionaries(id,tenant_id,profile_id) values
      (${q("mA")},${q("A")},${q("pM")}),(${q("mOther")},${q("A")},${q("pO")}),(${q("mB")},${q("B")},${q("pB")});`);
    for (const table of ["donations", "donor_pledges"])
      for (const [gift, donor, missionary, tenant] of [
        ["giftD", "dD", "mOther", "A"],
        ["giftM", "dO", "mA", "A"],
        ["giftOther", "dO", "mOther", "A"],
        ["giftB", "dB", "mB", "B"],
      ])
        await this.db.query(
          `insert into public.${table}(id,donor_id,missionary_id,tenant_id,amount) values($1,$2,$3,$4,10000)`,
          [
            this.id[gift!],
            this.id[donor!],
            this.id[missionary!],
            this.id[tenant!],
          ],
        );
  }
  async tx(fn: () => Promise<void>) {
    await this.db.query("begin");
    try {
      await this.fixture();
      await fn();
    } finally {
      await this.db.query("rollback");
    }
  }
  async apply() {
    expect(read(FORWARD), `missing #2364 migration: ${FORWARD}`).not.toBe("");
    // Keep the harness transaction; execute the actual body (including asserts).
    await this.db.query(
      read(FORWARD).replace(/^\s*(BEGIN|COMMIT)\s*;\s*$/gim, ""),
    );
  }
  async as(
    role: "anon" | "authenticated" | "service_role",
    actor: string | null,
    sql: string,
  ) {
    await this.db.query("savepoint actor");
    try {
      await this.db.query(`set local role ${role}`);
      const sub = actor ? this.id[actor] : "";
      const tenant = actor === "foreign" ? this.id.B : this.id.A;
      await this.db.query(
        `select set_config('request.jwt.claim.sub',$1,true),
        set_config('request.jwt.claims',$2,true), set_config('request.jwt.claim.role',$3,true),
        set_config('app.current_tenant_id',$4,true)`,
        [
          sub,
          JSON.stringify({
            sub: sub || null,
            role,
            app_metadata: { tenant_id: tenant },
          }),
          role,
          tenant,
        ],
      );
      return { rows: await this.rows(sql), code: null };
    } catch (e) {
      return {
        rows: [],
        code: (e as { code?: string }).code ?? "unexpected error",
      };
    } finally {
      await this.db.query(
        "rollback to savepoint actor; release savepoint actor",
      );
    }
  }
  async catalog() {
    return {
      policies: await this
        .rows(`select tablename, policyname, permissive, cmd, roles::text[], qual, with_check
        from pg_policies where schemaname='public' and tablename in ('missionaries','donations','donor_pledges') order by 1,2`),
      table: await this
        .rows(`select case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end as role,
        a.privilege_type from pg_class c cross join lateral aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a
        where c.oid='public.missionaries'::regclass order by 1,2`),
      columns: await this
        .rows(`select a.attname, case when x.grantee=0 then 'PUBLIC' else x.grantee::regrole::text end as role,
        x.privilege_type from pg_attribute a cross join lateral aclexplode(a.attacl) x
        where a.attrelid='public.missionaries'::regclass order by 1,2,3`),
      rls: await this.rows(
        "select relrowsecurity,relforcerowsecurity from pg_class where oid='public.missionaries'::regclass",
      ),
      realtime: await this.rows(
        "select tablename from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='missionaries'",
      ),
    };
  }
  async gifts(actor: string, table: string) {
    const r = await this.as(
      "authenticated",
      actor,
      `select * from public.${table} where id in (${["giftD", "giftM", "giftOther", "giftB"].map((k) => this.q(k)).join(",")}) order by id`,
    );
    expect(r.code, `${actor} SELECT * ${table}`).toBeNull();
    return r.rows;
  }
}
