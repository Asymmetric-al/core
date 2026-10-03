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
    ["host", "hostaddr", "service", "user", "dbname"].some((key) =>
      database.searchParams.has(key),
    ) ||
    environment.PGHOSTADDR ||
    environment.PGSERVICE
  ) {
    throw new Error("CMS migration does not allow database routing overrides.");
  }

  const hostname = database.hostname.replace(/^\[|\]$/g, "");
  if (["localhost", "127.0.0.1", "::1"].includes(hostname)) return;

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

  const direct =
    hostname === `db.${ref}.supabase.co` && username === "postgres";
  const pooled =
    hostname.endsWith(".pooler.supabase.com") && username === `postgres.${ref}`;
  if (!direct && !pooled) {
    throw new Error(
      "The CMS database target does not match the approved Supabase project.",
    );
  }

  const sslmode = database.searchParams.get("sslmode") ?? environment.PGSSLMODE;
  if (!["require", "verify-ca", "verify-full", "no-verify"].includes(sslmode)) {
    throw new Error(
      "Hosted CMS migrations require an explicit encrypted database connection.",
    );
  }
}
