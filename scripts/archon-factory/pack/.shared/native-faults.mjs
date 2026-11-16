const SCHEMA = "core-native-faults/v1";
const RUN_STATUSES = new Set([
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled",
  "paused",
]);
const NODE_STATES = new Set([
  "pending",
  "running",
  "completed",
  "failed",
  "skipped",
]);
const FAILURE_KINDS = new Set([
  "fatal",
  "transient",
  "unknown",
  "rate_limited",
  "overloaded",
  "timeout",
  "exec_failed",
  "output_contract",
  "max_iterations",
  "child_failed",
  "cancelled",
  "config",
]);
const PROVIDER_CLASSES = new Set([
  "auth",
  "quota_exhausted",
  "budget_exceeded",
  "misconfigured",
  "rate_limited",
  "overloaded",
  "transient",
  "unknown",
]);
const CODE_FAILURES = new Set([
  "exec_failed",
  "output_contract",
  "max_iterations",
]);
const EVENT_STATES = new Map([
  ["node_started", "running"],
  ["node_completed", "completed"],
  ["node_failed", "failed"],
  ["node_skipped", "skipped"],
  ["node_suspended", "running"],
  ["node_skipped_prior_success", "completed"],
  ["node_always_run_reset", "pending"],
  ["node_prior_cache_invalidated", "pending"],
]);
const ACTION_PRIORITY = [
  "reconcile",
  "owner-action",
  "configuration-action",
  "cancelled",
  "native-recovery",
  "code-failure",
];

function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value) {
  return typeof value === "string" && value.length > 0;
}

function timestamp(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    ) ||
    !Number.isFinite(Date.parse(value))
  )
    return false;
  const local = Date.parse(`${value.slice(0, 19)}Z`);
  return (
    Number.isFinite(local) &&
    new Date(local).toISOString().slice(0, 19) === value.slice(0, 19)
  );
}

function eventTimestamp(value) {
  if (typeof value !== "string") return NaN;
  const hydrated = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value)
    ? `${value.replace(" ", "T")}Z`
    : value;
  return timestamp(hydrated) ? Date.parse(hydrated) : NaN;
}

function loopPath(value) {
  return (
    Array.isArray(value) &&
    value.every(
      (frame) =>
        object(frame) &&
        text(frame.groupId) &&
        Number.isSafeInteger(frame.iteration) &&
        frame.iteration > 0,
    )
  );
}

function invocationKey(nodeId, path) {
  return JSON.stringify([
    nodeId,
    path.map((frame) => [frame.groupId, frame.iteration]),
  ]);
}

function result(runId, runStatus, action, reason, faults = [], wait = null) {
  return Object.freeze({
    schema: SCHEMA,
    runId: text(runId) ? runId : null,
    runStatus,
    action,
    reason,
    faults: Object.freeze(faults.map((fault) => Object.freeze({ ...fault }))),
    wait: wait === null ? null : Object.freeze({ ...wait }),
    preserveOwnership: action !== "none" && action !== "code-failure",
    automaticRetry: false,
  });
}

function readWait(value) {
  if (
    !object(value) ||
    !["node", "loop_group"].includes(value.owner) ||
    !text(value.nodeId) ||
    !["time", "event", "quota", "attention"].includes(value.kind) ||
    !timestamp(value.waitingSince) ||
    (value.pauseId !== undefined && !text(value.pauseId))
  )
    return null;
  if (
    value.owner === "loop_group" &&
    (!text(value.bodyWaitId) ||
      !Number.isSafeInteger(value.iteration) ||
      value.iteration < 1 ||
      !(value.sessionId === null || typeof value.sessionId === "string") ||
      !(
        value.sessionProvider === null ||
        typeof value.sessionProvider === "string"
      ))
  )
    return null;
  if (
    value.kind === "quota" &&
    (value.owner !== "node" || !text(value.pauseId))
  )
    return null;
  if (value.kind !== "attention" && !timestamp(value.resumeAt)) return null;
  if (value.kind === "event" && !text(value.event)) return null;
  if (value.kind === "attention" && !text(value.message)) return null;
  return {
    owner: value.owner,
    nodeId: value.nodeId,
    kind: value.kind,
    ...(value.pauseId !== undefined ? { pauseId: value.pauseId } : {}),
    waitingSince: value.waitingSince,
    ...(value.kind !== "attention" ? { resumeAt: value.resumeAt } : {}),
  };
}

