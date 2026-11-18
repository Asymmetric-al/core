// The repository's one local-database decision for shell scripts (PR #2714
// review). A script names the environment variable that holds the URL, never
// the URL itself, so a password in it stays out of every argument list.
//
//   node scripts/lib/local-database.mjs admit SUPABASE_DB_URL
//     exits 0 when isLoopbackDatabaseUrl admits the URL, and 1 otherwise.
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isLoopbackDatabaseUrl } from "./psql.mjs";

/** The exit status for `argv` (the arguments after the script) and `env`. */
export function localDatabaseCommand(argv, env = process.env) {
  const [command, variable] = argv;
  if (command !== "admit" || !/^[A-Z_][A-Z0-9_]*$/.test(variable ?? "")) {
    process.stderr.write(
      "usage: node scripts/lib/local-database.mjs admit <ENV_VARIABLE>\n",
    );
    return 2;
  }
  return isLoopbackDatabaseUrl(env[variable]) ? 0 : 1;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url))
  process.exitCode = localDatabaseCommand(process.argv.slice(2));
