// K1 and K12 (fix check, 21 November): the rollback of 20261120130001 on the
// model of WP2b's rollback cases (issue-2675/tenant-policy-migration). Its
// guard is proved inside rolled-back transactions; the whole file runs on a
// throwaway database of its own (from template0, the chain replayed up to
// the migration), because on the shared database it would hold tenants
// exclusively while the program's other suites run.
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  captureFingerprint,
  diffFingerprints,
} from "../../../../scripts/release/schema-fingerprint.mjs";
import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2675/harness";

const MIG = "supabase/migrations";
const VERSION = "20261120130001";
const FORWARD = `${MIG}/${VERSION}_tenant_status_membership.sql`;
const ROLLBACK = `${MIG}/rollback_${VERSION}_tenant_status_membership.sql`;
const BOOTSTRAP = "scripts/sql/supabase-compat-bootstrap.sql";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

describe.skipIf(!ADMIN_URL)("the rollback of 20261120130001", () => {
  const name = `acc2676_rb_${randomUUID().replaceAll("-", "")}`;
  let admin: pg.Client;
  let db: pg.Client;
  let url: string;
  let created = false;
  let before: ReturnType<typeof captureFingerprint>;
  const file = readFileSync(ROLLBACK, "utf8");
  const body = file.slice(
    file.indexOf("\nBEGIN;\n") + "\nBEGIN;\n".length,
    file.lastIndexOf("\nCOMMIT;"),
  );
  /** psql with the URL as its whole target; stderr is never echoed. */
  const psql = (path: string) =>
    spawnSync(
      process.env.PSQL_BIN?.trim() || "psql",
      [
        url,
        "-X",
        "-q",
        "-v",
        "ON_ERROR_STOP=1",
        ...(path.endsWith("/20260214090000_foundation_1_schema.sql")
          ? ["--single-transaction"]
          : []),
        "-f",
        path,
      ],
      { encoding: "utf8", timeout: 120_000 },
    ).status;
  /** Runs the guard and body in a transaction that is always rolled back. */
  const refusal = async (setup: string) => {
    await db.query("begin");
    try {
      await db.query(setup);
      return await db.query(body).then(
        () => null,
        (error: Error) => error.message,
      );
    } finally {
      await db.query("rollback");
    }
  };

  beforeAll(async () => {
    const target = new URL(ADMIN_URL!);
    target.pathname = `/${name}`;
    url = target.toString();
    admin = new pg.Client({ connectionString: ADMIN_URL });
    db = new pg.Client({ connectionString: url });
    await admin.connect();
    const [self] = (await admin.query("select current_database() as d")).rows;
    expect(self.d, "the throwaway name differs from the CI database").not.toBe(
      name,
    );
    await admin.query(`CREATE DATABASE ${name} TEMPLATE template0`);
    created = true;
    const files = [
      BOOTSTRAP,
      ...readdirSync(MIG)
        .filter((f) => /^\d{14}_.+\.sql$/.test(f) && f.slice(0, 14) < VERSION)
        .sort()
        .map((f) => `${MIG}/${f}`),
    ];
    for (const path of files)
      expect(psql(path), `replay stopped at ${path}`).toBe(0);
    await db.connect();
    await db.query("set lock_timeout = '10s'; set statement_timeout = '120s'");
    await db.query(`create schema if not exists supabase_migrations;
      create table if not exists supabase_migrations.schema_migrations (version text primary key, statements text[], name text)`);
    before = captureFingerprint({ databaseUrl: url });
    expect(psql(FORWARD), FORWARD).toBe(0);
    await db.query(
      "insert into supabase_migrations.schema_migrations (version, name) values ($1, 'acc2676')",
      [VERSION],
    );
    await db.query(
      "insert into public.tenants (id, name, slug) values ($1, 'Active', $2)",
      [randomUUID(), randomUUID()],
    );
  }, 600_000);

  afterAll(async () => {
    try {
      await db?.end();
    } finally {
      try {
        if (created) await admin.query(`DROP DATABASE ${name} WITH (FORCE)`);
      } finally {
        await admin?.end();
      }
    }
  });

  it("refuses, changing nothing, on a database with no migration ledger", async () => {
    const refused = await refusal("drop schema supabase_migrations cascade");
    expect(refused).toMatch(/^rollback_20261120130001: .*no migration ledger/);
    expect(refused).toMatch(/nothing was changed/);
  });

  it.each([
    "20261120130003",
    "20261120130004",
    "20261120130005",
    "20261120130006",
  ])(
    "refuses, changing nothing, while the later version %s is recorded",
    async (later) => {
      const refused = await refusal(
        `insert into supabase_migrations.schema_migrations (version, name) values ('${later}', 'acc2676')`,
      );
      expect(refused).toMatch(
        new RegExp(`newest migration recorded is ${later}`),
      );
      expect(refused).toMatch(/reverse every later migration first/i);
      expect(refused).toMatch(/nothing was changed/);
    },
  );

  it.each(["suspended", "closed"])(
    "refuses, changing nothing, while a tenant is %s (K12)",
    async (status) => {
      const refused = await refusal(
        `insert into public.tenants (id, name, slug, status) values ('${randomUUID()}', 'Held', '${randomUUID()}', '${status}')`,
      );
      expect(refused).toMatch(
        /^rollback_20261120130001: 1 tenant\(s\) are suspended or closed/,
      );
      expect(refused).toMatch(/repair that state forward/i);
      expect(refused).toMatch(/nothing was changed/);
    },
  );

  it("with 20261120130001 newest and every tenant active, restores the catalog the migration found", async () => {
    expect(psql(ROLLBACK), ROLLBACK).toBe(0);
    const diff = diffFingerprints(
      before,
      captureFingerprint({ databaseUrl: url }),
    );
    expect(diff).toMatchObject({
      equal: true,
      missing: [],
      unexpected: [],
      changed: [],
    });
  });
});
