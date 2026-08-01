import { z } from "zod";

import { EVE_SPECIALIST_IDS, EVE_WORKFLOW_TYPES } from "../subagent-catalog";
import {
  EVE_DYNAMIC_WORKFLOW_OPERATIONS,
  EVE_DYNAMIC_WORKFLOW_RISKS,
} from "./types";

const identifier = z
  .string()
  .min(1)
  .max(96)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/u);

const repositoryPath = z.string().min(1).max(512);

export const eveDynamicWorkflowStepSchema = z
  .object({
    id: identifier,
    operation: z.enum(EVE_DYNAMIC_WORKFLOW_OPERATIONS),
    specialistId: z.enum(EVE_SPECIALIST_IDS),
    task: z.string().min(1).max(8_000),
    targetPaths: z.array(repositoryPath).min(1).max(64),
    dependsOn: z.array(identifier).max(16),
    maxAttempts: z.number().int().min(1).max(3),
    failurePolicy: z.enum(["retry_then_stop_branch", "pause_workflow"]),
    declaredRisk: z.enum(EVE_DYNAMIC_WORKFLOW_RISKS.slice(0, 3)),
    output: z
      .object({
        artifactType: z.enum(["finding_set", "plan", "review", "status"]),
        requiredFields: z.array(identifier).min(1).max(32),
      })
      .strict(),
  })
  .strict();

export const eveDynamicWorkflowPlanSchema = z
  .object({
    schemaVersion: z.literal(1),
    workflowId: identifier,
    rootSessionId: identifier,
    workflowType: z.enum(EVE_WORKFLOW_TYPES),
    goal: z.string().min(1).max(8_000),
    scope: z
      .object({
        repository: z.literal("Asymmetric-al/core"),
        targetPaths: z.array(repositoryPath).min(1).max(128),
      })
      .strict(),
    budget: z
      .object({
        maxSubagentCalls: z.number().int().min(1).max(7),
        maxRetries: z.number().int().min(0).max(6),
      })
      .strict(),
    policySnapshot: z
      .object({
        governanceStateVersion: z.number().int().nonnegative(),
        policyId: identifier,
      })
      .strict(),
    steps: z.array(eveDynamicWorkflowStepSchema).min(1).max(7),
  })
  .strict();
