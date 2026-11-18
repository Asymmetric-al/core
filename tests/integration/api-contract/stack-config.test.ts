/**
 * #2708: the harness reads the Data API surface from supabase/config.toml and
 * hands it to PostgREST unchanged. Pure: no Docker, no database.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  assertLoopbackDatabaseUrl,
  postgrestEnvironment,
  readApiSettings,
} from "../../../scripts/api-contract/stack.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../../..");

describe("readApiSettings", () => {
  it("reads schemas, extra_search_path and max_rows from the [api] table only", () => {
    const settings = readApiSettings(
      [
        'project_id = "x"',
        "[api]",
        "enabled = true",
        '# a comment with schemas = ["nope"]',
        'schemas = ["public", "graphql_public"]',
        'extra_search_path = ["public", "extensions"]',
        "max_rows = 1000",
        "",
        "[api.tls]",
        "enabled = false",
        "[db]",
        "max_rows = 5",
        'schemas = ["db"]',
      ].join("\n"),
    );
    expect(settings).toEqual({
      schemas: ["public", "graphql_public"],
      extraSearchPath: ["public", "extensions"],
      maxRows: 1000,
    });
  });

  it("refuses a config without a declared schema list or row cap", () => {
    expect(() => readApiSettings("[api]\nenabled = true\n")).toThrow(/schemas/);
    expect(() =>
      readApiSettings('[api]\nschemas = ["public"]\nextra_search_path = []\n'),
    ).toThrow(/max_rows/);
  });

  it("matches the repository's supabase/config.toml", () => {
    const settings = readApiSettings(
      readFileSync(path.join(repoRoot, "supabase/config.toml"), "utf8"),
    );
    expect(settings.schemas).toContain("public");
    expect(settings.schemas).not.toContain("authz");
    expect(settings.maxRows).toBeGreaterThan(0);
  });
});

describe("postgrestEnvironment", () => {
  it("mirrors the Supabase stack's PostgREST settings", () => {
    const env = postgrestEnvironment({
      settings: {
        schemas: ["public", "graphql_public"],
        extraSearchPath: ["public", "extensions"],
        maxRows: 1000,
      },
      dbUri: "postgres://authenticator:pw@db:5432/app",
      jwtSecret: "s".repeat(40),
      serverPort: 3000,
    });
    expect(env).toEqual({
      PGRST_DB_URI: "postgres://authenticator:pw@db:5432/app",
      PGRST_DB_SCHEMAS: "public,graphql_public",
      PGRST_DB_EXTRA_SEARCH_PATH: "public,extensions",
      PGRST_DB_MAX_ROWS: "1000",
      PGRST_DB_ANON_ROLE: "anon",
      PGRST_JWT_SECRET: "s".repeat(40),
      PGRST_SERVER_PORT: "3000",
      PGRST_DB_CHANNEL_ENABLED: "true",
      PGRST_LOG_LEVEL: "error",
    });
  });

  it("refuses a JWT secret shorter than PostgREST accepts", () => {
    expect(() =>
      postgrestEnvironment({
        settings: { schemas: ["public"], extraSearchPath: [], maxRows: 1 },
        dbUri: "postgres://a@b/c",
        jwtSecret: "short",
        serverPort: 3000,
      }),
    ).toThrow(/32/);
  });
});

describe("assertLoopbackDatabaseUrl", () => {
  it("accepts loopback hosts and refuses anything else", () => {
    for (const url of [
      "postgresql://postgres:postgres@localhost:5432/db",
      "postgresql://postgres@127.0.0.1:54400/db",
    ])
      expect(() => assertLoopbackDatabaseUrl(url)).not.toThrow();
    for (const url of [
      "postgresql://postgres@db.example.supabase.co:5432/postgres",
      "not a url",
    ])
      expect(() => assertLoopbackDatabaseUrl(url)).toThrow(/loopback|valid/);
  });
});
