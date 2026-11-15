// Record's decision: how one delivery round ended, as a pure function of the
// round ledger, the engine's node outcomes and the work item it settles, and
// settleRound, which performs the writes that decision implies.
import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { conditionalWrite } from "../../.shared/archon.mjs";
import {
  cleanupLabels,
  confirmedCleanup,
} from "../../.shared/cleanup-state.mjs";
import { nativeFaultRequiresHold } from "../../.shared/native-faults.mjs";
import { releaseInactiveReservations } from "../../.shared/reservations.mjs";
import {
  Refusal,
  TERMINAL,
  deliveryKey,
  factoryPermitsRound,
  issueDocument,
  planClaimRefusal,
  planCheckpoint,
  planFinish,
} from "../../.shared/workitem.mjs";
import { normalizeRepair } from "./repair-logic.mjs";

// One repair constructor: record reads every repair, I2 or legacy {kind,
// items}, through repair-logic.mjs, which also bounds it for the work item
// and names the producing stage when the repair names none.
export { normalizeRepair };

const STAGES = [
  "claim",
  "context",
  "after-scope",
  "after-define",
  "freeze",
  "seal",
  "after-assess",
  "after-adjudicate",
  "publish",
  "readiness",
];
const POLLING = new Set(["feedback", "deliver"]);
const NATIVE_HOLDS = new Set([
  "native-wait",
  "native-recovery",
  "owner-action",
  "configuration-action",
  "reconcile",
  "cancelled",
]);
const ITEMS = 64;
const STATE_DOCUMENT_LIMIT = 65_536;

const stateBytes = (value) => Buffer.byteLength(JSON.stringify(value), "utf8");

const sameEntry = (left, right) =>
  left.dev === right.dev && left.ino === right.ino;

function cleanupArtifactDirectory(directory) {
  const info = lstatSync(directory);
  if (
    !info.isDirectory() ||
    info.isSymbolicLink() ||
    path.relative(directory, realpathSync(directory)) !== ""
  )
    throw new Error(
      "Cleanup receipt requires real trusted artifact directories",
    );
  return info;
}

function readCleanupReceipt(reference, artifactsDir) {
  if (typeof artifactsDir !== "string" || !path.isAbsolute(artifactsDir))
    throw new Error("The trusted run artifact root is unavailable");
  const root = path.resolve(artifactsDir);
  const directory = path.join(root, "round");
  const expected = path.join(directory, "cleanup-state.json");
  if (path.resolve(reference.path) !== expected)
    throw new Error("Cleanup receipt is outside the trusted run artifact path");
  const rootInfo = cleanupArtifactDirectory(root);
  const directoryInfo = cleanupArtifactDirectory(directory);
  const info = lstatSync(expected);
  if (!info.isFile() || info.isSymbolicLink())
    throw new Error("Cleanup receipt must be a no-follow regular file");
  const descriptor = openSync(
    expected,
    constants.O_RDONLY |
      (constants.O_NOFOLLOW ?? 0) |
      (constants.O_NONBLOCK ?? 0),
  );
  try {
    const opened = fstatSync(descriptor);
    if (
      !opened.isFile() ||
      !sameEntry(info, opened) ||
      opened.size !== reference.bytes ||
      !sameEntry(rootInfo, cleanupArtifactDirectory(root)) ||
      !sameEntry(directoryInfo, cleanupArtifactDirectory(directory)) ||
      path.relative(expected, realpathSync(expected)) !== ""
    )
      throw new Error("Cleanup receipt no-follow identity or bytes changed");
    const content = readFileSync(descriptor);
    const after = lstatSync(expected);
    if (
      !after.isFile() ||
      after.isSymbolicLink() ||
      !sameEntry(opened, after) ||
      !sameEntry(rootInfo, cleanupArtifactDirectory(root)) ||
      !sameEntry(directoryInfo, cleanupArtifactDirectory(directory)) ||
      path.relative(expected, realpathSync(expected)) !== "" ||
      content.byteLength !== reference.bytes ||
      createHash("sha256").update(content).digest("hex") !== reference.sha256
    )
      throw new Error(
        "Cleanup receipt artifact identity, bytes or hash changed",
      );
    return content;
  } finally {
    closeSync(descriptor);
  }
}

function retainCleanupReceipt(cleanup, artifactsDir) {
  const content = JSON.stringify(cleanup.receipt, null, 2);
  const reference = {
    path: artifactsDir
      ? path.resolve(artifactsDir, "round", "cleanup-state.json")
      : null,
    sha256: createHash("sha256").update(content).digest("hex"),
    bytes: Buffer.byteLength(content, "utf8"),
    labels: structuredClone(cleanup.receipt?.labels ?? null),
  };
  try {
    if (!reference.path)
      throw new Error(
        "The run artifact directory is unavailable; recover the original freeze ledger",
      );
    mkdirSync(path.dirname(reference.path), { recursive: true, mode: 0o750 });
    try {
      writeFileSync(reference.path, content, { mode: 0o600, flag: "wx" });
    } catch (error) {
      if (
        error.code !== "EEXIST" ||
        !readCleanupReceipt(reference, artifactsDir).equals(
          Buffer.from(content, "utf8"),
        )
      )
        throw error;
    }
    return { reference };
  } catch (error) {
    return { reference, error: String(error?.message ?? error).slice(0, 200) };
  }
}

