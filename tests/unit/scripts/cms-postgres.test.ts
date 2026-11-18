import { afterEach, describe, expect, it, vi } from "vitest";

const spawnSync = vi.hoisted(() => vi.fn());
vi.mock("node:child_process", () => ({ spawnSync }));

import { runPsql, runPsqlFile } from "../../../scripts/cms/lib/postgres.mjs";

const databaseUrl =
  "postgresql://postgres.example:fake%3Apassword@pooler.example.com:5432/postgres?sslmode=no-verify&connect_timeout=15";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("CMS PostgreSQL command connection", () => {
  it("uses encrypted libpq-compatible settings without putting credentials in argv", () => {
    spawnSync.mockReturnValue({ status: 0, stdout: "1\n", stderr: "" });

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
      PGSSLMODE: "require",
      PGCONNECT_TIMEOUT: "15",
    });
    expect(options.shell).toBe(false);
  });

  it("uses the same connection handling for transactional SQL files", () => {
    vi.stubEnv("PAYLOAD_DATABASE_URI", databaseUrl);
    spawnSync.mockReturnValue({ status: 0 });

    runPsqlFile("reviewed-migration.sql", { singleTransaction: true });
    const [, args, options] = spawnSync.mock.calls.at(-1)!;

    expect(args).toContain("--single-transaction");
    expect(args).not.toContain(databaseUrl);
    expect(options.env.PGSSLMODE).toBe("require");
    expect(options.env.PGPASSWORD).toBe("fake:password");
  });

  it("preserves certificate verification when the URL requests it", () => {
    spawnSync.mockReturnValue({ status: 0, stdout: "1", stderr: "" });
    runPsql("SELECT 1;", {
      databaseUrl: databaseUrl.replace("no-verify", "verify-full"),
    });

    expect(spawnSync.mock.calls.at(-1)![2].env.PGSSLMODE).toBe("verify-full");
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
      PGSSLROOTCERT: "/run/ca.pem",
      PGPASSWORD: "ambient-password",
    }))
      vi.stubEnv(key, value);
    spawnSync.mockReturnValue({ status: 0, stdout: "1", stderr: "" });
    runPsql("SELECT 1;", { databaseUrl: "postgresql://db.example/postgres" });
    const env = spawnSync.mock.calls.at(-1)![2].env;
    expect(env.PGHOST).toBe("db.example");
    expect(env.PGDATABASE).toBe("postgres");
    for (const key of [
      "PGHOSTADDR",
      "PGPORT",
      "PGUSER",
      "PGOPTIONS",
      "PGSSLMODE",
      "PGTARGETSESSIONATTRS",
    ])
      expect(env[key], key).toBeUndefined();
    expect(env.PGSSLROOTCERT).toBe("/run/ca.pem");
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
    spawnSync.mockReturnValue({ status: 0, stdout: "1", stderr: "" });
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
    spawnSync.mockReturnValue({ status: 0, stdout: "1", stderr: "" });

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
    spawnSync.mockReturnValue({ status: 0, stdout: "1", stderr: "" });
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
    spawnSync.mockReturnValue({ status: 0, stdout: "1", stderr: "" });
    runPsql("SELECT 1;", {
      databaseUrl:
        "postgresql://cms_owner.fixture:fake-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require",
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
  PGSSLROOTCERT: "/ambient/ca.crt",
};
const pgOnly = (env: Record<string, string | undefined>) =>
  Object.fromEntries(
    Object.entries(env).filter(([key]) => key.startsWith("PG")),
  );

describe("the CMS builder's ambient settings (review M3)", () => {
  it("keeps nothing of a hostile environment but the shared list", () => {
    for (const [key, value] of Object.entries(HOSTILE_PG_ENV))
      vi.stubEnv(key, value);
    spawnSync.mockReturnValue({ status: 0, stdout: "1\n", stderr: "" });
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
      PGSSLROOTCERT: "/ambient/ca.crt",
      PGREQUIREAUTH: "scram-sha-256",
    });
  });
});
