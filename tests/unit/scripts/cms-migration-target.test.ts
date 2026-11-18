import { describe, expect, it } from "vitest";

import { assertCmsMigrationTarget } from "../../../scripts/cms/lib/migration-target.mjs";

/** The project's CA, as the release job hands it to the runner (L6, L7). */
const CA_ENV = {
  PAYLOAD_DATABASE_SSL_CA:
    "-----BEGIN CERTIFICATE-----\nfixture\n-----END CERTIFICATE-----",
  PGSSLROOTCERT: "/tmp/fixture-root.crt",
};
const pooled =
  "postgresql://cms_owner.fixture:fake-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres";
const direct =
  "postgresql://cms_owner:fake-password@db.fixture.supabase.co:5432/postgres";
const hosted = {
  databaseUrl: `${pooled}?sslmode=verify-full`,
  supabaseUrl: "https://fixture.supabase.co",
  approvedProjectRef: "fixture",
  environment: CA_ENV,
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
          environment: { ...CA_ENV, CMS_HOSTED_MIGRATION_ROLE: "cms_fixture" },
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
        environment: { ...CA_ENV, CMS_HOSTED_MIGRATION_ROLE: "postgres" },
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
          environment: { ...CA_ENV, CMS_HOSTED_MIGRATION_ROLE: "cms_fixture" },
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
          environment: { ...CA_ENV, CMS_HOSTED_MIGRATION_ROLE: role },
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
          .replace("verify-full", "disable"),
        environment: { ...CA_ENV, CMS_HOSTED_MIGRATION_ROLE: "cms_fixture" },
      }),
    ).toThrow("sslmode=verify-full");
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
        databaseUrl: `postgresql://cms_owner.fixture:fake-password@${host}:5432/postgres?sslmode=verify-full`,
      }),
    ).toThrow();
  });

  // Review L2: the CMS target check uses the one check, not routing keys only.
  it.each([
    ["a key with a blank", "&%20host=evil.example"],
    ["an upper-case key", "&HOST=evil.example"],
    ["an unknown key", "&pgbouncer=true"],
    ["options on a hosted address", "&options=-c%20role%3Dpostgres"],
  ])("refuses a hosted address whose query has %s", (_case, extra) => {
    expect(() =>
      assertCmsMigrationTarget({
        ...hosted,
        databaseUrl: `postgresql://cms_owner.fixture:fake-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=verify-full${extra}`,
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
          "postgresql://cms_owner:fake-password@db.other.supabase.co/postgres?sslmode=verify-full",
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

  it("refuses an unencrypted hosted connection", () => {
    expect(() =>
      assertCmsMigrationTarget({
        ...hosted,
        databaseUrl: hosted.databaseUrl.replace("verify-full", "disable"),
      }),
    ).toThrow("sslmode=verify-full");
    expect(() =>
      assertCmsMigrationTarget({
        ...hosted,
        databaseUrl: hosted.databaseUrl.split("?")[0],
        environment: { ...CA_ENV, PGSSLMODE: "disable" },
      }),
    ).toThrow("sslmode=verify-full");
  });

  // Review L7: the release job's own rule (L6) on the same seam. A hosted
  // address says verify-full, once, in the address itself; no-verify,
  // require and verify-ca do not check both the certificate and the host
  // name, and PGSSLMODE alone does not count. The message says what to set.
  it.each([
    ["sslmode=no-verify", "?sslmode=no-verify", {}],
    ["sslmode=require", "?sslmode=require", {}],
    ["sslmode=verify-ca", "?sslmode=verify-ca", {}],
    ["no sslmode", "", {}],
    ["only PGSSLMODE=verify-full", "", { PGSSLMODE: "verify-full" }],
  ])(
    "refuses a hosted address with %s, and says what to set",
    (_case, query, extra) => {
      for (const base of [pooled, direct]) {
        expect(() =>
          assertCmsMigrationTarget({
            ...hosted,
            databaseUrl: `${base}${query}`,
            environment: { ...CA_ENV, ...extra },
          }),
        ).toThrow(
          /must set sslmode=verify-full, once, in the address itself; PGSSLMODE does not count/,
        );
      }
    },
  );

  // Review L7: no CA, no connection. Payload reads the CA from
  // PAYLOAD_DATABASE_SSL_CA and the runner's psql from the file PGSSLROOTCERT
  // names; the release job sets both from RELEASE_DATABASE_SSL_CA.
  it.each([
    ["PAYLOAD_DATABASE_SSL_CA", { PGSSLROOTCERT: CA_ENV.PGSSLROOTCERT }],
    [
      "PGSSLROOTCERT",
      { PAYLOAD_DATABASE_SSL_CA: CA_ENV.PAYLOAD_DATABASE_SSL_CA },
    ],
    ["either", {}],
    [
      "either, when both are blank",
      { PAYLOAD_DATABASE_SSL_CA: "  ", PGSSLROOTCERT: "" },
    ],
  ])(
    "stops a hosted migration without %s, and says what to set",
    (_case, environment) => {
      expect(() =>
        assertCmsMigrationTarget({ ...hosted, environment }),
      ).toThrow(
        /needs the project's CA: set PAYLOAD_DATABASE_SSL_CA .* and PGSSLROOTCERT .* RELEASE_DATABASE_SSL_CA/,
      );
    },
  );

  it("leaves a loopback address's sslmode and CA as they were", () => {
    for (const query of [
      "",
      "?sslmode=no-verify",
      "?sslmode=require",
      "?sslmode=disable",
    ]) {
      expect(() =>
        assertCmsMigrationTarget({
          databaseUrl: `postgresql://postgres:fake-password@127.0.0.1:54322/postgres${query}`,
          environment: {},
        }),
      ).not.toThrow();
    }
  });

  it("rejects duplicate TLS modes before the driver can choose another value", () => {
    for (const modes of [
      "require&sslmode=disable",
      "require&sslmode=require",
    ]) {
      expect(
        () =>
          assertCmsMigrationTarget({
            ...hosted,
            databaseUrl: hosted.databaseUrl.replace("verify-full", modes),
          }),
        // Review L2: the shared check refuses a key given twice, before the
        // TLS check sees it.
      ).toThrow(/"sslmode" appears twice/);
    }
  });
});
