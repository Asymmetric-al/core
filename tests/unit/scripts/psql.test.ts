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
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { DATABASE_URL_QUERY_KEYS } from "../../../packages/env/src/database-url.mjs";
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
    expect(env).toEqual({ KEEP: "1", PGPASSWORD: "p@ss/w0rd" });
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
      .filter(([key, entry]) => entry.psql && key !== "password")
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
