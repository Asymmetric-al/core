import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  buildLocalEnvValues,
  isLocalCmsVerificationTarget,
  parseSupabaseStatusOutput,
  writeLocalEnv,
} from "../../../scripts/cms/lib/env.mjs";
import {
  DEMO_PUBLIC_TENANT_SLUG,
  LOCAL_DATABASE_URL,
  createLexicalRichText,
  createLocalPageLayout,
} from "../../../scripts/cms/lib/local-data.mjs";
import {
  assertPayloadRuntimeRequirements,
  compareNodeVersions,
  isPayloadV4Version,
  PAYLOAD_V4_NODE_RANGE,
  parseNodeVersion,
} from "../../../scripts/cms/lib/payload-runtime.mjs";

it("leaves seeded tenant identity intact and selects only ordinary funds", () => {
  const seed = fs.readFileSync("scripts/cms/seed-local.mjs", "utf8");
  expect(seed).toMatch(
    /INSERT INTO public\.tenants[\s\S]*?ON CONFLICT \(id\) DO NOTHING;/,
  );
  for (const source of [
    seed,
    fs.readFileSync("scripts/cms/verify-local.mjs", "utf8"),
  ]) {
    expect(source.match(/FROM public\.funds[\s\S]*?ORDER BY/i)?.[0]).toMatch(
      /system_purpose IS NULL/i,
    );
  }
});

it("accepts a private local stack on nondefault ports, but never a nonlocal target", () => {
  const api = "http://127.0.0.1:30361";
  const database = "postgresql://postgres@127.0.0.1:30362/postgres";
  expect(isLocalCmsVerificationTarget(api, database)).toBe(true);
  expect(
    isLocalCmsVerificationTarget("https://example.invalid", database),
  ).toBe(false);
  expect(
    isLocalCmsVerificationTarget(api, "postgresql://example.invalid/fixtures"),
  ).toBe(false);
});

function readEnvValue(filePath: string, key: string) {
  const line = fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .find((candidate) => candidate.startsWith(`${key}=`));

  return line?.slice(key.length + 1);
}

describe("local CMS setup scripts", () => {
  it("guards Payload 4 CMS commands behind the required Node runtime", () => {
    expect(parseNodeVersion("v24.22.3")).toEqual({
      major: 24,
      minor: 22,
      patch: 3,
    });
    expect(compareNodeVersions("24.22.3", "24.22.2")).toBe(1);
    expect(compareNodeVersions("24.22.3", "24.22.3")).toBe(0);
    expect(compareNodeVersions("24.15.0", "24.22.3")).toBe(-1);
    expect(isPayloadV4Version("4.0.0-beta.9")).toBe(true);
    expect(isPayloadV4Version("^3.84.1")).toBe(false);

    for (const nodeVersion of [
      "24.15.0",
      "24.22.1",
      "24.22.2",
      "25.9.0",
      "26.0.0",
      "26.13.0",
      "22.22.2",
    ]) {
      expect(
        () =>
          assertPayloadRuntimeRequirements({
            nodeVersion,
            payloadVersion: "4.0.0-beta.9",
          }),
        nodeVersion,
      ).toThrow(/requires Node\.js \^24\.22\.3 \|\| >=26\.13\.1/);
    }

    for (const nodeVersion of ["24.22.3", "24.23.0", "26.13.1", "27.0.0"]) {
      expect(
        () =>
          assertPayloadRuntimeRequirements({
            nodeVersion,
            payloadVersion: "4.0.0-beta.9",
          }),
        nodeVersion,
      ).not.toThrow();
    }
    expect(() =>
      assertPayloadRuntimeRequirements({
        nodeVersion: "24.11.1",
        payloadVersion: "^3.84.1",
      }),
    ).not.toThrow();
  });

  it("encodes the Node range that the installed Payload declares", () => {
    const payloadManifest = JSON.parse(
      fs.readFileSync(
        path.join(
          process.cwd(),
          "apps",
          "admin",
          "node_modules",
          "payload",
          "package.json",
        ),
        "utf8",
      ),
    );
    expect(payloadManifest.engines.node).toBe(PAYLOAD_V4_NODE_RANGE);
  });

  it("parses Supabase status env output for local key repair", () => {
    const parsed = parseSupabaseStatusOutput(`
      API URL: http://127.0.0.1:54321
      DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      anon key: local-anon
      service_role key: local-service
    `);

    const values = buildLocalEnvValues(parsed);

    expect(values.NEXT_PUBLIC_SUPABASE_URL).toBe("http://127.0.0.1:54321");
    expect(values.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("local-anon");
    expect(values.SUPABASE_SERVICE_ROLE_KEY).toBe("local-service");
    expect(values.PAYLOAD_DATABASE_URI).toBe(LOCAL_DATABASE_URL);
    expect(values.CMS_LOCAL_DEFAULT_TENANT_SLUG).toBe(DEMO_PUBLIC_TENANT_SLUG);
  });

  it("repairs placeholders without overwriting non-empty local values", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cms-local-env-"));
    const envPath = path.join(tempDir, ".env.local");
    fs.writeFileSync(
      envPath,
      [
        "PAYLOAD_SECRET=custom-payload-secret",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key",
      ].join("\n"),
    );

    const result = writeLocalEnv({
      filePath: envPath,
      statusEnv: {
        ANON_KEY: "local-anon",
        SERVICE_ROLE_KEY: "local-service",
      },
    });

    expect(result.preserved).toContain("PAYLOAD_SECRET");
    expect(result.updated).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    expect(readEnvValue(envPath, "PAYLOAD_SECRET")).toBe(
      "custom-payload-secret",
    );
    expect(readEnvValue(envPath, "NEXT_PUBLIC_SUPABASE_ANON_KEY")).toBe(
      "local-anon",
    );
    expect(readEnvValue(envPath, "SUPABASE_SERVICE_ROLE_KEY")).toBe(
      "local-service",
    );
  });

  it("builds valid local Lexical and layout seed payloads", () => {
    const richText = createLexicalRichText("Local content");
    const layout = createLocalPageLayout({
      headline: "Local CMS Home",
      mediaId: "media_1",
      variant: "standard",
    });

    expect(richText.root.type).toBe("root");
    expect(richText.root.children[0]?.type).toBe("paragraph");
    expect(layout.map((block) => block.blockType)).toEqual([
      "hero",
      "rich-text",
      "call-to-action",
      "impact-stats",
    ]);
    expect(layout[0]).toMatchObject({
      blockType: "hero",
      backgroundImage: "media_1",
    });
  });
});

