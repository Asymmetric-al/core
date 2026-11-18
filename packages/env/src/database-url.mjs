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

/**
 * Why libpq would read a Postgres URL as another target than WHATWG `URL`
 * does, or null when both read it alike (PR #2714 review, H11). WHATWG
 * parsing alone is not enough: `URL` ends the authority at the first `/`, `?`
 * or `#` and takes the last `@` before it as the end of the login, while libpq
 * (`conninfo_uri_parse_options` in fe-connect.c) takes the first `@` before
 * the first `/` and knows no fragment. So `postgres://localhost?x=@elsewhere/db`
 * is localhost to `URL` and `elsewhere` to psql 17, and so is the same URL
 * with `#` for `?`. Both read a URL alike only when the authority holds at
 * most one `@` and is followed by `/` or nothing, and no `@` or `#` comes
 * after it.
 */
export function libpqUrlMismatch(databaseUrl) {
  const raw = String(databaseUrl);
  const match = /^postgres(?:ql)?:\/\/([^/?#]*)([\s\S]*)$/i.exec(raw);
  if (!match) return "it is not a postgres:// or postgresql:// URL";
  const [, authority, rest] = match;
  if (raw.includes("#")) return "it has a fragment";
  if (rest !== "" && !rest.startsWith("/"))
    return "something other than / follows the host and port";
  if ((authority.match(/@/g) ?? []).length > 1)
    return "its login part holds more than one @";
  if (rest.includes("@")) return "an @ follows the host";
  return null;
}

/** Hostnames, as `new URL(...).hostname` reports them for a Postgres URL, that name this machine. */
export const LOOPBACK_DATABASE_HOSTS = Object.freeze([
  "127.0.0.1",
  "localhost",
  "[::1]",
]);

/**
 * Whether `databaseUrl` names a database on this machine: a postgres:// or
 * postgresql:// URL whose host is in LOOPBACK_DATABASE_HOSTS, whose query
 * carries no routing override, and which libpq reads as `URL` does
 * (libpqUrlMismatch). False for anything else, a value that is not a URL
 * included. Every local-only database tool decides with this function.
 */
export function isLoopbackDatabaseUrl(databaseUrl) {
  let url;
  try {
    url = databaseUrl instanceof URL ? databaseUrl : new URL(databaseUrl);
  } catch {
    return false;
  }
  if (libpqUrlMismatch(databaseUrl) !== null) return false;
  return (
    ["postgres:", "postgresql:"].includes(url.protocol) &&
    LOOPBACK_DATABASE_HOSTS.includes(url.hostname) &&
    databaseUrlRoutingOverrides(url).length === 0
  );
}
