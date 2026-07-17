import {
  MISSIONARY_SURFACE,
  defineBoneyardConfig,
  resolveSurfaceBaseUrl,
} from "./tests/e2e/playwright-shared";

export function resolveMissionaryBaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  return resolveSurfaceBaseUrl(MISSIONARY_SURFACE, env);
}

export default defineBoneyardConfig(MISSIONARY_SURFACE);
