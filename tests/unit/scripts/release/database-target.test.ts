import { describe, expect, it } from "vitest";

import {
  KNOWN_PROJECT_REFS,
  assertDatabaseTarget,
} from "../../../../scripts/release/lib/database-target.mjs";

const ref = "abcdefghijklmnopqrst";
const pooled = `postgresql://postgres.${ref}:pw@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=verify-full`;
const direct = `postgresql://postgres:pw@db.${ref}.supabase.co:5432/postgres?sslmode=verify-full`;

describe("release database target", () => {
  it("accepts the approved project through the session pooler or the direct host", () => {
    expect(() =>
      assertDatabaseTarget({
        databaseUrl: pooled,
        projectRef: ref,
        role: "postgres",
      }),
    ).not.toThrow();
    expect(() =>
      assertDatabaseTarget({
        databaseUrl: direct,
        projectRef: ref,
        role: "postgres",
      }),
    ).not.toThrow();
  });

  it("refuses another project, another role, an unencrypted link or routing overrides", () => {
    const other = pooled.replace(ref, "zzzzzzzzzzzzzzzzzzzz");
    for (const [databaseUrl, role] of [
      [other, "postgres"],
      [pooled, "cms_owner"],
      [pooled.replace("?sslmode=verify-full", ""), "postgres"],
      [`${pooled}&host=evil.example`, "postgres"],
      ["not a url", "postgres"],
      ["mysql://x@db.abcdefghijklmnopqrst.supabase.co/x", "postgres"],
    ]) {
      expect(() =>
        assertDatabaseTarget({ databaseUrl, projectRef: ref, role }),
      ).toThrow();
    }
  });

  // Review K1: the release URL also reaches psql, through the reset wrapper's
  // marker read, so it carries no query key libpq could read as a target.
  it.each([
    "&%20host=evil.example",
    "&host%20=evil.example",
    "&HOST=evil.example",
    "&pgbouncer=true",
    "&sslmode=disable",
    "&options=-c%20role%3Dauthenticator",
  ])("refuses a release URL whose query adds %s", (extra) => {
    expect(() =>
      assertDatabaseTarget({
        databaseUrl: `${pooled}${extra}`,
        projectRef: ref,
        role: "postgres",
      }),
    ).toThrow(/query/);
  });

  // Review L1: the pooled host is Supabase's pattern, not a suffix, and one
  // host rule refuses a list, an escape, upper case and a trailing dot.
  it.each([
    ["a host list", "evil.example,aws-0-us-east-1.pooler.supabase.com"],
    ["an escaped comma", "evil.example%2Caws-0-us-east-1.pooler.supabase.com"],
    ["an escaped slash", "%2Ftmp%2Fx.pooler.supabase.com"],
    ["upper case", "AWS-0-US-EAST-1.pooler.supabase.com"],
    ["a trailing dot", "aws-0-us-east-1.pooler.supabase.com."],
    ["a bare pooler subdomain", "x.pooler.supabase.com"],
    ["a look-alike domain", "evilpooler.supabase.com"],
    [
      "the pooler's name under another domain",
      "aws-0-x.pooler.supabase.com.evil.example",
    ],
  ])("refuses a pooled address with %s as its host", (_case, host) => {
    expect(() =>
      assertDatabaseTarget({
        databaseUrl: `postgresql://postgres.${ref}@${host}:6543/postgres?sslmode=verify-full`,
        projectRef: ref,
        role: "postgres",
      }),
    ).toThrow();
  });

  it("accepts both pooler clusters the projects use", () => {
    for (const host of [
      "aws-0-us-west-2.pooler.supabase.com",
      "aws-1-us-east-1.pooler.supabase.com",
    ])
      expect(() =>
        assertDatabaseTarget({
          databaseUrl: `postgresql://postgres.${ref}@${host}:5432/postgres?sslmode=verify-full`,
          projectRef: ref,
          role: "postgres",
        }),
      ).not.toThrow();
  });

  it("never echoes the connection string in an error", () => {
    try {
      assertDatabaseTarget({
        databaseUrl: pooled.replace(ref, "zzzzzzzzzzzzzzzzzzzz"),
        projectRef: ref,
        role: "postgres",
      });
      throw new Error("expected a refusal");
    } catch (error) {
      expect(String(error)).not.toContain("pw@");
      expect(String(error)).not.toContain("pooler.supabase.com");
    }
  });

  // Review M1: one place for a secret. The CLI gets the address as --db-url
  // with only the login part's password cleared, so a password in the query
  // would reach its arguments. Refused, not moved; the message says where the
  // password belongs. A loopback address keeps what local flows need.
  it.each(["&password=X", "&pass%77ord=X"])(
    "refuses a hosted address whose query adds %s, and says the password belongs in the login part",
    (extra) => {
      for (const base of [pooled, direct]) {
        expect(() =>
          assertDatabaseTarget({
            databaseUrl: `${base}${extra}`,
            projectRef: ref,
            role: "postgres",
          }),
        ).toThrow(/password in its query.*login part/);
      }
    },
  );

  it("leaves a loopback address's query password as it was", () => {
    expect(() =>
      assertDatabaseTarget({
        databaseUrl:
          "postgresql://postgres@127.0.0.1:57432/wp13r_x?password=postgres",
        projectRef: ref,
        role: "postgres",
        allowLoopback: true,
      }),
    ).not.toThrow();
  });

  it("refuses a project the environment must never touch", () => {
    expect(() =>
      assertDatabaseTarget({
        databaseUrl: pooled,
        projectRef: ref,
        role: "postgres",
        forbiddenRefs: [ref],
      }),
    ).toThrow(/must not/);
  });

  // Review L6: a hosted address verifies the server's certificate and its
  // host name. require verifies nothing without a CA file and verify-ca never
  // checks the name, so both are refused, as is an address that names no
  // mode; the message says what to set.
  it.each([
    ["sslmode=require", "?sslmode=require"],
    ["sslmode=verify-ca", "?sslmode=verify-ca"],
    ["no sslmode", ""],
  ])(
    "refuses a hosted address with %s, and says what to set",
    (_case, query) => {
      for (const base of [pooled, direct]) {
        expect(() =>
          assertDatabaseTarget({
            databaseUrl: base.replace("?sslmode=verify-full", query),
            projectRef: ref,
            role: "postgres",
          }),
        ).toThrow(
          /must set sslmode=verify-full.*RELEASE_DATABASE_SSL_CA.*require and verify-ca do not check the server's host name/,
        );
      }
    },
  );

  it("leaves a loopback address's sslmode as it was", () => {
    for (const query of ["", "?sslmode=require", "?sslmode=verify-ca"]) {
      expect(() =>
        assertDatabaseTarget({
          databaseUrl: `postgresql://postgres:postgres@127.0.0.1:57432/wp13r_x${query}`,
          projectRef: ref,
          role: "postgres",
          allowLoopback: true,
        }),
      ).not.toThrow();
    }
  });

  it("allows a loopback database only when asked, for tests", () => {
    const local = "postgresql://postgres:postgres@127.0.0.1:57432/wp13r_x";
    expect(() =>
      assertDatabaseTarget({
        databaseUrl: local,
        projectRef: ref,
        role: "postgres",
      }),
    ).toThrow();
    expect(() =>
      assertDatabaseTarget({
        databaseUrl: local,
        projectRef: ref,
        role: "postgres",
        allowLoopback: true,
      }),
    ).not.toThrow();
  });

  it("knows the development project and the preview project by ref", () => {
    // Two hosted projects and no third: the production-named project is the
    // disposable preview project until WP11 (hosted plan 3.1).
    expect(KNOWN_PROJECT_REFS).toEqual({
      development: "pnmlrbgjiqzzsthsoikm",
      preview: "btewedpsxwsjczvmegby",
    });
  });
});
