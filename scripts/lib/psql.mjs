// One way to run psql against a Postgres URL (AL-2674). The password travels
// in PGPASSWORD, never in the argument list, so it does not show in process
// listings; and one list says which hosts are loopback. The catalog gate, the
// field-policy gate and the environment marker run through it, and the release
// job runs those against hosted databases.
import { spawnSync } from "node:child_process";

import {
  LOOPBACK_DATABASE_HOSTS,
  isLoopbackDatabaseUrl,
} from "../../packages/env/src/database-url.mjs";

/** Whether a Postgres URL names a database on this machine (packages/env/src/database-url.mjs). */
export { isLoopbackDatabaseUrl };

/** Hostnames, as `URL#hostname` reports them, that name this machine. */
export const LOOPBACK_HOSTS = new Set(LOOPBACK_DATABASE_HOSTS);

/**
 * psql's connection argument (the URL without its password) and an
 * environment that carries the password in PGPASSWORD. Every other PG*
 * setting is dropped: the URL is the whole target, and an ambient PGHOSTADDR
 * (which overrides the URL's host), PGSERVICE, PGOPTIONS or a default for a
 * part the URL leaves out could otherwise send the connection, or the role it
 * runs as, somewhere else. An ambient PGPASSWORD is kept for a URL that
 * carries none, so a caller can keep the password out of the URL as well.
 */
export function psqlConnection(databaseUrl, baseEnv = process.env) {
  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error("the database URL is not a valid Postgres URL");
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol))
    throw new Error("the database URL must use postgres:// or postgresql://");
  const env = Object.fromEntries(
    Object.entries(baseEnv).filter(
      ([key]) => !key.startsWith("PG") || key === "PGPASSWORD",
    ),
  );
  if (url.password) {
    env.PGPASSWORD = decodeURIComponent(url.password);
    url.password = "";
  }
  return { connection: url.toString(), env };
}

/**
 * Starts psql on `databaseUrl` through psqlConnection, with `args` after the
 * connection argument and this process's standard output and error. `input`,
 * when given, is written to psql's standard input. Returns spawnSync's result.
 */
export function spawnPsql({
  databaseUrl,
  args,
  input,
  psqlBin = "psql",
  cwd,
  baseEnv = process.env,
}) {
  const { connection, env } = psqlConnection(databaseUrl, baseEnv);
  return spawnSync(psqlBin, [connection, ...args], {
    cwd,
    env,
    shell: false,
    stdio: input === undefined ? "inherit" : ["pipe", "inherit", "inherit"],
    ...(input === undefined ? {} : { input }),
  });
}

/**
 * Runs one SQL command with psql in unaligned, tuples-only mode and returns
 * its standard output. Throws with psql's error output when it fails.
 */
export function runPsqlQuery({ databaseUrl, sql, psqlBin = "psql", cwd }) {
  const { connection, env } = psqlConnection(databaseUrl);
  const result = spawnSync(
    psqlBin,
    [connection, "-X", "-q", "-v", "ON_ERROR_STOP=1", "-At", "-c", sql],
    {
      cwd,
      env,
      encoding: "utf8",
      shell: false,
      maxBuffer: 256 * 1024 * 1024,
    },
  );
  if (result.error)
    throw new Error(`could not run psql: ${result.error.message}`);
  if (result.status !== 0)
    throw new Error(
      (result.stderr ?? "").trim() || `psql exited ${result.status}`,
    );
  return result.stdout;
}
