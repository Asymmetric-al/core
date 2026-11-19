import { X509Certificate } from "node:crypto";

import {
  SUPABASE_POOLER_HOST,
  databaseUrlProblem,
  assertHostedDatabaseTls,
  isLoopbackDatabaseUrl,
  libpqQueryEntries,
} from "../../../packages/env/src/database-url.mjs";
import { readDatabaseCa } from "../../release/release-database.mjs";
import { CMS_MIGRATION_ROLE } from "./migration-connection.mjs";
import { assertProjectCaFile } from "./postgres.mjs";

export function assertCmsMigrationTarget({
  databaseUrl,
  supabaseUrl,
  approvedProjectRef,
  environment = process.env,
}) {
  let database;
  let username;
  try {
    database = new URL(databaseUrl);
    username = decodeURIComponent(database.username);
  } catch {
    throw new Error("CMS migration requires a valid Postgres database URL.");
  }
  if (!["postgres:", "postgresql:"].includes(database.protocol)) {
    throw new Error("CMS migration requires a Postgres database URL.");
  }

  // Review L2: the one check, not routing keys only.
  const problem = databaseUrlProblem(databaseUrl);
  if (problem !== null || environment.PGHOSTADDR || environment.PGSERVICE) {
    throw new Error(
      `CMS migration does not allow database routing overrides or an address the shared check refuses${problem ? ` (${problem})` : ""}.`,
    );
  }

  if (isLoopbackDatabaseUrl(database)) return;
  const hostname = database.hostname.replace(/^\[|\]$/g, "");

  // Review M1: the release check's rule. A secret has one place, the login
  // part; a password in the query is refused, not moved.
  if (libpqQueryEntries(databaseUrl).some(([key]) => key === "password")) {
    throw new Error(
      "A hosted CMS migration address carries a password in its query (password=...). Put the password in the login part instead (<role>.<ref>:<password>@<host>), percent-encoded.",
    );
  }

  let ref;
  try {
    const configured = new URL(supabaseUrl);
    if (configured.protocol !== "https:") throw new Error();
    ref = /^([a-z0-9-]+)\.supabase\.co$/.exec(configured.hostname)?.[1];
  } catch {
    // Report the configuration requirement without including private values.
  }
  if (!ref) {
    throw new Error(
      "Hosted CMS migration requires the configured Supabase project URL.",
    );
  }
  if (approvedProjectRef !== ref) {
    throw new Error(
      "Set CMS_HOSTED_MIGRATION_REF to the intended Supabase project ref before a hosted migration.",
    );
  }

  // Payload migrations run as cms_owner, never as postgres (plan 7.2). A
  // qualification branch may still name another plain, unprivileged role.
  const role = environment.CMS_HOSTED_MIGRATION_ROLE || CMS_MIGRATION_ROLE;
  if (!/^[a-z_][a-z0-9_]{0,62}$/.test(role)) {
    throw new Error(
      "CMS_HOSTED_MIGRATION_ROLE must be a plain Postgres role name.",
    );
  }
  if (["postgres", "supabase_admin"].includes(role)) {
    throw new Error(
      `Hosted CMS migrations run as ${CMS_MIGRATION_ROLE}, not as ${role}.`,
    );
  }

  const direct = hostname === `db.${ref}.supabase.co` && username === role;
  const pooled =
    SUPABASE_POOLER_HOST.test(hostname) && username === `${role}.${ref}`;
  if (!direct && !pooled) {
    throw new Error(
      "The CMS database target does not match the approved Supabase project.",
    );
  }

  // Review L7: the release job's own rule (L6) on the same seam. The address
  // itself says verify-full, once: no-verify, require and verify-ca do not
  // check both the certificate and the host name, and PGSSLMODE never reaches
  // the runner's psql (lib/postgres.mjs drops it) or Payload.
  assertHostedDatabaseTls(database);
  // Review M3: one CA route. An address's sslrootcert would override
  // PGSSLROOTCERT for the runner's psql (lib/postgres.mjs), while Payload
  // refuses it beside PAYLOAD_DATABASE_SSL_CA; sslrootcert=system would trust
  // the machine's own store.
  if (libpqQueryEntries(databaseUrl).some(([key]) => key === "sslrootcert")) {
    throw new Error(
      "A hosted CMS migration address names its own CA (sslrootcert). Leave it out: Payload reads the CA from PAYLOAD_DATABASE_SSL_CA and the runner's psql from PGSSLROOTCERT.",
    );
  }
  // No CA, no connection. Payload checks the server against
  // PAYLOAD_DATABASE_SSL_CA (apps/admin/src/cms/payload-database-config.ts),
  // and the runner's psql against the file PGSSLROOTCERT names.
  if (
    !environment.PAYLOAD_DATABASE_SSL_CA?.trim() ||
    !environment.PGSSLROOTCERT?.trim()
  ) {
    throw new Error(
      "A hosted CMS migration needs the project's CA: set PAYLOAD_DATABASE_SSL_CA to its PEM, for Payload, and PGSSLROOTCERT to a file holding the same certificate, for the runner's psql. The release job sets both from RELEASE_DATABASE_SSL_CA.",
    );
  }
  // The last check's P3 (phase 15): set is not enough. PGSSLROOTCERT=system
  // would trust the machine's whole store, so the file must hold the
  // project's CA, read by the release job's own check.
  const fileCa = new X509Certificate(
    assertProjectCaFile(environment.PGSSLROOTCERT),
  );
  // Phase 16, Q1: Payload makes the migration's writes, and node-postgres
  // trusts every certificate in PAYLOAD_DATABASE_SSL_CA, so a bundle of
  // authorities would pass a non-empty check. It is read by the same check,
  // and must be the very certificate the file holds.
  const payloadCa = new X509Certificate(
    readDatabaseCa(environment.PAYLOAD_DATABASE_SSL_CA, {
      name: "PAYLOAD_DATABASE_SSL_CA",
    }),
  );
  if (!payloadCa.raw.equals(fileCa.raw)) {
    throw new Error(
      `PAYLOAD_DATABASE_SSL_CA and the file PGSSLROOTCERT names hold different certificates (SHA-256 ${payloadCa.fingerprint256} and ${fileCa.fingerprint256}). Both must hold the project's CA, the same PEM from its Database settings.`,
    );
  }
}
