import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const bannedAppPatterns = [
  /@asym\/api\/crm\/client/,
  /packages\/api\/src\/crm\/client/,
  /TWENTY_API_KEY/,
  /TWENTY_WEBHOOK_SECRET/,
  /NEXT_PUBLIC_TWENTY_/,
];
const retiredTwentyExports = [
  "./admin/crm/gateway",
  "./admin/crm/twenty-health",
  "./admin/crm/projections",
  "./admin/crm/webhooks/twenty",
  "./admin/crm/sync/replay",
  "./admin/crm/sync/reconcile",
  "./health/crm",
];
const retiredTwentyPaths = [
  "packages/api/src/crm/client/index.ts",
  "packages/api/src/crm/gateway.ts",
  "packages/api/src/crm/health.ts",
  "packages/api/src/crm/webhooks/twenty.ts",
  "packages/api/src/crm/schema/twenty-object-model.ts",
  "packages/api/src/crm/projections/index.ts",
  "packages/api/src/crm/sync/outbound.ts",
  "packages/api/src/health/crm.ts",
  "packages/api/src/admin/crm/gateway.ts",
  "packages/api/src/admin/crm/twenty-health.ts",
  "packages/api/src/admin/crm/projections/index.ts",
  "packages/api/src/admin/crm/webhooks/twenty.ts",
  "packages/api/src/admin/crm/sync/replay.ts",
  "apps/admin/app/api/health/crm/route.ts",
  "apps/admin/app/api/admin/crm/webhooks/twenty/route.ts",
  "apps/admin/app/api/admin/crm/gateway/status/route.ts",
  "apps/admin/app/api/admin/crm/gateway/development-health/route.ts",
  "apps/admin/app/api/admin/crm/sync/replay/route.ts",
  "apps/admin/app/api/admin/crm/sync/reconcile/route.ts",
  "apps/admin/app/api/admin/crm/projections/route.ts",
  "apps/admin/app/(app)/crm/projections/page.tsx",
  "scripts/verify/twenty-crm-health.ts",
];

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function repoExists(relativePath: string) {
  return existsSync(path.join(repoRoot, relativePath));
}

function collectSourceFiles(directoryPath: string): string[] {
  if (!statSync(directoryPath, { throwIfNoEntry: false })?.isDirectory()) {
    return [];
  }

  return readdirSync(directoryPath, { withFileTypes: true }).flatMap(
    (entry) => {
      const entryPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === ".next" || entry.name === "node_modules") {
          return [];
        }
        return collectSourceFiles(entryPath);
      }

      if (!entry.isFile() || !sourceExtensions.has(path.extname(entry.name))) {
        return [];
      }

      return [entryPath];
    },
  );
}

describe("Twenty CRM package and app boundary", () => {
  it("keeps Asym CRM notes and relationships exports without Twenty surfaces", () => {
    const packageJson = JSON.parse(
      readRepoFile("packages/api/package.json"),
    ) as {
      exports: Record<string, string>;
    };

    expect(packageJson.exports["./crm"]).toBe("./src/crm/index.ts");
    expect(packageJson.exports["./admin/crm/notes"]).toBe(
      "./src/admin/crm/notes/index.ts",
    );
    expect(packageJson.exports["./admin/crm/relationships"]).toBe(
      "./src/admin/crm/relationships/index.ts",
    );

    for (const exportPath of retiredTwentyExports) {
      expect(packageJson.exports[exportPath]).toBeUndefined();
    }

    expect(
      Object.keys(packageJson.exports).filter((exportPath) =>
        exportPath.includes("crm/client"),
      ),
    ).toEqual([]);
  });

  it("keeps app source from importing raw Twenty clients or server-only secrets", () => {
    const violations = collectSourceFiles(path.join(repoRoot, "apps"))
      .flatMap((filePath) => {
        const source = readFileSync(filePath, "utf8");
        return bannedAppPatterns
          .filter((pattern) => pattern.test(source))
          .map(
            (pattern) =>
              `${path.relative(repoRoot, filePath)} matched ${pattern.source}`,
          );
      })
      .sort();

    expect(violations).toEqual([]);
  });

  it("keeps the Mission Control notes route as a thin API re-export", () => {
    expect(
      readRepoFile("apps/admin/app/api/admin/crm/notes/route.ts").trim(),
    ).toBe('export { GET, POST } from "@asym/api/admin/crm/notes";');
  });

  it("keeps the Mission Control relationships route as a thin API re-export", () => {
    expect(
      readRepoFile(
        "apps/admin/app/api/admin/crm/relationships/route.ts",
      ).trim(),
    ).toBe('export { GET } from "@asym/api/admin/crm/relationships";');
  });

  it("keeps CRM records as a thin API re-export", () => {
    expect(
      readRepoFile("apps/admin/app/api/admin/crm/records/route.ts").trim(),
    ).toBe('export { GET } from "@asym/api/admin/crm";');
  });

  it("removes retired Twenty CRM runtime files and routes", () => {
    expect(
      retiredTwentyPaths.filter((relativePath) => repoExists(relativePath)),
    ).toEqual([]);
  });

  it("does not re-export retired Twenty CRM surfaces from the CRM package barrel", () => {
    const crmIndex = readRepoFile("packages/api/src/crm/index.ts");
    expect(crmIndex).not.toContain("./gateway");
    expect(crmIndex).not.toContain("./health");
    expect(crmIndex).not.toContain("./webhooks");
    expect(crmIndex).not.toContain("./projections");
    expect(crmIndex).not.toContain("./sync");
    expect(crmIndex).not.toContain("./client");
    expect(crmIndex).not.toContain("twenty-object-model");
  });

  it("enforces the raw Twenty client import boundary in ESLint and the verifier", () => {
    expect(
      readRepoFile("tooling/eslint-config/restricted-imports.mjs"),
    ).toMatch(/@asym\/api\/crm\/client/);
    expect(readRepoFile("eslint.config.mjs")).toMatch(/appRestrictedImports\(/);
    expect(readRepoFile("scripts/verify/data-boundary-check.mjs")).toMatch(
      /TWENTY_API_KEY/,
    );
    expect(readRepoFile("scripts/verify/data-boundary-check.mjs")).toMatch(
      /NEXT_PUBLIC_TWENTY_/,
    );
    expect(readRepoFile("scripts/verify/data-boundary-check.mjs")).toContain(
      "collectRetiredTwentyRuntimeViolations",
    );
  });
});
