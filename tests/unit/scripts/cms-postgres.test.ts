import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const spawnSync = vi.hoisted(() => vi.fn());
vi.mock("node:child_process", () => ({ spawnSync }));

import { runPsql, runPsqlFile } from "../../../scripts/cms/lib/postgres.mjs";

/**
 * The release job's certificate fixtures (review M3). A CA file the builder
 * hands psql for a hosted address must hold the project's CA (phase 15, P3).
 */
const caFixture = (name: string) =>
  path.resolve("tests/unit/scripts/release/fixtures/ca", name);
const CA_FILE = caFixture("ca.crt");

/**
 * Review N6: a hosted address makes the builder ask `psql --version` first.
 * The fake answers it with a version, and every other call with `value`.
 */
const answer = (
  value: Record<string, unknown>,
  version = "psql (PostgreSQL) 17.11\n",
) =>
  spawnSync.mockImplementation((_command: string, args: string[] = []) =>
    args[0] === "--version"
      ? { status: 0, stdout: version, stderr: "" }
      : value,
  );

const databaseUrl =
  "postgresql://postgres.example:fake%3Apassword@pooler.example.com:5432/postgres?sslmode=verify-full&connect_timeout=15";

// Phase 16, Q4: a hosted address needs the project's CA file, so every case
// starts with one; a case about the CA file sets or removes it.
beforeEach(() => {
  vi.stubEnv("PGSSLROOTCERT", CA_FILE);
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("CMS PostgreSQL command connection", () => {
  it.each(["", "?sslmode=require", "?sslmode=disable"])(
    "requires verified hosted TLS for query %j before starting psql",
    (query) => {
      answer({ status: 0, stdout: "1", stderr: "" });
      expect(() =>
        runPsql("SELECT 1", {
          databaseUrl: `postgres://unit:fixture@db.invalid/private${query}`,
        }),
      ).toThrow(/db\.invalid.*sslmode=verify-full/);
      expect(spawnSync).not.toHaveBeenCalled();
    },
  );
  it("uses encrypted libpq-compatible settings without putting credentials in argv", () => {
    answer({ status: 0, stdout: "1\n", stderr: "" });

    expect(runPsql("SELECT 1;", { databaseUrl })).toBe("1");
    const [, args, options] = spawnSync.mock.calls.at(-1)!;

    expect(args).not.toContain(databaseUrl);
    expect(JSON.stringify(args)).not.toContain("password");
    expect(options.env).toMatchObject({
      PGHOST: "pooler.example.com",
      PGPORT: "5432",
      PGDATABASE: "postgres",
      PGUSER: "postgres.example",
      PGPASSWORD: "fake:password",
      PGSSLMODE: "verify-full",
      PGCONNECT_TIMEOUT: "15",
    });
    expect(options.shell).toBe(false);
  });

  it("uses the same connection handling for transactional SQL files", () => {
    vi.stubEnv("PAYLOAD_DATABASE_URI", databaseUrl);
    answer({ status: 0 });

    runPsqlFile("reviewed-migration.sql", { singleTransaction: true });
    const [, args, options] = spawnSync.mock.calls.at(-1)!;

    expect(args).toContain("--single-transaction");
    expect(args).not.toContain(databaseUrl);
    expect(options.env.PGSSLMODE).toBe("verify-full");
    expect(options.env.PGPASSWORD).toBe("fake:password");
  });

  it("retains the local no-verify compatibility mapping", () => {
    answer({ status: 0, stdout: "1", stderr: "" });
    runPsql("SELECT 1;", {
      databaseUrl: "postgres://localhost/unit?sslmode=no-verify",
    });

    expect(spawnSync.mock.calls.at(-1)![2].env.PGSSLMODE).toBe("require");
  });

  // Review L2: the address is the whole target. Of the ambient PG*
  // settings only the CA file (the release job hands it to the runner as
  // PGSSLROOTCERT) and the password (a caller may keep it out of the address)
  // survive; any other could fill in or change the target or the login.
  it("drops every ambient PG* setting but the CA file and the password", () => {
    for (const [key, value] of Object.entries({
      PGHOST: "elsewhere.example",
      PGHOSTADDR: "203.0.113.9",
      PGPORT: "6543",
      PGUSER: "postgres",
      PGDATABASE: "other",
      PGOPTIONS: "-c role=postgres",
      PGSSLMODE: "disable",
      PGTARGETSESSIONATTRS: "read-write",
      PGSSLROOTCERT: CA_FILE,
      PGPASSWORD: "ambient-password",
    }))
      vi.stubEnv(key, value);
    answer({ status: 0, stdout: "1", stderr: "" });
    runPsql("SELECT 1;", {
      databaseUrl: "postgresql://db.example/postgres?sslmode=verify-full",
    });
    const env = spawnSync.mock.calls.at(-1)![2].env;
    expect(env.PGHOST).toBe("db.example");
    expect(env.PGDATABASE).toBe("postgres");
    expect(env.PGSSLMODE).toBe("verify-full");
    for (const key of [
      "PGHOSTADDR",
      "PGPORT",
      "PGUSER",
      "PGOPTIONS",
      "PGTARGETSESSIONATTRS",
    ])
      expect(env[key], key).toBeUndefined();
    expect(env.PGSSLROOTCERT).toBe(CA_FILE);
    expect(env.PGPASSWORD).toBe("ambient-password");
  });

  // Review L2: only the shared allowlist of query keys; nothing passes
  // through to libpq unread, and a query host is never a target.
  it.each([
    ["an unknown key", "&keepalives_idle=30"],
    ["a query host", "&host=evil.example"],
    ["a key with a blank", "&%20host=evil.example"],
    ["options on a hosted address", "&options=-c%20role%3Dpostgres"],
  ])("refuses %s before starting psql", (_case, extra) => {
    const priorCalls = spawnSync.mock.calls.length;
    expect(() =>
      runPsql("SELECT 1;", { databaseUrl: `${databaseUrl}${extra}` }),
    ).toThrow(/refused/);
    expect(spawnSync.mock.calls).toHaveLength(priorCalls);
  });

  it("hands the local CMS session role to psql as PGOPTIONS, for a loopback address only", () => {
    answer({ status: 0, stdout: "1", stderr: "" });
    runPsql("SELECT 1;", {
      databaseUrl:
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres?options=-c%20role%3Dcms_owner",
    });
    expect(spawnSync.mock.calls.at(-1)![2].env.PGOPTIONS).toBe(
      "-c role=cms_owner",
    );
  });

  it("reports malformed credential encoding without leaking the URL", () => {
    expect(() =>
      runPsql("SELECT 1;", {
        databaseUrl: "postgresql://fake-user:%zz@db.example/postgres",
      }),
    ).toThrow("CMS database connection must be a valid Postgres URL.");
  });

  it("does not let an ambient service replace an explicit database target", () => {
    vi.stubEnv("PGSERVICE", "another-database");
    vi.stubEnv("PGSERVICEFILE", "custom-services.conf");
    answer({ status: 0, stdout: "1", stderr: "" });

    runPsql("SELECT 1;", { databaseUrl });
    expect(spawnSync.mock.calls.at(-1)![2].env.PGSERVICE).toBeUndefined();
    expect(spawnSync.mock.calls.at(-1)![2].env.PGHOST).toBe(
      "pooler.example.com",
    );

    runPsqlFile("reviewed-migration.sql", { databaseUrl });
    expect(spawnSync.mock.calls.at(-1)![2].env.PGSERVICE).toBeUndefined();
    expect(spawnSync.mock.calls.at(-1)![2].env.PGHOST).toBe(
      "pooler.example.com",
    );
  });

  it("rejects explicit service routing before starting psql", () => {
    const routedUrl = `${databaseUrl}&service=another-database`;
    const priorCalls = spawnSync.mock.calls.length;
    expect(() => runPsql("SELECT 1;", { databaseUrl: routedUrl })).toThrow(
      "service",
    );
    expect(() =>
      runPsqlFile("reviewed-migration.sql", { databaseUrl: routedUrl }),
    ).toThrow("service");
    expect(spawnSync.mock.calls).toHaveLength(priorCalls);
  });

  // Review L2: the query is read as libpq reads it: %XX decoded, + kept.
  it("reads the query as libpq does", () => {
    answer({ status: 0, stdout: "1", stderr: "" });
    runPsql("SELECT 1;", {
      databaseUrl: `${databaseUrl}&application_name=core%20local+cms`,
    });
    expect(spawnSync.mock.calls.at(-1)![2].env.PGAPPNAME).toBe(
      "core local+cms",
    );
  });

  // Review L1: the builder never decodes the host, and requires SCRAM for a
  // hosted address.
  it("never decodes the host, and requires SCRAM for a hosted address", () => {
    answer({ status: 0, stdout: "1", stderr: "" });
    runPsql("SELECT 1;", {
      databaseUrl:
        "postgresql://cms_owner.fixture:fake-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=verify-full",
    });
    const env = spawnSync.mock.calls.at(-1)![2].env;
    expect(env.PGHOST).toBe("aws-0-us-east-1.pooler.supabase.com");
    expect(env.PGREQUIREAUTH).toBe("scram-sha-256");
    expect(() =>
      runPsql("SELECT 1;", {
        databaseUrl:
          "postgresql://cms_owner.fixture:fake-password@evil.example%2Caws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require",
      }),
    ).toThrow(/host/);
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
  PGSSLROOTCERT: CA_FILE,
};
const pgOnly = (env: Record<string, string | undefined>) =>
  Object.fromEntries(
    Object.entries(env).filter(([key]) => key.startsWith("PG")),
  );

describe("the CMS builder's ambient settings (review M3)", () => {
  it("keeps nothing of a hostile environment but the shared list", () => {
    for (const [key, value] of Object.entries(HOSTILE_PG_ENV))
      vi.stubEnv(key, value);
    answer({ status: 0, stdout: "1\n", stderr: "" });
    runPsql("SELECT 1;", {
      databaseUrl:
        "postgresql://cms_owner.abcdefghijklmnopqrst:pw@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full",
    });
    const [, , options] = spawnSync.mock.calls.at(-1)!;
    expect(pgOnly(options.env)).toEqual({
      PGHOST: "aws-0-us-west-2.pooler.supabase.com",
      PGPORT: "5432",
      PGDATABASE: "postgres",
      PGUSER: "cms_owner.abcdefghijklmnopqrst",
      PGPASSWORD: "pw",
      PGSSLMODE: "verify-full",
      PGSSLROOTCERT: CA_FILE,
      PGREQUIREAUTH: "scram-sha-256",
    });
  });
});

// The last check's P3 (phase 15): the builder keeps an ambient PGSSLROOTCERT
// for the CA file the release job hands it, and libpq reads `system` as the
// machine's whole certificate store. For a hosted address the CA file it
// hands psql, ambient or from the address, must hold the project's CA, read
// by the release job's own check: one certificate, a CA, valid now. The local
// CMS scripts reach this builder without the hosted target check.
describe("the CA file the CMS builder hands psql (phase 15, P3)", () => {
  const hosted =
    "postgresql://cms_owner.abcdefghijklmnopqrst:pw@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full";

  it.each([
    [
      "an ambient PGSSLROOTCERT=system",
      { PGSSLROOTCERT: "system" },
      hosted,
      /PGSSLROOTCERT=system/,
    ],
    [
      "the address's sslrootcert=system",
      {},
      `${hosted}&sslrootcert=system`,
      /PGSSLROOTCERT=system/,
    ],
    [
      "a file that cannot be read",
      { PGSSLROOTCERT: "/nonexistent/p3/root.crt" },
      hosted,
      /cannot be read \(ENOENT\)/,
    ],
    // Phase 16, Q5: psql would resolve a relative path against its own
    // working directory, not this check's.
    [
      "a relative path, even to the project's CA",
      { PGSSLROOTCERT: "tests/unit/scripts/release/fixtures/ca/ca.crt" },
      hosted,
      /PGSSLROOTCERT names a relative path/,
    ],
    [
      "the address's sslrootcert as a relative path",
      {},
      `${hosted}&sslrootcert=tests%2Funit%2Fscripts%2Frelease%2Ffixtures%2Fca%2Fca.crt`,
      /PGSSLROOTCERT names a relative path/,
    ],
    [
      "a file of two certificates",
      { PGSSLROOTCERT: caFixture("two-cas.crt") },
      hosted,
      /holds 2 certificates/,
    ],
    [
      "a certificate that is not a CA",
      { PGSSLROOTCERT: caFixture("leaf.crt") },
      hosted,
      /not a CA/,
    ],
  ])(
    "refuses %s for a hosted address, before psql starts",
    (_case, ambient, databaseUrl, words) => {
      for (const [key, value] of Object.entries(ambient))
        vi.stubEnv(key, value);
      spawnSync.mockReset();
      answer({ status: 0, stdout: "1\n", stderr: "" });
      for (const call of [
        () => runPsql("SELECT 1;", { databaseUrl }),
        () => runPsqlFile("x.sql", { databaseUrl }),
      ]) {
        expect(call).toThrow(/CMS database connection is refused/);
        expect(call).toThrow(words);
      }
      expect(spawnSync).not.toHaveBeenCalled();
    },
  );

  // Phase 16, Q4: with no CA file named, libpq reads ~/.postgresql/root.crt
  // unchecked, or under sslmode=require checks nothing at all.
  it.each([
    ["no PGSSLROOTCERT", undefined, hosted],
    ["an empty PGSSLROOTCERT", "", hosted],
    [
      "sslmode=require and no PGSSLROOTCERT",
      undefined,
      hosted.replace("verify-full", "require"),
    ],
  ])(
    "refuses a hosted address with %s, before psql starts, and names what to set",
    (_case, ambient, databaseUrl) => {
      vi.stubEnv("PGSSLROOTCERT", ambient);
      expect(process.env.PGSSLROOTCERT).toBe(ambient);
      spawnSync.mockReset();
      answer({ status: 0, stdout: "1\n", stderr: "" });
      for (const call of [
        () => runPsql("SELECT 1;", { databaseUrl }),
        () => runPsqlFile("x.sql", { databaseUrl }),
      ])
        expect(call).toThrow(
          databaseUrl !== hosted
            ? /must set sslmode=verify-full/
            : /CMS database connection is refused: .*Set PGSSLROOTCERT to a file holding the project's CA certificate/,
        );
      expect(spawnSync).not.toHaveBeenCalled();
    },
  );

  it("still needs no CA file for a loopback address", () => {
    vi.stubEnv("PGSSLROOTCERT", undefined);
    answer({ status: 0, stdout: "1\n", stderr: "" });
    expect(
      runPsql("SELECT 1;", {
        databaseUrl: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
      }),
    ).toBe("1");
  });

  it("hands psql the project's CA file for a hosted address", () => {
    vi.stubEnv("PGSSLROOTCERT", CA_FILE);
    answer({ status: 0, stdout: "1\n", stderr: "" });
    runPsql("SELECT 1;", { databaseUrl: hosted });
    expect(spawnSync.mock.calls.at(-1)![2].env.PGSSLROOTCERT).toBe(CA_FILE);
  });

  it("leaves a loopback address's CA setting as it was", () => {
    vi.stubEnv("PGSSLROOTCERT", "system");
    answer({ status: 0, stdout: "1\n", stderr: "" });
    runPsql("SELECT 1;", {
      databaseUrl: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    });
    expect(spawnSync.mock.calls.at(-1)![2].env.PGSSLROOTCERT).toBe("system");
  });
});

// Review N6: PGREQUIREAUTH, which a hosted address gets, arrived in libpq 16;
// an older psql would ignore it. The builder stops before it runs anything.
describe("the CMS builder on an older psql (review N6)", () => {
  const hosted =
    "postgresql://cms_owner.abcdefghijklmnopqrst:pw@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full";

  it.each([
    ["runPsql", () => runPsql("SELECT 1;", { databaseUrl: hosted })],
    ["runPsqlFile", () => runPsqlFile("x.sql", { databaseUrl: hosted })],
  ])(
    "%s stops on psql 15 for a hosted address, before any query",
    (_name, call) => {
      spawnSync.mockReset();
      answer(
        { status: 0, stdout: "1\n", stderr: "" },
        "psql (PostgreSQL) 15.8\n",
      );
      expect(call).toThrow(/psql 15\.8.*16 or later.*PGREQUIREAUTH/);
      expect(spawnSync.mock.calls.map((c) => c[1]?.[0])).toEqual(["--version"]);
    },
  );

  it("asks nothing of psql for a loopback address", () => {
    spawnSync.mockReset();
    answer(
      { status: 0, stdout: "1\n", stderr: "" },
      "psql (PostgreSQL) 15.8\n",
    );
    runPsql("SELECT 1;", {
      databaseUrl: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    });
    expect(spawnSync.mock.calls.map((c) => c[1]?.[0])).not.toContain(
      "--version",
    );
  });
});
