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
