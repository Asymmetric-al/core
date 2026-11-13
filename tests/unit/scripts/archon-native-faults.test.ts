import { describe, expect, it, vi } from "vitest";

import {
  classifyNativeFaults,
  nativeFaultRequiresHold,
  readNativeFaults,
  RUN_DETAIL_LIMIT,
} from "../../../scripts/archon-factory/pack/.shared/native-faults.mjs";

const RUN_ID = "native-run-5";
const NOW = "2026-11-12T02:00:00.000Z";
const RESET = "2026-11-12T04:00:00.000Z";

function failedEvent(
  data: Record<string, unknown> = {},
  overrides: Record<string, unknown> = {},
) {
  return {
    id: "event-1",
    workflow_run_id: RUN_ID,
    event_type: "node_failed",
    step_index: 4,
    step_name: "build",
    created_at: NOW,
    event_order: 1,
    data: { error: "provider text is evidence, not policy", ...data },
    ...overrides,
  };
}

function outcomes(
  nodes: Record<string, unknown>[] = [{ node_id: "build", state: "failed" }],
) {
  return { run_id: RUN_ID, first_failed_node: "build", nodes };
}

function detail(
  events: ReturnType<typeof failedEvent>[],
  overrides: Record<string, unknown> = {},
) {
  return { id: RUN_ID, status: "running", metadata: {}, events, ...overrides };
}

function failure(
  data: Record<string, unknown>,
  overrides: Record<string, unknown> = {},
) {
  return classifyNativeFaults({
    runId: RUN_ID,
    outcomes: outcomes(),
    detail: detail([failedEvent(data)], overrides),
  });
}

function invocation(iteration: number) {
  return {
    id: `invocation-${iteration}`,
    startedAt: NOW,
    loopPath: [{ groupId: "reviews", iteration }],
  };
}

