import { defineAgent } from "eve";
import { mockModel } from "eve/evals";

const verificationModel = mockModel({
  modelId: "eve-runtime-foundation-verification",
  provider: "asym-fixture",
  respond: ({ lastUserMessage }) =>
    `Eve runtime verification passed: ${lastUserMessage}`,
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
