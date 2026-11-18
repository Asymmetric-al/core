// One way to run psql against a Postgres URL (AL-2674). The password travels
// in PGPASSWORD, never in the argument list, so it does not show in process
// listings; and one list says which hosts are loopback. The catalog gate, the
// field-policy gate and the environment marker run through it, and the release
// job runs those against hosted databases.
import { spawnSync } from "node:child_process";

/** Hostnames, as `URL#hostname` reports them, that name this machine. */
export const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

/** Whether a Postgres URL names a database on this machine. */
export function isLoopbackDatabaseUrl(databaseUrl) {
  try {
    return LOOPBACK_HOSTS.has(new URL(databaseUrl).hostname);
  } catch {
    return false;
  }
}

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
