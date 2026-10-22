import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { repositoryGitEnvironment } from "../../../scripts/git/environment.mjs";
import {
  APPS,
  isSharedRuntimeInput,
  resolveBuildDecision,
} from "../../../scripts/vercel/should-ignore-build.mjs";

const appNames = Object.keys(APPS);

function buildMatrix(changedFiles: string[]) {
  return Object.fromEntries(
    appNames.map((app) => [
      app,
      resolveBuildDecision({ app, changedFiles }).build,
    ]),
  );
}

describe("Vercel ignored-build helper", () => {
  it("skips all apps for docs-only and evidence-only changes", () => {
    expect(
      buildMatrix([
        "docs/ops/phase-evidence/2026-05-15_phase-07_repo-finalization.md",
        "docs/ops/deploy-checklist.md",
        "openspec/changes/reduce-deploy-spend/proposal.md",
        ".github/workflows/sync-vercel-production-env.yml",
        "tests/unit/scripts/vercel-production-readiness.test.ts",
      ]),
    ).toEqual({
      admin: false,
      donor: false,
      missionary: false,
    });
  });

  it("builds only admin for admin app changes", () => {
    expect(buildMatrix(["apps/admin/app/(app)/page.tsx"])).toEqual({
      admin: true,
      donor: false,
      missionary: false,
    });
  });

  it("builds only donor for donor app changes", () => {
    expect(buildMatrix(["apps/donor/app/page.tsx"])).toEqual({
      admin: false,
      donor: true,
      missionary: false,
    });
  });

  it("builds only missionary for missionary app changes", () => {
    expect(buildMatrix(["apps/missionary/app/page.tsx"])).toEqual({
      admin: false,
      donor: false,
      missionary: true,
    });
  });

  it("builds all apps for shared packages and lockfile or build config changes", () => {
    for (const changedFile of [
      "packages/api/src/profile/queries.ts",
      "packages/ui/components/button.tsx",
      "bun.lock",
      ".bun-version",
      "package.json",
      "turbo.json",
      "scripts/resolve-monorepo-root.mjs",
      "scripts/vercel/should-ignore-build.mjs",
      "tsconfig.json",
    ]) {
      expect(buildMatrix([changedFile])).toEqual({
        admin: true,
        donor: true,
        missionary: true,
      });
    }
  });

  it("classifies shared runtime inputs without promoting docs or tests", () => {
    expect(isSharedRuntimeInput("packages/api/src/index.ts")).toBe(true);
    expect(isSharedRuntimeInput("tooling/typescript-config/base.json")).toBe(
      true,
    );
    expect(isSharedRuntimeInput("scripts/vercel/should-ignore-build.mjs")).toBe(
      true,
    );
    expect(isSharedRuntimeInput("docs/ops/environments.md")).toBe(false);
    expect(isSharedRuntimeInput("tests/tsconfig.json")).toBe(false);
  });

  it("fails closed for unknown apps and missing diff context", () => {
    expect(
      resolveBuildDecision({
        app: "unknown",
        changedFiles: ["docs/ops/environments.md"],
      }),
    ).toMatchObject({
      build: true,
      matchedFile: null,
      reason: "unknown app: unknown",
    });

    expect(
      resolveBuildDecision({
        app: "admin",
        changedFiles: [],
      }),
    ).toMatchObject({
      build: true,
      matchedFile: null,
      reason: "missing diff context",
    });
  });
});

