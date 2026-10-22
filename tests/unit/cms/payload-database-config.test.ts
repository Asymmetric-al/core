import { describe, expect, it } from "vitest";

import { isProtectedDeployment } from "@asym/env/target-env";
import {
  assertPayloadDatabaseConfiguration,
  DEFAULT_LOCAL_PAYLOAD_DATABASE_URL,
  PayloadDatabaseConfigurationError,
  resolvePayloadDatabaseConfig,
} from "../../../apps/admin/src/cms/payload-database-config";

const DIRECT_SUPABASE_URL =
  "postgresql://postgres:super-secret@db.btewedpsxwsjczvmegby.supabase.co:5432/postgres";

const SUPAVISOR_POOLER_URL =
  "postgresql://postgres.btewedpsxwsjczvmegby:super-secret@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=no-verify";

const SUPAVISOR_REQUIRE_SSL_URL =
  "postgresql://postgres.btewedpsxwsjczvmegby:super-secret@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require";

describe("resolvePayloadDatabaseConfig", () => {
  it("uses PAYLOAD_DATABASE_URI before SUPABASE_DB_URL", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_URI: SUPAVISOR_POOLER_URL,
      SUPABASE_DB_URL: "postgresql://postgres:secret@127.0.0.1:54322/postgres",
    });

    expect(config.connectionString).toBe(SUPAVISOR_POOLER_URL);
    expect(config.source).toBe("PAYLOAD_DATABASE_URI");
    expect(config.host).toBe("aws-0-us-west-2.pooler.supabase.com");
    expect(config.sslMode).toBe("no-verify");
    expect(config.isSupavisorPoolerHost).toBe(true);
    expect(config.pool).toEqual({
      connectionString: SUPAVISOR_POOLER_URL,
    });
    expect(config.issue).toBeNull();
  });

  it("treats blank database env values as unset", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_URI: "   ",
      SUPABASE_DB_URL: SUPAVISOR_POOLER_URL,
    });

    expect(config.connectionString).toBe(SUPAVISOR_POOLER_URL);
    expect(config.source).toBe("SUPABASE_DB_URL");
  });

  it("falls back to the local Payload database outside protected deployments", () => {
    const config = resolvePayloadDatabaseConfig({
      NODE_ENV: "development",
    });

    expect(config.connectionString).toBe(DEFAULT_LOCAL_PAYLOAD_DATABASE_URL);
    expect(config.isDefaultLocal).toBe(true);
    expect(config.isVercelRuntime).toBe(false);
    expect(config.pool).toEqual({
      connectionString: DEFAULT_LOCAL_PAYLOAD_DATABASE_URL,
    });
    expect(config.issue).toBeNull();
    expect(config.warning).toContain("default local Postgres");
  });

  it("blocks protected deployments without a configured Payload database URL", () => {
    const config = resolvePayloadDatabaseConfig({
      VERCEL_ENV: "production",
    });

    expect(config.issue?.code).toBe("missing-protected-database-url");
    expect(() => assertPayloadDatabaseConfiguration(config)).toThrow(
      PayloadDatabaseConfigurationError,
    );
  });

  it("blocks protected deployments using Supabase direct database hosts", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_URI: DIRECT_SUPABASE_URL,
      VERCEL_ENV: "production",
    });

    expect(config.isDirectSupabaseHost).toBe(true);
    expect(config.issue?.code).toBe("direct-supabase-host");
    expect(config.issue?.message).toContain("Supavisor session pooler");
    expect(config.issue?.message).not.toContain("super-secret");
  });

  it("accepts Supavisor pooler hosts in protected deployments", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_URI: SUPAVISOR_POOLER_URL,
      VERCEL_ENV: "production",
    });

    expect(config.isProtectedDeployment).toBe(true);
    expect(config.isVercelRuntime).toBe(true);
    expect(config.isSupavisorPoolerHost).toBe(true);
    expect(config.pool).toEqual({
      connectionString: SUPAVISOR_POOLER_URL,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 5000,
      max: 2,
    });
    expect(config.issue).toBeNull();
    expect(assertPayloadDatabaseConfiguration(config)).toBe(config);
  });

  it("bounds the Payload Postgres pool on Vercel preview deployments", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_URI: SUPAVISOR_POOLER_URL,
      VERCEL: "1",
      VERCEL_ENV: "preview",
    });

    expect(config.isProtectedDeployment).toBe(false);
    expect(config.isVercelRuntime).toBe(true);
    expect(config.pool.max).toBe(2);
    expect(config.pool.connectionTimeoutMillis).toBe(5000);
    expect(config.pool.idleTimeoutMillis).toBe(5000);
  });

  it("allows hosted Payload pool max to be raised explicitly", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_POOL_MAX: "4",
      PAYLOAD_DATABASE_URI: SUPAVISOR_POOLER_URL,
      VERCEL_ENV: "production",
    });

    expect(config.pool.max).toBe(4);
    expect(config.warning).toBeNull();
  });

  it("keeps at least one Payload query slot when pool max is set too low", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_POOL_MAX: "1",
      PAYLOAD_DATABASE_URI: SUPAVISOR_POOLER_URL,
      VERCEL_ENV: "production",
    });

    expect(config.pool.max).toBe(2);
    expect(config.warning).toContain("must be at least 2");
  });

  it("uses the hosted Payload pool default when pool max is not an integer", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_POOL_MAX: "many",
      PAYLOAD_DATABASE_URI: SUPAVISOR_POOLER_URL,
      VERCEL_ENV: "production",
    });

    expect(config.pool.max).toBe(2);
    expect(config.warning).toContain("not an integer");
  });

  it("blocks Supavisor pooler URLs without the Vercel-compatible SSL mode", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_URI: SUPAVISOR_REQUIRE_SSL_URL,
      VERCEL_ENV: "production",
    });

    expect(config.issue?.code).toBe("supavisor-ssl-mode");
    expect(config.issue?.message).toContain("sslmode=no-verify");
    expect(config.issue?.message).not.toContain("super-secret");
  });

  it("treats Vercel's built-in development target as local-only", () => {
    const env = {
      PAYLOAD_DATABASE_URI: DIRECT_SUPABASE_URL,
      VERCEL_ENV: "development",
      VERCEL_TARGET_ENV: "development",
    };
    const config = resolvePayloadDatabaseConfig(env);

    expect(isProtectedDeployment(env)).toBe(false);
    expect(config.isProtectedDeployment).toBe(false);
    expect(config.issue).toBeNull();
  });

  it("treats the retained legacy staging target as a protected deployment", () => {
    const env = {
      PAYLOAD_DATABASE_URI: DIRECT_SUPABASE_URL,
      VERCEL_ENV: "preview",
      VERCEL_TARGET_ENV: "staging",
    };
    const config = resolvePayloadDatabaseConfig(env);

    expect(config.isProtectedDeployment).toBe(isProtectedDeployment(env));
    expect(config.isProtectedDeployment).toBe(true);
    expect(config.issue?.code).toBe("direct-supabase-host");
  });

  it("treats the core-development custom target as a protected deployment", () => {
    const env = {
      PAYLOAD_DATABASE_URI: DIRECT_SUPABASE_URL,
      VERCEL_ENV: "preview",
      VERCEL_TARGET_ENV: "core-development",
    };
    const config = resolvePayloadDatabaseConfig(env);

    expect(config.isProtectedDeployment).toBe(isProtectedDeployment(env));
    expect(config.isProtectedDeployment).toBe(true);
    expect(config.issue?.code).toBe("direct-supabase-host");
  });

  it("rejects invalid database URLs in protected deployments without echoing raw values", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_URI: "postgresql://postgres:super-secret@",
      VERCEL_ENV: "production",
    });

    expect(config.issue?.code).toBe("invalid-protected-database-url");
    expect(config.issue?.message).toContain("PAYLOAD_DATABASE_URI");
    expect(config.issue?.message).not.toContain("super-secret");
  });
});

