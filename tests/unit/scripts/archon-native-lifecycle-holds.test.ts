import { describe, expect, it, vi } from "vitest";

import { releaseInactiveReservations } from "../../../scripts/archon-factory/pack/.shared/reservations.mjs";
import {
  Refusal,
  createAssignment,
  planClaim,
  planControl,
  planFinish,
  planReconcile,
  planSweep,
} from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";

const NOW = "2026-11-12T09:00:00.000Z";
const POLICY = "c".repeat(64);
const RUN = "run-native-original";
const ASSIGNMENT = "a12-native-original";
const FACTORY = { v: 1, mode: "run", intake: "open" };

const HELD_REPORT = {
  schema: "core-native-faults/v1",
  runId: RUN,
  runStatus: "failed",
  action: "owner-action",
  reason: "provider-quota_exhausted",
  faults: [],
  wait: null,
  automaticRetry: false,
  preserveOwnership: true,
};

const COMPACT_REPORT = {
  schema: "core-native-faults/v1",
  action: "none",
  artifact: {
    run: RUN,
    path: "native-fault-state.json",
    bytes: 200_000,
    sha256: "e".repeat(64),
  },
};

const HELD_REPORTS = [
  ["owner action", HELD_REPORT],
  ["native wait", { ...HELD_REPORT, action: "native-wait" }],
  ["native recovery", { ...HELD_REPORT, action: "native-recovery" }],
  ["unknown action", { ...HELD_REPORT, action: "future-action" }],
  [
    "unknown schema",
    {
      ...HELD_REPORT,
      schema: "core-native-faults/v2",
      action: "none",
      preserveOwnership: false,
    },
  ],
  [
    "malformed normal action",
    {
      schema: "core-native-faults/v1",
      action: "none",
      preserveOwnership: false,
    },
  ],
  [
    "valid normal report for another run",
    {
      ...HELD_REPORT,
      runId: "run-native-other",
      runStatus: "completed",
      action: "none",
      preserveOwnership: false,
    },
  ],
  ["compact artifact", COMPACT_REPORT],
  ["null evidence", null],
  ["undefined evidence", undefined],
] as const;

const NORMAL_REPORTS = [
  {
    ...HELD_REPORT,
    runStatus: "completed",
    action: "none",
    preserveOwnership: false,
  },
  {
    ...HELD_REPORT,
    action: "code-failure",
    preserveOwnership: false,
    faults: [
      {
        nodeId: "build",
        eventId: "event-build-failed",
        failureKind: "exec_failed",
        providerClass: null,
        resetAt: null,
        retryAfterMs: null,
      },
    ],
  },
];

function item() {
  return {
    ...createAssignment({
      issue: 12,
      assignmentId: ASSIGNMENT,
      owner: "fixture-owner",
      profileDigest: "a".repeat(64),
      scopeRevision: "b".repeat(64),
      policyRevision: POLICY,
      endState: "PR_READY",
      areas: ["lockfile"],
      by: "fixture-selector",
      now: NOW,
    }),
    status: "active",
    route: "repair",
    round: 1,
    run: { id: RUN, startedAt: NOW, route: "repair", head: null },
  };
}

function observed(value: ReturnType<typeof item> & { nativeFaults?: unknown }) {
  return {
    name: "core/issues/12",
    revision: 7,
    value,
    lease: { runId: RUN, live: false },
  };
}

function claim(document: ReturnType<typeof observed>, runId = RUN) {
  return planClaim(document, {
    runId,
    assignmentId: ASSIGNMENT,
    policyRevision: POLICY,
    now: NOW,
  });
}

function expectNativeHold(operation: () => unknown) {
  expect(operation).toThrow(Refusal);
  expect(operation).toThrow("native-fault-held");
}

function control(
  document: ReturnType<typeof observed>,
  action: string,
  policyRevision = "d".repeat(64),
) {
  return planControl(document, {
    action,
    by: "fixture-operator",
    now: NOW,
    requestId: `request-native-${action}`,
    installed: {
      policyRevision,
      profileDigest: "a".repeat(64),
    },
  });
}

