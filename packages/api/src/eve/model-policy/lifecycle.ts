import type { EveModelPolicyRecord } from "./types";

export interface EveModelPolicyActionAvailability {
  canEvaluate: boolean;
  canActivate: boolean;
  canRollback: boolean;
}

/**
 * Client-advisory mirror of the transition preconditions the model-policy
 * RPCs enforce authoritatively (eval gate before activation, evaluated
 * predecessor for rollback). Keep in lockstep with the RPC sentinels
 * mapped in control.ts; the server remains the enforcement point.
 */
export function eveModelPolicyActions(
  policy: Pick<
    EveModelPolicyRecord,
    "status" | "evalStatus" | "previousPolicyId"
  >,
): EveModelPolicyActionAvailability {
  return {
    canEvaluate: policy.status === "draft" || policy.status === "evaluated",
    canActivate:
      policy.status === "evaluated" && policy.evalStatus === "passed",
    canRollback: policy.status === "active" && Boolean(policy.previousPolicyId),
  };
}
