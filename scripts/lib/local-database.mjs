// The repository's one local-database decision and psql runner for shell
// scripts (PR #2714 review). A script names the environment variable that
// holds the URL, never the URL itself, so a password in it stays out of every
// argument list.
//
//   node scripts/lib/local-database.mjs admit SUPABASE_DB_URL
//     exits 0 when isLoopbackDatabaseUrl admits the URL, and 1 otherwise.
//   node scripts/lib/local-database.mjs psql SUPABASE_DB_URL [psql arguments]
//     refuses (1) a URL the decision does not admit; otherwise runs psql on it
//     through spawnPsql (the URL is the whole target, every ambient PG*
//     setting is dropped, the password travels in PGPASSWORD) and exits with
//     psql's status.
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isLoopbackDatabaseUrl, spawnPsql } from "./psql.mjs";

const COMMANDS = new Set(["admit", "psql"]);

/** The exit status for `argv` (the arguments after the script) and `env`. */
export function localDatabaseCommand(argv, env = process.env) {
  const [command, variable, ...psqlArgs] = argv;
  if (!COMMANDS.has(command) || !/^[A-Z_][A-Z0-9_]*$/.test(variable ?? "")) {
    process.stderr.write(
      "usage: node scripts/lib/local-database.mjs admit|psql <ENV_VARIABLE> [psql arguments]\n",
    );
    return 2;
  }
  const admitted = isLoopbackDatabaseUrl(env[variable]);
  if (command === "admit") return admitted ? 0 : 1;
  if (!admitted) {
    process.stderr.write(
      `Refusing to run psql: ${variable} does not name a database on this machine.\n`,
    );
    return 1;
  }
  const result = spawnPsql({
    databaseUrl: env[variable],
    args: psqlArgs,
    baseEnv: env,
  });
  if (result.error) {
    process.stderr.write(`could not run psql: ${result.error.message}\n`);
    return 1;
  }
  return result.status ?? 1;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url))
  process.exitCode = localDatabaseCommand(process.argv.slice(2));
