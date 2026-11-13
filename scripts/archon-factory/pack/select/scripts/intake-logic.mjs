// The selector's intake decisions, separate from the scripts that observe
// GitHub and Archon: admission gates, admit's final checks and the sweep that
// restarts or reconciles admitted work items.
import { createHash } from "node:crypto";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

import { conditionalWrite } from "../../.shared/archon.mjs";
import { hasUnconfirmedCleanup } from "../../.shared/cleanup-state.mjs";
import { issuePaths } from "../../.shared/git.mjs";
import { FACTORY_MARKER } from "../../.shared/readiness.mjs";
import { releaseInactiveReservations } from "../../.shared/reservations.mjs";
import {
  Refusal,
  TERMINAL,
  factoryPermitsIntake,
  factoryPermitsRound,
  hasNativeFaultHold,
  heldElsewhere,
  planObservedMerge,
  planReconcile,
  planSweep,
} from "../../.shared/workitem.mjs";

// The authorization a scope carries; priorities and request receipts are not
// part of it.
export function scopeDigest(scope) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        issues: [...scope.issues].sort((a, b) => a - b),
        endState: scope.endState,
        endStates: scope.endStates ?? {},
        owner: scope.owner,
        approvedAt: scope.approvedAt,
      }),
    )
    .digest("hex");
}

const knownAreas = (item) => [
  ...(item?.areas ?? []),
  ...(Array.isArray(item?.brief?.shared_areas) ? item.brief.shared_areas : []),
  ...(item?.parked?.areas ?? []),
];

// The four admission gates of one issue, as the selector observed it.
// lease-control#8: any existing work item, finished or not, owns its issue;
// admit never re-assigns it (the operator's retry or reopen does).
// lease-control#7: an area this issue is known to touch and another issue
// reserves keeps it out until released.
// Closed intake, a GitHub issue that is not open and an operator hold or stop
// are conflicts. What the observer could not read is "unavailable", never
// "clear".
export function admissionGates({
  issue,
  existing,
  foreignPr,
  capacity,
  reservations,
  areas = knownAreas(existing),
  intakeOpen = true,
  issueOpen = true,
  ownersKnown = true,
  resourcesKnown = true,
}) {
  return {
    hold:
      !intakeOpen ||
      !issueOpen ||
      existing?.control === "hold" ||
      existing?.control === "stop"
        ? "conflict"
        : "clear",
    owner: !ownersKnown
      ? "unavailable"
      : existing || foreignPr
        ? "conflict"
        : "clear",
    sharedArea: !resourcesKnown
      ? "unavailable"
      : heldElsewhere(areas, reservations, issue).length
        ? "conflict"
        : "clear",
    resources: !resourcesKnown
      ? "unavailable"
      : capacity > 0
        ? "clear"
        : "conflict",
  };
}

// Checked by admit immediately before it writes the assignment: the factory
// still admits work, the scope is still the one facts evaluated (I7), it
// still authorizes the chosen issue, and the issue still has no work item.
export function admissionCheck({ factory, scope, recorded, issue, existing }) {
  const intake = factoryPermitsIntake(factory);
  if (!intake.ok)
    return {
      ok: false,
      code: intake.code,
      reason: `Intake closed before admission: ${intake.code}`,
    };
  const value = scope?.value;
  if (!value || value.v !== 1 || !Array.isArray(value.issues))
    return { ok: false, code: "no-scope", reason: "No authorized scope" };
  if (
    scopeDigest(value) !== recorded.scopeRevision ||
    (Number.isSafeInteger(recorded.scopeDocumentRevision) &&
      scope.revision !== recorded.scopeDocumentRevision)
  )
    return {
      ok: false,
      code: "scope-changed",
      reason:
        "The authorized scope changed since eligibility was computed; the next pass re-evaluates it",
    };
  if (!value.issues.includes(issue))
    return {
      ok: false,
      code: "not-in-scope",
      reason: `#${issue} is no longer in the authorized scope`,
    };
  if (existing && !TERMINAL.has(existing.status))
    return {
      ok: false,
      code: "live-assignment",
      reason: `#${issue} already has a live assignment`,
    };
  if (existing)
    return {
      ok: false,
      code: "finished-assignment",
      reason: `#${issue} has a finished assignment (${existing.status}); an operator must retry or reopen it`,
    };
  return {
    ok: true,
    endState:
      (value.endStates?.[issue] ?? value.endState) === "MERGED"
        ? "MERGED"
        : "PR_READY",
  };
}

