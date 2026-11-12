import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import {
  factoryEnvironment,
  type FactoryConfiguration,
} from "./factory-config";
import { argvText, runProcess, type ProcessRunner } from "./process";
import { scrub } from "../lib/contracts";
import {
  REFUSAL_MESSAGES,
  type ControlAction,
  type ControlOutcome,
} from "../lib/factory";

export type ControlRun = {
  exit: number | null;
  /** False when control.mjs never started, so nothing reached the factory. */
  started?: boolean;
  json: Record<string, unknown> | null;
  timedOut: boolean;
  overflow: boolean;
};

/** The mutation seam: every operator effect is one control.mjs invocation. */
export interface ControlRunner {
  run(args: readonly string[]): Promise<ControlRun>;
}

function lastJsonLine(stdout: string): Record<string, unknown> | null {
  const lines = stdout.trim().split(/\r?\n/).filter(Boolean);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try {
      const parsed = JSON.parse(lines[index]) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
        return parsed as Record<string, unknown>;
    } catch {}
  }
  return null;
}

/** `node control.mjs <args>` with an argv array, minimal env, bounded output. */
export function processControlRunner(
  config: FactoryConfiguration,
  run: ProcessRunner = runProcess,
): ControlRunner {
  return {
    async run(args) {
      const result = await run([config.node, config.controlScript, ...args], {
        env: factoryEnvironment(config),
        cwd: config.cwd,
        timeoutMs: config.controlTimeoutMs,
        maxOutput: 1_000_000,
      });
      return {
        exit: result.code,
        started: !result.spawnFailed,
        json:
          result.timedOut || result.overflow
            ? null
            : lastJsonLine(result.stdout),
        timedOut: result.timedOut,
        overflow: result.overflow,
      };
    },
  };
}

/** Exact control.mjs argv for one validated action. */
export function controlArgs(
  action: ControlAction,
  requestId: string,
  by: string,
  // Per-issue end states the scope already records, carried through a scope
  // write. control.mjs replaces the whole map, so leaving them out erases them.
  keptEndStates: Readonly<Record<string, string>> = {},
): string[] {
  const identity = ["--request", requestId, "--by", argvText(by, 80)];
  const reason =
    "reason" in action && action.reason && argvText(action.reason, 600)
      ? ["--reason", argvText(action.reason, 600)]
      : [];
  switch (action.kind) {
    case "factory":
      return ["factory", action.action, ...identity, ...reason];
    case "issue":
      return [
        "issue",
        String(action.issue),
        action.action,
        ...identity,
        ...reason,
      ];
    case "scope": {
      const note = action.note ? argvText(action.note, 600) : "";
      const kept = Object.entries(keptEndStates)
        .filter(
          ([issue, state]) =>
            action.issues.includes(Number(issue)) &&
            (state === "PR_READY" || state === "MERGED"),
        )
        .sort(([left], [right]) => Number(left) - Number(right))
        .map(([issue, state]) => `${issue}=${state}`)
        .join(",");
      return [
        "scope",
        "--issues",
        [...new Set(action.issues)].sort((a, b) => a - b).join(","),
        "--end-state",
        action.endState,
        "--owner",
        action.owner,
        ...identity,
        ...(note ? ["--note", note] : []),
        ...(kept ? ["--end-states", kept] : []),
      ];
    }
    case "prioritize":
      return [
        "prioritize",
        String(action.issue),
        String(action.priority),
        ...identity,
      ];
    case "cancel-run":
      return ["cancel-run", action.runId, ...identity];
    case "analyze":
      return [
        "analyze",
        "--scope",
        action.scope,
        "--trigger",
        "operator",
        "--request",
        requestId,
      ];
  }
}

export function askArgs(
  conversation: string,
  requestId: string,
  question: string,
) {
  return [
    "ask",
    "--conversation",
    conversation,
    "--request",
    requestId,
    "--question",
    argvText(question, 2000),
  ];
}

export type Interpretation = {
  outcome: ControlOutcome;
  message: string;
  code: string | null;
  revision: number | null;
  runId: string | null;
};

const UNKNOWN =
  "Its effect is unknown. Re-read the state; retrying reuses the same request id, which the pack treats as idempotent.";

function str(value: unknown, maximum = 600) {
  return typeof value === "string" ? scrub(value.slice(0, maximum)) : null;
}

// Pack refusal codes are lower-case words joined by hyphens. A refusal is
// raised before anything is written, so it is reported as refused whether or
// not the Console has its own sentence for it. "error" and system error codes
// are failures whose effect is not known.
const REFUSAL_CODE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

