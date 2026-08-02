import { defineState } from "eve/context";

import type { EveModelUsageSnapshot } from "@asym/api/eve/model-policy/types";
import type { EveSpecialistBudget } from "@asym/api/eve/subagent-catalog";

const ROLLING_MINUTE_MS = 60_000;

export interface EveSpecialistBudgetState {
  meteringIncomplete: boolean;
  pendingStepKeys: string[];
  requestStartedAtMs: number[];
  usedInputTokens: number;
  usedOutputTokens: number;
  usedUsdMicros: number;
}

export function createEveSpecialistBudgetState(): EveSpecialistBudgetState {
  return {
    meteringIncomplete: false,
    pendingStepKeys: [],
    requestStartedAtMs: [],
    usedInputTokens: 0,
    usedOutputTokens: 0,
    usedUsdMicros: 0,
  };
}

export const eveSpecialistBudgetState = defineState<EveSpecialistBudgetState>(
  "asym.eve.specialist-budget.v1",
  createEveSpecialistBudgetState,
);

function currentRequestStarts(
  state: EveSpecialistBudgetState,
  nowMs: number,
): number[] {
  const windowStartMs = nowMs - ROLLING_MINUTE_MS;
  return state.requestStartedAtMs.filter(
    (startedAtMs) => startedAtMs > windowStartMs,
  );
}

export function createEveSpecialistModelStepKey(input: {
  stepIndex: number;
  turnId: string;
}): string {
  return `${input.turnId}:${input.stepIndex}`;
}

export function resolveEveSpecialistBudgetLimits(input: {
  catalog: EveSpecialistBudget;
  policy: EveSpecialistBudget;
}): EveSpecialistBudget {
  return {
    maxInputTokensPerSession: Math.min(
      input.catalog.maxInputTokensPerSession,
      input.policy.maxInputTokensPerSession,
    ),
    maxOutputTokensPerSession: Math.min(
      input.catalog.maxOutputTokensPerSession,
      input.policy.maxOutputTokensPerSession,
    ),
    maxRequestsPerMinute: Math.min(
      input.catalog.maxRequestsPerMinute,
      input.policy.maxRequestsPerMinute,
    ),
    maxUsdMicros: Math.min(
      input.catalog.maxUsdMicros,
      input.policy.maxUsdMicros,
    ),
  };
}

export function toEveSpecialistModelUsageSnapshot(input: {
  nowMs: number;
  state: EveSpecialistBudgetState;
}): EveModelUsageSnapshot {
  return {
    inputTokens: input.state.usedInputTokens,
    outputTokens: input.state.usedOutputTokens,
    requestsInCurrentMinute: currentRequestStarts(input.state, input.nowMs)
      .length,
    usdMicros: input.state.usedUsdMicros,
  };
}

export type EveSpecialistModelStepReservation =
  | { allowed: true; state: EveSpecialistBudgetState }
  | {
      allowed: false;
      reason:
        | "budget_exhausted"
        | "metering_incomplete"
        | "rate_limit_exhausted";
    };

export function reserveEveSpecialistModelStep(input: {
  limits: EveSpecialistBudget;
  nowMs: number;
  state: EveSpecialistBudgetState;
  stepKey: string;
}): EveSpecialistModelStepReservation {
  if (
    input.state.meteringIncomplete ||
    input.state.pendingStepKeys.length > 0
  ) {
    return { allowed: false, reason: "metering_incomplete" };
  }

  const requestStartedAtMs = currentRequestStarts(input.state, input.nowMs);
  if (requestStartedAtMs.length >= input.limits.maxRequestsPerMinute) {
    return { allowed: false, reason: "rate_limit_exhausted" };
  }

  if (
    input.state.usedInputTokens >= input.limits.maxInputTokensPerSession ||
    input.state.usedOutputTokens >= input.limits.maxOutputTokensPerSession ||
    input.state.usedUsdMicros >= input.limits.maxUsdMicros
  ) {
    return { allowed: false, reason: "budget_exhausted" };
  }

  return {
    allowed: true,
    state: {
      ...input.state,
      pendingStepKeys: [...input.state.pendingStepKeys, input.stepKey],
      requestStartedAtMs: [...requestStartedAtMs, input.nowMs],
    },
  };
}

interface EveSpecialistStepUsage {
  readonly costUsd?: number;
  readonly inputTokens?: number;
  readonly outputTokens?: number;
}

function isValidUsage(
  usage: EveSpecialistStepUsage | undefined,
): usage is Required<EveSpecialistStepUsage> {
  if (!usage) return false;
  return [usage.costUsd, usage.inputTokens, usage.outputTokens].every(
    (value) =>
      typeof value === "number" && Number.isFinite(value) && value >= 0,
  );
}

function removePendingStep(
  state: EveSpecialistBudgetState,
  stepKey: string,
): EveSpecialistBudgetState | null {
  if (!state.pendingStepKeys.includes(stepKey)) return null;
  return {
    ...state,
    pendingStepKeys: state.pendingStepKeys.filter((key) => key !== stepKey),
  };
}

export function completeEveSpecialistModelStep(input: {
  state: EveSpecialistBudgetState;
  stepKey: string;
  usage: EveSpecialistStepUsage | undefined;
}): EveSpecialistBudgetState {
  const settled = removePendingStep(input.state, input.stepKey);
  if (!settled) return input.state;
  if (!isValidUsage(input.usage)) {
    return { ...settled, meteringIncomplete: true };
  }

  return {
    ...settled,
    usedInputTokens: settled.usedInputTokens + input.usage.inputTokens,
    usedOutputTokens: settled.usedOutputTokens + input.usage.outputTokens,
    usedUsdMicros:
      settled.usedUsdMicros + Math.ceil(input.usage.costUsd * 1_000_000),
  };
}

export function failEveSpecialistModelStep(input: {
  state: EveSpecialistBudgetState;
  stepKey: string;
}): EveSpecialistBudgetState {
  const settled = removePendingStep(input.state, input.stepKey);
  if (!settled) return input.state;
  return { ...settled, meteringIncomplete: true };
}
