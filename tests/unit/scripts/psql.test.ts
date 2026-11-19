/**
 * AL-2674 council round 1 (E3): one psql runner for the catalog gate, the
 * field-policy gate and the environment marker. The password travels in
 * PGPASSWORD and never in the argument list, and one list says which hosts
 * are loopback. The runner is driven here with a fake psql that records what
 * it received.
 */
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
  readdirSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  DATABASE_URL_QUERY_KEYS,
  DATABASE_URL_QUERY_ENV,
  SUPABASE_POOLER_HOST,
  databaseUrlHostProblem,
  databaseUrlProblem,
} from "../../../packages/env/src/database-url.mjs";
import {
  LOOPBACK_HOSTS,
  isLoopbackDatabaseUrl,
  psqlConnection,
  runPsqlQuery,
  spawnPsql,
} from "../../../scripts/lib/psql.mjs";

const itPosix = process.platform === "win32" ? it.skip : it;
const roots: string[] = [];
afterEach(() => {
  for (const dir of roots.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

/** A fake psql that logs its arguments and PGPASSWORD, then prints `out` or fails. */
function fakePsql(out: string, status = 0) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "core-psql-runner-"));
  roots.push(dir);
  const bin = path.join(dir, "psql");
  const log = path.join(dir, "calls.json");
  writeFileSync(
    bin,
    `#!${process.execPath}
// Review N6: answer the version check like a psql 16 or later, unlogged.
if (process.argv[2] === "--version") { console.log("psql (PostgreSQL) 17.11"); process.exit(0); }
require("node:fs").writeFileSync(${JSON.stringify(log)}, JSON.stringify({ args: process.argv.slice(2), password: process.env.PGPASSWORD ?? null, service: process.env.PGSERVICE ?? null }));
if (${status}) { process.stderr.write("FATAL: injected failure\\n"); process.exit(${status}); }
process.stdout.write(${JSON.stringify(out)});
`,
  );
  chmodSync(bin, 0o755);
  return {
    bin,
    call: () =>
      JSON.parse(readFileSync(log, "utf8")) as {
        args: string[];
        password: string | null;
        service: string | null;
      },
  };
}

describe("isLoopbackDatabaseUrl", () => {
  it("holds the one loopback list", () => {
    expect([...LOOPBACK_HOSTS].sort()).toEqual([
      "127.0.0.1",
      "[::1]",
      "localhost",
    ]);
  });

  it.each([
    ["postgresql://u@127.0.0.1:5432/d", true],
    ["postgresql://u@localhost/d", true],
    ["postgres://u@[::1]:5432/d", true],
    ["postgresql://u@db.example.supabase.co/d", false],
    ["postgresql://u@127.0.0.2/d", false],
    ["not a url", false],
    ["", false],
  ])("%s -> %s", (url, loopback) => {
    expect(isLoopbackDatabaseUrl(url)).toBe(loopback);
  });

  // PR #2714 review (local database admission): libpq and node-postgres follow
  // a routing key in the query over the authority, so a URL that shows
  // 127.0.0.1 can still name another server, port, database, login or service
  // (packages/env/src/database-url.mjs). Such a URL is never local.
  it.each([
    "postgresql://postgres@127.0.0.1:5432/postgres?host=db.example.supabase.co",
    "postgresql://postgres@127.0.0.1:5432/postgres?hostaddr=203.0.113.9",
    "postgresql://postgres@127.0.0.1:5432/postgres?user=postgres.abcdefghijklmnopqrst",
    "postgresql://postgres@127.0.0.1:5432/postgres?port=6543",
    "postgresql://postgres@localhost:5432/postgres?dbname=production",
    "postgres://postgres@[::1]:5432/postgres?service=hosted",
    "postgresql://postgres@127.0.0.1:5432/postgres?sslmode=disable&ho%73t=db.example.supabase.co",
  ])(
    "is false for a loopback-looking URL with a routing override: %s",
    (url) => {
      expect(isLoopbackDatabaseUrl(url)).toBe(false);
    },
  );

  // PR #2714, last review before the merge (H11): libpq takes the login's @
  // as the first one before the first /, and knows no fragment, while WHATWG
  // URL ends the authority at /, ? or #. Each of these is localhost to URL,
  // and psql 17 connects to the host after the @.
  it.each([
    "postgres://localhost?x=@probe-target.invalid/db",
    "postgres://localhost#@probe-target.invalid/db",
    "postgres://localhost?u=:PW@db.abcdefghijklmnopqrst.supabase.co:5432/postgres?user=postgres",
    "postgres://localhost/db#x",
    "postgres://u@localhost/db?application_name=@x",
    "postgres://a@b@localhost/db",
  ])("is false for %s, which libpq reads as another host", (url) => {
    expect(isLoopbackDatabaseUrl(url)).toBe(false);
  });

  it.each([
    "http://127.0.0.1:5432/postgres",
    "mysql://root@localhost/postgres",
    "127.0.0.1:5432",
  ])("is false for %s, which is not a Postgres URL", (url) => {
    expect(isLoopbackDatabaseUrl(url)).toBe(false);
  });

  it("keeps a loopback URL whose query only sets other connection options", () => {
    expect(
      isLoopbackDatabaseUrl(
        "postgresql://postgres@127.0.0.1:54322/postgres?sslmode=disable&options=-c%20statement_timeout%3D0",
      ),
    ).toBe(true);
  });
});

