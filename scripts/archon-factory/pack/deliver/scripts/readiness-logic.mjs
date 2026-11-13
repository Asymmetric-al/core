// Readiness decisions that do not touch GitHub or Archon directly: how
// Samson's feedback dispositions are applied, how a base integration ends,
// how the merge lane is held, and what evidence a MERGED outcome needs.
import { StateConflict } from "../../.shared/archon.mjs";
import {
  FACTORY_MARKER,
  feedbackFixPending,
  threadDisposition,
} from "../../.shared/readiness.mjs";
import { makeRepair, normalizeRepair } from "./repair-logic.mjs";

const DISMISSALS = new Set(["rebut", "obsolete", "decline-nit"]);
const FIXES = new Set(["fix-implementation", "fix-acceptance"]);

// What Samson is told about each choice when he judges pull-request feedback.
export const DISPOSITION_CHOICES = [
  "Investigate each item against the requirements and the code in the workspace. A bot is neither automatically right nor ignorable.",
  "- fix-implementation / fix-acceptance: a real defect; it returns to Bezalel or Ezra. The thread is resolved once the fix is published.",
  "- rebut: a false positive; reply explains why with evidence (file:line).",
  "- obsolete: already addressed or no longer applies; verify it first (outdated threads are flagged `outdated`), and the reply says where.",
  "- decline-nit: a harmless style suggestion; reply states the reason.",
  "- rerun-flake: a failed check unrelated to this change (cite the log line); rerun once.",
  "- adjudicate: a genuine dispute you cannot settle from the evidence; the factory stops the issue for an operator and resolves nothing.",
  "The pull-request description is written by the factory and no repair can change it. Answer a request about the description (a missing template section, the deploy checklist) in a reply with decline-nit or rebut, never as a fix: for the deploy checklist the reply states each item of .github/pull_request_template.md with its answer or N/A and the reason.",
  "A thread reappears when someone replies after your disposition or unresolves it after the factory resolved it (flagged `reopened`), and a person's comment reappears when it is edited.",
  "Leave the reply empty for automated status comments (deploy previews, review summaries) that need no answer.",
  "Security and behavior claims need investigation, not dismissal. Keep replies short and factual; do not @mention review bots.",
].join("\n");

