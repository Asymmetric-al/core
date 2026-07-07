import { describe, expect, it, vi } from "vitest";

import {
  buildVitestInvocation,
  runBunVersionGuard,
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

  it("uses a shell command string for Windows vitest runs", () => {
    expect(
      buildVitestInvocation(["--coverage", "--no-file-parallelism"], "win32"),
    ).toEqual({
      command: "bunx vitest run --coverage --no-file-parallelism",
      args: [],
      shell: true,
    });
  });
});
