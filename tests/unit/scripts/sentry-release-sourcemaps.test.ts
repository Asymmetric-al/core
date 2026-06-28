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
    expect(options.release.inject).toBe(true);
    expect(options.release.create).toBeUndefined();
    expect(options.sourcemaps.disable).toBe(true);
    expect(options.widenClientFileUpload).toBe(false);
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
  });

  it("prefers explicit release names before provider commit variables", () => {
    expect(
      resolveSentryReleaseName({
        SENTRY_RELEASE: "manual",
        VERCEL_GIT_COMMIT_SHA: "vercel",
      }),
    ).toBe("manual");
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
