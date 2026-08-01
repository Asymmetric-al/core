import { createHash } from "node:crypto";

import { hasBlockingSandboxFinding, scanEveSandboxPath } from "../sandbox";
import {
  EVE_DELEGATION_CAPS,
  EVE_SPECIALIST_CATALOG,
} from "../subagent-catalog";
import { eveDynamicWorkflowPlanSchema } from "./schema";
import {
  EveDynamicWorkflowValidationError,
  type EveDynamicWorkflowPlan,
  type EveDynamicWorkflowRuntimeState,
  type EveDynamicWorkflowStep,
  type EveValidatedDynamicWorkflowPlan,
} from "./types";

function canonicalize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value).sort(([left], [right]) =>
      left.localeCompare(right),
    );
    return `{${entries
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalize(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function digestPlan(plan: EveDynamicWorkflowPlan): string {
  return createHash("sha256").update(canonicalize(plan)).digest("hex");
}

export function createEveDynamicWorkflowStepInput(input: {
  plan: EveDynamicWorkflowPlan;
  step: EveDynamicWorkflowStep;
}): { message: string } {
  const { plan, step } = input;
  return {
    message: [
      "EVE_DYNAMIC_WORKFLOW_STEP_V1",
      `workflow=${plan.workflowId}`,
      `step=${step.id}`,
      `goal=${plan.goal}`,
      `task=${step.task}`,
      `targets=${JSON.stringify(step.targetPaths)}`,
      `required_output=${JSON.stringify(step.output)}`,
      "Use only the declared targets. Return advisory evidence, not authority.",
    ].join("\n"),
  };
}

export function authorizeEveDynamicWorkflowSubagentRequest(input: {
  requestInput: unknown;
  specialistId: string;
  state: EveDynamicWorkflowRuntimeState;
}): { stepId: string } {
  const plan = input.state.plan;
  if (!plan || !["prepared", "running"].includes(input.state.status)) {
    throw new EveDynamicWorkflowValidationError(
      "invalid_plan",
      "A current workflow ticket is required before subagent orchestration.",
    );
  }
  const step = plan.steps.find((candidate) => {
    const state = input.state.steps[candidate.id];
    if (
      candidate.specialistId !== input.specialistId ||
      state?.status !== "pending" ||
      !candidate.dependsOn.every(
        (dependency) => input.state.steps[dependency]?.status === "completed",
      )
    ) {
      return false;
    }
    return (
      canonicalize(input.requestInput) ===
      canonicalize(createEveDynamicWorkflowStepInput({ plan, step: candidate }))
    );
  });
  if (!step) {
    throw new EveDynamicWorkflowValidationError(
      "invalid_plan",
      "The subagent request is not an exact ready step from the prepared workflow.",
    );
  }
  return { stepId: step.id };
}

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/").replace(/^\.\//u, "");
}

function isWithinScope(path: string, scope: readonly string[]): boolean {
  return scope.some(
    (target) =>
      path === target || path.startsWith(`${target.replace(/\/$/u, "")}/`),
  );
}

function topologicalSort(plan: EveDynamicWorkflowPlan): string[] {
  const identifiers = new Set<string>();
  for (const step of plan.steps) {
    if (identifiers.has(step.id)) {
      throw new EveDynamicWorkflowValidationError(
        "duplicate_step",
        `Workflow step ${step.id} is declared more than once.`,
      );
    }
    identifiers.add(step.id);
  }

  for (const step of plan.steps) {
    for (const dependency of step.dependsOn) {
      if (!identifiers.has(dependency)) {
        throw new EveDynamicWorkflowValidationError(
          "missing_dependency",
          `Workflow step ${step.id} depends on missing step ${dependency}.`,
        );
      }
    }
  }

  const ordered: string[] = [];
  const remaining = new Map(plan.steps.map((step) => [step.id, step]));
  while (remaining.size > 0) {
    const ready = [...remaining.values()]
      .filter((step) => step.dependsOn.every((id) => ordered.includes(id)))
      .sort((left, right) => left.id.localeCompare(right.id));
    if (ready.length === 0) {
      throw new EveDynamicWorkflowValidationError(
        "cyclic_graph",
        "Workflow dependencies contain a cycle.",
      );
    }
    for (const step of ready) {
      ordered.push(step.id);
      remaining.delete(step.id);
    }
  }
  return ordered;
}

export function validateEveDynamicWorkflowPlan(input: {
  plan: unknown;
  rootSessionId: string;
}): EveValidatedDynamicWorkflowPlan {
  const parsed = eveDynamicWorkflowPlanSchema.safeParse(input.plan);
  if (!parsed.success) {
    throw new EveDynamicWorkflowValidationError(
      "invalid_plan",
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  }
  const plan = parsed.data as EveDynamicWorkflowPlan;
  if (plan.rootSessionId !== input.rootSessionId) {
    throw new EveDynamicWorkflowValidationError(
      "invalid_root_session",
      "The plan root session does not match the verified runtime session.",
    );
  }
  if (plan.scope.repository !== "Asymmetric-al/core") {
    throw new EveDynamicWorkflowValidationError(
      "unsupported_repository",
      "Dynamic workflows are restricted to Asymmetric-al/core.",
    );
  }

  const cap = EVE_DELEGATION_CAPS[plan.workflowType];
  const totalAttempts = plan.steps.reduce(
    (total, step) => total + step.maxAttempts,
    0,
  );
  const declaredRetries = totalAttempts - plan.steps.length;
  if (
    plan.budget.maxSubagentCalls > cap.maxSubagents ||
    totalAttempts > plan.budget.maxSubagentCalls ||
    declaredRetries > plan.budget.maxRetries
  ) {
    throw new EveDynamicWorkflowValidationError(
      "budget_cap_exceeded",
      "The workflow exceeds its application-owned call or retry cap.",
    );
  }

  const normalizedScope = plan.scope.targetPaths.map(normalizePath);
  const protectedPaths = new Set<string>();
  for (const path of normalizedScope) {
    const scan = scanEveSandboxPath(path);
    if (hasBlockingSandboxFinding(scan)) {
      throw new EveDynamicWorkflowValidationError(
        "invalid_target_path",
        `Workflow scope path ${path} is sensitive or escapes the repository.`,
      );
    }
    if (scan.requiresApproval) protectedPaths.add(path);
  }

  for (const step of plan.steps) {
    const catalogEntry = EVE_SPECIALIST_CATALOG[step.specialistId];
    if (!catalogEntry.workflowTypes.includes(plan.workflowType)) {
      throw new EveDynamicWorkflowValidationError(
        "invalid_specialist",
        `Specialist ${step.specialistId} is not eligible for ${plan.workflowType}.`,
      );
    }
    for (const rawPath of step.targetPaths) {
      const path = normalizePath(rawPath);
      const scan = scanEveSandboxPath(path);
      if (
        hasBlockingSandboxFinding(scan) ||
        !isWithinScope(path, normalizedScope)
      ) {
        throw new EveDynamicWorkflowValidationError(
          "invalid_target_path",
          `Step ${step.id} targets a sensitive or out-of-scope path: ${path}.`,
        );
      }
      if (scan.requiresApproval) protectedPaths.add(path);
    }
  }

  return {
    plan,
    digest: digestPlan(plan),
    topologicalOrder: topologicalSort(plan),
    protectedPaths: [...protectedPaths].sort(),
    requiresApproval:
      protectedPaths.size > 0 ||
      plan.steps.some((step) => step.declaredRisk === "high"),
  };
}
