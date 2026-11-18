/**
 * WP0 (#2672), audit finding NA-03: the hosted seed refuses to run.
 *
 * `supabase/seed.sql` deletes every tenant's rows before it reseeds, so the
 * seed script must never reach a hosted database. Each case runs the real
 * script under bash with `bun` and `psql` replaced by stubs that only record
 * that they were called, so no case can reach a database.
 */
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const SCRIPT = "scripts/seed-demo.sh";
/** The production-named project the script used to target by default. */
const HOSTED_REF = "btewedpsxwsjczvmegby";
const HOSTED_ENV = {
  SUPABASE_SERVICE_ROLE_KEY: "test-placeholder-not-a-key",
  SUPABASE_DB_URL: `postgresql://postgres:test-placeholder@db.${HOSTED_REF}.supabase.co:5432/postgres`,
  NEXT_PUBLIC_SUPABASE_URL: `https://${HOSTED_REF}.supabase.co`,
};

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true });
});

function bashAvailable() {
  const probe = spawnSync("bash", ["-c", "true"], { encoding: "utf8" });
  return probe.status === 0;
}

/** A directory path as the spawned bash sees it (Git Bash, WSL or POSIX). */
function bashPath(dir: string) {
  const result = spawnSync("bash", ["-c", "pwd"], {
    cwd: dir,
    encoding: "utf8",
  });
  return result.stdout.trim();
}

function runSeed(mode: string, env: Record<string, string> = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), "seed-demo-wp0-"));
  roots.push(root);
  const bin = path.join(root, "bin");
  mkdirSync(bin);
  // One log line per call; newlines inside arguments (psql -c SQL) are flattened.
  const stub =
    '#!/usr/bin/env bash\nargs="$*"\nprintf \'%s %s\\n\' "$(basename "$0")" "${args//$\'\\n\'/ }" >> "$WP0_STUB_LOG"\n' +
    // PR #2714 review: each call's PG* environment, one line per call.
    "printf '%s\\n' \"$(env | grep '^PG' | sort | tr '\\n' ' ')\" >> \"$WP0_STUB_LOG.env\"\n";
  for (const name of ["bun", "psql"]) {
    writeFileSync(path.join(bin, name), stub);
    chmodSync(path.join(bin, name), 0o755);
  }
  const log = path.join(root, "calls.log");
  const bashRoot = bashPath(root);
  const result = spawnSync(
    "bash",
    ["-c", 'PATH="$WP0_STUB_BIN:$PATH" exec bash "$0" "$1"', SCRIPT, mode],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH ?? "",
        ...(process.env.SYSTEMROOT
          ? { SYSTEMROOT: process.env.SYSTEMROOT }
          : {}),
        WP0_STUB_BIN: `${bashRoot}/bin`,
        WP0_STUB_LOG: `${bashRoot}/calls.log`,
        ...env,
      },
    },
  );
  const calls = existsSync(log)
    ? readFileSync(log, "utf8").trim().split("\n").filter(Boolean)
    : [];
  const environments = existsSync(`${log}.env`)
    ? readFileSync(`${log}.env`, "utf8")
        .split("\n")
        .slice(0, calls.length)
        .map((line) => line.trim())
    : [];
  return { status: result.status, stderr: result.stderr, calls, environments };
}

const itPosix = process.platform === "win32" ? it.skip : it;

