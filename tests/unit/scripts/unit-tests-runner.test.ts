import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const UNIT_TESTS_RUNNER_PATH = "scripts/verify/unit-tests.mjs";

describe("unit test verifier", () => {
  const source = readFileSync(UNIT_TESTS_RUNNER_PATH, "utf8");

  it("runs the Windows Bun version guard through the current Node executable", () => {
    const windowsBlock = source.slice(
      source.indexOf('if (process.platform === "win32")'),
      source.indexOf('process.exit(runVitest(["--coverage"]))'),
    );

    expect(windowsBlock).toContain("process.execPath");
    expect(windowsBlock).toContain('"scripts/verify/bun-version.mjs"');
    expect(windowsBlock).not.toContain(
      'spawnSync("bash", ["scripts/verify/bun-version.sh"]',
    );
  });
});