function inspectEvents(events, runId) {
  const ids = new Set();
  const latest = new Map();
  for (const event of events) {
    if (
      !object(event) ||
      !text(event.id) ||
      ids.has(event.id) ||
      event.workflow_run_id !== runId ||
      !text(event.event_type) ||
      !(event.step_name === null || typeof event.step_name === "string") ||
      !(event.step_index === null || Number.isFinite(event.step_index)) ||
      !object(event.data) ||
      !Number.isFinite(eventTimestamp(event.created_at)) ||
      !(event.event_order == null || Number.isSafeInteger(event.event_order))
    ) {
      return { reason: "native-events-invalid" };
    }
    ids.add(event.id);
    if (!EVENT_STATES.has(event.event_type)) continue;
    const data = event.data;
    if (
      !text(event.step_name) ||
      (data.runId !== undefined && data.runId !== runId) ||
      (data.path !== undefined && data.path !== event.step_name) ||
      (data.lifecycle !== undefined &&
        (!object(data.lifecycle) ||
          data.lifecycle.status !== event.event_type.slice(5))) ||
      (data.invocation !== undefined &&
        (!object(data.invocation) ||
          !text(data.invocation.id) ||
          !timestamp(data.invocation.startedAt) ||
          !loopPath(data.invocation.loopPath)))
    ) {
      return { reason: "native-event-identity-invalid" };
    }
    const key = invocationKey(event.step_name, data.invocation?.loopPath ?? []);
    const previous = latest.get(key);
    if (previous) {
      const difference =
        (event.event_order ?? 0) - (previous.event_order ?? 0) ||
        eventTimestamp(event.created_at) - eventTimestamp(previous.created_at);
      if (difference === 0) return { reason: "native-event-order-ambiguous" };
      if (difference < 0) continue;
    }
    latest.set(key, event);
  }
  return { latest };
}

