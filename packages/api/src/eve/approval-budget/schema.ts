import { z } from "zod";

import { EVE_POLICY_ACTION_IDS, EVE_BUDGET_SCOPE_TYPES } from "./types";

const targetKey = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-zA-Z0-9:_-]+$/, "Use a non-sensitive stable target key.");

export const executeEvePolicyTracerSchema = z
  .object({
    action: z.literal("execute"),
    actionId: z.enum(EVE_POLICY_ACTION_IDS),
    approvalId: z.string().uuid().optional(),
    targetKey,
  })
  .strict();
export const requestEvePolicyApprovalSchema = z
  .object({
    action: z.literal("request_approval"),
    actionId: z.enum(EVE_POLICY_ACTION_IDS),
    targetKey,
  })
  .strict();
export const decideEvePolicyApprovalSchema = z
  .object({
    action: z.literal("decide_approval"),
    approvalId: z.string().uuid(),
    approved: z.boolean(),
    reason: z.string().trim().min(1).max(500),
  })
  .strict();
export const createEveBudgetOverrideSchema = z
  .object({
    action: z.literal("override_budget"),
    scopeType: z.enum(EVE_BUDGET_SCOPE_TYPES),
    scopeId: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[a-zA-Z0-9_-]+$/),
    additionalRequests: z.number().int().nonnegative(),
    additionalUsdMicros: z.number().int().nonnegative(),
    additionalInputTokens: z.number().int().nonnegative(),
    additionalOutputTokens: z.number().int().nonnegative(),
    expiresAt: z.string().datetime({ offset: true }),
    reason: z.string().trim().min(1).max(500),
  })
  .strict()
  .refine(
    (value) =>
      value.additionalRequests +
        value.additionalUsdMicros +
        value.additionalInputTokens +
        value.additionalOutputTokens >
      0,
    "An override must increase at least one limit.",
  );
export const mutateEveApprovalBudgetSchema = z.discriminatedUnion("action", [
  executeEvePolicyTracerSchema,
  requestEvePolicyApprovalSchema,
  decideEvePolicyApprovalSchema,
  createEveBudgetOverrideSchema,
]);
