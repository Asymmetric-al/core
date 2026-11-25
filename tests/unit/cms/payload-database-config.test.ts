import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { isProtectedDeployment } from "@asym/env/target-env";
import {
  assertPayloadDatabaseConfiguration,
  DEFAULT_LOCAL_PAYLOAD_DATABASE_URL,
  PayloadDatabaseConfigurationError,
  resolvePayloadDatabaseConfig,
} from "../../../apps/admin/src/cms/payload-database-config";

const DIRECT_SUPABASE_URL =
  "postgresql://cms_runtime:super-secret@db.btewedpsxwsjczvmegby.supabase.co:5432/postgres";

const SUPAVISOR_POOLER_URL =
  "postgresql://cms_runtime.btewedpsxwsjczvmegby:super-secret@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=no-verify";

const SUPAVISOR_VERIFY_FULL_URL =
  "postgresql://cms_runtime.btewedpsxwsjczvmegby:super-secret@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=verify-full";

const SUPAVISOR_REQUIRE_SSL_URL =
  "postgresql://cms_runtime.btewedpsxwsjczvmegby:super-secret@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require";

const FIXTURE_SSL_CA = "fixture-public-ca";

const POSTGRES_POOLER_URL = SUPAVISOR_POOLER_URL.replace(
  "cms_runtime.",
  "postgres.",
);

/** The Core migration string, which Payload must never read (NA-04). */
const withMigrationString = { SUPABASE_DB_URL: POSTGRES_POOLER_URL };

