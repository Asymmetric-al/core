import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../../../", import.meta.url));

const SEED_TENANT_ID = "00000000-0000-0000-0000-000000000001";

function gitGrepFiles(args: string[]): string[] {
  const result = spawnSync("git", ["grep", "-l", "-z", ...args], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status === 1) return [];
  if (result.status !== 0) {
    throw new Error(`git grep failed: ${result.stderr}`);
  }
  return result.stdout.split("\0").filter(Boolean);
}

function isTest(path: string): boolean {
  const name = path.split("/").pop() ?? path;
  return path.startsWith("tests/") || /\.(test|spec)\./.test(name);
}

function isRecordOrSchema(path: string): boolean {
  return (
    path.startsWith("docs/") ||
    path.endsWith(".md") ||
    path.startsWith("supabase/migrations/") ||
    path === "supabase/seed.sql" ||
    path === "supabase/schema.sql"
  );
}

function shipped(paths: string[]): string[] {
  return [
    ...new Set(paths.filter((p) => !isTest(p) && !isRecordOrSchema(p))),
  ].toSorted();
}

const WRITERS_OF_THE_SEED_ORGANIZATION: Record<string, string> = {
  "packages/auth/constants.ts":
    "the definition, kept for tests (ruling Q2); test one pins that no shipped file imports it",
  "packages/database/scripts/seed-demo-users.ts":
    "a local seeding script, never a request (working rule 1)",
  "scripts/cms/lib/local-data.mjs":
    "the local CMS fixture data, read only by the local CMS scripts (working rule 1)",
  "scripts/cms/seed-local.mjs": "a local CMS script reading local-data.mjs",
  "scripts/cms/verify-local.mjs": "a local CMS script reading local-data.mjs",
  "scripts/run-with-ci-env.mjs":
    "a harness launcher that turns the bypass on and so sets E2E_AUTH_TENANT_ID",
  "scripts/dev/setup-mission-control-cloud.mjs":
    "a harness launcher that turns the bypass on and so sets E2E_AUTH_TENANT_ID",
  "playwright.config.ts":
    "the Playwright harness that turns the bypass on and so sets E2E_AUTH_TENANT_ID",
  ".oss-scanner/run-local.sh":
    "the scanner's demo profile turns the bypass on and so sets E2E_AUTH_TENANT_ID",
  ".github/workflows/ci-integration.yml":
    "the two end-to-end jobs that turn the bypass on and so set E2E_AUTH_TENANT_ID",
  ".env.example":
    "documents E2E_AUTH_TENANT_ID beside E2E_AUTH_BYPASS with the seed's ID",
};

const WILDCARD_REEXPORT =
  /export\s*\*\s*(?:as\s+\w+\s+)?from\s*["']([^"']+)["']/g;

function wildcardReexportsAuthConstants(path: string, text: string): boolean {
  return [...text.matchAll(WILDCARD_REEXPORT)].some(([, specifier = ""]) => {
    const bare = specifier.replace(/\.(ts|js|mjs)$/, "");
    if (/(^|\/)packages\/auth\/constants$|^@asym\/auth\/constants$/.test(bare))
      return true;
    return (
      path.startsWith("packages/auth/") && /^(\.\.?\/)+constants$/.test(bare)
    );
  });
}

describe("AL-2676 (plan :939): no demo-organization constant in code that ships", () => {
  it("the wildcard re-export check finds planted re-exports of the auth constants module and nothing else", () => {
    expect(
      wildcardReexportsAuthConstants(
        "packages/auth/index.ts",
        'export * from "./constants";',
      ),
    ).toBe(true);
    expect(
      wildcardReexportsAuthConstants(
        "packages/api/src/x.ts",
        "export * as c from '@asym/auth/constants';",
      ),
    ).toBe(true);
    expect(
      wildcardReexportsAuthConstants(
        "apps/admin/lib/x.ts",
        'export * from "../../../packages/auth/constants.ts";',
      ),
    ).toBe(true);
    expect(
      wildcardReexportsAuthConstants(
        "packages/config/index.ts",
        'export * from "./constants";',
      ),
    ).toBe(false);
  });

  it("no shipped file wildcard re-exports the auth constants module, which would hide DEMO_TENANT_ID from the name scan", () => {
    const offenders = shipped(
      gitGrepFiles(["-E", "-e", "export[[:space:]]*[*]"]),
    ).filter(
      (path) =>
        /\.(ts|tsx|js|mjs|cjs|mts)$/.test(path) &&
        wildcardReexportsAuthConstants(
          path,
          readFileSync(`${root}${path}`, "utf8"),
        ),
    );
    expect(offenders).toEqual([]);
  });

  it("no tracked file outside tests and records names DEMO_TENANT_ID except its definition", () => {
    expect(shipped(gitGrepFiles(["-w", "-e", "DEMO_TENANT_ID"]))).toEqual([
      "packages/auth/constants.ts",
    ]);
  });

  it("the files outside tests and records that write the seed's organization ID or name a demo-tenant constant are exactly the stated ones", () => {
    const writers = shipped([
      ...gitGrepFiles(["-F", "-e", SEED_TENANT_ID]),
      ...gitGrepFiles([
        "-w",
        "-e",
        "DEMO_TENANT_ID",
        "-e",
        "DEMO_PUBLIC_TENANT_ID",
      ]),
    ]);
    expect(writers).toEqual(
      Object.keys(WRITERS_OF_THE_SEED_ORGANIZATION).toSorted(),
    );
  });
});
