import {
  ADMIN_SURFACE,
  defineBoneyardConfig,
  resolveSurfaceBaseUrl,
  shouldReuseExistingServer,
} from "./tests/e2e/playwright-shared";

export { shouldReuseExistingServer };

export function resolveAdminBaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  return resolveSurfaceBaseUrl(ADMIN_SURFACE, env);
}

export default defineBoneyardConfig(ADMIN_SURFACE);
