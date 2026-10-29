/** #2407 PR (a) (spec r1 + r1.1, comment 6464291699; approved 6464308234):
 * constants and the real-stack harness for criteria 2-5, 9-11. Isolation as
 * #2406/#2402/#2258: one throwaway database per Stack (unique per file and
 * worker, from template0), never DDL on the CI database, lock/statement
 * timeouts (40P01 lesson, #2256/#2260), DROP ... WITH (FORCE). Adapted from
 * acceptance/2406 (not on develop; nothing is imported from issue-2406).
 */
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import pg from "pg";
import { expect } from "vitest";

export const MIG = "supabase/migrations";
export const VERSION = "20261028100000";
export const NAME = `${VERSION}_editor_image_storage.sql`;
export const FORWARD = `${MIG}/${NAME}`;
export const ROLLBACK = `${MIG}/rollback_${NAME}`;
export const INIT = `${MIG}/20250101000000_init_schema.sql`;
export const BOOTSTRAP = "scripts/sql/supabase-compat-bootstrap.sql";
export const BACKUP = `private.storage_bucket_limits_${VERSION}`;
export const DOC = "docs/security/storage-editor-images.md";
export const RUNTIME_MAP = "docs/guides/architecture/runtime-map.md";
export const DIR = "tests/unit/acceptance/issue-2407";
export const REALSTACK = `${DIR}/editor-images.realstack.acceptance.test.ts`;
/** Editor image bucket (B1); PR (a) adds no bucket. */
export const BUCKET = "document-uploads";
/** packages/auth/constants.ts DEMO_TENANT_ID (asserted equal in static). */
export const DEMO = "00000000-0000-0000-0000-000000000001";
export const LIMIT = 5242880;
export const TYPES = ["image/gif", "image/jpeg", "image/png", "image/webp"];
/** Stand-in for recorded hosted limits (criterion 11): non-NULL. */
export const PRIOR = { size: "2097152", types: ["image/png"] };
/** N1, N2, N3 (§2.1); P2, P3, P1 (init_schema.sql:473-505); P4 untouched. */
export const NEW_POLICIES = [
  "editor images owner folder insert",
  "editor images owner folder update",
  "editor images owner select",
];
export const OLD_POLICIES = [
  "Authenticated upload document-uploads",
  "Owner update document-uploads",
  "Public read document-uploads",
];
export const DELETE_POLICY = "Owner delete document-uploads";

export const read = (p: string) =>
  existsSync(p) ? readFileSync(p, "utf8") : "";