describe("local CMS script loopback target refusal (WP6 part 2a, W6-R11)", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  function createFakePsql() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cms-local-psql-"));
    tempDirs.push(dir);
    const calledPath = path.join(dir, "psql-called.log");
    const driverPath = path.join(dir, "fake-psql.mjs");
    fs.writeFileSync(
      driverPath,
      [
        'import fs from "node:fs";',
        "const args = process.argv.slice(2);",
        'if (args.includes("--version")) {',
        '  process.stdout.write("psql (PostgreSQL) 17.0\\n");',
        "  process.exit(0);",
        "}",
        `fs.appendFileSync(${JSON.stringify(calledPath)}, args.join(" ") + "\\n");`,
        'const sql = args[args.indexOf("-c") + 1] ?? "";',
        'if (sql.includes("to_regprocedure")) {',
        '  process.stdout.write("t\\n");',
        "  process.exit(0);",
        "}",
        'if (sql.includes("environment_kind")) {',
        '  process.stdout.write("disposable\\n");',
        "  process.exit(0);",
        "}",
        'process.stderr.write("fake-psql-connected\\n");',
        "process.exit(1);",
      ].join("\n"),
    );

    if (process.platform === "win32") {
      const binPath = path.join(dir, "fake-psql.cmd");
      fs.writeFileSync(
        binPath,
        `@echo off\r\n"${process.execPath}" "${driverPath}" %*\r\n`,
      );
      return { psqlBin: binPath, calledPath };
    }

    const binPath = path.join(dir, "fake-psql.sh");
    fs.writeFileSync(
      binPath,
      `#!/usr/bin/env sh\nexec "${process.execPath}" "${driverPath}" "$@"\n`,
      { mode: 0o755 },
    );
    return { psqlBin: binPath, calledPath };
  }

  it("refuses a hosted database URL in scripts/cms/seed-local.mjs before any connection, even with a valid project CA and a disposable marker", () => {
    const { psqlBin, calledPath } = createFakePsql();
    const caPath = path.join(path.dirname(calledPath), "project-ca.pem");
    fs.copyFileSync(
      path.resolve("tests/unit/scripts/release/fixtures/ca/ca.crt"),
      caPath,
    );
    const result = spawnSync(
      process.execPath,
      [path.resolve("scripts/cms/seed-local.mjs")],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          PAYLOAD_DATABASE_URI:
            "postgresql://postgres:secret@db.example.invalid:5432/postgres?sslmode=verify-full",
          PGSSLROOTCERT: caPath,
          PSQL_BIN: psqlBin,
        },
      },
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr.toLowerCase()).toContain("loopback");
    expect(fs.existsSync(calledPath)).toBe(false);
  });

  it("refuses a hosted database URL in scripts/cms/verify-local.mjs before any connection", () => {
    const { psqlBin, calledPath } = createFakePsql();
    const result = spawnSync(
      process.execPath,
      [path.resolve("scripts/cms/verify-local.mjs")],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "local-anon",
          SUPABASE_SERVICE_ROLE_KEY: "local-service",
          SUPABASE_DB_URL:
            "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
          PAYLOAD_DATABASE_URI:
            "postgresql://postgres:secret@db.example.invalid:5432/postgres?sslmode=verify-full",
          PAYLOAD_DISABLE_SCHEMA_PUSH: "1",
          PAYLOAD_SECRET: "local-secret",
          CMS_BASE_URL: "http://127.0.0.1:3030",
          NEXT_PUBLIC_DONOR_URL: "http://127.0.0.1:3000",
          DONOR_APP_URL: "http://127.0.0.1:3000",
          ALLOW_DEMO_ACCOUNTS: "true",
          DEMO_ADMIN_EMAIL: "demo@example.test",
          DEMO_PASSWORD: "demo-password",
          E2E_AUTH_BYPASS: "false",
          CMS_LOCAL_DEFAULT_TENANT_SLUG: "give-hope-demo",
          PSQL_BIN: psqlBin,
        },
      },
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "Local CMS verification requires loopback Supabase and database URLs.",
    );
    expect(fs.existsSync(calledPath)).toBe(false);
  });
});
