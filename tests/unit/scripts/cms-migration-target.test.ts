import { describe, expect, it } from "vitest";

import { assertCmsMigrationTarget } from "../../../scripts/cms/lib/migration-target.mjs";

const hosted = {
  databaseUrl:
    "postgresql://cms_owner.fixture:fake-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=no-verify",
  supabaseUrl: "https://fixture.supabase.co",
  approvedProjectRef: "fixture",
  environment: {},
};

describe("CMS migration target", () => {
  it("allows a loopback database without hosted approval", () => {
    expect(() =>
      assertCmsMigrationTarget({
        databaseUrl:
          "postgresql://postgres:fake-password@127.0.0.1:54322/postgres",
        environment: {},
      }),
    ).not.toThrow();
  });

  it("requires explicit approval for the configured hosted project", () => {
    expect(() =>
      assertCmsMigrationTarget({ ...hosted, approvedProjectRef: undefined }),
    ).toThrow("CMS_HOSTED_MIGRATION_REF");
    expect(() =>
      assertCmsMigrationTarget({ ...hosted, approvedProjectRef: "other" }),
    ).toThrow("CMS_HOSTED_MIGRATION_REF");
    expect(() => assertCmsMigrationTarget(hosted)).not.toThrow();
  });

  it.each([
    "postgresql://cms_fixture.fixture:fake-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=verify-full",
    "postgresql://cms_fixture:fake-password@db.fixture.supabase.co:5432/postgres?sslmode=verify-full",
  ])(
    "allows an explicitly approved scoped role at the approved project: %s",
    (databaseUrl) => {
      expect(() =>
        assertCmsMigrationTarget({
          ...hosted,
          databaseUrl,
          environment: { CMS_HOSTED_MIGRATION_ROLE: "cms_fixture" },
        }),
      ).not.toThrow();
    },
  );

  it("does not infer role approval from a custom connection username", () => {
    expect(() =>
      assertCmsMigrationTarget({
        ...hosted,
        databaseUrl: hosted.databaseUrl.replace(
          "cms_owner.fixture",
          "cms_fixture.fixture",
        ),
      }),
    ).toThrow("does not match");
  });

  it("migrates hosted CMS schema as cms_owner, never as postgres (plan 7.2)", () => {
    const asPostgres = hosted.databaseUrl.replace(
      "cms_owner.fixture",
      "postgres.fixture",
    );
    expect(() =>
      assertCmsMigrationTarget({ ...hosted, databaseUrl: asPostgres }),
    ).toThrow("does not match");
    expect(() =>
      assertCmsMigrationTarget({
        ...hosted,
        databaseUrl: asPostgres,
        environment: { CMS_HOSTED_MIGRATION_ROLE: "postgres" },
      }),
    ).toThrow("cms_owner");
  });

  it("keeps approved role and project identities exact", () => {
    for (const username of [
      "other.fixture",
      "cms_fixture.other",
      "postgres.fixture",
      "cms_owner.fixture",
    ]) {
      expect(() =>
        assertCmsMigrationTarget({
          ...hosted,
          databaseUrl: hosted.databaseUrl.replace(
            "cms_owner.fixture",
            username,
          ),
          environment: { CMS_HOSTED_MIGRATION_ROLE: "cms_fixture" },
        }),
      ).toThrow("does not match");
    }
  });

  it("rejects ambiguous or oversized approved role names", () => {
    for (const role of [
      "role.other",
      "role@host",
      "role name",
      "role;DROP",
      "-role",
      "a".repeat(64),
    ]) {
      expect(() =>
        assertCmsMigrationTarget({
          ...hosted,
          environment: { CMS_HOSTED_MIGRATION_ROLE: role },
        }),
      ).toThrow("plain Postgres role name");
    }
  });

  it("still requires encrypted transport for a scoped role", () => {
    expect(() =>
      assertCmsMigrationTarget({
        ...hosted,
        databaseUrl: hosted.databaseUrl
          .replace("cms_owner.fixture", "cms_fixture.fixture")
          .replace("no-verify", "disable"),
        environment: { CMS_HOSTED_MIGRATION_ROLE: "cms_fixture" },
      }),
    ).toThrow("encrypted");
  });

  it("rejects a pooler username belonging to another project", () => {
    expect(() =>
      assertCmsMigrationTarget({
        ...hosted,
        databaseUrl: hosted.databaseUrl.replace(
          "cms_owner.fixture",
          "cms_owner.other",
        ),
      }),
    ).toThrow("does not match");
  });

  // Review L1: the same host rule and pooler pattern as the release target.
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
      assertCmsMigrationTarget({
        ...hosted,
        databaseUrl: `postgresql://cms_owner.fixture:fake-password@${host}:5432/postgres?sslmode=require`,
      }),
    ).toThrow();
  });

  it("validates direct Supabase database hosts", () => {
    expect(() =>
      assertCmsMigrationTarget({
        ...hosted,
        databaseUrl:
          "postgresql://cms_owner:fake-password@db.fixture.supabase.co/postgres?sslmode=verify-full",
      }),
    ).not.toThrow();
    expect(() =>
      assertCmsMigrationTarget({
        ...hosted,
        databaseUrl:
          "postgresql://cms_owner:fake-password@db.other.supabase.co/postgres?sslmode=require",
      }),
    ).toThrow("does not match");
  });

  it("rejects URI and ambient routing overrides before migration", () => {
    // The keys of @asym/env/database-url, the one rule this guard shares with
    // the release target and Payload's run-time configuration (council round
    // 2, A7b); `port` and `dbname` joined with it.
    for (const option of [
      "hostaddr=127.0.0.1",
      "service=other",
      "host=other",
      "user=postgres.other",
      "port=6543",
      "dbname=other",
    ]) {
      expect(() =>
        assertCmsMigrationTarget({
          ...hosted,
          databaseUrl: `${hosted.databaseUrl}&${option}`,
        }),
      ).toThrow("routing overrides");
    }
    for (const environment of [
      { PGHOSTADDR: "127.0.0.1" },
      { PGSERVICE: "other" },
    ]) {
      expect(() =>
        assertCmsMigrationTarget({ ...hosted, environment }),
      ).toThrow("routing overrides");
    }
  });

  it("requires an explicit encrypted hosted connection", () => {
    expect(() =>
      assertCmsMigrationTarget({
        ...hosted,
        databaseUrl: hosted.databaseUrl.replace("no-verify", "disable"),
      }),
    ).toThrow("encrypted");
    expect(() =>
      assertCmsMigrationTarget({
        ...hosted,
        databaseUrl: hosted.databaseUrl.split("?")[0],
        environment: { PGSSLMODE: "disable" },
      }),
    ).toThrow("encrypted");
  });

  it("rejects duplicate TLS modes before the driver can choose another value", () => {
    for (const modes of [
      "require&sslmode=disable",
      "require&sslmode=require",
    ]) {
      expect(() =>
        assertCmsMigrationTarget({
          ...hosted,
          databaseUrl: hosted.databaseUrl.replace("no-verify", modes),
        }),
      ).toThrow("encrypted");
    }
  });
});