describe("pinned native provider fault settlement", () => {
  it("does not turn contradictory canonical lifecycle metadata into an ordinary code failure", () => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: outcomes(),
      detail: detail([
        failedEvent({
          failure_kind: "exec_failed",
          lifecycle: {
            status: "failed",
            error: "provider text is evidence, not policy",
            failureKind: "fatal",
            providerFailure: { class: "auth", evidence: "sdk_auth" },
          },
        }),
      ]),
    });

    expect(report).toMatchObject({
      action: "reconcile",
      reason: "native-fault-metadata-mismatch",
      preserveOwnership: true,
    });
  });

  it("holds an incomplete outcomes listing instead of hiding a current raw provider fault", () => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: { run_id: RUN_ID, first_failed_node: null, nodes: [] },
      detail: detail([
        failedEvent({
          failure_kind: "fatal",
          provider_failure: { class: "auth", evidence: "sdk_auth" },
        }),
      ]),
    });

    expect(report).toMatchObject({
      action: "reconcile",
      reason: "native-outcomes-incomplete",
      preserveOwnership: true,
    });
  });

  it("accepts the consumer starting after its immutable outcomes snapshot was prepared", () => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: {
        run_id: RUN_ID,
        first_failed_node: null,
        nodes: [{ node_id: "record", state: "pending" }],
      },
      detail: detail([
        failedEvent(
          {},
          { event_type: "node_started", step_name: "record", data: {} },
        ),
      ]),
    });

    expect(report).toMatchObject({
      action: "none",
      preserveOwnership: false,
      automaticRetry: false,
      faults: [],
    });
  });

  it("requires owner action for quota without a reported reset, never a code repair", () => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: outcomes(),
      detail: detail([
        failedEvent({
          failure_kind: "fatal",
          provider_failure: {
            class: "quota_exhausted",
            evidence: "billing_error",
          },
        }),
      ]),
    });

    expect(report).toMatchObject({
      schema: "core-native-faults/v1",
      runId: RUN_ID,
      runStatus: "running",
      action: "owner-action",
      reason: "quota-reset-unavailable",
      preserveOwnership: true,
      automaticRetry: false,
      wait: null,
      faults: [
        {
          nodeId: "build",
          eventId: "event-1",
          failureKind: "fatal",
          providerClass: "quota_exhausted",
          resetAt: null,
        },
      ],
    });
    expect(JSON.stringify(report)).not.toContain("billing_error");
  });

  it.each([
    ["auth", "fatal", "owner-action", "provider-auth"],
    ["budget_exceeded", "fatal", "owner-action", "provider-budget-exceeded"],
    [
      "misconfigured",
      "fatal",
      "configuration-action",
      "provider-misconfigured",
    ],
    [
      "rate_limited",
      "rate_limited",
      "native-recovery",
      "provider-rate_limited",
    ],
    ["overloaded", "overloaded", "native-recovery", "provider-overloaded"],
    ["transient", "transient", "native-recovery", "provider-transient"],
    ["unknown", "unknown", "reconcile", "provider-unknown"],
  ])(
    "routes typed %s outside implementation repair",
    (providerClass, failureKind, action, reason) => {
      const report = failure({
        failure_kind: failureKind,
        provider_failure: { class: providerClass, evidence: "opaque-sdk-code" },
      });

      expect(report).toMatchObject({
        action,
        reason,
        preserveOwnership: true,
        automaticRetry: false,
        wait: null,
        faults: [
          {
            nodeId: "build",
            eventId: "event-1",
            failureKind,
            providerClass,
            resetAt: null,
            retryAfterMs: null,
          },
        ],
      });
      expect(nativeFaultRequiresHold(report)).toBe(true);
      expect(JSON.stringify(report)).not.toContain("opaque-sdk-code");
    },
  );

  it("does not reinterpret a 429 backoff as a subscription quota reset or native wait", () => {
    const report = failure({
      failure_kind: "rate_limited",
      provider_failure: {
        class: "rate_limited",
        evidence: "http_429",
        retryAfterMs: 30_000,
      },
    });

    expect(report).toMatchObject({
      action: "native-recovery",
      wait: null,
      automaticRetry: false,
      faults: [
        { providerClass: "rate_limited", resetAt: null, retryAfterMs: 30_000 },
      ],
    });
  });

  it("preserves a reported quota reset without inventing host eligibility or scheduling a pause", () => {
    const report = failure({
      failure_kind: "fatal",
      provider_failure: {
        class: "quota_exhausted",
        evidence: "rate_limit_event",
        resetAt: RESET,
      },
    });

    expect(report).toMatchObject({
      action: "native-recovery",
      reason: "quota-reset-reported",
      wait: null,
      automaticRetry: false,
      preserveOwnership: true,
      faults: [{ resetAt: RESET, retryAfterMs: null }],
    });
  });

  it("never treats retryAfterMs as quota's provider-reported resetAt", () => {
    const report = failure({
      failure_kind: "fatal",
      provider_failure: {
        class: "quota_exhausted",
        evidence: "billing_error",
        retryAfterMs: 600_000,
      },
    });

    expect(report).toMatchObject({
      action: "owner-action",
      reason: "quota-reset-unavailable",
      wait: null,
      faults: [{ resetAt: null, retryAfterMs: 600_000 }],
      automaticRetry: false,
    });
  });

  it.each(["0", "11/12/2026", "2026-02-30T00:00:00Z"])(
    "does not schedule recovery from an ambiguous or normalized quota reset %s",
    (resetAt) => {
      const report = failure({
        failure_kind: "fatal",
        provider_failure: {
          class: "quota_exhausted",
          evidence: "opaque",
          resetAt,
        },
      });

      expect(report).toMatchObject({
        action: "reconcile",
        reason: "native-fault-invalid",
        preserveOwnership: true,
        automaticRetry: false,
      });
    },
  );

  it.each(["exec_failed", "output_contract", "max_iterations"])(
    "delegates typed %s without granting an effects-safe retry",
    (failureKind) => {
      const report = failure({
        failure_kind: failureKind,
        error: "quota exhausted; token expired; HTTP 429",
      });

      expect(report).toMatchObject({
        action: "code-failure",
        reason: "typed-code-failure",
        preserveOwnership: false,
        automaticRetry: false,
        faults: [
          {
            failureKind,
            providerClass: null,
            resetAt: null,
            retryAfterMs: null,
          },
        ],
      });
      expect(nativeFaultRequiresHold(report)).toBe(false);
    },
  );

  it.each([
    ["timeout", "reconcile"],
    ["child_failed", "reconcile"],
    ["unknown", "reconcile"],
    ["fatal", "reconcile"],
    ["config", "configuration-action"],
    ["cancelled", "cancelled"],
    ["rate_limited", "native-recovery"],
    ["overloaded", "native-recovery"],
    ["transient", "native-recovery"],
  ])(
    "preserves ownership for native %s even without provider metadata",
    (failureKind, action) => {
      const report = failure({ failure_kind: failureKind });

      expect(report).toMatchObject({
        action,
        preserveOwnership: true,
        automaticRetry: false,
      });
      expect(nativeFaultRequiresHold(report)).toBe(true);
    },
  );

  it("does not infer typed provider faults from arbitrary error prose", () => {
    const report = failure({
      error:
        "Authentication expired, subscription quota exhausted, retry tomorrow",
    });

    expect(report).toMatchObject({
      action: "reconcile",
      faults: [{ failureKind: null, providerClass: null, resetAt: null }],
    });
  });

  it("does not accept invented typed NODE_OUTCOMES fields as native failure evidence", () => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: outcomes([
        {
          node_id: "build",
          state: "failed",
          failure_kind: "exec_failed",
          provider_failure: { class: "auth", evidence: "fake" },
        },
      ]),
      detail: detail([failedEvent()]),
    });

    expect(report).toMatchObject({
      action: "reconcile",
      preserveOwnership: true,
      faults: [{ failureKind: null, providerClass: null }],
    });
  });

  it("ignores a recovered attempt's old quota event using current node state and native event order", () => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: {
        run_id: RUN_ID,
        first_failed_node: null,
        nodes: [{ node_id: "build", state: "completed" }],
      },
      detail: detail([
        failedEvent(
          {},
          {
            id: "complete",
            event_order: 3,
            event_type: "node_completed",
            data: {},
          },
        ),
        failedEvent({
          failure_kind: "fatal",
          provider_failure: { class: "quota_exhausted", evidence: "old" },
        }),
        failedEvent(
          {},
          {
            id: "restart",
            event_order: 2,
            event_type: "node_started",
            data: {},
          },
        ),
      ]),
    });

    expect(report).toMatchObject({
      action: "none",
      faults: [],
      preserveOwnership: false,
      automaticRetry: false,
    });
  });

  it("matches pinned COALESCE(event_order, 0) ordering rather than trusting skewed legacy timestamps", () => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: {
        run_id: RUN_ID,
        first_failed_node: null,
        nodes: [{ node_id: "build", state: "completed" }],
      },
      detail: detail([
        failedEvent(
          {
            failure_kind: "fatal",
            provider_failure: { class: "quota_exhausted", evidence: "old" },
          },
          { event_order: null, created_at: RESET },
        ),
        failedEvent(
          {},
          {
            id: "complete",
            event_order: 2,
            event_type: "node_completed",
            data: {},
          },
        ),
      ]),
    });

    expect(report).toMatchObject({
      action: "none",
      faults: [],
      preserveOwnership: false,
    });
  });

  it("reads raw SQLite event timestamps without applying the local timezone to provider reset fields", () => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: outcomes(),
      detail: detail([
        failedEvent(
          {
            failure_kind: "fatal",
            provider_failure: {
              class: "quota_exhausted",
              evidence: "opaque",
              resetAt: "2026-11-12T11:00:00+07:00",
            },
          },
          { created_at: "2026-11-12 02:00:00" },
        ),
      ]),
    });

    expect(report).toMatchObject({
      action: "native-recovery",
      faults: [{ resetAt: "2026-11-12T11:00:00+07:00" }],
      automaticRetry: false,
    });
  });

  it("does not authorize settlement from a failed snapshot after the native node restarted", () => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: outcomes(),
      detail: detail([
        failedEvent({ failure_kind: "exec_failed" }),
        failedEvent(
          {},
          {
            id: "restart",
            event_order: 2,
            event_type: "node_started",
            data: {},
          },
        ),
      ]),
    });

    expect(report).toMatchObject({
      action: "reconcile",
      reason: "native-outcomes-stale",
      preserveOwnership: true,
    });
  });

  it("associates current loop faults by native loop path, not node name alone", () => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: {
        run_id: RUN_ID,
        first_failed_node: "reviews.build",
        nodes: [
          {
            node_id: "reviews.build",
            state: "completed",
            loop_group_path: invocation(1).loopPath,
          },
          {
            node_id: "reviews.build",
            state: "failed",
            loop_group_path: invocation(2).loopPath,
          },
        ],
      },
      detail: detail([
        failedEvent(
          { failure_kind: "exec_failed", invocation: invocation(2) },
          { id: "current-loop", step_name: "reviews.build", event_order: 2 },
        ),
        failedEvent(
          { invocation: invocation(1) },
          {
            id: "prior-loop",
            step_name: "reviews.build",
            event_type: "node_completed",
            event_order: 1,
          },
        ),
      ]),
    });

    expect(report).toMatchObject({
      action: "code-failure",
      faults: [
        {
          nodeId: "reviews.build",
          eventId: "current-loop",
          failureKind: "exec_failed",
        },
      ],
    });
  });

  it("never borrows a previous loop's typed fault for an unobserved current iteration", () => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: {
        run_id: RUN_ID,
        first_failed_node: "reviews.build",
        nodes: [
          {
            node_id: "reviews.build",
            state: "failed",
            loop_group_path: invocation(2).loopPath,
          },
        ],
      },
      detail: detail([
        failedEvent(
          { failure_kind: "exec_failed", invocation: invocation(1) },
          { step_name: "reviews.build" },
        ),
      ]),
    });

    expect(report).toMatchObject({
      action: "reconcile",
      preserveOwnership: true,
    });
  });

  it("lets any unresolved provider fault override an ordinary sibling code failure", () => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: outcomes([
        { node_id: "build", state: "failed" },
        { node_id: "assess", state: "failed" },
      ]),
      detail: detail([
        failedEvent({ failure_kind: "exec_failed" }),
        failedEvent(
          {
            failure_kind: "fatal",
            provider_failure: { class: "auth", evidence: "expired" },
          },
          { id: "assess-auth", step_name: "assess", event_order: 2 },
        ),
      ]),
    });

    expect(report).toMatchObject({
      action: "owner-action",
      preserveOwnership: true,
    });
    expect(report.faults).toHaveLength(2);
  });

  it.each([
    { failure_kind: "future_kind" },
    {
      failure_kind: "exec_failed",
      provider_failure: { class: "future_class", evidence: "opaque" },
    },
    {
      failure_kind: "exec_failed",
      provider_failure: { class: "auth", evidence: "opaque" },
    },
    { failure_kind: "fatal", provider_failure: { class: "auth" } },
    {
      failure_kind: "rate_limited",
      provider_failure: {
        class: "rate_limited",
        evidence: "http_429",
        retryAfterMs: -1,
      },
    },
    {
      failure_kind: "fatal",
      provider_failure: {
        class: "quota_exhausted",
        evidence: "opaque",
        resetAt: "unknown",
      },
    },
    { failure_kind: "exec_failed", retryable: true },
  ])("fails closed for incomplete or conflicting fault metadata %j", (data) => {
    expect(failure(data)).toMatchObject({
      action: "reconcile",
      preserveOwnership: true,
      automaticRetry: false,
    });
  });
});

