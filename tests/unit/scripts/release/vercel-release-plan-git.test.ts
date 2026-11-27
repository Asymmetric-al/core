import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import { forbidNetwork } from "./support/vercel-release-fixtures";
import {
  PRODUCTION_HOSTS,
  runCli,
  selectReleaseApps,
} from "../../../../scripts/release/vercel-release.mjs";

forbidNetwork();

describe("release job: Vercel steps", () => {
  it("plan CLI reads git file lists larger than 1 MiB and non-ASCII paths without misreporting ancestry", async () => {
    const dir = mkdtempSync(
      path.join(os.tmpdir(), "vercel-release-large-plan-"),
    );
    const previousCwd = process.cwd();
    try {
      const gitEnv: Record<string, string> = {};
      for (const [key, value] of Object.entries(process.env)) {
        if (value !== undefined && !key.startsWith("GIT_")) {
          gitEnv[key] = value;
        }
      }
      gitEnv.GIT_CONFIG_NOSYSTEM = "1";
      gitEnv.GIT_CONFIG_GLOBAL = path.join(dir, "gitconfig");

      const git = (args: string[], input?: string) => {
        const result = spawnSync("git", args, {
          cwd: dir,
          env: gitEnv,
          encoding: "utf8",
          input,
          maxBuffer: 16 * 1024 * 1024,
        });
        if (result.error) throw result.error;
        if (result.status !== 0) {
          throw new Error(`git ${args.join(" ")}: ${result.stderr}`);
        }
        return result.stdout.trim();
      };

      const dataBlock = (content: string) =>
        `data ${Buffer.byteLength(content, "utf8")}\n${content}`;

      const longSegment = "segment-".repeat(16);
      const docsPaths = Array.from(
        { length: 8_000 },
        (_, index) =>
          `docs/large-release/${longSegment}/file-${String(index).padStart(5, "0")}.txt`,
      );
      const adminPath = "apps/admin/app/caf\u00e9-page.tsx";
      const expectedDiffBytes = [...docsPaths, adminPath].reduce(
        (total, filePath) => total + Buffer.byteLength(filePath, "utf8") + 1,
        0,
      );
      expect(expectedDiffBytes).toBeGreaterThan(1024 * 1024);

      git(["init", "-q", "-b", "production"]);
      const streamLines = [
        "blob",
        "mark :1",
        dataBlock("fixture-doc\n"),
        "blob",
        "mark :2",
        dataBlock('export const page = "before";\n'),
        "blob",
        "mark :3",
        dataBlock('export const page = "after";\n'),
        "commit refs/heads/production",
        "mark :10",
        "committer Test <test@example.invalid> 1700000000 +0000",
        dataBlock("live baseline\n"),
        `M 100644 :2 ${adminPath}`,
        ...docsPaths.map((filePath) => `M 100644 :1 ${filePath}`),
        "",
        "commit refs/heads/release",
        "mark :11",
        "committer Test <test@example.invalid> 1700000001 +0000",
        dataBlock("release head\n"),
        "from :10",
        "deleteall",
        `M 100644 :3 ${adminPath}`,
        "",
        "commit refs/heads/diverged",
        "mark :12",
        "committer Test <test@example.invalid> 1700000002 +0000",
        dataBlock("diverged branch\n"),
        "M 100644 :1 docs/diverged.md",
        "",
        "done",
        "",
      ];
      git(["fast-import", "--quiet"], streamLines.join("\n"));

      const liveSha = git(["rev-parse", "refs/heads/production"]);
      const releaseHeadSha = git(["rev-parse", "refs/heads/release"]);
      const divergedSha = git(["rev-parse", "refs/heads/diverged"]);

      const outputFile = path.join(dir, "github-output");
      const logs: string[] = [];
      const liveByHost: Record<string, string> = {
        [PRODUCTION_HOSTS.admin]: liveSha,
        [PRODUCTION_HOSTS.donor]: liveSha,
        [PRODUCTION_HOSTS.missionary]: divergedSha,
      };
      const request = vi.fn(async (input: URL | string) => {
        const host = new URL(String(input)).host;
        return {
          status: 200,
          json: async () => ({
            status: "ok",
            release: { commit: liveByHost[host] },
          }),
        } as Response;
      });

      process.chdir(dir);
      await runCli(
        ["plan"],
        { RELEASE_SHA: releaseHeadSha, GITHUB_OUTPUT: outputFile },
        (line: string) => logs.push(line),
        { request: request as unknown as typeof fetch },
      );

      expect(readFileSync(outputFile, "utf8")).toBe("apps=admin,missionary\n");
      expect(logs).toEqual([
        `admin: build - changed app file: ${adminPath} [deploymentId=unreported serveUnderPaths=absent]`,
        "donor: skip - changed files do not affect this Vercel app [deploymentId=unreported serveUnderPaths=absent]",
        "missionary: build - live commit is not an ancestor [deploymentId=unreported serveUnderPaths=absent]",
      ]);
    } finally {
      process.chdir(previousCwd);
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("plan CLI selects an app when a file is moved out of its directory into docs", async () => {
    const dir = mkdtempSync(
      path.join(os.tmpdir(), "vercel-release-rename-plan-"),
    );
    const previousCwd = process.cwd();
    try {
      const gitEnv: Record<string, string> = {};
      for (const [key, value] of Object.entries(process.env)) {
        if (value !== undefined && !key.startsWith("GIT_")) {
          gitEnv[key] = value;
        }
      }
      gitEnv.GIT_CONFIG_NOSYSTEM = "1";
      gitEnv.GIT_CONFIG_GLOBAL = path.join(dir, "gitconfig");

      const git = (args: string[], input?: string) => {
        const result = spawnSync("git", args, {
          cwd: dir,
          env: gitEnv,
          encoding: "utf8",
          input,
        });
        if (result.error) throw result.error;
        if (result.status !== 0) {
          throw new Error(`git ${args.join(" ")}: ${result.stderr}`);
        }
        return result.stdout.trim();
      };

      const dataBlock = (content: string) =>
        `data ${Buffer.byteLength(content, "utf8")}\n${content}`;

      git(["init", "-q", "-b", "production"]);
      const streamLines = [
        "blob",
        "mark :1",
        dataBlock(
          "export const movedFixture = 'identical content for rename detection';\n",
        ),
        "commit refs/heads/production",
        "mark :10",
        "committer Test <test@example.invalid> 1700000000 +0000",
        dataBlock("live baseline\n"),
        "M 100644 :1 apps/admin/app/moved-note.ts",
        "",
        "commit refs/heads/release",
        "mark :11",
        "committer Test <test@example.invalid> 1700000001 +0000",
        dataBlock("move file out of admin into docs\n"),
        "from :10",
        "deleteall",
        "M 100644 :1 docs/moved-note.ts",
        "",
        "done",
        "",
      ];
      git(["fast-import", "--quiet"], streamLines.join("\n"));

      const liveSha = git(["rev-parse", "refs/heads/production"]);
      const releaseHeadSha = git(["rev-parse", "refs/heads/release"]);

      const outputFile = path.join(dir, "github-output");
      const logs: string[] = [];
      const request = vi.fn(async () => ({
        status: 200,
        json: async () => ({
          status: "ok",
          release: { commit: liveSha },
        }),
      }));

      process.chdir(dir);
      await runCli(
        ["plan"],
        { RELEASE_SHA: releaseHeadSha, GITHUB_OUTPUT: outputFile },
        (line: string) => logs.push(line),
        { request: request as unknown as typeof fetch },
      );

      expect(readFileSync(outputFile, "utf8")).toBe("apps=admin\n");
      expect(logs).toEqual([
        "admin: build - changed app file: apps/admin/app/moved-note.ts [deploymentId=unreported serveUnderPaths=absent]",
        "donor: skip - changed files do not affect this Vercel app [deploymentId=unreported serveUnderPaths=absent]",
        "missionary: skip - changed files do not affect this Vercel app [deploymentId=unreported serveUnderPaths=absent]",
      ]);
    } finally {
      process.chdir(previousCwd);
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reports 'could not determine ancestry' on merge-base exit 128 or spawn error while keeping exit 1 as non-ancestor", async () => {
    const missingCommit = "d".repeat(40);
    const divergedPlaceholder = "c".repeat(40);
    const directPlan = selectReleaseApps({
      liveCommits: {
        admin: divergedPlaceholder,
        donor: missingCommit,
        missionary: missingCommit,
      },
      isAncestor: (commit: string) => {
        if (commit === divergedPlaceholder) return false;
        throw new Error("spawnSync git ENOENT");
      },
      listChangedFiles: () => [],
    });
    expect(directPlan).toEqual([
      { app: "admin", build: true, reason: "live commit is not an ancestor" },
      { app: "donor", build: true, reason: "could not determine ancestry" },
      {
        app: "missionary",
        build: true,
        reason: "could not determine ancestry",
      },
    ]);

    const dir = mkdtempSync(
      path.join(os.tmpdir(), "vercel-release-ancestry-plan-"),
    );
    const previousCwd = process.cwd();
    const previousPath = process.env.PATH;
    try {
      const gitEnv: Record<string, string> = {};
      for (const [key, value] of Object.entries(process.env)) {
        if (value !== undefined && !key.startsWith("GIT_")) {
          gitEnv[key] = value;
        }
      }
      gitEnv.GIT_CONFIG_NOSYSTEM = "1";
      gitEnv.GIT_CONFIG_GLOBAL = path.join(dir, "gitconfig");

      const git = (args: string[], input?: string) => {
        const result = spawnSync("git", args, {
          cwd: dir,
          env: gitEnv,
          encoding: "utf8",
          input,
        });
        if (result.error) throw result.error;
        if (result.status !== 0) {
          throw new Error(`git ${args.join(" ")}: ${result.stderr}`);
        }
        return result.stdout.trim();
      };

      const dataBlock = (content: string) =>
        `data ${Buffer.byteLength(content, "utf8")}\n${content}`;

      git(["init", "-q", "-b", "release"]);
      const streamLines = [
        "blob",
        "mark :1",
        dataBlock("release-content\n"),
        "commit refs/heads/release",
        "mark :10",
        "committer Test <test@example.invalid> 1700000000 +0000",
        dataBlock("release head\n"),
        "M 100644 :1 docs/release.md",
        "",
        "commit refs/heads/diverged",
        "mark :11",
        "committer Test <test@example.invalid> 1700000001 +0000",
        dataBlock("diverged branch\n"),
        "M 100644 :1 docs/diverged.md",
        "",
        "done",
        "",
      ];
      git(["fast-import", "--quiet"], streamLines.join("\n"));

      const releaseHeadSha = git(["rev-parse", "refs/heads/release"]);
      const divergedSha = git(["rev-parse", "refs/heads/diverged"]);

      const outputFile = path.join(dir, "github-output");
      const logs: string[] = [];
      const liveByHost: Record<string, string> = {
        [PRODUCTION_HOSTS.admin]: divergedSha,
        [PRODUCTION_HOSTS.donor]: missingCommit,
        [PRODUCTION_HOSTS.missionary]: releaseHeadSha,
      };
      const request = vi.fn(async (input: URL | string) => {
        const host = new URL(String(input)).host;
        return {
          status: 200,
          json: async () => ({
            status: "ok",
            release: { commit: liveByHost[host] },
          }),
        } as Response;
      });

      process.chdir(dir);
      await runCli(
        ["plan"],
        { RELEASE_SHA: releaseHeadSha, GITHUB_OUTPUT: outputFile },
        (line: string) => logs.push(line),
        { request: request as unknown as typeof fetch },
      );

      expect(readFileSync(outputFile, "utf8")).toBe("apps=admin,donor\n");
      expect(logs).toEqual([
        "admin: build - live commit is not an ancestor [deploymentId=unreported serveUnderPaths=absent]",
        "donor: build - could not determine ancestry [deploymentId=unreported serveUnderPaths=absent]",
        "missionary: skip - already serving this commit [deploymentId=unreported serveUnderPaths=absent]",
      ]);

      const spawnErrOutput = path.join(dir, "github-output-spawn-err");
      const spawnErrLogs: string[] = [];
      process.env.PATH = "";
      await runCli(
        ["plan"],
        { RELEASE_SHA: releaseHeadSha, GITHUB_OUTPUT: spawnErrOutput },
        (line: string) => spawnErrLogs.push(line),
        { request: request as unknown as typeof fetch },
      );

      expect(readFileSync(spawnErrOutput, "utf8")).toBe(
        "apps=admin,donor,missionary\n",
      );
      expect(spawnErrLogs).toEqual([
        "admin: build - could not determine ancestry [deploymentId=unreported serveUnderPaths=absent]",
        "donor: build - could not determine ancestry [deploymentId=unreported serveUnderPaths=absent]",
        "missionary: build - could not determine ancestry [deploymentId=unreported serveUnderPaths=absent]",
      ]);
    } finally {
      if (previousPath === undefined) {
        delete process.env.PATH;
      } else {
        process.env.PATH = previousPath;
      }
      process.chdir(previousCwd);
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
