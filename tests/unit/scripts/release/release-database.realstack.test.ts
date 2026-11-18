// Real-stack tests of the release job's database steps. They need a
// disposable Postgres: set RELEASE_IT_ADMIN_DATABASE_URL (see
// support/test-database.ts). The WP1.1 SQL is replaced by a stub of the
// contract the release code assumes.
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { listSourceMigrations } from "../../../../scripts/release/migration-heads.mjs";
import {
  readReleaseHealth,
  readReleaseSettings,
  replaceSeededLoginPasswords,
  setCmsRolePasswords,
} from "../../../../scripts/release/release-database.mjs";
import {
  CONTRACT_STUB_SQL,
  IN_MIGRATE_JOB,
  LEDGER_SQL,
  MARK_DISPOSABLE_SQL,
  adminDatabaseUrl,
  createDatabase,
  dropDatabase,
  psql,
} from "./support/test-database";

const ref = "wp13rtestprojectrefx";
const source = listSourceMigrations({ root: process.cwd() });
const created: string[] = [];

function database(label: string, { contract = true, marker = true } = {}) {
  const db = createDatabase(label);
  created.push(db.name);
  psql(db.url, LEDGER_SQL);
  if (contract) psql(db.url, CONTRACT_STUB_SQL);
  if (contract && marker) psql(db.url, MARK_DISPOSABLE_SQL);
  return db;
}

function applyLedgers(url: string, supabase: string[], payload: string[]) {
  const values = (list: string[], render: (v: string) => string) =>
    list.length ? list.map(render).join(",") : null;
  const s = values(supabase, (v) => `('${v}')`);
  const p = values(payload, (v) => `('${v}', 1)`);
  if (s)
    psql(
      url,
      `INSERT INTO supabase_migrations.schema_migrations (version) VALUES ${s};`,
    );
  if (p)
    psql(url, `INSERT INTO cms.payload_migrations (name, batch) VALUES ${p};`);
}

