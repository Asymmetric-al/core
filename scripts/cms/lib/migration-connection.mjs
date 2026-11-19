import { isLoopbackDatabaseUrl } from "../../../packages/env/src/database-url.mjs";
import { LOCAL_DATABASE_URL } from "./local-data.mjs";

/** The role that owns schema cms and runs Payload migrations (plan 7.2). */
export const CMS_MIGRATION_ROLE = "cms_owner";

/** Set only in the release job's CMS migration step, never in an app runtime. */
export const CMS_MIGRATION_DATABASE_ENV_KEY = "PAYLOAD_MIGRATION_DATABASE_URI";

function nonEmpty(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parsePostgresUrl(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    // Never echo the value: it carries a credential.
  }
  if (
    !url ||
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !url.hostname
  ) {
    throw new Error(`${label} must be a valid Postgres URL.`);
  }
  return url;
}

/**
 * Chooses the connection that Payload migrations run on.
 *
 * - The release job sets PAYLOAD_MIGRATION_DATABASE_URI to the cms_owner
 *   login. It is the only source for a hosted database.
 * - On a loopback database (local development and CI) the run-time URL is
 *   reused with the session role set to cms_owner, so every object a
 *   migration creates is owned by cms_owner without a stored password. The
 *   login must be a member of cms_owner, which the role migration grants to
 *   the Supabase migration runner.
 * - A read-only status check may use the run-time connection.
 *
 * `markerUrl` is the connection to read the environment marker through
 * (plan 7.5) before a rollback or reset: on a loopback database the same
 * login without the session role, because cms_owner holds nothing outside
 * cms and cannot read `platform`. A hosted cms_owner login cannot read it
 * either, so a rollback or reset of a hosted CMS schema is always refused.
 *
 * The Core migration string (SUPABASE_DB_URL) is never used (NA-04).
 */
export function resolveCmsMigrationDatabaseUrl(
  env = process.env,
  { readOnly = false } = {},
) {
  const migrationUrl = nonEmpty(env[CMS_MIGRATION_DATABASE_ENV_KEY]);
  if (migrationUrl) {
    parsePostgresUrl(migrationUrl, CMS_MIGRATION_DATABASE_ENV_KEY);
    return {
      databaseUrl: migrationUrl,
      markerUrl: migrationUrl,
      source: CMS_MIGRATION_DATABASE_ENV_KEY,
    };
  }

  const runtimeUrl = nonEmpty(env.PAYLOAD_DATABASE_URI) ?? LOCAL_DATABASE_URL;
  const runtime = parsePostgresUrl(runtimeUrl, "PAYLOAD_DATABASE_URI");

  if (readOnly) {
    return {
      databaseUrl: runtimeUrl,
      markerUrl: runtimeUrl,
      source: "PAYLOAD_DATABASE_URI",
    };
  }

  // The repository's one local-database decision: a loopback host and no
  // routing override in the query, which node-postgres would follow instead.
  if (!isLoopbackDatabaseUrl(runtime)) {
    throw new Error(
      `PAYLOAD_DATABASE_URI does not name a database on this machine (a loopback host with no routing override). Set ${CMS_MIGRATION_DATABASE_ENV_KEY} to the ${CMS_MIGRATION_ROLE} connection before migrating a hosted CMS schema. Payload's run-time connection cannot change the schema.`,
    );
  }

  const options = runtime.searchParams.get("options") ?? "";
  if (/(?:^|\s)(?:-c\s*|--)role\s*=/.test(options)) {
    throw new Error(
      "PAYLOAD_DATABASE_URI already chooses a session role; remove it before migrating.",
    );
  }
  runtime.searchParams.set(
    "options",
    [options.trim(), `-c role=${CMS_MIGRATION_ROLE}`].filter(Boolean).join(" "),
  );
  // Review L2: written with %20 and never +, so libpq (which keeps a + as +)
  // and WHATWG URL (which reads it as a space) read the same options.
  runtime.search = [...runtime.searchParams]
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
  return {
    databaseUrl: runtime.toString(),
    markerUrl: runtimeUrl,
    source: "loopback-session-role",
  };
}
