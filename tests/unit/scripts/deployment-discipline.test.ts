import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  formatDeploymentDisciplineReport,
  validateGitHubBranchProtection,
  validateLocalVercelConfig,
  validateVercelProjectSettings,
} from "../../../scripts/verify/deployment-discipline.mjs";

const project = {
  key: "admin",
  project: "admin",
  vercelConfigPath: "apps/admin/vercel.json",
};

const projects = [
  {
    key: "admin",
    project: "admin",
    vercelConfigPath: "apps/admin/vercel.json",
  },
  {
    key: "donor",
    project: "donor",
    vercelConfigPath: "apps/donor/vercel.json",
  },
  {
    key: "missionary",
    project: "missionary",
    vercelConfigPath: "apps/missionary/vercel.json",
  },
];

const localConfig = {
  ignoreCommand: "node ../../scripts/vercel/should-ignore-build.mjs admin",
  git: {
    deploymentEnabled: {
      "*": false,
      develop: true,
      epic: true,
      main: false,
    },
  },
};

const branchProtection = {
  allow_force_pushes: { enabled: true },
  required_status_checks: {
    strict: true,
    contexts: ["ci-gate", "integration-gate", "e2e-gate", "e2e-smoke-gate"],
  },
  required_pull_request_reviews: {
    required_approving_review_count: 1,
  },
};

const branchProtectionRule = {
  allowsForcePushes: false,
  requiresDeployments: false,
  requiredDeploymentEnvironments: [],
};

const vercelSettings = {
  link: {
    productionBranch: "epic",
  },
  previewDeploymentsDisabled: true,
  enableAffectedProjectsDeployments: true,
  resourceConfig: {
    buildQueue: {
      configuration: "WAIT_FOR_NAMESPACE_QUEUE",
    },
  },
};

describe("deployment discipline verifier", () => {
  it("keeps the required production E2E gate bounded for CI spend control", () => {
    const workflow = readFileSync(
      ".github/workflows/ci-integration.yml",
      "utf8",
    );
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(workflow).toContain("test-e2e-smoke:");
    expect(workflow).toContain("e2e-smoke-gate:");
    expect(workflow).toContain("run: bun run test:e2e:smoke");
    expect(workflow).toContain("run: bun run test:e2e:production-gate");
    expect(workflow).not.toContain("run: bun run test:e2e --project=chromium");
    expect(workflow).toContain("timeout-minutes: 30");
    expect(workflow).toContain("timeout-minutes: 25");
    expect(workflow).toContain("timeout-minutes: 10");
    expect(packageJson.scripts["test:e2e:smoke"]).toContain(
      "tests/e2e/usability-smoke.spec.ts",
    );
    expect(packageJson.scripts["test:e2e:smoke"]).toContain(
      "tests/e2e/support-hub.smoke.spec.ts",
    );
    expect(packageJson.scripts["test:e2e:production-gate"]).toContain(
      "tests/e2e/usability-smoke.spec.ts",
    );
    expect(packageJson.scripts["test:e2e:production-gate"]).toContain(
      "tests/e2e/support-hub.smoke.spec.ts",
    );
    expect(packageJson.scripts["test:e2e:cms"]).toContain("@cms-local");
  });

  it("accepts the source-controlled app Vercel configs", () => {
    for (const appProject of projects) {
      const config = JSON.parse(
        readFileSync(appProject.vercelConfigPath, "utf8"),
      );
      const checks = validateLocalVercelConfig({
        project: appProject,
        config,
      });

      expect(checks.every((item) => item.ok)).toBe(true);
    }
  });

  it("accepts local Vercel config with ignored builds and only epic/develop deployments", () => {
    const checks = validateLocalVercelConfig({ project, config: localConfig });

    expect(checks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ok: true })]),
    );
    expect(checks.every((item) => item.ok)).toBe(true);
  });

  it("detects bad local Vercel gates", () => {
    const checks = validateLocalVercelConfig({
      project,
      config: {
        ignoreCommand: "echo nope",
        git: { deploymentEnabled: { "*": true } },
      },
    });

    expect(checks.some((item) => !item.ok)).toBe(true);
    expect(formatDeploymentDisciplineReport(checks)).toContain(
      "Overall: BLOCKED",
    );
  });

  it("accepts protected GitHub branches with required checks and force pushes disabled", () => {
    const developChecks = validateGitHubBranchProtection({
      branch: "develop",
      protection: branchProtection,
      branchRule: branchProtectionRule,
      requiredContexts: ["ci-gate", "integration-gate", "e2e-smoke-gate"],
    });
    const epicChecks = validateGitHubBranchProtection({
      branch: "epic",
      protection: branchProtection,
      branchRule: branchProtectionRule,
      requiredContexts: ["ci-gate", "integration-gate", "e2e-gate"],
    });

    expect(developChecks.every((item) => item.ok)).toBe(true);
    expect(epicChecks.every((item) => item.ok)).toBe(true);
  });

  it("detects missing GitHub status checks and enabled force pushes", () => {
    const checks = validateGitHubBranchProtection({
      branch: "epic",
      protection: {
        ...branchProtection,
        required_status_checks: { strict: false, contexts: [] },
      },
      branchRule: {
        allowsForcePushes: true,
      },
      requiredContexts: ["ci-gate", "integration-gate", "e2e-gate"],
    });

    expect(checks.filter((item) => !item.ok).map((item) => item.label)).toEqual(
      expect.arrayContaining([
        "epic force pushes disabled",
        "epic requires up-to-date status checks",
        "epic requires ci-gate",
        "epic requires integration-gate",
        "epic requires e2e-gate",
      ]),
    );
  });

  it("detects required deployments for disabled Vercel Preview environments", () => {
    const checks = validateGitHubBranchProtection({
      branch: "develop",
      protection: branchProtection,
      branchRule: {
        ...branchProtectionRule,
        requiresDeployments: true,
        requiredDeploymentEnvironments: [
          "Preview – admin",
          "Preview – donor",
          "Preview – missionary",
        ],
      },
      requiredContexts: ["ci-gate", "integration-gate", "e2e-smoke-gate"],
    });

    expect(checks.filter((item) => !item.ok).map((item) => item.label)).toEqual(
      expect.arrayContaining([
        "develop does not require disabled Vercel Preview deployments",
      ]),
    );
  });

  it("accepts Vercel project settings with affected builds and serialized branch queue", () => {
    const checks = validateVercelProjectSettings({
      project,
      settings: vercelSettings,
    });

    expect(checks.every((item) => item.ok)).toBe(true);
  });

  it("detects disabled affected-project deployments and wrong build queue config", () => {
    const checks = validateVercelProjectSettings({
      project,
      settings: {
        ...vercelSettings,
        enableAffectedProjectsDeployments: false,
        resourceConfig: {
          buildQueue: {
            configuration: "SKIP_NAMESPACE_QUEUE",
          },
        },
      },
    });

    expect(checks.filter((item) => !item.ok).map((item) => item.label)).toEqual(
      expect.arrayContaining([
        "admin affected-project deployments enabled",
        "admin build queue is serialized per branch",
      ]),
    );
  });
});
