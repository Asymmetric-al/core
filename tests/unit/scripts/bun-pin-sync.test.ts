import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { readExpectedVersion } from "../../../scripts/verify/bun-version.mjs";

const repoRoot = process.cwd();
const verifierSourcePath = path.join(
  repoRoot,
  "scripts",
  "verify",
  "bun-version.mjs",
);

/** Official stable pin verified from GitHub `bun-v1.4.0` and npm `bun@latest`. */
const VERIFIED_STABLE_BUN = "1.4.0";
const PINNED_TURBO = "2.10.0";

const WORKFLOW_DIR = path.join(repoRoot, ".github", "workflows");
const FIRST_PARTY_SETUP_BUN_WORKFLOWS = [
  "ci.yml",
  "ci-integration.yml",
  "qa-smoke-preview-deploy.yml",
] as const;

function readPackageJson(): {
  packageManager?: string;
  devDependencies?: Record<string, string>;
} {
  return JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
}

function countMatches(source: string, pattern: RegExp): number {
  return source.match(pattern)?.length ?? 0;
}

function writePinFixture(options: {
  packageManager: string;
  bunVersion?: string | null;
}): string {
  const dir = mkdtempSync(path.join(tmpdir(), "bun-version-mjs-"));
  writeFileSync(
    path.join(dir, "package.json"),
    `${JSON.stringify({ packageManager: options.packageManager }, null, 2)}\n`,
  );

  if (options.bunVersion !== null && options.bunVersion !== undefined) {
    writeFileSync(path.join(dir, ".bun-version"), `${options.bunVersion}\n`);
  }

  return dir;
}

function writeIsolatedVerifier(options: {
  packageManager: string;
  bunVersion?: string | null;
}): { repoRoot: string; scriptPath: string } {
  const isolatedRoot = writePinFixture(options);
  const scriptDir = path.join(isolatedRoot, "scripts", "verify");
  mkdirSync(scriptDir, { recursive: true });
  const scriptPath = path.join(scriptDir, "bun-version.mjs");
  copyFileSync(verifierSourcePath, scriptPath);
  return { repoRoot: isolatedRoot, scriptPath };
}

function spawnVerifier(scriptPath: string, env?: NodeJS.ProcessEnv) {
  return spawnSync(process.execPath, [scriptPath], {
    encoding: "utf8",
    env: env ? { ...process.env, ...env } : process.env,
  });
}

describe("Bun toolchain pin sync", () => {
  const packageJson = readPackageJson();

  it("readExpectedVersion returns the verified stable pin", () => {
    expect(readExpectedVersion(repoRoot)).toBe(VERIFIED_STABLE_BUN);
    expect(packageJson.packageManager).toBe(`bun@${VERIFIED_STABLE_BUN}`);
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
        expect(match[1], fileName).toBe(VERIFIED_STABLE_BUN);
      }
    }

    expect(bunPins.length).toBeGreaterThan(0);
  });

  it("pins every oven-sh/setup-bun step to env.BUN_VERSION", () => {
    for (const fileName of FIRST_PARTY_SETUP_BUN_WORKFLOWS) {
      const workflow = readFileSync(path.join(WORKFLOW_DIR, fileName), "utf8");
      const setupBunCount = countMatches(
        workflow,
        /uses:\s*oven-sh\/setup-bun@/g,
      );
      const envPinnedCount = countMatches(
        workflow,
        /bun-version:\s*\$\{\{\s*env\.BUN_VERSION\s*\}\}/g,
      );

      expect(setupBunCount, fileName).toBeGreaterThan(0);
      expect(envPinnedCount, `${fileName} env.BUN_VERSION pins`).toBe(
        setupBunCount,
      );
    }
  });

  it("keeps first-party Vercel apps on the Node Functions runtime", () => {
    const appRoots = ["admin", "donor", "missionary"] as const;

    for (const app of appRoots) {
      const vercelConfig = JSON.parse(
        readFileSync(path.join(repoRoot, "apps", app, "vercel.json"), "utf8"),
      ) as {
        bunVersion?: string;
        installCommand?: string | null;
        buildCommand?: string | null;
      };

      const buildCommand = vercelConfig.buildCommand ?? "";

      expect(
        vercelConfig.bunVersion,
        `${app} vercel.json bunVersion (Functions runtime opt-in)`,
      ).toBeUndefined();
      expect(vercelConfig.installCommand, `${app} installCommand`).toBe(
        "bun install --cwd ../.. --frozen-lockfile",
      );
      expect(vercelConfig.installCommand).not.toContain("--save-text-lockfile");
      expect(buildCommand, `${app} buildCommand`).not.toMatch(/--bun\b/);

      const appPackage = JSON.parse(
        readFileSync(path.join(repoRoot, "apps", app, "package.json"), "utf8"),
      ) as { scripts?: Record<string, string> };

      for (const scriptName of ["dev", "build", "start"] as const) {
        const script = appPackage.scripts?.[scriptName] ?? "";
        expect(script, `${app} scripts.${scriptName}`).not.toMatch(/--bun\b/);
        expect(script, `${app} scripts.${scriptName}`).toMatch(/^next /);
      }
    }
  });

  it("keeps the installed Turborepo pin at the lockfile v1 parser", () => {
    expect(packageJson.devDependencies?.turbo).toBe(PINNED_TURBO);
  });
});

