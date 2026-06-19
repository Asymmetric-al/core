/**
 * Canonical Vercel deployment-environment model for this repo.
 *
 * Ground truth:
 * - Production deployments report VERCEL_TARGET_ENV="production" and
 *   VERCEL_ENV="production".
 * - The hosted develop branch uses the Vercel custom environment
 *   "core-development", so it reports VERCEL_TARGET_ENV="core-development"
 *   and VERCEL_ENV="preview".
 * - Ordinary previews report VERCEL_TARGET_ENV="preview" and
 *   VERCEL_ENV="preview".
 * - Vercel reserves "development" for its built-in local target. It is not a
 *   hosted develop deployment, so local vercel dev is intentionally not
 *   protected and must not require hosted deployment secrets.
 *
 * Protected deployments are production plus the hosted protected
 * non-production target(s). The retained "staging" entry is a legacy alias for
 * old Vercel deployments that still serve from staging-* aliases. Remove that
 * single entry after those aliases are retired or repointed and no deployment
 * reports VERCEL_TARGET_ENV="staging".
 */

export type DeploymentEnvironmentInput = {
  VERCEL_ENV?: null | string;
  VERCEL_TARGET_ENV?: null | string;
};

export type DeploymentEnvironmentLabel =
  | "production"
  | "core-development"
  | "preview"
  | "development"
  | "staging"
  | "local";

const knownDeploymentEnvironments = new Set<DeploymentEnvironmentLabel>([
  "production",
  "core-development",
  "preview",
  "development",
  "staging",
]);

export const PROTECTED_TARGET_ENVIRONMENTS: ReadonlySet<string> = new Set([
  "production",
  "core-development",
  "staging",
]);

export function normalizeDeploymentEnvironmentName(
  value: null | string | undefined,
) {
  return value?.trim().toLowerCase() ?? "";
}

export function isProductionDeployment(env: DeploymentEnvironmentInput) {
  const targetEnv = normalizeDeploymentEnvironmentName(env.VERCEL_TARGET_ENV);
  const vercelEnv = normalizeDeploymentEnvironmentName(env.VERCEL_ENV);

  return targetEnv === "production" || vercelEnv === "production";
}

export function isProtectedDeployment(env: DeploymentEnvironmentInput) {
  const targetEnv = normalizeDeploymentEnvironmentName(env.VERCEL_TARGET_ENV);

  return (
    normalizeDeploymentEnvironmentName(env.VERCEL_ENV) === "production" ||
    PROTECTED_TARGET_ENVIRONMENTS.has(targetEnv)
  );
}

export function isProtectedNonProductionDeployment(
  env: DeploymentEnvironmentInput,
) {
  return isProtectedDeployment(env) && !isProductionDeployment(env);
}

export function resolveDeploymentEnvironment(
  env: DeploymentEnvironmentInput,
): DeploymentEnvironmentLabel {
  const targetEnv = normalizeDeploymentEnvironmentName(env.VERCEL_TARGET_ENV);

  if (
    knownDeploymentEnvironments.has(targetEnv as DeploymentEnvironmentLabel)
  ) {
    return targetEnv as DeploymentEnvironmentLabel;
  }

  const vercelEnv = normalizeDeploymentEnvironmentName(env.VERCEL_ENV);

  if (
    knownDeploymentEnvironments.has(vercelEnv as DeploymentEnvironmentLabel)
  ) {
    return vercelEnv as DeploymentEnvironmentLabel;
  }

  return "local";
}
