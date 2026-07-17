import {
  DONOR_SURFACE,
  defineBoneyardConfig,
  resolveSurfaceBaseUrl,
} from "./tests/e2e/playwright-shared";

export function resolveDonorBaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  return resolveSurfaceBaseUrl(DONOR_SURFACE, env);
}

export default defineBoneyardConfig(DONOR_SURFACE);