describe("psqlConnection", () => {
  it("moves a percent-encoded password into PGPASSWORD and keeps the rest of the URL", () => {
    const { connection, env } = psqlConnection(
      "postgresql://postgres:p%40ss%2Fw0rd@db.example:6543/postgres?sslmode=require",
      { PGSERVICE: "prod", KEEP: "1" },
    );
    // H11: libpq gets the parsed parts as keywords, never the raw string.
    expect(connection).toBe(
      "host='db.example' port='6543' dbname='postgres' user='postgres' sslmode='require'",
    );
    // A hosted address also requires SCRAM (review L1).
    expect(env).toEqual({
      KEEP: "1",
      PGPASSWORD: "p@ss/w0rd",
      PGREQUIREAUTH: "scram-sha-256",
    });
  });

  // Council round 2, A8b: the URL is the whole target. An ambient PGHOSTADDR
  // overrides the host of a URL that names no hostaddr, PGOPTIONS can set a
  // role, and the others fill in what the URL leaves out.
  it("clears every ambient PG* setting but the password, so nothing redirects the URL", () => {
    const ambient = Object.fromEntries(
      [
        "PGHOST",
        "PGHOSTADDR",
        "PGPORT",
        "PGDATABASE",
        "PGUSER",
        "PGSERVICE",
        "PGSERVICEFILE",
        "PGOPTIONS",
        "PGTARGETSESSIONATTRS",
        "PGSSLMODE",
        "PGPASSFILE",
      ].map((key) => [key, "elsewhere"]),
    );
    const { env } = psqlConnection(
      "postgresql://postgres@127.0.0.1:5432/disposable_test",
      { ...ambient, PGPASSWORD: "from-the-environment", KEEP: "1" },
    );
    expect(env).toEqual({ KEEP: "1", PGPASSWORD: "from-the-environment" });
    // A password in the URL wins over an ambient one.
    expect(
      psqlConnection("postgresql://postgres:from-url@127.0.0.1/d", {
        PGPASSWORD: "ambient",
      }).env.PGPASSWORD,
    ).toBe("from-url");
  });

  it("hands libpq the parsed parts of a URL without a password", () => {
    expect(
      psqlConnection("postgresql://postgres@127.0.0.1:5432/disposable_test", {})
        .connection,
    ).toBe(
      "host='127.0.0.1' port='5432' dbname='disposable_test' user='postgres'",
    );
    expect(psqlConnection("postgres://u%20x@[::1]/d%27b", {}).connection).toBe(
      "host='::1' dbname='d\\'b' user='u x'",
    );
  });

  // H11: what the code admits is what libpq connects to.
  it.each([
    "postgres://localhost?x=@probe-target.invalid/db",
    "postgres://localhost#@probe-target.invalid/db",
    "postgres://localhost?u=:PW@db.abcdefghijklmnopqrst.supabase.co:5432/postgres?user=postgres",
  ])("refuses %s, which libpq would read as another host", (url) => {
    expect(() => psqlConnection(url, {})).toThrow(
      /libpq would read it differently/,
    );
  });

  it.each([
    "postgresql://postgres@127.0.0.1:5432/postgres?host=db.example.supabase.co",
    "postgresql://postgres@127.0.0.1:5432/postgres?user=postgres.abcdefghijklmnopqrst",
  ])("refuses %s, whose query would route libpq elsewhere", (url) => {
    expect(() => psqlConnection(url, {})).toThrow(/routing override/);
  });

  it("moves a password from the query into PGPASSWORD too", () => {
    const { connection, env } = psqlConnection(
      "postgresql://postgres@127.0.0.1:5432/d?password=s3cret&sslmode=disable",
      {},
    );
    expect(connection).not.toContain("s3cret");
    expect(connection).toContain("sslmode='disable'");
    expect(env.PGPASSWORD).toBe("s3cret");
  });

  it.each(["not a url", "mysql://u:p@h/d"])("refuses %s", (url) => {
    expect(() => psqlConnection(url, {})).toThrow(/Postgres URL|postgres:\/\//);
  });
});

describe("runPsqlQuery", () => {
  itPosix(
    "passes the password through the environment, never the arguments",
    () => {
      const psql = fakePsql("t\n");
      const out = runPsqlQuery({
        databaseUrl: "postgresql://postgres:s3cret@127.0.0.1:5432/d",
        sql: "select true",
        psqlBin: psql.bin,
      });
      expect(out).toBe("t\n");
      const call = psql.call();
      expect(call.password).toBe("s3cret");
      expect(call.service).toBeNull();
      expect(call.args).toEqual([
        "host='127.0.0.1' port='5432' dbname='d' user='postgres'",
        "-X",
        "-q",
        "-v",
        "ON_ERROR_STOP=1",
        "-At",
        "-c",
        "select true",
      ]);
      expect(JSON.stringify(call.args)).not.toContain("s3cret");
    },
  );

  itPosix("throws psql's error output when it fails", () => {
    const psql = fakePsql("", 2);
    expect(() =>
      runPsqlQuery({
        databaseUrl: "postgresql://u:pw@127.0.0.1/d",
        sql: "select 1",
        psqlBin: psql.bin,
      }),
    ).toThrow("FATAL: injected failure");
  });

  // H11: what psql is actually started with.
  itPosix(
    "spawnPsql starts psql with the parsed parts, -X, and the password only in its environment",
    () => {
      const psql = fakePsql("");
      const result = spawnPsql({
        databaseUrl: "postgresql://postgres:s3cret@127.0.0.1:54322/postgres",
        args: ["-v", "ON_ERROR_STOP=1", "-f", "migration.sql"],
        psqlBin: psql.bin,
        baseEnv: { PATH: process.env.PATH ?? "", PGHOST: "elsewhere" },
      });
      expect(result.status).toBe(0);
      const call = psql.call();
      expect(call.args).toEqual([
        "host='127.0.0.1' port='54322' dbname='postgres' user='postgres'",
        "-X",
        "-v",
        "ON_ERROR_STOP=1",
        "-f",
        "migration.sql",
      ]);
      expect(call.password).toBe("s3cret");
      expect(JSON.stringify(call.args)).not.toContain("s3cret");
    },
  );

  it("throws when psql cannot be started", () => {
    expect(() =>
      runPsqlQuery({
        databaseUrl: "postgresql://u:pw@127.0.0.1/d",
        sql: "select 1",
        psqlBin: "definitely-not-a-psql-binary",
      }),
    ).toThrow(/could not run psql/);
  });
});

// PR #2714 review: one decision says that a database is on this machine.
// Every other place that decides it calls that decision, and none keeps a
// host list or a host pattern of its own.
describe("every local-database decision calls the one helper", () => {
  it.each([
    "apps/admin/src/cms/payload-schema-push.ts",
    "scripts/cms/lib/migration-connection.mjs",
    "scripts/cms/lib/migration-target.mjs",
    "scripts/cms/qualify-payload-pin.mjs",
    "scripts/release/lib/database-target.mjs",
  ])("%s calls isLoopbackDatabaseUrl and lists no host", (file) => {
    const source = readFileSync(file, "utf8");
    expect(source).toMatch(/\bisLoopbackDatabaseUrl\(/);
    expect(source).not.toMatch(/["'](?:localhost|127\.0\.0\.1|\[?::1\]?)["']/);
    expect(source).not.toMatch(/127\\\./);
  });

  it("scripts/seed-demo.sh asks the JavaScript decision instead of parsing the URL", () => {
    const source = readFileSync("scripts/seed-demo.sh", "utf8");
    expect(source).toMatch(/node "[^"]*lib\/local-database\.mjs" admit /);
    expect(source).not.toMatch(/127\\\.|BASH_REMATCH/);
  });

  it("scripts/seed-demo.sh starts psql only through the shared runner", () => {
    const source = readFileSync("scripts/seed-demo.sh", "utf8");
    expect(source).toMatch(
      /node "[^"]*lib\/local-database\.mjs" psql SUPABASE_DB_URL /,
    );
    expect(source).not.toMatch(/^\s*psql\s/m);
  });

  it("scripts/AGENTS.md and the helper's header name the seam", () => {
    for (const file of ["scripts/AGENTS.md", "scripts/lib/psql.mjs"]) {
      const text = readFileSync(file, "utf8");
      expect(text).toContain("isLoopbackDatabaseUrl");
      expect(text).toContain("packages/env/src/database-url.mjs");
      expect(text).toContain("spawnPsql");
      expect(text).toMatch(/routing override/);
      // The last check's P4: psqlConnection is never offered for a script's
      // own spawn, which would skip the version floor.
      expect(text).not.toMatch(/own spawn/);
    }
  });

  it("the helper is the routing rule's own function", async () => {
    const shared = await import("../../../packages/env/src/database-url.mjs");
    expect(isLoopbackDatabaseUrl).toBe(shared.isLoopbackDatabaseUrl);
    expect([...LOOPBACK_HOSTS]).toEqual([...shared.LOOPBACK_DATABASE_HOSTS]);
  });
});

describe("the three callers use the shared runner", () => {
  it.each([
    "scripts/verify/tenant-rls-catalog.mjs",
    "scripts/verify/field-policy-census.mjs",
    "scripts/lib/environment-marker.mjs",
  ])("%s imports it and spawns nothing itself", (file) => {
    const source = readFileSync(file, "utf8");
    expect(source).toMatch(/from "\.\.\/lib\/psql\.mjs"|from "\.\/psql\.mjs"/);
    expect(source).not.toContain("spawnSync");
    expect(source).not.toMatch(/LOOPBACK|LOCAL_HOSTS/);
  });
});

// Review K1 (blocking): a query key that is not exactly a libpq keyword was
// copied into the keyword string, and libpq skips the blanks around a keyword
// and lets a later value replace an earlier one, so `?%20host=` sent psql to
// another host. Only an allowlisted key now passes, in the loopback decision
// and in psqlConnection alike, and the query is read as libpq reads it.
const BAD_QUERIES: [string, string][] = [
  ["a key with a leading blank", "?%20host=evil.example"],
  ["a key with a trailing blank", "?host%20=evil.example"],
  ["an upper-case key", "?HOST=evil.example"],
  ["a key with a tab", "?%09host=evil.example"],
  ["a duplicate allowed key", "?sslmode=require&sslmode=disable"],
  ["an unknown key", "?pgbouncer=true"],
  ["a second = in a value", "?sslmode=require=x"],
  ["a key without a value", "?sslmode"],
];

describe("the query a URL may carry (review K1)", () => {
  it.each(BAD_QUERIES)(
    "is not loopback, and psql refuses it, with %s",
    (_case, query) => {
      const url = `postgresql://postgres@127.0.0.1:54322/postgres${query}`;
      expect(isLoopbackDatabaseUrl(url)).toBe(false);
      expect(() => psqlConnection(url, {})).toThrow(/refused for psql/);
    },
  );

  it("never hands options to psql, though the loopback decision accepts it for the CMS session role", () => {
    const url =
      "postgresql://postgres@127.0.0.1:54322/postgres?options=-c%20role%3Dcms_owner";
    expect(isLoopbackDatabaseUrl(url)).toBe(true);
    expect(() => psqlConnection(url, {})).toThrow(/never handed to psql/);
  });

  it.each(
    Object.entries(DATABASE_URL_QUERY_KEYS)
      .filter(
        ([key, entry]) =>
          entry.psql && key !== "password" && key !== "connect_timeout",
      )
      .map(([key]) => key),
  )("passes %s through with its value intact", (key) => {
    const value = "a b'c\\d=e host=evil";
    const url = `postgresql://postgres@127.0.0.1:54322/postgres?${key}=${encodeURIComponent(value)}`;
    expect(isLoopbackDatabaseUrl(url)).toBe(true);
    const { connection } = psqlConnection(url, {});
    expect(parseConninfo(connection)).toEqual([
      ["host", "127.0.0.1"],
      ["port", "54322"],
      ["dbname", "postgres"],
      ["user", "postgres"],
      [key, value],
    ]);
  });

  it("reads + as libpq does, and keeps it in a password", () => {
    const { connection, env } = psqlConnection(
      "postgresql://postgres@127.0.0.1:54322/postgres?application_name=a+b&password=p+ss%2Bw",
      {},
    );
    expect(parseConninfo(connection)).toContainEqual([
      "application_name",
      "a+b",
    ]);
    expect(connection).not.toContain("p+ss");
    expect(env.PGPASSWORD).toBe("p+ss+w");
  });

  it("gives every key an explicit reason", () => {
    for (const [key, entry] of Object.entries(DATABASE_URL_QUERY_KEYS)) {
      expect(key).toMatch(/^[a-z_]+$/);
      expect(entry.reason.length, key).toBeGreaterThan(20);
    }
    for (const routing of [
      "host",
      "hostaddr",
      "port",
      "dbname",
      "user",
      "service",
    ])
      expect(Object.hasOwn(DATABASE_URL_QUERY_KEYS, routing), routing).toBe(
        false,
      );
  });

  itPosix(
    "starts psql for a hosted-shaped URL with sslmode=verify-full and a CA file",
    () => {
      const psql = fakePsql("");
      spawnPsql({
        databaseUrl:
          "postgresql://postgres.abcdefghijklmnopqrst:s3cret@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert=%2Ftmp%2Fproject-ca.pem",
        args: ["-c", "select 1"],
        psqlBin: psql.bin,
        baseEnv: { PATH: process.env.PATH ?? "" },
      });
      const call = psql.call();
      expect(call.args).toEqual([
        "host='aws-0-us-west-2.pooler.supabase.com' port='5432' dbname='postgres' user='postgres.abcdefghijklmnopqrst' sslmode='verify-full' sslrootcert='/tmp/project-ca.pem'",
        "-X",
        "-c",
        "select 1",
      ]);
      expect(call.password).toBe("s3cret");
    },
  );
});

/**
 * A libpq keyword string read back as libpq reads it (fe-connect.c,
 * conninfo_parse): blanks between pairs, a value in single quotes with
 * backslash escapes. So a test sees exactly which keywords psql would get.
 */
function parseConninfo(text: string): [string, string][] {
  const pairs: [string, string][] = [];
  let i = 0;
  while (i < text.length) {
    while (/\s/.test(text[i] ?? "")) i++;
    if (i >= text.length) break;
    let key = "";
    while (i < text.length && !/[\s=]/.test(text[i]!)) key += text[i++];
    while (/\s/.test(text[i] ?? "")) i++;
    if (text[i] !== "=") throw new Error(`no = after ${key}`);
    i++;
    while (/\s/.test(text[i] ?? "")) i++;
    let value = "";
    if (text[i] === "'") {
      i++;
      while (i < text.length && text[i] !== "'") {
        if (text[i] === "\\") i++;
        value += text[i++];
      }
      if (text[i] !== "'") throw new Error("unterminated quote");
      i++;
    } else {
      while (i < text.length && !/\s/.test(text[i]!)) {
        if (text[i] === "\\") i++;
        value += text[i++];
      }
    }
    pairs.push([key, value]);
  }
  return pairs;
}

// Review L1 (blocking): WHATWG URL keeps a comma, a percent-escape and upper
// case in a postgres:// host, and libpq reads a comma as a list of hosts and
// a slash as a socket directory. One host rule now judges every address.
describe("the host an address may name (review L1)", () => {
  it.each([
    ["a host list", "evil.example,aws-0-us-east-1.pooler.supabase.com"],
    ["an escaped comma", "evil.example%2Caws-0-us-east-1.pooler.supabase.com"],
    ["an escaped slash", "%2Ftmp%2Fx.pooler.supabase.com"],
    ["upper case", "AWS-0-US-EAST-1.pooler.supabase.com"],
    ["a trailing dot", "aws-0-us-east-1.pooler.supabase.com."],
    ["an empty label", "db..supabase.co"],
  ])("refuses %s", (_case, host) => {
    const url = `postgresql://postgres.abcdefghijklmnopqrst@${host}:6543/postgres?sslmode=require`;
    expect(databaseUrlHostProblem(url)).not.toBeNull();
    expect(isLoopbackDatabaseUrl(url)).toBe(false);
    expect(() => psqlConnection(url, {})).toThrow(/host/);
  });

  it("refuses an address that names no host", () => {
    expect(databaseUrlHostProblem("postgresql:///postgres")).not.toBeNull();
    expect(() => psqlConnection("postgresql:///postgres", {})).toThrow(/host/);
  });

  it.each([
    "aws-0-us-west-2.pooler.supabase.com",
    "aws-1-us-east-1.pooler.supabase.com",
    "db.abcdefghijklmnopqrst.supabase.co",
    "127.0.0.1",
    "localhost",
    "[::1]",
  ])("accepts %s", (host) => {
    expect(
      databaseUrlHostProblem(`postgresql://u@${host}:5432/postgres`),
    ).toBeNull();
  });

  it("pins the pooler host to Supabase's shape, aws-<index>-<region>.pooler.supabase.com", () => {
    for (const host of [
      "aws-0-us-west-2.pooler.supabase.com",
      "aws-1-us-east-1.pooler.supabase.com",
    ])
      expect(SUPABASE_POOLER_HOST.test(host), host).toBe(true);
    for (const [, host] of [
      ["a bare pooler subdomain", "x.pooler.supabase.com"],
      ["a look-alike domain", "evilpooler.supabase.com"],
      [
        "the pooler's name under another domain",
        "aws-0-x.pooler.supabase.com.evil.example",
      ],
    ])
      expect(SUPABASE_POOLER_HOST.test(host), host).toBe(false);
  });

  // Review L1: the pooler authenticated with SCRAM on the preview project
  // (preflight with PGREQUIREAUTH=scram-sha-256, 18 November 2026, 20:03 UTC),
  // so no hosted server may ask psql for the password in clear text.
  it("requires SCRAM for a hosted address and leaves a loopback one alone", () => {
    expect(
      psqlConnection(
        "postgresql://postgres.abcdefghijklmnopqrst@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require",
        {},
      ).env.PGREQUIREAUTH,
    ).toBe("scram-sha-256");
    expect(
      psqlConnection("postgresql://postgres@127.0.0.1:54322/postgres", {}).env
        .PGREQUIREAUTH,
    ).toBeUndefined();
  });
});

// Review L2: one check judges every address, shape, host and query, and
// every builder and target check refuses on any problem it names.
describe("the one check for an address (review L2)", () => {
  it.each([
    [
      "a key with a leading blank",
      "postgresql://postgres.abcdefghijklmnopqrst@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require&%20host=evil.example",
    ],
    [
      "a host list",
      "postgresql://postgres.abcdefghijklmnopqrst@evil.example,aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require",
    ],
    [
      "options",
      "postgresql://postgres.abcdefghijklmnopqrst@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require&options=-c%20role%3Dauthenticator",
    ],
    [
      "an unknown key",
      "postgresql://postgres.abcdefghijklmnopqrst@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true",
    ],
    [
      "a shape libpq reads otherwise",
      "postgres://localhost?x=@evil.example/db",
    ],
  ])("names a problem for %s", (_case, url) => {
    expect(databaseUrlProblem(url, { forPsql: true })).not.toBeNull();
  });

  it("passes a hosted address and a loopback address, and keeps options for loopback use only", () => {
    expect(
      databaseUrlProblem(
        "postgresql://postgres.abcdefghijklmnopqrst@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require",
        { forPsql: true },
      ),
    ).toBeNull();
    const session =
      "postgresql://postgres@127.0.0.1:54322/postgres?options=-c%20role%3Dcms_owner";
    expect(databaseUrlProblem(session)).toBeNull();
    expect(databaseUrlProblem(session, { forPsql: true })).not.toBeNull();
  });
});

// Review L3: the allowlist holds only what the repository uses. No address in
// it sets a client certificate, its key or a revocation list, and libpq loads
// an OpenSSL engine by name for an sslkey of the form engine:key.
describe("the allowlist holds only what the repository uses (review L3)", () => {
  it.each(["sslcert", "sslkey", "sslcrl", "sslcrldir"])("refuses %s", (key) => {
    const url = `postgresql://postgres@127.0.0.1:54322/postgres?${key}=x`;
    expect(isLoopbackDatabaseUrl(url)).toBe(false);
    expect(() => psqlConnection(url, {})).toThrow(/refused for psql/);
  });

  it.each(["0", "-1", "1.5", "abc", "301", "", "007"])(
    "refuses connect_timeout=%s: a whole number of seconds from 1 to 300",
    (value) => {
      const url = `postgresql://postgres@127.0.0.1:54322/postgres?connect_timeout=${value}`;
      expect(isLoopbackDatabaseUrl(url)).toBe(false);
      expect(() => psqlConnection(url, {})).toThrow(/connect_timeout/);
    },
  );

  it.each(["1", "30", "300"])("accepts connect_timeout=%s", (value) => {
    expect(
      psqlConnection(
        `postgresql://postgres@127.0.0.1:54322/postgres?connect_timeout=${value}`,
        {},
      ).connection,
    ).toContain(`connect_timeout='${value}'`);
  });

  it("maps every allowed key to its libpq variable, and nothing else", () => {
    expect(Object.keys(DATABASE_URL_QUERY_ENV).sort()).toEqual(
      Object.keys(DATABASE_URL_QUERY_KEYS).sort(),
    );
  });
});

/**
 * Review M3: every ambient libpq setting a hostile environment could hold.
 * Only PGPASSWORD and PGSSLROOTCERT may survive a builder, and a builder that
 * sets either from the address overrides the ambient one.
 */
const HOSTILE_PG_ENV = {
  PGHOST: "evil.example",
  PGHOSTADDR: "203.0.113.9",
  PGPORT: "1",
  PGDATABASE: "evil",
  PGUSER: "evil",
  PGSERVICE: "evil",
  PGSERVICEFILE: "/evil/pg_service.conf",
  PGSYSCONFDIR: "/evil",
  PGPASSFILE: "/evil/pgpass",
  PGOPTIONS: "-c role=postgres",
  PGSSLMODE: "disable",
  PGSSLKEY: "engine:evil:key",
  PGSSLCERT: "/evil/client.crt",
  PGSSLCRL: "/evil/crl.pem",
  PGSSLCRLDIR: "/evil/crls",
  PGSSLSNI: "0",
  PGSSLNEGOTIATION: "direct",
  PGSSLCOMPRESSION: "1",
  PGSSLMINPROTOCOLVERSION: "TLSv1",
  PGSSLMAXPROTOCOLVERSION: "TLSv1",
  PGCHANNELBINDING: "disable",
  PGGSSENCMODE: "require",
  PGGSSLIB: "sspi",
  PGKRBSRVNAME: "evil",
  PGREQUIREAUTH: "password",
  PGTARGETSESSIONATTRS: "read-only",
  PGLOADBALANCEHOSTS: "random",
  PGAPPNAME: "evil",
  PGCONNECT_TIMEOUT: "999",
  PGCLIENTENCODING: "SQL_ASCII",
  PGDATESTYLE: "evil",
  PGTZ: "evil",
  PGGEQO: "off",
  PGLOCALEDIR: "/evil",
  PGPASSWORD: "ambient-password",
  PGSSLROOTCERT: "/ambient/ca.crt",
};
const pgOnly = (env: Record<string, string | undefined>) =>
  Object.fromEntries(
    Object.entries(env).filter(([key]) => key.startsWith("PG")),
  );

describe("the ambient libpq settings a builder may keep (review M3)", () => {
  it("is one list, PGPASSWORD and PGSSLROOTCERT, each with its reason", async () => {
    const shared = await import("../../../packages/env/src/database-url.mjs");
    expect(Object.keys(shared.KEPT_AMBIENT_LIBPQ_ENV)).toEqual([
      "PGPASSWORD",
      "PGSSLROOTCERT",
    ]);
    for (const reason of Object.values(shared.KEPT_AMBIENT_LIBPQ_ENV))
      expect(reason.length).toBeGreaterThan(30);
  });

  it("psqlConnection keeps nothing else of a hostile environment", () => {
    const { connection, env } = psqlConnection(
      "postgresql://postgres.abcdefghijklmnopqrst:pw@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert=%2Fjob%2Froot.crt",
      { ...HOSTILE_PG_ENV, KEEP: "1" },
    );
    // Review N5: psqlConnection keeps PGPASSWORD alone of the shared list.
    expect(pgOnly(env)).toEqual({
      PGPASSWORD: "pw",
      PGREQUIREAUTH: "scram-sha-256",
    });
    expect(env.KEEP).toBe("1");
    expect(connection).toContain("sslrootcert='/job/root.crt'");
  });

  // Review N5: with PGSSLROOTCERT=system in the environment, a hand-run hosted
  // address that names no CA would trust the system store.
  it("never hands psql an ambient PGSSLROOTCERT, so system cannot reach an address that names no CA", () => {
    const { connection, env } = psqlConnection(
      "postgresql://postgres.abcdefghijklmnopqrst:pw@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full",
      { PGSSLROOTCERT: "system", PGPASSWORD: "ambient" },
    );
    expect(env.PGSSLROOTCERT).toBeUndefined();
    expect(connection).not.toContain("sslrootcert");
  });

  it("lets a builder keep less than the shared list, never more", async () => {
    const shared = await import("../../../packages/env/src/database-url.mjs");
    expect(
      shared.keptAmbientLibpqEnv(
        { PGPASSWORD: "p", PGSSLROOTCERT: "/ca", PGHOST: "x" },
        ["PGPASSWORD"],
      ),
    ).toEqual({ PGPASSWORD: "p" });
    expect(() =>
      shared.keptAmbientLibpqEnv({ PGSSLKEY: "k" }, ["PGSSLKEY" as never]),
    ).toThrow(/PGSSLKEY is not on KEPT_AMBIENT_LIBPQ_ENV/);
  });
});

/*
 * Reviews M4 and N4, and the last check's P2 (phase 15): which files under
 * scripts/ may start psql. The rule is blunt, so that no reading of the code
 * can be fooled. In every file under scripts/ but Markdown, the letters
 * "psql", in any case, are counted wherever they stand: in code, in a string,
 * in a comment, in a name (PSQL_BIN, runPsqlQuery, "$PSQL_BIN",
 * /usr/bin/psql, an import of scripts/lib/psql.mjs). Nothing is stripped, so
 * no comment or string can hide them. A file that holds them is a listed
 * starter (PSQL_STARTERS), or is listed by name in PSQL_NAMERS with the
 * reason it needs the word and how many times it holds it. Any other file
 * that holds them fails, and so does a listed file whose count changes: a
 * new mention in a listed file is reviewed, then counted.
 *
 * What this cannot see:
 * - a program name built at run time from parts ("ps" + "ql", a character
 *   code, a decoded string) in a file that otherwise never names psql;
 * - a helper outside scripts/ (packages/, tests/) that starts psql for a
 *   script, or anything under a node_modules directory, which the walk skips;
 * - in a listed file, a new mention that replaces an old one one for one, so
 *   the count stays the same;
 * - what a listed starter does: the tests of the three shared builders and
 *   the starters' own tests judge that.
 */
const PSQL_STARTERS = [
  // The three builders of a psql connection from an address: the shared
  // check (databaseUrlProblem) and the shared list (keptAmbientLibpqEnv).
  "scripts/lib/psql.mjs",
  "scripts/release/lib/postgres.mjs",
  "scripts/cms/lib/postgres.mjs",
  // psql, pg_dump and pg_restore inside a Docker container it starts.
  "scripts/verify/backup-restore-proof.mjs",
  // A check and a builder of its own, left as they are (review M4).
  "scripts/verify/stripe-data-pipeline.mjs",
];
const SHARED_BUILDERS = PSQL_STARTERS.slice(0, 3);

/**
 * The files that name psql and start none, each with how many times it holds
 * the letters (in any case, comments included) and why.
 */
const PSQL_NAMERS: Record<string, { count: number; reason: string }> = {
  "scripts/cms/lib/migration-target.mjs": {
    count: 5,
    reason:
      "comments and two messages that name the CMS runner's psql and the CA file it reads",
  },
  "scripts/cms/lib/supabase.mjs": {
    count: 3,
    reason: "imports and calls runPsqlFile from the CMS builder",
  },
  "scripts/cms/qualify-payload-pin.mjs": {
    count: 1,
    reason: "imports isLoopbackDatabaseUrl from scripts/lib/psql.mjs",
  },
  "scripts/cms/verify-local.mjs": {
    count: 2,
    reason: "imports and calls runPsql from the CMS builder",
  },
  "scripts/lib/environment-marker.mjs": {
    count: 12,
    reason:
      "reads the marker through runPsqlQuery, handing on psqlBin from PSQL_BIN",
  },
  "scripts/lib/local-database.mjs": {
    count: 16,
    reason:
      "the `local-database.mjs psql` entry: shell scripts run psql through spawnPsql here, and its usage and messages name it",
  },
  "scripts/release/lib/database-target.mjs": {
    count: 4,
    reason:
      "a comment, and the shared check's forPsql option for an address the reset guard hands psql",
  },
  "scripts/release/lib/scram.mjs": {
    count: 1,
    reason: "a comment comparing the verifier with psql's \\password",
  },
  "scripts/release/release-database.mjs": {
    count: 24,
    reason:
      "calls runPsql from the release builder and requirePsqlHonoursRequireAuth from scripts/lib/psql.mjs, hands on a psqlBin, and comments",
  },
  "scripts/seed-demo.sh": {
    count: 9,
    reason:
      "`require_cmd psql`, and local_psql, which runs the `local-database.mjs psql` entry",
  },
  "scripts/supabase-cli.mjs": {
    count: 1,
    reason: "a comment on how the reset guard reads the marker",
  },
  "scripts/verify/field-policy-census.mjs": {
    count: 9,
    reason: "runs its catalog query through runPsqlQuery, handing on PSQL_BIN",
  },
  "scripts/verify/seed-counts.mjs": {
    count: 12,
    reason:
      "counts rows through runPsqlQuery, handing on PSQL_BIN, and a message",
  },
  "scripts/verify/supabase-migrations.mjs": {
    count: 16,
    reason:
      "runs each file through spawnPsql, handing on PSQL_BIN, and its messages",
  },
  "scripts/verify/tenant-rls-catalog.mjs": {
    count: 8,
    reason: "runs its catalog query through runPsqlQuery, handing on psqlBin",
  },
};

/** Every file under `dir`, whatever its extension, but under node_modules. */
function scriptsFiles(dir = "scripts"): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = `${dir}/${entry.name}`;
    if (entry.isDirectory())
      return entry.name === "node_modules" ? [] : scriptsFiles(file);
    return [file];
  });
}

