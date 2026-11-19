#!/usr/bin/env node
/**
 * Runs the Supabase Auth email journeys (`playwright.auth-mail.config.ts`:
 * password recovery in all three apps, sign-up confirmation on two hosts of
 * the donor portal) against a running local Supabase stack and its mail
 * catcher. `bun run test:e2e:auth-mail [-- <playwright args>]`.
 *
 * Reads the stack's URL, keys, database and mail catcher from `supabase status`, through
 * the repository's CLI wrapper, and hands them to Playwright and the dev
 * servers it starts under the names they read. It fails when it cannot read
 * them, instead of letting every journey skip. Set AUTH_MAIL_SUPABASE_WORKDIR
 * to read a stack started with `--workdir` (a scratch copy with its own ports).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  LOOPBACK_DATABASE_HOSTS,
  isLoopbackDatabaseUrl,
} from "../../packages/env/src/database-url.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

/** `supabase status -o env` name → the name the apps and journeys read. */
const STATUS_NAMES = {
  API_URL: "NEXT_PUBLIC_SUPABASE_URL",
  ANON_KEY: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  SERVICE_ROLE_KEY: "SUPABASE_SERVICE_ROLE_KEY",
  MAILPIT_URL: "E2E_AUTH_MAIL_URL",
  // The journeys give each person the membership its app needs (AL-2675);
  // only the database holds memberships, and authz is not on the Data API.
  DB_URL: "E2E_AUTH_MAIL_DB_URL",
};

const START_HINT =
  "Start the local stack first: `bun run supabase -- start` (see docs/guides/development/getting-started.md).";

/** The CLI arguments that print the stack's values. */
export function statusArguments(env = process.env) {
  const workdir = env.AUTH_MAIL_SUPABASE_WORKDIR?.trim();
  return ["status", "-o", "env", ...(workdir ? ["--workdir", workdir] : [])];
}

/** The suite's environment from `supabase status -o env` output. Throws, naming no value. */
export function authMailEnvFromStatus(output) {
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

  // The database is judged as every local-only tool judges one
  // (isLoopbackDatabaseUrl): node-postgres, which the journeys write
  // memberships through, follows a host in the URL's query over the one the
  // URL shows (AL-2674). The two HTTP addresses have no such query.
  for (const name of ["API_URL", "MAILPIT_URL", "DB_URL"]) {
    const local =
      name === "DB_URL"
        ? isLoopbackDatabaseUrl(reported[name])
        : LOOPBACK_DATABASE_HOSTS.includes(new URL(reported[name]).hostname);
    if (!local) {
      throw new Error(
        `${name} is not on this machine; the auth email journeys run only against a local Supabase stack.`,
      );
    }
  }

  return Object.fromEntries(
    Object.entries(STATUS_NAMES).map(([from, to]) => [to, reported[from]]),
  );
}

function main(args) {
  const status = spawnSync(
    process.execPath,
    ["scripts/supabase-cli.mjs", ...statusArguments()],
    { cwd: repoRoot, encoding: "utf8", shell: false },
  );
  if (status.error || status.status !== 0) {
    console.error(
      `error: could not read the local Supabase stack (\`supabase status\` exit ${status.status ?? status.error?.message}). ${START_HINT}`,
    );
    return 1;
  }

  let suiteEnv;
  try {
    suiteEnv = authMailEnvFromStatus(status.stdout);
  } catch (error) {
    console.error(`error: ${error instanceof Error ? error.message : error}`);
    return 1;
  }

  const run = spawnSync(
    process.execPath,
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      "-c",
      "playwright.auth-mail.config.ts",
      ...args,
    ],
    {
      cwd: repoRoot,
      env: { ...process.env, ...suiteEnv },
      stdio: "inherit",
      shell: false,
    },
  );
  return run.status ?? 1;
}

const invokedDirectly =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) process.exit(main(process.argv.slice(2)));
