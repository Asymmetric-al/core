import { readdirSync, readFileSync, statSync } from "node:fs";
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

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
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
  it("exports stable CRM contracts without exposing raw Twenty client subpaths", () => {
    const packageJson = JSON.parse(
      readRepoFile("packages/api/package.json"),
    ) as {
      exports: Record<string, string>;
    };

    expect(packageJson.exports["./crm"]).toBe("./src/crm/index.ts");
    expect(packageJson.exports["./admin/crm/gateway"]).toBe(
      "./src/admin/crm/gateway.ts",
    );
    expect(packageJson.exports["./admin/crm/twenty-health"]).toBe(
      "./src/admin/crm/twenty-health.ts",
    );
    expect(packageJson.exports["./admin/crm/notes"]).toBe(
      "./src/admin/crm/notes/index.ts",
    );
    expect(packageJson.exports["./admin/crm/projections"]).toBe(
      "./src/admin/crm/projections/index.ts",
    );
    expect(packageJson.exports["./admin/crm/relationships"]).toBe(
      "./src/admin/crm/relationships/index.ts",
    );
    expect(packageJson.exports["./admin/crm/webhooks/twenty"]).toBe(
      "./src/admin/crm/webhooks/twenty.ts",
    );
    expect(packageJson.exports["./admin/crm/sync/replay"]).toBe(
      "./src/admin/crm/sync/replay.ts",
    );
    expect(packageJson.exports["./admin/crm/sync/reconcile"]).toBe(
      "./src/admin/crm/sync/reconcile.ts",
    );
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

  it("keeps the Mission Control projection shadow route as a thin API re-export", () => {
    expect(
      readRepoFile("apps/admin/app/api/admin/crm/projections/route.ts").trim(),
    ).toBe('export { GET } from "@asym/api/admin/crm/projections";');
  });

  it("keeps CRM gateway, webhook, records, and sync routes as thin API re-exports", () => {
    expect(
      readRepoFile(
        "apps/admin/app/api/admin/crm/gateway/status/route.ts",
      ).trim(),
    ).toBe('export { GET } from "@asym/api/admin/crm/gateway";');
    expect(
      readRepoFile(
        "apps/admin/app/api/admin/crm/gateway/staging-health/route.ts",
      ).trim(),
    ).toBe('export { GET } from "@asym/api/admin/crm/twenty-health";');
    expect(
      readRepoFile(
        "apps/admin/app/api/admin/crm/webhooks/twenty/route.ts",
      ).trim(),
    ).toBe('export { POST } from "@asym/api/admin/crm/webhooks/twenty";');
    expect(
      readRepoFile("apps/admin/app/api/admin/crm/records/route.ts").trim(),
    ).toBe('export { GET } from "@asym/api/admin/crm";');
    expect(
      readRepoFile("apps/admin/app/api/admin/crm/sync/replay/route.ts").trim(),
    ).toBe('export { POST } from "@asym/api/admin/crm/sync/replay";');
    expect(
      readRepoFile(
        "apps/admin/app/api/admin/crm/sync/reconcile/route.ts",
      ).trim(),
    ).toBe('export { POST } from "@asym/api/admin/crm/sync/reconcile";');
  });

  it("enforces the raw Twenty client import boundary in ESLint and the verifier", () => {
    expect(readRepoFile("eslint.config.mjs")).toMatch(
      /@asym\/api\/crm\/client/,
    );
    expect(readRepoFile("scripts/verify/data-boundary-check.mjs")).toMatch(
      /TWENTY_API_KEY/,
    );
    expect(readRepoFile("scripts/verify/data-boundary-check.mjs")).toMatch(
      /NEXT_PUBLIC_TWENTY_/,
    );
  });
});
