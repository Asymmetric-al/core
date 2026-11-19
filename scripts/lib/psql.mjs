// The seam for local database tooling (AL-2674; PR #2714 review; reviews L2,
// M3 and M4). One check judges every address the shared psql builders take:
// databaseUrlProblem in packages/env/src/database-url.mjs (shape, host,
// routing override, query allowlist). isLoopbackDatabaseUrl, re-exported
// here, is the only test that an address names this machine (127.0.0.1,
// localhost or [::1]), and it calls that check.
//
// Five files under scripts/ start psql. Three build the connection from an
// address, refuse what the check refuses, and keep no ambient PG* setting but
// the shared list KEPT_AMBIENT_LIBPQ_ENV (PGPASSWORD, PGSSLROOTCERT), of
// which this file keeps PGPASSWORD alone (review N5):
// - scripts/lib/psql.mjs, this file (runPsqlQuery, spawnPsql, or
//   psqlConnection for a caller's own spawn: the parsed parts as libpq
//   keywords, never the raw string, -X, the password in PGPASSWORD). The
//   catalog gate, the field-policy gate, the environment marker, the
//   local-database helper, the migration verifier and seed verify run
//   through it;
// - scripts/release/lib/postgres.mjs, the release job's own SQL, through PG*
//   variables built from the parsed address;
// - scripts/cms/lib/postgres.mjs, the CMS runner, the same way.
// Before each starts psql on a hosted address, which takes PGREQUIREAUTH, it
// runs psql --version through requirePsqlHonoursRequireAuth here, and stops
// below version 16 (reviews M3 and N6); the release job also calls that at
// the start of every hosted step.
// The other two are outside this seam:
// - scripts/verify/backup-restore-proof.mjs runs psql, pg_dump and pg_restore
//   inside a Docker container it starts, with no address;
// - scripts/verify/stripe-data-pipeline.mjs runs psql on a hosted
//   SUPABASE_DB_URL with a check and a builder of its own (left as it is by
//   review M4).
// scripts/document-cutover/assess-document-cutover.ts starts no psql: it
// judges its address with a check of its own and connects through
// node-postgres.
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
 * the connection, or the role it runs as, somewhere else. Of the shared list
 * KEPT_AMBIENT_LIBPQ_ENV only an ambient PGPASSWORD survives (reviews M3 and
 * N5), for a URL that carries none, so a caller can keep the password out of
 * the URL as well; a password in the URL, in its login or its query, wins and
 * never reaches the argument.
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
  // Reviews M3 and N5: of the shared list, PGPASSWORD alone. No caller needs
  // the CA from the environment: the release job's addresses name their CA
  // file as sslrootcert (release-database.mjs, withDatabaseCaFile), and the
  // CMS runner's psql goes through scripts/cms/lib/postgres.mjs. An ambient
  // PGSSLROOTCERT=system would make a hand-run hosted address that names no
  // CA trust the system store.
  const env = keptAmbientLibpqEnv(baseEnv, ["PGPASSWORD"]);
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

/** Reviews M3 and N6: the oldest psql whose libpq honours PGREQUIREAUTH. */
export const MIN_PSQL_MAJOR = 16;

/**
 * Throws unless `psqlBin --version` reports 16 or later (reviews M3 and N6).
 * PGREQUIREAUTH, which every hosted libpq connection takes
 * (HOSTED_LIBPQ_ENV), arrived in libpq 16, and an older libpq ignores it
 * without a word. Each of the three builders calls this before it starts
 * psql on an environment that carries PGREQUIREAUTH, so the floor holds
 * wherever a hosted address is used: the release job's steps, the CMS runner
 * and the reset guard alike. `env` should carry no PG* setting: the check
 * connects to nothing.
 */
export function requirePsqlHonoursRequireAuth({
  psqlBin = process.env.PSQL_BIN?.trim() || "psql",
  run = spawnSync,
  env = keptAmbientLibpqEnv(process.env, []),
} = {}) {
  const result = run(psqlBin, ["--version"], {
    encoding: "utf8",
    shell: false,
    env,
  });
  if (result.error)
    throw new Error(
      `psql version check: could not run psql (${result.error.code ?? "error"}).`,
    );
  const version = /PostgreSQL\)\s+(\d+)((?:\.\d+)*)/.exec(
    String(result.stdout ?? ""),
  );
  if (result.status !== 0 || !version)
    throw new Error(
      `could not read the version of psql (psql --version); a hosted connection needs psql ${MIN_PSQL_MAJOR} or later.`,
    );
  if (Number(version[1]) < MIN_PSQL_MAJOR)
    throw new Error(
      `found psql ${version[1]}${version[2]}; a hosted connection needs psql ${MIN_PSQL_MAJOR} or later, whose libpq honours PGREQUIREAUTH. An older libpq ignores it, and a server could then ask for the password in clear text. Install postgresql-client ${MIN_PSQL_MAJOR} or later.`,
    );
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
  if (env.PGREQUIREAUTH)
    requirePsqlHonoursRequireAuth({
      psqlBin,
      env: keptAmbientLibpqEnv(env, []),
    });
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
  if (env.PGREQUIREAUTH)
    requirePsqlHonoursRequireAuth({
      psqlBin,
      env: keptAmbientLibpqEnv(env, []),
    });
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
