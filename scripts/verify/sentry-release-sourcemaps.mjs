#!/usr/bin/env node

import { readFileSync } from "node:fs";

import {
  buildSentryNextConfigOptions,
  resolveSentryReleaseName,
} from "../sentry/next-config.mjs";

const APP_CONFIGS = Object.freeze([
  { app: "admin", path: "apps/admin/next.config.ts" },
  { app: "donor", path: "apps/donor/next.config.ts" },
  { app: "missionary", path: "apps/missionary/next.config.ts" },
]);

const REQUIRED_TURBO_ENV = Object.freeze([
  "SENTRY_AUTH_TOKEN",
  "SENTRY_DSN",
  "SENTRY_ORG",
  "SENTRY_PROJECT",
  "SENTRY_RELEASE",
]);

function pass(name, details = "") {
  return { name, status: "pass", details };
}

function fail(name, details) {
  return { name, status: "fail", details };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function buildSentryReleaseSourcemapProof({
  appConfigTexts,
  turboConfig,
} = {}) {
  const checks = [];
  const configs =
    appConfigTexts ??
    Object.fromEntries(
      APP_CONFIGS.map((config) => [
        config.app,
        readFileSync(config.path, "utf8"),
      ]),
    );

  for (const config of APP_CONFIGS) {
    const text = configs[config.app] ?? "";
    checks.push(
      text.includes("buildSentryNextConfigOptions")
        ? pass(`${config.app} next config uses shared Sentry build options`)
        : fail(
            `${config.app} next config uses shared Sentry build options`,
            `${config.path} does not call buildSentryNextConfigOptions`,
          ),
    );
  }

  const noTokenOptions = buildSentryNextConfigOptions({
    VERCEL_GIT_COMMIT_SHA: "phase11commit",
    VERCEL_ENV: "production",
    CI: "1",
  });
  checks.push(
    noTokenOptions.sourcemaps.disable === true &&
      noTokenOptions.widenClientFileUpload === false &&
      noTokenOptions.release.name === "phase11commit" &&
      !Object.hasOwn(noTokenOptions.release, "inject") &&
      noTokenOptions.release.create === undefined
      ? pass(
          "sourcemaps are disabled without SENTRY_AUTH_TOKEN while the release name remains available",
        )
      : fail(
          "sourcemaps are disabled without SENTRY_AUTH_TOKEN while the release name remains available",
          "expected disabled sourcemaps, release.name without unsupported release.inject, and no explicit release creation flag",
        ),
  );

  checks.push(
    noTokenOptions.telemetry === false &&
      noTokenOptions.bundleSizeOptimizations.excludeDebugStatements === true &&
      !Object.hasOwn(noTokenOptions, "webpack")
      ? pass(
          "build telemetry is disabled and debug exclusion uses the supported bundler API",
        )
      : fail(
          "build telemetry is disabled and debug exclusion uses the supported bundler API",
          "expected telemetry false and bundleSizeOptimizations.excludeDebugStatements without webpack.treeshake",
        ),
  );

  const tokenOptions = buildSentryNextConfigOptions({
    SENTRY_AUTH_TOKEN: "redacted-token-present",
    SENTRY_RELEASE: "manual-release",
    VERCEL_TARGET_ENV: "development",
    CI: "1",
  });
  checks.push(
    tokenOptions.sourcemaps.disable === false &&
      tokenOptions.widenClientFileUpload === true &&
      tokenOptions.release.name === "manual-release" &&
      tokenOptions.release.create === true &&
      tokenOptions.release.finalize === true &&
      tokenOptions.release.deploy?.env === "development" &&
      tokenOptions.telemetry === false &&
      !Object.hasOwn(tokenOptions.release, "inject")
      ? pass(
          "sourcemaps and release creation are enabled when token is present",
        )
      : fail(
          "sourcemaps and release creation are enabled when token is present",
          "expected enabled upload path with release deployment metadata",
        ),
  );

  checks.push(
    resolveSentryReleaseName({
      VERCEL_GIT_COMMIT_SHA: "commit-from-vercel",
    }) === "commit-from-vercel"
      ? pass("release name resolves from VERCEL_GIT_COMMIT_SHA")
      : fail(
          "release name resolves from VERCEL_GIT_COMMIT_SHA",
          "expected Vercel commit SHA to be the release name",
        ),
  );

  const turbo = turboConfig ?? readJson("turbo.json");
  checks.push(
    resolveSentryReleaseName({
      SENTRY_RELEASE: "SENTRY_RELEASE",
      VERCEL_GIT_COMMIT_SHA: "VERCEL_GIT_COMMIT_SHA",
      GIT_SHA: "qualified-commit",
    }) === "qualified-commit"
      ? pass("self-named release placeholders fall through to a real candidate")
      : fail(
          "self-named release placeholders fall through to a real candidate",
          "expected placeholder release variables to be ignored",
        ),
  );
  const buildEnv = new Set(turbo?.tasks?.build?.env ?? []);
  const missingTurboKeys = REQUIRED_TURBO_ENV.filter(
    (key) => !buildEnv.has(key),
  );
  checks.push(
    missingTurboKeys.length === 0
      ? pass("Turbo build hash includes Sentry build inputs")
      : fail(
          "Turbo build hash includes Sentry build inputs",
          `missing ${missingTurboKeys.join(", ")}`,
        ),
  );

  return {
    ok: checks.every((check) => check.status === "pass"),
    checks,
  };
}

export function formatSentryReleaseSourcemapProof(proof) {
  const lines = [
    "# Sentry Release And Sourcemap Proof",
    "",
    `Overall: ${proof.ok ? "PASS" : "FAIL"}`,
    "",
  ];

  for (const check of proof.checks) {
    lines.push(`- ${check.status.toUpperCase()}: ${check.name}`);
    if (check.details) {
      lines.push(`  ${check.details}`);
    }
  }

  lines.push("");
  lines.push("Secret values printed: no");
  lines.push(
    "SENTRY_AUTH_TOKEN behavior: build-only; when absent, source map upload is disabled. The SDK injects release.name; build diagnostics telemetry is disabled.",
  );
  lines.push("");

  return lines.join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const proof = buildSentryReleaseSourcemapProof();
  console.log(formatSentryReleaseSourcemapProof(proof));
  process.exitCode = proof.ok ? 0 : 1;
}