describe("native-fault ownership holds", () => {
  it.each(HELD_REPORTS)(
    "keeps %s evidence and its original ownership despite a dead lease",
    (_label, nativeFaults) => {
      const document = observed({ ...item(), nativeFaults });
      const original = structuredClone(document);

      expectNativeHold(() => claim(document));
      expectNativeHold(() =>
        planReconcile(document, {
          now: NOW,
          runStatus: { id: RUN, status: "completed" },
        }),
      );
      expect(planSweep(document, { factory: FACTORY })).toEqual({
        action: "skip",
        reason: "native-fault-held",
      });
      expect(document).toEqual(original);
    },
  );

  it("refuses dead-lease reconciliation even when the original run completed", () => {
    const document = observed({ ...item(), nativeFaults: HELD_REPORT });

    expectNativeHold(() =>
      planReconcile(document, {
        now: NOW,
        runStatus: { id: RUN, status: "completed" },
      }),
    );
  });

  it("skips native-held work before sweep can schedule reconciliation", () => {
    const document = observed({ ...item(), nativeFaults: HELD_REPORT });

    expect(planSweep(document, { factory: FACTORY })).toEqual({
      action: "skip",
      reason: "native-fault-held",
    });
  });

  it("does not resume a held native run with a live lease", () => {
    const document = {
      ...observed({ ...item(), nativeFaults: HELD_REPORT }),
      lease: { runId: RUN, live: true },
    };

    expectNativeHold(() => claim(document));
  });

  it("does not dispatch idle held work after its execution lease ended", () => {
    const document = observed({
      ...item(),
      status: "waiting",
      nativeFaults: HELD_REPORT,
    });

    expectNativeHold(() => claim(document, "run-native-replacement"));
    expect(planSweep(document, { factory: FACTORY })).toEqual({
      action: "skip",
      reason: "native-fault-held",
    });
  });

  it("leaves legacy assignments without native-fault evidence unchanged", () => {
    const document = observed(item());

    expect(claim(document).resuming).toBe(true);
    expect(planReconcile(document, { now: NOW }).value.run).toBeNull();
    expect(planSweep(document, { factory: FACTORY })).toEqual({
      action: "reconcile",
      runId: RUN,
    });
  });

  it.each(NORMAL_REPORTS)(
    "permits normal lifecycle for valid $action evidence",
    (nativeFaults) => {
      const document = observed({ ...item(), nativeFaults });

      expect(claim(document).resuming).toBe(true);
      expect(planReconcile(document, { now: NOW }).value.run).toBeNull();
      expect(planSweep(document, { factory: FACTORY })).toEqual({
        action: "reconcile",
        runId: RUN,
      });
      expect(
        control(
          observed({ ...document.value, status: "BLOCKED" }),
          "retry",
          POLICY,
        ).value.status,
      ).toBe("pending");
    },
  );

  describe.each(HELD_REPORTS)(
    "operator controls with %s evidence",
    (_label, nativeFaults) => {
      it.each([
        ["retry", "BLOCKED", "run"],
        ["reopen", "PR_READY", "run"],
        ["reopen", "stopped", "stop"],
        ["release", "waiting", "hold"],
        ["reconcile", "waiting", "run"],
      ])(
        "refuses %s for %s work before changing the assignment or evidence",
        (action, status, mode) => {
          const document = observed({
            ...item(),
            status,
            control: mode,
            nativeFaults,
          });
          const original = structuredClone(document);

          expectNativeHold(() => control(document, action));
          expect(document).toEqual(original);
        },
      );
    },
  );

  it("keeps native-held run ownership when an operator stops a dead-lease run", () => {
    const document = observed({ ...item(), nativeFaults: HELD_REPORT });
    const result = control(document, "stop");

    expect(result.lease).toBeUndefined();
    expect(result.value.control).toBe("stop");
    expect(result.value.status).toBe("active");
    expect(result.value.run).toEqual(document.value.run);
    expect(result.value.assignment).toEqual(document.value.assignment);
    expect(result.value.nativeFaults).toEqual(HELD_REPORT);
    expect(result.value.history).toEqual(document.value.history);
  });

  it("does not finish away an unresolved native-held run", () => {
    const document = observed({ ...item(), nativeFaults: HELD_REPORT });

    expectNativeHold(() =>
      planFinish(document, { runId: RUN, now: NOW, outcome: "BLOCKED" }),
    );
  });
});

