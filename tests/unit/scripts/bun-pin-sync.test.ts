import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  collectGitHubWorkflowBunPinDrift,
  isGitHubWorkflowFile,
  readExpectedVersion,
} from "../../../scripts/verify/bun-version.mjs";

const fixtureRoots = new Set<string>();

afterEach(() => {
  for (const root of fixtureRoots) {
    rmSync(root, { recursive: true, force: true });
  }
  fixtureRoots.clear();
});

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
  fixtureRoots.add(dir);
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

function writeIsolatedWorkflow(
  repoRoot: string,
  bunVersion: string,
  fileName = "ci.yml",
) {
  const workflowDir = path.join(repoRoot, ".github", "workflows");
  mkdirSync(workflowDir, { recursive: true });
  writeFileSync(
    path.join(workflowDir, fileName),
    [
      "name: ci",
      "on: push",
      "env:",
      `  BUN_VERSION: "${bunVersion}"`,
      "jobs:",
      "  check:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: oven-sh/setup-bun@v2",
      "        with:",
      "          bun-version: ${{ env.BUN_VERSION }}",
      "",
    ].join("\n"),
  );
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
    const workflowFiles =
      readdirSync(WORKFLOW_DIR).filter(isGitHubWorkflowFile);
    const bunPins: string[] = [];

    for (const fileName of workflowFiles) {
      const workflow = readFileSync(path.join(WORKFLOW_DIR, fileName), "utf8");
      const matches = [...workflow.matchAll(/^\s*BUN_VERSION:\s*"([^"]+)"/gm)];
      for (const match of matches) {
        bunPins.push(`${fileName}:${match[1]}`);
      }
    }

    expect(bunPins.length).toBeGreaterThan(0);
    expect(
      collectGitHubWorkflowBunPinDrift(repoRoot, VERIFIED_STABLE_BUN),
    ).toEqual([]);
  });

  it("pins every oven-sh/setup-bun step to env.BUN_VERSION", () => {
    const workflowFiles =
      readdirSync(WORKFLOW_DIR).filter(isGitHubWorkflowFile);
    let scannedWorkflows = 0;

    for (const fileName of workflowFiles) {
      const workflow = readFileSync(path.join(WORKFLOW_DIR, fileName), "utf8");
      const setupBunCount = countMatches(
        workflow,
        /uses:\s*oven-sh\/setup-bun@/g,
      );
      if (setupBunCount === 0) {
        continue;
      }

      scannedWorkflows += 1;
    }

    expect(scannedWorkflows).toBeGreaterThan(0);
    expect(
      collectGitHubWorkflowBunPinDrift(repoRoot, VERIFIED_STABLE_BUN),
    ).toEqual([]);
    expect(isGitHubWorkflowFile("ci.yml")).toBe(true);
    expect(isGitHubWorkflowFile("ci.yaml")).toBe(true);
    expect(isGitHubWorkflowFile("README.md")).toBe(false);
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
        `bunx bun@${VERIFIED_STABLE_BUN} install --cwd ../.. --frozen-lockfile`,
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

  it("reports a mismatched GitHub workflow BUN_VERSION before the process check", () => {
    const root = writePinFixture({
      packageManager: "bun@1.4.0",
      bunVersion: "1.4.0",
    });
    try {
      writeIsolatedWorkflow(root, "9.9.9", "ci.yaml");

      expect(collectGitHubWorkflowBunPinDrift(root, "1.4.0")).toEqual([
        "ci.yaml BUN_VERSION is 9.9.9, expected 1.4.0",
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("does not require workflow files when the fixture has none", () => {
    const root = writePinFixture({
      packageManager: "bun@1.4.0",
      bunVersion: "1.4.0",
    });
    try {
      expect(collectGitHubWorkflowBunPinDrift(root, "1.4.0")).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("workflow setup-bun step ownership", () => {
  function drift(source: string) {
    const root = writePinFixture({
      packageManager: "bun@1.4.0",
      bunVersion: "1.4.0",
    });
    try {
      mkdirSync(path.join(root, ".github", "workflows"), { recursive: true });
      writeFileSync(path.join(root, ".github", "workflows", "ci.yml"), source);
      return collectGitHubWorkflowBunPinDrift(root, "1.4.0");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  const prefix =
    'env:\n  BUN_VERSION: "1.4.0"\njobs:\n  check:\n    runs-on: ubuntu-latest\n';
  const pinnedStep =
    "      - uses: oven-sh/setup-bun@v2\n        with:\n          bun-version: ${{ env.BUN_VERSION }}\n";
  const badStep =
    '      - uses: oven-sh/setup-bun@v2\n        with:\n          bun-version: "9.9.9"\n';

  it("rejects a wrong setup pin masked by a commented env pin", () => {
    expect(
      drift(
        prefix +
          "    steps:\n" +
          badStep +
          "# bun-version: ${{ env.BUN_VERSION }}\n",
      ),
    ).not.toEqual([]);
  });

  it("rejects a wrong setup pin masked by an unrelated action input", () => {
    expect(
      drift(
        prefix +
          "    steps:\n" +
          badStep +
          "      - uses: example/action@v1\n        with:\n          bun-version: ${{ env.BUN_VERSION }}\n",
      ),
    ).not.toEqual([]);
  });

  it("does not take another job's BUN_VERSION as the setup job's environment", () => {
    expect(
      drift(
        'jobs:\n  unrelated:\n    env:\n      BUN_VERSION: "1.4.0"\n    runs-on: ubuntu-latest\n    steps: []\n  check:\n    runs-on: ubuntu-latest\n    steps:\n' +
          pinnedStep,
      ),
    ).not.toEqual([]);
  });

  it("rejects a shadowing job environment with a different quoted pin", () => {
    expect(
      drift(
        prefix +
          "    env:\n      BUN_VERSION: '9.9.9'\n    steps:\n" +
          pinnedStep,
      ),
    ).not.toEqual([]);
  });

  it("rejects a shadowing setup-step environment with a different unquoted pin", () => {
    expect(
      drift(
        prefix +
          "    steps:\n" +
          pinnedStep +
          "        env:\n          BUN_VERSION: 9.9.9\n",
      ),
    ).not.toEqual([]);
  });

  it("checks quoted action references rather than skipping their setup step", () => {
    expect(
      drift(
        prefix +
          "    steps:\n" +
          badStep.replace("oven-sh/setup-bun@v2", '"oven-sh/setup-bun@v2"'),
      ),
    ).not.toEqual([]);
  });

  it("checks every setup step even when a comment balances the old counts", () => {
    expect(
      drift(
        prefix +
          "    steps:\n" +
          pinnedStep +
          badStep +
          "# bun-version: ${{ env.BUN_VERSION }}\n",
      ),
    ).not.toEqual([]);
  });

  it("does not read a run-script string as an environment declaration", () => {
    expect(
      drift(
        'jobs:\n  check:\n    runs-on: ubuntu-latest\n    steps:\n      - run: |\n          BUN_VERSION: "1.4.0"\n' +
          pinnedStep,
      ),
    ).not.toEqual([]);
  });

  it.each(["'1.4.0'", "1.4.0"])(
    "accepts a canonical YAML scalar pin %s",
    (value) => {
      expect(
        drift(prefix.replace('"1.4.0"', value) + "    steps:\n" + pinnedStep),
      ).toEqual([]);
    },
  );

  it("accepts correctly scoped job and step env indirection", () => {
    expect(
      drift(
        'jobs:\n  check:\n    runs-on: ubuntu-latest\n    env:\n      BUN_VERSION: "1.4.0"\n    steps:\n' +
          pinnedStep +
          '        env:\n          BUN_VERSION: "1.4.0"\n',
      ),
    ).toEqual([]);
  });

  it("supports YAML aliases for the workflow environment", () => {
    expect(
      drift(
        prefix.replace("env:", "env: &toolchain") +
          "    env: *toolchain\n    steps:\n" +
          pinnedStep,
      ),
    ).toEqual([]);
  });

  it("fails closed for malformed workflow YAML", () => {
    expect(drift("jobs: [\n")).not.toEqual([]);
  });
});

describe("bun-version.mjs CLI", () => {
  it("validates workflow pins before dependency installation", () => {
    const { repoRoot, scriptPath } = writeIsolatedVerifier({
      packageManager: "bun@1.4.0",
      bunVersion: "1.4.0",
    });
    try {
      rmSync(path.join(repoRoot, "node_modules"), {
        recursive: true,
        force: true,
      });
      writeIsolatedWorkflow(repoRoot, "1.4.0");

      const result = spawnVerifier(scriptPath);

      expect(result.stderr).toBe("");
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("Bun version OK: bun@1.4.0");
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

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

      try {
        const result = spawnVerifier(linkPath);

        expect(result.status).toBe(0);
        expect(result.stdout).toContain(
          `Bun version OK: bun@${VERIFIED_STABLE_BUN}`,
        );
        expect(result.stdout).not.toBe("");
      } finally {
        unlinkSync(linkPath);
      }
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

  it("exits 2 when an isolated workflow BUN_VERSION disagrees with the package pin", () => {
    const { repoRoot, scriptPath } = writeIsolatedVerifier({
      packageManager: "bun@1.4.0",
      bunVersion: "1.4.0",
    });
    try {
      writeIsolatedWorkflow(repoRoot, "9.9.9");

      const result = spawnVerifier(scriptPath);

      expect(result.status).toBe(2);
      expect(result.stderr).toContain("9.9.9");
      expect(result.stderr).toMatch(/workflow|BUN_VERSION/i);
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});