describe("resolvePayloadDatabaseConfig", () => {
  it("reads PAYLOAD_DATABASE_URI and never the migration string", () => {
    const config = resolvePayloadDatabaseConfig({
      ...withMigrationString,
      PAYLOAD_DATABASE_URI: SUPAVISOR_POOLER_URL,
    });

    expect(config.connectionString).toBe(SUPAVISOR_POOLER_URL);
    expect(config.source).toBe("PAYLOAD_DATABASE_URI");
    expect(config.loginRole).toBe("cms_runtime");
    expect(config.host).toBe("aws-0-us-west-2.pooler.supabase.com");
    expect(config.sslMode).toBe("no-verify");
    expect(config.isSupavisorPoolerHost).toBe(true);
    expect(config.pool).toEqual({
      connectionString: SUPAVISOR_POOLER_URL,
    });
    expect(config.issue).toBeNull();
  });

  it("does not fall back to SUPABASE_DB_URL (NA-04)", () => {
    const config = resolvePayloadDatabaseConfig({
      ...withMigrationString,
      NODE_ENV: "development",
      PAYLOAD_DATABASE_URI: "   ",
    });

    expect(config.connectionString).toBe(DEFAULT_LOCAL_PAYLOAD_DATABASE_URL);
    expect(config.source).toBe("default-local");
    expect(config.warning).not.toContain("SUPABASE_DB_URL");
  });

  it("blocks a protected deployment that offers only the migration string", () => {
    const config = resolvePayloadDatabaseConfig({
      ...withMigrationString,
      VERCEL_ENV: "production",
    });

    expect(config.issue?.code).toBe("missing-protected-database-url");
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

  it("accepts Supavisor pooler hosts with verify-full and CA in protected deployments after WP6 part 2a retires no-verify", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_URI: SUPAVISOR_VERIFY_FULL_URL,
      PAYLOAD_DATABASE_SSL_CA: FIXTURE_SSL_CA,
      VERCEL_ENV: "production",
    });

    expect(config.isProtectedDeployment).toBe(true);
    expect(config.isVercelRuntime).toBe(true);
    expect(config.isSupavisorPoolerHost).toBe(true);
    expect(config.pool).toEqual({
      connectionString: SUPAVISOR_VERIFY_FULL_URL.replace(
        "?sslmode=verify-full",
        "",
      ),
      ssl: { ca: FIXTURE_SSL_CA, rejectUnauthorized: true },
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

  it("allows hosted Payload pool max to be raised explicitly with verify-full and CA after WP6 part 2a retires no-verify", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_POOL_MAX: "4",
      PAYLOAD_DATABASE_URI: SUPAVISOR_VERIFY_FULL_URL,
      PAYLOAD_DATABASE_SSL_CA: FIXTURE_SSL_CA,
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

  it("blocks Supavisor pooler URLs without verify-full and CA after WP6 part 2a retires no-verify", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_URI: SUPAVISOR_REQUIRE_SSL_URL,
      VERCEL_ENV: "production",
    });

    expect(config.issue?.code).toBe("supavisor-ssl-mode");
    expect(config.issue?.message).toContain("sslmode=verify-full");
    expect(config.issue?.message).toContain("PAYLOAD_DATABASE_SSL_CA");
    expect(config.issue?.message).not.toContain("no-verify");
    expect(config.issue?.message).not.toContain("legacy transition path");
    expect(config.issue?.message).not.toContain("super-secret");
  });

  it.each([
    ["production", { VERCEL_ENV: "production" }],
    [
      "core-development",
      { VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "core-development" },
    ],
  ])(
    "refuses no-verify and duplicate sslmode on %s without a CA after WP6 part 2a retires no-verify",
    (_target, targetEnv) => {
      for (const uri of [
        SUPAVISOR_POOLER_URL,
        `${SUPAVISOR_POOLER_URL}&sslmode=verify-full`,
        SUPAVISOR_REQUIRE_SSL_URL,
        SUPAVISOR_VERIFY_FULL_URL.replace("?sslmode=verify-full", ""),
        `${SUPAVISOR_VERIFY_FULL_URL}&sslmode=no-verify`,
      ]) {
        const config = resolvePayloadDatabaseConfig({
          PAYLOAD_DATABASE_URI: uri,
          ...targetEnv,
        });
        expect(config.issue?.code, uri).toBe("supavisor-ssl-mode");
        expect(config.issue?.message, uri).not.toContain("no-verify");
        expect(config.issue?.message, uri).not.toContain(
          "legacy transition path",
        );
      }

      const emptyCa = resolvePayloadDatabaseConfig({
        PAYLOAD_DATABASE_URI: SUPAVISOR_VERIFY_FULL_URL,
        PAYLOAD_DATABASE_SSL_CA: "",
        ...targetEnv,
      });
      expect(emptyCa.issue?.code).toBe("supavisor-ssl-mode");
    },
  );

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

describe("Payload runtime confinement to cms_runtime (plan 7.2)", () => {
  it.each([
    ["postgres pooler login", POSTGRES_POOLER_URL],
    [
      "cms_owner pooler login",
      SUPAVISOR_POOLER_URL.replace("cms_runtime.", "cms_owner."),
    ],
    [
      "look-alike role name",
      SUPAVISOR_POOLER_URL.replace("cms_runtime.", "cms_runtime_admin."),
    ],
    [
      "postgres direct login",
      "postgresql://postgres:super-secret@db.btewedpsxwsjczvmegby.supabase.co:5432/postgres",
    ],
  ])(
    "blocks a protected deployment whose connection is a %s",
    (_label, url) => {
      const config = resolvePayloadDatabaseConfig({
        PAYLOAD_DATABASE_URI: url,
        VERCEL_ENV: "production",
      });

      expect(config.issue?.code).toBe("non-runtime-database-role");
      expect(config.issue?.message).toContain("cms_runtime");
      expect(config.issue?.message).not.toContain("super-secret");
      expect(() => assertPayloadDatabaseConfiguration(config)).toThrow(
        PayloadDatabaseConfigurationError,
      );
    },
  );

  it("accepts the cms_runtime login, direct or through the pooler with verify-full and CA after WP6 part 2a retires no-verify", () => {
    const pooled = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_URI: SUPAVISOR_VERIFY_FULL_URL,
      PAYLOAD_DATABASE_SSL_CA: FIXTURE_SSL_CA,
      VERCEL_TARGET_ENV: "core-development",
      VERCEL_ENV: "preview",
    });
    expect(pooled.loginRole).toBe("cms_runtime");
    expect(pooled.issue).toBeNull();

    const direct = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_URI:
        "postgresql://cms_runtime:super-secret@10.0.0.5:5432/postgres",
      VERCEL_ENV: "production",
    });
    expect(direct.loginRole).toBe("cms_runtime");
    expect(direct.issue).toBeNull();
  });

  it("blocks a protected deployment that holds the CMS migration connection", () => {
    const config = resolvePayloadDatabaseConfig({
      PAYLOAD_DATABASE_URI: SUPAVISOR_POOLER_URL,
      PAYLOAD_MIGRATION_DATABASE_URI: SUPAVISOR_POOLER_URL.replace(
        "cms_runtime.",
        "cms_owner.",
      ),
      VERCEL_ENV: "production",
    });

    expect(config.issue?.code).toBe("migration-credential-in-runtime");
    expect(config.issue?.message).toContain("PAYLOAD_MIGRATION_DATABASE_URI");
    expect(config.issue?.message).not.toContain("super-secret");
  });

  // Council round 2, A7b: node-postgres lets the query's `user` and `host`
  // override the URL's own, so a cms_runtime-looking URL could log in as
  // postgres, or reach another server.
  it.each([
    [
      "a user override",
      `${SUPAVISOR_POOLER_URL}&user=postgres.btewedpsxwsjczvmegby`,
    ],
    [
      "a host override",
      `${SUPAVISOR_POOLER_URL}&host=db.btewedpsxwsjczvmegby.supabase.co`,
    ],
    ["a hostaddr override", `${SUPAVISOR_POOLER_URL}&hostaddr=10.0.0.9`],
    ["a port override", `${SUPAVISOR_POOLER_URL}&port=6543`],
  ])(
    "blocks a protected deployment whose cms_runtime URL carries %s",
    (_label, url) => {
      const config = resolvePayloadDatabaseConfig({
        PAYLOAD_DATABASE_URI: url,
        VERCEL_ENV: "production",
      });

      expect(config.issue?.code).toBe("database-url-routing-override");
      expect(config.issue?.message).not.toContain("super-secret");
      expect(config.issue?.message).not.toContain("btewedpsxwsjczvmegby");
      expect(() => assertPayloadDatabaseConfiguration(config)).toThrow(
        PayloadDatabaseConfigurationError,
      );
    },
  );

  it("leaves local development free to use the local superuser", () => {
    const config = resolvePayloadDatabaseConfig({
      NODE_ENV: "development",
      PAYLOAD_DATABASE_URI:
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    });

    expect(config.loginRole).toBe("postgres");
    expect(config.issue).toBeNull();
  });
});

