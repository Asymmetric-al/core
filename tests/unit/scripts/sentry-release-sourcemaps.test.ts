import { describe, expect, it } from "vitest";

import {
  buildSentryNextConfigOptions,
  resolveSentryReleaseName,
} from "../../../scripts/sentry/next-config.mjs";
import {
  buildSentryReleaseSourcemapProof,
  formatSentryReleaseSourcemapProof,
} from "../../../scripts/verify/sentry-release-sourcemaps.mjs";

describe("Sentry release and sourcemap verifier", () => {
  it("keeps sourcemap uploads disabled without the build-only auth token", () => {
    const options = buildSentryNextConfigOptions({
      VERCEL_GIT_COMMIT_SHA: "abc123",
      VERCEL_ENV: "production",
      CI: "1",
    });

    expect(options.release.name).toBe("abc123");
    expect(options.release).not.toHaveProperty("inject");
    expect(options.release.create).toBeUndefined();
    expect(options.sourcemaps.disable).toBe(true);
    expect(options.widenClientFileUpload).toBe(false);
    expect(options.telemetry).toBe(false);
    expect(options.bundleSizeOptimizations).toEqual({
      excludeDebugStatements: true,
    });
    expect(options).not.toHaveProperty("webpack.treeshake");
  });

  it("enables upload and deploy metadata when SENTRY_AUTH_TOKEN exists", () => {
    const options = buildSentryNextConfigOptions({
      SENTRY_AUTH_TOKEN: "redacted-token",
      SENTRY_RELEASE: "release-1",
      VERCEL_TARGET_ENV: "development",
      CI: "1",
    });

    expect(options.authToken).toBe("redacted-token");
    expect(options.release.name).toBe("release-1");
    expect(options.release.create).toBe(true);
    expect(options.release.finalize).toBe(true);
    expect(options.release.deploy).toEqual({ env: "development" });
    expect(options.sourcemaps.disable).toBe(false);
    expect(options.widenClientFileUpload).toBe(true);
    expect(options.telemetry).toBe(false);
    expect(options.release).not.toHaveProperty("inject");
  });

  it("prefers explicit release names before provider commit variables", () => {
    expect(
      resolveSentryReleaseName({
        SENTRY_RELEASE: "manual",
        VERCEL_GIT_COMMIT_SHA: "vercel",
      }),
    ).toBe("manual");
  });

  it.each([
    "SENTRY_RELEASE",
    "VERCEL_GIT_COMMIT_SHA",
    "GIT_SHA",
    "GITHUB_SHA",
    "NEXT_PUBLIC_GIT_SHA",
  ])("ignores a self-named %s placeholder", (key) => {
    expect(resolveSentryReleaseName({ [key]: ` ${key} ` })).toMatch(
      /^[a-f0-9]{40}$/u,
    );
  });

  it("falls through a placeholder to the next valid release candidate", () => {
    expect(
      buildSentryNextConfigOptions({
        SENTRY_RELEASE: "SENTRY_RELEASE",
        VERCEL_GIT_COMMIT_SHA: "qualified-commit",
      }).release.name,
    ).toBe("qualified-commit");
  });

  it("summarizes the repo proof without secret values", () => {
    const proof = buildSentryReleaseSourcemapProof({
      appConfigTexts: {
        admin: "buildSentryNextConfigOptions()",
        donor: "buildSentryNextConfigOptions()",
        missionary: "buildSentryNextConfigOptions()",
      },
      turboConfig: {
        tasks: {
          build: {
            env: [
              "SENTRY_AUTH_TOKEN",
              "SENTRY_DSN",
              "SENTRY_ORG",
              "SENTRY_PROJECT",
              "SENTRY_RELEASE",
            ],
          },
        },
      },
    });

    const report = formatSentryReleaseSourcemapProof(proof);

    expect(proof.ok).toBe(true);
    expect(report).toContain("Overall: PASS");
    expect(report).not.toContain("redacted-token-present");
  });
});
