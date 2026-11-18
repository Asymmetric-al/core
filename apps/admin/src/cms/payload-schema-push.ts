import { isLoopbackDatabaseUrl } from "@asym/env/database-url";

/**
 * Payload's Postgres adapter pushes its schema on connect whenever
 * `NODE_ENV` is not `production` and `push` is not `false`. A push against a
 * shared or hosted database alters the `cms` schema outside migrations (audit
 * findings NA-04 and NX-05), so it is allowed only against a database on this
 * machine.
 *
 * Returns `false` (never push) unless the repository's one local-database
 * decision, `isLoopbackDatabaseUrl` in `@asym/env/database-url`, admits the
 * connection string: a Postgres URL on 127.0.0.1, localhost or [::1] whose
 * query carries no routing override (`?host=`, `?user=` and the others), which
 * node-postgres would follow instead of the host the URL shows. For an admitted
 * URL it returns `false` when `PAYLOAD_DISABLE_SCHEMA_PUSH` is `"1"`, and
 * otherwise `undefined`, which keeps Payload's local development default.
 */
export function resolvePayloadSchemaPush(input: {
  connectionString: string;
  env: Readonly<Record<string, string | undefined>>;
}): false | undefined {
  if (!isLoopbackDatabaseUrl(input.connectionString)) {
    return false;
  }

  return input.env.PAYLOAD_DISABLE_SCHEMA_PUSH === "1" ? false : undefined;
}
