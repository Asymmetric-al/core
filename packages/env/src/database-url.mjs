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
 * The only query keys a Postgres URL may carry (review K1), each with why it
 * cannot send the connection to another server or database, or run it as
 * another login. `psql: false` marks a key the loopback decision accepts but
 * psql is never handed. Every other key is refused by isLoopbackDatabaseUrl,
 * by psqlConnection (scripts/lib/psql.mjs) and by the release job's target
 * check, because libpq skips the blanks around a keyword and lets a later
 * value replace an earlier one: `?%20host=elsewhere` routed psql. The keys
 * come from what the repository's own URLs use and what the release job's
 * hosted connection needs.
 */
export const DATABASE_URL_QUERY_KEYS = Object.freeze({
  sslmode: Object.freeze({
    psql: true,
    reason:
      "TLS policy only; the release job's hosted URL and the repository's local URLs set it.",
  }),
  sslrootcert: Object.freeze({
    psql: true,
    reason:
      "the CA file the release job verifies the pooler against (verify-full); a local file, not a target.",
  }),
  sslcert: Object.freeze({
    psql: true,
    reason:
      "a TLS client certificate file; it names a local file, never a server or a login.",
  }),
  sslkey: Object.freeze({
    psql: true,
    reason:
      "the key file of that certificate; it names a local file, never a server or a login.",
  }),
  sslcrl: Object.freeze({
    psql: true,
    reason:
      "a TLS revocation list file; it can only refuse a server certificate, never choose a server.",
  }),
  sslcrldir: Object.freeze({
    psql: true,
    reason:
      "a directory of TLS revocation lists; it can only refuse a server certificate, never choose one.",
  }),
  application_name: Object.freeze({
    psql: true,
    reason:
      "a label in pg_stat_activity; the repository's tests set it, and it changes nothing about the target.",
  }),
  connect_timeout: Object.freeze({
    psql: true,
    reason:
      "how long to wait for the connection; the repository's tests set it, and it changes nothing about the target.",
  }),
  password: Object.freeze({
    psql: true,
    reason:
      "the login's password; psqlConnection moves it to PGPASSWORD, so it never reaches psql's arguments.",
  }),
  options: Object.freeze({
    psql: false,
    reason:
      "it can set the session's role or search path, so psql is never handed it. The loopback decision accepts it because the local CMS migration session sets `-c role=cms_owner` this way (scripts/cms/lib/migration-connection.mjs), on the same local database, and that file refuses a URL that already sets a role.",
  }),
});

const decodeQueryPart = (text) => {
  try {
    return decodeURIComponent(text);
  } catch {
    throw new Error("a query parameter is not valid percent-encoding");
  }
};

/**
 * A Postgres URL's query as libpq's URI parser reads it
 * (conninfo_uri_parse_params in fe-connect.c): pairs split on `&`, each on its
 * one `=`, `%XX` decoded and `+` kept as `+`. WHATWG `URLSearchParams` reads
 * `+` as a space; this follows libpq, so a password with `+` reaches
 * PGPASSWORD unchanged (review K1). Throws where libpq refuses: a pair with no
 * `=`, or a second `=`.
 */
export function libpqQueryEntries(databaseUrl) {
  const raw = String(databaseUrl);
  const start = raw.indexOf("?");
  if (start === -1 || start === raw.length - 1) return [];
  return raw
    .slice(start + 1)
    .split("&")
    .map((pair) => {
      const equals = pair.indexOf("=");
      if (equals === -1)
        throw new Error("a query parameter has no key/value separator");
      if (pair.indexOf("=", equals + 1) !== -1)
        throw new Error("a query parameter has a second key/value separator");
      return [
        decodeQueryPart(pair.slice(0, equals)),
        decodeQueryPart(pair.slice(equals + 1)),
      ];
    });
}

/**
 * Why a Postgres URL's query may not be handed on, or null (review K1): a key
 * that is not exactly a libpq keyword (`^[a-z_]+$`), one not on
 * DATABASE_URL_QUERY_KEYS, one given twice, or, with `forPsql`, one psql is
 * never handed. Names the key, never a value.
 */
export function databaseUrlQueryProblem(databaseUrl, { forPsql = false } = {}) {
  let entries;
  try {
    entries = libpqQueryEntries(databaseUrl);
  } catch (error) {
    return error.message;
  }
  const seen = new Set();
  for (const [key] of entries) {
    const shown = JSON.stringify(key.slice(0, 40));
    if (DATABASE_URL_ROUTING_KEYS.includes(key))
      return `the query key ${shown} is a routing override`;
    if (!/^[a-z_]+$/.test(key))
      return `the query key ${shown} is not a plain libpq keyword`;
    if (!Object.hasOwn(DATABASE_URL_QUERY_KEYS, key))
      return `the query key ${shown} is not one the repository allows`;
    if (forPsql && !DATABASE_URL_QUERY_KEYS[key].psql)
      return `the query key ${shown} is never handed to psql`;
    if (seen.has(key)) return `the query key ${shown} appears twice`;
    seen.add(key);
  }
  return null;
}

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
    databaseUrlQueryProblem(databaseUrl) === null
  );
}