function refusal(
  base: Pick<Interpretation, "code" | "revision" | "runId">,
  code: string | null,
  json: Record<string, unknown>,
): Interpretation | null {
  if (!code || code === "error" || !REFUSAL_CODE.test(code)) return null;
  return {
    ...base,
    code,
    outcome: "refused",
    message:
      REFUSAL_MESSAGES[code] ??
      `The factory refused this control and changed nothing (${str(json.message, 400) ?? code}).`,
  };
}

const ENDED_RUNS = new Set(["completed", "cancelled"]);
const CONTAINER_ID = /^[a-f0-9]{6,64}$/;

function containerList(value: unknown) {
  if (!Array.isArray(value)) return null;
  return {
    count: value.length,
    shown: value
      .filter(
        (id): id is string => typeof id === "string" && CONTAINER_ID.test(id),
      )
      .slice(0, 20)
      .map((id) => id.slice(0, 12)),
  };
}

/**
 * What cancel-run found of the run's labelled executor containers. The docker
 * error itself is process output and never forwarded.
 */
function containerFacts(value: unknown) {
  if (!value || typeof value !== "object")
    return { text: null, remaining: undefined };
  const record = value as Record<string, unknown>;
  const removed = containerList(record.removed)?.count ?? 0;
  const remaining = containerList(record.remaining);
  const parts: string[] = [];
  if (removed)
    parts.push(
      `Removed ${removed} executor container${removed === 1 ? "" : "s"}.`,
    );
  if (remaining === null)
    parts.push(
      "The run's executor containers could not be listed, so whether any remain is unknown.",
    );
  else if (remaining.count)
    parts.push(
      `${remaining.count} executor container${remaining.count === 1 ? " remains" : "s remain"}${remaining.shown.length ? `: ${remaining.shown.join(", ")}` : ""}.`,
    );
  else parts.push("No executor containers remain.");
  return { text: parts.join(" "), remaining: remaining?.count ?? null };
}

/** cancel-run holds the run's issue first so the round is not requeued. */
function heldFact(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const { issue, ok, code } = value as Record<string, unknown>;
  if (typeof issue !== "number" || !Number.isSafeInteger(issue) || issue <= 0)
    return null;
  if (ok === true)
    return `Issue #${issue} is held, so the cancelled round is not started again. Native, identity and cleanup safety holds still apply.`;
  const reason = str(code, 80);
  return `Issue #${issue} was not held${reason ? ` (${reason})` : ""}; check its control before another round starts.`;
}

/**
 * cancel-run is ok only once the engine reports the run ended and no labelled
 * executor container remains; anything short of that says what is left.
 */
function cancelInterpretation(
  json: Record<string, unknown>,
  base: Pick<Interpretation, "code" | "revision" | "runId">,
  code: string | null,
): Interpretation {
  const status = Number.isInteger(json.status) ? (json.status as number) : null;
  const observed = str(json.observed, 40);
  const detail = str(json.detail, 300);
  const containers = containerFacts(json.containers);
  const facts = [containers.text, heldFact(json.held)]
    .filter(Boolean)
    .join(" ");
  const tail = facts ? ` ${facts}` : "";
  const ended = observed !== null && ENDED_RUNS.has(observed);
  const accepted = `The engine accepted cancellation (HTTP ${status ?? "?"}); the run is now ${observed ?? "not yet observed"}.${tail}`;
  if (json.ok)
    return ended
      ? {
          ...base,
          outcome: "applied",
          message: `The engine reports the run as ${observed}.${tail}`,
        }
      : { ...base, outcome: "requested", message: accepted };
  const refused = refusal(base, code, json);
  if (refused) return refused;
  if (status === null)
    return {
      ...base,
      code,
      outcome: "unknown",
      message: `${str(json.message, 400) ?? "The control failed"}. ${UNKNOWN}`,
    };
  if (status < 200 || status > 299)
    return {
      ...base,
      outcome: "refused",
      message: `The engine refused cancellation (HTTP ${status})${detail ? `: ${detail}` : ""}. The run is ${observed ?? "not observed"}.${tail}`,
    };
  if (!ended) return { ...base, outcome: "requested", message: accepted };
  const retry =
    " Retry with the same request id to list and remove them again.";
  if (containers.remaining === null)
    return {
      ...base,
      outcome: "unknown",
      message: `The engine reports the run as ${observed}.${tail}${retry}`,
    };
  if (containers.remaining)
    return {
      ...base,
      outcome: "incomplete",
      message: `The engine reports the run as ${observed}.${tail}${retry}`,
    };
  return {
    ...base,
    outcome: "unknown",
    message: `The engine reports the run as ${observed}, but the control did not confirm it. ${UNKNOWN}`,
  };
}