function sameCleanup(left, right) {
  // A matching digest alone does not prove a reference's path, length or labels.
  // Keep distinct representations until each passes trusted receipt validation
  // and independent cleanup reconciliation; only exact evidence repeats dedupe.
  return JSON.stringify(left) === JSON.stringify(right);
}

function retainRoundState({
  artifactsDir,
  runId,
  ledger,
  workItem,
  file = "repair-state.json",
  source,
}) {
  const stage =
    source ?? STAGES.find((name) => ledger[name]?.repair) ?? "readiness";
  const original = { run: runId, path: `round/${stage}.json` };
  if (!artifactsDir) return { artifact: original, snapshot: false };
  try {
    const content = JSON.stringify(
      { v: 1, run: runId, ledger, workItem },
      null,
      2,
    );
    const relative = `round/${file}`;
    const directory = path.join(artifactsDir, "round");
    mkdirSync(directory, { recursive: true, mode: 0o750 });
    writeFileSync(path.join(artifactsDir, relative), content, { mode: 0o600 });
    return {
      snapshot: true,
      artifact: {
        run: runId,
        path: relative,
        bytes: Buffer.byteLength(content, "utf8"),
        sha256: createHash("sha256").update(content).digest("hex"),
      },
    };
  } catch (error) {
    return {
      artifact: original,
      snapshot: false,
      error: String(error?.message ?? error).slice(0, 200),
    };
  }
}

function boundCheckpointState(value, brief) {
  if (stateBytes(value) > STATE_DOCUMENT_LIMIT) value.brief = brief;
  if (stateBytes(value) > STATE_DOCUMENT_LIMIT)
    value.history = value.history.slice(-1);
  for (const field of ["reviews", "final", "acceptance"])
    if (stateBytes(value) > STATE_DOCUMENT_LIMIT) value[field] = null;
  return stateBytes(value) <= STATE_DOCUMENT_LIMIT;
}

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const items = (value) =>
  Array.isArray(value)
    ? value
        .filter((item) => typeof item === "string" && item.trim())
        .map((item) => item.slice(0, 2000))
        .slice(0, ITEMS)
    : [];

// Ezra first when acceptance is wrong (Bezalel follows in the same round),
// Bezalel for implementation work, and a review-only round when the candidate
// itself is fine but must be reviewed again.
export function repairRoute(repair) {
  if (!repair) return null;
  if (repair.acceptance.length) return "oracle";
  if (repair.implementation.length) return "repair";
  if (repair.reviewOnly) return "review";
  return null;
}

function repairSummary(stage, repair, route) {
  if (route === "oracle")
    return `${stage}: ${repair.acceptance.length} repair item(s) for Ezra${repair.implementation.length ? ` and ${repair.implementation.length} for Bezalel` : ""}`;
  if (route === "repair")
    return `${stage}: ${repair.implementation.length} repair item(s) for Bezalel`;
  return `${stage}: the candidate must be reviewed again`;
}

function repairDecision(stage, entry) {
  const repair = normalizeRepair(entry.repair, stage);
  const route = repairRoute(repair);
  if (!route)
    return {
      outcome: "BLOCKED",
      blocker: {
        code: "empty-repair",
        detail: `${stage} asked for a repair that names nothing to do`,
        recovery: "Inspect the round's ledger, then retry",
      },
      summary: `${stage}: empty repair`,
    };
  const fingerprint =
    entry.fingerprint ??
    (stage === "readiness" && entry.reason
      ? `readiness:${String(entry.reason).slice(0, 200)}`
      : undefined);
  return {
    outcome: "continue",
    route,
    repair,
    summary: repairSummary(stage, repair, route),
    fingerprint,
  };
}

function parkedDecision(parked) {
  const areas = items(parked.areas);
  const holders = isRecord(parked.holders) ? parked.holders : {};
  if (!areas.length)
    return {
      outcome: "BLOCKED",
      blocker: {
        code: "invalid-parking",
        detail: "after-scope parked the round without naming an area",
      },
      summary: "Parked without areas",
    };
  const named = areas
    .map((area) => (holders[area] ? `${area} (#${holders[area]})` : area))
    .join(", ");
  return {
    outcome: "parked",
    parked: { areas, holders },
    summary: `Waiting for shared areas held by other issues: ${named}`,
  };
}

// I1: after a node failure, the next round's route follows the progress the
// round made. A frozen (or committed) candidate only needs its reviews again;
// defined acceptance goes to Bezalel, whose commit carries the tests Ezra
// recorded even when no commit holds them yet (freeze); earlier failures
// rerun the round.
function failureRoute(ledger, item, ran) {
  if (POLLING.has(ran)) return ran;
  if (ledger.freeze?.review === true) return "review";
  const run = item?.run;
  if (isRecord(run) && Object.hasOwn(run, "head") && item.head !== run.head)
    return "review";
  if (ran === "review") return "review";
  if (ledger["after-define"]?.acceptance) return "repair";
  return ran;
}

