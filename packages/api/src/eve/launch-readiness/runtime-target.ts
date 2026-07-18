import { eveLaunchTargetSchema } from "./schema";

import type { EveActiveModelPolicyBinding, EveLaunchTarget } from "./types";

function configuredValue(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean);
}

export function resolveEveLaunchRuntimeTarget(input: {
  activeModelPolicy: EveActiveModelPolicyBinding | null;
  governanceStateVersion: number;
}): EveLaunchTarget | undefined {
  const candidate = {
    deploymentId: configuredValue(
      process.env.EVE_LAUNCH_DEPLOYMENT_ID,
      process.env.VERCEL_DEPLOYMENT_ID,
    ),
    environment: configuredValue(
      process.env.EVE_LAUNCH_ENVIRONMENT,
      process.env.VERCEL_ENV,
    ),
    evalConfigRevision: configuredValue(
      process.env.EVE_LAUNCH_EVAL_CONFIG_REVISION,
    ),
    governanceStateVersion: input.governanceStateVersion,
    migrationVersion: configuredValue(process.env.EVE_LAUNCH_MIGRATION_VERSION),
    modelPolicyRevision: configuredValue(
      process.env.EVE_LAUNCH_MODEL_POLICY_REVISION,
    ),
    policyVersion: Number(process.env.EVE_LAUNCH_POLICY_VERSION),
    revision: configuredValue(
      process.env.EVE_LAUNCH_REVISION,
      process.env.VERCEL_GIT_COMMIT_SHA,
    ),
  };
  const parsed = eveLaunchTargetSchema.safeParse(candidate);
  if (!parsed.success || !input.activeModelPolicy) return undefined;
  if (
    parsed.data.policyVersion !== input.activeModelPolicy.version ||
    parsed.data.modelPolicyRevision !== input.activeModelPolicy.revision
  ) {
    return undefined;
  }
  return parsed.data;
}
