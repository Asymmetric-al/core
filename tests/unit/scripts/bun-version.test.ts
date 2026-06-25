import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const scriptPath = path.join(repoRoot, "scripts", "verify", "bun-version.sh");
const packageJsonPath = path.join(repoRoot, "package.json");

describe("bun version guard", () => {
  it("pins the repo to the expected Bun version", () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      packageManager?: string;
    };

    expect(packageJson.packageManager).toBe("bun@1.3.14");
  });

  it("checks both Unix and Windows Bun binary names", () => {
    const source = readFileSync(scriptPath, "utf8");

    expect(source).toContain("command -v bun");
    expect(source).toContain("command -v bun.exe");
    expect(source).toContain("BUN_VERSION_GUARD_BIN");
  });

  it("fails fast when installed Bun differs from packageManager", () => {
    const source = readFileSync(scriptPath, "utf8");

    expect(source).toContain("error: Bun version mismatch.");
    expect(source).toContain("expected (package.json packageManager)");
    expect(source).toContain("installed (bun --version)");
    expect(source).toContain("exit 1");
  });
});