// I3: a merge readiness did not perform is a fact to record. Readiness names
// the merger; without that, a merge under a PR_READY assignment cannot have
// been the factory's, which merges only MERGED assignments.
const mergedOutside = (readiness, item) =>
  readiness.merged_by === "external" ||
  (readiness.merged_by !== "factory" &&
    item?.assignment?.endState !== "MERGED");

// Keep the union of every observed uncertain attempt across repeated records.
// Exact evidence repeats require one proof; distinct archive representations
// and conflicting evidence for the same labels are retained independently.
function mergeCleanupAttempts(entries) {
  const attempts = [];
  const visit = (entry) => {
    if (!entry) return;
    if (
      Array.isArray(entry.additionalCleanups) &&
      entry.additionalCleanups.every(isRecord)
    ) {
      // Flatten only structurally valid members. Retain a malformed list whole
      // so independent confirmation cannot mistake a partial set for complete.
      const { additionalCleanups, ...primary } = entry;
      visit(primary);
      for (const extra of additionalCleanups) visit(extra);
    } else if (!attempts.some((known) => sameCleanup(known, entry))) {
      attempts.push(entry);
    }
  };
  for (const entry of entries) visit(entry);
  if (attempts.length < 2) return attempts[0];
  const [primary, ...additional] = attempts;
  // Preserve malformed retained lists as evidence too; never normalize them
  // into a seemingly complete and confirmable attempt set.
  if (primary.additionalCleanups !== undefined) additional.unshift(primary);
  return { ...primary, additionalCleanups: additional };
}

function cleanupDecision(ledger, item) {
  const recordedConfirmed = confirmedCleanup(
    item?.cleanup,
    item?.cleanupReconciliation,
  );
  const incomingEntries = [
    ledger.freeze?.cleanup,
    ledger["executor-cleanup"]?.cleanup,
    ...Object.entries(ledger)
      .filter(([key]) => key.startsWith("mcp-cleanup-"))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value?.cleanup),
  ].filter(Boolean);
  const cleanup = mergeCleanupAttempts([
    ...(recordedConfirmed ? [] : [item?.cleanup]),
    ...incomingEntries,
  ]);
  if (
    !cleanup &&
    item?.blocker?.code !== "cleanup-unconfirmed" &&
    ledger.freeze?.blocked?.code !== "cleanup-unconfirmed" &&
    ledger["executor-cleanup"]?.blocked?.code !== "cleanup-unconfirmed"
  )
    return null;
  if (recordedConfirmed && sameCleanup(cleanup, item.cleanup)) return null;
  const ran = item?.run?.route ?? item?.route ?? "initial";
  const checkpointed =
    ledger.freeze?.review === true &&
    typeof ledger.freeze.candidate === "string" &&
    ledger.freeze.candidate.trim().length > 0 &&
    ledger.freeze.candidate === item?.head;
  const storedBlocker =
    item?.blocker?.code === "cleanup-unconfirmed" ? item.blocker : null;
  const route = storedBlocker
    ? storedBlocker.route
    : failureRoute(
        { ...ledger, freeze: { ...ledger.freeze, review: checkpointed } },
        item,
        ran,
      );
  return {
    outcome: "cleanup-unconfirmed",
    cleanup: cleanup ?? null,
    blocker: {
      code: "cleanup-unconfirmed",
      detail:
        "Owned executor cleanup is unconfirmed; retain the workspace, lease and reservations",
      recovery:
        storedBlocker?.recovery ??
        "Independently reconcile the exact receipt labels and confirm no owned workload before retry or workspace reuse",
      route,
    },
    summary:
      "Owned executor cleanup requires independent exact-label reconciliation",
  };
}

function planCleanupHold(
  document,
  { runId, assignment, decision, now, artifactsDir, ledger },
) {
  const held = planCheckpoint(document, { runId, fields: {}, now });
  if (held.value.assignment.id !== assignment)
    throw new Refusal("assignment-changed");
  held.value.cleanup = structuredClone(decision.cleanup);
  if (
    JSON.stringify(document.value.cleanup) !== JSON.stringify(decision.cleanup)
  )
    held.value.cleanupReconciliation = null;
  held.value.blocker = { ...decision.blocker, at: now };
  if (
    stateBytes(held.value) > STATE_DOCUMENT_LIMIT &&
    held.value.cleanup?.receipt
  ) {
    const retained = retainCleanupReceipt(held.value.cleanup, artifactsDir);
    const identity = { ...held.value.cleanup };
    delete identity.receipt;
    // An entry that already carries a reference is malformed: keep that
    // reference and mark the conflict so archival can never make it confirmable.
    held.value.cleanup = Object.hasOwn(identity, "receiptReference")
      ? { ...identity, receiptConflict: retained.reference }
      : { ...identity, receiptReference: retained.reference };
    if (retained.error)
      held.value.blocker.recovery += ` Receipt archival failed: ${retained.error}`;
  }
  if (stateBytes(held.value) > STATE_DOCUMENT_LIMIT) {
    const retained = retainRoundState({
      artifactsDir,
      runId,
      ledger,
      workItem: held.value,
      file: "cleanup-item-state.json",
      source: "freeze",
    });
    held.value.cleanupStateArtifact = retained.artifact;
    if (held.value.cleanup?.additionalCleanups) {
      delete held.value.cleanup.additionalCleanups;
      held.value.cleanup.additionalCleanupArtifact = retained.artifact;
      held.value.blocker.recovery +=
        " Restore all archived MCP attempts before confirming cleanup; compact batch evidence cannot authorize reuse.";
    }
    if (retained.error)
      held.value.blocker.recovery += ` State archival failed: ${retained.error}`;
    if (!boundCheckpointState(held.value, null))
      throw new Refusal(
        "cleanup-state-still-oversized",
        "Restore the original round ledger before retrying",
      );
  }
  return { ...held, outcome: "cleanup-unconfirmed" };
}

