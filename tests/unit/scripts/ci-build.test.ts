import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  getAppBuildStep,
  getProcessListCommand,
  getRequestedApps,
  getSharedPackageBuildSteps,
  getSleepCommand,
  resolveTurboBin,
} from "../../../scripts/verify/ci-build.mjs";

describe("ci-build command planning", () => {
  it("routes app package build scripts through ci-build link repair", () => {
    const packageJson = JSON.parse(
      readFileSync(path.resolve("package.json"), "utf8"),
    );

    expect(packageJson.scripts["build:strict"]).toBe(
      "node scripts/verify/ci-build.mjs --strict",
    );
    expect(packageJson.scripts["build:admin"]).toBe(
      "node scripts/verify/ci-build.mjs --app admin",
    );
    expect(packageJson.scripts["build:admin:strict"]).toBe(
      "node scripts/verify/ci-build.mjs --app admin",
    );
    expect(packageJson.scripts["build:donor"]).toBe(
      "node scripts/verify/ci-build.mjs --app donor",
    );
    expect(packageJson.scripts["build:donor:strict"]).toBe(
      "node scripts/verify/ci-build.mjs --app donor",
    );
    expect(packageJson.scripts["build:missionary"]).toBe(
      "node scripts/verify/ci-build.mjs --app missionary",
    );
    expect(packageJson.scripts["build:missionary:strict"]).toBe(
      "node scripts/verify/ci-build.mjs --app missionary",
    );
  });

  it("uses the first available Windows Turbo binary candidate", () => {
    // resolveTurboBin builds paths with the OS-native separator, so on Windows
    // `result` and the mocked candidates use "\\". Normalize to forward slashes
    // so the candidate lookup and the assertion are path-separator agnostic and
    // pass on both Windows and the Linux CI runner.
    const existingPaths = new Set([
      "/repo/node_modules/.bin/turbo.cmd",
      "/repo/node_modules/.bin/turbo",
    ]);

    const result = resolveTurboBin({
      platform: "win32",
      exists: (candidate: string) =>
        existingPaths.has(
          candidate
            .replaceAll("\\", "/")
            .replace(/^.*node_modules/, "/repo/node_modules"),
        ),
    });

    expect(result.replaceAll("\\", "/")).toMatch(
      /node_modules\/\.bin\/turbo\.cmd$/,
    );
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

  it("keeps strict builds off CI env defaults while using ci-build repair", () => {
    expect(
      getSharedPackageBuildSteps({
        platform: "linux",
        strict: true,
        turboBin: "node_modules/.bin/turbo",
      }),
    ).toEqual([
      {
        label: "shared packages",
        command: "node_modules/.bin/turbo",
        args: [
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

  it("selects one app when --app is provided", () => {
    const apps = [
      {
        id: "admin",
        filter: "@asym/admin",
        cwd: "apps/admin",
        nextDir: "apps/admin/.next",
      },
      {
        id: "donor",
        filter: "@asym/donor",
        cwd: "apps/donor",
        nextDir: "apps/donor/.next",
      },
    ];

    expect(getRequestedApps(["--app", "admin"], apps)).toEqual([apps[0]]);
    expect(getRequestedApps([], apps)).toEqual(apps);
  });

  it("rejects unknown app ids", () => {
    expect(() =>
      getRequestedApps(
        ["--app", "unknown"],
        [
          {
            id: "admin",
            filter: "@asym/admin",
            cwd: "apps/admin",
            nextDir: "apps/admin/.next",
          },
        ],
      ),
    ).toThrow('Unknown app "unknown". Expected one of: admin.');
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