describe("Payload never creates a database (disableCreateDatabase)", () => {
  it.each([
    ["local development", { NODE_ENV: "development" }],
    [
      "a protected deployment",
      { PAYLOAD_DATABASE_URI: SUPAVISOR_POOLER_URL, VERCEL_ENV: "production" },
    ],
  ])("turns database creation off in %s", (_label, env) => {
    expect(resolvePayloadDatabaseConfig(env).disableCreateDatabase).toBe(true);
  });
});

describe("admin build step for protected Payload database TLS (WP6 part 2a, Q4)", () => {
  const adminDir = path.resolve("apps/admin");
  const checkScript = path.resolve(
    "scripts/cms/check-payload-database-config.mjs",
  );

  it("wires the database configuration check into apps/admin build before next build", () => {
    const manifest = JSON.parse(
      readFileSync(path.join(adminDir, "package.json"), "utf8"),
    ) as { scripts: { build: string } };
    const buildScript = manifest.scripts.build;
    const checkIndex = buildScript.indexOf(
      "scripts/cms/check-payload-database-config.mjs",
    );
    const nextBuildIndex = buildScript.indexOf("next build");

    expect(checkIndex).toBeGreaterThan(-1);
    expect(nextBuildIndex).toBeGreaterThan(checkIndex);
  });

  it.each([
    ["production", { VERCEL_ENV: "production" }],
    [
      "core-development",
      { VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "core-development" },
    ],
  ])(
    "fails a %s build with no-verify, printing the issue code and no URL, password, or CA",
    (_label, targetEnv) => {
      const result = spawnSync(process.execPath, [checkScript], {
        cwd: adminDir,
        encoding: "utf8",
        env: {
          PATH: process.env.PATH,
          PAYLOAD_DATABASE_URI: SUPAVISOR_POOLER_URL,
          ...targetEnv,
        },
      });
      const output = `${result.stdout}${result.stderr}`;

      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("supavisor-ssl-mode");
      expect(output).not.toContain("super-secret");
      expect(output).not.toContain("pooler.supabase.com");
      expect(output).not.toContain("btewedpsxwsjczvmegby");
    },
  );

  it("fails a protected build with a whitespace-only CA, printing the code and no values", () => {
    const result = spawnSync(process.execPath, [checkScript], {
      cwd: adminDir,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        PAYLOAD_DATABASE_URI: SUPAVISOR_VERIFY_FULL_URL,
        PAYLOAD_DATABASE_SSL_CA: " \n\t ",
        VERCEL_ENV: "production",
      },
    });
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("supavisor-ssl-mode");
    expect(output).not.toContain("super-secret");
    expect(output).not.toContain("pooler.supabase.com");
  });

  it("passes a protected build with verify-full and CA, and does nothing on unprotected targets", () => {
    const protectedPass = spawnSync(process.execPath, [checkScript], {
      cwd: adminDir,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        PAYLOAD_DATABASE_URI: SUPAVISOR_VERIFY_FULL_URL,
        PAYLOAD_DATABASE_SSL_CA: FIXTURE_SSL_CA,
        VERCEL_ENV: "production",
      },
    });
    expect(protectedPass.status).toBe(0);
    expect(`${protectedPass.stdout}${protectedPass.stderr}`).not.toContain(
      FIXTURE_SSL_CA,
    );

    const unprotectedPass = spawnSync(process.execPath, [checkScript], {
      cwd: adminDir,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        PAYLOAD_DATABASE_URI: SUPAVISOR_POOLER_URL,
        VERCEL_ENV: "preview",
      },
    });
    expect(unprotectedPass.status).toBe(0);
    expect(unprotectedPass.stdout).toBe("");
    expect(unprotectedPass.stderr).toBe("");
  });
});
