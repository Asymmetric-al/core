import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  listScanTargets,
  scanMotionSource,
} from "../../../scripts/check-motion-patterns.mjs";

import { repositoryGitEnvironment } from "../../../scripts/git/environment.mjs";

afterEach(() => vi.unstubAllEnvs());

describe("shared motion layout scan", () => {
  it("scans a non-trivial first-party surface", () => {
    const targets = listScanTargets();
    expect(targets.length).toBeGreaterThan(100);
  });

  it.each([false, true])(
    "inventories uncommitted sources with inherited Git hook environment: %s",
    (hookEnvironment) => {
      const root = mkdtempSync(path.join(tmpdir(), "core-motion-inventory-"));
      const foreign = mkdtempSync(path.join(tmpdir(), "core-motion-foreign-"));
      try {
        execFileSync("git", ["init", "--quiet", root], {
          env: repositoryGitEnvironment(),
        });
        const gitConfig = path.join(root, ".git/config");
        const configBefore = readFileSync(gitConfig, "utf8");
        if (hookEnvironment) {
          execFileSync("git", ["init", "--quiet", foreign], {
            env: repositoryGitEnvironment(),
          });
          vi.stubEnv("GIT_DIR", path.join(foreign, ".git"));
          vi.stubEnv("GIT_WORK_TREE", foreign);
          vi.stubEnv("GIT_INDEX_FILE", path.join(foreign, ".git/index"));
        }
        mkdirSync(path.join(root, "apps/example"), { recursive: true });
        writeFileSync(path.join(root, ".gitignore"), "ignored.tsx\n");
        writeFileSync(
          path.join(root, "apps/example/deleted.tsx"),
          "export const deleted = true;",
        );
        execFileSync("git", ["add", "."], {
          cwd: root,
          env: repositoryGitEnvironment(),
        });
        rmSync(path.join(root, "apps/example/deleted.tsx"));
        writeFileSync(
          path.join(root, "apps/example/new.tsx"),
          "<motion.div />",
        );
        writeFileSync(
          path.join(root, "apps/example/ignored.tsx"),
          "<motion.div />",
        );
        for (const generated of [
          "packages/eve-runtime/skill-catalog/extension/skills/example.tsx",
          "packages/eve-runtime/agent/subagents/ci-triage/.catalog-stage-test/skills/example.tsx",
          "packages/eve-runtime/agent/subagents/ci-triage/skills/example.tsx",
        ]) {
          mkdirSync(path.dirname(path.join(root, generated)), {
            recursive: true,
          });
          writeFileSync(path.join(root, generated), "<motion.div />");
        }
        expect(listScanTargets(root)).toEqual(["apps/example/new.tsx"]);
        expect(readFileSync(gitConfig, "utf8")).toBe(configBefore);
      } finally {
        rmSync(root, { recursive: true, force: true });
        rmSync(foreign, { recursive: true, force: true });
      }
    },
  );

  it("flags an inline height tween", () => {
    const violations = scanMotionSource(
      "apps/example/inline.tsx",
      `<motion.div initial={{ height: 0 }} animate={{ height: "auto" }} />\n`,
    );

    expect(violations.map((item) => item.kind)).toContain(
      "motion-layout-property",
    );
    expect(violations.some((item) => item.hint.includes("`height`"))).toBe(
      true,
    );
  });

  it("flags a named motion target that animates height", () => {
    const violations = scanMotionSource(
      "apps/example/named.tsx",
      `const collapse = { height: 0, opacity: 0 };\n<motion.div initial={collapse} animate={{ opacity: 1 }} />\n`,
    );

    expect(
      violations.filter((item) => item.kind === "motion-layout-property"),
    ).not.toEqual([]);
  });

  it("flags a ternary motion target that animates height", () => {
    const violations = scanMotionSource(
      "apps/example/ternary.tsx",
      `<motion.div initial={open ? { height: "auto" } : { height: 0 }} />\n`,
    );

    expect(
      violations.filter((item) => item.kind === "motion-layout-property"),
    ).not.toEqual([]);
  });

  it("flags whileDrag layout tweens", () => {
    const violations = scanMotionSource(
      "apps/example/drag.tsx",
      `<motion.div whileDrag={{ width: 320 }} />\n`,
    );

    expect(
      violations.filter((item) => item.kind === "motion-layout-property"),
    ).not.toEqual([]);
  });

  it("does not flag transform-only motion", () => {
    const violations = scanMotionSource(
      "apps/example/safe.tsx",
      `<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} />\n`,
    );

    expect(violations).toEqual([]);
  });
});