function step(name: string, url: string, extra: Record<string, string> = {}) {
  const result = spawnSync(
    process.execPath,
    ["scripts/release/release-database.mjs", name],
    {
      encoding: "utf8",
      shell: false,
      env: {
        ...process.env,
        RELEASE_ENVIRONMENT: "preview",
        RELEASE_SUPABASE_PROJECT_REF: ref,
        RELEASE_DATABASE_URL: url,
        RELEASE_ALLOW_LOOPBACK_DATABASE: "1",
        ...extra,
      },
    },
  );
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

afterAll(() => {
  for (const name of created) dropDatabase(name);
});

it.runIf(IN_MIGRATE_JOB && !adminDatabaseUrl)(
  "the migrate job sets RELEASE_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(adminDatabaseUrl).not.toBe(""),
);

describe.skipIf(!adminDatabaseUrl)(
  "release database steps (real stack)",
  // Each test spawns node and psql several times; slow on loaded hosts.
  { timeout: 180_000 },
  () => {
    it("passes preflight on an up-to-date disposable database", () => {
      const db = database("preflight_ok");
      applyLedgers(db.url, source.supabase, source.payload);
      const result = step("preflight", db.url);
      expect(result.output).toContain("is marked disposable");
      expect(result.status).toBe(0);
    });

    it("stops a release that carries an out-of-order migration, naming it", () => {
      const db = database("out_of_order");
      const skipped = source.supabase[10]!;
      applyLedgers(
        db.url,
        source.supabase.filter((version) => version !== skipped),
        source.payload,
      );
      const result = step("preflight", db.url);
      expect(result.status).toBe(1);
      expect(result.output).toMatch(/out of order/);
      expect(result.output).toContain(skipped);
      expect(result.output).not.toContain("postgres:postgres");
    });

    it("refuses a database with no marker, and one with no health function", () => {
      const unmarked = database("unmarked", { marker: false });
      expect(step("preflight", unmarked.url).output).toMatch(
        /no environment marker/,
      );
      const bare = database("bare", { contract: false });
      expect(step("preflight", bare.url).output).toMatch(/predates WP1/);
    });

    it("records the database's heads and reads them back through the health function", () => {
      const db = database("heads");
      applyLedgers(db.url, source.supabase, source.payload);
      const result = step("record-heads", db.url);
      expect(result.status).toBe(0);
      const settings = readReleaseSettings({
        RELEASE_ENVIRONMENT: "preview",
        RELEASE_SUPABASE_PROJECT_REF: ref,
        RELEASE_DATABASE_URL: db.url,
        RELEASE_ALLOW_LOOPBACK_DATABASE: "1",
      });
      expect(readReleaseHealth({ databaseUrl: settings.databaseUrl })).toEqual({
        environment: "disposable",
        heads: {
          supabase: source.supabase.at(-1),
          payload: source.payload.at(-1),
        },
      });
    });

    it("moves the marker forward on confirmation and refuses to move it back", () => {
      const db = database("marker");
      expect(
        step("set-marker", db.url, {
          RELEASE_MARKER: "shared",
          RELEASE_CONFIRMATION: `${ref}:shared`,
        }).status,
      ).toBe(0);
      const back = step("set-marker", db.url, {
        RELEASE_MARKER: "disposable",
        RELEASE_CONFIRMATION: `${ref}:disposable`,
      });
      expect(back.status).toBe(1);
      expect(back.output).toMatch(/forward only/);
      expect(psql(db.url, "SELECT kind FROM platform.environment;")).toBe(
        "shared",
      );
    });

    it("sets login role passwords as SCRAM verifiers and proves each role can log in", () => {
      const db = database("roles");
      const suffix = randomBytes(3).toString("hex");
      const owner = `wp13r_owner_${suffix}`;
      const runtime = `wp13r_runtime_${suffix}`;
      psql(db.url, `CREATE ROLE ${owner} LOGIN; CREATE ROLE ${runtime} LOGIN;`);
      try {
        const settings = readReleaseSettings({
          RELEASE_ENVIRONMENT: "preview",
          RELEASE_SUPABASE_PROJECT_REF: ref,
          RELEASE_DATABASE_URL: db.url,
          RELEASE_ALLOW_LOOPBACK_DATABASE: "1",
        });
        const env = {
          WP13R_OWNER_PASSWORD: randomBytes(24).toString("base64url"),
          WP13R_RUNTIME_PASSWORD: randomBytes(24).toString("base64url"),
        };
        const log: string[] = [];
        setCmsRolePasswords({
          settings,
          env,
          roles: {
            [owner]: "WP13R_OWNER_PASSWORD",
            [runtime]: "WP13R_RUNTIME_PASSWORD",
          },
          log: (line: string) => log.push(line),
        });
        expect(log).toHaveLength(2);
        const stored = psql(
          adminDatabaseUrl,
          `SELECT rolpassword FROM pg_authid WHERE rolname = '${owner}';`,
        );
        expect(stored.startsWith("SCRAM-SHA-256$4096:")).toBe(true);
        expect(stored).not.toContain(env.WP13R_OWNER_PASSWORD);
      } finally {
        psql(
          adminDatabaseUrl,
          `DROP ROLE IF EXISTS ${owner}; DROP ROLE IF EXISTS ${runtime};`,
        );
      }
    });

    // Council round 2, A5 (record D-24). Supabase's auth.users is reduced to
    // the columns the step reads and writes.
    it("gives each login holding the seed's published password the release password, as an Argon2id verifier, and no other login", () => {
      const db = database("logins");
      psql(
        db.url,
        `CREATE SCHEMA extensions; CREATE EXTENSION pgcrypto WITH SCHEMA extensions;
         CREATE SCHEMA auth;
         CREATE TABLE auth.users (id int PRIMARY KEY, encrypted_password text, updated_at timestamptz);
         INSERT INTO auth.users VALUES
           (1, extensions.crypt('demo-password', extensions.gen_salt('bf')), NULL),
           (2, extensions.crypt('someone-else', extensions.gen_salt('bf')), NULL),
           (3, '', NULL),
           (4, '$argon2id$v=19$m=19456,t=2,p=1$c2FsdHNhbHQ$aGFzaGhhc2g', NULL);`,
      );
      const settings = readReleaseSettings({
        RELEASE_ENVIRONMENT: "preview",
        RELEASE_SUPABASE_PROJECT_REF: ref,
        RELEASE_DATABASE_URL: db.url,
        RELEASE_ALLOW_LOOPBACK_DATABASE: "1",
      });
      const password = randomBytes(30).toString("base64url");
      const before = psql(
        db.url,
        "SELECT string_agg(id || '=' || encrypted_password, ',' ORDER BY id) FROM auth.users WHERE id <> 1;",
      );
      expect(
        replaceSeededLoginPasswords({ settings, password, log: () => {} }),
      ).toEqual({ seeded_logins: 1, published: 0 });
      const seeded = psql(
        db.url,
        "SELECT encrypted_password FROM auth.users WHERE id = 1;",
      );
      expect(seeded).toMatch(/^\$argon2id\$v=19\$/);
      expect(seeded).not.toContain(password);
      expect(
        psql(
          db.url,
          "SELECT string_agg(id || '=' || encrypted_password, ',' ORDER BY id) FROM auth.users WHERE id <> 1;",
        ),
      ).toBe(before);
      // A second pass finds nothing left to replace.
      expect(
        replaceSeededLoginPasswords({ settings, password, log: () => {} }),
      ).toEqual({ seeded_logins: 0, published: 0 });
    });
  },
);