describe.runIf(bashAvailable())("seed-demo.sh hosted refusal (NA-03)", () => {
  it("refuses the hosted seed against the production-named project and runs nothing", () => {
    const run = runSeed("hosted", HOSTED_ENV);
    expect(run.status).not.toBe(0);
    expect(run.calls).toEqual([]);
    expect(run.stderr).toMatch(/refus/i);
  });

  it("refuses the hosted seed for any other hosted project and runs nothing", () => {
    const otherRef = "abcdefghijklmnopqrst";
    const run = runSeed("hosted", {
      SUPABASE_PROJECT_REF: otherRef,
      SUPABASE_SERVICE_ROLE_KEY: "test-placeholder-not-a-key",
      SUPABASE_DB_URL: `postgresql://postgres:test-placeholder@db.${otherRef}.supabase.co:5432/postgres`,
      NEXT_PUBLIC_SUPABASE_URL: `https://${otherRef}.supabase.co`,
    });
    expect(run.status).not.toBe(0);
    expect(run.calls).toEqual([]);
  });

  it("refuses the hosted seed even when every variable names a loopback database", () => {
    const run = runSeed("hosted", {
      SUPABASE_SERVICE_ROLE_KEY: "test-placeholder-not-a-key",
      SUPABASE_DB_URL:
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    });
    expect(run.status).not.toBe(0);
    expect(run.calls).toEqual([]);
  });

  it.each([
    `postgresql://postgres:test-placeholder@db.${HOSTED_REF}.supabase.co:5432/postgres`,
    "postgresql://postgres.abc:test-placeholder@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
    "postgresql://postgres:test-placeholder@10.0.0.5:5432/postgres",
    "not-a-url",
  ])("refuses to verify against the non-loopback database URL %s", (url) => {
    const run = runSeed("verify", { SUPABASE_DB_URL: url });
    expect(run.status).not.toBe(0);
    expect(run.calls).toEqual([]);
  });

  // PR #2714 review: seed verify asks the repository's one local-database
  // decision (isLoopbackDatabaseUrl) instead of parsing the URL in bash, so a
  // routing override in the query and any loopback address but 127.0.0.1,
  // localhost and [::1] are refused before psql runs.
  it.each([
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres?host=db.abcdefghijklmnopqrst.supabase.co",
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres?hostaddr=10.0.0.5",
    "postgresql://postgres:postgres@localhost:54322/postgres?user=postgres.abcdefghijklmnopqrst",
    "postgresql://postgres:postgres@127.0.0.2:54322/postgres",
    "postgresql://postgres:postgres@LOCALHOST:54322/postgres",
  ])(
    "refuses to verify against %s, which the one decision does not admit",
    (url) => {
      const run = runSeed("verify", { SUPABASE_DB_URL: url });
      expect(run.status).not.toBe(0);
      expect(run.calls).toEqual([]);
      expect(run.stderr).toMatch(/refusing/i);
    },
  );

  // PR #2714 review (record D-18): seed verify now starts psql through the
  // repository's one psql runner (spawnPsql in scripts/lib/psql.mjs), so psql
  // receives the URL without its password, which travels in PGPASSWORD, and
  // not the raw URL this case used to pin; it also asserts the exact number of
  // psql calls instead of "at least one". Node starts psql there, and node
  // cannot start this bash stub on Windows, so the cases that reach psql run on
  // POSIX only, as the runner's own suites (psql.test.ts and
  // supabase-migrations.test.ts) do. Every refusal above still runs everywhere.
  itPosix.each([
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    "postgresql://postgres:postgres@localhost:54322/postgres",
    "postgresql://postgres:postgres@[::1]:54322/postgres",
  ])("still verifies a loopback database URL %s", (url) => {
    const run = runSeed("verify", { SUPABASE_DB_URL: url });
    expect(run.status, run.stderr).toBe(0);
    expect(run.calls).toHaveLength(2);
    const target = url.replace("postgres:postgres@", "postgres@");
    expect(run.calls.every((call) => call.startsWith(`psql ${target} `))).toBe(
      true,
    );
    expect(run.environments).toEqual([
      "PGPASSWORD=postgres",
      "PGPASSWORD=postgres",
    ]);
  });

  // PR #2714 review: an ambient PGHOSTADDR overrides the URL's host, and
  // PGHOST, PGPORT, PGSERVICE and PGOPTIONS fill in a target or a role, so
  // none may reach psql; the password stays out of its arguments.
  itPosix(
    "hands psql no ambient PG* setting and keeps the password out of its arguments",
    () => {
      const run = runSeed("verify", {
        SUPABASE_DB_URL:
          "postgresql://postgres:s3cret-seed@127.0.0.1:54322/postgres",
        PGHOSTADDR: "203.0.113.9",
        PGHOST: "db.example.supabase.co",
        PGPORT: "6543",
        PGSERVICE: "hosted",
        PGOPTIONS: "-c role=postgres",
      });
      expect(run.status, run.stderr).toBe(0);
      expect(run.environments).toEqual([
        "PGPASSWORD=s3cret-seed",
        "PGPASSWORD=s3cret-seed",
      ]);
      expect(run.calls).toHaveLength(2);
      for (const call of run.calls) {
        expect(
          call.startsWith(
            "psql postgresql://postgres@127.0.0.1:54322/postgres ",
          ),
        ).toBe(true);
        expect(call).not.toContain("s3cret-seed");
      }
    },
  );

  it("still seeds the local stack through the repository runner", () => {
    const run = runSeed("local");
    expect(run.status).toBe(0);
    expect(run.calls).toEqual(["bun run supabase -- db reset --local"]);
  });
});