describe("persisted native wait and immutable hold contract", () => {
  const quotaWait = {
    owner: "node",
    nodeId: "build",
    kind: "quota",
    pauseId: "pause-1",
    waitingSince: NOW,
    resumeAt: RESET,
  };

  it("preserves an actual native quota pause without converting its backoff into subscription reset evidence", () => {
    const report = failure(
      {
        failure_kind: "rate_limited",
        provider_failure: {
          class: "rate_limited",
          evidence: "http_429",
          retryAfterMs: 60_000,
        },
      },
      { status: "paused", metadata: { wait: quotaWait } },
    );

    expect(report).toMatchObject({
      action: "native-wait",
      preserveOwnership: true,
      automaticRetry: false,
      wait: quotaWait,
      faults: [{ resetAt: null, retryAfterMs: 60_000 }],
    });
    expect(nativeFaultRequiresHold(report)).toBe(true);
  });

  it.each([
    {
      owner: "node",
      nodeId: "sleep",
      kind: "time",
      waitingSince: NOW,
      resumeAt: RESET,
    },
    {
      owner: "node",
      nodeId: "event",
      kind: "event",
      waitingSince: NOW,
      resumeAt: RESET,
      event: "review.received",
    },
    {
      owner: "node",
      nodeId: "approval",
      kind: "attention",
      waitingSince: NOW,
      message: "operator-only",
    },
    {
      owner: "loop_group",
      nodeId: "reviews",
      bodyWaitId: "question",
      iteration: 2,
      sessionId: null,
      sessionProvider: null,
      kind: "attention",
      waitingSince: NOW,
      message: "operator-only",
    },
  ])("retains the actual %j wait rather than settling it", (wait) => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: { run_id: RUN_ID, first_failed_node: null, nodes: [] },
      detail: detail([], { status: "paused", metadata: { wait } }),
    });

    expect(report).toMatchObject({
      action: "native-wait",
      preserveOwnership: true,
      automaticRetry: false,
      wait: {
        owner: wait.owner,
        nodeId: wait.nodeId,
        kind: wait.kind,
        waitingSince: NOW,
      },
    });
    expect(JSON.stringify(report)).not.toContain("operator-only");
  });

  it("never expires or clears a native hold because a recorded deadline is in the past", () => {
    const pastWait = {
      ...quotaWait,
      waitingSince: "2000-01-01T00:00:00Z",
      resumeAt: "2000-01-02T00:00:00Z",
    };
    const report = failure(
      {
        failure_kind: "fatal",
        provider_failure: { class: "quota_exhausted", evidence: "opaque" },
      },
      { status: "paused", metadata: { wait: pastWait } },
    );

    expect(report).toMatchObject({
      action: "native-wait",
      wait: pastWait,
      automaticRetry: false,
    });
    expect(nativeFaultRequiresHold(report)).toBe(true);
  });

  it("freezes a held observation and leaves it held even when a fresh observation is clear", () => {
    const held = failure({
      failure_kind: "fatal",
      provider_failure: { class: "auth", evidence: "expired" },
    });
    const fresh = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: { run_id: RUN_ID, first_failed_node: null, nodes: [] },
      detail: detail([]),
    });

    expect(Object.isFrozen(held)).toBe(true);
    expect(Object.isFrozen(held.faults)).toBe(true);
    expect(Object.isFrozen(held.faults[0])).toBe(true);
    expect(Reflect.set(held, "action", "none")).toBe(false);
    expect(nativeFaultRequiresHold(held)).toBe(true);
    expect(nativeFaultRequiresHold(fresh)).toBe(false);
    expect(fresh.automaticRetry).toBe(false);
  });

  it.each([
    null,
    undefined,
    {},
    { schema: "future-native-faults/v2" },
    { ...failure({ failure_kind: "exec_failed" }), preserveOwnership: true },
    { ...failure({ failure_kind: "exec_failed" }), automaticRetry: true },
    { ...failure({ failure_kind: "exec_failed" }), runStatus: "paused" },
    { ...failure({ failure_kind: "exec_failed" }), faults: [] },
    {
      ...failure({ failure_kind: "exec_failed" }),
      faults: [
        { nodeId: "build", eventId: "event-1", failureKind: "exec_failed" },
      ],
    },
    { ...failure({ failure_kind: "exec_failed" }), action: "none" },
    { ...failure({ failure_kind: "exec_failed" }), wait: quotaWait },
  ])(
    "fails closed for an absent, forged or incomplete hold observation %j",
    (report) => {
      expect(nativeFaultRequiresHold(report)).toBe(true);
    },
  );
});