function publicationFault(report) {
  return (
    report?.action === "code-failure" &&
    Array.isArray(report.faults) &&
    report.faults.some((fault) =>
      ["publish", "readiness"].includes(fault?.nodeId),
    )
  );
}

// What the operator reads next to a native hold: who clears it, and with
// which control. The control itself checks identity, effects and the run.
function nativeRecoveryAdvice(fault) {
  const command =
    "issue <n> recover-native; retry, reopen and release cannot clear it";
  if (fault.reason === "native-publication-effects-unreconciled")
    return `The run may have published or merged before it failed. The control does the external readback of the issue's branch and pull request on GitHub: it refuses while a merge the factory requested is unsettled, and a branch head the factory did not publish sends the issue to the feedback stage, which reads the pull request first. Run ${command}`;
  if (fault.action === "native-recovery")
    return `The intake pass clears this hold by itself, after any reset the provider reported. To stop waiting, run ${command}`;
  return `Deal with the cause (sign-in, budget, configuration or an unclear result), then run ${command}`;
}

function nativeDecision(nativeFaults, item) {
  const stored = item?.nativeFaults;
  const storedHold =
    Object.hasOwn(item ?? {}, "nativeFaults") &&
    (nativeFaultRequiresHold(stored) ||
      stored?.runId !== item?.run?.id ||
      publicationFault(stored));
  // The engine wakes a run it paused for a usage limit, and that run can meet
  // another fault before it ends: the limit again, with a later reset, or a
  // sign-in that expired meanwhile. A newer report of the same run that still
  // requires a hold replaces a stored hold the intake pass would clear by
  // itself, so the pass waits for the right reset or leaves it to a person. A
  // publish or readiness step that failed counts too: it is held for a person
  // below, and the stored usage-limit hold must not hide it. A clean report
  // never clears a hold, a hold that waits for a person is never replaced, and
  // the engine's own pause (`native-wait`) is not taken: nothing would clear
  // it.
  const newer =
    storedHold &&
    stored?.action === "native-recovery" &&
    typeof item?.run?.id === "string" &&
    stored.runId === item.run.id &&
    nativeFaults?.runId === item.run.id &&
    nativeFaults.action !== "native-wait" &&
    (nativeFaultRequiresHold(nativeFaults) || publicationFault(nativeFaults));
  let fault = storedHold && !newer ? stored : nativeFaults;
  if (!storedHold && fault === undefined) return null;
  const sameRun =
    typeof item?.run?.id === "string" && fault?.runId === item.run.id;
  if (sameRun && !nativeFaultRequiresHold(fault)) {
    if (!publicationFault(fault)) return null;
    fault = {
      ...fault,
      action: "reconcile",
      reason: "native-publication-effects-unreconciled",
      faults: fault.faults.map((entry, index) =>
        index === 0 ? { ...entry, evidence: fault } : entry,
      ),
      preserveOwnership: true,
    };
  }
  if (
    fault?.schema !== "core-native-faults/v1" ||
    !sameRun ||
    fault.automaticRetry !== false ||
    !NATIVE_HOLDS.has(fault.action)
  )
    fault = {
      schema: "core-native-faults/v1",
      runId: item?.run?.id ?? null,
      runStatus: sameRun ? (fault?.runStatus ?? null) : null,
      action: "configuration-action",
      reason:
        "Native fault evidence does not prove a valid same-run classification safe to continue",
      automaticRetry: false,
      preserveOwnership: true,
      faults: [{ evidence: fault }],
      wait: null,
    };
  const action = NATIVE_HOLDS.has(fault?.action)
    ? fault.action
    : "configuration-action";
  return {
    outcome: action,
    nativePending: true,
    nativeFaults: fault,
    blocker: {
      code: action,
      detail: String(
        fault?.detail ?? fault?.reason ?? `Native execution requires ${action}`,
      ).slice(0, 1200),
      recovery: String(fault?.recovery ?? nativeRecoveryAdvice(fault)).slice(
        0,
        600,
      ),
      route: item?.run?.route ?? item?.route ?? "initial",
    },
  };
}

function capacityDecision(ledger, item) {
  const capacity = ledger["executor-capacity"]?.blocked;
  if (!["check-capacity", "check-cancelled"].includes(capacity?.code))
    return null;
  return {
    outcome: "BLOCKED",
    blocker: {
      ...capacity,
      route: item?.run?.route ?? item?.route ?? "initial",
    },
    summary: capacity.detail ?? capacity.code,
  };
}