function faultFrom(event, nodeId) {
  const data = event.data;
  const provider = data.provider_failure;
  const fault = {
    nodeId,
    eventId: event.id,
    failureKind: FAILURE_KINDS.has(data.failure_kind)
      ? data.failure_kind
      : null,
    providerClass:
      object(provider) && PROVIDER_CLASSES.has(provider.class)
        ? provider.class
        : null,
    resetAt:
      object(provider) && timestamp(provider.resetAt) ? provider.resetAt : null,
    retryAfterMs:
      object(provider) &&
      Number.isSafeInteger(provider.retryAfterMs) &&
      provider.retryAfterMs >= 0
        ? provider.retryAfterMs
        : null,
  };
  const lifecycle = data.lifecycle;
  if (
    lifecycle !== undefined &&
    (lifecycle.error !== data.error ||
      lifecycle.failureKind !== data.failure_kind ||
      lifecycle.retryable !== data.retryable ||
      (lifecycle.providerFailure === undefined) !== (provider === undefined) ||
      (provider !== undefined &&
        (!object(lifecycle.providerFailure) ||
          !object(provider) ||
          ["class", "evidence", "resetAt", "retryAfterMs"].some(
            (key) => lifecycle.providerFailure[key] !== provider[key],
          ))))
  ) {
    return {
      fault,
      action: "reconcile",
      reason: "native-fault-metadata-mismatch",
    };
  }
  if (
    typeof data.error !== "string" ||
    (data.retryable !== undefined && data.retryable !== false) ||
    (data.failure_kind !== undefined &&
      !FAILURE_KINDS.has(data.failure_kind)) ||
    (provider !== undefined &&
      (!object(provider) ||
        !PROVIDER_CLASSES.has(provider.class) ||
        typeof provider.evidence !== "string" ||
        (provider.resetAt !== undefined && !timestamp(provider.resetAt)) ||
        (provider.retryAfterMs !== undefined &&
          (!Number.isSafeInteger(provider.retryAfterMs) ||
            provider.retryAfterMs < 0))))
  ) {
    return { fault, action: "reconcile", reason: "native-fault-invalid" };
  }
  if (provider !== undefined) {
    const expectedKind = [
      "auth",
      "quota_exhausted",
      "budget_exceeded",
      "misconfigured",
    ].includes(provider.class)
      ? "fatal"
      : provider.class;
    if (fault.failureKind !== expectedKind) {
      return {
        fault,
        action: "reconcile",
        reason: "native-fault-kind-mismatch",
      };
    }
    switch (provider.class) {
      case "auth":
        return { fault, action: "owner-action", reason: "provider-auth" };
      case "quota_exhausted":
        return fault.resetAt === null
          ? { fault, action: "owner-action", reason: "quota-reset-unavailable" }
          : {
              fault,
              action: "native-recovery",
              reason: "quota-reset-reported",
            };
      case "budget_exceeded":
        return {
          fault,
          action: "owner-action",
          reason: "provider-budget-exceeded",
        };
      case "misconfigured":
        return {
          fault,
          action: "configuration-action",
          reason: "provider-misconfigured",
        };
      case "unknown":
        return { fault, action: "reconcile", reason: "provider-unknown" };
      default:
        return {
          fault,
          action: "native-recovery",
          reason: `provider-${provider.class}`,
        };
    }
  }
  if (CODE_FAILURES.has(fault.failureKind))
    return { fault, action: "code-failure", reason: "typed-code-failure" };
  if (fault.failureKind === "config")
    return { fault, action: "configuration-action", reason: "native-config" };
  if (fault.failureKind === "cancelled")
    return { fault, action: "cancelled", reason: "native-cancelled" };
  if (["transient", "rate_limited", "overloaded"].includes(fault.failureKind)) {
    return {
      fault,
      action: "native-recovery",
      reason: `native-${fault.failureKind}`,
    };
  }
  return { fault, action: "reconcile", reason: "native-effects-unreconciled" };
}

