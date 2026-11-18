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
  FULL_RUN_TRIGGERS,
  INSTANT_NAVIGATION_INPUTS,
  SCOPED_TEST_GROUPS,
  matchesGlob,
  readChangedFiles,
  selectInstantNavigation,
  selectUnitTests,
  unitTestScope,
} from "../../../scripts/verify/ci-test-scope.mjs";

const BASE = "a".repeat(40);
const HEAD = "b".repeat(40);
const PR = { event: "pull_request", baseRef: "develop" };
const factory = (selection: ReturnType<typeof selectUnitTests>) =>
  selection.groups.find((group) => group.id === "factory")!;

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

describe("unit-test selection", () => {
  it("defines the factory group as the only scoped group", () => {
    expect(SCOPED_TEST_GROUPS.map((group) => group.id)).toEqual(["factory"]);
    expect(
      factory(selectUnitTests({ ...PR, changedFiles: ["README.md"] })).tests,
    ).toEqual([
      "tests/unit/scripts/archon-*.test.ts",
      "tests/unit/scripts/factory-*.test.ts",
    ]);
  });

  it.each([
    [undefined, "develop"],
    ["", "develop"],
    ["push", undefined],
    ["merge_group", undefined],
    ["workflow_dispatch", undefined],
    ["pull_request_target", "develop"],
    ["schedule", undefined],
  ])("runs every test for event %s", (event, baseRef) => {
    const selection = selectUnitTests({
      event,
      baseRef,
      changedFiles: ["README.md"],
    });
    expect(selection.groups.every((group) => group.run)).toBe(true);
    expect(selection.reason).toMatch(/every test runs/);
  });

  it.each(["production", "feature/x", undefined])(
    "runs every test for a pull request into %s",
    (baseRef) => {
      const selection = selectUnitTests({
        event: "pull_request",
        baseRef,
        changedFiles: ["README.md"],
      });
      expect(selection.groups.every((group) => group.run)).toBe(true);
    },
  );

  it.each([
    ["unknown", null],
    ["not a list", "README.md"],
    ["empty", []],
  ])("runs every test when the change set is %s", (_label, changedFiles) => {
    const selection = selectUnitTests({
      ...PR,
      changedFiles: changedFiles as never,
    });
    expect(selection.groups.every((group) => group.run)).toBe(true);
    expect(selection.reason).toMatch(/every test runs/);
  });

  it.each([
    "package.json",
    "bun.lock",
    "bunfig.toml",
    ".bun-version",
    ".node-version",
    "tsconfig.json",
    "tsconfig.base.json",
    "tooling/typescript-config/base.json",
    "vitest.config.mts",
    "vitest.per-importer-alias.mts",
    "vitest.pin-workspace-packages.ts",
    "tests/setup/unit-env.ts",
    "tests/mocks/server-only.ts",
    "scripts/verify/unit-tests.mjs",
    "scripts/verify/ci-test-scope.mjs",
    ".github/workflows/ci.yml",
  ])("runs every test when the full-run trigger %s changes", (file) => {
    const selection = selectUnitTests({
      ...PR,
      changedFiles: ["apps/donor/app/page.tsx", file],
    });
    expect(selection.groups.every((group) => group.run)).toBe(true);
    expect(selection.reason).toContain(file);
  });

  it("lists the triggers that guard the selection itself", () => {
    for (const file of [
      "scripts/verify/unit-tests.mjs",
      "scripts/verify/ci-test-scope.mjs",
      ".github/workflows/ci.yml",
      "vitest.config.mts",
      "bun.lock",
      "package.json",
    ])
      expect(
        FULL_RUN_TRIGGERS.some((pattern) => matchesGlob(file, pattern)),
      ).toBe(true);
  });

  it("skips the factory group when no changed file touches its inputs", () => {
    const selection = selectUnitTests({
      ...PR,
      changedFiles: [
        "apps/donor/app/page.tsx",
        "packages/api/src/donations.ts",
        "docs/ci.md",
        "supabase/migrations/20261118000000_x.sql",
        "tests/unit/scripts/design-system-theme.test.ts",
      ],
    });
    expect(factory(selection).run).toBe(false);
    expect(factory(selection).reason).toMatch(/no changed file/);
  });

  it.each([
    "scripts/archon-factory/pack/.shared/github.mjs",
    "scripts/factory/install-native.mjs",
    "scripts/verify/bun-lock-drift.mjs",
    "scripts/verify/ci-build-policy.mjs",
    "tests/unit/helpers/workflow-yaml.ts",
    "tests/unit/scripts/support/source-statements.ts",
    ".codex/agents/builder.toml",
    "docs/ai/skills/samson-factory/SKILL.md",
    "docs/guides/development/samson-codex-cloud.md",
    "openspec/changes/add-six-agent-codex-factory/tasks.md",
    "tests/unit/scripts/archon-pack-config.test.ts",
    "tests/unit/scripts/factory-new.test.ts",
  ])("runs the factory group when %s changes", (file) => {
    const selection = selectUnitTests({
      ...PR,
      changedFiles: ["apps/donor/app/page.tsx", file],
    });
    expect(factory(selection).run).toBe(true);
    expect(factory(selection).reason).toContain(file);
  });
});

