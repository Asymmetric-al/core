import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { expect, it } from "vitest";

const rootDir = fileURLToPath(new URL("../..", import.meta.url));
const metrics = ["lines", "statements", "branches", "functions"] as const;
type Metric = { total: number; covered: number; pct: number };
type FileCoverage = {
  path: string;
  statementMap: Record<string, { start: { line: number } }>;
  fnMap: Record<string, { name: string; loc: { start: { line: number } } }>;
  f: Record<string, number>;
  b: Record<string, number[]>;
};

it("merges isolated TypeScript execution into measured coverage and enforces thresholds", () => {
  const temporaryDirectory = mkdtempSync(
    path.join(tmpdir(), "core-vitest-coverage-"),
  );
  const configFile = path.join(temporaryDirectory, "vitest.config.mjs");
  const reportsDirectory = path.join(temporaryDirectory, "reports");
  const runFixture = (thresholds = {}) => {
    writeFileSync(
      configFile,
      `import base from ${JSON.stringify(pathToFileURL(path.join(rootDir, "vitest.config.mts")).href)};
export default {
  ...base,
  root: ${JSON.stringify(rootDir)},
  test: {
    ...base.test,
    include: ["tests/fixtures/vitest-coverage/*.test.ts"],
    isolate: true,
    maxWorkers: 1,
    fileParallelism: false,
    coverage: {
      ...base.test.coverage,
      enabled: true,
      reportsDirectory: ${JSON.stringify(reportsDirectory)},
      reporter: ["json", "json-summary"],
      include: ["tests/fixtures/vitest-coverage/covered.ts", "tests/fixtures/vitest-coverage/unimported.ts"],
      exclude: [],
      thresholds: ${JSON.stringify(thresholds)},
    },
  },
};
`,
    );
    const result = spawnSync(
      process.execPath,
      [
        path.join(rootDir, "node_modules/vitest/vitest.mjs"),
        "run",
        "--config",
        configFile,
      ],
      {
        cwd: rootDir,
        encoding: "utf8",
        timeout: 60_000,
        maxBuffer: 2 * 1024 * 1024,
      },
    );
    expect(result.error).toBeUndefined();
    expect(result.stdout + result.stderr).toMatch(/2 passed/);
    return result;
  };

  try {
    const result = runFixture();
    expect(result.status, result.stdout + result.stderr).toBe(0);
    const coverage: Record<string, FileCoverage> = JSON.parse(
      readFileSync(path.join(reportsDirectory, "coverage-final.json"), "utf8"),
    );
    const sourcePath = path.join(
      rootDir,
      "tests/fixtures/vitest-coverage/covered.ts",
    );
    const source = coverage[sourcePath];
    expect(
      source,
      "coverage-final.json must be an Istanbul source map",
    ).toBeDefined();
    expect(source.path).toBe(sourcePath);
    expect(
      Object.values(source.statementMap).every(
        (location) => location.start.line > 0,
      ),
    ).toBe(true);
    const functions = Object.entries(source.fnMap);
    for (const name of ["coverageLabel", "coverageDouble"]) {
      const fn = functions.find(([, definition]) => definition.name === name);
      expect(fn, name).toBeDefined();
      expect(source.f[fn![0]], name).toBeGreaterThan(0);
    }
    const unexecuted = functions.find(
      ([, definition]) => definition.name === "coverageNever",
    );
    expect(unexecuted).toBeDefined();
    expect(source.f[unexecuted![0]]).toBe(0);
    const branches = Object.values(source.b).flat();
    expect(branches.some((count) => count > 0)).toBe(true);
    expect(branches).toContain(0);

    const summary: Record<
      string,
      Record<(typeof metrics)[number], Metric>
    > = JSON.parse(
      readFileSync(
        path.join(reportsDirectory, "coverage-summary.json"),
        "utf8",
      ),
    );
    const unimportedPath = path.join(
      rootDir,
      "tests/fixtures/vitest-coverage/unimported.ts",
    );
    for (const metric of metrics) {
      expect(summary.total[metric].total, metric).toBeGreaterThan(0);
      expect(summary.total[metric].covered, metric).toBeGreaterThan(0);
      expect(summary.total[metric].pct, metric).toBeLessThan(100);
      expect(summary[unimportedPath][metric].total, metric).toBeGreaterThan(0);
      expect(summary[unimportedPath][metric].covered, metric).toBe(0);
    }

    const strict = runFixture({ branches: 100 });
    expect(strict.status, strict.stdout + strict.stderr).not.toBe(0);
    expect(strict.stdout + strict.stderr).toMatch(
      /coverage for branches.*does not meet.*threshold/is,
    );
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}, 150_000);