// Mentions become inline code: a reply never summons a review bot or pings
// a person on the factory's behalf.
export function replyBody(text) {
  const safe = text
    .trim()
    .replace(/(^|[^`\w])@([A-Za-z0-9][A-Za-z0-9-]*(?:\[bot\])?)/g, "$1`@$2`");
  return `${safe}\n\n${FACTORY_MARKER}`;
}

const handles = (item, action) =>
  FIXES.has(action) ||
  DISMISSALS.has(action) ||
  (action === "rerun-flake" && item.kind === "failed-check");
const label = (item) => `[${item.kind} ${item.url ?? item.id}]`;

// What to write for Samson's dispositions. Anything without a handler
// (adjudicate included) blocks the whole set before any GitHub write or
// record, so a disputed claim is never resolved or marked handled.
export function planDispositions({
  items,
  dispose,
  head,
  acceptanceRevision,
  feedbackRounds = 0,
  maxFeedbackRounds = Infinity,
}) {
  if (dispose?.task_status !== "DONE")
    return {
      blocked: {
        code: "dispose-incomplete",
        detail: dispose?.summary ?? "Samson returned no dispositions",
      },
    };
  const unread = items.filter(
    (item) =>
      item.contentUnavailable ||
      (item.kind === "review-thread" &&
        (!item.lastReply ||
          item.lastReply.id !== item.lastComment ||
          typeof item.lastReply.body !== "string")),
  );
  if (unread.length)
    return {
      blocked: {
        code: "feedback-content-unavailable",
        detail: `Exact current feedback is unavailable for ${unread.map((item) => item.id).join(", ")}`,
        recovery:
          "Retry after GitHub can supply the complete current reply; nothing was dispositioned or resolved",
      },
    };
  const byId = new Map(
    dispose.items.map((decision) => [decision.id, decision]),
  );
  const missing = items.filter((item) => !byId.has(item.id));
  if (missing.length)
    return {
      blocked: {
        code: "dispose-incomplete",
        detail: `No disposition for ${missing.map((item) => item.id).join(", ")}`,
        recovery: "Retry the issue so Samson dispositions every item",
      },
    };
  const disputed = items.filter(
    (item) => !handles(item, byId.get(item.id).action),
  );
  if (disputed.length)
    return {
      blocked: {
        code: "feedback-dispute",
        detail: disputed
          .map((item) =>
            `${byId.get(item.id).action}: ${label(item)} ${byId.get(item.id).reason ?? ""}`.trim(),
          )
          .join("\n")
          .slice(0, 2000),
        items: disputed.map((item) => item.id),
        recovery:
          "An operator settles the disputed feedback on the PR (no Agabus feedback stage exists yet), then retries the issue so Samson dispositions it again; nothing was resolved or recorded",
      },
    };
  if (
    items.some((item) => byId.get(item.id).action === "fix-acceptance") &&
    (typeof acceptanceRevision !== "string" || !acceptanceRevision.trim())
  )
    return {
      blocked: {
        code: "acceptance-revision-unavailable",
        detail: "The acceptance revision for this feedback was not recorded",
        recovery:
          "Retry the issue to observe and disposition feedback against the current acceptance revision",
      },
    };
  // A review thread is resolved only together with a posted explanation: the
  // reply, or failing that the stated reason.
  const explanation = (item) =>
    byId.get(item.id).reply?.trim() ||
    String(byId.get(item.id).reason ?? "").trim();
  const unexplained = items.filter(
    (item) =>
      item.kind === "review-thread" &&
      DISMISSALS.has(byId.get(item.id).action) &&
      !explanation(item),
  );
  if (unexplained.length)
    return {
      blocked: {
        code: "dispose-incomplete",
        detail: `No explanation for dismissing ${unexplained.map((item) => item.id).join(", ")}`,
        recovery:
          "Retry the issue so Samson explains each dismissal; nothing was resolved or recorded",
      },
    };
  const plan = { acceptance: [], implementation: [], actions: [] };
  for (const item of items) {
    const decision = byId.get(item.id);
    const reason = String(decision.reason ?? "").slice(0, 600);
    const record = { action: decision.action, reason, head, kind: item.kind };
    if ("lastComment" in item) record.lastComment = item.lastComment;
    if (item.updatedAt) record.updatedAt = item.updatedAt;
    if (decision.action === "fix-implementation") {
      const evidence = item.lastReply
        ? `${item.lastReply.author ?? "?"}: ${item.lastReply.body}`
        : (item.body ?? item.comments ?? item.log ?? "");
      plan.implementation.push(
        `${label(item)} ${reason}\n${evidence}`.slice(0, 4000),
      );
      plan.actions.push({
        id: item.id,
        type: "record",
        kind: item.kind,
        record: { ...record, status: "fix-pending" },
      });
    } else if (decision.action === "fix-acceptance") {
      plan.acceptance.push(`${label(item)} ${reason}`);
      plan.actions.push({
        id: item.id,
        type: "record",
        kind: item.kind,
        record: {
          ...record,
          acceptanceRevision: acceptanceRevision ?? null,
          status: "fix-pending",
        },
      });
    } else if (decision.action === "rerun-flake") {
      if (feedbackRounds > maxFeedbackRounds) {
        plan.implementation.push(
          `Check ${item.name} keeps failing: ${reason}\n${item.log ?? ""}`
            .trim()
            .slice(0, 4000),
        );
        plan.actions.push({
          id: item.id,
          type: "record",
          kind: item.kind,
          record: { ...record, status: "fix-pending" },
        });
      } else
        plan.actions.push({
          id: item.id,
          type: "rerun",
          kind: item.kind,
          jobId: item.id.slice("check-".length),
          name: item.name,
          record,
        });
    } else {
      const action = {
        id: item.id,
        type: "reply",
        kind: item.kind,
        body:
          item.kind === "review-thread"
            ? replyBody(explanation(item))
            : decision.reply?.trim()
              ? replyBody(decision.reply)
              : null,
        resolve: item.kind === "review-thread",
        record,
      };
      if (item.kind === "review-thread") action.replyTo = item.replyTo ?? null;
      plan.actions.push(action);
    }
  }
  return plan;
}

export function mergeDispositions(existing, records, { at, run }) {
  const next = { ...(existing ?? {}) };
  for (const [id, record] of Object.entries(records))
    next[id] = { ...record, at, run };
  return next;
}

// Threads the factory should resolve now: dismissed ones, and accepted
// defects once a newer head carrying the fix is published (replying once
// with the fixing commit). A newer reply makes the disposition stale, and a
// thread a person reopened after the factory resolved it is never resolved
// again on the same disposition. A head a base integration carried over from
// the disposition head (`carriedFrom`, one head or several) holds no fix.
export function threadsToResolve({
  threads,
  dispositions,
  head,
  carriedFrom = [],
  workItem,
}) {
  const unfixed = new Set([head, ...[carriedFrom].flat()].filter(Boolean));
  const out = [];
  for (const thread of threads ?? []) {
    if (thread.isResolved) continue;
    const disposition = threadDisposition(dispositions, thread).record;
    if (!disposition) continue;
    const replyTo = thread.comments?.nodes?.[0]?.databaseId ?? null;
    if (FIXES.has(disposition.action)) {
      if (
        disposition.action === "fix-acceptance"
          ? feedbackFixPending(disposition, workItem)
          : !disposition.head || unfixed.has(disposition.head)
      )
        continue;
      const revision =
        disposition.action === "fix-acceptance"
          ? workItem.acceptance.revision
          : null;
      const seen = [
        ...(thread.comments?.nodes ?? []),
        ...(thread.recent?.nodes ?? []),
      ].some(
        (comment) =>
          comment.body?.includes(FACTORY_MARKER) &&
          comment.body.includes(head) &&
          (!revision || comment.body.includes(revision)),
      );
      const body = revision
        ? `Addressed in acceptance revision \`${revision}\` for \`${head}\`.\n\n${FACTORY_MARKER}`
        : `Addressed in \`${head}\`.\n\n${FACTORY_MARKER}`;
      out.push({
        id: thread.id,
        fixed: true,
        replyTo,
        body: seen ? null : body,
      });
    } else if (DISMISSALS.has(disposition.action))
      out.push({ id: thread.id, fixed: false, replyTo, body: null });
  }
  return out;
}

// Dispositions after this round's resolutions: every thread the factory
// resolved records when, and a fixed one also records the fixing head.
export function markResolved(
  current,
  { resolved = [], fixed = [], head, acceptanceRevision, at },
) {
  const next = { ...(current ?? {}) };
  for (const id of resolved) {
    if (!next[id]) continue;
    next[id] = {
      ...next[id],
      ...(fixed.includes(id)
        ? {
            status: "fixed",
            fixedIn: head,
            ...(next[id].action === "fix-acceptance"
              ? { fixedAcceptanceRevision: acceptanceRevision }
              : {}),
          }
        : {}),
      resolvedAt: at,
    };
  }
  return next;
}

// Startup reconciliation between the recorded candidate and GitHub's PR head.
//   ok       nothing to do
//   record   the recorded head is live; bring value.pr up to date
//   adopt    a carried base integration was pushed but not recorded
//   review   the recorded head was never published: review it, then publish
//   resolve  an operator pushed a resolution of this candidate's recorded
//            base conflict (`descends`: the live head contains the candidate)
//   update   somebody merged the target branch into the pull request on
//            GitHub ("Update branch"): the live head contains the candidate
//            and adds nothing but the target branch (`baseUpdate`)
//   none     a head the factory did not publish; the decision blocks on it
export function reconcileHead({
  value,
  liveHead,
  descends = false,
  baseUpdate = false,
}) {
  const pending = value.pr?.pending ?? null;
  if (pending && liveHead === pending.head && value.head !== liveHead)
    return value.head === pending.from && pending.carried
      ? { action: "adopt", pending }
      : { action: "none" };
  if (value.head === liveHead)
    return value.pr?.head === liveHead && !pending
      ? { action: "ok" }
      : { action: "record" };
  if (value.pr?.head === liveHead) return { action: "review" };
  const conflict = value.pr?.conflict ?? null;
  if (conflict && conflict.head === value.head && descends === true)
    return { action: "resolve", conflict };
  if (descends === true && baseUpdate === true) return { action: "update" };
  return { action: "none" };
}

// An update from the target branch that somebody applied on GitHub becomes
// the candidate, the same way an operator's conflict resolution does: nothing
// about the merged result was reviewed, so it goes to the review-only route.
export function adoptBaseUpdate({ value, liveHead, base, now, target }) {
  const adoption = adoptResolution({ value, liveHead, base, now });
  return {
    fields: adoption.fields,
    outcome: {
      ...adoption.outcome,
      reason: `Adopted ${liveHead.slice(0, 12)}: ${target} was merged into the branch outside the factory, on top of ${String(value.head).slice(0, 12)}; it is reviewed again before anything else`,
      ledger: {
        ...adoption.outcome.ledger,
        fingerprint: `outside-base-update:${liveHead}`,
      },
    },
  };
}

// The operator's resolution becomes the candidate. Nothing about it was
// reviewed, so it goes to the review-only route (I1/I2): freeze adopts the
// recorded head, both reviews and final acceptance run, publish verifies it.
export function adoptResolution({ value, liveHead, base, now }) {
  const conflict = value.pr?.conflict ?? {};
  return {
    fields: {
      head: liveHead,
      base,
      reviews: null,
      final: null,
      pr: {
        ...value.pr,
        head: liveHead,
        publishedAt: now,
        pending: null,
        conflict: null,
      },
    },
    outcome: {
      verdict: "REPAIR",
      reason: `Adopted the conflict resolution ${liveHead.slice(0, 12)} pushed on top of ${String(value.head).slice(0, 12)}; it is reviewed again before anything else`,
      ledger: {
        repair: makeRepair({ reviewOnly: true, source: "readiness" }),
        fingerprint: `conflict-resolution:${liveHead}`,
        adopted: {
          from: value.head,
          head: liveHead,
          base,
          files: conflict.files ?? [],
        },
      },
    },
  };
}

// Reviews and final acceptance carried over a base integration keep naming
// the head that was actually reviewed, however many integrations follow.
export function carryForward(value, after, before) {
  return {
    reviews: value.reviews
      ? Object.fromEntries(
          Object.entries(value.reviews).map(([name, review]) => [
            name,
            {
              ...review,
              candidate: after,
              carriedFrom: review?.carriedFrom ?? before,
            },
          ]),
        )
      : null,
    final: value.final
      ? {
          ...value.final,
          candidate: after,
          carriedFrom: value.final.carriedFrom ?? before,
        }
      : null,
  };
}

// The integration step runs only for a decision whose sole repair is the
// base itself; an owner's pending work always goes to that owner first.
export function shouldIntegrate(decision) {
  return (
    decision?.verdict === "REPAIR" &&
    decision.integrate === true &&
    !decision.repair?.acceptance?.length &&
    !decision.repair?.implementation?.length
  );
}

// GitHub recomputes mergeability after a thread is resolved; deciding in the
// same round can read a stale `blocked` as a terminal human review.
export function resolutionWait(resolved) {
  if (!resolved?.length) return null;
  return {
    verdict: "WAIT",
    reason: `Resolved ${resolved.length} review thread(s); deciding next round on fresh mergeability`,
    ledger: { resolved: [...resolved] },
  };
}

export function conflictFiles(output) {
  const files = new Set();
  for (const line of String(output ?? "").split(/\r?\n/)) {
    const match = /^CONFLICT \([^)]*\): (.*)$/.exec(line.trim());
    if (!match) continue;
    const named = /Merge conflict in (.+)$/.exec(match[1]);
    files.add((named ? named[1] : match[1]).trim().slice(0, 300));
  }
  return [...files];
}

