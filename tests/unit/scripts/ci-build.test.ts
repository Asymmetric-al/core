import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  failedAppsRecordPath,
  findStaleNextLockFiles,
  getAppBuildStep,
  getDebugPrerenderStep,
  getProcessListCommand,
  getRequestedApps,
  getSharedPackageBuildSteps,
  getSleepCommand,
  planDebugPrerender,
  resolveTurboBin,
} from "../../../scripts/verify/ci-build.mjs";

describe("ci-build command planning", () => {
  it("marks web dependency and app builds as Eve artifacts only", () => {
    const app = {
      id: "admin",
      filter: "@asym/admin",
      cwd: "apps/admin",
      nextDir: "apps/admin/.next",
    };
    for (const platform of ["linux", "win32"]) {
      for (const strict of [false, true]) {
        const steps = [
          ...getSharedPackageBuildSteps({ platform, strict, apps: [app] }),
          getAppBuildStep(app, { platform, strict }),
        ];
        for (const step of steps) {
          expect(step.env).toEqual({ CORE_EVE_BUILD_MODE: "artifacts" });
        }
      }
    }
  });

  it("keeps the workspace-link repair wired into CI and postinstall", () => {
    // CI correctness depends on these two call sites, but neither is reachable
    // from a unit test - only the repair script's own tests exercise the logic.
    // Without this contract, deleting either call passes the whole suite.
    const ciBuildSource = readFileSync(
      path.resolve("scripts/verify/ci-build.mjs"),
      "utf8",
    );
    const packageJson = JSON.parse(
      readFileSync(path.resolve("package.json"), "utf8"),
    );

    expect(ciBuildSource).toContain("repairWorkspaceLinks(REPO_ROOT)");
    // Once at entry, and again inside the per-app loop: a turbo cache hit
    // during an earlier app's build can re-hollow a junction mid-pipeline.
    expect(
      ciBuildSource.split("repairAndLogWorkspaceLinks()").length - 1,
    ).toBeGreaterThanOrEqual(2);
    expect(packageJson.scripts.postinstall).toContain(
      "node scripts/repair-workspace-links.mjs",
    );
  });

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
    // The `:strict` variants must forward `--strict` so ci-build skips the CI
    // env defaults; without it they are indistinguishable from the plain
    // scripts and the distinction is silently lost.
    expect(packageJson.scripts["build:admin:strict"]).toBe(
      "node scripts/verify/ci-build.mjs --app admin --strict",
    );
    expect(packageJson.scripts["build:donor"]).toBe(
      "node scripts/verify/ci-build.mjs --app donor",
    );
    expect(packageJson.scripts["build:donor:strict"]).toBe(
      "node scripts/verify/ci-build.mjs --app donor --strict",
    );
    expect(packageJson.scripts["build:missionary"]).toBe(
      "node scripts/verify/ci-build.mjs --app missionary",
    );
    expect(packageJson.scripts["build:missionary:strict"]).toBe(
      "node scripts/verify/ci-build.mjs --app missionary --strict",
    );
    expect(packageJson.scripts["build:factory-console"]).toBe(
      "node scripts/verify/ci-build.mjs --app factory-console",
    );
    expect(packageJson.scripts["build:factory-console:strict"]).toBe(
      "node scripts/verify/ci-build.mjs --app factory-console --strict",
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
      env: { CORE_EVE_BUILD_MODE: "artifacts" },
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
        env: { CORE_EVE_BUILD_MODE: "artifacts" },
        command: "node",
        args: [
          "scripts/run-with-ci-env.mjs",
          "--",
          "node_modules/.bin/turbo",
          "run",
          "build",
          "--filter=@asym/admin^...",
          "--filter=@asym/donor^...",
          "--filter=@asym/missionary-app^...",
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
        env: { CORE_EVE_BUILD_MODE: "artifacts" },
        command: "node_modules/.bin/turbo",
        args: [
          "run",
          "build",
          "--filter=@asym/admin^...",
          "--filter=@asym/donor^...",
          "--filter=@asym/missionary-app^...",
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
      env: { CORE_EVE_BUILD_MODE: "artifacts" },
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

  it("builds the operator Console only on request, never in the product build", () => {
    const productApps = getRequestedApps([]);
    expect(productApps.map((app: { id: string }) => app.id)).toEqual([
      "admin",
      "donor",
      "missionary",
    ]);
    const [console] = getRequestedApps(["--app", "factory-console"]);
    expect(console).toEqual({
      id: "factory-console",
      filter: "@asym/factory-console",
      cwd: "apps/factory-console",
      nextDir: "apps/factory-console/.next",
      defaultBuild: false,
    });
    expect(
      getSharedPackageBuildSteps({
        platform: "linux",
        strict: true,
        turboBin: "node_modules/.bin/turbo",
        apps: [console],
      })[0]!.args,
    ).toEqual([
      "run",
      "build",
      "--filter=@asym/factory-console^...",
      "--concurrency=1",
    ]);
    expect(
      getAppBuildStep(console, {
        platform: "linux",
        strict: true,
        turboBin: "node_modules/.bin/turbo",
      }).args,
    ).toEqual([
      "run",
      "build",
      "--filter=@asym/factory-console",
      "--concurrency=1",
    ]);
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

describe("Next lock clean-up", () => {
  const roots: string[] = [];
  afterEach(() => {
    for (const root of roots.splice(0))
      rmSync(root, { recursive: true, force: true });
  });

  it("finds build locks but never a dev server's lock under .next/dev", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "ci-build-locks-"));
    roots.push(root);
    for (const file of [
      "apps/donor/.next/lock",
      "apps/donor/.next/dev/lock",
      "apps/donor/.next/dev/cache/turbopack/lock",
      "apps/admin/.next/cache/build/lock",
    ]) {
      mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      writeFileSync(path.join(root, file), "");
    }
    const found = findStaleNextLockFiles(root)
      .map((file) => path.relative(root, file).split(path.sep).join("/"))
      .sort();
    expect(found).toEqual([
      "apps/admin/.next/cache/build/lock",
      "apps/donor/.next/lock",
    ]);
  });
});

describe("prerender diagnostics after a failed CI build", () => {
  const donor = getRequestedApps(["--app", "donor"])[0]!;
  const github = { GITHUB_ACTIONS: "true", RUNNER_TEMP: "/runner/tmp" };

  it("rebuilds an app with --debug-prerender through the CI env wrapper", () => {
    expect(getDebugPrerenderStep(donor)).toEqual({
      label: "donor (debug prerender)",
      command: "node",
      args: [
        "scripts/run-with-ci-env.mjs",
        "--",
        "bun",
        "run",
        "--cwd",
        "apps/donor",
        "build",
        "--",
        "--debug-prerender",
      ],
      env: { CORE_EVE_BUILD_MODE: "artifacts" },
    });
  });

  it("records a failed app only in GitHub Actions outside Vercel", () => {
    expect(failedAppsRecordPath(github)).toBe(
      path.join("/runner/tmp", "ci-build-failed-apps"),
    );
    for (const env of [
      {},
      { RUNNER_TEMP: "/runner/tmp" },
      { ...github, VERCEL: "1" },
      { GITHUB_ACTIONS: "true" },
    ])
      expect(failedAppsRecordPath(env)).toBeNull();
  });

  it("plans debug rebuilds only for recorded, known apps", () => {
    const read = () => "donor\nnot-an-app\ndonor\n";
    expect(planDebugPrerender({ env: github, read })).toEqual({
      steps: [getDebugPrerenderStep(donor)],
      reason: "rebuilding donor with --debug-prerender",
    });
  });

  it("refuses on Vercel or outside GitHub Actions, and explains an empty record", () => {
    const read = () => "donor\n";
    expect(
      planDebugPrerender({ env: { ...github, VERCEL: "1" }, read }).steps,
    ).toEqual([]);
    expect(planDebugPrerender({ env: {}, read }).steps).toEqual([]);
    const none = planDebugPrerender({
      env: github,
      read: () => {
        throw Object.assign(new Error("missing"), { code: "ENOENT" });
      },
    });
    expect(none.steps).toEqual([]);
    expect(none.reason).toMatch(/no app build failed/);
  });

  it("never adds the flag to the normal app build", () => {
    for (const platform of ["linux", "win32"])
      for (const strict of [false, true])
        expect(
          getAppBuildStep(donor, { platform, strict }).args.join(" "),
        ).not.toContain("debug-prerender");
  });
});