/** How many times `source` holds the letters psql, in any case. */
const psqlCount = (source: string) => source.match(/psql/gi)?.length ?? 0;

/** Why a file under scripts/ breaks the rule above, or null. */
function psqlProblem(file: string, source: string): string | null {
  if (file.endsWith(".md")) return null;
  const count = psqlCount(source);
  if (count === 0 || PSQL_STARTERS.includes(file)) return null;
  const listed = PSQL_NAMERS[file];
  if (!listed)
    return `${file} names psql ${count} time(s) and is neither a listed starter nor listed in PSQL_NAMERS. A script runs psql through scripts/lib/psql.mjs, or a shell script through scripts/lib/local-database.mjs; list a file that only names it, with the reason and the count.`;
  if (listed.count !== count)
    return `${file} names psql ${count} time(s), and PSQL_NAMERS says ${listed.count}. Check that the change starts no psql, then update the count and the reason.`;
  return null;
}

/** The forms the last check (phase 15, P2) found passing the patterns. */
const REVIEWER_FORMS: Array<[string, string, string]> = [
  [
    "execSync with a command string and no import",
    "scripts/x/exec-sync.mjs",
    'import { execSync } from "node:child_process";\nexecSync("psql -c \'select 1\'");\n',
  ],
  [
    "exec with a command string and no import",
    "scripts/x/exec.mjs",
    'import { exec } from "node:child_process";\nexec("psql -c \'select 1\'");\n',
  ],
  [
    "a full path",
    "scripts/x/full-path.mjs",
    'import { spawnSync } from "node:child_process";\nspawnSync("/usr/bin/psql", ["-c", "select 1"]);\n',
  ],
  [
    "a shell",
    "scripts/x/shell.mjs",
    'import { spawnSync } from "node:child_process";\nspawnSync("sh", ["-c", "psql -c \'select 1\'"]);\n',
  ],
  [
    "a computed program name beside an import of psql.mjs",
    "scripts/x/computed.mjs",
    'import { runPsqlQuery } from "../lib/psql.mjs";\nimport { spawnSync } from "node:child_process";\nconst bin = ["ps", "ql"].join("");\nspawnSync(bin, ["-c", "select 1"]);\n',
  ],
  [
    "Bun.spawn beside an import of psql.mjs",
    "scripts/x/bun-spawn.mjs",
    'import { isLoopbackDatabaseUrl } from "../lib/psql.mjs";\nBun.spawn(["psql", "-c", "select 1"]);\n',
  ],
  [
    'a local helper called as run("psql") beside an import of psql.mjs',
    "scripts/x/helper.mjs",
    'import { isLoopbackDatabaseUrl } from "../lib/psql.mjs";\nimport { spawnSync } from "node:child_process";\nconst run = (bin) => spawnSync(bin, ["-c", "select 1"]);\nrun("psql");\n',
  ],
  [
    "a .mts file",
    "scripts/x/start.mts",
    'import { spawnSync } from "node:child_process";\nspawnSync("psql", ["-c", "select 1"]);\n',
  ],
  [
    "a .cts file",
    "scripts/x/start.cts",
    'const { spawnSync } = require("node:child_process");\nspawnSync("psql", ["-c", "select 1"]);\n',
  ],
  [
    "a .bash file",
    "scripts/x/start.bash",
    '#!/usr/bin/env bash\npsql -c "select 1"\n',
  ],
  [
    "a .py file",
    "scripts/x/start.py",
    'import subprocess\nsubprocess.run(["psql", "-c", "select 1"])\n',
  ],
  [
    "a file with no extension",
    "scripts/x/start",
    '#!/bin/sh\npsql -c "select 1"\n',
  ],
  ["if before psql", "scripts/x/if.sh", 'if psql -c "select 1"; then :; fi\n'],
  [
    "while before psql",
    "scripts/x/while.sh",
    'while psql -c "select 1"; do break; done\n',
  ],
  [
    "until before psql",
    "scripts/x/until.sh",
    'until psql -c "select 1"; do sleep 1; done\n',
  ],
  [
    "elif before psql",
    "scripts/x/elif.sh",
    'if false; then :\nelif psql -c "select 1"; then :; fi\n',
  ],
  ["! before psql", "scripts/x/not.sh", '! psql -c "select 1"\n'],
  ["sudo -u x psql", "scripts/x/sudo.sh", 'sudo -u x psql -c "select 1"\n'],
  ["timeout 5 psql", "scripts/x/timeout.sh", 'timeout 5 psql -c "select 1"\n'],
  ["nohup psql", "scripts/x/nohup.sh", 'nohup psql -c "select 1"\n'],
  [
    "xargs -r psql",
    "scripts/x/xargs.sh",
    'echo "select 1" | xargs -r psql -c\n',
  ],
  ["env -i psql", "scripts/x/env-i.sh", 'env -i psql -c "select 1"\n'],
  ['"$PSQL_BIN"', "scripts/x/bin.sh", '"$PSQL_BIN" -c "select 1"\n'],
  [
    "code after a string that holds //",
    "scripts/x/slashes.mjs",
    'import { execSync } from "node:child_process";\nconst note = "see a // b"; execSync("psql -c \'select 1\'");\n',
  ],
  [
    "code between strings that hold /* and */",
    "scripts/x/stars.mjs",
    'import { execSync } from "node:child_process";\nconst open = "/*"; execSync("psql -c \'select 1\'"); const close = "*/";\n',
  ],
];

