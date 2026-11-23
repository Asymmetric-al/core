import { describe, expect, it } from "vitest";

import {
  formatReadinessReport,
  parseDotEnv,
  resolveProductionEnv,
  resolveProductionEnvTypes,
  summarizeProjectReadiness,
} from "../../../scripts/verify/vercel-production-readiness.mjs";

describe("vercel production readiness env resolver", () => {
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
      "holds the Vercel CLI's placeholder text `[SENSITIVE]`: the variable is not of type sensitive, so this is its stored value, or its type could not be confirmed";

    expect(report.ready).toBe(false);
    expect(report.unreadableEnv).toEqual(["RESEND_API_KEY"]);
    expect(report.missingEnv).toEqual(["SENTRY_DSN"]);
    expect(report.invalidEnv).toEqual([
      { key: "STRIPE_SECRET_KEY", reason: literalPlaceholderReason },
      { key: "INNGEST_SIGNING_KEY", reason: literalPlaceholderReason },
    ]);
  });

  it("treats a required name present only in a custom environment as missing in Production, not unreadable", () => {
    const customOnlyProject = {
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
          key: "INNGEST_EVENT_KEY",
          reason: "must be set",
          validate: (value: string) => value.length > 0,
        },
      ],
    };
    const readyDeployment = [
      {
        url: "admin.example.vercel.app",
        state: "READY",
        target: "production",
        createdAt: 1,
        commitSha: "abc123",
        commitRef: "production",
      },
    ];
    const pulled = parseDotEnv(
      'NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"\n',
    );

    const customOnlyListing = JSON.stringify({
      envs: [
        {
          key: "NEXT_PUBLIC_SUPABASE_URL",
          type: "plain",
          target: ["production"],
        },
        {
          key: "INNGEST_EVENT_KEY",
          type: "sensitive",
          target: [],
          customEnvironmentIds: ["env_core_dev_1"],
        },
      ],
    });

    const resolvedMissing = resolveProductionEnv(customOnlyListing);
    expect(resolvedMissing.keys).toEqual(["NEXT_PUBLIC_SUPABASE_URL"]);
    expect(resolvedMissing.types).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "plain",
    });

    const blockedReport = summarizeProjectReadiness({
      project: customOnlyProject,
      envKeys: resolvedMissing.keys,
      envTypes: resolvedMissing.types,
      envValues: pulled,
      deployments: readyDeployment,
      commit: "abc123",
      health: { url: customOnlyProject.healthUrl, status: 200 },
      productionBranch: "production",
      productionGitDeployments: false,
    });

    expect(blockedReport.ready).toBe(false);
    expect(blockedReport.missingEnv).toEqual(["INNGEST_EVENT_KEY"]);
    expect(blockedReport.unreadableEnv).toEqual([]);
    const blockedText = formatReadinessReport({
      commit: "abc123",
      reports: [blockedReport],
    });
    expect(blockedText).toContain("Missing Production env values:");
    expect(blockedText).toContain("- `INNGEST_EVENT_KEY`");
    expect(blockedText).toContain("Overall: BLOCKED (admin)");

    const withProductionSensitiveListing = JSON.stringify({
      envs: [
        {
          key: "NEXT_PUBLIC_SUPABASE_URL",
          type: "plain",
          target: ["production"],
        },
        {
          key: "INNGEST_EVENT_KEY",
          type: "sensitive",
          target: ["production"],
        },
      ],
    });

    const resolvedPresent = resolveProductionEnv(
      withProductionSensitiveListing,
    );
    expect(resolvedPresent.keys).toEqual([
      "INNGEST_EVENT_KEY",
      "NEXT_PUBLIC_SUPABASE_URL",
    ]);
    expect(resolvedPresent.types).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "plain",
      INNGEST_EVENT_KEY: "sensitive",
    });

    const readyReport = summarizeProjectReadiness({
      project: customOnlyProject,
      envKeys: resolvedPresent.keys,
      envTypes: resolvedPresent.types,
      envValues: pulled,
      deployments: readyDeployment,
      commit: "abc123",
      health: { url: customOnlyProject.healthUrl, status: 200 },
      productionBranch: "production",
      productionGitDeployments: false,
    });

    expect(readyReport.ready).toBe(true);
    expect(readyReport.missingEnv).toEqual([]);
    expect(readyReport.unreadableEnv).toEqual(["INNGEST_EVENT_KEY"]);
    expect(
      formatReadinessReport({ commit: "abc123", reports: [readyReport] }),
    ).toContain("Overall: READY");
  });
});
