/** #2406 spec r2 (comment 6449278094, approved 6449292287): shared constants and
 * the real-stack harness for criteria 2-10. Isolation follows #2402/#2258: one
 * throwaway database per Stack (unique name per file and worker, from
 * template0), never DDL on the CI database, lock/statement timeouts so a lock
 * wait fails fast (the 40P01 lesson from #2256/#2260), DROP ... WITH (FORCE).
 */
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import pg from "pg";
import { expect } from "vitest";

export const MIG = "supabase/migrations";
export const VERSION = "20261027100000";
export const NAME = `${VERSION}_profiles_bucket_owner_folders.sql`;
export const FORWARD = `${MIG}/${NAME}`;
export const ROLLBACK = `${MIG}/rollback_${NAME}`;
export const INIT = `${MIG}/20250101000000_init_schema.sql`;
export const BOOTSTRAP = "scripts/sql/supabase-compat-bootstrap.sql";
export const BACKUP = `private.storage_bucket_limits_${VERSION}`;
export const DOC = "docs/security/storage-profiles-bucket.md";
export const DIR = "tests/unit/acceptance/issue-2406";
export const REALSTACK = `${DIR}/profiles-storage.realstack.acceptance.test.ts`;
/** packages/auth/constants.ts DEMO_TENANT_ID (asserted equal in the static suite). */
export const DEMO = "00000000-0000-0000-0000-000000000001";
export const LIMIT = 5242880;
export const TYPES = ["image/gif", "image/jpeg", "image/png", "image/webp"];
/** Stand-in for recorded hosted limits (criterion 10): non-NULL, unlike §1.4. */
export const PRIOR = { size: "1048576", types: ["image/png"] };
export const NEW_POLICIES = [
  "profiles owner folder insert",
  "profiles owner folder update",
  "profiles owner select",
];
export const OLD_POLICIES = [
  "Authenticated upload profiles",
  "Owner update profiles",
  "Public read profiles",
];
export const DELETE_POLICY = "Owner delete profiles";

export const read = (p: string) =>
  existsSync(p) ? readFileSync(p, "utf8") : "";
