/**
 * AL-2674 (WP1, slice 1.1b) shared constants and the real-stack replay harness.
 *
 * A Replay is a throwaway database (unique name, from template0) that gets the
 * compatibility bootstrap and every forward migration, never DDL on the
 * database the URL names. `hosted: true` first gives `postgres` the default
 * privileges hosted Supabase gives it in `public` (Supabase, "Securing your
 * API", default privileges), so the chain replays as it would on a hosted
 * project. Lock and statement timeouts make a lock wait fail fast;
 * DROP DATABASE ... WITH (FORCE) cleans up.
 */
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import pg from "pg";

export const ROOT = path.resolve(__dirname, "../../../..");
export const MIG = "supabase/migrations";
export const BOOTSTRAP = "scripts/sql/supabase-compat-bootstrap.sql";
export const MANIFEST = "docs/security/field-policies/manifest.json";
export const GATE = "scripts/verify/field-policy-census.mjs";
export const FP = "docs/security/field-policies";

/** This package's migrations, found by name; the coordinator settles their order. */
export const PRIVILEGES = "close_default_privileges_and_demo_grants";
export const BUCKETS = "limit_email_assets_bucket";
export const RETIRE = "retire_backup_tables_and_crm_link_writes";
export function migrationFile(name: string): string {
  const found = readdirSync(path.join(ROOT, MIG)).filter((f) =>
    new RegExp(`^\\d{14}_${name}\\.sql$`).test(f),
  );
  if (found.length !== 1)
    throw new Error(`expected one ${name} migration, found ${found.length}`);
  return `${MIG}/${found[0]}`;
}
export const OWN_MIGRATIONS = [PRIVILEGES, BUCKETS, RETIRE];

/** The 21 tables of 20260216153000_demo_readonly_rls.sql ("public read"). */
export const DEMO_TABLES = [
  "tenants",
  "profiles",
  "missionaries",
  "donors",
  "funds",
  "posts",
  "post_likes",
  "post_prayers",
  "post_fires",
  "post_comments",
  "campaigns",
  "donations",
  "follows",
  "donor_feed_preferences",
  "donor_activities",
  "donor_pledges",
  "follower_requests",
  "locations",
  "missionary_tasks",
  "pdf_templates",
  "assets",
];
/** Demo tables whose anon SELECT grant outlived its policy. */
export const DEMO_GRANT_RESIDUE = [
  "donations",
  "donor_activities",
  "donor_pledges",
  "donors",
  "profiles",
];
/** Anonymous reads that stay, under narrower policies (audit NA-06). */
export const KEPT_ANON_READS = [
  "currency_metadata",
  "locations",
  "post_comments",
  "post_fires",
  "post_likes",
  "post_prayers",
  "posts",
];
export const BACKUP_TABLES = [
  "backup_money_donations_20260214",
  "backup_money_donor_activities_20260214",
  "backup_money_donor_pledges_20260214",
  "backup_money_donors_20260214",
  "backup_money_funds_20260214",
  "backup_money_missionaries_20260214",
  "backup_money_pledge_charge_attempts_20260214",
  "backup_notification_queue_orphans_20260214",
];
/** Twenty-era sync tables, dropped by 20260818010000_retire_twenty_crm_runtime.sql. */
export const TWENTY_TABLES = [
  "crm_outbound_jobs",
  "crm_webhook_events",
  "crm_sync_settings",
  "crm_sync_logs",
  "crm_reconciliation_runs",
  "crm_projection_state",
];
/** Kept: written or read by current code, or kept by the plan. */
export const KEPT_CRM_TABLES = [
  "crm_command_logs",
  "crm_record_links",
  "crm_merge_candidates",
  "donation_crm_links",
];
export const IMAGE_TYPES = [
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const IMAGE_LIMIT = "5242880";

export const read = (file: string) =>
  readFileSync(path.join(ROOT, file), "utf8");

const HOSTED_DEFAULTS = `
alter default privileges for role postgres in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges for role postgres in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges for role postgres in schema public grant all on functions to anon, authenticated, service_role;`;

type Row = Record<string, unknown>;

function psql(url: string, args: string[]): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.env.PSQL_BIN?.trim() || "psql",
      [url, "-X", "-q", "-v", "ON_ERROR_STOP=1", ...args],
      {
        stdio: ["ignore", "ignore", "pipe"],
        env: { ...process.env, PGCLIENTENCODING: "UTF8" },
      },
    );
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      // Never echo the URL; psql errors name the file and line only.
      if (code !== 0)
        reject(
          new Error(
            `psql ${args.at(-1)} failed: ${stderr
              .split("\n")
              .filter((l) => /ERROR/.test(l))
              .join(" ")}`,
          ),
        );
      else resolve(code);
    });
  });
}

export class Replay {
  readonly database = `acc2674_${randomUUID().replaceAll("-", "")}`;
  readonly url: string;
  private readonly admin: pg.Client;
  private client: pg.Client | null = null;
  private created = false;

