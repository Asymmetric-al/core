import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, it } from "vitest";

const rootDir = fileURLToPath(new URL("../..", import.meta.url));

it("records executed source coverage across isolated Vitest module reloads", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(tmpdir(), "core-vitest-coverage-"),
  );
  const reportsDirectory = path.join(temporaryDirectory, "reports");
  const configFile = path.join(temporaryDirectory, "vitest.config.mjs");
  writeFileSync(
    configFile,
    `export default ${JSON.stringify({
      root: rootDir,
      test: {
        include: ["tests/fixtures/vitest-coverage/covered.test.ts"],
        isolate: true,
        maxWorkers: 1,
        coverage: {
          enabled: true,
          provider: "custom",
          customProviderModule: path.join(
            rootDir,
            "vitest.coverage-provider.mjs",
          ),
          reportsDirectory,
        },
      },
    })};\n`,
  );

  try {
    const result = spawnSync(
      process.execPath,
      [
        path.join(rootDir, "node_modules/vitest/vitest.mjs"),
        "run",
        "--config",
        configFile,
      ],
      { cwd: rootDir, encoding: "utf8", timeout: 30_000 },
    );
    expect(result.error).toBeUndefined();
    expect(result.status, result.stdout + result.stderr).toBe(0);

    const coverage = JSON.parse(
      readFileSync(path.join(reportsDirectory, "v8-raw-coverage.json"), "utf8"),
    ) as {
      scripts: Array<{
        url: string;
        functions: Array<{
          functionName: string;
          ranges: Array<{ count: number }>;
        }>;
      }>;
    };
    const sourcePath = path.join(
      rootDir,
      "tests/fixtures/vitest-coverage/covered.ts",
    );
    const sourceCoverage = coverage.scripts.find(
      (script) => fileURLToPath(script.url) === sourcePath,
    );
    expect(sourceCoverage).toBeDefined();
    expect(
      sourceCoverage?.functions.some(
        (fn) =>
          fn.functionName === "coverageLabel" &&
          fn.ranges.some((range) => range.count > 0),
      ),
    ).toBe(true);
    expect(
      readFileSync(
        path.join(reportsDirectory, "coverage-warnings.log"),
        "utf8",
      ).trim(),
    ).toBe("");
    expect(result.stdout + result.stderr).not.toContain("[vitest-coverage:");
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});
