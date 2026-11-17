import pg from "pg";
import { describe, expect, it } from "vitest";

import { LOCAL_DATABASE_URL } from "../../../scripts/cms/lib/local-data.mjs";
import {
  CMS_MIGRATION_ROLE,
  resolveCmsMigrationDatabaseUrl,
} from "../../../scripts/cms/lib/migration-connection.mjs";

/** How node-postgres, which Payload uses, reads the connection string. */
function parse(connectionString: string) {
  const client = new pg.Client({ connectionString }) as unknown as {
    connectionParameters: { database: string; options?: string; user: string };
  };
  return client.connectionParameters;
}

const HOSTED_RUNTIME =
  "postgresql://cms_runtime.fixture:fake-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require";
const HOSTED_MIGRATION =
  "postgresql://cms_owner.fixture:fake-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require";

describe("CMS migration connection (plan 7.2)", () => {
  it("names cms_owner as the migration role", () => {
    expect(CMS_MIGRATION_ROLE).toBe("cms_owner");
  });

  it("uses PAYLOAD_MIGRATION_DATABASE_URI when the release job provides it", () => {
    expect(
      resolveCmsMigrationDatabaseUrl({
        PAYLOAD_DATABASE_URI: HOSTED_RUNTIME,
        PAYLOAD_MIGRATION_DATABASE_URI: ` ${HOSTED_MIGRATION} `,
      }),
    ).toEqual({
      databaseUrl: HOSTED_MIGRATION,
      source: "PAYLOAD_MIGRATION_DATABASE_URI",
    });
  });

  it("refuses a hosted migration without the migration connection", () => {
    expect(() =>
      resolveCmsMigrationDatabaseUrl({ PAYLOAD_DATABASE_URI: HOSTED_RUNTIME }),
    ).toThrow("PAYLOAD_MIGRATION_DATABASE_URI");
  });

  it("never falls back to the Core migration string", () => {
    const resolved = resolveCmsMigrationDatabaseUrl({
      SUPABASE_DB_URL: HOSTED_MIGRATION.replace("cms_owner.", "postgres."),
    });
    expect(new URL(resolved.databaseUrl).host).toBe(
      new URL(LOCAL_DATABASE_URL).host,
    );
  });

  it("migrates a loopback database as cms_owner through the session role", () => {
    const local = "postgresql://postgres:postgres@127.0.0.1:57432/wp12_fixture";
    const resolved = resolveCmsMigrationDatabaseUrl({
      PAYLOAD_DATABASE_URI: local,
    });

    expect(resolved.source).toBe("loopback-session-role");
    const parsed = parse(resolved.databaseUrl);
    expect(parsed.user).toBe("postgres");
    expect(parsed.database).toBe("wp12_fixture");
    expect(parsed.options).toBe("-c role=cms_owner");
  });

  it("keeps other loopback startup options beside the session role", () => {
    const resolved = resolveCmsMigrationDatabaseUrl({
      PAYLOAD_DATABASE_URI:
        "postgresql://postgres:postgres@localhost:54322/postgres?options=-c%20statement_timeout%3D0",
    });
    expect(parse(resolved.databaseUrl).options).toBe(
      "-c statement_timeout=0 -c role=cms_owner",
    );
  });

  it("refuses a loopback URL that already chooses a session role", () => {
    expect(() =>
      resolveCmsMigrationDatabaseUrl({
        PAYLOAD_DATABASE_URI:
          "postgresql://postgres:postgres@127.0.0.1:54322/postgres?options=-c%20role%3Dpostgres",
      }),
    ).toThrow("session role");
  });

  it("lets a read-only status check use the run-time connection", () => {
    expect(
      resolveCmsMigrationDatabaseUrl(
        { PAYLOAD_DATABASE_URI: HOSTED_RUNTIME },
        { readOnly: true },
      ),
    ).toEqual({ databaseUrl: HOSTED_RUNTIME, source: "PAYLOAD_DATABASE_URI" });
  });

  it("rejects an invalid migration connection without echoing it", () => {
    expect(() =>
      resolveCmsMigrationDatabaseUrl({
        PAYLOAD_MIGRATION_DATABASE_URI: "postgresql://cms_owner:secret-value@",
      }),
    ).toThrow(/valid Postgres URL/);
    try {
      resolveCmsMigrationDatabaseUrl({
        PAYLOAD_MIGRATION_DATABASE_URI: "postgresql://cms_owner:secret-value@",
      });
    } catch (error) {
      expect(String(error)).not.toContain("secret-value");
    }
  });
});