function reservationStore(holder: ReturnType<typeof observed>) {
  const reservations = {
    name: "core/reservations",
    revision: 11,
    value: { v: 1, areas: { lockfile: 12, unrelated: 13 } },
    lease: null,
  };
  const other = {
    ...observed({ ...item(), issue: 13, status: "MERGED", run: null }),
    name: "core/issues/13",
    lease: null,
  };
  const documents = new Map([
    [reservations.name, reservations],
    [holder.name, holder],
    [other.name, other],
  ]);
  const archon = {
    get: vi.fn(async (name: string) => structuredClone(documents.get(name))),
    put: vi.fn(async (name: string, value: unknown, options: unknown) => ({
      name,
      value,
      options,
    })),
  };
  return { archon, reservations };
}

// The one way out of a native-fault hold. The operator states that the cause
// is dealt with; the control proves the rest: the held run can no longer
// execute, and what it may have done on GitHub was read back.
describe("recover-native", () => {
  const TRANSIENT = {
    ...HELD_REPORT,
    action: "native-recovery",
    reason: "native-transient",
  };
  const held = (extra: Record<string, unknown> = {}) =>
    observed({
      ...item(),
      nativeFaults: TRANSIENT,
      blocker: {
        code: "native-recovery",
        detail: "native-transient",
        recovery: "Validate the run",
        route: "repair",
        at: NOW,
      },
      ...extra,
    } as ReturnType<typeof item>);
  const recover = (
    document: ReturnType<typeof observed>,
    extra: Record<string, unknown> = {},
  ) =>
    planControl(document, {
      action: "recover-native",
      by: "fixture-operator",
      reason: "provider outage is over",
      now: NOW,
      requestId: "request-native-recover",
      installed: { policyRevision: POLICY, profileDigest: "a".repeat(64) },
      runStatus: { id: RUN, status: "cancelled" },
      effects: { ok: true },
      ...extra,
    });
  const refusal = (operation: () => unknown) => {
    try {
      operation();
    } catch (error) {
      return (error as { code?: string }).code;
    }
    return "accepted";
  };

  it("clears the hold and waits on the interrupted route once the run has ended and its effects were read back", () => {
    const plan = recover(held()) as { value: Record<string, any> };
    expect({
      held: Object.hasOwn(plan.value, "nativeFaults"),
      status: plan.value.status,
      route: plan.value.route,
      run: plan.value.run,
      blocker: plan.value.blocker,
      history: plan.value.history.at(-1),
      request: plan.value.requests.at(-1),
    }).toEqual({
      held: false,
      status: "waiting",
      route: "repair",
      run: null,
      blocker: null,
      history: expect.objectContaining({
        run: RUN,
        outcome: "reconciled",
        next: "repair",
        summary:
          "Native fault hold (native-recovery: native-transient) cleared by fixture-operator: run run-native-original ended (cancelled) and its remote effects were read back",
      }),
      request: expect.objectContaining({
        id: "request-native-recover",
        action: "recover-native",
      }),
    });
  });

  it.each([
    ["failed", "run-not-terminal"],
    ["running", "run-not-terminal"],
    ["paused", "run-not-terminal"],
  ])("refuses while the engine reports the run %s", (status, code) => {
    expect(
      refusal(() => recover(held(), { runStatus: { id: RUN, status } })),
    ).toBe(code);
  });

  it("refuses when the engine cannot report the run, reports another run, or the lease is live", () => {
    const live = { ...held(), lease: { runId: RUN, live: true } };
    expect([
      refusal(() => recover(held(), { runStatus: null })),
      refusal(() =>
        recover(held(), { runStatus: { id: "other", status: "cancelled" } }),
      ),
      refusal(() => recover(live)),
    ]).toEqual(["run-not-terminal", "run-not-terminal", "lease-live"]);
  });

  it("refuses without a clean readback of the run's remote effects", () => {
    expect([
      refusal(() => recover(held(), { effects: undefined })),
      refusal(() =>
        recover(held(), {
          effects: {
            ok: false,
            detail: "remote branch is at an unknown commit",
          },
        }),
      ),
    ]).toEqual(["effects-unreconciled", "effects-unreconciled"]);
  });

  it("refuses an issue without a native hold, under another policy, another profile or an unconfirmed cleanup", () => {
    const clean = observed(item());
    const cleanup = held({
      cleanup: { step: "hooks-commit", runId: RUN, receipt: null },
    });
    expect([
      refusal(() => recover(clean)),
      refusal(() =>
        recover(held(), {
          installed: {
            policyRevision: "d".repeat(64),
            profileDigest: "a".repeat(64),
          },
        }),
      ),
      refusal(() =>
        recover(held(), {
          installed: { policyRevision: POLICY, profileDigest: "f".repeat(64) },
        }),
      ),
      refusal(() => recover(cleanup)),
    ]).toEqual([
      "no-native-hold",
      "policy-transition-required",
      "identity-drift",
      "cleanup-unconfirmed",
    ]);
  });

  it("does nothing when the same request is sent again", () => {
    const first = recover(held()) as { value: Record<string, unknown> };
    const again = recover({
      ...held(),
      revision: 8,
      value: first.value,
    } as never);
    expect((again as { noop?: boolean }).noop).toBe(true);
  });

  it("blocks an issue whose rounds keep ending in a native fault", () => {
    const plan = recover(held({ repeats: { "native-fault": 2 } })) as {
      value: Record<string, any>;
    };
    expect({
      status: plan.value.status,
      code: plan.value.blocker?.code,
    }).toEqual({ status: "BLOCKED", code: "no-progress" });
  });

  it("clears a hold left on an issue no run owns, leaving its state as it was", () => {
    const settled = held({ status: "BLOCKED", run: null, route: null });
    const plan = recover({ ...settled, lease: null }, { runStatus: null }) as {
      value: Record<string, any>;
    };
    expect({
      held: Object.hasOwn(plan.value, "nativeFaults"),
      status: plan.value.status,
      blocker: plan.value.blocker?.code,
      history: plan.value.history.at(-1)?.outcome,
    }).toEqual({
      held: false,
      status: "BLOCKED",
      blocker: "native-recovery",
      history: "native-recovered",
    });
  });

  it("stays the only control a native hold accepts", () => {
    for (const action of ["retry", "reopen", "release", "reconcile"])
      expect(refusal(() => control(held(), action, POLICY))).toBe(
        "native-fault-held",
      );
  });
});

