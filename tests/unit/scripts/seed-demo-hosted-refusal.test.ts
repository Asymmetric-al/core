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
    '#!/usr/bin/env bash\nargs="$*"\nprintf \'%s %s\\n\' "$(basename "$0")" "${args//$\'\\n\'/ }" >> "$WP0_STUB_LOG"\n';
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
  return { status: result.status, stderr: result.stderr, calls };
}

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

  it.each([
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    "postgresql://postgres:postgres@localhost:54322/postgres",
    "postgresql://postgres:postgres@[::1]:54322/postgres",
  ])("still verifies a loopback database URL %s", (url) => {
    const run = runSeed("verify", { SUPABASE_DB_URL: url });
    expect(run.status).toBe(0);
    expect(run.calls.length).toBeGreaterThan(0);
    expect(run.calls.every((call) => call.startsWith(`psql ${url} `))).toBe(
      true,
    );
  });

  it("still seeds the local stack through the repository runner", () => {
    const run = runSeed("local");
    expect(run.status).toBe(0);
    expect(run.calls).toEqual(["bun run supabase -- db reset --local"]);
  });
});
