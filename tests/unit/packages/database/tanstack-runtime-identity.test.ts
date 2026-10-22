import { readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../../..");
const databaseManifest = path.join(repoRoot, "packages/database/package.json");
const databaseRequire = createRequire(databaseManifest);

function dbRuntimeFrom(manifest: string) {
  return realpathSync(
    createRequire(manifest).resolve("@tanstack/db/package.json"),
  );
}

describe("installed TanStack DB cohort", () => {
  it("shares one physical runtime across shared UI, React, Query and Supabase bindings", () => {
    const consumers = [
      databaseManifest,
      path.join(repoRoot, "packages/ui/package.json"),
      databaseRequire.resolve("@tanstack/react-db/package.json"),
      databaseRequire.resolve("@tanstack/query-db-collection/package.json"),
      databaseRequire.resolve("@supabase-labs/tanstack-db/package.json"),
    ];
    const physicalRuntimes = consumers.map(dbRuntimeFrom);
    expect(new Set(physicalRuntimes).size).toBe(1);

    const manifest = JSON.parse(readFileSync(databaseManifest, "utf8"));
    const installed = JSON.parse(readFileSync(physicalRuntimes[0]!, "utf8"));
    expect(installed.version).toBe(
      manifest.dependencies["@tanstack/db"].replace(/^\^/, ""),
    );
  });

  it("shares the QueryClient runtime across React Query and both collection bindings", () => {
    const reactQueryManifest = databaseRequire.resolve(
      "@tanstack/react-query/package.json",
    );
    const consumers = [
      reactQueryManifest,
      ...["packages/ui", "apps/admin", "apps/donor", "apps/missionary"].map(
        (workspace) =>
          createRequire(path.join(repoRoot, workspace, "package.json")).resolve(
            "@tanstack/react-query/package.json",
          ),
      ),
      databaseRequire.resolve("@tanstack/query-db-collection/package.json"),
      databaseRequire.resolve("@supabase-labs/tanstack-db/package.json"),
    ];
    const physicalRuntimes = consumers.map((manifest) =>
      realpathSync(
        createRequire(manifest).resolve("@tanstack/query-core/package.json"),
      ),
    );
    expect(new Set(physicalRuntimes).size).toBe(1);

    const reactQuery = databaseRequire("@tanstack/react-query");
    for (const manifest of consumers) {
      expect(createRequire(manifest)("@tanstack/query-core").QueryClient).toBe(
        reactQuery.QueryClient,
      );
    }
  });
});
