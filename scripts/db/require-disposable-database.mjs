#!/usr/bin/env node
// Refuses (exit 1) unless the target database carries the `disposable`
// environment marker (plan 7.5, AL-2674). Reset and reseed scripts call it
// before they touch a database.
//
//   node scripts/db/require-disposable-database.mjs --local
//       the local Supabase stack of this checkout (`supabase status`)
//   node scripts/db/require-disposable-database.mjs --url-env NAME
//       the database whose URL is in environment variable NAME
//
// The URL is never taken from the command line, so its password stays out of
// process listings, and it is never printed.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { requireDisposableDatabase } from "../lib/environment-marker.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

/** DB_URL from `supabase status -o env` output, or null. */
export function parseStatusDatabaseUrl(output) {
  for (const raw of output.split(/\r?\n/)) {
    const m = /^\s*(?:export\s+)?DB_URL\s*=\s*"?([^"\s]+)"?\s*$/.exec(raw);
    if (m) return m[1];
  }
  return null;
}

function localDatabaseUrl() {
  const result = spawnSync(
    "bun",
    ["run", "supabase", "--", "status", "--output", "env"],
    {
      cwd: repoRoot,
      encoding: "utf8",
      shell: process.platform === "win32",
    },
  );
  const url =
    result.status === 0 ? parseStatusDatabaseUrl(result.stdout ?? "") : null;
  if (!url)
    throw new Error(
      "refusing: the local Supabase stack's database URL could not be read (is `bun run supabase -- start` running?)",
    );
  return url;
}

/** Parses argv into the target URL. Throws on a usage error. */
export function resolveTarget(
  argv,
  env = process.env,
  local = localDatabaseUrl,
) {
  if (argv.length === 1 && argv[0] === "--local") return local();
  if (argv.length === 2 && argv[0] === "--url-env") {
    const value = env[argv[1]]?.trim();
    if (!value)
      throw new Error(`refusing: environment variable ${argv[1]} is not set`);
    return value;
  }
  throw new Error(
    "usage: require-disposable-database.mjs --local | --url-env NAME",
  );
}

const invokedDirectly =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  try {
    const databaseUrl = resolveTarget(process.argv.slice(2));
    requireDisposableDatabase({ databaseUrl });
    console.log("ok: the target database is marked disposable");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
