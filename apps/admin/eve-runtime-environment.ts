/**
 * Eve 0.25.1 treats any defined `VERCEL_URL` as a hosted deployment URL.
 * Local env templates intentionally define the variable as an empty placeholder,
 * so remove only empty values before Eve starts its development sidecar.
 */
export function normalizeEveVercelEnvironment(
  environment: NodeJS.ProcessEnv,
): void {
  if (environment.VERCEL_URL?.trim()) {
    return;
  }

  delete environment.VERCEL_URL;
}
