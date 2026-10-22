import { describe, expect, it } from "vitest";

import { assertCmsMigrationTarget } from "../../../scripts/cms/lib/migration-target.mjs";

const hosted = {
  databaseUrl:
    "postgresql://postgres.fixture:fake-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=no-verify",
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
          "postgres.fixture",
          "cms_fixture.fixture",
        ),
      }),
    ).toThrow("does not match");
  });

  it("keeps approved role and project identities exact", () => {
    for (const username of [
      "other.fixture",
      "cms_fixture.other",
      "postgres.fixture",
    ]) {
      expect(() =>
        assertCmsMigrationTarget({
          ...hosted,
          databaseUrl: hosted.databaseUrl.replace("postgres.fixture", username),
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
          .replace("postgres.fixture", "cms_fixture.fixture")
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
          "postgres.fixture",
          "postgres.other",
        ),
      }),
    ).toThrow("does not match");
  });

  it("validates direct Supabase database hosts", () => {
    expect(() =>
      assertCmsMigrationTarget({
        ...hosted,
        databaseUrl:
          "postgresql://postgres:fake-password@db.fixture.supabase.co/postgres?sslmode=verify-full",
      }),
    ).not.toThrow();
    expect(() =>
      assertCmsMigrationTarget({
        ...hosted,
        databaseUrl:
          "postgresql://postgres:fake-password@db.other.supabase.co/postgres?sslmode=require",
      }),
    ).toThrow("does not match");
  });

  it("rejects URI and ambient routing overrides before migration", () => {
    for (const option of [
      "hostaddr=127.0.0.1",
      "service=other",
      "host=other",
      "user=postgres.other",
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
