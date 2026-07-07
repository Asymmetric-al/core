import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

function readScript(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("setup script contracts", () => {
  it("keeps PowerShell setup on native script commands instead of routing Windows paths through Bash", () => {
    for (const scriptPath of ["scripts/setup.ps1", "scripts/setup/index.ps1"]) {
      const script = readScript(scriptPath);

      expect(script).toContain("Require-Command 'node'");
      expect(script).toContain("& bun run verify:bun-version");
      expect(script).toContain("& bun run skills:verify");
      expect(script).toContain("& supabase --version 2>&1");
      expect(script).toContain("$previousErrorActionPreference");
      expect(script).toContain("[Console]::Error.WriteLine");
      expect(script).not.toContain("bun-version.sh");
      expect(script).not.toContain("supabase --version 2>$null");
      expect(script).not.toContain("Write-Error");
    }
  });

  it("checks Node before Unix setup invokes Node-backed verification scripts", () => {
    const script = readScript("scripts/setup/index.sh");

    expect(script).toContain("require_cmd bun");
    expect(script).toContain("require_cmd node");
    expect(script.indexOf("require_cmd node")).toBeLessThan(
      script.indexOf('bash "$ROOT_DIR/scripts/verify/bun-version.sh"'),
    );
  });

  it("keeps the Windows unit-test preflight on the cross-platform Bun version script", () => {
    const script = readScript("scripts/verify/unit-tests.mjs");

    expect(script).toContain('spawnSync("bun", ["run", "verify:bun-version"]');
    expect(script).not.toContain(
      'spawnSync("bash", ["scripts/verify/bun-version.sh"]',
    );
  });
});
