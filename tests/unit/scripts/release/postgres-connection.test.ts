// The release job's own psql connection (scripts/release/lib/postgres.mjs):
// libpq takes the target from PG* variables built from the parsed address.
import { describe, expect, it } from "vitest";

import { connectionEnvironment } from "../../../../scripts/release/lib/postgres.mjs";

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
