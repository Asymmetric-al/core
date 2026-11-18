import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it, vi } from "vitest";

import { ACCEPTANCE_DIR } from "../../../scripts/verify/acceptance-tests.mjs";
import {
  ACCEPTANCE_EXCLUDE,
  buildVitestInvocation,
  runBunVersionGuard,
  runUnitTests,
} from "../../../scripts/verify/unit-tests.mjs";

// No CI event: the input-scoped selection always runs every group.
const LOCAL = { env: {} };

describe("unit test runner", () => {
  it("uses the cross-platform Bun version guard on Windows", () => {
    const spawn = vi.fn(() => ({ status: 0 }));

    expect(runBunVersionGuard(spawn)).toBe(0);
    expect(spawn).toHaveBeenCalledWith(
      process.execPath,
      [path.resolve("scripts/verify/bun-version.mjs")],
      {
        shell: false,
        stdio: "inherit",
      },
    );
  });

  it("uses the local Node CLI for Windows vitest runs", () => {
    expect(
      buildVitestInvocation(["--coverage", "--no-file-parallelism"], "win32"),
    ).toEqual({
      command: process.execPath,
      args: [
        path.resolve("node_modules/vitest/vitest.mjs"),
        "run",
        "--coverage",
        "--no-file-parallelism",
      ],
      shell: false,
    });
  });

  it("stops on Windows when the Bun version guard fails", () => {
    const spawn = vi.fn(() => ({ status: 7 }));

    expect(runUnitTests("win32", spawn, [], LOCAL)).toBe(7);
    expect(spawn).toHaveBeenCalledOnce();
    expect(spawn).toHaveBeenCalledWith(
      process.execPath,
      [path.resolve("scripts/verify/bun-version.mjs")],
      {
        shell: false,
        stdio: "inherit",
      },
    );
  });

  it("skips the Bun version guard on non-Windows platforms", () => {
    const spawn = vi.fn(() => ({ status: 0 }));

    expect(runUnitTests("linux", spawn, [], LOCAL)).toBe(0);
    expect(spawn).toHaveBeenCalledOnce();
    expect(spawn).toHaveBeenCalledWith(
      process.execPath,
      [
        path.resolve("node_modules/vitest/vitest.mjs"),
        "run",
        "--coverage",
        "--exclude",
        "tests/unit/acceptance/**",
      ],
      {
        shell: false,
        stdio: "inherit",
      },
    );
  });

  it("runs vitest with Windows-specific flags after the guard passes", () => {
    const spawn = vi
      .fn()
      .mockReturnValueOnce({ status: 0 })
      .mockReturnValueOnce({ status: 0 });

    expect(runUnitTests("win32", spawn, [], LOCAL)).toBe(0);
    expect(spawn).toHaveBeenCalledTimes(2);
    expect(spawn).toHaveBeenNthCalledWith(
      2,
      process.execPath,
      [
        path.resolve("node_modules/vitest/vitest.mjs"),
        "run",
        "--coverage",
        "--maxWorkers=50%",
        "--testTimeout=120000",
        "--hookTimeout=120000",
        "--no-file-parallelism",
        "--exclude",
        "tests/unit/scripts/bun-version.test.ts",
        "--exclude",
        "tests/unit/acceptance/**",
      ],
      {
        shell: false,
        stdio: "inherit",
      },
    );
  });
});