describe("verified Payload database CA configuration", () => {
  const certificate = "fixture-public-ca";
  const verifiedUrl = SUPAVISOR_POOLER_URL.replace(
    "sslmode=no-verify",
    "sslmode=verify-full",
  );

  it("verifies the server with the supplied CA and preserves hosted pool bounds", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_URI: `${verifiedUrl}&application_name=ca-fixture`,
      PAYLOAD_DATABASE_SSL_CA: certificate,
      VERCEL_ENV: "production",
    });
    expect(config.issue).toBeNull();
    expect(config.sslMode).toBe("verify-full");
    expect(config.pool).toEqual({
      connectionString: verifiedUrl.replace(
        "?sslmode=verify-full",
        "?application_name=ca-fixture",
      ),
      ssl: { ca: certificate, rejectUnauthorized: true },
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 5000,
      max: 2,
    });
    expect(assertPayloadDatabaseConfiguration(config)).toBe(config);
  });

  it.each([
    "no-verify",
    "disable",
    "require",
    "verify-ca",
    "verify-full&sslmode=disable",
  ])("fails closed when CA verification conflicts with URI mode %s", (mode) => {
    expect(() =>
      resolvePayloadDatabaseConfig({
        PAYLOAD_DATABASE_URI: SUPAVISOR_POOLER_URL.replace("no-verify", mode),
        PAYLOAD_DATABASE_SSL_CA: certificate,
      }),
    ).toThrow(PayloadDatabaseConfigurationError);
  });

  it.each([
    "ssl=false",
    "sslrootcert=other.crt",
    "sslcert=client.crt",
    "sslkey=client.key",
    "uselibpqcompat=true",
  ])(
    "rejects a driver option that could replace the verified CA options: %s",
    (option) => {
      expect(() =>
        resolvePayloadDatabaseConfig({
          PAYLOAD_DATABASE_URI: `${verifiedUrl}&${option}`,
          PAYLOAD_DATABASE_SSL_CA: certificate,
        }),
      ).toThrow("cannot be combined");
    },
  );

  it("rejects whitespace-only CA configuration", () => {
    expect(() =>
      resolvePayloadDatabaseConfig({
        PAYLOAD_DATABASE_URI: verifiedUrl,
        PAYLOAD_DATABASE_SSL_CA: "   ",
      }),
    ).toThrow("non-empty");
  });

  it("reports an invalid CA connection without echoing the URI or credential", () => {
    expect(() =>
      resolvePayloadDatabaseConfig({
        PAYLOAD_DATABASE_URI: "postgresql://postgres:super-secret@",
        PAYLOAD_DATABASE_SSL_CA: certificate,
      }),
    ).toThrow("valid Postgres URL");
    try {
      resolvePayloadDatabaseConfig({
        PAYLOAD_DATABASE_URI: "postgresql://postgres:super-secret@",
        PAYLOAD_DATABASE_SSL_CA: certificate,
      });
    } catch (error) {
      expect(String(error)).not.toContain("super-secret");
    }
  });
});
