import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const fixtures: string[] = [];

afterEach(() => {
  for (const directory of fixtures.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

function runScript(
  script: string,
  args: string[],
  mode: string,
  signals: Record<string, string> = {},
) {
  const directory = mkdtempSync(path.join(tmpdir(), "core-eve-build-cli-"));
  fixtures.push(directory);
  mkdirSync(path.join(directory, "scripts"));
  copyFileSync(
    "packages/eve-runtime/scripts/build.mjs",
    path.join(directory, "scripts/build.mjs"),
  );
  const pkg = JSON.parse(
    readFileSync("packages/eve-runtime/package.json", "utf8"),
  );
  writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify({ type: "module", scripts: pkg.scripts }),
  );
  const sdk = path.join(directory, "node_modules/eve");
  mkdirSync(path.join(sdk, "bin"), { recursive: true });
  writeFileSync(
    path.join(sdk, "package.json"),
    JSON.stringify({ name: "eve", type: "module" }),
  );
  writeFileSync(
    path.join(sdk, "bin/eve.js"),
    '#!/usr/bin/env node\nimport {writeFileSync} from "node:fs"; writeFileSync(process.env.EVE_BUILD_TEST_OUTPUT, JSON.stringify(process.argv.slice(2)));\n',
    { mode: 0o755 },
  );
  mkdirSync(path.join(directory, "node_modules/.bin"));
  symlinkSync(
    path.join(sdk, "bin/eve.js"),
    path.join(directory, "node_modules/.bin/eve"),
  );
  mkdirSync(path.join(directory, "node_modules/@asym"));
  symlinkSync(
    path.resolve(path.dirname(require.resolve("@asym/env/target-env")), ".."),
    path.join(directory, "node_modules/@asym/env"),
    "dir",
  );
  const output = path.join(directory, "sdk-argv.json");
  const result = spawnSync("bun", ["run", script, ...args], {
    cwd: directory,
    env: {
      PATH: process.env.PATH,
      CORE_EVE_BUILD_MODE: mode,
      EVE_BUILD_TEST_OUTPUT: output,
      ...signals,
    },
    encoding: "utf8",
    timeout: 15_000,
  });
  if (result.error) throw result.error;
  return {
    status: result.status,
    stderr: result.stderr,
    sdkArgs: existsSync(output)
      ? JSON.parse(readFileSync(output, "utf8"))
      : null,
  };
}

describe("named Eve build commands", () => {
  it.each([
    { args: ["--service"] },
    { args: ["--service", "--skip-sandbox-prewarm"] },
  ])(
    "rejects a forwarded service selector on explicit full builds (%j)",
    ({ args }) => {
      const result = runScript("build:full", args, "artifacts", {
        VERCEL: "1",
        VERCEL_ENV: "preview",
        VERCEL_TARGET_ENV: "core-development",
      });
      expect(result.status, JSON.stringify(result.sdkArgs)).not.toBe(0);
      expect(result.sdkArgs).toBeNull();
    },
  );

  it("keeps explicit full qualification despite inherited artifact mode", () => {
    const result = runScript(
      "build:full",
      ["--profile", "report.json"],
      "artifacts",
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.sdkArgs).toEqual(["build", "--profile", "report.json"]);
  });

  it("rejects a skip flag on the explicit full command before starting Eve", () => {
    const result = runScript(
      "build:full",
      ["--skip-sandbox-prewarm"],
      "artifacts",
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "--skip-sandbox-prewarm is only supported in artifacts mode.",
    );
    expect(result.sdkArgs).toBeNull();
  });

  it("keeps the explicit artifact command distinct from inherited full mode", () => {
    const result = runScript("build:artifacts", [], "full");
    expect(result.status, result.stderr).toBe(0);
    expect(result.sdkArgs).toEqual(["build", "--skip-sandbox-prewarm"]);
  });
});
