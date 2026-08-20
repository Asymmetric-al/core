import { defineAgent } from "eve";
import { mockModel } from "eve/evals";

const verificationModel = mockModel({
  modelId: "eve-runtime-foundation-verification",
  provider: "asym-fixture",
  respond: ({ lastUserMessage, toolResults, tools }) => {
    const specialistMatch = lastUserMessage?.match(
      /^EVE_SPECIALIST_EVAL:([a-z0-9-]+)$/u,
    );
    if (specialistMatch && toolResults.length === 0) {
      const specialistId = specialistMatch[1];
      if (!specialistId || !tools.some((tool) => tool.name === specialistId)) {
        return "Eve specialist discovery failed.";
      }
      return {
        toolCalls: [
          {
            name: specialistId,
            input: {
              message:
                "Return the release-gated specialist verification response without calling tools.",
            },
          },
        ],
      };
    }
    if (specialistMatch) {
      return `Eve specialist verification passed: ${specialistMatch[1]}`;
    }
    const twentyReintro =
      lastUserMessage === "EVE_OPENSPEC_GUARDIAN_TWENTY_REINTRO";
    if (twentyReintro && toolResults.length === 0) {
      if (!tools.some((tool) => tool.name === "openspec-guarding")) {
        return "Eve OpenSpec Guardian discovery failed.";
      }
      return {
        toolCalls: [
          {
            name: "openspec-guarding",
            input: {
              message:
                "Review a proposed Twenty CRM client restore against accepted OpenSpec and ADR-0001. Do not write, sync, or archive.",
            },
          },
        ],
      };
    }
    if (twentyReintro) {
      return "ADR-0001: Twenty CRM is retired. Asym Postgres owns CRM truth. Escalate this conflict; runtime unchanged.";
    }
    return `Eve runtime verification passed: ${lastUserMessage}`;
  },
});

export default defineAgent({
  model: verificationModel,
  modelContextWindowTokens: 8_192,
  reasoning: "none",
  limits: {
    maxInputTokensPerSession: 2_000,
    maxOutputTokensPerSession: 500,
  },
});