export function classifyNativeFaults({ runId, detail, outcomes } = {}) {
  const run = object(detail?.run) ? detail.run : detail;
  if (
    !text(runId) ||
    !object(run) ||
    run.id !== runId ||
    !RUN_STATUSES.has(run.status) ||
    !object(run.metadata) ||
    !Array.isArray(detail.events)
  ) {
    return result(runId, null, "reconcile", "native-evidence-unavailable");
  }
  const failClosed = (reason, faults = [], wait = null) =>
    result(runId, run.status, "reconcile", reason, faults, wait);
  const wait =
    run.metadata.wait === undefined ? null : readWait(run.metadata.wait);
  if (
    (run.metadata.wait !== undefined && wait === null) ||
    (wait !== null && run.status !== "paused")
  )
    return failClosed("native-wait-invalid");
  if (
    !object(outcomes) ||
    outcomes.run_id !== runId ||
    !Array.isArray(outcomes.nodes) ||
    !(outcomes.first_failed_node === null || text(outcomes.first_failed_node))
  ) {
    return failClosed("native-outcomes-invalid", [], wait);
  }
  const observations = inspectEvents(detail.events, runId);
  if (observations.reason) return failClosed(observations.reason, [], wait);
  const seen = new Set();
  const decisions = [];
  for (const node of outcomes.nodes) {
    if (
      !object(node) ||
      !text(node.node_id) ||
      !NODE_STATES.has(node.state) ||
      (node.loop_group_path !== undefined &&
        (!loopPath(node.loop_group_path) || node.loop_group_path.length === 0))
    ) {
      return failClosed(
        "native-outcomes-invalid",
        decisions.map((decision) => decision.fault),
        wait,
      );
    }
    const key = invocationKey(node.node_id, node.loop_group_path ?? []);
    if (seen.has(key)) return failClosed("native-outcomes-ambiguous", [], wait);
    seen.add(key);
    const event = observations.latest.get(key);
    const consumerStarted =
      node.state === "pending" && event?.event_type === "node_started";
    if (
      (event &&
        EVENT_STATES.get(event.event_type) !== node.state &&
        !consumerStarted) ||
      (!event && node.state !== "pending")
    )
      return failClosed("native-outcomes-stale", [], wait);
    if (node.state === "failed") decisions.push(faultFrom(event, node.node_id));
  }
  const faults = decisions.map((decision) => decision.fault);
  if (
    (faults.length === 0 && outcomes.first_failed_node !== null) ||
    (faults.length > 0 &&
      !faults.some((fault) => fault.nodeId === outcomes.first_failed_node))
  ) {
    return failClosed("native-outcomes-invalid", faults, wait);
  }
  const unlisted = [...observations.latest].filter(
    ([key, event]) => !seen.has(key) && event.event_type === "node_failed",
  );
  if (unlisted.length > 0)
    return failClosed(
      "native-outcomes-incomplete",
      [
        ...faults,
        ...unlisted.map(([, event]) => faultFrom(event, event.step_name).fault),
      ],
      wait,
    );
  if (run.status === "paused") {
    return wait === null
      ? failClosed("native-wait-unavailable", faults)
      : result(
          runId,
          run.status,
          "native-wait",
          "native-wait-persisted",
          faults,
          wait,
        );
  }
  if (run.status === "cancelled")
    return result(runId, run.status, "cancelled", "native-cancelled", faults);
  if (decisions.length > 0) {
    decisions.sort(
      (left, right) =>
        ACTION_PRIORITY.indexOf(left.action) -
        ACTION_PRIORITY.indexOf(right.action),
    );
    return result(
      runId,
      run.status,
      decisions[0].action,
      decisions[0].reason,
      faults,
    );
  }
  if (run.status === "failed" || run.status === "pending")
    return failClosed("native-run-unsettled");
  return result(runId, run.status, "none", "no-current-native-fault");
}

// A run's event record with `--verbose --events` grows with every role turn
// (807 KB after three on VM 100), so it needs more than the default CLI bound.
// Past this bound the read still fails closed.
export const RUN_DETAIL_LIMIT = 64 * 1024 * 1024;

export async function readNativeFaults({ archon, runId, outcomes } = {}) {
  if (!text(runId) || typeof archon?.raw !== "function")
    return classifyNativeFaults({ runId });
  try {
    const response = await archon.raw(
      ["workflow", "get", runId, "--json", "--verbose", "--events"],
      undefined,
      { maxOutput: RUN_DETAIL_LIMIT },
    );
    if (response?.code !== 0 || !object(response.json))
      return classifyNativeFaults({ runId });
    return classifyNativeFaults({ runId, detail: response.json, outcomes });
  } catch {
    return classifyNativeFaults({ runId });
  }
}

export function nativeFaultRequiresHold(report) {
  if (
    !object(report) ||
    report.schema !== SCHEMA ||
    !text(report.runId) ||
    !["running", "completed", "failed"].includes(report.runStatus) ||
    !text(report.reason) ||
    report.preserveOwnership !== false ||
    report.automaticRetry !== false ||
    report.wait !== null ||
    !Array.isArray(report.faults)
  )
    return true;
  if (report.action === "none")
    return report.faults.length !== 0 || report.runStatus === "failed";
  return (
    report.action !== "code-failure" ||
    report.faults.length === 0 ||
    report.faults.some(
      (fault) =>
        !object(fault) ||
        !text(fault.nodeId) ||
        !text(fault.eventId) ||
        !CODE_FAILURES.has(fault.failureKind) ||
        fault.providerClass !== null ||
        fault.resetAt !== null ||
        fault.retryAfterMs !== null,
    )
  );
}
