import { databaseUrlRoutingOverrides } from "@asym/env/database-url";

/**
 * Payload's Postgres adapter pushes its schema on connect whenever
 * `NODE_ENV` is not `production` and `push` is not `false`. A push against a
 * shared or hosted database alters the `cms` schema outside migrations (audit
 * findings NA-04 and NX-05), so it is allowed only against a loopback host.
 *
 * Returns `false` (never push) for any host that is not loopback, for a
 * connection string whose host cannot be read, and for one whose query
 * carries a routing override (`?host=`, `?user=` and the others of
 * `@asym/env/database-url`), which node-postgres would follow instead of the
 * host the URL shows. For a loopback host it returns `false` when
 * `PAYLOAD_DISABLE_SCHEMA_PUSH` is `"1"`, and otherwise `undefined`, which
 * keeps Payload's local development default.
 */
export function resolvePayloadSchemaPush(input: {
  connectionString: string;
  env: Readonly<Record<string, string | undefined>>;
}): false | undefined {
  if (!isLoopbackDatabaseHost(readHost(input.connectionString))) {
    return false;
  }

  return input.env.PAYLOAD_DISABLE_SCHEMA_PUSH === "1" ? false : undefined;
}

/** The URL's host, or null when it has none, cannot be read, or is overridden in its query. */
function readHost(connectionString: string): string | null {
  try {
    const url = new URL(connectionString);
    if (databaseUrlRoutingOverrides(url).length > 0) {
      return null;
    }
    return url.hostname.length > 0 ? url.hostname.toLowerCase() : null;
  } catch {
    return null;
  }
}

function isLoopbackDatabaseHost(host: string | null): boolean {
  if (!host) {
    return false;
  }

  if (host === "localhost" || host === "[::1]") {
    return true;
  }

  return /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
}
