// Ties a migration connection string to the Supabase project the release
// environment names, before anything writes to it. Errors never repeat the
// connection string.
import {
  SUPABASE_POOLER_HOST,
  databaseUrlProblem,
  assertHostedDatabaseTls,
  databaseUrlRoutingOverrides,
  isLoopbackDatabaseUrl,
  libpqQueryEntries,
} from "../../../packages/env/src/database-url.mjs";

/**
 * Hosted projects named in docs/ops/environments.md. There are two and no
 * third: the production-named project is the disposable `preview` project
 * until WP11 decides production's database.
 */
export const KNOWN_PROJECT_REFS = Object.freeze({
  development: "pnmlrbgjiqzzsthsoikm",
  preview: "btewedpsxwsjczvmegby",
});

const REF = /^[a-z0-9]{20}$/;
const ROLE = /^[a-z_][a-z0-9_]{0,62}$/;

function parse(databaseUrl) {
  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error("The release database connection is not a valid URL.");
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("The release database connection is not a Postgres URL.");
  }
  return url;
}

export function assertDatabaseTarget({
  databaseUrl,
  projectRef,
  role,
  forbiddenRefs = [],
  allowLoopback = false,
}) {
  if (!REF.test(projectRef ?? "")) {
    throw new Error(
      "The release environment names no valid Supabase project ref.",
    );
  }
  if (!ROLE.test(role ?? "")) {
    throw new Error("The release database role is not a plain role name.");
  }
  if (forbiddenRefs.includes(projectRef)) {
    throw new Error(
      `This release environment must not touch Supabase project ${projectRef}.`,
    );
  }
  const url = parse(databaseUrl);
  if (databaseUrlRoutingOverrides(url).length > 0) {
    throw new Error(
      "The release database connection carries routing overrides.",
    );
  }
  // Review K1: the URL also reaches psql (the reset wrapper reads the marker
  // through scripts/lib/psql.mjs), so it must be one libpq reads as `URL` does,
  // with only the query keys psql may take.
  const libpqProblem = databaseUrlProblem(databaseUrl, { forPsql: true });
  if (libpqProblem !== null) {
    throw new Error(
      `The release database connection's query or shape is refused: ${libpqProblem}.`,
    );
  }
  if (isLoopbackDatabaseUrl(url)) {
    if (allowLoopback) return;
    throw new Error("A hosted release refuses a loopback database.");
  }
  // Review M1: one place for a secret. The Supabase CLI gets the address as
  // --db-url without passwords (splitPassword); hosted inputs keep their
  // password in one place regardless of how they will be consumed.
  if (libpqQueryEntries(databaseUrl).some(([key]) => key === "password")) {
    throw new Error(
      "A hosted release database connection carries a password in its query (password=...). Put the password in the login part of RELEASE_DATABASE_URL instead (postgres.<ref>:<password>@<host>), percent-encoded.",
    );
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const user = decodeURIComponent(url.username);
  const direct = host === `db.${projectRef}.supabase.co` && user === role;
  const pooled =
    SUPABASE_POOLER_HOST.test(host) && user === `${role}.${projectRef}`;
  if (!direct && !pooled) {
    throw new Error(
      `The release database connection does not address project ${projectRef} as ${role}.`,
    );
  }
  // Review L6: the job verifies the server's certificate and its host name
  // against the project's CA, which it writes from RELEASE_DATABASE_SSL_CA
  // (release-database.mjs, withDatabaseCaFile). sslmode=require verifies
  // nothing without a CA file, and verify-ca never checks the name.
  assertHostedDatabaseTls(url);
}