// A base merge that fails never becomes an implementation repair: Bezalel
// cannot merge the base, so the issue stops with the conflict named. The
// conflict is recorded against the candidate (`conflict`, for value.pr), so
// a resolution an operator pushes on top of it is adopted and reviewed.
export function baseIntegrationFailure({ output, target, branch, head, base }) {
  const files = conflictFiles(output);
  const tail = String(output ?? "").slice(-1500);
  if (files.length)
    return {
      verdict: "BLOCKED",
      reason: `Merging origin/${target} into ${branch} conflicts in ${files.length} file(s)`,
      ...(head ? { conflict: { head, base: base ?? null, files } } : {}),
      ledger: {
        blocked: {
          code: "base-conflict",
          detail:
            `Merging origin/${target} into ${branch} conflicts: ${files.join(", ")}`.slice(
              0,
              1500,
            ),
          files,
          recovery: head
            ? `Check out ${branch} at ${head.slice(0, 12)}, merge ${target} into it (a merge, not a rebase), resolve the conflict and push the merge commit to ${branch}; then retry the issue. Readiness adopts that head only if it contains ${head.slice(0, 12)}, and sends it through review before anything else`
            : `Resolve the conflict with ${target} outside the factory (land or rework the conflicting change, or narrow this issue), then retry the issue; readiness integrates ${target} again on its next round`,
        },
      },
    };
  return {
    verdict: "BLOCKED",
    reason: `Merging origin/${target} into ${branch} failed`,
    ledger: {
      blocked: {
        code: "base-merge-failed",
        detail: tail,
        files: [],
        recovery:
          "Inspect the merge output in the round ledger, then retry the issue",
      },
    },
  };
}