/** SQL text without comments, so commented-out statements never count. */
export const code = (s: string) => s.replace(/--[^\n]*|\/\*[\s\S]*?\*\//g, " ");
export const squash = (s: string) => s.replace(/\s+/g, " ").trim();
/** Realstack case rows "label|role|actor|name" (criterion 3, M1-M4, M2 demo).
 * `name` tokens: {editor:T:A} (purpose:tenant:user via Stack.path), {demo}
 * (DEMO tenant id, usable inside a compound token), {file}, {id:K}. */
export type Case = [
  label: string,
  role: Role,
  actor: string | null,
  name: string,
];
export const ALLOW3 = `
M own folder|authenticated|M|{editor:T:M}/{file}
A own folder|authenticated|A|{editor:T:A}/{file}
A RETURNING id|authenticated|A|{editor:T:A}/{file}
S2 own tenant|authenticated|S2|{editor:T:S2}/{file}
S into demo|authenticated|S|{editor:{demo}:S}/{file}`;
export const DENY3 = `
uid segment != A|authenticated|A|{editor:T:X}/{file}
tenant segment != T|authenticated|A|{editor:T2:A}/{file}
purpose care-note|authenticated|A|{care-note:T:A}/{file}
three segments|authenticated|A|{editor:T:A}
empty remainder|authenticated|A|{editor:T:A}/
legacy shape|authenticated|A|editor/x-1.png
bucket root|authenticated|A|x.webp
role anon|anon||{editor:T:A}/{file}
no sub|authenticated||{editor:T:A}/{file}
sub without profile|authenticated|Z|{editor:T:Z}/{file}
S2 into demo|authenticated|S2|{editor:{demo}:S2}/{file}
S into tenant T|authenticated|S|{editor:T:S}/{file}
X into tenant T|authenticated|X|{editor:T:X}/{file}`;
/** Expands case rows. Inner tokens ({demo}, {id:K}) resolve BEFORE the compound
 * {purpose:tenant:user} token, whose segments may then be uuids (reviewer fix
 * on PR #2427: {editor:{demo}:S} used to survive as a braced literal). */
export const table = (
  s: Pick<Stack, "path" | "ids">,
  rows: string,
  file: () => string = () => `${randomUUID()}.webp`,
): Case[] =>
  rows
    .trim()
    .split("\n")
    .map((line) => {
      const [label, role, actor, name] = line.split("|") as [
        string,
        Role,
        string,
        string,
      ];
      const resolved = name
        .replaceAll("{demo}", DEMO)
        .replace(/\{id:(\w+)\}/g, (_, k) => s.ids[k]!)
        .replace(/\{([\w-]+):([\w-]+):([\w-]+)\}/g, (_, p, t, u) =>
          s.path(p, t, u),
        )
        .replaceAll("{file}", file());
      return [label, role, actor || null, resolved];
    });
export const migrated = () =>
  expect(existsSync(FORWARD), `${FORWARD} missing: #2407a not built`).toBe(
    true,
  );

export type Row = Record<string, unknown>;
export type Result = { code: string | null; rows: Row[]; count: number };
export type Role = "anon" | "authenticated";
/** §4 actors: tenants T/T2; A staff membership in T (profile donor); D profile
 * admin in T; N other staff in T; S super_admin without tenant; S2 super_admin
 * in T; M missionary in T; R donor in T; X staff in T2; Z auth.users only. */
const ACTORS = "T T2 A D N S S2 M R X Z".split(" ");
const PROFILES =
  "A:T:donor D:T:admin N:T:staff S::super_admin S2:T:super_admin M:T:missionary R:T:donor X:T2:staff";
const PSQL_ARGS = ["-X", "-q", "-v", "ON_ERROR_STOP=1", "-f"];

export class Stack {
  readonly database = `acc2407a_${randomUUID().replaceAll("-", "")}`;
  readonly ids: Record<string, string> = Object.fromEntries(
    ACTORS.map((k) => [k, randomUUID()]),
  );
  readonly profiles: Record<string, string> = Object.fromEntries(
    ACTORS.map((k) => [k, randomUUID()]),
  );
  readonly admin: pg.Client;
  readonly db: pg.Client;
  readonly url: URL;
  pre = { policies: [] as Row[], buckets: [] as Row[] };
  priorApplied = false;
  created = false;
  connected = false;
  closed = false;
  /** hosted=false: storage table grants only, enough for RLS to decide.
   * hosted=true: criterion 9's hosted grants and private default privileges. */
  constructor(
    url: string,
    readonly hosted: boolean,
  ) {
    this.admin = new pg.Client({ connectionString: url });
    this.url = new URL(url);
    this.url.pathname = `/${this.database}`;
    this.db = new pg.Client({ connectionString: this.url.toString() });
  }
  async rows(sql: string, params: unknown[] = []) {
    return (await this.db.query(sql, params)).rows as Row[];
  }
  /** psql with the DB URI as its first argument (never PGDATABASE). */
  psql(file: string) {
    const single = file.endsWith("/20260214090000_foundation_1_schema.sql");
    const r = spawnSync(
      process.env.PSQL_BIN?.trim() || "psql",
      [
        this.url.toString(),
        ...(single ? ["--single-transaction"] : []),
        ...PSQL_ARGS,
        file,
      ],
      { encoding: "utf8", timeout: 60_000 },
    );
    // Never echo stderr: connection failures may contain credentials.
    return { status: r.status, error: r.error?.name ?? null };
  }
  async open() {
    await this.admin.connect();
    try {
      const [{ d }] = (await this.admin.query("select current_database() as d"))
        .rows;
      expect(d, "throwaway name must differ from the CI DB").not.toBe(
        this.database,
      );
      await this.admin.query(
        `CREATE DATABASE ${this.database} TEMPLATE template0`,
      );
      this.created = true;
      const files = readdirSync(MIG)
        .filter((f) => /^\d{14}_.+\.sql$/.test(f))
        .sort()
        .map((f) => `${MIG}/${f}`);
      for (const file of [BOOTSTRAP, ...files, "supabase/seed.sql"]) {
        if (file === FORWARD) await this.beforeForward();
        const r = this.psql(file);
        expect(
          r.status,
          `migration/bootstrap failed: ${file} (${r.error ?? "psql"})`,
        ).toBe(0);
      }
      if (!this.connected) await this.beforeForward();
    } catch (error) {
      await this.close();
      throw error;
    }
  }
  /** Grants, prior-limit fixture and the pre-migration catalog snapshot. */
  async beforeForward() {
    await this.db.connect();
    this.connected = true;
    await this.db.query(
      "set lock_timeout = '10s'; set statement_timeout = '60s'",
    );
    const [self] = await this.rows("select current_database() as d");
    expect(self!.d).toBe(this.database);
    await this.db
      .query(`GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
      GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO anon, authenticated;`);
    if (this.hosted)
      await this.db
        .query(`GRANT ALL ON storage.objects, storage.buckets TO anon, authenticated, service_role;
        ALTER DEFAULT PRIVILEGES IN SCHEMA private GRANT ALL ON TABLES TO anon, authenticated;`);
    const [cols] = await this.rows(
      `select count(*)::int as n from information_schema.columns where table_schema='storage'
       and table_name='buckets' and column_name in ('file_size_limit','allowed_mime_types')`,
    );
    if (cols!.n === 2) {
      await this.db.query(
        "update storage.buckets set file_size_limit=$1, allowed_mime_types=$2 where id=$3",
        [PRIOR.size, PRIOR.types, BUCKET],
      );
      this.priorApplied = true;
    }
    this.pre = {
      policies: await this.policies(),
      buckets: await this.buckets(),
    };
  }
  async close() {
    if (this.closed) return;
    this.closed = true;
    await (this.connected ? this.db.end() : Promise.resolve()).finally(
      async () => {
        try {
          if (this.created)
            await this.admin.query(
              `DROP DATABASE ${this.database} WITH (FORCE)`,
            );
        } finally {
          await this.admin.end();
        }
      },
    );
  }
  policies() {
    return this
      .rows(`select policyname, permissive, roles::text[] as roles, cmd, qual, with_check
      from pg_policies where schemaname='storage' and tablename='objects' order by policyname`);
  }
  buckets() {
    return this.rows(
      "select id, to_jsonb(b) as row from storage.buckets b order by id",
    );
  }
  async limits() {
    const [r] = await this.rows(
      "select file_size_limit::text as size, allowed_mime_types as types from storage.buckets where id=$1",
      [BUCKET],
    );
    return {
      size: (r?.size ?? null) as string | null,
      types: r?.types ? [...(r.types as string[])].sort() : null,
    };
  }
  /** Object name prefix from actor keys: path("editor", "T", "A") + "/x.webp". */
  path(purpose: string, tenant: string, user: string) {
    return `${purpose}/${this.ids[tenant] ?? tenant}/${this.ids[user] ?? user}`;
  }
  /** Per-test fixture: tenants, auth.users for EVERY uid and profile id
   * (profiles_id_fkey, the #2364 CI lesson), profiles, memberships, objects. */
  async fixture() {
    const id = this.ids;
    const users = ACTORS.filter((k) => !k.startsWith("T")).flatMap((k) => [
      id[k],
      this.profiles[k],
    ]);
    await this.db.query(
      `insert into public.tenants(id,name,slug) values ($1::uuid,'acc2407a T',$1::text),($2::uuid,'acc2407a T2',$2::text)`,
      [id.T, id.T2],
    );
    for (const sql of [
      "insert into auth.users(id) select unnest($1::uuid[])",
      "delete from public.profiles where id = any($1::uuid[]) or user_id = any($1::uuid[])",
      "delete from authz.memberships where user_id = any($1::uuid[])",
    ])
      await this.db.query(sql, [users]);
    for (const [actor, tenant, role] of PROFILES.split(" ").map((p) =>
      p.split(":"),
    ))
      await this.db.query(
        "insert into public.profiles(id,user_id,tenant_id,role) values($1,$2,$3,$4)",
        [this.profiles[actor!], id[actor!], tenant ? id[tenant] : null, role],
      );
    await this.db.query(
      `insert into authz.memberships(user_id,tenant_id,role,staff_role,is_active) values
       ($1,$5,'staff','finance',true),($2,$5,'staff','member_care',true),($3,$6,'staff','finance',true),($4,$5,'missionary',null,true)`,
      [id.A, id.N, id.X, id.M, id.T, id.T2],
    );
    await this.db.query(
      `insert into storage.objects(bucket_id,name,owner) values
       ($7,$1,$5),($7,$2,$5),($7,$3,$6),($7,$4,$6),($7,'editor/orphan-1.png',null)`,
      [
        `${this.path("editor", "T", "A")}/seed.webp`,
        `editor/${id.A}-123.png`,
        `${this.path("editor", "T2", "X")}/seed.webp`,
        `editor/${id.X}-123.png`,
        id.A,
        id.X,
        BUCKET,
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
  /** Runs one statement as `role` with JWT sub = actor id (or raw sub/none). */
  async as(
    role: Role,
    actor: string | null,
    sql: string,
    params: unknown[] = [],
  ): Promise<Result> {
    await this.db.query("savepoint actor");
    try {
      const sub = actor ? (this.ids[actor] ?? actor) : "";
      await this.db.query(`set local role ${role}`);
      await this.db.query(
        `select set_config('request.jwt.claim.sub',$1,true), set_config('request.jwt.claim.role',$2,true),
         set_config('request.jwt.claims',$3,true)`,
        [sub, role, JSON.stringify({ sub: sub || null, role })],
      );
      const r = await this.db.query(sql, params);
      await this.db.query("reset role; release savepoint actor");
      return { code: null, rows: r.rows as Row[], count: r.rowCount ?? 0 };
    } catch (error) {
      await this.db.query(
        "rollback to savepoint actor; release savepoint actor",
      );
      return {
        code: (error as { code?: string }).code ?? "error",
        rows: [],
        count: 0,
      };
    }
  }
  async objects() {
    const [r] = await this.rows(
      "select count(*)::int as n from storage.objects where bucket_id=$1",
      [BUCKET],
    );
    return r!.n as number;
  }
  insert(role: Role, actor: string | null, name: string, returning = false) {
    const owner = actor ? (this.ids[actor] ?? actor) : null;
    const sql = `insert into storage.objects(bucket_id,name,owner) values ($3,$1,$2)${returning ? " returning id" : ""}`;
    return this.as(role, actor, sql, [name, owner, BUCKET]);
  }
  update(actor: string, name: string, set: { name?: string }) {
    const sql = `update storage.objects set ${set.name ? "name=$2" : "metadata=jsonb_build_object('v',$2::text)"}
       where bucket_id=$3 and name=$1 returning name`;
    return this.as("authenticated", actor, sql, [
      name,
      set.name ?? "1",
      BUCKET,
    ]);
  }
  remove(actor: string, name: string) {
    return this.as(
      "authenticated",
      actor,
      "delete from storage.objects where bucket_id=$2 and name=$1",
      [name, BUCKET],
    );
  }
  list(role: Role, actor: string | null) {
    const sql =
      "select name, owner::text as owner from storage.objects where bucket_id=$1 order by name";
    return this.as(role, actor, sql, [BUCKET]);
  }
}