function planNativeHold(
  document,
  { runId, assignment, decision, now, artifactsDir, ledger },
) {
  const held = planCheckpoint(document, { runId, fields: {}, now });
  if (held.value.assignment.id !== assignment)
    throw new Refusal("assignment-changed");
  held.value.nativeFaults = structuredClone(decision.nativeFaults);
  held.value.blocker = { ...decision.blocker, at: now };
  if (stateBytes(held.value) > STATE_DOCUMENT_LIMIT) {
    const retained = retainRoundState({
      artifactsDir,
      runId,
      ledger,
      workItem: held.value,
      file: "native-fault-state.json",
      source: "native-faults",
    });
    held.value.nativeFaults = {
      schema: "core-native-faults/v1",
      runId,
      runStatus: decision.nativeFaults.runStatus,
      action: decision.outcome,
      reason: decision.blocker.detail,
      faults: [],
      wait: null,
      automaticRetry: false,
      preserveOwnership: true,
      artifact: retained.artifact,
    };
    if (!retained.snapshot)
      held.value.blocker.recovery += ` State archival failed: ${retained.error ?? "Run artifact directory unavailable"}`;
    if (!boundCheckpointState(held.value, null))
      throw new Refusal("native-state-still-oversized");
  }
  return { ...held, outcome: decision.outcome };
}

function boundCleanupEvidence(
  planned,
  document,
  { runId, assignment, decision, now, artifactsDir, ledger },
) {
  if (stateBytes(planned.value) <= STATE_DOCUMENT_LIMIT) return planned;
  const reconciliation = planned.value.cleanupReconciliation;
  const retained = retainRoundState({
    artifactsDir,
    runId,
    ledger,
    workItem: planned.value,
    file: "cleanup-reconciliation-state.json",
    source: ledger.freeze?.cleanup ? "freeze" : "executor-cleanup",
  });
  const reference = `run ${retained.artifact.run}, ${retained.artifact.path}`;
  const error = {
    name: "CleanupEvidenceTooLarge",
    message: `Independent cleanup evidence exceeds the state budget; inspect ${reference}.${retained.snapshot ? "" : ` Evidence archival failed: ${retained.error ?? "Run artifact directory unavailable"}`}`,
  };
  const compact =
    reconciliation.confirmed && retained.snapshot
      ? {
          confirmed: true,
          at: reconciliation.at,
          evidence: Object.fromEntries(
            [
              "ok",
              "cleanupConfirmed",
              "reusable",
              "labels",
              "remaining",
              "receiptSha256",
              "additional",
            ]
              .filter((key) => Object.hasOwn(reconciliation.evidence, key))
              .map((key) => [key, reconciliation.evidence[key]]),
          ),
        }
      : {
          confirmed: false,
          at: reconciliation.at,
          evidence: { ok: false, error },
        };
  if (!retained.snapshot) {
    planned = planCleanupHold(document, {
      runId,
      assignment,
      decision,
      now,
      artifactsDir,
      ledger,
    });
    planned.value.blocker.recovery += ` Evidence archival failed: ${retained.error ?? "Run artifact directory unavailable"}`;
  }
  planned.value.cleanupStateArtifact = retained.artifact;
  planned.value.cleanupReconciliation = compact;
  if (!boundCheckpointState(planned.value, null))
    throw new Refusal("cleanup-state-still-oversized");
  return planned;
}

async function dispatchSuccessor(archon, finished, fire) {
  const value = finished.plan.value;
  const revision = finished.receipt?.revision ?? finished.plan.ifRevision + 1;
  let next = "";
  let successor = null;
  if (finished.plan.outcome === "continue" && value.control === "run") {
    const factory = (await archon.get("core/factory")).value;
    if (factoryPermitsRound(factory).ok) {
      successor = await fire({ value, revision }).catch((error) => ({
        ok: false,
        outcome: "error",
        detail: String(error?.message ?? error),
        deliveryId: deliveryKey(value, revision),
      }));
      next = successor.ok
        ? `${value.route} (${successor.deliveryId} accepted)`
        : `${value.route} (${successor.deliveryId} ${successor.outcome}; the intake sweep will start it)`;
    }
  }
  return { next, successor };
}