describe("trusted pinned native reader", () => {
  it("rejects a contradictory first_failed_node marker instead of declaring the snapshot clear", () => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: {
        run_id: RUN_ID,
        first_failed_node: "build",
        nodes: [{ node_id: "build", state: "completed" }],
      },
      detail: detail([
        failedEvent({}, { event_type: "node_completed", data: {} }),
      ]),
    });

    expect(report).toMatchObject({
      action: "reconcile",
      reason: "native-outcomes-invalid",
      preserveOwnership: true,
    });
  });

  it.each(["cli", "api"])(
    "reads actual %s raw event envelopes",
    async (surface) => {
      const cli = detail([failedEvent({ failure_kind: "exec_failed" })]);
      const { events, ...run } = cli;
      const json =
        surface === "cli" ? cli : { run: { ...run, nodes: [] }, events };
      const raw = vi.fn().mockResolvedValue({ code: 0, json });

      const report = await readNativeFaults({
        archon: { raw },
        runId: RUN_ID,
        outcomes: outcomes(),
      });

      expect(raw).toHaveBeenCalledExactlyOnceWith(
        ["workflow", "get", RUN_ID, "--json", "--verbose", "--events"],
        undefined,
        { maxOutput: RUN_DETAIL_LIMIT },
      );
      expect(RUN_DETAIL_LIMIT).toBe(64 * 1024 * 1024);
      expect(report).toMatchObject({
        action: "code-failure",
        runId: RUN_ID,
        runStatus: "running",
        automaticRetry: false,
      });
    },
  );

  it.each([
    { code: 1, json: detail([failedEvent({ failure_kind: "exec_failed" })]) },
    { code: 0, json: null },
    { code: 0, stdout: "not JSON; private provider diagnostics" },
    {
      code: 0,
      json: {
        id: RUN_ID,
        status: "running",
        metadata: {},
        nodes: [{ node_id: "build", state: "failed" }],
      },
    },
    { code: 0, json: detail([], { id: "different-run" }) },
  ])(
    "does not degrade unsuccessful or summary-only native reads into normal settlement %j",
    async (response) => {
      const raw = vi.fn().mockResolvedValue(response);
      const report = await readNativeFaults({
        archon: { raw },
        runId: RUN_ID,
        outcomes: outcomes(),
      });

      expect(report).toMatchObject({
        action: "reconcile",
        preserveOwnership: true,
        automaticRetry: false,
      });
      expect(nativeFaultRequiresHold(report)).toBe(true);
      expect(JSON.stringify(report)).not.toContain(
        "private provider diagnostics",
      );
    },
  );

  it("turns transport exceptions into a hold without propagating provider prose or performing effects", async () => {
    const archon = {
      raw: vi.fn().mockRejectedValue(new Error("private transport text")),
      put: vi.fn(),
      fire: vi.fn(),
      resume: vi.fn(),
    };
    const report = await readNativeFaults({
      archon,
      runId: RUN_ID,
      outcomes: outcomes(),
    });

    expect(report).toMatchObject({
      action: "reconcile",
      preserveOwnership: true,
    });
    expect(JSON.stringify(report)).not.toContain("private transport text");
    expect(archon.raw).toHaveBeenCalledTimes(1);
    expect(archon.put).not.toHaveBeenCalled();
    expect(archon.fire).not.toHaveBeenCalled();
    expect(archon.resume).not.toHaveBeenCalled();
  });

  it.each([
    {
      run_id: "different-run",
      first_failed_node: "build",
      nodes: [{ node_id: "build", state: "failed" }],
    },
    {
      first_failed_node: "build",
      nodes: [{ node_id: "build", state: "failed" }],
    },
    {
      run_id: RUN_ID,
      first_failed_node: "build",
      nodes: [{ node_id: "build", state: "future-state" }],
    },
    outcomes([
      { node_id: "build", state: "failed" },
      { node_id: "build", state: "failed" },
    ]),
  ])("rejects wrong-run or malformed outcome observations %j", (listing) => {
    const report = classifyNativeFaults({
      runId: RUN_ID,
      outcomes: listing,
      detail: detail([failedEvent({ failure_kind: "exec_failed" })]),
    });

    expect(report).toMatchObject({
      action: "reconcile",
      preserveOwnership: true,
    });
  });

  it.each([
    failedEvent(
      { failure_kind: "exec_failed" },
      { workflow_run_id: "different-run" },
    ),
    failedEvent({ failure_kind: "exec_failed", runId: "different-run" }),
    failedEvent({ failure_kind: "exec_failed", path: "different-node" }),
    failedEvent({
      failure_kind: "exec_failed",
      invocation: {
        ...invocation(1),
        loopPath: [{ groupId: "reviews", iteration: 0 }],
      },
    }),
  ])(
    "rejects corrupt raw-event identity rather than borrowing typed diagnostics %j",
    (event) => {
      const report = classifyNativeFaults({
        runId: RUN_ID,
        outcomes: outcomes(),
        detail: detail([event]),
      });

      expect(report).toMatchObject({
        action: "reconcile",
        preserveOwnership: true,
      });
    },
  );
});
