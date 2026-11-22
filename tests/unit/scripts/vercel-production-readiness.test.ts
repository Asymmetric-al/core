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
  resolveProductionEnvTypes,
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

  it("treats the Vercel CLI literal [sensitive] placeholder as unreadable, never invalid", () => {
    const validatedProject = {
      key: "admin",
      project: "admin",
      vercelConfigPath: "apps/admin/vercel.json",
      healthUrl: "https://admin.asymmetric.al/api/health",
      requiredEnv: [
        {
          key: "NEXT_PUBLIC_SUPABASE_URL",
          reason: "must be a URL",
          validate: (value: string) => value.startsWith("https://"),
        },
        {
          key: "STRIPE_SECRET_KEY",
          reason: "must start with sk_",
          validate: (value: string) => value.startsWith("sk_"),
        },
        {
          key: "RESEND_API_KEY",
          reason: "must start with re_",
          validate: (value: string) => value.startsWith("re_"),
        },
        {
          key: "PAYLOAD_SECRET",
          reason: "must be set",
          validate: (value: string) => value.length > 0,
        },
      ],
    };

    const report = summarizeProjectReadiness({
      project: validatedProject,
      envKeys: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "STRIPE_SECRET_KEY",
        "RESEND_API_KEY",
        "PAYLOAD_SECRET",
      ],
      envTypes: {
        NEXT_PUBLIC_SUPABASE_URL: "plain",
        STRIPE_SECRET_KEY: "sensitive",
        RESEND_API_KEY: "sensitive",
        PAYLOAD_SECRET: "sensitive",
      },
      envValues: parseDotEnv(`
NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"
STRIPE_SECRET_KEY="[sensitive]"
RESEND_API_KEY=[sensitive]
PAYLOAD_SECRET="[sensitive]"
      `),
      deployments: [
        {
          url: "admin.example.vercel.app",
          state: "READY",
          target: "production",
          createdAt: 123,
          commitSha: "abc123",
          commitRef: "production",
        },
      ],
      commit: "abc123",
      health: { url: validatedProject.healthUrl, status: 200 },
      productionBranch: "production",
      productionGitDeployments: false,
    });

    expect(report.ready).toBe(true);
    expect(report.missingEnv).toEqual([]);
    expect(report.invalidEnv).toEqual([]);
    expect(report.unreadableEnv).toEqual([
      "STRIPE_SECRET_KEY",
      "RESEND_API_KEY",
      "PAYLOAD_SECRET",
    ]);

    const formatted = formatReadinessReport({
      commit: "abc123",
      reports: [report],
    });
    expect(formatted).toContain("Invalid Production env values: none");
    expect(formatted).toContain("Present but unreadable by Vercel CLI:");
    expect(formatted).toContain("- `STRIPE_SECRET_KEY`");
    expect(formatted).toContain("- `RESEND_API_KEY`");
    expect(formatted).toContain("- `PAYLOAD_SECRET`");
    expect(formatted).toContain("Overall: READY");

    const plainLiteral = summarizeProjectReadiness({
      project: validatedProject,
      envKeys: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "STRIPE_SECRET_KEY",
        "RESEND_API_KEY",
        "PAYLOAD_SECRET",
      ],
      envTypes: {
        NEXT_PUBLIC_SUPABASE_URL: "plain",
        STRIPE_SECRET_KEY: "encrypted",
        RESEND_API_KEY: "plain",
        PAYLOAD_SECRET: "sensitive",
      },
      envValues: {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        STRIPE_SECRET_KEY: "[sensitive]",
        RESEND_API_KEY: "[sensitive]",
        PAYLOAD_SECRET: "[sensitive]",
      },
      deployments: [
        {
          url: "admin.example.vercel.app",
          state: "READY",
          target: "production",
          createdAt: 123,
          commitSha: "abc123",
          commitRef: "production",
        },
      ],
      commit: "abc123",
      health: { url: validatedProject.healthUrl, status: 200 },
      productionBranch: "production",
      productionGitDeployments: false,
    });

    const literalPlaceholderReason =
      "holds the Vercel CLI's placeholder text `[sensitive]`: the variable is not of type sensitive, so this is its stored value, or its type could not be confirmed";

    expect(plainLiteral.ready).toBe(false);
    expect(plainLiteral.invalidEnv).toEqual([
      { key: "STRIPE_SECRET_KEY", reason: literalPlaceholderReason },
      { key: "RESEND_API_KEY", reason: literalPlaceholderReason },
    ]);
    expect(plainLiteral.unreadableEnv).toEqual(["PAYLOAD_SECRET"]);
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

  it("requires INNGEST_EVENT_KEY and signkey- prefixed INNGEST_SIGNING_KEY on all three projects", () => {
    expect(PROJECTS.map((item) => item.key)).toEqual([
      "admin",
      "donor",
      "missionary",
    ]);

    for (const item of PROJECTS) {
      const keys = item.requiredEnv.map((r) =>
        typeof r === "string" ? r : r.key,
      );
      expect(keys, `${item.key} requires INNGEST_EVENT_KEY`).toContain(
        "INNGEST_EVENT_KEY",
      );
      expect(keys, `${item.key} requires INNGEST_SIGNING_KEY`).toContain(
        "INNGEST_SIGNING_KEY",
      );

      const missingReport = summarizeProjectReadiness({
        project: item,
        envKeys: keys.filter(
          (key) => key !== "INNGEST_EVENT_KEY" && key !== "INNGEST_SIGNING_KEY",
        ),
        envValues: {},
        deployments: [
          {
            url: `${item.key}.example.vercel.app`,
            state: "READY",
            target: "production",
            createdAt: 1,
            commitSha: "abc123",
            commitRef: "production",
          },
        ],
        commit: "abc123",
        health: { url: item.healthUrl, status: 200 },
        productionBranch: "production",
        productionGitDeployments: false,
      });
      expect(missingReport.ready).toBe(false);
      expect(missingReport.missingEnv).toEqual(
        expect.arrayContaining(["INNGEST_EVENT_KEY", "INNGEST_SIGNING_KEY"]),
      );

      expect(
        invalidEnvValues(
          {
            INNGEST_EVENT_KEY: "evt-key-fixture",
            INNGEST_SIGNING_KEY: "not-a-signing-key",
          },
          item.requiredEnv,
        ),
      ).toEqual([
        {
          key: "INNGEST_SIGNING_KEY",
          reason: "must start with signkey-",
        },
      ]);

      expect(
        invalidEnvValues(
          {
            INNGEST_EVENT_KEY: "evt-key-fixture",
            INNGEST_SIGNING_KEY: "signkey-prod-fixture",
          },
          item.requiredEnv,
        ),
      ).toEqual([]);

      const sensitiveReport = summarizeProjectReadiness({
        project: item,
        envKeys: keys,
        envTypes: {
          INNGEST_EVENT_KEY: "sensitive",
          INNGEST_SIGNING_KEY: "sensitive",
        },
        envValues: {
          INNGEST_EVENT_KEY: "[sensitive]",
          INNGEST_SIGNING_KEY: "[sensitive]",
        },
        deployments: [
          {
            url: `${item.key}.example.vercel.app`,
            state: "READY",
            target: "production",
            createdAt: 1,
            commitSha: "abc123",
            commitRef: "production",
          },
        ],
        commit: "abc123",
        health: { url: item.healthUrl, status: 200 },
        productionBranch: "production",
        productionGitDeployments: false,
      });
      expect(sensitiveReport.invalidEnv).toEqual([]);
      expect(sensitiveReport.missingEnv).toEqual([]);
      expect(sensitiveReport.unreadableEnv).toEqual(
        expect.arrayContaining(["INNGEST_EVENT_KEY", "INNGEST_SIGNING_KEY"]),
      );
    }
  });

  it("marks a variable sensitive only when the Production-applying entry is sensitive, never hiding readable empties or literals", () => {
    const json = JSON.stringify({
      envs: [
        {
          key: "STRIPE_SECRET_KEY",
          type: "encrypted",
          target: ["production"],
        },
        {
          key: "STRIPE_SECRET_KEY",
          type: "sensitive",
          target: ["production"],
          projectId: ["prj_SB9DucsrJOT0wF1v43SWMFsSNdn8"],
        },
        {
          key: "RESEND_API_KEY",
          type: "sensitive",
          target: ["production"],
        },
        {
          key: "RESEND_API_KEY",
          type: "plain",
          target: ["production"],
          projectId: ["prj_SB9DucsrJOT0wF1v43SWMFsSNdn8"],
        },
        {
          key: "SENTRY_DSN",
          type: "plain",
          target: ["production"],
        },
        {
          key: "SENTRY_DSN",
          type: "sensitive",
          target: ["preview"],
        },
        {
          key: "INNGEST_SIGNING_KEY",
          type: "encrypted",
          target: ["production"],
        },
        {
          key: "INNGEST_SIGNING_KEY",
          type: "sensitive",
          target: ["production"],
        },
      ],
    });

    const envTypes = resolveProductionEnvTypes(json);
    expect(envTypes).toEqual({
      STRIPE_SECRET_KEY: "encrypted",
      RESEND_API_KEY: "sensitive",
      SENTRY_DSN: "plain",
      INNGEST_SIGNING_KEY: "encrypted",
    });

    const validatedProject = {
      key: "admin",
      project: "admin",
      vercelConfigPath: "apps/admin/vercel.json",
      healthUrl: "https://admin.asymmetric.al/api/health",
      requiredEnv: [
        {
          key: "STRIPE_SECRET_KEY",
          reason: "must start with sk_",
          validate: (value: string) => value.startsWith("sk_"),
        },
        {
          key: "RESEND_API_KEY",
          reason: "must start with re_",
          validate: (value: string) => value.startsWith("re_"),
        },
        {
          key: "SENTRY_DSN",
          reason: "must be a URL",
          validate: (value: string) => value.startsWith("https://"),
        },
        {
          key: "INNGEST_SIGNING_KEY",
          reason: "must start with signkey-",
          validate: (value: string) => value.startsWith("signkey-"),
        },
      ],
    };

    const report = summarizeProjectReadiness({
      project: validatedProject,
      envKeys: Object.keys(envTypes),
      envTypes,
      envValues: {
        STRIPE_SECRET_KEY: "[sensitive]",
        RESEND_API_KEY: "[sensitive]",
        SENTRY_DSN: "",
        INNGEST_SIGNING_KEY: "[sensitive]",
      },
      deployments: [
        {
          url: "admin.example.vercel.app",
          state: "READY",
          target: "production",
          createdAt: 1,
          commitSha: "abc123",
          commitRef: "production",
        },
      ],
      commit: "abc123",
      health: { url: validatedProject.healthUrl, status: 200 },
      productionBranch: "production",
      productionGitDeployments: false,
    });

    const literalPlaceholderReason =
      "holds the Vercel CLI's placeholder text `[sensitive]`: the variable is not of type sensitive, so this is its stored value, or its type could not be confirmed";

    expect(report.ready).toBe(false);
    expect(report.unreadableEnv).toEqual(["RESEND_API_KEY"]);
    expect(report.missingEnv).toEqual(["SENTRY_DSN"]);
    expect(report.invalidEnv).toEqual([
      { key: "STRIPE_SECRET_KEY", reason: literalPlaceholderReason },
      { key: "INNGEST_SIGNING_KEY", reason: literalPlaceholderReason },
    ]);
  });

  it("rejects literal [sensitive] on every non-sensitive required variable with its own reason", () => {
    const literalPlaceholderReason =
      "holds the Vercel CLI's placeholder text `[sensitive]`: the variable is not of type sensitive, so this is its stored value, or its type could not be confirmed";
    const missionary = PROJECTS.find((item) => item.key === "missionary")!;
    const requiredKeys = missionary.requiredEnv.map((r) =>
      typeof r === "string" ? r : r.key,
    );
    const validBaseValues: Record<string, string> = {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      NEXT_PUBLIC_APP_URL: "https://missionary.asymmetric.al",
      NEXT_PUBLIC_SITE_URL: "https://donor.asymmetric.al",
      NEXT_PUBLIC_MAIN_DOMAIN: "asymmetric.al",
      NEXT_PUBLIC_CLOUDINARY_ENABLED: "false",
      STRIPE_SECRET_KEY: "sk_live_fixture",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_fixture",
      STRIPE_WEBHOOK_SECRET: "whsec_stripe_fixture",
      INNGEST_EVENT_KEY: "evt-key-fixture",
      INNGEST_SIGNING_KEY: "signkey-prod-fixture",
      SENTRY_DSN: "https://key@sentry.example/1",
      NEXT_PUBLIC_SENTRY_DSN: "https://key@sentry.example/2",
      RESEND_API_KEY: "re_fixture",
      RESEND_WEBHOOK_SECRET: "whsec_resend_fixture",
      RESEND_ENCRYPTION_KEY: "a".repeat(32),
    };
    const readyDeployment = [
      {
        url: "missionary.example.vercel.app",
        state: "READY",
        target: "production",
        createdAt: 1,
        commitSha: "abc123",
        commitRef: "production",
      },
    ];

    const encryptedEventKey = summarizeProjectReadiness({
      project: missionary,
      envKeys: requiredKeys,
      envTypes: { INNGEST_EVENT_KEY: "encrypted" },
      envValues: { ...validBaseValues, INNGEST_EVENT_KEY: "[sensitive]" },
      deployments: readyDeployment,
      commit: "abc123",
      health: { url: missionary.healthUrl, status: 200 },
      productionBranch: "production",
      productionGitDeployments: false,
    });
    expect(encryptedEventKey.ready).toBe(false);
    expect(encryptedEventKey.unreadableEnv).toEqual([]);
    expect(encryptedEventKey.invalidEnv).toEqual([
      { key: "INNGEST_EVENT_KEY", reason: literalPlaceholderReason },
    ]);
    expect(
      formatReadinessReport({ commit: "abc123", reports: [encryptedEventKey] }),
    ).toContain("Overall: BLOCKED (missionary)");

    const sensitiveEventKey = summarizeProjectReadiness({
      project: missionary,
      envKeys: requiredKeys,
      envTypes: { INNGEST_EVENT_KEY: "sensitive" },
      envValues: { ...validBaseValues, INNGEST_EVENT_KEY: "[sensitive]" },
      deployments: readyDeployment,
      commit: "abc123",
      health: { url: missionary.healthUrl, status: 200 },
      productionBranch: "production",
      productionGitDeployments: false,
    });
    expect(sensitiveEventKey.ready).toBe(true);
    expect(sensitiveEventKey.invalidEnv).toEqual([]);
    expect(sensitiveEventKey.unreadableEnv).toEqual(["INNGEST_EVENT_KEY"]);
    expect(
      formatReadinessReport({ commit: "abc123", reports: [sensitiveEventKey] }),
    ).toContain("Overall: READY");

    const encryptedStripeKey = summarizeProjectReadiness({
      project: missionary,
      envKeys: requiredKeys,
      envTypes: { STRIPE_SECRET_KEY: "encrypted" },
      envValues: { ...validBaseValues, STRIPE_SECRET_KEY: "[sensitive]" },
      deployments: readyDeployment,
      commit: "abc123",
      health: { url: missionary.healthUrl, status: 200 },
      productionBranch: "production",
      productionGitDeployments: false,
    });
    expect(encryptedStripeKey.ready).toBe(false);
    expect(encryptedStripeKey.invalidEnv).toEqual([
      { key: "STRIPE_SECRET_KEY", reason: literalPlaceholderReason },
    ]);
  });
});
