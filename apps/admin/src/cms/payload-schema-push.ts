/**
 * Payload's Postgres adapter pushes its schema on connect whenever
 * `NODE_ENV` is not `production` and `push` is not `false`. A push against a
 * shared or hosted database alters the `cms` schema outside migrations (audit
 * findings NA-04 and NX-05), so it is allowed only against a loopback host.
 *
 * Returns `false` (never push) for any host that is not loopback, and for a
 * connection string whose host cannot be read. For a loopback host it returns
 * `false` when `PAYLOAD_DISABLE_SCHEMA_PUSH` is `"1"`, and otherwise
 * `undefined`, which keeps Payload's local development default.
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

function readHost(connectionString: string): string | null {
  try {
    const hostname = new URL(connectionString).hostname;
    return hostname.length > 0 ? hostname.toLowerCase() : null;
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