  constructor(
    private readonly adminUrl: string,
    readonly hosted: boolean,
  ) {
    this.admin = new pg.Client({ connectionString: adminUrl });
    const url = new URL(adminUrl);
    url.pathname = `/${this.database}`;
    this.url = url.toString();
  }

  /** Bootstrap, optional hosted defaults, then every forward migration. */
  async build(skip: (file: string) => boolean = () => false) {
    await this.admin.connect();
    await this.admin.query(
      `create database ${this.database} template template0`,
    );
    this.created = true;
    await psql(this.url, ["-f", path.join(ROOT, BOOTSTRAP)]);
    if (this.hosted) await psql(this.url, ["-c", HOSTED_DEFAULTS]);
    const files = readdirSync(path.join(ROOT, MIG))
      .filter((f) => /^\d{14}_.+\.sql$/.test(f))
      .sort();
    for (const file of files) {
      if (skip(file)) continue;
      await psql(this.url, [
        ...(file === "20260214090000_foundation_1_schema.sql"
          ? ["--single-transaction"]
          : []),
        "-f",
        path.join(ROOT, MIG, file),
      ]);
    }
    return this;
  }

  /** A copy of this database, for checks that change the schema. */
  async clone(): Promise<Replay> {
    await this.disconnect();
    const copy = new Replay(this.adminUrl, this.hosted);
    await copy.admin.connect();
    await copy.admin.query(
      `create database ${copy.database} template ${this.database}`,
    );
    copy.created = true;
    return copy;
  }

  async db() {
    if (!this.client) {
      this.client = new pg.Client({ connectionString: this.url });
      await this.client.connect();
      await this.client.query(
        "set lock_timeout = '10s'; set statement_timeout = '60s'",
      );
    }
    return this.client;
  }

  async rows(sql: string, params: unknown[] = []): Promise<Row[]> {
    return (await (await this.db()).query(sql, params)).rows as Row[];
  }

  async disconnect() {
    const client = this.client;
    this.client = null;
    if (client) await client.end();
  }

  async close() {
    try {
      await this.disconnect();
    } finally {
      try {
        if (this.created)
          await this.admin.query(
            `drop database if exists ${this.database} with (force)`,
          );
      } finally {
        await this.admin.end().catch(() => undefined);
      }
    }
  }

  /** Runs `sql` as an API role inside a rolled-back transaction; returns rows or the SQLSTATE. */
  async as(role: "anon" | "authenticated", sql: string, sub = "") {
    const db = await this.db();
    await db.query("begin");
    try {
      await db.query(`set local role ${role}`);
      await db.query(
        "select set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claims', $2, true)",
        [sub, JSON.stringify({ sub: sub || null, role })],
      );
      const r = await db.query(sql);
      return { code: null as string | null, rows: r.rows as Row[] };
    } catch (error) {
      return { code: (error as { code?: string }).code ?? "error", rows: [] };
    } finally {
      await db.query("rollback");
    }
  }
}

/** Table privileges of anon and authenticated on relations in public, as "table role PRIVILEGE". */
export const TABLE_GRANTS_SQL = `
select c.relname || ' ' || a.grantee::regrole::text || ' ' || a.privilege_type as g
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
cross join lateral aclexplode(c.relacl) a
where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm', 'f', 'S')
  and a.grantee in ('anon'::regrole, 'authenticated'::regrole)
order by 1`;

/** Column privileges of anon and authenticated in public. */
export const COLUMN_GRANTS_SQL = `
select c.relname || '.' || att.attname || ' ' || a.grantee::regrole::text || ' ' || a.privilege_type as g
from pg_attribute att
join pg_class c on c.oid = att.attrelid
join pg_namespace n on n.oid = c.relnamespace
cross join lateral aclexplode(att.attacl) a
where n.nspname = 'public' and a.grantee in ('anon'::regrole, 'authenticated'::regrole)
order by 1`;

/** Functions in public that anon or authenticated can execute, directly or through PUBLIC. */
export const FUNCTION_EXECUTE_SQL = `
select r || ' ' || p.oid::regprocedure::text as g
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
cross join unnest(array['anon', 'authenticated']) r
where n.nspname = 'public' and has_function_privilege(r, p.oid, 'EXECUTE')
order by 1`;

/** Grants that no policy admits (role, command), on tables in public. */
export const POLICYLESS_GRANTS_SQL = `
select c.relname || ' ' || a.grantee::regrole::text || ' ' || a.privilege_type as g
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
cross join lateral aclexplode(c.relacl) a
where n.nspname = 'public' and c.relkind in ('r', 'p')
  and a.grantee in ('anon'::regrole, 'authenticated'::regrole)
  and a.privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
  and not exists (
    select 1 from pg_policy p
    where c.relrowsecurity and p.polrelid = c.oid
      and p.polcmd in ('*', case a.privilege_type when 'SELECT' then 'r'
        when 'INSERT' then 'a' when 'UPDATE' then 'w' else 'd' end::"char")
      and (p.polroles @> array[0::oid] or p.polroles @> array[a.grantee]))
order by 1`;

export const list = (rows: Row[]) => rows.map((r) => String(r.g));
