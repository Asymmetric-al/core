import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { parseBunLock } from "../../../scripts/verify/bun-lock-drift.mjs";

const repoRoot = process.cwd();

/** Official stable pin verified from GitHub `bun-v1.4.0` and npm `bun@latest`. */
const VERIFIED_STABLE_BUN = "1.4.0";

const WORKFLOW_DIR = path.join(repoRoot, ".github", "workflows");

function readPackageJson(): {
  packageManager?: string;
  devDependencies?: Record<string, string>;
} {
  return JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
}

function bunVersionFromPackageManager(
  packageManager: string | undefined,
): string {
  expect(packageManager, "package.json packageManager").toMatch(/^bun@.+$/);
  const version = packageManager!.slice("bun@".length);
  expect(version).not.toMatch(/canary/i);
  return version;
}

describe("Bun toolchain pin sync", () => {
  const packageJson = readPackageJson();
  const packageManagerVersion = bunVersionFromPackageManager(
    packageJson.packageManager,
  );

  it("pins the verified stable Bun 1.4.x release, never canary", () => {
    expect(packageJson.packageManager).toBe(`bun@${VERIFIED_STABLE_BUN}`);
    expect(packageManagerVersion).toBe(VERIFIED_STABLE_BUN);
    expect(packageManagerVersion.startsWith("1.4.")).toBe(true);
  });

  it("keeps .bun-version in lockstep with packageManager", () => {
    const bunVersionPath = path.join(repoRoot, ".bun-version");
    expect(existsSync(bunVersionPath), ".bun-version exists").toBe(true);
    const bunVersion = readFileSync(bunVersionPath, "utf8").trim();
    expect(bunVersion).toBe(packageManagerVersion);
  });

  it("keeps every first-party GitHub Actions BUN_VERSION on the same pin", () => {
    const workflowFiles = readdirSync(WORKFLOW_DIR).filter((name) =>
      name.endsWith(".yml"),
    );
    const bunPins: string[] = [];

    for (const fileName of workflowFiles) {
      const workflow = readFileSync(path.join(WORKFLOW_DIR, fileName), "utf8");
      const matches = [...workflow.matchAll(/^\s*BUN_VERSION:\s*"([^"]+)"/gm)];
      for (const match of matches) {
        bunPins.push(`${fileName}:${match[1]}`);
        expect(match[1], fileName).toBe(packageManagerVersion);
      }

      if (workflow.includes("oven-sh/setup-bun")) {
        expect(workflow, fileName).toContain(
          "bun-version: ${{ env.BUN_VERSION }}",
        );
        expect(
          matches.length,
          `${fileName} declares BUN_VERSION`,
        ).toBeGreaterThan(0);
      }
    }

    expect(bunPins.length).toBeGreaterThan(0);
  });

  it("keeps bun.lock at lockfileVersion 1 for the installed Turborepo parser", () => {
    const lock = parseBunLock(
      readFileSync(path.join(repoRoot, "bun.lock"), "utf8"),
    ) as {
      lockfileVersion?: number;
      configVersion?: number;
    };

    // Turborepo 2.10.x parses bun lockfile versions 0 and 1 only.
    // If Bun rewrites this file to 2 or 3, fail here until `turbo prune`
    // proves the installed turbo can read it — do not guess from a changelog.
    expect([0, 1]).toContain(lock.lockfileVersion);
    expect(lock.lockfileVersion).toBe(1);
    expect(lock.configVersion).toBe(1);
    expect(packageJson.devDependencies?.turbo, "root turbo pin").toMatch(
      /^\d+\.\d+\.\d+$/,
    );
  });
});
