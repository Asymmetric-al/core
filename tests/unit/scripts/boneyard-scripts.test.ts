import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = join(import.meta.dirname, "../../..");

const boneyardApps = ["admin", "donor", "missionary"] as const;

const expectedBoneyardBuildScriptOrigins = {
  "boneyard:admin": "http://localhost:3030",
  "boneyard:missionary": "http://localhost:4000",
  "boneyard:donor": "http://localhost:3000",
  "boneyard:admin:force": "http://localhost:3030",
  "boneyard:missionary:force": "http://localhost:4000",
  "boneyard:donor:force": "http://localhost:3000",
} as const;

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function parsePackageJson(): Record<string, unknown> {
  return JSON.parse(readRepoFile("package.json")) as Record<string, unknown>;
}

function boneyardBuildScripts(
  pkg: Record<string, unknown>,
): Record<string, string> {
  const scripts = pkg.scripts as Record<string, string>;
  return Object.fromEntries(
    Object.entries(scripts).filter(([key]) => key.startsWith("boneyard:")),
  );
}

function expectsNoindexRobots(source: string, label: string): void {
  expect(source, `${label}: robots block must disable indexing`).toMatch(
    /robots:\s*{[\s\S]*index:\s*false[\s\S]*follow:\s*false/,
  );
  expect(source, `${label}: googleBot block must disable indexing`).toMatch(
    /googleBot:\s*{[\s\S]*index:\s*false[\s\S]*follow:\s*false/,
  );
}

describe("boneyard maintenance contract", () => {
  it("pins boneyard-js at ^1.8.1 in app and UI packages", () => {
    for (const relativePath of [
      "apps/admin/package.json",
      "apps/donor/package.json",
      "apps/missionary/package.json",
      "packages/ui/package.json",
    ]) {
      const pkg = JSON.parse(readRepoFile(relativePath)) as {
        devDependencies?: Record<string, string>;
        dependencies?: Record<string, string>;
        peerDependencies?: Record<string, string>;
      };
      const version =
        pkg.devDependencies?.["boneyard-js"] ??
        pkg.dependencies?.["boneyard-js"] ??
        pkg.peerDependencies?.["boneyard-js"];
      expect(version, relativePath).toBe("^1.8.1");
    }
  });

  it("uses origin-only URLs in root boneyard build scripts", () => {
    const scripts = boneyardBuildScripts(parsePackageJson());
    const buildScripts = Object.entries(scripts).filter(([, command]) =>
      command.includes("boneyard-js build"),
    );
    const expectedNames = Object.keys(expectedBoneyardBuildScriptOrigins);

    expect(buildScripts.map(([name]) => name).toSorted()).toEqual(
      expectedNames.toSorted(),
    );

    for (const [name, command] of buildScripts) {
      const origin =
        expectedBoneyardBuildScriptOrigins[
          name as keyof typeof expectedBoneyardBuildScriptOrigins
        ];

      expect(command, name).toContain(`boneyard-js build ${origin}`);
      expect(command, name).not.toMatch(/\/boneyard\//);
    }
  });

  it("keeps one TypeScript Boneyard registry per app", () => {
    for (const app of boneyardApps) {
      const registryPath = `apps/${app}/bones/registry.ts`;
      const legacyRegistryPath = `apps/${app}/bones/registry.js`;
      const registrySource = readRepoFile(registryPath);

      expect(
        existsSync(join(repoRoot, legacyRegistryPath)),
        legacyRegistryPath,
      ).toBe(false);
      expect(registrySource, registryPath).toMatch(
        /import\s+{\s*registerBones\s*}\s+from\s+['"]boneyard-js['"]/,
      );
      expect(registrySource, registryPath).toMatch(
        /import\s+{\s*configureBoneyard\s*}\s+from\s+['"]boneyard-js\/react['"]/,
      );
    }
  });

  it("does not pass --breakpoints on root donor boneyard scripts", () => {
    const scripts = boneyardBuildScripts(parsePackageJson());
    const donorScripts = Object.entries(scripts).filter(([key]) =>
      key.includes("donor"),
    );

    for (const [name, command] of donorScripts) {
      expect(command, name).not.toMatch(/--breakpoints/);
    }
  });

  it("keeps donor breakpoints in boneyard.config.json only", () => {
    const config = readRepoFile("apps/donor/boneyard.config.json");
    expect(config).toMatch(/"breakpoints"\s*:\s*\[\s*1280\s*\]/);

    const rootScripts = Object.values(
      boneyardBuildScripts(parsePackageJson()),
    ).join("\n");
    expect(rootScripts).not.toMatch(/--breakpoints/);
  });

  it("marks public boneyard capture routes as noindex", () => {
    const captureRoutes = [
      {
        path: "apps/donor/app/boneyard/donor-dashboard/page.tsx",
        label: "donor dashboard",
      },
      {
        path: "apps/admin/app/(auth)/boneyard/contributions/page.tsx",
        label: "admin contributions",
      },
      {
        path: "apps/missionary/app/boneyard/tasks/layout.tsx",
        label: "missionary tasks layout",
      },
    ];

    for (const { path, label } of captureRoutes) {
      expectsNoindexRobots(readRepoFile(path), label);
    }
  });

  it("renders public boneyard capture routes in snapshot mode", () => {
    const captureRoutes = [
      "apps/donor/app/boneyard/donor-dashboard/page-client.tsx",
      "apps/admin/app/(auth)/boneyard/contributions/page-client.tsx",
      "apps/missionary/app/boneyard/tasks/page-client.tsx",
    ];

    for (const path of captureRoutes) {
      const source = readRepoFile(path);

      expect(source, path).toContain("<BoneyardSkeleton");
      expect(
        source,
        `${path}: capture route must expose fixture content`,
      ).toMatch(/loading=\{false\}/);
      expect(
        source,
        `${path}: capture route must not render an empty shell`,
      ).not.toMatch(/loading=\{true\}/);
    }
  });
});
