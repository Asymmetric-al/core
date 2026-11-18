// The one seam for database tooling (AL-2674, PR #2714 review): only
// isLoopbackDatabaseUrl, re-exported here from packages/env/src/database-url.mjs,
// decides that a URL names a database on this machine (a Postgres URL on
// 127.0.0.1, localhost or [::1] whose query carries no routing override), and
// psql starts only through this file (runPsqlQuery, spawnPsql, or
// psqlConnection for a caller's own spawn), with the URL as the whole target,
// handed to libpq as its parsed parts and never as the raw string, psql's
// startup file skipped (-X), every ambient PG* setting dropped and the
// password in PGPASSWORD, never in the argument list. The catalog gate, the field-policy gate, the environment
// marker, the migration verifier and seed verify run through it, and the
// release job runs the gates against hosted databases.
import { spawnSync } from "node:child_process";

import {
  LOOPBACK_DATABASE_HOSTS,
  databaseUrlRoutingOverrides,
  isLoopbackDatabaseUrl,
  libpqUrlMismatch,
} from "../../packages/env/src/database-url.mjs";

/** Whether a Postgres URL names a database on this machine (packages/env/src/database-url.mjs). */
export { isLoopbackDatabaseUrl };

/** Hostnames, as `URL#hostname` reports them, that name this machine. */
export const LOOPBACK_HOSTS = new Set(LOOPBACK_DATABASE_HOSTS);

/** One libpq keyword value, quoted as a connection string wants it. */
const conninfoValue = (value) =>
  `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;

/**
 * psql's connection argument and an environment that carries the password in
 * PGPASSWORD. The argument is a libpq keyword string built from the URL's
 * parsed parts (host, port, dbname, user, then the query's other settings),
 * never the raw URL, so libpq cannot read the URL differently from the code
 * that admitted it (PR #2714 review, H11). A URL whose shape libpq would read
 * as another target (libpqUrlMismatch), or whose query names a routing key, is
 * refused. Every other PG* setting is dropped: the URL is the whole target,
 * and an ambient PGHOSTADDR (which overrides the URL's host), PGSERVICE,
 * PGOPTIONS or a default for a part the URL leaves out could otherwise send
 * the connection, or the role it runs as, somewhere else. An ambient
 * PGPASSWORD is kept for a URL that carries none, so a caller can keep the
 * password out of the URL as well; a password in the URL, in its login or its
 * query, wins and never reaches the argument.
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
  const mismatch = libpqUrlMismatch(databaseUrl);
  if (mismatch !== null)
    throw new Error(
      `the database URL is refused because libpq would read it differently: ${mismatch}`,
    );
  const overrides = databaseUrlRoutingOverrides(url);
  if (overrides.length > 0)
    throw new Error(
      `the database URL names a routing override in its query (${overrides.join(", ")}); name the target in the URL itself`,
    );
  const env = Object.fromEntries(
    Object.entries(baseEnv).filter(
      ([key]) => !key.startsWith("PG") || key === "PGPASSWORD",
    ),
  );
  const settings = [...url.searchParams].filter(([key]) => key !== "password");
  const queryPassword = url.searchParams.get("password");
  if (queryPassword !== null) env.PGPASSWORD = queryPassword;
  if (url.password) env.PGPASSWORD = decodeURIComponent(url.password);
  const keywords = [
    ["host", url.hostname.replace(/^\[(.*)\]$/, "$1")],
    ["port", url.port],
    ["dbname", decodeURIComponent(url.pathname.replace(/^\//, ""))],
    ["user", decodeURIComponent(url.username)],
    ...settings,
  ].filter(([, value]) => value !== "");
  return {
    connection: keywords
      .map(([key, value]) => `${key}=${conninfoValue(value)}`)
      .join(" "),
    env,
  };
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
  // -X: a ~/.psqlrc or a PSQLRC file could otherwise \connect elsewhere (H11).
  return spawnSync(psqlBin, [connection, "-X", ...args], {
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
