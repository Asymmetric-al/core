import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { assertCmsMigrationTarget } from "../../../scripts/cms/lib/migration-target.mjs";

/** The release job's certificate fixtures (review M3). */
const caFixture = (name: string) =>
  path.resolve("tests/unit/scripts/release/fixtures/ca", name);

/**
 * The project's CA, as the release job hands it to the runner (L6, L7): the
 * runner's psql reads it from the file PGSSLROOTCERT names, which must hold
 * the project's CA (phase 15, P3), and Payload from PAYLOAD_DATABASE_SSL_CA,
 * which must hold the same certificate (phase 16, Q1).
 */
const CA_PEM = readFileSync(caFixture("ca.crt"), "utf8");
const CA_ENV = {
  PAYLOAD_DATABASE_SSL_CA: CA_PEM,
  PGSSLROOTCERT: caFixture("ca.crt"),
};
/** The second certificate of the two-CA fixture: another CA, valid now. */
const OTHER_CA_PEM = readFileSync(caFixture("two-cas.crt"), "utf8").match(
  /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g,
)![1]!;
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

  // Review M1: the release check's rule on the same seam. A password in a
  // hosted address's query is refused, not moved; a loopback one is kept.
  it.each(["&password=X", "&pass%77ord=X"])(
    "refuses a hosted address whose query adds %s, and says the password belongs in the login part",
    (extra) => {
      for (const base of [pooled, direct]) {
        expect(() =>
          assertCmsMigrationTarget({
            ...hosted,
            databaseUrl: `${base}?sslmode=verify-full${extra}`,
          }),
        ).toThrow(/password in its query.*login part/);
      }
    },
  );

  // Review M3: an address's sslrootcert would override PGSSLROOTCERT for
  // the runner's psql while Payload refuses the same address; one CA route.
  it.each(["&sslrootcert=%2Fother%2Fca.crt", "&sslrootcert=system"])(
    "refuses a hosted address whose query adds %s",
    (extra) => {
      expect(() =>
        assertCmsMigrationTarget({
          ...hosted,
          databaseUrl: `${hosted.databaseUrl}${extra}`,
        }),
      ).toThrow(/names its own CA \(sslrootcert\).*PGSSLROOTCERT/);
    },
  );

  it("leaves a loopback address's sslrootcert as it was", () => {
    expect(() =>
      assertCmsMigrationTarget({
        databaseUrl:
          "postgresql://postgres@127.0.0.1:54322/postgres?sslmode=verify-full&sslrootcert=system",
        environment: { PGSSLROOTCERT: "system" },
      }),
    ).not.toThrow();
    expect(() =>
      assertCmsMigrationTarget({
        databaseUrl:
          "postgresql://postgres@127.0.0.1:54322/postgres?sslmode=verify-full&sslrootcert=system",
        environment: {},
      }),
    ).not.toThrow();
  });

  it("leaves a loopback address's query password as it was", () => {
    expect(() =>
      assertCmsMigrationTarget({
        databaseUrl:
          "postgresql://postgres@127.0.0.1:54322/postgres?password=postgres",
        environment: {},
      }),
    ).not.toThrow();
  });

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

