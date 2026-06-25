import { describe, expect, it } from "vitest";

import {
  getAppBuildStep,
  getProcessListCommand,
  getSharedPackageBuildSteps,
  getSleepCommand,
  resolveTurboBin,
} from "../../../scripts/verify/ci-build.mjs";

describe("ci-build command planning", () => {
  it("uses the first available Windows Turbo binary candidate", () => {
    const existingPaths = new Set([
      "/repo/node_modules/.bin/turbo.cmd",
      "/repo/node_modules/.bin/turbo",
    ]);

    const result = resolveTurboBin({
      platform: "win32",
      exists: (candidate: string) =>
        existingPaths.has(
          candidate.replace(/^.*node_modules/, "/repo/node_modules"),
        ),
    });

    expect(result.endsWith("node_modules/.bin/turbo.cmd")).toBe(true);
  });

  it("builds shared packages without Turbo on Windows", () => {
    const steps = getSharedPackageBuildSteps({
      platform: "win32",
      turboBin: "node_modules/.bin/turbo.cmd",
    });

    expect(steps).toContainEqual({
      label: "api",
      command: "node",
      args: [
        "scripts/run-with-ci-env.mjs",
        "--",
        "bun",
        "run",
        "--cwd",
        "packages/api",
        "build",
      ],
    });
    expect(steps).toContainEqual(
      expect.objectContaining({
        label: "ui",
        args: expect.arrayContaining(["packages/ui"]),
      }),
    );
    expect(steps.flatMap((step) => step.args)).not.toContain(
      "node_modules/.bin/turbo.cmd",
    );
  });

  it("keeps the Turbo shared-package build on non-Windows platforms", () => {
    expect(
      getSharedPackageBuildSteps({
        platform: "linux",
        turboBin: "node_modules/.bin/turbo",
      }),
    ).toEqual([
      {
        label: "shared packages",
        command: "node",
        args: [
          "scripts/run-with-ci-env.mjs",
          "--",
          "node_modules/.bin/turbo",
          "run",
          "build",
          "--filter=!@asym/admin",
          "--filter=!@asym/donor",
          "--filter=!@asym/missionary-app",
          "--concurrency=1",
        ],
      },
    ]);
  });

  it("runs app builds directly through Bun on Windows", () => {
    expect(
      getAppBuildStep(
        {
          id: "admin",
          filter: "@asym/admin",
          cwd: "apps/admin",
          nextDir: "apps/admin/.next",
        },
        { platform: "win32", turboBin: "node_modules/.bin/turbo.cmd" },
      ),
    ).toEqual({
      label: "admin",
      command: "node",
      args: [
        "scripts/run-with-ci-env.mjs",
        "--",
        "bun",
        "run",
        "--cwd",
        "apps/admin",
        "build",
      ],
    });
  });

  it("uses native Windows process and sleep commands for lock coordination", () => {
    expect(getProcessListCommand("win32")).toEqual({
      command: "powershell",
      args: [
        "-NoProfile",
        "-Command",
        "Get-CimInstance Win32_Process | Select-Object -ExpandProperty CommandLine",
      ],
    });

    expect(getSleepCommand(0.1, "win32")).toEqual({
      command: "powershell",
      args: ["-NoProfile", "-Command", "Start-Sleep -Seconds 1"],
    });
  });
});
