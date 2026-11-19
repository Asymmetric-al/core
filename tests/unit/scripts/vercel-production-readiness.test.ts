import { describe, expect, it } from "vitest";

import {
  branchPatternMatches,
  formatReadinessReport,
  invalidEnvValues,
  isBranchDeploymentEnabled,
  missingEnvKeys,
  missingEnvValues,
  parseDotEnv,
  parseVercelDeployments,
  parseVercelEnvEntries,
  parseVercelEnvKeys,
  parseVercelProjectDetails,
  summarizeProjectReadiness,
  FORBIDDEN_RUNTIME_ENV_NAMES,
  PROJECTS,
} from "../../../scripts/verify/vercel-production-readiness.mjs";

const project = {
  key: "donor",
  project: "donor",
  vercelConfigPath: "apps/donor/vercel.json",
  healthUrl: "https://donor.asymmetric.al/api/health",
  requiredEnv: ["NEXT_PUBLIC_SUPABASE_URL", "STRIPE_SECRET_KEY"],
};

describe("vercel production readiness helpers", () => {
  it("parses Vercel env keys without exposing values", () => {
    const json = JSON.stringify({
      envs: [
        { key: "STRIPE_SECRET_KEY", value: "should-not-be-used" },
        { key: "NEXT_PUBLIC_SUPABASE_URL" },
      ],
    });

    expect(parseVercelEnvEntries(json)).toEqual([
      { key: "NEXT_PUBLIC_SUPABASE_URL", type: undefined },
      { key: "STRIPE_SECRET_KEY", type: undefined },
    ]);
    expect(parseVercelEnvKeys(json)).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL",
      "STRIPE_SECRET_KEY",
    ]);
  });

  it("reports missing required env names", () => {
    expect(
      missingEnvKeys(["NEXT_PUBLIC_SUPABASE_URL"], project.requiredEnv),
    ).toEqual(["STRIPE_SECRET_KEY"]);
  });

  it("parses pulled env files without exposing values", () => {
    expect(
      parseDotEnv(`
# comment
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
STRIPE_SECRET_KEY="sk_test_hidden"
export RESEND_API_KEY='re_hidden'
      `),
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      STRIPE_SECRET_KEY: "sk_test_hidden",
      RESEND_API_KEY: "re_hidden",
    });
  });

  it("reports missing and invalid env values without including secrets", () => {
    const requirements = [
      "NEXT_PUBLIC_SUPABASE_URL",
      {
        key: "STRIPE_SECRET_KEY",
        reason: "must start with sk_",
        validate: (value: string) => value.startsWith("sk_"),
      },
    ];

    expect(
      missingEnvValues({ NEXT_PUBLIC_SUPABASE_URL: "" }, requirements),
    ).toEqual(["NEXT_PUBLIC_SUPABASE_URL", "STRIPE_SECRET_KEY"]);
    expect(
      invalidEnvValues(
        {
          NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
          STRIPE_SECRET_KEY: "invalid_secret",
        },
        requirements,
      ),
    ).toEqual([
      {
        key: "STRIPE_SECRET_KEY",
        reason: "must start with sk_",
      },
    ]);
  });

  it("parses deployment metadata from Vercel list output", () => {
    expect(
      parseVercelDeployments(
        JSON.stringify({
          deployments: [
            {
              url: "donor.example.vercel.app",
              state: "READY",
              target: "production",
              createdAt: 123,
              meta: {
                githubCommitSha: "abc123",
                githubCommitRef: "main",
              },
            },
          ],
        }),
      ),
    ).toEqual([
      {
        url: "donor.example.vercel.app",
        state: "READY",
        target: "production",
        createdAt: 123,
        commitSha: "abc123",
        commitRef: "main",
      },
    ]);
  });

  it("parses Vercel project production branch metadata", () => {
    expect(
      parseVercelProjectDetails(
        JSON.stringify({
          link: {
            productionBranch: "production",
          },
        }),
      ),
    ).toEqual({
      productionBranch: "production",
    });
  });

  it("models Vercel deploymentEnabled branch matching", () => {
    expect(branchPatternMatches("production", "production")).toBe(true);
    expect(branchPatternMatches("internal-*", "internal-build")).toBe(true);
    expect(branchPatternMatches("internal-*", "release-build")).toBe(false);

    expect(isBranchDeploymentEnabled({}, "production")).toBe(true);
    expect(
      isBranchDeploymentEnabled(
        {
          git: {
            deploymentEnabled: {
              production: false,
            },
          },
        },
        "production",
      ),
    ).toBe(false);
    expect(
      isBranchDeploymentEnabled(
        {
          git: {
            deploymentEnabled: {
              "*": false,
              develop: true,
              production: true,
              main: false,
            },
          },
        },
        "production",
      ),
    ).toBe(true);
    expect(
      isBranchDeploymentEnabled(
        {
          git: {
            deploymentEnabled: {
              "*": false,
              develop: true,
              production: true,
              main: false,
            },
          },
        },
        "develop",
      ),
    ).toBe(true);
    expect(
      isBranchDeploymentEnabled(
        {
          git: {
            deploymentEnabled: {
              "*": false,
              develop: true,
              production: true,
              main: false,
            },
          },
        },
        "main",
      ),
    ).toBe(false);
    expect(
      isBranchDeploymentEnabled(
        {
          git: {
            deploymentEnabled: {
              "*": false,
              develop: true,
              production: true,
              main: false,
            },
          },
        },
        "feature/test",
      ),
    ).toBe(false);
  });

  it("blocks when env names, target deployment, or health checks are missing", () => {
    const report = summarizeProjectReadiness({
      project,
      envValues: { NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" },
      deployments: [],
      commit: "abc123",
      health: { url: project.healthUrl, status: 404 },
    });

    expect(report.ready).toBe(false);
    expect(report.missingEnv).toEqual(["STRIPE_SECRET_KEY"]);
    expect(report.deploymentForCommit).toBeNull();

    expect(
      formatReadinessReport({ commit: "abc123", reports: [report] }),
    ).toContain("Overall: BLOCKED (donor)");
  });

  it("does not mark Vercel-sensitive present values missing when pull hides them", () => {
    const report = summarizeProjectReadiness({
      project,
      envKeys: project.requiredEnv,
      envTypes: { STRIPE_SECRET_KEY: "sensitive" },
      envValues: {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        STRIPE_SECRET_KEY: "",
      },
      deployments: [],
      commit: "abc123",
      health: { url: project.healthUrl, status: 200 },
    });

    expect(report.missingEnv).toEqual([]);
    expect(report.unreadableEnv).toEqual(["STRIPE_SECRET_KEY"]);
  });

  it("marks a project ready only when env, deployment, and health all pass", () => {
    const report = summarizeProjectReadiness({
      project,
      envValues: {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        STRIPE_SECRET_KEY: "sk_test_hidden",
      },
      deployments: [
        {
          url: "donor.example.vercel.app",
          state: "READY",
          target: "production",
          createdAt: 123,
          commitSha: "abc123",
          commitRef: "main",
        },
      ],
      commit: "abc123",
      health: { url: project.healthUrl, status: 200 },
      productionBranch: "main",
      productionGitDeployments: false,
    });

    expect(report.ready).toBe(true);
    expect(
      formatReadinessReport({ commit: "abc123", reports: [report] }),
    ).toContain("Overall: READY");
  });

  it("blocks when release health reports a different commit", () => {
    const report = summarizeProjectReadiness({
      project,
      envValues: {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        STRIPE_SECRET_KEY: "sk_test_hidden",
      },
      deployments: [
        {
          url: "donor.example.vercel.app",
          state: "READY",
          target: "production",
          createdAt: 123,
          commitSha: "abc123",
          commitRef: "production",
        },
      ],
      commit: "abc123",
      health: {
        url: project.healthUrl,
        status: 200,
        bodyStatus: "ok",
        releaseCommit: "older",
        surface: "donor",
        releaseEnvironment: "production",
      },
      productionBranch: "production",
      productionGitDeployments: false,
    });

    const formatted = formatReadinessReport({
      commit: "abc123",
      reports: [report],
    });

    expect(report.ready).toBe(false);
    expect(report.healthReleaseMatches).toBe(false);
    expect(formatted).toContain("Release health commit: older");
    expect(formatted).toContain("Overall: BLOCKED (donor)");
  });

  it("blocks while Vercel's Git integration still deploys the production branch", () => {
    const report = summarizeProjectReadiness({
      project,
      envValues: {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        STRIPE_SECRET_KEY: "sk_test_hidden",
      },
      deployments: [
        {
          url: "donor.example.vercel.app",
          state: "READY",
          target: "production",
          createdAt: 123,
          commitSha: "abc123",
          commitRef: "production",
        },
      ],
      commit: "abc123",
      health: { url: project.healthUrl, status: 200 },
      productionBranch: "production",
      productionGitDeployments: true,
    });

    expect(report.ready).toBe(false);
    expect(
      formatReadinessReport({ commit: "abc123", reports: [report] }),
    ).toContain("Git deployments ENABLED");
  });

  it("blocks an application environment that holds a Postgres connection string, naming it only", () => {
    const report = summarizeProjectReadiness({
      project,
      envKeys: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "STRIPE_SECRET_KEY",
        "SUPABASE_DB_URL",
        "POSTGRES_URL",
      ],
      envValues: {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        STRIPE_SECRET_KEY: "sk_test_hidden",
        SUPABASE_DB_URL:
          "postgresql://postgres:secret-value@db.example.supabase.co/postgres",
      },
      deployments: [
        {
          url: "d.vercel.app",
          state: "READY",
          target: "production",
          createdAt: 1,
          commitSha: "abc123",
          commitRef: "production",
        },
      ],
      commit: "abc123",
      health: { url: project.healthUrl, status: 200 },
      productionBranch: "production",
      productionGitDeployments: false,
    });
    const formatted = formatReadinessReport({
      commit: "abc123",
      reports: [report],
    });
    expect(report.ready).toBe(false);
    expect(report.forbiddenEnv).toEqual(["POSTGRES_URL", "SUPABASE_DB_URL"]);
    expect(formatted).toContain("`SUPABASE_DB_URL`");
    expect(formatted).not.toContain("secret-value");
  });

  it("requires no migration connection string and a cms_runtime login for Payload", () => {
    const admin = PROJECTS.find((item) => item.key === "admin")!;
    const keys = admin.requiredEnv.map((item) =>
      typeof item === "string" ? item : item.key,
    );
    expect(keys).not.toContain("SUPABASE_DB_URL");
    for (const item of PROJECTS) {
      for (const name of FORBIDDEN_RUNTIME_ENV_NAMES) {
        expect(
          item.requiredEnv.map((r) => (typeof r === "string" ? r : r.key)),
        ).not.toContain(name);
      }
    }
    const payload = admin.requiredEnv.find(
      (item) => typeof item !== "string" && item.key === "PAYLOAD_DATABASE_URI",
    ) as { validate: (value: string) => boolean };
    const ref = "abcdefghijklmnopqrst";
    expect(
      payload.validate(
        `postgresql://cms_runtime.${ref}:x@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
      ),
    ).toBe(true);
    expect(
      payload.validate(
        `postgresql://cms_runtime:x@db.${ref}.supabase.co:5432/postgres`,
      ),
    ).toBe(true);
    expect(
      payload.validate(
        `postgresql://postgres.${ref}:x@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
      ),
    ).toBe(false);
    expect(
      payload.validate(
        `postgresql://cms_owner:x@db.${ref}.supabase.co:5432/postgres`,
      ),
    ).toBe(false);
  });
});
