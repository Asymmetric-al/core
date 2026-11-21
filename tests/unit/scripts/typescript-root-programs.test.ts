// Compiles the three programs outside the workspaces (TS-3, design L9) inside the unit run. Pull-request CI type-checks
// only affected workspaces (`turbo run typecheck --affected --filter=...`), which selects nothing when a change
// touches only root configuration, `scripts/` or `tooling/`, so the root `typecheck:programs` task would not run there.
// The unit run is not filtered, so this keeps those programs gated on every pull request without a workflow change.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const manifest: { scripts: Record<string, string> } = JSON.parse(
  readFileSync(path.join(root, "package.json"), "utf8"),
);
const configs = [
  ...(manifest.scripts["typecheck:programs"] ?? "").matchAll(/tsc -p (\S+)/g),
].map((match) => match[1]);
const tsc = path.join(
  root,
  "node_modules/.bin",
  process.platform === "win32" ? "tsc.exe" : "tsc",
);

describe("programs outside the workspaces compile", () => {
  it("reads the three configs of the typecheck:programs script", () => {
    expect(configs).toEqual([
      "tsconfig.root.json",
      "scripts/tsconfig.json",
      "tooling/tsconfig.json",
    ]);
  });

  it.each(configs)(
    "%s compiles without errors",
    { timeout: 180_000 },
    (config) => {
      const result = spawnSync(tsc, ["-p", config], {
        cwd: root,
        encoding: "utf8",
        shell: process.platform === "win32",
        maxBuffer: 64 * 1024 * 1024,
      });
      expect(result.error).toBeUndefined();
      expect(result.status, result.stdout + result.stderr).toBe(0);
    },
  );
});
