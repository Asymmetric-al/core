import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const UNIT_TESTS_RUNNER_PATH = "scripts/verify/unit-tests.mjs";

describe("unit test runner contract", () => {
  const source = readFileSync(UNIT_TESTS_RUNNER_PATH, "utf8");

  it("runs the Bun version guard through Node on Windows", () => {
    const windowsBranch = source.slice(
      source.indexOf('if (process.platform === "win32")'),
      source.indexOf("process.exit(runVitest"),
    );

    expect(source).toContain("bun-version.mjs");
    expect(windowsBranch).toContain("bun-version.mjs");
    expect(windowsBranch).toContain("process.execPath");
    expect(windowsBranch).not.toContain('spawnSync("bash"');
    expect(windowsBranch).not.toContain("bun-version.sh");
  });
});
