// The selector's intake decisions, separate from the scripts that observe
// GitHub and Archon: admission gates, admit's final checks and the sweep that
// restarts or reconciles admitted work items.
import { createHash } from "node:crypto";

import { conditionalWrite } from "../../.shared/archon.mjs";
import { releaseInactiveReservations } from "../../.shared/reservations.mjs";
import {
  Refusal,
  TERMINAL,
  factoryPermitsIntake,
  factoryPermitsRound,
  heldElsewhere,
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