/** SQL text without comments, so commented-out statements never count. */
export const code = (s: string) => s.replace(/--[^\n]*|\/\*[\s\S]*?\*\//g, " ");
export const squash = (s: string) => s.replace(/\s+/g, " ").trim();
export const migrated = () =>
  expect(
    existsSync(FORWARD),
    `${FORWARD} missing: #2406 not implemented on this tree`,
  ).toBe(true);

type Row = Record<string, unknown>;
export type Result = { code: string | null; rows: Row[]; count: number };
export type Role = "anon" | "authenticated";
export type Snapshot = { policies: Row[]; buckets: Row[] };

/** Actors: tenants T/T2; U donor and M missionary in T; X in T2; S super
 * admin without tenant; S2 super admin in T; N has auth.users but no profile;
 * Z (addendum 1) donor whose profiles.tenant_id is NULL. */
const ACTORS = "T T2 U M X S S2 N Z".split(" ");

export class Stack {
  readonly database = `acc2406_${randomUUID().replaceAll("-", "")}`;
  readonly ids: Record<string, string> = Object.fromEntries(
    ACTORS.map((k) => [k, randomUUID()]),
  );
  readonly profiles: Record<string, string> = Object.fromEntries(
    ACTORS.map((k) => [k, randomUUID()]),
  );
  readonly admin: pg.Client;
  readonly db: pg.Client;
  readonly url: URL;
  pre: Snapshot = { policies: [], buckets: [] };
  priorApplied = false;
  created = false;
  connected = false;
  closed = false;
  /** hosted=false: storage table grants only, enough for RLS to decide.
   * hosted=true: criterion 8's hosted grants and private default privileges. */
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
      { encoding: "utf8", timeout: 60_000 },
    );
    // Never echo stderr: connection failures may contain credentials.
    return { status: r.status, error: r.error?.name ?? null };
  }
  async open() {
    await this.admin.connect();
    try {
      const adminDb = (await this.admin.query("select current_database() as d"))
        .rows[0]!.d as string;
      expect(adminDb, "throwaway name must differ from the CI DB").not.toBe(
        this.database,
      );
      await this.admin.query(
        `CREATE DATABASE ${this.database} TEMPLATE template0`,
      );
      this.created = true;
      const files = [
        BOOTSTRAP,
        ...readdirSync(MIG)
          .filter((f) => /^\d{14}_.+\.sql$/.test(f))
          .sort()
          .map((f) => `${MIG}/${f}`),
        "supabase/seed.sql",
      ];
      for (const file of files) {
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
        "update storage.buckets set file_size_limit=$1, allowed_mime_types=$2 where id='profiles'",
        [PRIOR.size, PRIOR.types],
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
    const [r] = await this
      .rows(`select file_size_limit::text as size, allowed_mime_types as types
      from storage.buckets where id='profiles'`);
    return {
      size: (r?.size ?? null) as string | null,
      types: r?.types ? [...(r.types as string[])].sort() : null,
    };
  }
  async regclass(name: string) {
    return (await this.rows("select to_regclass($1)::text as r", [name]))[0]!
      .r as string | null;
  }
  async privileges(table: string) {
    return this.rows(
      `select r as role, p as privilege from unnest(array['anon','authenticated','service_role']) r,
       unnest(array['SELECT','INSERT','UPDATE','DELETE']) p where has_table_privilege(r::name, $1::text, p)`,
      [table],
    );
  }
  /** Object name built from actor keys: path("avatars", "T", "U") + "/x.webp". */
  path(purpose: string, tenant: string, user: string) {
    return `${purpose}/${this.ids[tenant] ?? tenant}/${this.ids[user] ?? user}`;
  }
  /** Per-test fixture: tenants, users, profiles and seeded profiles objects. */
  async fixture() {
    const id = this.ids,
      p = this.profiles;
    const users = ACTORS.filter((k) => !k.startsWith("T")).flatMap((k) => [
      id[k],
      p[k],
    ]);
    await this.db.query(
      `insert into public.tenants(id,name,slug)
       values ($1::uuid,'acc2406 T',$1::text),($2::uuid,'acc2406 T2',$2::text)`,
      [id.T, id.T2],
    );
    for (const sql of [
      "insert into auth.users(id) select unnest($1::uuid[])",
      "delete from public.profiles where id = any($1::uuid[]) or user_id = any($1::uuid[])",
      "delete from authz.memberships where user_id = any($1::uuid[])",
    ])
      await this.db.query(sql, [users]);
    const roles: [string, string | null, string][] = [
      ["U", id.T!, "donor"],
      ["M", id.T!, "missionary"],
      ["X", id.T2!, "donor"],
      ["S", null, "super_admin"],
      ["S2", id.T!, "super_admin"],
      ["Z", null, "donor"],
    ];
    for (const [actor, tenant, role] of roles)
      await this.db.query(
        "insert into public.profiles(id,user_id,tenant_id,role) values($1,$2,$3,$4)",
        [p[actor], id[actor], tenant, role],
      );
    await this.db.query(
      `insert into storage.objects(bucket_id,name,owner) values
       ('profiles',$1,$5),('profiles',$2,$5),('profiles',$3,$6),('profiles',$4,$6),('profiles','legacy/orphan.webp',null),
       ('profiles',$7,$8)`,
      [
        `${this.path("avatars", "T", "U")}/seed.webp`,
        `avatars/${id.U}-123.webp`,
        `${this.path("avatars", "T2", "X")}/seed.webp`,
        `avatars/${id.X}-123.webp`,
        id.U,
        id.X,
        `avatars/${id.Z}-123.webp`,
        id.Z,
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
      "select count(*)::int as n from storage.objects where bucket_id='profiles'",
    );
    return r!.n as number;
  }
  insert(role: Role, actor: string | null, name: string, returning = false) {
    const owner = actor ? (this.ids[actor] ?? actor) : null;
    return this.as(
      role,
      actor,
      `insert into storage.objects(bucket_id,name,owner) values ('profiles',$1,$2)${returning ? " returning id" : ""}`,
      [name, owner],
    );
  }
  update(actor: string, name: string, set: { name?: string }) {
    return this.as(
      "authenticated",
      actor,
      `update storage.objects set ${set.name ? "name=$2" : "metadata=jsonb_build_object('v',$2::text)"}
       where bucket_id='profiles' and name=$1 returning name`,
      [name, set.name ?? "1"],
    );
  }
  remove(actor: string, name: string) {
    return this.as(
      "authenticated",
      actor,
      "delete from storage.objects where bucket_id='profiles' and name=$1",
      [name],
    );
  }
  list(role: Role, actor: string | null) {
    return this.as(
      role,
      actor,
      "select name, owner::text as owner from storage.objects where bucket_id='profiles' order by name",
    );
  }
}