describe("native-held conflict reservations", () => {
  it.each(HELD_REPORTS)(
    "retains %s holder ownership while releasing unrelated terminal work",
    async (_label, nativeFaults) => {
      const holder = observed({ ...item(), status: "BLOCKED", nativeFaults });
      const original = structuredClone(holder);
      const { archon, reservations } = reservationStore(holder);

      const result = await releaseInactiveReservations(archon);

      expect(result.released).toEqual(["unrelated"]);
      expect(archon.put).toHaveBeenCalledExactlyOnceWith(
        "core/reservations",
        { v: 1, areas: { lockfile: 12 } },
        { ifRevision: 11 },
      );
      expect(holder).toEqual(original);
      expect(reservations.value.areas).toEqual({ lockfile: 12, unrelated: 13 });
    },
  );

  it.each(["BLOCKED", "PR_READY", "MERGED", "stopped"])(
    "keeps compact evidence reservations for %s without an execution lease",
    async (status) => {
      const holder = {
        ...observed({ ...item(), status, nativeFaults: COMPACT_REPORT }),
        lease: null,
      };
      const { archon } = reservationStore(holder);

      expect(
        await releaseInactiveReservations(archon, { issues: [12] }),
      ).toEqual({ noop: true, released: [] });
      expect(archon.put).not.toHaveBeenCalled();
    },
  );

  it.each(NORMAL_REPORTS)(
    "releases terminal reservations with valid $action evidence",
    async (nativeFaults) => {
      const { archon } = reservationStore(
        observed({ ...item(), status: "BLOCKED", nativeFaults }),
      );

      expect((await releaseInactiveReservations(archon)).released).toEqual([
        "lockfile",
        "unrelated",
      ]);
    },
  );
});
