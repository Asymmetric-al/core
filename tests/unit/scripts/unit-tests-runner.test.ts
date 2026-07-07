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
    expect(spawn).toHaveBeenCalledWith("bun run verify:bun-version", [], {
      shell: true,
      stdio: "inherit",
    });
  });

  it("uses shell mode for Windows vitest runs", () => {
    expect(
      buildVitestInvocation(["--coverage", "--no-file-parallelism"], "win32"),
    ).toEqual({
      command: "bunx",
      args: ["vitest", "run", "--coverage", "--no-file-parallelism"],
      shell: true,
    });
  });

  it("stops on Windows when the Bun version guard fails", () => {
    const spawn = vi.fn(() => ({ status: 7 }));

    expect(runUnitTests("win32", spawn)).toBe(7);
    expect(spawn).toHaveBeenCalledOnce();
    expect(spawn).toHaveBeenCalledWith("bun run verify:bun-version", [], {
      shell: true,
      stdio: "inherit",
    });
  });

  it("skips the Bun version guard on non-Windows platforms", () => {
    const spawn = vi.fn(() => ({ status: 0 }));

    expect(runUnitTests("linux", spawn)).toBe(0);
    expect(spawn).toHaveBeenCalledOnce();
    expect(spawn).toHaveBeenCalledWith(
      "bunx",
      ["vitest", "run", "--coverage"],
      {
        shell: false,
        stdio: "inherit",
      },
    );
  });
});
