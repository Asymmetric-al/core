// Environment marker (plan 7.5, AL-2674). A database records whether it is
// `disposable`, `shared` or `production` in `platform.environment`, read
// through `platform.environment_kind()`. Every script that resets or reseeds a
// database reads the marker from its target first and refuses anything but
// `disposable`. A database with no marker, including one that predates the
// marker migration, counts as not disposable.
import { spawnSync } from "node:child_process";

export const DISPOSABLE = "disposable";
const MARKER_FUNCTION = "platform.environment_kind()";

/**
 * Pure decision. `kind` is the marker value, or null when the database has
 * none. Returns { ok: true } only for `disposable`.
 */
export function assessEnvironmentMarker(kind) {
  if (kind === DISPOSABLE) return { ok: true, kind };
  if (kind === null || kind === undefined || kind === "")
    return {
      ok: false,
      kind: null,
      reason:
        "has no environment marker, so it counts as not disposable (plan 7.5)",
    };
  return {
    ok: false,
    kind,
    reason: `is marked ${kind}; only a database marked disposable may be reset or reseeded (plan 7.5)`,
  };
}

/** Host and database of a Postgres URL, for messages; never the credentials. */
export function describeDatabase(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    return `${url.hostname}:${url.port || "5432"}${url.pathname || "/"}`;
  } catch {
    return "<unparseable database URL>";
  }
}

/**
 * psql arguments and environment for a URL, with the password moved out of
 * the process arguments into PGPASSWORD.
 */
function psqlConnection(databaseUrl) {
  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error("the database URL is not a valid Postgres URL");
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol))
    throw new Error("the database URL must use postgres:// or postgresql://");
  const env = { ...process.env };
  delete env.PGSERVICE;
  if (url.password) env.PGPASSWORD = decodeURIComponent(url.password);
  url.password = "";
  return { dbname: url.toString(), env };
}

function query(databaseUrl, sql, psqlBin) {
  const { dbname, env } = psqlConnection(databaseUrl);
  const result = spawnSync(
    psqlBin,
    ["-X", "-q", "-At", "-v", "ON_ERROR_STOP=1", "-d", dbname, "-c", sql],
    { encoding: "utf8", env, shell: false },
  );
  if (result.error)
    throw new Error(`could not run psql: ${result.error.message}`);
  if (result.status !== 0)
    throw new Error(
      `could not read the environment marker: ${(result.stderr || "").trim() || `psql exited ${result.status}`}`,
    );
  return result.stdout.trim();
}

/** The marker of the target database, or null when it has none. */
export function readEnvironmentMarker({
  databaseUrl,
  psqlBin = process.env.PSQL_BIN?.trim() || "psql",
}) {
  const present = query(
    databaseUrl,
    `select to_regprocedure('${MARKER_FUNCTION}') is not null`,
    psqlBin,
  );
  if (present !== "t") return null;
  const kind = query(
    databaseUrl,
    `select coalesce(${MARKER_FUNCTION}, '')`,
    psqlBin,
  );
  return kind === "" ? null : kind;
}

/**
 * Throws unless the target database is marked `disposable`. A database that
 * cannot be read is refused too. `action` names what the caller was about to
 * do, for the message.
 */
export function requireDisposableDatabase({
  databaseUrl,
  action = "reset or reseed",
  psqlBin,
}) {
  if (!databaseUrl) throw new Error(`refusing to ${action}: no database URL`);
  const where = describeDatabase(databaseUrl);
  let kind;
  try {
    kind = readEnvironmentMarker({ databaseUrl, psqlBin });
  } catch (error) {
    throw new Error(
      `refusing to ${action} ${where}: ${error instanceof Error ? error.message : error}`,
    );
  }
  const verdict = assessEnvironmentMarker(kind);
  if (!verdict.ok)
    throw new Error(
      `refusing to ${action} ${where}: it ${verdict.reason}${
        verdict.kind === null && isLoopback(databaseUrl) ? LOCAL_HINT : ""
      }`,
    );
  return verdict;
}

const LOOPBACK = new Set(["127.0.0.1", "localhost", "[::1]", "::1"]);
const LOCAL_HINT =
  ". A local stack that predates the marker, or that already held data when the marker migration ran, is rebuilt from source and marked disposable by running `bun run supabase -- db reset --local` yourself";

function isLoopback(databaseUrl) {
  try {
    return LOOPBACK.has(new URL(databaseUrl).hostname);
  } catch {
    return false;
  }
}
