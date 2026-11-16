// context.ts must read governing files from the recorded commit, never
// through the writable working tree where a writer can plant symlinks to
// host secrets.
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createGit } from "../../../scripts/archon-factory/pack/.shared/git.mjs";
import * as contextLogic from "../../../scripts/archon-factory/pack/deliver/scripts/context-logic.mjs";
import { PROTECTED_GLOBS } from "../../../scripts/archon-factory/pack/deliver/scripts/scope-logic.mjs";

const { collectGoverning, referencedPaths, scopeTask } = contextLogic as Record<
  string,
  any
>;

const gitExecutable =
  process.platform === "win32"
    ? execFileSync("where.exe", ["git.exe"], { encoding: "utf8" })
        .trim()
        .split(/\r?\n/)[0]
    : execFileSync("which", ["git"], { encoding: "utf8" }).trim();

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function repository() {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-boundary-context-")),
  ).replace(/\\/g, "/");
  roots.push(root);
  const repo = `${root}/repo`;
  mkdirSync(`${repo}/docs/ai`, { recursive: true });
  const git = (...args: string[]) =>
    execFileSync(
      gitExecutable,
      ["-c", "core.hooksPath=", "-c", "core.autocrlf=false", ...args],
      {
        cwd: repo,
        encoding: "utf8",
        env: {
          ...process.env,
          GIT_AUTHOR_NAME: "Fixture",
          GIT_AUTHOR_EMAIL: "fixture@example.invalid",
          GIT_COMMITTER_NAME: "Fixture",
          GIT_COMMITTER_EMAIL: "fixture@example.invalid",
        },
      },
    ).trim();
  git("init", "--quiet");
  writeFileSync(`${repo}/AGENTS.md`, "# Committed agents\n");
  writeFileSync(`${repo}/docs/ai/document-authority.md`, "authority\n");
  writeFileSync(`${root}/secret.txt`, "HOST-SECRET\n");
  git("add", ".");
  // A committed symlink entry (mode 120000) whose target is a host secret.
  const target = execFileSync(gitExecutable, ["hash-object", "-w", "--stdin"], {
    cwd: repo,
    input: `${root}/secret.txt`,
    encoding: "utf8",
  }).trim();
  git(
    "update-index",
    "--add",
    "--cacheinfo",
    `120000,${target},docs/linked.md`,
  );
  git("commit", "--quiet", "-m", "base");
  const revision = git("rev-parse", "HEAD");
  return {
    root,
    repo,
    revision,
    git: createGit({ executable: gitExecutable }),
  };
}

describe("collectGoverning", () => {
  it("reads committed content, not a working-tree file a writer replaced", async () => {
    const { repo, revision, git } = repository();
    writeFileSync(`${repo}/AGENTS.md`, "HOST-SECRET copied in\n");

    const { excerpts, sources } = await collectGoverning({
      git,
      repo,
      revision,
      referenced: ["AGENTS.md", "docs/ai/document-authority.md"],
    });

    expect({ excerpts, sources }).toEqual({
      excerpts: [
        "### AGENTS.md\n\n# Committed agents\n",
        "### docs/ai/document-authority.md\n\nauthority\n",
      ],
      sources: [
        { path: "AGENTS.md", bytes: 19, included: true },
        { path: "docs/ai/document-authority.md", bytes: 10, included: true },
      ],
    });
  });

  it.skipIf(process.platform === "win32")(
    "never follows a symlink planted in the working tree",
    async () => {
      const { root, repo, revision, git } = repository();
      rmSync(`${repo}/AGENTS.md`);
      symlinkSync(`${root}/secret.txt`, `${repo}/AGENTS.md`);

      const { excerpts } = await collectGoverning({
        git,
        repo,
        revision,
        referenced: ["AGENTS.md"],
      });

      expect(excerpts.join("")).not.toContain("HOST-SECRET");
    },
  );

  it("skips committed symlinks, escapes and missing files", async () => {
    const { repo, revision, git } = repository();

    const { excerpts, sources } = await collectGoverning({
      git,
      repo,
      revision,
      referenced: [
        "docs/linked.md",
        "docs/../../secret.txt",
        "docs/missing.md",
      ],
    });

    expect({ excerpts, sources }).toEqual({
      excerpts: [],
      sources: [
        { path: "docs/linked.md", bytes: 0, included: false },
        { path: "docs/../../secret.txt", bytes: 0, included: false },
        { path: "docs/missing.md", bytes: 0, included: false },
      ],
    });
  });

  it("includes nothing when there is no recorded revision", async () => {
    const { repo, git } = repository();
    const { excerpts, sources } = await collectGoverning({
      git,
      repo,
      revision: null,
      referenced: ["AGENTS.md"],
    });
    expect({ excerpts, sources }).toEqual({
      excerpts: [],
      sources: [{ path: "AGENTS.md", bytes: 0, included: false }],
    });
  });

  it("stops including files once the budget is spent", async () => {
    const { repo, revision, git } = repository();
    const { sources } = await collectGoverning({
      git,
      repo,
      revision,
      referenced: ["AGENTS.md", "docs/ai/document-authority.md"],
      budget: 20,
    });
    expect(sources).toEqual([
      { path: "AGENTS.md", bytes: 19, included: true },
      { path: "docs/ai/document-authority.md", bytes: 10, included: false },
    ]);
  });
});

describe("referencedPaths", () => {
  it("always includes the root rules and adds governing paths named in the issue", () => {
    expect(
      referencedPaths(["See openspec/specs/a/spec.md and `docs/x.md`."]),
    ).toEqual([
      "AGENTS.md",
      "docs/ai/document-authority.md",
      "openspec/specs/a/spec.md",
      "docs/x.md",
    ]);
  });
});

// after-scope blocks protected paths and overlapping globs and reserves
// shared areas by exact name; Samson's assignment must say so up front.
describe("scopeTask", () => {
  it("names the protected paths from the gate's own list, the overlap rule and the canonical shared areas", () => {
    const task = scopeTask("/factory/issues/7/repo");
    expect({
      workspace: task.includes(
        "Read the workspace at /factory/issues/7/repo (absolute paths only)",
      ),
      protectedList: task.includes(
        `source_paths and test_paths must not reach ${PROTECTED_GLOBS.join(", ")} unless an operator authorized them in core/scope.allowProtected.`,
      ),
      gateList: ["package.json", ".github/**", "scripts/verify/ci-*.mjs"].every(
        (glob) => PROTECTED_GLOBS.includes(glob),
      ),
      overlap: task.includes(
        "Source and test globs must not be able to match the same path.",
      ),
      areas: task.includes(
        "shared_areas: any of migrations, lockfile, shared-ui, api-contract, ci, factory-policy that this change touches. Names are compared exactly after trimming, so use exactly these canonical names.",
      ),
    }).toEqual({
      workspace: true,
      protectedList: true,
      gateList: true,
      overlap: true,
      areas: true,
    });
  });
});
