import { describe, expect, it } from "vitest";

import {
  EXPECTED_PROJECTS,
  formatBuildControlsReport,
  validateIgnoredBuildDecisionMatrix,
  validateLocalVercelConfig,
  validateLocalVercelConfigs,
  validateRemoteCacheStatus,
  validateTurboIgnoreFiles,
  validateVercelProjectSettings,
} from "../../../scripts/verify/vercel-build-controls.mjs";

const adminProject = EXPECTED_PROJECTS[0]!;

const localConfig = {
  $schema: "https://openapi.vercel.sh/vercel.json",
  installCommand: "bun install --cwd ../.. --frozen-lockfile",
  buildCommand: "cd ../.. && bun run build:admin",
  ignoreCommand: "node ../../scripts/vercel/should-ignore-build.mjs admin",
  git: {
    deploymentEnabled: {
      "*": false,
      develop: true,
      production: true,
      main: false,
    },
  },
};

describe("Vercel build controls verifier", () => {
  it("maps the three app projects to expected build-control commands", () => {
    expect(EXPECTED_PROJECTS).toEqual([
      {
        key: "admin",
        projectId: "prj_SB9DucsrJOT0wF1v43SWMFsSNdn8",
        rootDirectory: "apps/admin",
        vercelConfigPath: "apps/admin/vercel.json",
        installCommand: "bun install --cwd ../.. --frozen-lockfile",
        buildCommand: "cd ../.. && bun run build:admin",
        ignoreCommand:
          "node ../../scripts/vercel/should-ignore-build.mjs admin",
      },
      {
        key: "donor",
        projectId: "prj_dZG3XkklLVZyqm85FW5Vvv7ph3kL",
        rootDirectory: "apps/donor",
        vercelConfigPath: "apps/donor/vercel.json",
        installCommand: "bun install --cwd ../.. --frozen-lockfile",
        buildCommand: "cd ../.. && bun run build:donor",
        ignoreCommand:
          "node ../../scripts/vercel/should-ignore-build.mjs donor",
      },
      {
        key: "missionary",
        projectId: "prj_6tXSJKsdv2JpK70GKkg9HIg5hiYN",
        rootDirectory: "apps/missionary",
        vercelConfigPath: "apps/missionary/vercel.json",
        installCommand: "bun install --cwd ../.. --frozen-lockfile",
        buildCommand: "cd ../.. && bun run build:missionary",
        ignoreCommand:
          "node ../../scripts/vercel/should-ignore-build.mjs missionary",
      },
    ]);
  });

  it("validates the source-controlled app vercel.json settings", () => {
    const checks = validateLocalVercelConfig({
      project: adminProject,
      config: localConfig,
    });

    expect(checks.every((item) => item.ok)).toBe(true);
    expect(validateLocalVercelConfigs().every((item) => item.ok)).toBe(true);
    expect(validateTurboIgnoreFiles().every((item) => item.ok)).toBe(true);
  });

  it("fails local config checks when build controls drift", () => {
    const checks = validateLocalVercelConfig({
      project: adminProject,
      config: {
        ...localConfig,
        buildCommand: "bun run build",
      },
    });

    expect(checks).toContainEqual(
      expect.objectContaining({
        ok: false,
        label: "admin vercel.json buildCommand",
        detail: "bun run build",
      }),
    );
  });

  it("rejects bunVersion because that opts Vercel Functions off Node onto Bun", () => {
    // https://vercel.com/changelog/bun-1-4-is-now-available-in-vercel-functions
    // bunVersion is the Functions/Middleware runtime, not the install tool.
    // Next.js on Bun also requires `bun run --bun next build`. Neither belongs
    // in these Node 24 Next.js apps.
    for (const bunVersion of ["1.4.x", "1.x"] as const) {
      const checks = validateLocalVercelConfig({
        project: adminProject,
        config: {
          ...localConfig,
          bunVersion,
        },
      });

      expect(checks).toContainEqual(
        expect.objectContaining({
          ok: false,
          label: "admin vercel.json omits bunVersion (Node Functions runtime)",
          detail: bunVersion,
        }),
      );
    }
  });

  it("rejects bun --bun in Vercel install/build commands", () => {
    const checks = validateLocalVercelConfig({
      project: adminProject,
      config: {
        ...localConfig,
        buildCommand: "cd ../.. && bun run --bun build:admin",
      },
    });

    expect(checks).toContainEqual(
      expect.objectContaining({
        ok: false,
        label: "admin vercel.json commands stay off bun --bun",
        detail: "cd ../.. && bun run --bun build:admin",
      }),
    );
  });

  it("validates the ignored-build decision matrix", () => {
    expect(validateIgnoredBuildDecisionMatrix().every((item) => item.ok)).toBe(
      true,
    );
  });

  it("validates live Vercel project settings without requiring command settings", () => {
    const checks = validateVercelProjectSettings({
      project: adminProject,
      settings: {
        id: adminProject.projectId,
        name: "admin",
        rootDirectory: "apps/admin",
        buildCommand: "bun run build",
        installCommand: "bun install --cwd ../.. --frozen-lockfile",
        enableAffectedProjectsDeployments: true,
        previewDeploymentsDisabled: true,
        resourceConfig: {
          buildQueue: {
            configuration: "WAIT_FOR_NAMESPACE_QUEUE",
          },
        },
      },
    });

    expect(checks.every((item) => item.ok)).toBe(true);
  });

  it("reports disabled affected-project deployments and remote cache drift", () => {
    expect(
      validateVercelProjectSettings({
        project: adminProject,
        settings: {
          id: adminProject.projectId,
          name: "admin",
          rootDirectory: "apps/admin",
          enableAffectedProjectsDeployments: false,
          previewDeploymentsDisabled: false,
          resourceConfig: {
            buildQueue: {
              configuration: "SKIP_NAMESPACE_QUEUE",
            },
          },
        },
      }),
    ).toContainEqual(
      expect.objectContaining({
        ok: false,
        label: "admin Vercel affected-project deployments enabled",
      }),
    );
    expect(
      validateVercelProjectSettings({
        project: adminProject,
        settings: {
          id: adminProject.projectId,
          name: "admin",
          rootDirectory: "apps/admin",
          enableAffectedProjectsDeployments: false,
          previewDeploymentsDisabled: false,
          resourceConfig: {
            buildQueue: {
              configuration: "SKIP_NAMESPACE_QUEUE",
            },
          },
        },
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ok: false,
          label: "admin Vercel preview deployments disabled",
        }),
        expect.objectContaining({
          ok: false,
          label: "admin Vercel build queue serialized",
        }),
      ]),
    );

    expect(validateRemoteCacheStatus({ status: "disabled" })).toEqual([
      {
        ok: false,
        label: "Vercel Remote Cache status",
        detail: "status=disabled",
      },
    ]);
  });

  it("formats a concise readiness report", () => {
    const report = formatBuildControlsReport(
      [
        {
          ok: true,
          label: "sample",
          detail: "passed",
        },
      ],
      {
        scope: "asymmetric-al",
        teamId: "team_YrLB8jJARcRH0jnF1HPpPGTB",
        remote: false,
      },
    );

    expect(report).toContain("# Vercel Build Controls");
    expect(report).toContain("Remote API checks: skipped");
    expect(report).toContain("Overall: READY");
  });
});
