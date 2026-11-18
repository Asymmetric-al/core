import {
  SUPABASE_POOLER_HOST,
  databaseUrlHostProblem,
  databaseUrlRoutingOverrides,
  isLoopbackDatabaseUrl,
} from "../../../packages/env/src/database-url.mjs";
import { CMS_MIGRATION_ROLE } from "./migration-connection.mjs";

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

  if (
    databaseUrlRoutingOverrides(database).length > 0 ||
    environment.PGHOSTADDR ||
    environment.PGSERVICE
  ) {
    throw new Error("CMS migration does not allow database routing overrides.");
  }

  if (isLoopbackDatabaseUrl(database)) return;
  // Review L1: one host rule, then Supabase's pooler pattern, not a suffix.
  if (databaseUrlHostProblem(database) !== null) {
    throw new Error("CMS migration refuses this database host.");
  }
  const hostname = database.hostname.replace(/^\[|\]$/g, "");

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

  const sslmodes = database.searchParams.getAll("sslmode");
  if (sslmodes.length > 1) {
    throw new Error(
      "Hosted CMS migrations require an explicit encrypted database connection.",
    );
  }
  const sslmode = sslmodes[0] ?? environment.PGSSLMODE;
  if (!["require", "verify-ca", "verify-full", "no-verify"].includes(sslmode)) {
    throw new Error(
      "Hosted CMS migrations require an explicit encrypted database connection.",
    );
  }
}
