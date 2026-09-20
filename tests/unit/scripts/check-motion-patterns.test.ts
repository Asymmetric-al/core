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
