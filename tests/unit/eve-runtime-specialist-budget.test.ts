import { describe, expect, it } from "vitest";

import {
  completeEveSpecialistModelStep,
  createEveSpecialistBudgetState,
  failEveSpecialistModelStep,
  reserveEveSpecialistModelStep,
  reserveEveSpecialistModelStepInState,
  resolveEveSpecialistBudgetLimits,
} from "../../packages/eve-runtime/agent/lib/specialist-budget";

const limits = {
  maxInputTokensPerSession: 120_000,
  maxOutputTokensPerSession: 12_000,
  maxRequestsPerMinute: 8,
  maxUsdMicros: 750_000,
};

describe("Eve specialist model budget", () => {
  it("reserves at most the resolved request rate in a rolling minute", () => {
    let state = createEveSpecialistBudgetState();
    for (let index = 0; index < 8; index += 1) {
      const reservation = reserveEveSpecialistModelStep({
        limits,
        nowMs: index,
        state,
        stepKey: `turn:${index}`,
      });
      expect(reservation.allowed).toBe(true);
      if (reservation.allowed) state = reservation.state;
      state = completeEveSpecialistModelStep({
        state,
        stepKey: `turn:${index}`,
        usage: { costUsd: 0, inputTokens: 1, outputTokens: 1 },
      });
    }

    expect(
      reserveEveSpecialistModelStep({
        limits,
        nowMs: 8,
        state,
        stepKey: "turn:blocked",
      }),
    ).toMatchObject({ allowed: false, reason: "rate_limit_exhausted" });
    expect(
      reserveEveSpecialistModelStep({
        limits,
        nowMs: 60_000,
        state,
        stepKey: "turn:next-window",
      }).allowed,
    ).toBe(true);
  });

  it("blocks the next model step after provider-reported cost reaches the cap", () => {
    const reserved = reserveEveSpecialistModelStep({
      limits,
      nowMs: 0,
      state: createEveSpecialistBudgetState(),
      stepKey: "turn:0",
    });
    if (!reserved.allowed) throw new Error("Expected the first reservation.");
    const state = completeEveSpecialistModelStep({
      state: reserved.state,
      stepKey: "turn:0",
      usage: { costUsd: 0.75, inputTokens: 10, outputTokens: 5 },
    });

    expect(state.usedUsdMicros).toBe(750_000);
    expect(
      reserveEveSpecialistModelStep({
        limits,
        nowMs: 1,
        state,
        stepKey: "turn:1",
      }),
    ).toMatchObject({ allowed: false, reason: "budget_exhausted" });
  });

  it("fails closed after missing completion usage or a failed reserved step", () => {
    const first = reserveEveSpecialistModelStep({
      limits,
      nowMs: 0,
      state: createEveSpecialistBudgetState(),
      stepKey: "turn:missing",
    });
    if (!first.allowed) throw new Error("Expected the first reservation.");
    const incomplete = completeEveSpecialistModelStep({
      state: first.state,
      stepKey: "turn:missing",
      usage: undefined,
    });
    expect(
      reserveEveSpecialistModelStep({
        limits,
        nowMs: 1,
        state: incomplete,
        stepKey: "turn:blocked",
      }),
    ).toMatchObject({ allowed: false, reason: "metering_incomplete" });

    const second = reserveEveSpecialistModelStep({
      limits,
      nowMs: 0,
      state: createEveSpecialistBudgetState(),
      stepKey: "turn:failed",
    });
    if (!second.allowed) throw new Error("Expected the second reservation.");
    expect(
      failEveSpecialistModelStep({
        state: second.state,
        stepKey: "turn:failed",
      }).meteringIncomplete,
    ).toBe(true);
  });

  it("enforces the stricter catalog or active-policy limit on every axis", () => {
    expect(
      resolveEveSpecialistBudgetLimits({
        catalog: limits,
        policy: {
          maxInputTokensPerSession: 100_000,
          maxOutputTokensPerSession: 15_000,
          maxRequestsPerMinute: 4,
          maxUsdMicros: 900_000,
        },
      }),
    ).toEqual({
      maxInputTokensPerSession: 100_000,
      maxOutputTokensPerSession: 12_000,
      maxRequestsPerMinute: 4,
      maxUsdMicros: 750_000,
    });
  });

  it("reserves against the live state instead of overwriting concurrent usage", () => {
    const concurrent = reserveEveSpecialistModelStep({
      limits,
      nowMs: 10,
      state: createEveSpecialistBudgetState(),
      stepKey: "turn:concurrent",
    });
    if (!concurrent.allowed)
      throw new Error("Expected concurrent reservation.");
    let liveState = concurrent.state;

    const allowed = reserveEveSpecialistModelStepInState({
      limits,
      nowMs: 11,
      state: {
        update(updater) {
          liveState = updater(liveState);
        },
      },
      stepKey: "turn:stale-caller",
    });

    expect(allowed).toBe(false);
    expect(liveState.pendingStepKeys).toEqual(["turn:concurrent"]);
    expect(liveState.requestStartedAtMs).toEqual([10]);
  });
});