describe("unit runner argument forwarding", () => {
  it.each(["linux", "win32"])(
    "forwards explicit test filters on %s without losing coverage",
    (platform) => {
      const spawn = vi.fn(
        (_command: string, _args: string[], _options: unknown) => ({
          status: 0,
        }),
      );
      expect(
        runUnitTests(
          platform,
          spawn,
          ["tests/unit/scripts/setup-verify.test.ts", "--maxWorkers=2"],
          LOCAL,
        ),
      ).toBe(0);
      const invocation = spawn.mock.calls.at(-1);
      expect(invocation?.[1]).toContain("--coverage");
      expect(invocation?.[1]).toContain(
        "tests/unit/scripts/setup-verify.test.ts",
      );
      expect(invocation?.[1]).toContain("--maxWorkers=2");
    },
  );

  it("retains unspecified defaults and repeatable exclusions on Windows", () => {
    const spawn = vi.fn((_command: string, _args: string[]) => ({ status: 0 }));
    runUnitTests(
      "win32",
      spawn,
      ["--max-workers", "2", "--exclude", "custom/**"],
      LOCAL,
    );
    const args = spawn.mock.calls.at(-1)?.[1];
    expect(args).not.toContain("--maxWorkers=50%");
    expect(args).toContain("--coverage");
    expect(args).toContain("--testTimeout=120000");
    expect(args?.filter((arg: string) => arg === "--exclude")).toHaveLength(3);
    expect(args).toContain("tests/unit/scripts/bun-version.test.ts");
    expect(args).toContain("tests/unit/acceptance/**");
    expect(args).toContain("custom/**");
  });

  it("keeps default coverage when only its provider is explicit", () => {
    const spawn = vi.fn((_command: string, _args: string[]) => ({ status: 0 }));
    runUnitTests("linux", spawn, ["--coverage.provider=v8"], LOCAL);
    expect(spawn.mock.calls.at(-1)?.[1]).toContain("--coverage");
  });

  it("does not interpret filters after the option terminator as overrides", () => {
    const spawn = vi.fn((_command: string, _args: string[]) => ({ status: 0 }));
    runUnitTests("linux", spawn, ["--", "--coverage=false"], LOCAL);
    expect(spawn.mock.calls.at(-1)?.[1]).toEqual([
      path.resolve("node_modules/vitest/vitest.mjs"),
      "run",
      "--coverage",
      "--exclude",
      "tests/unit/acceptance/**",
      "--",
      "--coverage=false",
    ]);
  });
});

describe("acceptance tests run once", () => {
  it("excludes exactly the directory the acceptance job runs", () => {
    expect(ACCEPTANCE_EXCLUDE).toBe(`${ACCEPTANCE_DIR}/**`);
  });

  it.each(["linux", "win32"])(
    "leaves the acceptance directory to its own job by default on %s",
    (platform) => {
      const spawn = vi.fn((_command: string, _args: string[]) => ({
        status: 0,
      }));
      runUnitTests(platform, spawn, [], LOCAL);
      const args = spawn.mock.calls.at(-1)?.[1] ?? [];
      const index = args.indexOf(ACCEPTANCE_EXCLUDE);
      expect(index).toBeGreaterThan(0);
      expect(args[index - 1]).toBe("--exclude");
    },
  );

  it.each([
    [
      "linux",
      "tests/unit/acceptance/issue-2153/ci-workflow.acceptance.test.ts",
    ],
    ["win32", "tests\\unit\\acceptance\\issue-2153"],
    ["linux", "acceptance"],
  ])(
    "still runs acceptance files an argument names on %s (%s)",
    (platform, filter) => {
      const spawn = vi.fn((_command: string, _args: string[]) => ({
        status: 0,
      }));
      runUnitTests(platform, spawn, ["--", filter], LOCAL);
      const args = spawn.mock.calls.at(-1)?.[1] ?? [];
      expect(args).not.toContain(ACCEPTANCE_EXCLUDE);
      expect(args).toContain(filter);
    },
  );
});

