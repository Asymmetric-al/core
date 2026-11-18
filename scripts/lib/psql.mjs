// The seam for local database tooling (AL-2674; PR #2714 review; review L2).
// One check judges every database address: databaseUrlProblem in
// packages/env/src/database-url.mjs (shape, host, routing override, query
// allowlist). isLoopbackDatabaseUrl, re-exported here, is the only test that
// an address names this machine (127.0.0.1, localhost or [::1]), and it calls
// that check. Three files start psql, and each refuses what the check
// refuses: this one (runPsqlQuery, spawnPsql, or psqlConnection for a caller's
// own spawn: the parsed parts as libpq keywords, never the raw string, -X,
// every ambient PG* setting dropped but the shared list KEPT_AMBIENT_LIBPQ_ENV,
// the password in PGPASSWORD);
// scripts/release/lib/postgres.mjs, the release job's own SQL, through PG*
// variables built from the parsed address; and scripts/cms/lib/postgres.mjs,
// the CMS runner, the same way. The catalog gate, the field-policy gate, the
// environment marker, the migration verifier and seed verify run through this
// file.
import { spawnSync } from "node:child_process";

import {
  LOOPBACK_DATABASE_HOSTS,
  HOSTED_LIBPQ_ENV,
  databaseUrlProblem,
  isLoopbackDatabaseUrl,
  keptAmbientLibpqEnv,
  libpqQueryEntries,
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
 * as another target (libpqUrlMismatch) is refused, and so is any query key not
 * on DATABASE_URL_QUERY_KEYS for psql (review K1: libpq skips blanks around a
 * keyword and lets a later one win, so `?%20host=` used to route psql). The
 * query is read as libpq reads it (libpqQueryEntries), and every value is
 * quoted, so no value can add a keyword. Every other PG* setting is dropped: the URL is the whole target,
 * and an ambient PGHOSTADDR (which overrides the URL's host), PGSERVICE,
 * PGOPTIONS or a default for a part the URL leaves out could otherwise send
 * the connection, or the role it runs as, somewhere else. Only the shared
 * list KEPT_AMBIENT_LIBPQ_ENV survives (review M3): an ambient PGPASSWORD,
 * for a URL that carries none, so a caller can keep the password out of the
 * URL as well (a password in the URL, in its login or its query, wins and
 * never reaches the argument); and an ambient PGSSLROOTCERT, which the URL's
 * own sslrootcert keyword overrides.
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
  const problem = databaseUrlProblem(databaseUrl, { forPsql: true });
  if (problem !== null)
    throw new Error(`the database URL is refused for psql: ${problem}`);
  // Review M3: the shared list of ambient settings a builder may keep.
  const env = keptAmbientLibpqEnv(baseEnv);
  const query = libpqQueryEntries(databaseUrl);
  const settings = query.filter(([key]) => key !== "password");
  const queryPassword = query.find(([key]) => key === "password");
  if (queryPassword) env.PGPASSWORD = queryPassword[1];
  if (url.password) env.PGPASSWORD = decodeURIComponent(url.password);
  if (!isLoopbackDatabaseUrl(url)) Object.assign(env, HOSTED_LIBPQ_ENV);
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
