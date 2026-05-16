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
    contexts: ["ci-gate", "integration-gate"],
  },
  required_pull_request_reviews: {
    required_approving_review_count: 1,
  },
};

const branchProtectionRule = {
  allowsForcePushes: false,
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
    const checks = validateGitHubBranchProtection({
      branch: "develop",
      protection: branchProtection,
      branchRule: branchProtectionRule,
      requiredContexts: ["ci-gate", "integration-gate"],
    });

    expect(checks.every((item) => item.ok)).toBe(true);
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