// An integration that changed the candidate's own diff is re-reviewed on the
// review-only route (I1/I2): freeze the recorded head, both reviews, final.
export function reviewAgain({ before, after, base }) {
  return {
    verdict: "REPAIR",
    reason:
      "Base integration changed the candidate's own diff; reviews and final acceptance must be redone on the integrated head",
    ledger: {
      repair: makeRepair({ reviewOnly: true, source: "readiness" }),
      fingerprint: `integrate-review:${after}`,
      integrated: { before, after, base, carried: false },
    },
  };
}

// A repair from another producer (publication), in the I2 shape and named
// after that producer unless it names itself.
export function asRepair(repair, source) {
  const normalized = normalizeRepair(repair);
  if (!normalized) return null;
  return makeRepair({
    ...normalized,
    source:
      typeof repair.source === "string" && repair.source
        ? repair.source
        : source,
  });
}

// One final merge lane for the whole factory. The lease is released before
// the outcome is returned, whatever the body did (respond() exits the process,
// so it must never run while the lane is held).
export async function withMergeLane(archon, { issue, pr, now }, body) {
  const lane = await archon.get("core/merge-lane");
  try {
    await archon.put(
      "core/merge-lane",
      { v: 1, issue, pr, at: now },
      { ifRevision: lane.revision, lease: "take" },
    );
  } catch (error) {
    if (error instanceof StateConflict)
      return {
        verdict: "WAIT",
        reason: "Another merge holds the merge lane",
        ledger: {},
      };
    throw error;
  }
  let laneReleased = false;
  let outcome;
  try {
    outcome = await body();
  } finally {
    try {
      const held = await archon.get("core/merge-lane");
      await archon.put(
        "core/merge-lane",
        { v: 1, issue: null, pr: null, at: now },
        { ifRevision: held.revision, lease: "release" },
      );
      laneReleased = true;
    } catch {}
  }
  return { ...outcome, ledger: { ...(outcome.ledger ?? {}), laneReleased } };
}

