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
});
