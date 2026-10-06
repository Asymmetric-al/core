import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  listScanTargets,
  scanMotionSource,
} from "../../../scripts/check-motion-patterns.mjs";

describe("shared motion layout scan", () => {
  it("scans a non-trivial first-party surface", () => {
    const targets = listScanTargets();
    expect(targets.length).toBeGreaterThan(100);
  });

  it("includes new sources and ignores deleted or ignored paths in an uncommitted tree", () => {
    const root = mkdtempSync(path.join(tmpdir(), "core-motion-inventory-"));
    try {
      execFileSync("git", ["init", "--quiet", root]);
      mkdirSync(path.join(root, "apps/example"), { recursive: true });
      writeFileSync(path.join(root, ".gitignore"), "ignored.tsx\n");
      writeFileSync(
        path.join(root, "apps/example/deleted.tsx"),
        "export const deleted = true;",
      );
      execFileSync("git", ["add", "."], { cwd: root });
      rmSync(path.join(root, "apps/example/deleted.tsx"));
      writeFileSync(path.join(root, "apps/example/new.tsx"), "<motion.div />");
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
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

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