async function settleCleanup({
  archon,
  name,
  runId,
  assignment,
  issue,
  ledger,
  now,
  limits,
  fire,
  reconcileCleanup,
  artifactsDir,
  nativeFaults,
}) {
  const pending = (reason, outcome = "cleanup-unconfirmed") => ({
    outcome,
    next: "",
    reason,
    reservations: "kept",
    cleanupPending: true,
  });
  try {
    const held = await conditionalWrite(archon, name, (document) => {
      const decision = cleanupDecision(ledger, document.value);
      if (!decision) throw new Refusal("cleanup-changed");
      return planCleanupHold(document, {
        runId,
        assignment,
        decision,
        now,
        artifactsDir,
        ledger,
      });
    });
    if (!held.written)
      return pending(
        "Could not persist cleanup evidence after repeated conflicts",
        "unrecorded",
      );
    if (!reconcileCleanup)
      return pending(
        "Owned executor cleanup requires independent exact-label reconciliation",
      );
    const cleanup = held.plan.value.cleanup;
    let evidence;
    try {
      const reconcileOne = async (entry) => {
        const labels = cleanupLabels(entry);
        if (!labels || entry.additionalCleanupArtifact)
          throw new Error(
            "Cleanup evidence does not identify every exact executor attempt",
          );
        if (entry.receiptReference) {
          const content = readCleanupReceipt(
            entry.receiptReference,
            artifactsDir,
          );
          const receipt = JSON.parse(content.toString("utf8"));
          if (
            !isRecord(receipt?.labels) ||
            Object.keys(receipt.labels).length !== Object.keys(labels).length ||
            !Object.entries(labels).every(
              ([key, value]) => receipt.labels[key] === value,
            )
          )
            throw new Error(
              "Cleanup receipt artifact labels do not match the retained reference",
            );
        }
        if (
          entry.runId !== runId ||
          entry.assignment !== assignment ||
          entry.issue !== issue
        )
          throw new Error(
            "Cleanup attempt identity differs from the retained round",
          );
        const attemptCleanup = { ...entry };
        delete attemptCleanup.additionalCleanups;
        const proof = await reconcileCleanup({
          cleanup: structuredClone(attemptCleanup),
          labels: structuredClone(labels),
          runId,
          assignment,
          issue,
        });
        if (entry.additionalCleanups !== undefined) {
          if (!Array.isArray(entry.additionalCleanups))
            throw new Error("Invalid cleanup attempt list");
          const additional = [];
          for (const extra of entry.additionalCleanups)
            additional.push({
              confirmed: true,
              evidence: await reconcileOne(extra),
            });
          return { ...proof, additional };
        }
        return proof;
      };
      evidence = await reconcileOne(cleanup);
    } catch (error) {
      evidence = {
        error: {
          name: error?.name ?? "Error",
          message: String(error?.message ?? error).slice(0, 600),
        },
      };
    }
    const reconciliation = {
      confirmed: true,
      at: now,
      evidence: evidence ?? null,
    };
    reconciliation.confirmed =
      cleanup?.runId === runId &&
      cleanup.assignment === assignment &&
      cleanup.issue === issue &&
      confirmedCleanup(cleanup, reconciliation);
    const finished = await conditionalWrite(archon, name, (document) => {
      if (JSON.stringify(document.value?.cleanup) !== JSON.stringify(cleanup))
        throw new Refusal("cleanup-changed");
      const decision = cleanupDecision(ledger, document.value);
      const boundary = reconciliation.confirmed
        ? (nativeDecision(nativeFaults, document.value) ??
          capacityDecision(ledger, document.value))
        : null;
      const planned = !reconciliation.confirmed
        ? planCleanupHold(document, {
            runId,
            assignment,
            decision,
            now,
            artifactsDir,
            ledger,
          })
        : boundary?.nativePending
          ? planNativeHold(document, {
              runId,
              assignment,
              decision: boundary,
              now,
              artifactsDir,
              ledger,
            })
          : planFinish(document, {
              runId,
              now,
              outcome: boundary?.outcome ?? "continue",
              route: boundary ? null : decision.blocker.route,
              blocker: boundary?.blocker,
              summary:
                boundary?.summary ??
                "Owned executor cleanup independently confirmed",
              limits,
            });
      if (planned.value.assignment.id !== assignment)
        throw new Refusal("assignment-changed");
      planned.value.cleanupReconciliation = reconciliation;
      return boundCleanupEvidence(planned, document, {
        runId,
        assignment,
        decision,
        now,
        artifactsDir,
        ledger,
      });
    });
    if (!finished.written)
      return pending(
        "Cleanup reconciliation could not be persisted after repeated conflicts",
        "unrecorded",
      );
    if (
      !confirmedCleanup(
        finished.plan.value.cleanup,
        finished.plan.value.cleanupReconciliation,
      )
    )
      return pending(
        "Exact-label reconciliation did not confirm cleanup; retain ownership",
      );
    if (NATIVE_HOLDS.has(finished.plan.outcome))
      return {
        outcome: finished.plan.outcome,
        next: "",
        reason: "Cleanup confirmed; native execution still requires recovery",
        reservations: "kept",
        cleanupPending: false,
        nativePending: true,
      };
    const reservations = TERMINAL.has(finished.plan.outcome)
      ? await releaseReservations(archon, issue)
      : "kept";
    return {
      outcome: finished.plan.outcome,
      ...(await dispatchSuccessor(archon, finished, fire)),
      reason: "Owned executor cleanup independently confirmed",
      reservations,
      cleanupPending: false,
    };
  } catch (error) {
    if (!(error instanceof Refusal)) throw error;
    return pending(`Cleanup hold refused: ${error.message}`, "unrecorded");
  }
}

