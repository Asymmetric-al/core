import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
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

    expect(runUnitTests("win32", spawn)).toBe(7);
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

    expect(runUnitTests("linux", spawn)).toBe(0);
    expect(spawn).toHaveBeenCalledOnce();
    expect(spawn).toHaveBeenCalledWith(
      process.execPath,
      [path.resolve("node_modules/vitest/vitest.mjs"), "run", "--coverage"],
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

    expect(runUnitTests("win32", spawn)).toBe(0);
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
});