// Tell the owner, on the issue itself, when the factory stops on it. One
// comment per blocker: the blocker's time is the key, so a retry that blocks
// again is announced again and nothing is repeated. Blockers older than a day
// are left alone, and a GitHub failure never fails the pass.
const DAY_MS = 86_400_000;
const publicText = (text, size) =>
  String(text ?? "")
    .replace(/\/srv\/core-factory\/[^\s`'")]*/g, "(factory path)")
    .replace(/(^|[^`\w])@([A-Za-z0-9][A-Za-z0-9-]*(?:\[bot\])?)/g, "$1`@$2`")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, size);

// The notice is looked for on the issue itself, so a blocker is checked on
// every pass until it is a week old: long enough to outlast an outage of the
// timer or of GitHub, short enough that old blockers cost no requests.
export async function announceBlocked({
  github,
  items,
  nowMs,
  windowMs = 7 * DAY_MS,
}) {
  const results = [];
  for (const [issue, value] of items) {
    const blocker = value?.status === "BLOCKED" ? value.blocker : null;
    const at = Date.parse(blocker?.at ?? "");
    if (!blocker?.code || !Number.isFinite(at) || nowMs - at > windowMs)
      continue;
    const stamp = `<!-- core-factory:blocked ${blocker.at} -->`;
    try {
      const comments = await github.issueComments(issue);
      if (comments.some((comment) => comment.body?.includes(stamp))) {
        results.push({ issue, announced: false, reason: "already" });
        continue;
      }
      const detail = publicText(blocker.detail, 500);
      const next =
        publicText(blocker.recovery, 400) ||
        `Fix the cause, then run \`control.mjs issue ${issue} retry\` (operator runbook, Controls).`;
      await github.comment(
        issue,
        [
          "**The factory stopped on this issue and needs a person.**",
          "",
          `- Reason: \`${publicText(blocker.code, 80)}\` (round ${value.round ?? "?"})`,
          ...(detail ? [`- Detail: ${detail}`] : []),
          `- Next step: ${next}`,
          "",
          `${FACTORY_MARKER} ${stamp}`,
        ].join("\n"),
      );
      results.push({ issue, announced: true });
    } catch {
      results.push({ issue, announced: false, reason: "github" });
    }
  }
  return results;
}

// The one thing the factory follows on a pull request it reported ready:
// whether somebody merged it. One request per ready issue and pass, for a
// month after the issue became ready; a GitHub failure never fails the pass.
export async function observeMerges({
  archon,
  github,
  items,
  targetBranch,
  by,
  now,
  nowMs,
  windowMs = 30 * DAY_MS,
}) {
  const results = [];
  for (const [issue, value] of items) {
    const number = value?.pr?.number;
    const since = Date.parse(value?.updatedAt ?? "");
    if (
      value?.status !== "PR_READY" ||
      !Number.isSafeInteger(number) ||
      !Number.isFinite(since) ||
      nowMs - since > windowMs
    )
      continue;
    let pr;
    try {
      pr = await github.pull(number);
    } catch {
      continue;
    }
    if (pr?.merged !== true) continue;
    try {
      const written = await conditionalWrite(
        archon,
        `core/issues/${issue}`,
        (document) =>
          planObservedMerge(document, { pr, targetBranch, by, now }),
      );
      if (!written.written) {
        results.push({ issue, action: "merged", code: "conflict" });
        continue;
      }
      await releaseReservations(archon, issue);
      results.push({ issue, action: "merged", pr: number });
    } catch (error) {
      if (!(error instanceof Refusal)) throw error;
      results.push({ issue, action: "merged", code: error.code });
    }
  }
  return results;
}

