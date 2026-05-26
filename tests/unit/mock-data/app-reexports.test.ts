import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

const appMockDataDirs = [
  "apps/admin/lib/mock-data",
  "apps/donor/lib/mock-data",
  "apps/missionary/lib/mock-data",
] as const;

const expectedReexport = 'export * from "@asym/mock-data";';

describe("app mock-data re-exports", () => {
  it("keeps only a thin index.ts re-export in each app", () => {
    for (const relativeDir of appMockDataDirs) {
      const dir = join(repoRoot, relativeDir);
      const entries = readdirSync(dir).toSorted();

      expect(entries).toEqual(["index.ts"]);
    }
  });

  it("re-exports the shared @asym/mock-data package from each app entrypoint", () => {
    for (const relativeDir of appMockDataDirs) {
      const indexPath = join(repoRoot, relativeDir, "index.ts");
      const source = readFileSync(indexPath, "utf8");

      expect(source).toContain(expectedReexport);
      expect(source).not.toMatch(/from\s+["']\.\//);
    }
  });

  it("uses identical app wrappers across admin, donor, and missionary", () => {
    const sources = appMockDataDirs.map((relativeDir) =>
      readFileSync(join(repoRoot, relativeDir, "index.ts"), "utf8"),
    );

    expect(new Set(sources).size).toBe(1);
  });
});
