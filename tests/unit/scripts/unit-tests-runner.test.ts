import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  filesVitestRuns,
  unitRunnerVitestArgs,
} from "./support/vitest-selection";
import { ACCEPTANCE_DIR } from "../../../scripts/verify/acceptance-tests.mjs";
import {
  ACCEPTANCE_EXCLUDE,
  buildVitestInvocation,
  runBunVersionGuard,
  runUnitTests,
} from "../../../scripts/verify/unit-tests.mjs";

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

    expect(runUnitTests("win32", spawn, [])).toBe(7);
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

    expect(runUnitTests("linux", spawn, [])).toBe(0);
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

    expect(runUnitTests("win32", spawn, [])).toBe(0);
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
        runUnitTests(platform, spawn, [
          "tests/unit/scripts/setup-verify.test.ts",
          "--maxWorkers=2",
        ]),
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
    runUnitTests("win32", spawn, [
      "--max-workers",
      "2",
      "--exclude",
      "custom/**",
    ]);
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
    runUnitTests("linux", spawn, ["--coverage.provider=v8"]);
    expect(spawn.mock.calls.at(-1)?.[1]).toContain("--coverage");
  });

  it("does not interpret filters after the option terminator as overrides", () => {
    const spawn = vi.fn((_command: string, _args: string[]) => ({ status: 0 }));
    runUnitTests("linux", spawn, ["--", "--coverage=false"]);
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
      runUnitTests(platform, spawn, []);
      const args = spawn.mock.calls.at(-1)?.[1] ?? [];
      const index = args.indexOf(ACCEPTANCE_EXCLUDE);
      expect(index).toBeGreaterThan(0);
      expect(args[index - 1]).toBe("--exclude");
    },
  );

  // What Vitest itself selects, not which arguments the runner passes: a
  // filter Vitest reads as a path inside the acceptance directory must run
  // those files in every form Vitest accepts (review round 8, c2a.10: a
  // fragment such as `issue-2153` selected nothing), and options must not
  // bring the directory back (review round 6, c1.5: `-t acceptance` did).
  describe("as Vitest selects files", () => {
    const FILE = `${ACCEPTANCE_DIR}/issue-2153/ci-workflow.acceptance.test.ts`;
    const NAMES_ACCEPTANCE: [string, string[]][] = [
      ["a root-relative file", [FILE]],
      ["a file and line", [`${FILE}:20`]],
      [
        "the directory with ./ and a trailing slash",
        ["./tests/unit/acceptance/"],
      ],
      ["Windows separators", ["tests\\unit\\acceptance\\issue-2153"]],
      ["an absolute path", [path.resolve(`${ACCEPTANCE_DIR}/issue-2153`)]],
      ["a path fragment", ["acceptance/issue-2153"]],
      ["a directory name", ["issue-2153"]],
      ["a bare file name", ["ci-workflow.acceptance.test.ts"]],
    ];
    const KEEPS_IT_OUT: [string, string[]][] = [
      ["no arguments", []],
      ["a test-name pattern", ["-t", "acceptance"]],
      ["a long test-name pattern", ["--testNamePattern=acceptance criteria"]],
      ["a shard", ["--shard=1/3"]],
      [
        "a filter after the option terminator, which Vitest ignores",
        ["--", `${ACCEPTANCE_DIR}/issue-2153`],
      ],
      [
        "a filter outside the directory",
        ["tests/unit/scripts/acceptance-tests.test.ts"],
      ],
    ];
    const inAcceptance = (file: string) =>
      file.startsWith(`${ACCEPTANCE_DIR}/`);
    let selected = new Map<string, { runner: string[]; vitest?: string[] }>();

    beforeAll(async () => {
      const lists = [
        ...NAMES_ACCEPTANCE.flatMap(([, args]) => [
          unitRunnerVitestArgs(args),
          ["run", ...args],
        ]),
        ...KEEPS_IT_OUT.map(([, args]) => unitRunnerVitestArgs(args)),
      ];
      const files = await filesVitestRuns(lists);
      selected = new Map([
        ...NAMES_ACCEPTANCE.map(([label], index) => [
          label,
          { runner: files[2 * index]!, vitest: files[2 * index + 1]! },
        ]),
        ...KEEPS_IT_OUT.map(([label], index) => [
          label,
          { runner: files[2 * NAMES_ACCEPTANCE.length + index]! },
        ]),
      ] as [string, { runner: string[]; vitest?: string[] }][]);
    }, 300_000);

    it.each(NAMES_ACCEPTANCE)(
      "runs the acceptance files plain Vitest runs for %s",
      (label) => {
        const { runner, vitest } = selected.get(label)!;
        expect(runner.length).toBeGreaterThan(0);
        expect(runner.every(inAcceptance)).toBe(true);
        expect(runner).toEqual(vitest);
      },
    );

    it.each(KEEPS_IT_OUT)("runs no acceptance file for %s", (label) => {
      const { runner } = selected.get(label)!;
      expect(runner.length).toBeGreaterThan(0);
      expect(runner.filter(inAcceptance)).toEqual([]);
    });

    it("runs exactly the named file for a filter outside the directory", () => {
      expect(selected.get("a filter outside the directory")?.runner).toEqual([
        "tests/unit/scripts/acceptance-tests.test.ts",
      ]);
    });
  });
});

describe("every unit test runs on every event", () => {
  // A same-repository pull request into develop whose real diff touches only
  // documents (31cceeacd, from this change's own history). The factory-test
  // selection this replaced skipped 70 factory files for it.
  const DOCS_ONLY = {
    CI_BASE_SHA: "06a7c85e69eabe8dce624c71aa8c670c69de686d",
    CI_HEAD_SHA: "31cceeacd9cbd2354822ec8a1afe5e0a47e2ec21",
  };
  const exclusionsOf = (args: string[]) =>
    args.flatMap((argument, index) =>
      argument === "--exclude" ? [args[index + 1]] : [],
    );

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    [
      "a develop pull request with a documentation-only diff",
      "pull_request",
      "develop",
    ],
    ["a production pull request", "pull_request", "production"],
    ["a push", "push", ""],
    ["a merge-queue run", "merge_group", ""],
    ["a manual dispatch", "workflow_dispatch", ""],
  ])(
    "passes Vitest no exclusion but the acceptance directory for %s",
    (_label, event, baseRef) => {
      vi.stubEnv("GITHUB_EVENT_NAME", event);
      vi.stubEnv("GITHUB_BASE_REF", baseRef);
      vi.stubEnv("CI_BASE_SHA", DOCS_ONLY.CI_BASE_SHA);
      vi.stubEnv("CI_HEAD_SHA", DOCS_ONLY.CI_HEAD_SHA);
      const spawn = vi.fn((_command: string, _args: string[]) => ({
        status: 0,
      }));
      const log = vi.spyOn(console, "log").mockImplementation(() => {});
      try {
        runUnitTests("linux", spawn, []);
      } finally {
        log.mockRestore();
      }
      expect(exclusionsOf(spawn.mock.calls.at(-1)?.[1] ?? [])).toEqual([
        ACCEPTANCE_EXCLUDE,
      ]);
    },
  );
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
        const status = runUnitTests(platform, spawn, [
          "--config",
          config,
          coverageOption,
          "--maxWorkers=1",
          "--testTimeout=10000",
          "--hookTimeout=10000",
          "--file-parallelism",
        ]);
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
