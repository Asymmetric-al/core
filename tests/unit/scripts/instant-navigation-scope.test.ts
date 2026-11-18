import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  INSTANT_NAVIGATION_INPUTS,
  matchesGlob,
  readChangedFiles,
  selectInstantNavigation,
} from "../../../scripts/verify/instant-navigation-scope.mjs";

const BASE = "a".repeat(40);
const HEAD = "b".repeat(40);
const PR = { event: "pull_request", baseRef: "develop" };

describe("glob matching", () => {
  it.each([
    ["scripts/archon-factory/pack/x.mjs", "scripts/archon-factory/**", true],
    ["scripts/archon-factory", "scripts/archon-factory/**", false],
    [
      "tests/unit/scripts/archon-pack.test.ts",
      "tests/unit/scripts/archon-*.test.ts",
      true,
    ],
    [
      "tests/unit/scripts/sub/archon-pack.test.ts",
      "tests/unit/scripts/archon-*.test.ts",
      false,
    ],
    ["tsconfig.json", "tsconfig*.json", true],
    ["apps/donor/tsconfig.json", "tsconfig*.json", false],
    ["package.json", "package.json", true],
    ["packages/ui/package.json", "package.json", false],
    ["scripts\\factory\\setup-cloud.mjs", "scripts/factory/**", true],
    ["docs/a+b(c).md", "docs/a+b(c).md", true],
  ])("%s against %s is %s", (file, pattern, expected) => {
    expect(matchesGlob(file, pattern)).toBe(expected);
  });
});

describe("changed-file reader", () => {
  const git = (outputs: Record<string, string | Error>) =>
    vi.fn((args: string[]) => {
      const output = outputs[args[0]!];
      if (output instanceof Error) throw output;
      return output ?? "";
    });

  it("lists both sides of a rename from the three-dot diff", () => {
    const run = git({
      "rev-parse": "false\n",
      diff: "docs/a.md\0scripts/old.mjs\0scripts/new.mjs\0",
    });
    expect(readChangedFiles({ base: BASE, head: HEAD, git: run })).toEqual([
      "docs/a.md",
      "scripts/old.mjs",
      "scripts/new.mjs",
    ]);
    expect(run).toHaveBeenCalledWith([
      "diff",
      "--no-renames",
      "--name-only",
      "-z",
      `${BASE}...${HEAD}`,
      "--",
    ]);
  });

  // Review round 6 (c1.3): without -z git quotes and escapes unusual names.
  it("keeps names with spaces, quotes or newlines exactly as git stores them", () => {
    const run = git({
      "rev-parse": "false\n",
      diff: ' docs/lead space.md\0docs/"quoted".md\0docs/two\nlines.md\0',
    });
    expect(readChangedFiles({ base: BASE, head: HEAD, git: run })).toEqual([
      " docs/lead space.md",
      'docs/"quoted".md',
      "docs/two\nlines.md",
    ]);
  });

  it.each([
    ["a missing base", { base: undefined, head: HEAD }],
    ["a malformed head", { base: BASE, head: "HEAD" }],
    ["a short SHA", { base: "abc1234", head: HEAD }],
  ])("returns null for %s", (_label, shas) => {
    const run = git({ "rev-parse": "false", diff: "docs/a.md" });
    expect(readChangedFiles({ ...shas, git: run })).toBeNull();
    expect(run).not.toHaveBeenCalled();
  });

  it("returns null in a shallow checkout", () => {
    const run = git({ "rev-parse": "true\n", diff: "docs/a.md" });
    expect(readChangedFiles({ base: BASE, head: HEAD, git: run })).toBeNull();
  });

  it("returns null when git fails", () => {
    const run = git({ "rev-parse": "false", diff: new Error("bad object") });
    expect(readChangedFiles({ base: BASE, head: HEAD, git: run })).toBeNull();
  });
});

