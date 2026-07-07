import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const runnerPath = path.join(repoRoot, "scripts", "verify", "unit-tests.mjs");

describe("unit test runner", () => {
  it("uses the cross-platform Bun version guard on Windows", () => {
    const runner = readFileSync(runnerPath, "utf8");

    expect(runner).toContain('spawnSync("bun", ["run", "verify:bun-version"]');
    expect(runner).not.toContain("scripts/verify/bun-version.sh");
  });
});