export function decideRound({ ledger, nodes = [], item, nativeFaults }) {
  const cleanup = cleanupDecision(ledger, item);
  if (cleanup) return cleanup;
  const ran = item?.run?.route ?? item?.route ?? "initial";
  const native = nativeDecision(nativeFaults, item);
  if (native) return native;
  const capacity = capacityDecision(ledger, item);
  if (capacity) return capacity;
  const context = ledger.context;
  if (context && context.ok === false) {
    if (context.control === "hold")
      return {
        outcome: "held",
        summary: "Operator hold took effect at the round boundary",
      };
    // lease-control#6: a factory stop pauses the lineage; factory resume restarts it.
    if (context.control === "factory-stop")
      return {
        outcome: "held",
        summary:
          "Factory stop took effect at the round boundary; factory resume restarts the round",
      };
    if (context.control === "stop")
      return { outcome: "stopped", summary: "Operator stop took effect" };
    if (context.code === "github-auth")
      return {
        outcome: "BLOCKED",
        blocker: {
          code: "github-auth",
          detail: "The factory's GitHub sign-in is missing or invalid",
          recovery: "Sign the factory's gh profile in again, then retry",
        },
        summary: "GitHub sign-in needed",
      };
  }
  if (ledger.claim && ledger.claim.proceed === false)
    return {
      outcome: "continue",
      route: ran,
      summary: `Workspace preparation failed: ${ledger.claim.reason}`,
      fingerprint: `claim:${ledger.claim.code}`,
    };
  const failed = nodes.filter(
    (node) => node.state === "failed" && node.node_id !== "record",
  );
  if (failed.length) {
    const first = failed[0];
    return {
      outcome: "continue",
      route: failureRoute(ledger, item, ran),
      summary: `Node ${first.node_id} failed: ${String(first.error ?? "").slice(0, 600)}`,
      fingerprint: `failed:${first.node_id}`,
    };
  }
  for (const stage of STAGES) {
    const entry = ledger[stage];
    if (!isRecord(entry)) continue;
    if (entry.blocked)
      return {
        outcome: "BLOCKED",
        blocker: entry.blocked,
        summary: `${stage}: ${entry.blocked.detail ?? entry.blocked.code}`,
      };
    if (entry.parked) return parkedDecision(entry.parked);
    if (entry.repair) return repairDecision(stage, entry);
  }
  const readiness = ledger.readiness;
  if (readiness) {
    if (readiness.verdict === "MERGED")
      return {
        outcome: "MERGED",
        external: mergedOutside(readiness, item),
        summary: readiness.reason,
      };
    if (readiness.verdict === "PR_READY")
      return { outcome: "PR_READY", summary: readiness.reason };
    if (readiness.verdict === "WAIT")
      return {
        outcome: "continue",
        route: "feedback",
        summary: readiness.reason,
      };
    if (readiness.verdict === "REPAIR")
      return repairDecision("readiness", {
        ...readiness,
        repair: {
          kind: "implementation",
          items: readiness.repairs?.length
            ? readiness.repairs
            : [readiness.reason],
        },
      });
    return {
      outcome: "BLOCKED",
      blocker: { code: "readiness", detail: readiness.reason },
      summary: readiness.reason,
    };
  }
  if (ledger.publish?.published)
    return {
      outcome: "continue",
      route: "feedback",
      summary: `Published PR #${ledger.publish.pr}`,
    };
  return {
    outcome: "BLOCKED",
    blocker: {
      code: "undecided",
      detail: "The round ended without a recorded decision",
      recovery: "Inspect the run's node outcomes",
    },
    summary: "Round ended without a decision",
  };
}

async function releaseReservations(archon, issue) {
  try {
    const released = await releaseInactiveReservations(archon, {
      issues: [issue],
    });
    return released.written ? "released" : released.noop ? "none" : "conflict";
  } catch {
    return "failed";
  }
}

