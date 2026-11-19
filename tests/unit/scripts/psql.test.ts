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
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
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
  it.each(["", "?sslmode=require", "?sslmode=disable"])(
    "requires verified hosted TLS for query %j",
    (query) => {
      expect(() =>
        psqlConnection(
          `postgres://unit:fixture@db.invalid/private${query}`,
          {},
        ),
      ).toThrow(/db\.invalid.*sslmode=verify-full/);
    },
  );

  it.each([
    "postgres://fixture%00name@localhost/unit",
    "postgres://unit:fixture%00value@localhost/unit",
    "postgres://localhost/fixture%00db",
    "postgres://localhost/unit?fixture%00key=x",
    "postgres://localhost/unit?password=fixture%00value",
  ])("rejects a decoded NUL without displaying the field", (address) => {
    expect(() => psqlConnection(address, {})).toThrow(/NUL/);
    expect(() => psqlConnection(address, {})).not.toThrow(/fixture/);
    expect(isLoopbackDatabaseUrl(address)).toBe(false);
  });
  it("refuses a literal NUL without including any address field in the error", () => {
    const address =
      "postgres://fixture-user:fixture-password@fixture.invalid/fixture-db\0";
    expect(() => psqlConnection(address, {})).toThrow(
      /^the database URL is refused for psql: a database address cannot contain a decoded NUL$/,
    );
  });
  it("moves a percent-encoded password into PGPASSWORD and keeps the rest of the URL", () => {
    const { connection, env } = psqlConnection(
      "postgresql://postgres:p%40ss%2Fw0rd@db.example:6543/postgres?sslmode=verify-full",
      { PGSERVICE: "prod", KEEP: "1" },
    );
    // H11: libpq gets the parsed parts as keywords, never the raw string.
    expect(connection).toBe(
      "host='db.example' port='6543' dbname='postgres' user='postgres' sslmode='verify-full'",
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
      "postgresql://postgres:login-fixture@127.0.0.1:5432/d?password=s3cret&sslmode=disable",
      {},
    );
    expect(connection).not.toContain("s3cret");
    expect(connection).not.toContain("login-fixture");
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
        "postgresql://postgres.abcdefghijklmnopqrst@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full",
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
        (cwd: string) =>
          runPsqlQuery({
            databaseUrl: hosted,
            sql: "select 1",
            psqlBin: "./psql",
            cwd,
          }),
      ],
      [
        "spawnPsql",
        (cwd: string) =>
          spawnPsql({
            databaseUrl: hosted,
            args: ["-c", "select 1"],
            psqlBin: "./psql",
            cwd,
          }),
      ],
    ])(
      "%s stops on psql 15 for a hosted address, before psql connects",
      (_name, call) => {
        const { root, ran } = oldPsql();
        try {
          expect(() => call(root)).toThrow(
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
