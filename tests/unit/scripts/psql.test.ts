/**
 * AL-2674 council round 1 (E3): one psql runner for the catalog gate, the
 * field-policy gate and the environment marker. The password travels in
 * PGPASSWORD and never in the argument list, and one list says which hosts
 * are loopback. The runner is driven here with a fake psql that records what
 * it received.
 */
import {
  chmodSync,
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

// Review M4: the texts name every file under scripts/ that starts psql and say
// which of them use the shared check; the code decides what is true.
const PSQL_STARTERS = [
  // The three builders of a psql connection from an address: the shared
  // check (databaseUrlProblem) and the shared list (keptAmbientLibpqEnv).
  "scripts/lib/psql.mjs",
  "scripts/release/lib/postgres.mjs",
  "scripts/cms/lib/postgres.mjs",
  // psql --version only, for the floor of review M3.
  "scripts/release/release-database.mjs",
  // psql, pg_dump and pg_restore inside a Docker container it starts.
  "scripts/verify/backup-restore-proof.mjs",
  // A check and a builder of its own, left as they are (review M4).
  "scripts/verify/stripe-data-pipeline.mjs",
];
const SHARED_BUILDERS = PSQL_STARTERS.slice(0, 3);

function scriptsFiles(dir = "scripts"): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = `${dir}/${entry.name}`;
    if (entry.isDirectory())
      return entry.name === "node_modules" ? [] : scriptsFiles(file);
    return /\.(?:mjs|cjs|js|ts|sh)$/.test(entry.name) ? [file] : [];
  });
}

/** Source without its comments, so a comment can neither pass nor fail it. */
function withoutComments(source: string, shell: boolean): string {
  return shell
    ? source.replace(/(^|\s)#(?!!).*$/gm, "$1")
    : source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
}
/** psql in a shell command's place: line start, after ; & | ( ` { or $(, after then/do/else/exec/sudo/time/command/xargs/env, and after VAR=value prefixes. */
const SHELL_PSQL =
  /(?:^|[;&|(`{]|\$\(|\b(?:then|do|else|exec|sudo|time|command|xargs|env))[ \t]*(?:[A-Za-z_]\w*=\S*[ \t]+)*psql(?=[ \t]|$|[;)|&])/m;
/** A child-process call whose program is psql. */
const DIRECT_PSQL =
  /\b(?:spawn|spawnSync|execFile|execFileSync|exec|execSync)\s*\(\s*(?:["'`]psql["'`]|psqlBin\b|process\.env\.PSQL_BIN)/;
/** A real import of scripts/lib/psql.mjs, static or dynamic. */
const IMPORTS_PSQL =
  /\bfrom\s+["'][^"']*\/psql\.mjs["']|\bimport\(\s*["'][^"']*\/psql\.mjs["']\s*\)/;

/**
 * Why a file under scripts/ breaks the rule of reviews M4 and N4, or null. A
 * file that is not a listed starter never starts psql itself: a shell file
 * goes through scripts/lib/local-database.mjs, and a JavaScript file names
 * psql only to hand it to scripts/lib/psql.mjs, which it really imports.
 */
function psqlProblem(file: string, source: string): string | null {
  if (PSQL_STARTERS.includes(file)) return null;
  const shell = file.endsWith(".sh");
  const code = withoutComments(source, shell);
  if (shell)
    return SHELL_PSQL.test(code)
      ? `${file} starts psql itself; go through scripts/lib/local-database.mjs`
      : null;
  if (DIRECT_PSQL.test(code)) return `${file} starts psql itself`;
  if (/["'`]psql["'`]|PSQL_BIN/.test(code) && !IMPORTS_PSQL.test(code))
    return `${file} names psql but does not import scripts/lib/psql.mjs`;
  return null;
}

describe("the files under scripts/ that start psql (review M4)", () => {
  it("every file that names psql is a listed starter or goes through a shared builder", () => {
    for (const file of scriptsFiles())
      expect(psqlProblem(file, readFileSync(file, "utf8"))).toBeNull();
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

  it.each([
    [
      "a real import that hands psql to the runner",
      "scripts/x/ok.mjs",
      'import { runPsqlQuery } from "../lib/psql.mjs";\nconst psqlBin = process.env.PSQL_BIN?.trim() || "psql";\nrunPsqlQuery({ databaseUrl, sql: "select 1", psqlBin });\n',
    ],
    [
      "a shell script that goes through the local-database helper",
      "scripts/x/ok.sh",
      '#!/usr/bin/env bash\n# Runs psql through the shared runner.\nrequire_cmd psql\nlocal_psql() {\n  node "$SCRIPT_DIR/lib/local-database.mjs" psql SUPABASE_DB_URL "$@"\n}\nlocal_psql -c "select 1"\n',
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