// Settles one round. A round that never took the lease marks the idle item
// (I6) so its next dispatch key differs. Otherwise one finish write releases
// the lease; terminal cleanup releases only freshly confirmed inactive,
// unleased holders, including after a refused finish;
// a continuing round fires its successor keyed by the revision it wrote.
export async function settleRound({
  archon,
  issue,
  runId,
  assignment,
  ledger,
  nodes = [],
  now,
  limits,
  fire,
  artifactsDir = process.env.ARTIFACTS_DIR,
  reconcileCleanup,
  nativeFaults,
}) {
  const name = issueDocument(issue);
  const observed = await archon.get(name);
  const cleanup = cleanupDecision(ledger, observed.value);
  if (cleanup)
    return settleCleanup({
      archon,
      name,
      runId,
      assignment,
      issue,
      ledger,
      now,
      limits,
      fire,
      reconcileCleanup,
      artifactsDir,
      nativeFaults,
    });
  const settleClaimRefusal = async () => {
    const code = ledger.claim?.code ?? "claim-failed";
    const reason =
      ledger.claim?.reason ?? "The round did not take the issue lease";
    let marked = null;
    try {
      marked = await conditionalWrite(archon, name, (document) =>
        planClaimRefusal(document, {
          runId,
          assignmentId: assignment,
          code,
          detail: reason,
          now,
        }),
      );
    } catch (error) {
      if (!(error instanceof Refusal)) throw error;
    }
    const reservations =
      marked?.written && TERMINAL.has(marked.plan.value.status)
        ? await releaseReservations(archon, issue)
        : "kept";
    return {
      outcome: "not-claimed",
      next: "",
      reason,
      marked: marked?.written === true,
      reservations,
    };
  };
  if (
    !ledger["claim-lease"]?.taken &&
    !observed.value?.run?.id &&
    !Object.hasOwn(observed.value ?? {}, "nativeFaults") &&
    (nativeFaults === undefined ||
      (nativeFaults?.runId === runId && !nativeFaultRequiresHold(nativeFaults)))
  ) {
    return settleClaimRefusal();
  }
  const native = decideRound({
    ledger,
    nodes,
    item: observed.value,
    nativeFaults,
  });
  if (native.nativePending) {
    try {
      const held = await conditionalWrite(archon, name, (document) => {
        const decision = decideRound({
          ledger,
          nodes,
          item: document.value,
          nativeFaults,
        });
        if (!decision.nativePending) throw new Refusal("native-hold-changed");
        return planNativeHold(document, {
          runId,
          assignment,
          decision,
          now,
          artifactsDir,
          ledger,
        });
      });
      return {
        outcome: held.written ? held.plan.outcome : "unrecorded",
        next: "",
        reason: native.blocker.detail,
        reservations: "kept",
        nativePending: true,
      };
    } catch (error) {
      if (!(error instanceof Refusal)) throw error;
      return {
        outcome: "unrecorded",
        next: "",
        reason: `Native hold refused: ${error.message}`,
        reservations: "kept",
        nativePending: true,
      };
    }
  }

  if (!ledger["claim-lease"]?.taken) return settleClaimRefusal();

  let decision = null;
  let finished = null;
  let refusal = null;
  try {
    finished = await conditionalWrite(archon, name, (document) => {
      decision = decideRound({
        ledger,
        nodes,
        item: document.value,
        nativeFaults,
      });
      if (decision.outcome === "cleanup-unconfirmed")
        return planCleanupHold(document, {
          runId,
          assignment,
          decision,
          now,
          artifactsDir,
          ledger,
        });
      if (decision.nativePending)
        return planNativeHold(document, {
          runId,
          assignment,
          decision,
          now,
          artifactsDir,
          ledger,
        });
      const route =
        decision.outcome === "continue"
          ? (decision.route ?? document.value?.run?.route ?? "initial")
          : null;
      const brief =
        decision.repair !== undefined
          ? { ...(document.value?.brief ?? {}), repair: decision.repair }
          : undefined;
      const finish = {
        runId,
        now,
        outcome: decision.outcome,
        route,
        brief,
        blocker: decision.blocker,
        summary: decision.summary,
        fingerprint: decision.fingerprint,
        external: decision.external === true,
        parked: decision.parked,
        limits,
      };
      const planned = planFinish(document, finish);
      const bytes = stateBytes(planned.value);
      if (!decision.repair || bytes <= STATE_DOCUMENT_LIMIT) return planned;
      const retained = retainRoundState({
        artifactsDir,
        runId,
        ledger,
        workItem: planned.value,
      });
      const reference = `run ${retained.artifact.run}, ${retained.artifact.path}`;
      decision = {
        outcome: "BLOCKED",
        blocker: {
          code: "repair-state-limit",
          detail: `Repair state is ${bytes} UTF-8 bytes; Archon allows ${STATE_DOCUMENT_LIMIT}. Complete corrections are retained in ${reference}.`,
          recovery: `Read ${reference}; restore a safely sized brief or complete every required correction before retrying.${retained.error ? ` Snapshot write failed: ${retained.error}` : ""}`,
          route,
        },
        summary: `Repair exceeds the state-document limit; inspect ${reference}`,
      };
      const boundedBrief = {
        ...(document.value?.brief ?? {}),
        repair: null,
        repairArtifact: retained.artifact,
      };
      const blocked = planFinish(document, {
        ...finish,
        ...decision,
        brief: boundedBrief,
      });
      if (
        !boundCheckpointState(blocked.value, {
          repair: null,
          repairArtifact: retained.artifact,
        })
      )
        throw new Refusal(
          "repair-state-still-oversized",
          "Restore the retained round artifact before retrying",
        );
      return blocked;
    });
  } catch (error) {
    if (!(error instanceof Refusal)) throw error;
    refusal = error;
  }
  const written = finished?.written === true;
  const outcome = written ? finished.plan.outcome : decision?.outcome;
  if (outcome === "cleanup-unconfirmed")
    return {
      outcome: written ? outcome : "unrecorded",
      next: "",
      reason: decision.summary,
      reservations: "kept",
      cleanupPending: true,
    };
  if (decision?.nativePending)
    return {
      outcome: written ? outcome : "unrecorded",
      next: "",
      reason: decision.blocker.detail,
      reservations: "kept",
      nativePending: true,
    };
  let reservations = "kept";
  if (TERMINAL.has(outcome))
    reservations = await releaseReservations(archon, issue);
  if (refusal)
    return {
      outcome: "unrecorded",
      next: "",
      reason: `Finish refused: ${refusal.message}`,
      reservations,
    };
  if (!written)
    return {
      outcome: "unrecorded",
      next: "",
      reason:
        "Could not record the round after repeated conflicts; reconcile the work item",
      reservations,
    };

  return {
    outcome: finished.plan.outcome,
    ...(await dispatchSuccessor(archon, finished, fire)),
    reason: decision.summary,
    reservations,
  };
}