// The last check's P3 (phase 15): a non-empty PGSSLROOTCERT was enough, so a
// hand-run hosted migration with PGSSLROOTCERT=system trusted the machine's
// whole certificate store. The file must hold the project's CA, read by the
// release job's own check (readDatabaseCa): one certificate, a CA, valid now.
describe("the CA file the CMS runner's psql reads (phase 15, P3)", () => {
  const roots: string[] = [];
  afterEach(() => {
    vi.useRealTimers();
    for (const root of roots.splice(0))
      rmSync(root, { recursive: true, force: true });
  });
  const withCaFile = (PGSSLROOTCERT: string) => () =>
    assertCmsMigrationTarget({
      ...hosted,
      environment: { ...CA_ENV, PGSSLROOTCERT },
    });

  it("refuses system, which libpq reads as the machine's whole store", () => {
    expect(withCaFile("system")).toThrow(
      /PGSSLROOTCERT=system.*every certificate authority/,
    );
  });

  // Phase 16, Q5: this check reads a relative path against Node's working
  // directory, psql against its own; only an absolute path is one file.
  it("refuses a relative path, even to the project's CA", () => {
    expect(withCaFile("tests/unit/scripts/release/fixtures/ca/ca.crt")).toThrow(
      /PGSSLROOTCERT names a relative path.*absolute path/,
    );
  });

  it("refuses a file that cannot be read", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "p3-ca-"));
    roots.push(root);
    expect(withCaFile(path.join(root, "missing.crt"))).toThrow(
      /PGSSLROOTCERT names a file that cannot be read \(ENOENT\)/,
    );
    expect(withCaFile(root)).toThrow(/cannot be read \(EISDIR\)/);
  });

  it.each([
    ["a certificate that is not a CA", "leaf.crt", /not a CA/],
    ["two certificates", "two-cas.crt", /holds 2 certificates/],
  ])("refuses a file that holds %s", (_case, fixture, words) => {
    expect(withCaFile(caFixture(fixture))).toThrow(words);
    expect(withCaFile(caFixture(fixture))).toThrow(/PGSSLROOTCERT's file/);
  });

  it("refuses a file that holds something besides one certificate", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "p3-ca-"));
    roots.push(root);
    const file = path.join(root, "root.crt");
    writeFileSync(file, "not a certificate\n");
    expect(withCaFile(file)).toThrow(/holds no PEM certificate/);
  });

  it("refuses a CA that has expired", () => {
    vi.useFakeTimers({ toFake: ["Date"], now: new Date("2200-01-01") });
    expect(withCaFile(caFixture("ca.crt"))).toThrow(/expired on/);
  });

  it("accepts the project's CA", () => {
    expect(withCaFile(caFixture("ca.crt"))).not.toThrow();
  });
});

// Phase 16, Q1: Payload makes the migration's writes, and node-postgres
// trusts every certificate in PAYLOAD_DATABASE_SSL_CA. A non-empty value was
// enough, so a bundle of authorities passed. It is read by the same check as
// the file, and must be the same certificate as the file's.
describe("the CA Payload reads (phase 16, Q1)", () => {
  const withPayloadCa = (PAYLOAD_DATABASE_SSL_CA: string) => () =>
    assertCmsMigrationTarget({
      ...hosted,
      environment: { ...CA_ENV, PAYLOAD_DATABASE_SSL_CA },
    });

  it("refuses a bundle of several authorities", () => {
    expect(
      withPayloadCa(readFileSync(caFixture("two-cas.crt"), "utf8")),
    ).toThrow(/PAYLOAD_DATABASE_SSL_CA holds 2 certificates/);
  });

  it("refuses an authority other than the file's", () => {
    expect(withPayloadCa(OTHER_CA_PEM)).toThrow(
      /PAYLOAD_DATABASE_SSL_CA and the file PGSSLROOTCERT names hold different certificates/,
    );
  });

  it.each([
    [
      "something that is not a certificate",
      "-----BEGIN CERTIFICATE-----\nfixture\n-----END CERTIFICATE-----",
      /PAYLOAD_DATABASE_SSL_CA's certificate cannot be read/,
    ],
    [
      "a certificate that is not a CA",
      readFileSync(caFixture("leaf.crt"), "utf8"),
      /PAYLOAD_DATABASE_SSL_CA holds a certificate that is not a CA/,
    ],
  ])("refuses %s", (_case, pem, words) => {
    expect(withPayloadCa(pem)).toThrow(words);
  });

  it("accepts the file's own CA, with Windows line ends", () => {
    expect(withPayloadCa(CA_PEM.replace(/\n/g, "\r\n"))).not.toThrow();
  });
});