describe("instant-navigation selection", () => {
  it.each([
    ["push", undefined],
    ["workflow_dispatch", undefined],
    ["pull_request", "production"],
  ])("always runs the guards for %s into %s", (event, baseRef) => {
    expect(
      selectInstantNavigation({ event, baseRef, changedFiles: ["README.md"] })
        .run,
    ).toBe(true);
  });

  it.each([null, []])(
    "runs the guards when the change set is %j",
    (changedFiles) => {
      expect(selectInstantNavigation({ ...PR, changedFiles }).run).toBe(true);
    },
  );

  it.each([
    "apps/donor/app/(public)/workers/page.tsx",
    "packages/ui/src/button.tsx",
    "tooling/typescript-config/base.json",
    "vendor/react-pdf-packages/x/package.json",
    "scripts/load-workspace-env.mjs",
    "tests/e2e/instant-navigation.spec.ts",
    "tests/e2e/playwright-shared.ts",
    "playwright.config.ts",
    "package.json",
    "bun.lock",
    "turbo.json",
    "tsconfig.json",
    ".github/workflows/ci-integration.yml",
  ])("runs the guards when %s changes", (file) => {
    const selection = selectInstantNavigation({
      ...PR,
      changedFiles: ["docs/ci.md", file],
    });
    expect(selection.run).toBe(true);
    expect(selection.reason).toContain(file);
  });

  it("skips the guards when nothing they depend on changes", () => {
    const selection = selectInstantNavigation({
      ...PR,
      changedFiles: [
        "docs/ci.md",
        "apps/admin/app/page.tsx",
        "apps/missionary/app/page.tsx",
        "supabase/migrations/20261118000000_x.sql",
        "openspec/changes/x/proposal.md",
        "tests/unit/scripts/instant-navigation-scope.test.ts",
      ],
    });
    expect(selection.run).toBe(false);
    expect(selection.reason).toMatch(/no changed file/);
  });

  it("names its inputs explicitly", () => {
    expect(INSTANT_NAVIGATION_INPUTS).toContain("apps/donor/**");
    expect(INSTANT_NAVIGATION_INPUTS).toContain("packages/**");
  });
});

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
const SCOPE_SCRIPT = "scripts/verify/instant-navigation-scope.mjs";

function git(cwd: string, ...args: string[]) {
  const result = spawnSync(
    "git",
    [
      "-c",
      "user.name=instant-navigation-scope",
      "-c",
      "user.email=instant-navigation-scope@example.invalid",
      "-c",
      "commit.gpgsign=false",
      ...args,
    ],
    { cwd, encoding: "utf8", shell: false },
  );
  if (result.status !== 0)
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  return result.stdout.trim();
}

/** A throwaway repository with one base commit and one head commit. */
function repositoryWithChange(root: string, changed: string[]) {
  const repo = mkdtempSync(path.join(root, "repo-"));
  git(repo, "init", "--quiet");
  writeFileSync(path.join(repo, "README.md"), "# base\n");
  git(repo, "add", "--all");
  git(repo, "commit", "--quiet", "-m", "base");
  const base = git(repo, "rev-parse", "HEAD");
  for (const file of changed) {
    mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
    writeFileSync(path.join(repo, file), "changed\n");
  }
  git(repo, "add", "--all");
  git(repo, "commit", "--quiet", "-m", "head");
  return { repo, base, head: git(repo, "rev-parse", "HEAD") };
}

/**
 * Runs `node scripts/verify/instant-navigation-scope.mjs` the way
 * the instant-nav job does, and returns what it wrote to GITHUB_OUTPUT. Every
 * GitHub variable comes from the case, never from the host, so the test
 * behaves the same inside a GitHub Actions run.
 */
function runInstantNavigationCli(
  root: string,
  cwd: string,
  script: string,
  vars: Record<string, string>,
) {
  const output = path.join(mkdtempSync(path.join(root, "out-")), "output");
  writeFileSync(output, "");
  const env: NodeJS.ProcessEnv = {};
  for (const [name, value] of Object.entries(process.env))
    if (!/^(GITHUB_|CI_BASE_SHA$|CI_HEAD_SHA$)/.test(name)) env[name] = value;
  const result = spawnSync(process.execPath, [script], {
    cwd,
    encoding: "utf8",
    shell: false,
    env: { ...env, ...vars, GITHUB_OUTPUT: output },
  });
  return { result, written: readFileSync(output, "utf8") };
}

