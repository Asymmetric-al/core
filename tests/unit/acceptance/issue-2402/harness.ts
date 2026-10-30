/** #2402 r1 + addendum: supports c2/2a-12/15 (private DB, identities, ACLs).
 * Copied isolation design from #2258 e6f7f77f; never write to the admin DB.
 */
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import pg from "pg";
import { expect } from "vitest";

export const MIG = "supabase/migrations";
export const NAME = "20261025125700_crm_table_preference_session_identity.sql";
export const FORWARD = `${MIG}/${NAME}`;
export const ROLLBACK = `${MIG}/rollback_${NAME}`;
export const BASE = "a1375d4651d06f98affe9f5a4cc278edfd29ac30";
export const FNS = [
  "create_crm_table_named_view",
  "update_crm_table_named_view",
  "delete_crm_table_named_view",
  "save_crm_user_table_preference",
  "save_crm_tenant_table_default",
];
export const TABLES = [
  "crm_table_named_views",
  "crm_table_user_preferences",
  "crm_table_tenant_defaults",
  "crm_table_preference_audit_events",
];
export const read = (p: string) =>
  existsSync(p) ? readFileSync(p, "utf8") : "";
export const code = (s: string) => s.replace(/--[^\n]*|\/\*[\s\S]*?\*\//g, " ");
export const batch = (p: string) =>
  read(p).replace(/^\s*(BEGIN|COMMIT)\s*;\s*$/gim, "");
export const literal = (v: unknown): string =>
  v === null
    ? "NULL"
    : typeof v === "boolean" || typeof v === "number"
      ? String(v)
      : `'${(typeof v === "object" ? JSON.stringify(v) : String(v)).replaceAll("'", "''")}'`;
// Positional RPC matrix: create, update, delete, user preference, tenant default.
// prettier-ignore
export const args = (i: number, tenant: string, view: string = randomUUID(), patch: unknown = {}) => [
  [tenant, "crm.giftHistory", "View", false, 1, null, patch],
  [tenant, "crm.giftHistory", view, "Renamed", true, true, true, 1, "resend_receipt", true, patch, true],
  [tenant, "crm.giftHistory", view, null],
  [tenant, "crm.giftHistory", "resend_receipt", true, 1, patch],
  [tenant, "crm.giftHistory", "resend_receipt", true, 1, patch],
][i]!;
export function call(i: number, values: unknown[], profile?: string) {
  const a = [...values];
  if (profile) {
    if (i === 4) a.push(profile, true);
    else a.splice(1, 0, profile);
  }
  return `select to_jsonb(public.${FNS[i]}(${a.map(literal).join(",")})) as value`;
}
export class Stack {
  readonly database = `acc2402_${randomUUID().replaceAll("-", "")}`;
  readonly ids = Object.fromEntries(
    "A B staff admin super donor member inactive other missing"
      .split(" ")
      .map((k) => [k, randomUUID()]),
  );
  readonly profiles = Object.fromEntries(
    Object.keys(this.ids).map((k) => [k, randomUUID()]),
  );
  readonly admin: pg.Client;
  readonly db: pg.Client;
  readonly url: URL;
  original: Record<string, unknown>[] = [];
  created = false;
  closed = false;
  constructor(url: string) {
    this.admin = new pg.Client({ connectionString: url });
    this.url = new URL(url);
    this.url.pathname = `/${this.database}`;
    this.db = new pg.Client({ connectionString: this.url.toString() });
  }
  async rows(sql: string, params: unknown[] = []) {
    return (await this.db.query(sql, params)).rows as Record<string, unknown>[];
  }
  async catalog(schema = "public", names = FNS) {
    return this.rows(
      `select p.proname, pg_get_function_identity_arguments(p.oid) as args,
      pg_get_functiondef(p.oid) as definition, p.prosecdef, p.proowner::regrole::text as owner, p.proconfig,
      array(select distinct case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end
        from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
        where a.privilege_type='EXECUTE' order by 1) as grantees
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname=$1 and p.proname=any($2) order by p.proname`,
      [schema, names],
    );
  }
  async open() {
    await this.admin.connect();
    try {
      await this.admin.query(
        `CREATE DATABASE ${this.database} TEMPLATE template0`,
      );
      this.created = true;
      const files = [
        "scripts/sql/supabase-compat-bootstrap.sql",
        ...readdirSync(MIG)
          .filter((f) => /^\d{14}_.+\.sql$/.test(f))
          .sort()
          .map((f) => `${MIG}/${f}`),
        "supabase/seed.sql",
      ];
      for (const file of files) {
        if (file === FORWARD) {
          await this.db.connect();
          this.original = await this.catalog();
        }
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
          {
            encoding: "utf8",
            timeout: 30_000,
          },
        );
        // Do not echo stderr: connection failures may contain credentials.
        expect(
          r.status,
          `migration/bootstrap failed: ${file} (${r.error?.name ?? "psql"})`,
        ).toBe(0);
      }
      if (!this.original.length) {
        await this.db.connect();
        this.original = await this.catalog();
      }
    } catch (error) {
      await this.close();
      throw error;
    }
  }
  async close() {
    if (this.closed) return;
    this.closed = true;
    await this.db.end().finally(async () => {
      try {
        if (this.created)
          await this.admin.query(`DROP DATABASE ${this.database} WITH (FORCE)`);
      } finally {
        await this.admin.end();
      }
    });
  }
  async fixture() {
    const q = literal,
      id = this.ids,
      p = this.profiles;
    await this.db
      .query(`insert into public.tenants(id,name,slug) values (${q(id.A)},'acc2402 A',${q(id.A)}),(${q(id.B)},'acc2402 B',${q(id.B)});
      insert into auth.users(id) select unnest(array[${[...Object.values(id), ...Object.values(p)].map(q)}]::uuid[]);
      delete from public.profiles where id=any(array[${[...Object.values(id), ...Object.values(p)].map(q)}]::uuid[]);
      delete from authz.memberships where user_id=any(array[${Object.values(id).map(q)}]::uuid[]);`);
    const roles: Record<string, string> = {
      staff: "staff",
      admin: "admin",
      super: "super_admin",
      donor: "donor",
      member: "donor",
      inactive: "donor",
      other: "staff",
    };
    for (const [actor, role] of Object.entries(roles)) {
      await this.db.query(
        "insert into public.profiles(id,user_id,tenant_id,role) values($1,$2,$3,$4)",
        [p[actor], id[actor], actor === "other" ? id.B : id.A, role],
      );
    }
    await this.db.query(
      `insert into authz.memberships(user_id,tenant_id,role,staff_role,is_active) values
      ($1,$4,'staff','finance',true),($2,$4,'staff','finance',true),($3,$4,'staff','finance',false)`,
      [id.staff, id.member, id.inactive, id.A],
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
  async as(
    role: "anon" | "authenticated" | "service_role" | "postgres",
    actor: string | null,
    sql: string,
  ) {
    await this.db.query("savepoint actor");
    try {
      const sub = actor ? this.ids[actor] : "";
      await this.db.query(`set local role ${role};
        select set_config('request.jwt.claim.sub',${literal(sub)},true),
        set_config('request.jwt.claims',${literal({ sub: sub || null, role })},true)`);
      const result = await this.db.query(sql);
      await this.db.query("reset role; release savepoint actor");
      return { code: null, value: result.rows[0]?.value as unknown };
    } catch (error) {
      await this.db.query(
        "rollback to savepoint actor; release savepoint actor",
      );
      return { code: (error as { code?: string }).code, value: null };
    }
  }
  async snapshot() {
    return Promise.all(
      TABLES.map((t) =>
        this.rows(
          `select to_jsonb(t) as row from public.${t} t order by (to_jsonb(t)-'id'-'created_at'-'updated_at')::text`,
        ),
      ),
    );
  }
}
