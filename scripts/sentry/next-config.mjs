import { execFileSync } from "node:child_process";

const DEFAULT_SENTRY_ORG = "asymmetrical-4w";
const DEFAULT_SENTRY_PROJECT = "javascript-nextjs";

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function readGitSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

/** @param {Record<string, string | undefined>} [env] */
export function resolveSentryReleaseName(env = process.env) {
  return firstNonEmpty(
    env.SENTRY_RELEASE,
    env.VERCEL_GIT_COMMIT_SHA,
    env.GIT_SHA,
    env.GITHUB_SHA,
    env.NEXT_PUBLIC_GIT_SHA,
    readGitSha(),
  );
}

/** @param {Record<string, string | undefined>} [env] */
export function resolveSentryDeployEnvironment(env = process.env) {
  return firstNonEmpty(env.VERCEL_TARGET_ENV, env.VERCEL_ENV, env.NODE_ENV);
}

/** @param {Record<string, string | undefined>} [env] */
export function buildSentryNextConfigOptions(env = process.env) {
  const authToken = firstNonEmpty(env.SENTRY_AUTH_TOKEN);
  const releaseName = resolveSentryReleaseName(env);
  const deployEnvironment = resolveSentryDeployEnvironment(env);
  const sourcemapUploadEnabled = Boolean(authToken);

  return {
    authToken: authToken || undefined,
    org: firstNonEmpty(env.SENTRY_ORG, DEFAULT_SENTRY_ORG),
    project: firstNonEmpty(env.SENTRY_PROJECT, DEFAULT_SENTRY_PROJECT),
    release: {
      name: releaseName || undefined,
      create: sourcemapUploadEnabled ? true : undefined,
      finalize: sourcemapUploadEnabled ? true : undefined,
      deploy:
        sourcemapUploadEnabled && deployEnvironment
          ? { env: deployEnvironment }
          : undefined,
    },
    // Build diagnostics are separate from application monitoring and uploads.
    telemetry: false,
    silent: env.CI !== "true" && env.CI !== "1",
    sourcemaps: {
      disable: !sourcemapUploadEnabled,
    },
    widenClientFileUpload: sourcemapUploadEnabled,
    bundleSizeOptimizations: {
      excludeDebugStatements: true,
    },
  };
}
