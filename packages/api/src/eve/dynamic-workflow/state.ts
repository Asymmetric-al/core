import { EveDynamicWorkflowValidationError } from "./types";

import type {
  EveDynamicWorkflowFailureAssessment,
  EveDynamicWorkflowPlan,
  EveDynamicWorkflowRuntimeState,
} from "./types";

export function createEveDynamicWorkflowRuntimeState(): EveDynamicWorkflowRuntimeState {
  return { status: "idle", dispatchedSubagents: 0, steps: {} };
}

export function prepareEveDynamicWorkflow(input: {
  expiresAt: string;
  plan: EveDynamicWorkflowPlan;
  planDigest: string;
  ticketId: string;
}): EveDynamicWorkflowRuntimeState {
  return {
    status: "prepared",
    dispatchedSubagents: 0,
    expiresAt: input.expiresAt,
    plan: input.plan,
    planDigest: input.planDigest,
    preparedGovernanceStateVersion:
      input.plan.policySnapshot.governanceStateVersion,
    steps: Object.fromEntries(
      input.plan.steps.map((step) => [
        step.id,
        { attempts: 0, callIds: [], status: "pending" as const },
      ]),
    ),
    ticketId: input.ticketId,
  };
}

function assertExecutable(
  state: EveDynamicWorkflowRuntimeState,
): asserts state is EveDynamicWorkflowRuntimeState & {
  plan: EveDynamicWorkflowPlan;
} {
  if (!state.plan || !["prepared", "running"].includes(state.status)) {
    throw new EveDynamicWorkflowValidationError(
      "invalid_plan",
      "No prepared dynamic workflow is available for dispatch.",
    );
  }
  if (state.expiresAt && Date.parse(state.expiresAt) <= Date.now()) {
    throw new EveDynamicWorkflowValidationError(
      "invalid_plan",
      "The dynamic workflow ticket has expired.",
    );
  }
}

export function dispatchEveDynamicWorkflowStep(input: {
  callId: string;
  specialistId: string;
  state: EveDynamicWorkflowRuntimeState;
}): { state: EveDynamicWorkflowRuntimeState; stepId: string } {
  assertExecutable(input.state);
  const plan = input.state.plan;
  if (input.state.dispatchedSubagents >= plan.budget.maxSubagentCalls) {
    throw new EveDynamicWorkflowValidationError(
      "budget_cap_exceeded",
      "The workflow subagent call cap has been reached.",
    );
  }
  const step = plan.steps.find((candidate) => {
    const stepState = input.state.steps[candidate.id];
    return (
      candidate.specialistId === input.specialistId &&
      stepState?.status === "pending" &&
      stepState.attempts < candidate.maxAttempts &&
      candidate.dependsOn.every(
        (dependency) => input.state.steps[dependency]?.status === "completed",
      )
    );
  });
  if (!step) {
    throw new EveDynamicWorkflowValidationError(
      "invalid_plan",
      `No ready plan step authorizes specialist ${input.specialistId}.`,
    );
  }
  const current = input.state.steps[step.id];
  if (!current) {
    throw new EveDynamicWorkflowValidationError(
      "invalid_plan",
      `Workflow state is missing step ${step.id}.`,
    );
  }
  return {
    stepId: step.id,
    state: {
      ...input.state,
      status: "running",
      dispatchedSubagents: input.state.dispatchedSubagents + 1,
      steps: {
        ...input.state.steps,
        [step.id]: {
          ...current,
          attempts: current.attempts + 1,
          callIds: [...current.callIds, input.callId],
          status: "running",
        },
      },
    },
  };
}

export function completeEveDynamicWorkflowStep(input: {
  callId: string;
  state: EveDynamicWorkflowRuntimeState;
}): EveDynamicWorkflowRuntimeState {
  const entry = Object.entries(input.state.steps).find(([, step]) =>
    step.callIds.includes(input.callId),
  );
  if (!entry) return input.state;
  const [stepId, current] = entry;
  const steps = {
    ...input.state.steps,
    [stepId]: { ...current, status: "completed" as const },
  };
  const completed = Object.values(steps).every(
    (step) => step.status === "completed" || step.status === "stopped",
  );
  return { ...input.state, steps, status: completed ? "completed" : "running" };
}