describe("the files under scripts/ that start psql (review M4)", () => {
  it("every file that names psql is a listed starter, or is listed by name at its count", () => {
    const counts = new Map<string, number>();
    for (const file of scriptsFiles()) {
      const source = readFileSync(file, "utf8");
      expect(psqlProblem(file, source)).toBeNull();
      counts.set(file, psqlCount(source));
    }
    // No entry outlives its file, or the need for the word.
    for (const [file, { count, reason }] of Object.entries(PSQL_NAMERS)) {
      expect(counts.get(file), file).toBe(count);
      expect(reason.length, file).toBeGreaterThan(20);
    }
    for (const file of PSQL_STARTERS)
      expect(counts.get(file), file).toBeGreaterThan(0);
  });

  // Review N4: the rule holds on code, not on what a comment says.
  it.each([
    [
      "a comment that names the runner, and a direct start",
      "scripts/x/comment.mjs",
      '// goes through scripts/lib/psql.mjs\nimport { spawnSync } from "node:child_process";\nspawnSync("psql", ["-c", "select 1"]);\n',
    ],
    [
      "a real import, and a direct start beside it",
      "scripts/x/both.mjs",
      'import { runPsqlQuery } from "../lib/psql.mjs";\nimport { spawnSync } from "node:child_process";\nspawnSync(process.env.PSQL_BIN || "psql", ["-c", "select 1"]);\n',
    ],
    [
      "a shell psql after &&",
      "scripts/x/and.sh",
      '#!/usr/bin/env bash\ncd /tmp && psql -c "select 1"\n',
    ],
    [
      "a shell psql in a command substitution",
      "scripts/x/sub.sh",
      '#!/usr/bin/env bash\ncount=$(psql -tAc "select 1")\n',
    ],
    [
      "a shell psql after an assignment",
      "scripts/x/env.sh",
      '#!/usr/bin/env bash\nPGHOST=elsewhere psql -c "select 1"\n',
    ],
  ])("refuses %s", (_case, file, source) => {
    expect(psqlProblem(file, source)).not.toBeNull();
  });

  // The last check's P2 (phase 15): every form the reviewer found that
  // passed the earlier patterns, planted as a file that is not listed.
  it.each(REVIEWER_FORMS)("refuses %s", (_case, file, source) => {
    expect(psqlProblem(file, source)).not.toBeNull();
  });

  it("walks every file under scripts/ but those under node_modules, whatever its extension", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "p2-walk-"));
    roots.push(root);
    const names = ["a.mts", "b.cts", "c.bash", "d.py", "run", "e.md"];
    for (const name of names) writeFileSync(path.join(root, name), "psql\n");
    mkdirSync(path.join(root, "node_modules"));
    writeFileSync(path.join(root, "node_modules", "dep.js"), "psql\n");
    expect(
      scriptsFiles(root)
        .map((file) => path.basename(file))
        .sort(),
    ).toEqual([...names].sort());
  });

  // A new file that names psql is listed by name, even when it only hands
  // psql to the runner: the list is what a reviewer reads.
  it.each([
    [
      "an unlisted import that hands psql to the runner",
      "scripts/x/ok.mjs",
      'import { runPsqlQuery } from "../lib/psql.mjs";\nconst psqlBin = process.env.PSQL_BIN?.trim() || "psql";\nrunPsqlQuery({ databaseUrl, sql: "select 1", psqlBin });\n',
    ],
    [
      "an unlisted shell script that goes through the local-database helper",
      "scripts/x/ok.sh",
      '#!/usr/bin/env bash\nrequire_cmd psql\nlocal_psql() {\n  node "$SCRIPT_DIR/lib/local-database.mjs" psql SUPABASE_DB_URL "$@"\n}\nlocal_psql -c "select 1"\n',
    ],
    [
      "an unlisted file that names psql in a comment only",
      "scripts/x/comment-only.mjs",
      "// psql is never started here.\nexport const answer = 42;\n",
    ],
  ])("refuses %s, until it is listed", (_case, file, source) => {
    expect(psqlProblem(file, source)).toMatch(/not.*listed|neither/);
  });

  it("refuses a listed file that names psql once more than its count", () => {
    const file = "scripts/lib/environment-marker.mjs";
    const source = `${readFileSync(file, "utf8")}\nspawnSync(psqlBin, ["-c", "select 1"]);\n`;
    expect(psqlProblem(file, source)).toMatch(
      /names psql 13 time\(s\), and PSQL_NAMERS says 12/,
    );
  });

  it.each([
    [
      "a file that never names psql",
      "scripts/x/plain.mjs",
      'import { spawnSync } from "node:child_process";\nspawnSync("ls", ["-l"]);\n',
    ],
    [
      "Markdown",
      "scripts/x/README.md",
      "Run `psql` through `scripts/lib/psql.mjs`.\n",
    ],
    [
      "a listed starter",
      "scripts/verify/backup-restore-proof.mjs",
      'spawnSync("docker", ["exec", "db", "psql", "-c", "select 1"]);\n',
    ],
  ])("accepts %s", (_case, file, source) => {
    expect(psqlProblem(file, source)).toBeNull();
  });

  it("the three shared builders call the one check and keep the one list", () => {
    for (const file of SHARED_BUILDERS) {
      const source = readFileSync(file, "utf8");
      expect(source, file).toMatch(/\bdatabaseUrlProblem\(/);
      expect(source, file).toMatch(/\bkeptAmbientLibpqEnv\(/);
    }
    expect(
      readFileSync("scripts/verify/stripe-data-pipeline.mjs", "utf8"),
    ).not.toMatch(/databaseUrlProblem|keptAmbientLibpqEnv/);
  });

  it.each(["scripts/AGENTS.md", "scripts/lib/psql.mjs"])(
    "%s names every starter, and the document gate that starts none",
    (file) => {
      const text = readFileSync(file, "utf8");
      for (const starter of PSQL_STARTERS)
        expect(text, starter).toContain(starter);
      expect(text).toContain(
        "scripts/document-cutover/assess-document-cutover.ts",
      );
      expect(text).toContain("KEPT_AMBIENT_LIBPQ_ENV");
      expect(text).not.toMatch(/\bthree files start `?psql/i);
    },
  );
});

// Review N2: the two outliers keep their own checks for now, so the documents
// an operator reads say the check is weaker than the release job's and what
// to set by hand on a hosted address.
describe("the outliers' operator documents (review N2)", () => {
  it.each([
    ["docs/guides/operations/stripe-data-pipeline.md", /sslrootcert=/],
    ["docs/ops/document-cutover/reset-rebuild.md", /NODE_EXTRA_CA_CERTS/],
    [
      "docs/ops/document-cutover/rollback-before-first-canonical-write.md",
      /NODE_EXTRA_CA_CERTS/,
    ],
  ])("%s warns, and says what to set", (file, ca) => {
    const text = readFileSync(file, "utf8");
    expect(text).toMatch(/weaker than the release job's/);
    expect(text).toContain("release-job.md");
    expect(text).toContain("sslmode=verify-full");
    expect(text).toMatch(ca);
  });

  // The gate pins each procedure's version and digest; an edit must move both.
  it("leaves the document gate's pinned procedures equal to the committed documents", async () => {
    const { createHash } = await import("node:crypto");
    const gate = readFileSync(
      "scripts/document-cutover/assess-document-cutover.ts",
      "utf8",
    );
    for (const [name, file] of [
      ["RESET_PROCEDURE", "docs/ops/document-cutover/reset-rebuild.md"],
      [
        "ROLLBACK_PROCEDURE",
        "docs/ops/document-cutover/rollback-before-first-canonical-write.md",
      ],
    ]) {
      const block = gate.slice(
        gate.indexOf(`const ${name} = {`),
        gate.indexOf("};", gate.indexOf(`const ${name} = {`)),
      );
      const text = readFileSync(file, "utf8");
      const digest = createHash("sha256")
        .update(JSON.stringify(text), "utf8")
        .digest("hex");
      expect(block, name).toContain(`"${digest}"`);
      const version = /\*\*Procedure version:\*\* (\d+)/.exec(text)?.[1];
      expect(block, name).toContain(`pinnedVersion: "${version}"`);
    }
  });
});

// Review N6: PGREQUIREAUTH, which a hosted address gets, arrived in libpq 16.
// The shared runner stops before it starts psql on a hosted address unless
// psql reports 16 or later; a loopback address is not asked.
describe.skipIf(process.platform === "win32")(
  "the shared runner on an older psql (review N6)",
  () => {
    const hosted =
      "postgresql://postgres.abcdefghijklmnopqrst:pw@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert=%2Fjob%2Froot.crt";
    function oldPsql() {
      const root = mkdtempSync(path.join(os.tmpdir(), "n6-psql-"));
      const bin = path.join(root, "psql");
      const ran = path.join(root, "ran");
      writeFileSync(
        bin,
        `#!/bin/sh\nif [ "$1" = "--version" ]; then echo "psql (PostgreSQL) 15.8"; exit 0; fi\ntouch "${ran}"\necho 1\n`,
        { mode: 0o755 },
      );
      return { root, bin, ran };
    }

    it.each([
      [
        "runPsqlQuery",
        (bin: string) =>
          runPsqlQuery({ databaseUrl: hosted, sql: "select 1", psqlBin: bin }),
      ],
      [
        "spawnPsql",
        (bin: string) =>
          spawnPsql({
            databaseUrl: hosted,
            args: ["-c", "select 1"],
            psqlBin: bin,
          }),
      ],
    ])(
      "%s stops on psql 15 for a hosted address, before psql connects",
      (_name, call) => {
        const { root, bin, ran } = oldPsql();
        try {
          expect(() => call(bin)).toThrow(
            /psql 15\.8.*16 or later.*PGREQUIREAUTH/,
          );
          expect(existsSync(ran)).toBe(false);
        } finally {
          rmSync(root, { recursive: true, force: true });
        }
      },
    );

    it("asks nothing of psql for a loopback address", () => {
      const { root, bin, ran } = oldPsql();
      try {
        runPsqlQuery({
          databaseUrl:
            "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
          sql: "select 1",
          psqlBin: bin,
        });
        expect(existsSync(ran)).toBe(true);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });
  },
);
