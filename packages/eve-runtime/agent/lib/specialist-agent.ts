import { EVE_SPECIALIST_CATALOG } from "@asym/api/eve/subagent-catalog";
import { defineAgent, defineDynamic } from "eve";
import { mockModel } from "eve/evals";

import { resolveEveSpecialistModel } from "../../src/specialists/runtime-policy";

import type { EveSpecialistId } from "@asym/api/eve/subagent-catalog";

const verificationModel = mockModel({
  modelId: "eve-specialist-release-off-verification",
  provider: "asym-fixture",
  respond: ({ lastUserMessage }) =>
    `Eve specialist is release-gated. Received: ${lastUserMessage}`,
});

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
        "session.started": async (_event, context) => {
          const selected = await resolveEveSpecialistModel({
            auth: context.session.auth.current,
            sessionId: context.session.id,
            specialistId,
          });
          return selected;
        },
        "step.started": async (_event, context) => {
          return resolveEveSpecialistModel({
            actionId: "engineering.dynamic_workflow.execute",
            auth: context.session.auth.current,
            sessionId: context.session.id,
            specialistId,
          });
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
