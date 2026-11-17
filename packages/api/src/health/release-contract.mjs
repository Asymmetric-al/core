// The one module that names the database objects the release job and the
// application health routes call (plan 7.1, 7.4, 7.5; WP1.3). The SQL behind
// these names is written in another package (WP1.1). Keep every name the
// release code uses here, so that joining the two is a change to this file.
//
// Plain JavaScript with a sibling .d.mts: the release scripts import it with
// Node, and @asym/api imports it with TypeScript.

/** Build-time environment variable carrying the heads a build was made against. */
export const BUILD_MIGRATION_HEADS_ENV = "CORE_BUILD_MIGRATION_HEADS";

/** The two migration ledgers whose heads the release job and health check compare. */
export const MIGRATION_LEDGERS = Object.freeze(["supabase", "payload"]);

/** Environment marker values, in the only order a database may move through them. */
export const ENVIRONMENT_MARKERS = Object.freeze([
  "disposable",
  "shared",
  "production",
]);

/**
 * Database objects, as WP1.1 (slice 1.1a, migration
 * `platform_schema_marker_and_health`) defines them; WP1.1 owns the SQL:
 * - `public.platform_health()`: wrapper of the definer `platform.health()`,
 *   EXECUTE for `service_role` only, reachable through the Data API as the RPC
 *   `platform_health`. Returns jsonb
 *   `{ "environment": "disposable"|"shared"|"production"|null,
 *      "expected_heads": { "supabase"?: text, "payload"?: text },
 *      "applied_heads": { "supabase": text|null }, "checked_at": timestamptz }`.
 *   `environment` is null when the database has no marker; a ledger the
 *   release job has not recorded is absent from `expected_heads`.
 * - `platform.record_migration_head(p_ledger text, p_head text)`: records one
 *   ledger's expected head, forward only; run by `postgres` (the release job).
 * - `platform.advance_environment(p_kind text)`: moves the marker forward to
 *   `shared` or `production`; run by `postgres` (the dispatched step).
 */
export const RELEASE_DATABASE_CONTRACT = Object.freeze({
  healthRpc: "platform_health",
  healthFunction: "public.platform_health",
  recordHeadFunction: "platform.record_migration_head",
  advanceMarkerFunction: "platform.advance_environment",
});

const HEAD_PATTERN = /^[A-Za-z0-9_]{1,200}$/;

function fail(message) {
  throw new Error(`release health: ${message}`);
}

function readHead(value, ledger) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string" || !HEAD_PATTERN.test(value)) {
    fail(`the ${ledger} head is not a migration name`);
  }
  return value;
}

/**
 * Validates the health function's result.
 * @returns {{ environment: string | null, heads: { supabase: string | null, payload: string | null } }}
 */
export function parseReleaseHealth(value) {
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      fail("the result is not JSON");
    }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    fail("the result is not an object");
  }
  const environment = parsed.environment ?? null;
  if (environment !== null && !ENVIRONMENT_MARKERS.includes(environment)) {
    fail("the environment marker has an unknown value");
  }
  const heads = parsed.expected_heads;
  if (!heads || typeof heads !== "object" || Array.isArray(heads)) {
    fail("the result has no expected migration heads");
  }
  return {
    environment,
    heads: {
      supabase: readHead(heads.supabase, "supabase"),
      payload: readHead(heads.payload, "payload"),
    },
  };
}

/** Reads the build heads that next.config inlined; null when absent or malformed. */
export function parseBuildMigrationHeads(raw) {
  if (typeof raw !== "string" || raw.length === 0) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      supabase: readHead(parsed?.supabase, "supabase"),
      payload: readHead(parsed?.payload, "payload"),
    };
  } catch {
    return null;
  }
}

function compareLedger(build, database) {
  if (build === null) return database === null ? "equal" : "ahead";
  if (database === null) return "behind";
  if (database === build) return "equal";
  return database > build ? "ahead" : "behind";
}

/**
 * A database passes when, for every ledger, its head equals or follows the
 * build's head. A database that is ahead passes, so an application rolled back
 * after a later migration stays healthy (plan 7.4).
 */
export function compareMigrationHeads(build, database) {
  const ledgers = {};
  for (const ledger of MIGRATION_LEDGERS) {
    ledgers[ledger] = {
      build: build ? build[ledger] : null,
      database: database ? database[ledger] : null,
      state: build
        ? compareLedger(build[ledger], database?.[ledger] ?? null)
        : "unknown",
    };
  }
  if (!build) return { status: "unknown", ledgers };
  const behind = MIGRATION_LEDGERS.some(
    (ledger) => ledgers[ledger].state === "behind",
  );
  return { status: behind ? "behind" : "ok", ledgers };
}

/** True only for a move to a later marker; a database without one cannot move. */
export function isForwardMarkerChange(current, next) {
  const from = ENVIRONMENT_MARKERS.indexOf(current);
  const to = ENVIRONMENT_MARKERS.indexOf(next);
  return from !== -1 && to !== -1 && to > from;
}
