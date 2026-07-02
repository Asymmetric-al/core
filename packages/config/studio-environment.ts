import { resolveDeploymentEnvironment } from "@asym/env/target-env";

type PublicVercelEnvironment = {
  NEXT_PUBLIC_VERCEL_ENV?: string;
  NEXT_PUBLIC_VERCEL_TARGET_ENV?: string;
};

export type StudioEnvironment = "development" | "production";

export function resolveStudioEnvironment(
  env: PublicVercelEnvironment,
): StudioEnvironment {
  // Use public Vercel framework variables so SSR and the hydrated client read the same signal.
  const deploymentEnvironment = resolveDeploymentEnvironment({
    VERCEL_ENV: env.NEXT_PUBLIC_VERCEL_ENV,
    VERCEL_TARGET_ENV: env.NEXT_PUBLIC_VERCEL_TARGET_ENV,
  });

  return deploymentEnvironment === "production" ? "production" : "development";
}
