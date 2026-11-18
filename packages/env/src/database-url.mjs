// The one rule for a Postgres connection string's routing overrides (AL-2674,
// council round 2). libpq and node-postgres both read connection settings from
// the URL's query as well as from its authority, and the query wins: with
// `?host=` or `?hostaddr=` the client connects somewhere else than the host the
// URL shows, and with `?user=` it logs in as someone else. A check that reads
// `new URL(...).hostname` or `.username` therefore holds only when the query
// names none of these keys. The CMS migration target, the release job's target
// and Payload's run-time configuration all refuse a URL that carries one.
//
// Plain JavaScript with a .d.mts beside it, so that the Node scripts and the
// admin app read the same file.

/** Query keys that choose another server, port, database or login. */
export const DATABASE_URL_ROUTING_KEYS = Object.freeze([
  "host",
  "hostaddr",
  "port",
  "dbname",
  "user",
  "service",
]);

/**
 * The routing keys a Postgres URL carries in its query, in the order of
 * DATABASE_URL_ROUTING_KEYS. Throws when `databaseUrl` is not a URL.
 */
export function databaseUrlRoutingOverrides(databaseUrl) {
  const url = databaseUrl instanceof URL ? databaseUrl : new URL(databaseUrl);
  return DATABASE_URL_ROUTING_KEYS.filter((key) => url.searchParams.has(key));
}