// A round that failed on a provider fault the engine classified as
// recoverable (a transient error, a rate limit, an overload, a quota whose
// reset the provider reported) is recovered by the pass itself: `recover` is
// the command an operator would run, with every one of its checks. The pass
// interval is the backoff, a reported reset is waited for, and a fault that
// keeps coming back blocks the issue under the no-progress rule. Any other
// native hold (sign-in, budget, configuration, unclear effects) stays for a
// person.
//
// The engine pauses a run that met a usage limit and wakes it itself within
// seconds of the reported reset. The command ends a run it finds paused, so
// the pass stays away until the engine has had two minutes to wake it: after
// that a run still paused was not woken, and ending it is the fallback.
//
// A woken run can meet the limit again, and the engine then pauses it for a
// later reset. The work item may still carry the earlier one. So the pass also
// asks the engine (`engineWait`): a run it is still going to wake is left
// alone, whatever the stored reset says.
const ENGINE_WAKE_GRACE_MS = 2 * 60_000;

// When the engine itself will wake a paused run: the `resume_at` of its last
// wait that has not completed, in milliseconds, or null when the run is not
// paused or has no such wait.
export function pendingEngineWait(detail) {
  // An answer that does not describe the run (an error body, a missing event
  // list) is not "no wake-up pending": the caller must not act on it.
  if (typeof detail?.run?.status !== "string" || !Array.isArray(detail.events))
    throw new Error("The engine's answer does not describe the run");
  if (detail.run.status !== "paused") return null;
  const waits = detail.events.filter((event) =>
    ["wait_started", "wait_completed"].includes(event?.event_type),
  );
  const last = waits.at(-1);
  if (last?.event_type !== "wait_started") return null;
  const at = Date.parse(last.data?.resume_at ?? "");
  return Number.isFinite(at) ? at : null;
}

// Ask the engine when it will wake a run. Any answer that is not a good
// description of that run is an error, never "nothing pending".
export async function readEngineWait({ port, runId, fetchImpl = fetch }) {
  const response = await fetchImpl(
    `http://127.0.0.1:${port}/api/workflows/runs/${runId}`,
  );
  if (!response.ok) throw new Error(`engine answered ${response.status}`);
  return pendingEngineWait(await response.json());
}

export async function recoverNativeFaults({
  items,
  recover,
  nowMs,
  engineWait,
}) {
  const results = [];
  for (const [issue, value] of items) {
    const fault = value?.nativeFaults;
    const runId = value?.run?.id;
    if (
      fault?.action !== "native-recovery" ||
      typeof runId !== "string" ||
      fault.runId !== runId
    )
      continue;
    const resets = (Array.isArray(fault.faults) ? fault.faults : [])
      .map((entry) => Date.parse(entry?.resetAt ?? ""))
      .filter(Number.isFinite);
    if (resets.some((at) => at + ENGINE_WAKE_GRACE_MS > nowMs)) {
      results.push({
        issue,
        action: "recover-native",
        ok: false,
        code: "reset-pending",
      });
      continue;
    }
    let wake = null;
    if (engineWait)
      try {
        wake = await engineWait(runId);
      } catch {
        // Without the engine's answer the pass cannot tell whether a wake-up
        // is pending. It ends nothing on a guess; the next pass asks again.
        results.push({
          issue,
          action: "recover-native",
          ok: false,
          code: "engine-unread",
        });
        continue;
      }
    if (Number.isFinite(wake) && wake + ENGINE_WAKE_GRACE_MS > nowMs) {
      results.push({
        issue,
        action: "recover-native",
        ok: false,
        code: "reset-pending",
      });
      continue;
    }
    try {
      const result = await recover(issue, runId);
      results.push({
        issue,
        action: "recover-native",
        ok: result?.ok === true,
        ...(result?.ok === true ? {} : { code: result?.code ?? "refused" }),
      });
    } catch {
      results.push({
        issue,
        action: "recover-native",
        ok: false,
        code: "error",
      });
    }
  }
  return results;
}