describe.each([false, true])(
  "Vercel last successful deployment diff with hook environment: %s",
  (hookEnvironment) => {
    let root: string;
    let baseline: string;
    let product: string;
    let unrelated: string;
    let foreign: string;
    let foreignConfigBefore: string;
    const script = path.resolve("scripts/vercel/should-ignore-build.mjs");
    const baseEnv = repositoryGitEnvironment({
      ...process.env,
      GIT_AUTHOR_NAME: "Fixture",
      GIT_AUTHOR_EMAIL: "fixture@example.test",
      GIT_COMMITTER_NAME: "Fixture",
      GIT_COMMITTER_EMAIL: "fixture@example.test",
    });
    let fixtureEnv = baseEnv;
    function git(...args: string[]) {
      return execFileSync("git", args, {
        cwd: root,
        env: fixtureEnv,
        encoding: "utf8",
      }).trim();
    }
    function check(
      previous: string | undefined,
      patch: Record<string, string | undefined> = {},
      app = "admin",
    ) {
      const env = { ...fixtureEnv };
      delete env.VERCEL_GIT_PREVIOUS_SHA;
      delete env.CORE_QA_FORCE_BUILD_SHA;
      delete env.VERCEL_GIT_COMMIT_SHA;
      delete env.VERCEL_ENV;
      if (previous !== undefined) env.VERCEL_GIT_PREVIOUS_SHA = previous;
      Object.assign(env, patch);
      return spawnSync(process.execPath, [script, app], {
        cwd: root,
        env,
        encoding: "utf8",
      });
    }
    beforeAll(() => {
      root = mkdtempSync(path.join(os.tmpdir(), "core-deploy-baseline-"));
      foreign = mkdtempSync(path.join(os.tmpdir(), "core-deploy-foreign-"));
      execFileSync("git", ["init", "--quiet", foreign], { env: baseEnv });
      foreignConfigBefore = readFileSync(
        path.join(foreign, ".git/config"),
        "utf8",
      );
      fixtureEnv = repositoryGitEnvironment(
        hookEnvironment
          ? {
              ...baseEnv,
              GIT_DIR: path.join(foreign, ".git"),
              GIT_COMMON_DIR: path.join(foreign, ".git"),
              GIT_WORK_TREE: foreign,
              GIT_INDEX_FILE: path.join(foreign, ".git/index"),
            }
          : baseEnv,
      );
      git("init");
      mkdirSync(path.join(root, "apps/admin"), { recursive: true });
      writeFileSync(path.join(root, "apps/admin/page.tsx"), "baseline");
      git("add", ".");
      git("commit", "-m", "baseline");
      baseline = git("rev-parse", "HEAD");
      writeFileSync(path.join(root, "apps/admin/page.tsx"), "new product");
      git("add", ".");
      git("commit", "-m", "product");
      product = git("rev-parse", "HEAD");
      mkdirSync(path.join(root, "docs"));
      writeFileSync(path.join(root, "docs/qualification.md"), "qualification");
      git("add", ".");
      git("commit", "-m", "qualification only");
    });
    it("builds when the previous successful commit is outside current ancestry", () => {
      unrelated = git(
        "commit-tree",
        git("write-tree"),
        "-m",
        "unrelated successful history",
      );
      expect(check(unrelated).status).toBe(1);
    });
    afterAll(() => {
      if (root) rmSync(root, { recursive: true, force: true });
      if (foreign) rmSync(foreign, { recursive: true, force: true });
    });
    it("keeps the foreign hook repository unchanged", () => {
      expect(readFileSync(path.join(foreign, ".git/config"), "utf8")).toBe(
        foreignConfigBefore,
      );
      expect(
        execFileSync("git", ["-C", foreign, "ls-files"], {
          env: baseEnv,
          encoding: "utf8",
        }),
      ).toBe("");
    });
    it("builds product changes followed by a documentation-only head", () => {
      const result = check(baseline);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain("apps/admin/page.tsx");
    });
    it("skips documentation when the product commit already deployed successfully", () => {
      expect(check(product).status).toBe(0);
    });
    it.each(appNames)(
      "forces a docs-only QA Preview for %s when the marker matches provider SHA and actual Git HEAD",
      (app) => {
        const head = git("rev-parse", "HEAD");
        const result = check(
          product,
          {
            VERCEL_ENV: "preview",
            VERCEL_GIT_COMMIT_SHA: head,
            CORE_QA_FORCE_BUILD_SHA: head,
          },
          app,
        );
        expect(result.status).toBe(1);
        expect(result.stdout).toBe(
          "[vercel-ignore] QA Preview marker matched\n",
        );
        expect(result.stderr).toBe("");
      },
    );
    it.each([
      ["production", { VERCEL_ENV: "production" }],
      ["development", { VERCEL_ENV: "development" }],
      ["missing environment", { VERCEL_ENV: undefined }],
      ["malformed environment", { VERCEL_ENV: "Preview" }],
      ["missing provider SHA", { VERCEL_GIT_COMMIT_SHA: undefined }],
      ["malformed provider SHA", { VERCEL_GIT_COMMIT_SHA: "branch-name" }],
      ["mismatched provider SHA", { VERCEL_GIT_COMMIT_SHA: "f".repeat(40) }],
      [
        "malformed marker",
        { CORE_QA_FORCE_BUILD_SHA: "marker-value-must-not-appear" },
      ],
      ["empty marker", { CORE_QA_FORCE_BUILD_SHA: "" }],
      ["short marker", { CORE_QA_FORCE_BUILD_SHA: "a".repeat(39) }],
      ["uppercase marker", { CORE_QA_FORCE_BUILD_SHA: "F".repeat(40) }],
      ["mismatched marker", { CORE_QA_FORCE_BUILD_SHA: "f".repeat(40) }],
      [
        "matching forged provider and marker SHA",
        {
          VERCEL_GIT_COMMIT_SHA: "f".repeat(40),
          CORE_QA_FORCE_BUILD_SHA: "f".repeat(40),
        },
      ],
    ])(
      "preserves a docs-only skip for %s and logs no marker value",
      (_label, patch) => {
        const head = git("rev-parse", "HEAD");
        const result = check(product, {
          VERCEL_ENV: "preview",
          VERCEL_GIT_COMMIT_SHA: head,
          CORE_QA_FORCE_BUILD_SHA: head,
          ...patch,
        });
        expect(result.status).toBe(0);
        expect(result.stdout).toBe(
          "[vercel-ignore] QA Preview marker not matched\n" +
            "[vercel-ignore] skipping admin: changed files do not affect this Vercel app\n",
        );
        expect(result.stderr).toBe("");
      },
    );
    it("preserves a normal Preview skip when the marker is absent", () => {
      const result = check(product, {
        VERCEL_ENV: "preview",
        VERCEL_GIT_COMMIT_SHA: git("rev-parse", "HEAD"),
      });
      expect(result.status).toBe(0);
      expect(result.stdout).toBe(
        "[vercel-ignore] skipping admin: changed files do not affect this Vercel app\n",
      );
    });
    it("does not force an unknown app and retains its ordinary decision", () => {
      const head = git("rev-parse", "HEAD");
      const normal = check(product, {}, "unknown");
      const marked = check(
        product,
        {
          VERCEL_ENV: "preview",
          VERCEL_GIT_COMMIT_SHA: head,
          CORE_QA_FORCE_BUILD_SHA: head,
        },
        "unknown",
      );
      expect(marked.status).toBe(normal.status);
      expect(marked.stdout).toBe(
        "[vercel-ignore] QA Preview marker not matched\n" + normal.stdout,
      );
    });
    it("still builds normal production product changes when a QA marker is rejected", () => {
      const head = git("rev-parse", "HEAD");
      const normal = check(baseline);
      const marked = check(baseline, {
        VERCEL_ENV: "production",
        VERCEL_GIT_COMMIT_SHA: head,
        CORE_QA_FORCE_BUILD_SHA: head,
      });
      expect(marked.status).toBe(normal.status);
      expect(marked.status).toBe(1);
      expect(marked.stdout).toBe(
        "[vercel-ignore] QA Preview marker not matched\n" + normal.stdout,
      );
    });
    it.each([undefined, "", "not-a-sha", "f".repeat(40)])(
      "builds without a usable previous deployment: %s",
      (previous) => {
        expect(check(previous).status).toBe(1);
      },
    );
  },
);