export function failEveDynamicWorkflowStep(input: {
  assessment: EveDynamicWorkflowFailureAssessment;
  callId: string;
  state: EveDynamicWorkflowRuntimeState;
}): EveDynamicWorkflowRuntimeState {
  const entry = Object.entries(input.state.steps).find(([, step]) =>
    step.callIds.includes(input.callId),
  );
  if (!entry) return input.state;
  const [stepId, current] = entry;
  const status =
    input.assessment.action === "retry_step"
      ? "pending"
      : input.assessment.action === "stop_branch"
        ? "stopped"
        : "failed";
  const stateStatus =
    input.assessment.action === "pause_run" ||
    input.assessment.action === "pause_workflow"
      ? "paused"
      : "running";
  let steps: EveDynamicWorkflowRuntimeState["steps"] = {
    ...input.state.steps,
    [stepId]: { ...current, status, lastFailure: input.assessment },
  };
  if (input.assessment.action === "stop_branch" && input.state.plan) {
    const stopped = new Set([stepId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const step of input.state.plan.steps) {
        if (
          !stopped.has(step.id) &&
          step.dependsOn.some((dependency) => stopped.has(dependency))
        ) {
          stopped.add(step.id);
          changed = true;
        }
      }
    }
    steps = Object.fromEntries(
      Object.entries(steps).map(([id, step]) => [
        id,
        stopped.has(id) ? { ...step, status: "stopped" as const } : step,
      ]),
    );
  }
  const terminal = Object.values(steps).every(
    (step) => step.status === "completed" || step.status === "stopped",
  );
  return {
    ...input.state,
    status: terminal ? "completed" : stateStatus,
    pause: stateStatus === "paused" ? input.assessment : input.state.pause,
    steps,
  };
}

export function resumeEveDynamicWorkflow(input: {
  currentGovernanceStateVersion: number;
  planDigest: string;
  state: EveDynamicWorkflowRuntimeState;
}): EveDynamicWorkflowRuntimeState {
  if (
    input.state.status !== "paused" ||
    input.state.planDigest !== input.planDigest ||
    input.state.preparedGovernanceStateVersion !==
      input.currentGovernanceStateVersion
  ) {
    throw new EveDynamicWorkflowValidationError(
      "invalid_plan",
      "A paused workflow may resume only against the same plan and governance version.",
    );
  }
  let steps = Object.fromEntries(
    Object.entries(input.state.steps).map(([id, step]) => {
      if (step.status !== "failed") return [id, step];
      const planStep = input.state.plan?.steps.find(
        (candidate) => candidate.id === id,
      );
      const status =
        planStep && step.attempts < planStep.maxAttempts
          ? ("pending" as const)
          : ("stopped" as const);
      return [id, { ...step, status }];
    }),
  );
  if (input.state.plan) {
    let changed = true;
    while (changed) {
      changed = false;
      for (const planStep of input.state.plan.steps) {
        const current = steps[planStep.id];
        if (
          current?.status === "pending" &&
          planStep.dependsOn.some(
            (dependency) => steps[dependency]?.status === "stopped",
          )
        ) {
          steps = {
            ...steps,
            [planStep.id]: { ...current, status: "stopped" },
          };
          changed = true;
        }
      }
    }
  }
  const terminal = Object.values(steps).every(
    (step) => step.status === "completed" || step.status === "stopped",
  );
  return {
    ...input.state,
    pause: undefined,
    status: terminal ? "completed" : "running",
    steps,
  };
}

export function cancelEveDynamicWorkflow(
  state: EveDynamicWorkflowRuntimeState,
): EveDynamicWorkflowRuntimeState {
  return { ...state, status: "cancelled" };
}