// The dependency trees are three quarters of an issue's workspace and can be
// installed again from the lockfile. They go once the issue is MERGED; the
// clone, its history and anything a round set aside stay. The install marker
// goes first, so a half-removed tree is never taken for an installed one.
export function pruneFinished({
  items,
  paths,
  exists = existsSync,
  removeFile = (file) => rmSync(file, { force: true }),
  removeTrees,
}) {
  const results = [];
  for (const [issue, value] of items) {
    if (
      value?.status !== "MERGED" ||
      value.run ||
      hasUnconfirmedCleanup(value) ||
      hasNativeFaultHold(value)
    )
      continue;
    const where = issuePaths(paths, issue);
    if (!exists(path.posix.join(where.repo, "node_modules"))) continue;
    try {
      removeFile(path.posix.join(where.root, "install.json"));
      const removed = removeTrees(where.repo);
      results.push({ issue, action: "prune", removed: removed.length });
    } catch (error) {
      results.push({
        issue,
        action: "prune",
        error: String(error?.message ?? error).slice(0, 200),
      });
    }
  }
  return results;
}

async function releaseReservations(archon, issue) {
  try {
    await releaseInactiveReservations(archon, { issues: [issue] });
  } catch {}
}

// A reservation whose holder has no live work item (finished, or never
// admitted) is released, so a release that failed when its round ended never
// parks other issues for good. The listing is not current holder evidence.
export async function releaseStaleReservations({ archon }) {
  try {
    const result = await releaseInactiveReservations(archon);
    return result.released;
  } catch {
    return [];
  }
}

async function reconcile({
  archon,
  name,
  issue,
  runId,
  factory,
  now,
  limits,
  fire,
}) {
  const runStatus = (await archon.runStatus?.(runId).catch(() => null)) ?? null;
  let written;
  try {
    written = await conditionalWrite(archon, name, (document) =>
      planReconcile(document, { now, runStatus, limits }),
    );
  } catch (error) {
    if (error instanceof Refusal)
      return { issue, action: "reconcile", code: error.code };
    throw error;
  }
  if (!written.written) return { issue, action: "reconcile", code: "conflict" };
  const { outcome, value } = written.plan;
  if (TERMINAL.has(outcome)) await releaseReservations(archon, issue);
  const result = { issue, action: "reconcile", outcome };
  if (
    outcome !== "reconciled" ||
    value.control !== "run" ||
    !factoryPermitsRound(factory).ok
  )
    return result;
  const fired = await fire({
    value,
    revision: written.receipt?.revision ?? written.plan.ifRevision + 1,
  }).catch(() => ({ ok: false }));
  return { ...result, ok: fired.ok === true, deliveryId: fired.deliveryId };
}

// One pass over the admitted work items: restart idle ones whose next round
// was never claimed (keyed by revision, I6), reconcile active ones whose run
// ended without recording (lease-control#3), and leave parked ones parked
// while another issue holds their areas (I4).
export async function sweepItems({
  archon,
  names,
  factory,
  reservations,
  now,
  limits,
  fire,
}) {
  const results = [];
  for (const name of names) {
    const document = await archon.get(name);
    const issue =
      document.value?.issue ?? Number(String(name).split("/").pop());
    const decision = planSweep(document, { factory, reservations });
    if (decision.action === "reconcile")
      results.push(
        await reconcile({
          archon,
          name,
          issue,
          runId: decision.runId,
          factory,
          now,
          limits,
          fire,
        }),
      );
    else if (decision.action === "fire") {
      const fired = await fire({
        value: document.value,
        revision: document.revision,
      }).catch(() => ({ ok: false }));
      results.push({
        issue,
        action: "fire",
        ok: fired.ok === true,
        deliveryId: fired.deliveryId ?? decision.deliveryId,
      });
    } else results.push({ issue, action: "skip", reason: decision.reason });
  }
  return results;
}