describe("unit-test scope for the runner", () => {
  const env = {
    GITHUB_EVENT_NAME: "pull_request",
    GITHUB_BASE_REF: "develop",
    CI_BASE_SHA: BASE,
    CI_HEAD_SHA: HEAD,
  };

  const analyze = vi.fn(() => ({
    scoped: ["tests/unit/scripts/archon-a.test.ts"],
    unscoped: [
      {
        file: "tests/unit/scripts/factory-b.test.ts",
        reasons: ["tests/unit/scripts/factory-b.test.ts reads docs/x.md"],
      },
    ],
  }));

  it("excludes only the provably scoped files of a skipped group and explains it", () => {
    const readChanges = vi.fn(() => ["docs/ci.md"]);
    const scope = unitTestScope({ env, readChanges, analyze });
    expect(readChanges).toHaveBeenCalledWith({ base: BASE, head: HEAD });
    expect(analyze).toHaveBeenCalledWith(SCOPED_TEST_GROUPS[0]);
    expect(scope.excludeArgs).toEqual([
      "--exclude",
      "tests/unit/scripts/archon-a.test.ts",
    ]);
    const log = scope.lines.join(" ");
    expect(log).toMatch(/skipping 1 files of the factory group/);
    expect(log).toMatch(/develop and merge_group/);
    expect(log).toMatch(
      /keeping tests\/unit\/scripts\/factory-b\.test\.ts in the run: .*reads docs\/x\.md/,
    );
  });

  it("excludes nothing and reads no diff outside a develop pull request", () => {
    const readChanges = vi.fn(() => ["docs/ci.md"]);
    for (const event of ["push", "merge_group", undefined]) {
      const scope = unitTestScope({
        env: { ...env, GITHUB_EVENT_NAME: event },
        readChanges,
        analyze,
      });
      expect(scope.excludeArgs).toEqual([]);
      expect(scope.lines.join("\n")).toMatch(/every test runs/);
    }
    expect(readChanges).not.toHaveBeenCalled();
  });

  it("excludes nothing when the diff cannot be read", () => {
    const scope = unitTestScope({ env, readChanges: () => null, analyze });
    expect(scope.excludeArgs).toEqual([]);
    expect(scope.lines.join("\n")).toMatch(/could not be computed/);
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
      diff: "docs/a.md\nscripts/old.mjs\nscripts/new.mjs\n",
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
      `${BASE}...${HEAD}`,
      "--",
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
        "tests/unit/scripts/ci-test-scope.test.ts",
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
const SCOPE_SCRIPT = "scripts/verify/ci-test-scope.mjs";

function git(cwd: string, ...args: string[]) {
  const result = spawnSync(
    "git",
    [
      "-c",
      "user.name=ci-test-scope",
      "-c",
      "user.email=ci-test-scope@example.invalid",
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
 * Runs `node scripts/verify/ci-test-scope.mjs --instant-navigation` the way
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
  const result = spawnSync(process.execPath, [script, "--instant-navigation"], {
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
  beforeAll(() => {
    root = mkdtempSync(path.join(os.tmpdir(), "ci-test-scope-cli-"));
    docsOnly = repositoryWithChange(root, ["docs/notes.md"]);
    donor = repositoryWithChange(root, ["apps/donor/app/page.tsx"]);
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