describe("bun-version.mjs pin contract", () => {
  it("accepts a matching stable pin", () => {
    const root = writePinFixture({
      packageManager: "bun@1.4.0",
      bunVersion: "1.4.0",
    });

    expect(readExpectedVersion(root)).toBe("1.4.0");
  });

  it("accepts a matching pin that used a leading v", () => {
    const root = writePinFixture({
      packageManager: "bun@v1.4.0",
      bunVersion: "v1.4.0",
    });

    expect(readExpectedVersion(root)).toBe("1.4.0");
  });

  it("rejects a canary packageManager pin", () => {
    const root = writePinFixture({
      packageManager: "bun@1.4.0-canary.20260820.1",
      bunVersion: "1.4.0-canary.20260820.1",
    });

    expect(() => readExpectedVersion(root)).toThrow(/stable bun@x\.y\.z/);
  });

  it("rejects an rc packageManager pin", () => {
    const root = writePinFixture({
      packageManager: "bun@1.4.0-rc.1",
      bunVersion: "1.4.0-rc.1",
    });

    expect(() => readExpectedVersion(root)).toThrow(/stable bun@x\.y\.z/);
  });

  it("rejects a beta packageManager pin", () => {
    const root = writePinFixture({
      packageManager: "bun@1.4.0-beta.1",
      bunVersion: "1.4.0-beta.1",
    });

    expect(() => readExpectedVersion(root)).toThrow(/stable bun@x\.y\.z/);
  });

  it("rejects a missing .bun-version file", () => {
    const root = writePinFixture({
      packageManager: "bun@1.4.0",
      bunVersion: null,
    });

    expect(() => readExpectedVersion(root)).toThrow(/missing \.bun-version/);
  });

  it("rejects a .bun-version that does not match packageManager", () => {
    const root = writePinFixture({
      packageManager: "bun@1.4.0",
      bunVersion: "1.3.14",
    });

    expect(() => readExpectedVersion(root)).toThrow(
      /\.bun-version \(1\.3\.14\) does not match packageManager bun@1\.4\.0/,
    );
  });
});

describe("bun-version.mjs CLI", () => {
  it("exits 0 when invoked with the real script path and matching pins", () => {
    const result = spawnVerifier(verifierSourcePath);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      `Bun version OK: bun@${VERIFIED_STABLE_BUN}`,
    );
  });

  it.skipIf(process.platform === "win32")(
    "still runs main when invoked through a symlink",
    () => {
      const linkPath = path.join(
        tmpdir(),
        `bun-version-link-${Date.now()}.mjs`,
      );
      symlinkSync(verifierSourcePath, linkPath);

      const result = spawnVerifier(linkPath);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        `Bun version OK: bun@${VERIFIED_STABLE_BUN}`,
      );
      expect(result.stdout).not.toBe("");
    },
  );

  it("exits 2 when the isolated pin files are not a stable x.y.z", () => {
    const { scriptPath } = writeIsolatedVerifier({
      packageManager: "bun@1.4.0-rc.1",
      bunVersion: "1.4.0-rc.1",
    });

    const result = spawnVerifier(scriptPath);

    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/stable bun@x\.y\.z/);
  });

  it("exits 1 when an isolated matching pin disagrees with installed Bun", () => {
    const { scriptPath } = writeIsolatedVerifier({
      packageManager: "bun@0.0.1",
      bunVersion: "0.0.1",
    });

    const result = spawnVerifier(scriptPath);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("error: Bun version mismatch.");
  });
});