describe("input-scoped selection", () => {
  const pullRequest = {
    GITHUB_EVENT_NAME: "pull_request",
    GITHUB_BASE_REF: "develop",
    CI_BASE_SHA: "a".repeat(40),
    CI_HEAD_SHA: "b".repeat(40),
  };

  it("excludes a skipped group and says so in the log", () => {
    const spawn = vi.fn((_command: string, _args: string[]) => ({ status: 0 }));
    const log = vi.fn();
    runUnitTests("linux", spawn, [], {
      env: pullRequest,
      readChanges: () => ["docs/ci.md"],
      analyze: () => ({
        scoped: ["tests/unit/scripts/archon-a.test.ts"],
        unscoped: [],
      }),
      log,
    });
    const args = spawn.mock.calls.at(-1)?.[1] ?? [];
    expect(args).toContain("tests/unit/scripts/archon-a.test.ts");
    expect(args).toContain(ACCEPTANCE_EXCLUDE);
    expect(log.mock.calls.flat().join(" ")).toMatch(
      /skipping 1 files of the factory group/,
    );
  });

  it("runs every test when the selection fails", () => {
    const spawn = vi.fn((_command: string, _args: string[]) => ({ status: 0 }));
    const log = vi.fn();
    runUnitTests("linux", spawn, [], {
      env: pullRequest,
      readChanges: () => {
        throw new Error("boom");
      },
      log,
    });
    const args = spawn.mock.calls.at(-1)?.[1] ?? [];
    expect(args).not.toContain("tests/unit/scripts/archon-*.test.ts");
    expect(log.mock.calls.flat().join(" ")).toMatch(
      /selection failed.*every test runs/,
    );
  });

  it("runs every test on a push to develop", () => {
    const spawn = vi.fn((_command: string, _args: string[]) => ({ status: 0 }));
    runUnitTests("linux", spawn, [], {
      env: { ...pullRequest, GITHUB_EVENT_NAME: "push", GITHUB_BASE_REF: "" },
      readChanges: () => ["docs/ci.md"],
      log: () => {},
    });
    const args = spawn.mock.calls.at(-1)?.[1] ?? [];
    expect(args).not.toContain("tests/unit/scripts/archon-*.test.ts");
  });
});

describe("installed Vitest dispatch", () => {
  it.each(["linux", "win32"])(
    "uses the frozen local CLI without a shell on %s",
    (platform) => {
      expect(buildVitestInvocation(["--coverage"], platform)).toEqual({
        command: process.execPath,
        args: [
          path.resolve("node_modules/vitest/vitest.mjs"),
          "run",
          "--coverage",
        ],
        shell: false,
      });
    },
  );

  it.each([
    ["linux", "--coverage=false"],
    ["win32", "--coverage=false"],
    ["linux", "--coverage.enabled=false"],
    ["win32", "--no-coverage"],
  ])(
    "lets explicit scalar options override defaults through the real parser on %s with %s",
    (platform, coverageOption) => {
      const directory = mkdtempSync(
        path.join(os.tmpdir(), "unit-runner-options-"),
      );
      try {
        const vitest = pathToFileURL(
          path.resolve("node_modules/vitest/dist/index.js"),
        ).href;
        writeFileSync(
          path.join(directory, "selected.test.mjs"),
          `import { it, expect } from ${JSON.stringify(vitest)};\nit("selected", () => expect(1).toBe(1));\n`,
        );
        const config = path.join(directory, "vitest.config.mjs");
        writeFileSync(
          config,
          `export default ${JSON.stringify({
            root: directory,
            test: { include: ["selected.test.mjs"] },
          })};\n`,
        );
        const results: ReturnType<typeof spawnSync>[] = [];
        const spawn = (command: string, args: string[]) => {
          if (args[0]?.endsWith("bun-version.mjs")) return { status: 0 };
          const result = spawnSync(command, args, {
            encoding: "utf8",
            shell: false,
            timeout: 20_000,
          });
          results.push(result);
          return result;
        };
        const status = runUnitTests(
          platform,
          spawn,
          [
            "--config",
            config,
            coverageOption,
            "--maxWorkers=1",
            "--testTimeout=10000",
            "--hookTimeout=10000",
            "--file-parallelism",
          ],
          LOCAL,
        );
        expect(results).toHaveLength(1);
        expect(results[0]?.error).toBeUndefined();
        expect(String(results[0]?.stderr ?? "")).not.toContain(
          "Expected a single value",
        );
        expect(status, String(results[0]?.stderr ?? "")).toBe(0);
        expect(String(results[0]?.stdout ?? "")).toContain("1 passed");
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    },
  );
});
