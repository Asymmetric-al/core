import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const PRODUCTION_SCRIPT = path.join(
  REPO_ROOT,
  "scripts/release/production.mjs",
);

const FAKE_GH = `#!/usr/bin/env node
const isList = process.argv.slice(2).some((arg) => arg.includes("/issues"));
if (!isList) {
  process.stdout.write('{"name":"release-blocker"}');
}
process.exit(0);
`;

const FAKE_BUN = `#!/usr/bin/env node
console.log("FAKE_BUN " + process.argv.slice(2).join(" "));
`;

function which(name: string): string {
  for (const dir of (process.env.PATH ?? "").split(path.delimiter)) {
    const candidate = path.join(dir, name);
    if (dir && existsSync(candidate)) return candidate;
  }
  throw new Error(`${name} not found on PATH`);
}

function cleanEnv(extra: Record<string, string>): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (
      value !== undefined &&
      !key.startsWith("GIT_") &&
      !key.startsWith("ASYM_")
    ) {
      env[key] = value;
    }
  }
  return { ...env, ...extra };
}

function dataBlock(content: string): string {
  return `data ${Buffer.byteLength(content, "utf8")}\n${content}`;
}

interface FixtureOptions {
  productionPaths: string[];
  developPaths: Array<{ path: string; mark: string }>;
}

const roots: string[] = [];

function createReleaseSandbox({
  productionPaths,
  developPaths,
}: FixtureOptions) {
  const root = mkdtempSync(path.join(tmpdir(), "release-large-diff-"));
  roots.push(root);
  const bin = path.join(root, "bin");
  const work = path.join(root, "work");
  const origin = path.join(root, "origin.git");
  mkdirSync(bin);
  mkdirSync(work);

  symlinkSync(which("git"), path.join(bin, "git"));
  symlinkSync(process.execPath, path.join(bin, "node"));
  writeFileSync(path.join(bin, "bun"), FAKE_BUN);
  chmodSync(path.join(bin, "bun"), 0o755);
  writeFileSync(path.join(bin, "gh"), FAKE_GH);
  chmodSync(path.join(bin, "gh"), 0o755);

  const env = cleanEnv({
    PATH: bin,
    HOME: root,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: path.join(root, "gitconfig"),
  });

  const git = (cwd: string, args: string[], input?: string) => {
    const result = spawnSync("git", args, {
      cwd,
      env,
      encoding: "utf8",
      input,
      maxBuffer: 16 * 1024 * 1024,
    });
    if (result.error) {
      throw result.error;
    }
    if (result.status !== 0) {
      throw new Error(`git ${args.join(" ")}: ${result.stderr}`);
    }
    return result.stdout.trim();
  };

  git(root, ["init", "-q", "--bare", origin]);
  git(work, ["init", "-q", "-b", "production"]);

  const streamLines = [
    "blob",
    "mark :1",
    dataBlock("archive-fixture-payload\n"),
    "blob",
    "mark :2",
    dataBlock('export const releaseFixture = "before";\n'),
    "blob",
    "mark :3",
    dataBlock('export const releaseFixture = "after";\n'),
    "commit refs/heads/production",
    "mark :10",
    "committer Test <test@example.invalid> 1700000000 +0000",
    dataBlock("production baseline\n"),
    ...productionPaths.map((filePath) =>
      filePath.startsWith("apps/")
        ? `M 100644 :2 ${filePath}`
        : `M 100644 :1 ${filePath}`,
    ),
    "",
    "commit refs/heads/develop",
    "mark :11",
    "committer Test <test@example.invalid> 1700000001 +0000",
    dataBlock("develop release candidate\n"),
    "from :10",
    "deleteall",
    ...developPaths.map(
      ({ path: filePath, mark }) => `M 100644 ${mark} ${filePath}`,
    ),
    "",
    "done",
    "",
  ];

  git(work, ["fast-import", "--quiet"], streamLines.join("\n"));
  git(work, ["checkout", "-q", "develop"]);
  git(work, ["remote", "add", "origin", origin]);
  git(work, ["push", "-q", "origin", "production", "develop"]);
  const productionBefore = git(origin, ["rev-parse", "production"]);

  return {
    runDryRun() {
      const result = spawnSync(
        process.execPath,
        [PRODUCTION_SCRIPT, "--dry-run"],
        {
          cwd: work,
          env,
          encoding: "utf8",
          timeout: 60_000,
        },
      );
      return {
        status: result.status,
        stdout: result.stdout ?? "",
        stderr: result.stderr ?? "",
        output: `${result.stdout ?? ""}\n${result.stderr ?? ""}`,
      };
    },
    productionMoved: () =>
      git(origin, ["rev-parse", "production"]) !== productionBefore,
  };
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("production release large diff handling", () => {
  it("completes a dry-run release when changed files since production exceed 1 MiB", () => {
    const longSegment = "segment-".repeat(16);
    const archivedPaths = Array.from(
      { length: 8_000 },
      (_, index) =>
        `docs/large-release/${longSegment}/file-${String(index).padStart(5, "0")}.txt`,
    );
    const appPath = "apps/admin/app/page.tsx";
    const expectedDiffBytes = [...archivedPaths, appPath].reduce(
      (total, filePath) => total + Buffer.byteLength(filePath, "utf8") + 1,
      0,
    );
    expect(expectedDiffBytes).toBeGreaterThan(1024 * 1024);

    const sandbox = createReleaseSandbox({
      productionPaths: [appPath, ...archivedPaths],
      developPaths: [{ path: appPath, mark: ":3" }],
    });

    const result = sandbox.runDryRun();

    expect(result.status, result.output).toBe(0);
    expect(result.stdout).toContain("# Production Release Summary");
    expect(result.stdout).toContain(
      `Changed files since origin/production: ${archivedPaths.length + 1}`,
    );
    expect(result.stdout).toContain(
      `- admin: build - changed app file: ${appPath} (${appPath})`,
    );
    expect(result.stdout).toContain(
      "- donor: skip - changed files do not affect this Vercel app",
    );
    expect(result.stdout).toContain(
      "- missionary: skip - changed files do not affect this Vercel app",
    );
    expect(result.stdout).toContain(
      "==> dry run: git push origin HEAD:production",
    );
    expect(sandbox.productionMoved()).toBe(false);
  });

  it("passes unquoted non-ASCII changed paths to deployment impact resolution", () => {
    const nonAsciiPath = "apps/donor/docs/caf\u00e9.md";
    const sandbox = createReleaseSandbox({
      productionPaths: [nonAsciiPath],
      developPaths: [{ path: nonAsciiPath, mark: ":3" }],
    });

    const result = sandbox.runDryRun();

    expect(result.status, result.output).toBe(0);
    expect(result.stdout).toContain("Changed files since origin/production: 1");
    expect(result.stdout).toContain(
      `- donor: build - changed app file: ${nonAsciiPath} (${nonAsciiPath})`,
    );
    expect(result.stdout).toContain(
      "==> dry run: git push origin HEAD:production",
    );
    expect(sandbox.productionMoved()).toBe(false);
  });
});