describe("the instant-nav scope CLI as the workflow runs it", () => {
  let root = "";
  let docsOnly: ReturnType<typeof repositoryWithChange>;
  let donor: ReturnType<typeof repositoryWithChange>;
  let donorUnicode: ReturnType<typeof repositoryWithChange>;
  beforeAll(() => {
    root = mkdtempSync(path.join(os.tmpdir(), "instant-navigation-scope-cli-"));
    docsOnly = repositoryWithChange(root, ["docs/notes.md"]);
    donor = repositoryWithChange(root, ["apps/donor/app/page.tsx"]);
    donorUnicode = repositoryWithChange(root, [
      "apps/donor/app/(public)/café/page.tsx",
    ]);
  });
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  const pullRequest = (
    baseRef: string,
    change: { base: string; head: string },
  ) => ({
    GITHUB_EVENT_NAME: "pull_request",
    GITHUB_BASE_REF: baseRef,
    CI_BASE_SHA: change.base,
    CI_HEAD_SHA: change.head,
  });

  it.each([
    ["a production pull request", () => pullRequest("production", docsOnly)],
    [
      "a production push",
      () => ({ GITHUB_EVENT_NAME: "push", GITHUB_BASE_REF: "" }),
    ],
    [
      "a manual dispatch",
      () => ({ GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_BASE_REF: "" }),
    ],
    [
      "a develop pull request without SHAs",
      () => ({
        GITHUB_EVENT_NAME: "pull_request",
        GITHUB_BASE_REF: "develop",
        CI_BASE_SHA: "",
        CI_HEAD_SHA: "",
      }),
    ],
    [
      "a develop pull request whose SHAs are not in the checkout",
      () => pullRequest("develop", { base: BASE, head: HEAD }),
    ],
    [
      "a develop pull request that changes donor",
      () => pullRequest("develop", donor),
    ],
  ])("writes run=true for %s", (_label, vars) => {
    const { result, written } = runInstantNavigationCli(
      root,
      docsOnly.repo,
      path.join(REPO_ROOT, SCOPE_SCRIPT),
      vars(),
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toMatch(/^instant-nav scope: /);
    expect(written).toBe("run=true\n");
  });

  it("matches a changed donor path with a non-ASCII name (review round 6, c1.3)", () => {
    const { result, written } = runInstantNavigationCli(
      root,
      donorUnicode.repo,
      path.join(REPO_ROOT, SCOPE_SCRIPT),
      {
        ...pullRequest("develop", donorUnicode),
        // Git's default, set explicitly so the host's configuration cannot
        // hide the quoting: "apps/donor/app/(public)/caf\303\251/page.tsx".
        GIT_CONFIG_COUNT: "1",
        GIT_CONFIG_KEY_0: "core.quotePath",
        GIT_CONFIG_VALUE_0: "true",
      },
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("café/page.tsx changed");
    expect(written).toBe("run=true\n");
  });

  it("writes run=false only for a develop pull request that cannot affect the guards", () => {
    const { result, written } = runInstantNavigationCli(
      root,
      docsOnly.repo,
      path.join(REPO_ROOT, SCOPE_SCRIPT),
      pullRequest("develop", docsOnly),
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toMatch(/no changed file can affect/);
    expect(written).toBe("run=false\n");
  });

  it("writes its output when started by the workflow's relative path from the repository root", () => {
    for (const vars of [
      { GITHUB_EVENT_NAME: "push", GITHUB_BASE_REF: "" },
      { GITHUB_EVENT_NAME: "pull_request", GITHUB_BASE_REF: "develop" },
    ]) {
      const { result, written } = runInstantNavigationCli(
        root,
        REPO_ROOT,
        SCOPE_SCRIPT,
        vars,
      );
      expect(result.status, result.stderr).toBe(0);
      expect(written).toBe("run=true\n");
    }
  });
});
