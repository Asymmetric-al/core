// Environment marker (plan 7.5, AL-2674). A database records whether it is
// `disposable`, `shared` or `production` in `platform.environment`, read
// through `platform.environment_kind()`. Every script that resets or reseeds a
// database reads the marker from its target first and refuses anything but
// `disposable`. A database with no marker, including one that predates the
// marker migration, counts as not disposable.
import { isLoopbackDatabaseUrl, runPsqlQuery } from "./psql.mjs";

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

function query(databaseUrl, sql, psqlBin) {
  try {
    return runPsqlQuery({ databaseUrl, sql, psqlBin }).trim();
  } catch (error) {
    throw new Error(
      `could not read the environment marker: ${error instanceof Error ? error.message : error}`,
    );
  }
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
 * Throws unless `readKind()` returns `disposable`. A target whose marker
 * cannot be read is refused too. `where` names the target and `action` what
 * the caller was about to do, for the message; `hint` is appended when the
 * target has no marker.
 */
export function requireDisposableTarget({
  where,
  action = "reset or reseed",
  readKind,
  hint = "",
}) {
  let kind;
  try {
    kind = readKind();
  } catch (error) {
    throw new Error(
      `refusing to ${action} ${where}: ${error instanceof Error ? error.message : error}`,
    );
  }
  const verdict = assessEnvironmentMarker(kind);
  if (!verdict.ok)
    throw new Error(
      `refusing to ${action} ${where}: it ${verdict.reason}${verdict.kind === null ? hint : ""}`,
    );
  return verdict;
}

/**
 * Throws unless the database at `databaseUrl` is marked `disposable`. A
 * database that cannot be read is refused too. `action` names what the caller
 * was about to do, for the message.
 */
export function requireDisposableDatabase({
  databaseUrl,
  action = "reset or reseed",
  psqlBin,
}) {
  if (!databaseUrl) throw new Error(`refusing to ${action}: no database URL`);
  return requireDisposableTarget({
    where: describeDatabase(databaseUrl),
    action,
    readKind: () => readEnvironmentMarker({ databaseUrl, psqlBin }),
    hint: isLoopbackDatabaseUrl(databaseUrl) ? LOCAL_HINT : "",
  });
}

// A reset would mark such a stack, but resets are refused without a marker,
// so the one-time recovery recreates the stack's volumes instead.
const LOCAL_HINT =
  ". A local stack that predates the marker, or that already held data when the marker migration ran, is recovered once by recreating it from source: `bun run supabase -- stop --no-backup` (this deletes the local stack's data), then `bun run supabase -- start`";
