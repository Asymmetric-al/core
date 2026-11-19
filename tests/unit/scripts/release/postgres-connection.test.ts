// The release job's own psql connection (scripts/release/lib/postgres.mjs):
// libpq takes the target from PG* variables built from the parsed address.
import { describe, expect, it, vi } from "vitest";

import {
  connectionEnvironment,
  runPsql,
} from "../../../../scripts/release/lib/postgres.mjs";

const hosted =
  "postgresql://postgres.abcdefghijklmnopqrst:pw@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require";

describe("the release job's psql connection", () => {
  // Review L1: the builder never decodes the host, so an escaped comma or
  // slash can never become a host list or a socket directory.
  it("never decodes the host: an escaped comma is refused, not turned into a list", () => {
    expect(() =>
      connectionEnvironment(
        "postgresql://postgres.abcdefghijklmnopqrst@evil.example%2Caws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require",
        {},
      ),
    ).toThrow(/host/);
    expect(
      connectionEnvironment(
        "postgresql://postgres.abcdefghijklmnopqrst@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require",
        {},
      ).PGHOST,
    ).toBe("aws-0-us-east-1.pooler.supabase.com");
  });

  // Review L1: the pooler authenticated with SCRAM on the preview project on
  // 18 November 2026, so a hosted server may never ask for the password in
  // clear text.
  it("requires SCRAM for a hosted address and leaves a loopback one alone", () => {
    expect(connectionEnvironment(hosted, {}).PGREQUIREAUTH).toBe(
      "scram-sha-256",
    );
    expect(
      connectionEnvironment(
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
        {},
      ).PGREQUIREAUTH,
    ).toBeUndefined();
  });
});

// Review L2: the release job's own psql refuses any address the one check
// refuses, so no query key or host can steer it.
describe("the release job's psql connection refuses what the one check refuses", () => {
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
  ])("refuses %s", (_case, url) => {
    expect(() => connectionEnvironment(url, {})).toThrow(/refused/);
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

describe("the release builder's ambient settings (review M3)", () => {
  it("keeps nothing of a hostile environment but what the address sets", () => {
    const env = connectionEnvironment(
      "postgresql://postgres.abcdefghijklmnopqrst:pw@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert=%2Fjob%2Froot.crt",
      { ...HOSTILE_PG_ENV, DATABASE_URL: "postgresql://evil", KEEP: "1" },
    );
    expect(pgOnly(env)).toEqual({
      PGHOST: "aws-0-us-west-2.pooler.supabase.com",
      PGPORT: "5432",
      PGDATABASE: "postgres",
      PGUSER: "postgres.abcdefghijklmnopqrst",
      PGPASSWORD: "pw",
      PGSSLMODE: "verify-full",
      PGSSLROOTCERT: "/job/root.crt",
      PGREQUIREAUTH: "scram-sha-256",
    });
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.KEEP).toBe("1");
  });
});

// Review N6: the release builder asks psql's version for a hosted address,
// wherever it runs, not only inside the release job's steps.
describe("the release builder on an older psql (review N6)", () => {
  const fake = (version: string) =>
    vi.fn((_bin: string, args: string[]) =>
      args[0] === "--version"
        ? { status: 0, stdout: version, stderr: "" }
        : { status: 0, stdout: "1\n", stderr: "" },
    );

  it("stops on psql 15 for a hosted address, before the query", () => {
    const run = fake("psql (PostgreSQL) 15.8\n");
    expect(() =>
      runPsql({
        databaseUrl:
          "postgresql://postgres.abcdefghijklmnopqrst:pw@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert=%2Fjob%2Froot.crt",
        sql: "select 1",
        run,
        label: "probe",
      }),
    ).toThrow(/probe: .*psql 15\.8.*16 or later/);
    expect(run.mock.calls.map((c) => c[1][0])).toEqual(["--version"]);
  });

  it("runs on psql 16, and asks nothing for a loopback address", () => {
    const hosted = fake("psql (PostgreSQL) 16.4\n");
    expect(
      runPsql({
        databaseUrl:
          "postgresql://postgres.abcdefghijklmnopqrst:pw@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert=%2Fjob%2Froot.crt",
        sql: "select 1",
        run: hosted,
      }),
    ).toBe("1\n");
    const loopback = fake("psql (PostgreSQL) 15.8\n");
    runPsql({
      databaseUrl: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
      sql: "select 1",
      run: loopback,
    });
    expect(loopback.mock.calls.map((c) => c[1][0])).not.toContain("--version");
  });
});
