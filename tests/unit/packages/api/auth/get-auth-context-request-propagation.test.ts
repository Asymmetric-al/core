import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));

function readSource(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function normalizeRepoPath(relativePath: string) {
  return relativePath.replaceAll("\\", "/");
}

function sourceFilesUnder(relativeDir: string): string[] {
  const absoluteDir = path.join(repoRoot, relativeDir);
  const entries = readdirSync(absoluteDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const relativePath = path
      .join(relativeDir, entry.name)
      .replaceAll("\\", "/");
    if (entry.isDirectory()) {
      files.push(...sourceFilesUnder(relativePath));
      continue;
    }

    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(relativePath.split(path.sep).join("/"));
    }
  }

  return files;
}

describe("getAuthContext request propagation", () => {
  it("passes route Request objects through auth-gated API handlers", () => {
    const allowedServerOnlyFiles = new Set([
      "packages/api/src/admin/support/loaders.ts",
    ]);

    const authGateFiles = [
      ...sourceFilesUnder("packages/api/src"),
      "packages/graphql/handler.ts",
    ];

    const zeroArgumentCallers = authGateFiles.filter((filePath) => {
      if (allowedServerOnlyFiles.has(normalizeRepoPath(filePath))) {
        return false;
      }
      return /\bgetAuthContext\(\)/.test(readSource(filePath));
    });

    expect(zeroArgumentCallers).toEqual([]);
    expect(readSource("packages/graphql/handler.ts")).toContain(
      "getAuthContext(request)",
    );
  });

  it("threads the Request into shared admin route auth helpers", () => {
    const adminRouteFiles = sourceFilesUnder("apps/admin/app/api/admin");

    const memberCareCallersWithoutRequest = adminRouteFiles.filter((filePath) =>
      /\brequireMemberCareAccess\(\)/.test(readSource(filePath)),
    );
    const supportHubCallersWithoutRequest = adminRouteFiles.filter((filePath) =>
      /\bwithSupportHubAccess\(async\b/.test(readSource(filePath)),
    );

    expect(memberCareCallersWithoutRequest).toEqual([]);
    expect(supportHubCallersWithoutRequest).toEqual([]);
  });
});
