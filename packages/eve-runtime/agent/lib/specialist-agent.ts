import { EVE_SPECIALIST_CATALOG } from "@asym/api/eve/subagent-catalog";
import { defineAgent, defineDynamic } from "eve";
import { mockModel } from "eve/evals";

import {
  createEveSpecialistModelStepKey,
  eveSpecialistBudgetState,
  reserveEveSpecialistModelStep,
  resolveEveSpecialistBudgetLimits,
  toEveSpecialistModelUsageSnapshot,
} from "./specialist-budget";
import { resolveEveSpecialistActivation } from "../../src/specialists/runtime-policy";

import type { EveSpecialistId } from "@asym/api/eve/subagent-catalog";

const verificationModel = mockModel({
  modelId: "eve-specialist-release-off-verification",
  provider: "asym-fixture",
  respond: ({ lastUserMessage }) =>
    `Eve specialist is release-gated. Received: ${lastUserMessage}`,
});

function isStepStartedEvent(
  event: unknown,
): event is { data: { stepIndex: number; turnId: string } } {
  if (!event || typeof event !== "object" || !("data" in event)) return false;
  const data = event.data;
  return (
    !!data &&
    typeof data === "object" &&
    "stepIndex" in data &&
    typeof data.stepIndex === "number" &&
    "turnId" in data &&
    typeof data.turnId === "string"
  );
}

/**
 * Builds one declared specialist from the app-owned catalog. The static
 * fallback is deliberately offline: when governance, ownership, policy,
 * budget, or eval checks fail, no provider call is made. The persisted #421
 * policy is the only production model selector.
 */
export function createEveSpecialistAgent(specialistId: EveSpecialistId) {
  const specialist = EVE_SPECIALIST_CATALOG[specialistId];
  return defineAgent({
    description: specialist.description,
    model: defineDynamic({
      fallback: verificationModel,
      events: {
        "step.started": async (event, context) => {
          if (!isStepStartedEvent(event)) return null;
          const nowMs = Date.now();
          const currentBudget = eveSpecialistBudgetState.get();
          const activation = await resolveEveSpecialistActivation({
            actionId: "engineering.dynamic_workflow.execute",
            auth: context.session.auth.current,
            sessionId: context.session.id,
            specialistId,
            usage: toEveSpecialistModelUsageSnapshot({
              nowMs,
              state: currentBudget,
            }),
          });
          if (!activation) return null;

          const resolvedLimits = resolveEveSpecialistBudgetLimits({
            catalog: specialist.budget,
            policy: activation.limits,
          });
          const reservation = reserveEveSpecialistModelStep({
            limits: resolvedLimits,
            nowMs,
            state: currentBudget,
            stepKey: createEveSpecialistModelStepKey(event.data),
          });
          if (!reservation.allowed) return null;

          eveSpecialistBudgetState.update(() => reservation.state);
          return activation.model;
        },
      },
    }),
    modelContextWindowTokens: 131_072,
    reasoning: specialist.reasoning,
    limits: {
      maxInputTokensPerSession: specialist.budget.maxInputTokensPerSession,
      maxOutputTokensPerSession: specialist.budget.maxOutputTokensPerSession,
    },
  });
}