/** Map one control.mjs JSON result to a requested → observed receipt. */
export function interpret(
  kind: ControlAction["kind"] | "ask",
  run: ControlRun,
): Interpretation {
  const base = { code: null, revision: null, runId: null };
  if (run.timedOut)
    return {
      ...base,
      outcome: "unknown",
      message: `The control did not answer in time. ${UNKNOWN}`,
    };
  if (run.overflow)
    return {
      ...base,
      outcome: "unknown",
      message: `The control output exceeded the Console limit. ${UNKNOWN}`,
    };
  if (run.started === false)
    return {
      ...base,
      outcome: "failed",
      message:
        "The control runner could not be started. Nothing was sent to the factory.",
    };
  const json = run.json;
  if (!json || typeof json.ok !== "boolean")
    return {
      ...base,
      outcome: "unknown",
      message: `The control produced no readable result (exit ${run.exit ?? "none"}). ${UNKNOWN}`,
    };
  const code = str(json.code, 80);
  const revision = Number.isSafeInteger(json.revision)
    ? (json.revision as number)
    : null;
  const runId = str(json.runId, 200);
  if (kind === "cancel-run") return cancelInterpretation(json, base, code);
  if (kind === "ask" || kind === "analyze") {
    const outcome = str(json.outcome, 40);
    const receipt = str(json.receipt, 200);
    const status = Number.isInteger(json.status)
      ? (json.status as number)
      : null;
    if (json.ok)
      return {
        ...base,
        runId,
        outcome: "started",
        message: `The engine accepted the start${receipt ? ` (receipt ${receipt})` : ""}. The result is recorded when the run finishes.`,
      };
    if (outcome === "conflict")
      return {
        ...base,
        code: "conflict",
        outcome: "refused",
        message:
          "This request id was already used with different input. Nothing new was started.",
      };
    if (outcome === "unknown")
      return {
        ...base,
        outcome: "unknown",
        message: `The engine did not answer the start. ${UNKNOWN}`,
      };
    const refused = refusal(base, code, json);
    if (refused) return refused;
    if (outcome === "refused" || status !== null)
      return {
        ...base,
        outcome: "refused",
        message: `The engine refused the start (HTTP ${status ?? "?"})${str(json.detail, 300) ? `: ${str(json.detail, 300)}` : ""}.`,
      };
  }
  if (json.ok && json.noop)
    return {
      ...base,
      outcome: "already-applied",
      message:
        "Already applied: the target document already records this request id.",
    };
  if (json.ok)
    return {
      ...base,
      revision,
      outcome: "applied",
      message:
        revision !== null ? `Recorded at revision ${revision}.` : "Recorded.",
    };
  const refused = refusal(base, code, json);
  if (refused) return refused;
  return {
    ...base,
    code,
    outcome: "unknown",
    message: `${str(json.message, 400) ?? "The control failed"}. ${UNKNOWN}`,
  };
}

/**
 * The request id for applying one recorded Samson proposal. It is derived
 * from the conversation and turn only (no secret), so it stays stable across
 * Console password changes; it never passes the minted-id check, so the
 * browser cannot submit it to the controls endpoint.
 */
export function proposalId(conversation: string, message: string) {
  const digest = createHash("sha256")
    .update(["core-console/proposal/v1", conversation, message].join("\n"))
    .digest("hex");
  return `ap-${digest.slice(0, 24)}`;
}

const MINTED = /^(cr-[0-9a-z]{6,12}-[0-9a-f]{16})-([0-9a-f]{16})$/;

/**
 * Request ids are minted on the server per operator click and signed, so a
 * control is only executed with an id this Console issued. Retrying the same
 * action reuses the id; control.mjs treats a repeated id as idempotent.
 */
export function requestIds(secret: string) {
  const key = createHmac("sha256", secret)
    .update("core-console/request-id/v1")
    .digest();
  const sign = (body: string) =>
    createHmac("sha256", key).update(body).digest("hex").slice(0, 16);
  return {
    mint(now = Date.now()) {
      const body = `cr-${now.toString(36)}-${randomBytes(8).toString("hex")}`;
      return `${body}-${sign(body)}`;
    },
    verify(id: unknown): id is string {
      if (typeof id !== "string") return false;
      const match = MINTED.exec(id);
      if (!match) return false;
      const expected = Buffer.from(sign(match[1]));
      const supplied = Buffer.from(match[2]);
      return (
        expected.length === supplied.length &&
        timingSafeEqual(expected, supplied)
      );
    },
    /** Deterministic id for applying one recorded Samson proposal. */
    proposal: proposalId,
    /** Deterministic conversation id for a first message, stable on retry. */
    conversation(requestId: string) {
      return `op-${createHmac("sha256", key).update(`conversation\n${requestId}`).digest("hex").slice(0, 20)}`;
    },
  };
}
export type RequestIds = ReturnType<typeof requestIds>;