// Factory attribution requires a confirmed receipt for the exact merge.
export function mergedBy(value, pr) {
  const request = value.pr?.mergeRequest;
  return pr.merged === true &&
    request?.status === "confirmed" &&
    /^[0-9a-f]{40}$/.test(request.head ?? "") &&
    request.head === pr.head?.sha &&
    /^[0-9a-f]{40}$/.test(request.mergeCommit ?? "") &&
    request.mergeCommit === pr.merge_commit_sha
    ? "factory"
    : "external";
}

// MERGED needs closeout evidence: merged into the target, the merge commit
// reachable from the target (compare base=mergeCommit head=target), and the
// issue closed. The caller closes the issue only when `shouldClose`.
export function closeoutDecision({
  pr,
  issue,
  compare,
  targetBranch,
  issueNumber,
  mergedBy: by,
}) {
  const mergeCommit = pr.merge_commit_sha ?? null;
  if (pr.base?.ref !== targetBranch)
    return {
      verdict: "BLOCKED",
      reason: `PR was merged into ${pr.base?.ref}, not ${targetBranch}`,
      shouldClose: false,
      ledger: {
        mergeCommit,
        merged_by: by,
        blocked: {
          code: "merged-elsewhere",
          detail: `Merged into ${pr.base?.ref} as ${mergeCommit}`,
          recovery: `Land the change on ${targetBranch} by hand, close issue #${issueNumber}, then stop the issue`,
        },
      },
    };
  const onTarget = ["identical", "ahead"].includes(compare?.status);
  const issueClosed = issue?.state === "closed";
  if (onTarget && issueClosed)
    return {
      verdict: "MERGED",
      reason: `Merged as ${mergeCommit} on ${targetBranch}; issue #${issueNumber} is closed`,
      shouldClose: false,
      ledger: { mergeCommit, merged_by: by, onTarget, issueClosed },
    };
  const recovery = !onTarget
    ? `Confirm merge commit ${mergeCommit} is on ${targetBranch}; the next round checks again`
    : `Close issue #${issueNumber} (the factory could not), then the next round records MERGED`;
  return {
    verdict: "WAIT",
    reason: `PR is merged but closeout is incomplete: ${!onTarget ? `merge commit not yet on ${targetBranch}` : `issue #${issueNumber} is still open`}`,
    shouldClose: onTarget && !issueClosed,
    ledger: {
      mergeCommit,
      merged_by: by,
      closeout: { onTarget, issueClosed, recovery },
    },
  };
}

export function decisionOutcome(decision) {
  const reason = decision.reasons.join("; ").slice(0, 1500);
  if (decision.verdict === "REPAIR")
    return {
      verdict: "REPAIR",
      reason,
      ledger: {
        repair: makeRepair({ ...decision.repair, source: "readiness" }),
        pending: decision.pending,
        fingerprint: `readiness:${reason.slice(0, 200)}`,
      },
    };
  const ledger = {};
  if (decision.pending?.length) ledger.pending = decision.pending;
  if (decision.repairs?.length) ledger.repairs = decision.repairs;
  return { verdict: decision.verdict, reason, ledger };
}
