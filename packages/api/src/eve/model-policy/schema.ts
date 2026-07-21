import { z } from "zod";

import type { EveModelPolicyDocument } from "./types";

const identifierSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z][a-z0-9._-]*$/);

export const eveModelBudgetSchema = z
  .object({
    maxInputTokens: z.number().int().nonnegative(),
    maxOutputTokens: z.number().int().nonnegative(),
    maxRequestsPerMinute: z.number().int().nonnegative(),
    maxUsdMicros: z.number().int().nonnegative(),
  })
  .strict();

const gatewayRouteSchema = z
  .object({
    modelId: z.string().trim().min(1).max(200),
    route: z.literal("vercel_ai_gateway"),
  })
  .strict();

const directFallbackSchema = z
  .object({
    enabled: z.boolean(),
    modelId: z.string().trim().min(1).max(200),
    providerId: identifierSchema,
    route: z.literal("direct_provider"),
  })
  .strict();

const evalGateSchema = z
  .object({
    minimumScoreBps: z.number().int().min(0).max(10_000),
    suiteId: identifierSchema,
  })
  .strict();

const rolePolicySchema = z
  .object({
    budget: eveModelBudgetSchema,
    evalGate: evalGateSchema,
    fallbacks: z.array(directFallbackSchema).max(10),
    primary: gatewayRouteSchema,
    reasoning: z.enum(["low", "medium", "high"]),
  })
  .strict();

const partialBudgetSchema = eveModelBudgetSchema
  .partial()
  .refine(
    (budget) => Object.keys(budget).length > 0,
    "A budget override must set at least one limit.",
  );

const subagentOverrideSchema = z
  .object({
    budget: partialBudgetSchema.optional(),
    evalGate: evalGateSchema.optional(),
    fallbackProviderId: identifierSchema.optional(),
    reasoning: z.enum(["low", "medium", "high"]).optional(),
    role: identifierSchema,
  })
  .strict();

export const eveModelPolicyDocumentSchema = z
  .object({
    agentRole: identifierSchema,
    judgeRole: identifierSchema,
    reviewRole: identifierSchema,
    roles: z.record(identifierSchema, rolePolicySchema),
    schemaVersion: z.literal(1),
    scope: z.literal("platform"),
    subagentOverrides: z.record(identifierSchema, subagentOverrideSchema),
  })
  .strict() satisfies z.ZodType<EveModelPolicyDocument>;

export const createEveModelPolicyDraftSchema = z
  .object({
    policy: eveModelPolicyDocumentSchema,
  })
  .strict();

export const mutateEveModelPolicySchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("evaluate"),
      policyId: z.string().uuid(),
    })
    .strict(),
  z
    .object({
      action: z.literal("activate"),
      expectedActivePolicyId: z.string().uuid().nullable(),
      policyId: z.string().uuid(),
    })
    .strict(),
  z
    .object({
      action: z.literal("rollback"),
      expectedActivePolicyId: z.string().uuid(),
    })
    .strict(),
  z
    .object({
      action: z.literal("override_budget"),
      additionalInputTokens: z.number().int().nonnegative().max(2_000_000),
      additionalOutputTokens: z.number().int().nonnegative().max(2_000_000),
      additionalRequests: z.number().int().nonnegative().max(1_000),
      additionalUsdMicros: z.number().int().nonnegative().max(100_000_000),
      expiresAt: z.string().datetime(),
      policyId: z.string().uuid(),
      reason: z.string().trim().min(1).max(500),
      scopeId: identifierSchema,
      scopeType: z.enum(["role", "subagent"]),
    })
    .strict()
    .refine(
      (value) =>
        value.additionalInputTokens > 0 ||
        value.additionalOutputTokens > 0 ||
        value.additionalRequests > 0 ||
        value.additionalUsdMicros > 0,
      "An emergency override must increase at least one hard limit.",
    )
    .refine(
      (value) => new Date(value.expiresAt).getTime() > Date.now(),
      "An emergency override must expire in the future.",
    )
    .refine(
      (value) => new Date(value.expiresAt).getTime() <= Date.now() + 86_400_000,
      "An emergency override may last at most 24 hours.",
    ),
]);

export function createDefaultEveModelPolicy(): EveModelPolicyDocument {
  const baseBudget = {
    maxInputTokens: 200_000,
    maxOutputTokens: 50_000,
    maxRequestsPerMinute: 20,
    maxUsdMicros: 5_000_000,
  };

  return {
    schemaVersion: 1,
    scope: "platform",
    agentRole: "agent",
    reviewRole: "review",
    judgeRole: "judge",
    roles: {
      agent: {
        primary: {
          route: "vercel_ai_gateway",
          modelId: "openai/gpt-5.2",
        },
        fallbacks: [],
        reasoning: "high",
        budget: { ...baseBudget },
        evalGate: { suiteId: "eve-agent", minimumScoreBps: 9_000 },
      },
      review: {
        primary: {
          route: "vercel_ai_gateway",
          modelId: "openai/gpt-5.2",
        },
        fallbacks: [],
        reasoning: "high",
        budget: { ...baseBudget },
        evalGate: { suiteId: "eve-review", minimumScoreBps: 9_000 },
      },
      judge: {
        primary: {
          route: "vercel_ai_gateway",
          modelId: "anthropic/claude-opus-4.1",
        },
        fallbacks: [],
        reasoning: "high",
        budget: { ...baseBudget },
        evalGate: { suiteId: "eve-judge", minimumScoreBps: 9_000 },
      },
    },
    subagentOverrides: {},
  };
}
