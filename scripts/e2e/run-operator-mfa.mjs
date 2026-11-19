#!/usr/bin/env node
/**
 * Runs the operators' second-factor proof (AL-2675 WP2c,
 * tests/unit/acceptance/issue-2675/operator-mfa.localstack.test.ts) against a
 * running local Supabase stack: TOTP enrolment and the challenge through the
 * stack's Auth server, the shared operator check and the read function through
 * its Data API, and the operator script against its database.
 * `node scripts/e2e/run-operator-mfa.mjs [-- <vitest args>]`.
 *
 * CI's `migrate` job has a plain Postgres and no Auth server, so the proof runs
 * in the Local Supabase Stack workflow (.github/workflows/local-supabase.yml).
 *
 * Reads the stack's URL, keys and database from `supabase status`, through the
 * repository's CLI wrapper, and hands them to the suite as OPERATOR_MFA_*, with
 * OPERATOR_MFA_REQUIRED=1 so that a missing value fails the suite instead of
 * skipping it. Set OPERATOR_MFA_SUPABASE_WORKDIR to read a stack started with
 * `--workdir` (a scratch copy with its own ports). Every address must be on
 * this machine.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { LOOPBACK_HOSTS, isLoopbackDatabaseUrl } from "../lib/psql.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export const SUITE =
  "tests/unit/acceptance/issue-2675/operator-mfa.localstack.test.ts";

/** `supabase status -o env` name → the name the suite reads. */
const STATUS_NAMES = {
  API_URL: "OPERATOR_MFA_API_URL",
  ANON_KEY: "OPERATOR_MFA_ANON_KEY",
  SERVICE_ROLE_KEY: "OPERATOR_MFA_SERVICE_KEY",
  DB_URL: "OPERATOR_MFA_DB_URL",
};

const START_HINT =
  "Start the local stack first: `bun run supabase -- start` (see docs/guides/development/getting-started.md).";

/** The CLI arguments that print the stack's values. */
export function statusArguments(env = process.env) {
  const workdir = env.OPERATOR_MFA_SUPABASE_WORKDIR?.trim();
  return ["status", "-o", "env", ...(workdir ? ["--workdir", workdir] : [])];
}

/** The suite's environment from `supabase status -o env` output. Throws, naming no value. */
export function operatorMfaEnvFromStatus(output) {
  const reported = {};
  for (const line of String(output).split(/\r?\n/)) {
    const match = /^([A-Z_]+)="?(.*?)"?$/.exec(line.trim());
    if (match) reported[match[1]] = match[2];
  }

  const missing = Object.keys(STATUS_NAMES).filter((name) => !reported[name]);
  if (missing.length > 0) {
    throw new Error(
      `the local Supabase stack did not report ${missing.join(", ")}. ${START_HINT}`,
    );
  }

  let apiHost = "";
  try {
    apiHost = new URL(reported.API_URL).hostname;
  } catch {
    apiHost = "";
  }
  if (!LOOPBACK_HOSTS.has(apiHost) || !isLoopbackDatabaseUrl(reported.DB_URL)) {
    throw new Error(
      "the stack is not on this machine; the operators' second-factor proof runs only against a local Supabase stack.",
    );
  }

  return {
    ...Object.fromEntries(
      Object.entries(STATUS_NAMES).map(([from, to]) => [to, reported[from]]),
    ),
    OPERATOR_MFA_REQUIRED: "1",
  };
}

// The deadlines signal the direct child, not its descendants. After a timeout,
// check this proof's stack and workers before retrying or removing its volume.
export function runOperatorMfa(args, spawn = spawnSync) {
  const status = spawn(
    process.execPath,
    ["scripts/supabase-cli.mjs", ...statusArguments()],
    { cwd: repoRoot, encoding: "utf8", shell: false, timeout: 60_000 },
  );
  if (status.error || status.status !== 0) {
    console.error(
      `error: could not read the local Supabase stack (\`supabase status\` exit ${status.status ?? status.error?.message}). ${START_HINT}`,
    );
    return 1;
  }

  let suiteEnv;
  try {
    suiteEnv = operatorMfaEnvFromStatus(status.stdout);
  } catch (error) {
    console.error(`error: ${error instanceof Error ? error.message : error}`);
    return 1;
  }

  const run = spawn(
    process.execPath,
    ["node_modules/vitest/vitest.mjs", "run", SUITE, ...args],
    {
      cwd: repoRoot,
      env: { ...process.env, ...suiteEnv },
      stdio: "inherit",
      shell: false,
      timeout: 480_000,
    },
  );
  if (run.error) {
    console.error(
      `error: the operator MFA suite failed to run (${run.error.code ?? "spawn error"}).`,
    );
    return 1;
  }
  return run.status ?? 1;
}

const invokedDirectly =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) process.exit(runOperatorMfa(process.argv.slice(2)));
