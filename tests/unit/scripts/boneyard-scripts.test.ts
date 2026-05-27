import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = join(import.meta.dirname, "../../..");

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
  expect(source, `${label}: robots.index must be false`).toMatch(
    /index:\s*false/,
  );
  expect(source, `${label}: robots.follow must be false`).toMatch(
    /follow:\s*false/,
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

    expect(buildScripts.length).toBe(6);

    for (const [name, command] of buildScripts) {
      expect(command, name).toMatch(
        /boneyard-js build http:\/\/localhost:(3030|4000|3000)/,
      );
      expect(command, name).not.toMatch(/\/boneyard\//);
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
        path: "apps/admin/app/boneyard/contributions/page.tsx",
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
});
