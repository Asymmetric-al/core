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

import {
  LOOPBACK_HOSTS,
  isLoopbackDatabaseUrl,
  psqlConnection,
  runPsqlQuery,
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
});

describe("psqlConnection", () => {
  it("moves a percent-encoded password into PGPASSWORD and keeps the rest of the URL", () => {
    const { connection, env } = psqlConnection(
      "postgresql://postgres:p%40ss%2Fw0rd@db.example:6543/postgres?sslmode=require",
      { PGSERVICE: "prod", KEEP: "1" },
    );
    expect(connection).toBe(
      "postgresql://postgres@db.example:6543/postgres?sslmode=require",
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

  it("leaves a URL without a password as it is", () => {
    expect(
      psqlConnection("postgresql://postgres@127.0.0.1:5432/disposable_test", {})
        .connection,
    ).toBe("postgresql://postgres@127.0.0.1:5432/disposable_test");
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
        "postgresql://postgres@127.0.0.1:5432/d",
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
