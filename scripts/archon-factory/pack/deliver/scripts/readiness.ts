// Readiness: reconcile the recorded head with the PR, resolve threads whose
// disposition is settled, apply Samson's feedback dispositions, then take one
// live readiness decision and act on it: integrate the base when that is the
// only repair, PR_READY, or a protected expected-head merge when authorized.
// A round that resolved threads decides next round, on fresh mergeability.
// Decisions live in readiness-logic.mjs and .shared/readiness.mjs.
import { readFileSync } from "node:fs";
import path from "node:path";

import { StateConflict } from "../../.shared/archon.mjs";
import { createGitHub, githubToken } from "../../.shared/github.mjs";
import { addsOnlyTarget, revParse } from "../../.shared/git.mjs";
import { publishCandidate } from "../../.shared/publication.mjs";
import {
  FACTORY_MARKER as MARKER,
  evaluateReadiness,
  reviewProvidersFrom,
  threadLastReply,
  topLevelFeedback,
  unfixedHeads,
} from "../../.shared/readiness.mjs";
import {
  emit,
  input,
  openRound,
  policyRevision,
  runInIssueRepo,
  workItem,
  writeWorkItem,
} from "../../.shared/round.mjs";
import { checkFactoryStorage } from "../../.shared/storage-policy.mjs";
import { planCheckpoint } from "../../.shared/workitem.mjs";
import {
  adoptBaseUpdate,
  adoptResolution,
  asRepair,
  baseIntegrationFailure,
  carryForward,
  closeoutDecision,
  decisionOutcome,
  markResolved,
  mergeDispositions,
  mergedBy,
  planDispositions,
  reconcileHead,
  resolutionWait,
  reviewAgain,
  shouldIntegrate,
  threadsToResolve,
  withMergeLane,
} from "./readiness-logic.mjs";
import { makeRepair } from "./repair-logic.mjs";

type Ledger = Record<string, unknown>;
type Outcome = { verdict: string; reason: string; ledger?: Ledger };
type FeedbackReply = { id?: string; body?: string };
type FeedbackItem = {
  id: string;
  kind: string;
  lastComment?: string | null;
  lastReply?: FeedbackReply | null;
};
const SHA = /^[0-9a-f]{40}$/;

const round = openRound();
const dispose = input("dispose");
const facts = round.ledger.read("feedback-facts");
const target = round.config.repository.targetBranch;
const respond = (verdict: string, reason: string, ledger: Ledger = {}) => {
  round.ledger.write("readiness", { verdict, reason, ...ledger });
  emit(
    verdict === "MERGED"
      ? { verdict, reason, merged_by: ledger.merged_by ?? "factory" }
      : { verdict, reason },
  );
  process.exit(0);
};
const finish = (outcome: Outcome) =>
  respond(outcome.verdict, outcome.reason, outcome.ledger);
const storageOutcome = (storage: { code: string }): Outcome => ({
  verdict: "BLOCKED",
  reason: `Storage refused: ${storage.code}`,
  ledger: {
    storage,
    blocked: {
      code: storage.code,
      recovery:
        "Restore storage prerequisites and explicit operator policy before retrying protected delivery",
    },
  },
});
if (!facts || facts.blocked)
  respond("BLOCKED", facts?.blocked?.detail ?? "No feedback facts");
let providers: unknown[] = [];
try {
  providers = reviewProvidersFrom(round.config);
} catch (error) {
  respond(
    "BLOCKED",
    `Invalid review provider configuration: ${(error as Error).message}`,
    {
      blocked: {
        code: "review-providers-config",
        detail: (error as Error).message,
        recovery:
          "Correct reviewProviders in core-factory.json, then retry the issue",
      },
    },
  );
}
let document = await workItem(round);
let value = document.value;
const token = await githubToken({
  gh: round.config.github.executable,
  configDir: round.config.github.configDir,
});
const github = createGitHub({ token, repo: round.config.repository.slug });
const prNumber = value.pr.number;
const feedbackName = `core/issues/${round.issue}/feedback`;

const checkpoint = async (fields: Ledger) => {
  document = await workItem(round);
  await writeWorkItem(
    round,
    planCheckpoint(document, { runId: round.runId, fields, now: round.now() }),
  );
  document = await workItem(round);
  value = document.value;
};
const updateDispositions = async (
  change: (current: Record<string, any>) => Record<string, any>,
) => {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const feedback = await round.archon.get(feedbackName);
    try {
      await round.archon.put(
        feedbackName,
        { v: 1, dispositions: change(feedback.value?.dispositions ?? {}) },
        { ifRevision: feedback.revision },
      );
      return true;
    } catch (error) {
      if (!(error instanceof StateConflict)) throw error;
    }
  }
  return false;
};

// 1. The recorded head must be the published one before anything else. A
// resolution an operator pushed on top of this candidate's recorded base
// conflict is adopted and sent to the review-only route.
const live = await github.pull(prNumber);
if (!live.merged) {
  const liveHead: string = live.head.sha;
  const conflicted =
    value.pr?.conflict?.head === value.head &&
    liveHead !== value.head &&
    SHA.test(liveHead);
  // A head the factory neither recorded nor has pending: somebody pushed.
  const foreign =
    SHA.test(liveHead) &&
    liveHead !== value.head &&
    liveHead !== value.pr?.head &&
    liveHead !== value.pr?.pending?.head;
  const descends =
    (conflicted || foreign) &&
    (
      await round.git.git(
        ["merge-base", "--is-ancestor", value.head, liveHead],
        { cwd: round.where.repo },
      )
    ).code === 0;
  // GitHub's "Update branch": every commit the live head adds to the
  // candidate is either on the target branch or a merge that joins the two.
  const baseUpdate =
    foreign &&
    descends &&
    !conflicted &&
    (await addsOnlyTarget(
      { git: round.git, repo: round.where.repo },
      { candidate: value.head, head: liveHead, target },
    ));
  const reconcile = reconcileHead({ value, liveHead, descends, baseUpdate });
  round.ledger.write("readiness-reconcile", {
    ...reconcile,
    recorded: value.head,
    live: liveHead,
    ...(conflicted || foreign ? { descends, baseUpdate } : {}),
  });
  if (reconcile.action === "record")
    await checkpoint({ pr: { ...value.pr, head: liveHead, pending: null } });
  else if (reconcile.action === "adopt") {
    const { pending } = reconcile;
    await checkpoint({
      head: pending.head,
      base: pending.base,
      ...carryForward(value, pending.head, pending.from),
      pr: {
        ...value.pr,
        head: pending.head,
        publishedAt: round.now(),
        pending: null,
      },
    });
  } else if (reconcile.action === "review")
    respond(
      "REPAIR",
      `Recorded head ${value.head} was never published; it is reviewed again before publication`,
      {
        repair: makeRepair({ reviewOnly: true, source: "readiness" }),
        fingerprint: `unpublished:${value.head}`,
      },
    );
  else if (reconcile.action === "resolve" || reconcile.action === "update") {
    const base = (
      await round.git.ok(["merge-base", liveHead, `origin/${target}`], {
        cwd: round.where.repo,
      })
    ).trim();
    const adoption =
      reconcile.action === "resolve"
        ? adoptResolution({ value, liveHead, base, now: round.now() })
        : adoptBaseUpdate({
            value,
            liveHead,
            base,
            now: round.now(),
            target,
          });
    await checkpoint(adoption.fields);
    finish(adoption.outcome);
  }
}

// 2. Resolve threads whose disposition is settled: dismissals, and accepted
// defects once the fixing head is published (replying with that commit). A
// head only carried over a base integration fixes nothing.
const resolvedThisRound: string[] = [];
if (!live.merged && value.head === live.head.sha) {
  const threads = await github.reviewThreads(prNumber);
  const dispositions =
    (await round.archon.get(feedbackName)).value?.dispositions ?? {};
  const resolved: string[] = [];
  const fixed: string[] = [];
  for (const closure of threadsToResolve({
    threads,
    dispositions,
    head: value.head,
    carriedFrom: [...unfixedHeads(value)],
    workItem: value,
  })) {
    try {
      if (closure.body && closure.replyTo)
        await github.replyToReviewComment(
          prNumber,
          closure.replyTo,
          closure.body,
        );
      await github.resolveThread(closure.id);
      resolved.push(closure.id);
      if (closure.fixed) fixed.push(closure.id);
    } catch {}
  }
  if (resolved.length)
    await updateDispositions((current) =>
      markResolved(current, {
        resolved,
        fixed,
        head: value.head,
        acceptanceRevision: value.acceptance?.revision,
        at: round.now(),
      }),
    );
  round.ledger.write("thread-resolution", { resolved, fixed });
  resolvedThisRound.push(...resolved);
}

// 3. Apply Samson's dispositions. A disputed or unhandled item blocks before
// any reply, resolution or record; a failed reply leaves its item unrecorded.
if (dispose) {
  const items: FeedbackItem[] = JSON.parse(
    readFileSync(
      path.posix.join(round.materials("dispose"), "feedback.json"),
      "utf8",
    ),
  ).items;
  const plan = planDispositions({
    items,
    dispose,
    head: facts.head,
    acceptanceRevision: facts.acceptanceRevision,
    feedbackRounds: value.feedbackRounds ?? 0,
    maxFeedbackRounds: round.limits.maxFeedbackRounds,
  });
  if (plan.blocked)
    respond(
      "BLOCKED",
      (plan.blocked.code === "feedback-dispute"
        ? `Disputed feedback needs a ruling: ${plan.blocked.items.join(", ")}`
        : `Samson could not disposition the feedback: ${plan.blocked.detail}`
      ).slice(0, 1500),
      { blocked: plan.blocked },
    );
  const threadItems = items.filter((item) => item.kind === "review-thread");
  const liveThreads = threadItems.length
    ? await github.reviewThreads(prNumber)
    : [];
  const currentReplies = new Map<string, FeedbackReply | null>(
    liveThreads.map((thread: { id: string }) => [
      thread.id,
      threadLastReply(thread),
    ]),
  );
  const unread = threadItems.filter(
    (item) => typeof currentReplies.get(item.id)?.body !== "string",
  );
  if (unread.length) {
    const detail = `Current feedback content became unavailable for ${unread.map((item) => item.id).join(", ")}`;
    respond("BLOCKED", detail, {
      blocked: {
        code: "feedback-content-unavailable",
        detail,
        recovery:
          "Retry after GitHub can supply the exact current reply; nothing was dispositioned or resolved",
      },
    });
  }
  const changed = threadItems.filter((item) => {
    const current = currentReplies.get(item.id);
    return (
      current?.id !== item.lastComment || current?.body !== item.lastReply?.body
    );
  });
  if (changed.length)
    respond(
      "WAIT",
      "Thread feedback changed after Samson read it; re-read and disposition the exact current reply next round",
      { pending: changed.map((item) => item.id) },
    );
  const records: Record<string, unknown> = {};
  const reruns = { requested: [] as string[], refused: [] as string[] };
  for (const action of plan.actions) {
    if (action.type === "record") records[action.id] = action.record;
    else if (action.type === "rerun") {
      try {
        await github.rerunFailedJob(action.jobId);
        records[action.id] = action.record;
        reruns.requested.push(action.name);
      } catch {
        reruns.refused.push(action.name);
      }
    } else {
      try {
        if (action.body && action.kind === "review-thread" && action.replyTo)
          await github.replyToReviewComment(
            prNumber,
            action.replyTo,
            action.body,
          );
        else if (action.body) await github.comment(prNumber, action.body);
      } catch {
        continue;
      }
      records[action.id] = action.record;
      // resolvedAt tells a later round that a person, not the factory, reopened it.
      if (
        action.resolve &&
        (await github.resolveThread(action.id).then(
          () => true,
          () => false,
        ))
      ) {
        records[action.id] = { ...action.record, resolvedAt: round.now() };
        resolvedThisRound.push(action.id);
      }
    }
  }
  const saved =
    !Object.keys(records).length ||
    (await updateDispositions((current) =>
      mergeDispositions(current, records, {
        at: round.now(),
        run: round.runId,
      }),
    ));
  round.ledger.write("dispositions", {
    recorded: Object.keys(records),
    reruns,
    saved,
  });
  if (!saved)
    respond(
      "WAIT",
      "Feedback dispositions changed concurrently; re-read next round",
    );
  if (plan.acceptance.length || plan.implementation.length)
    respond("REPAIR", "Accepted feedback returns to its owner", {
      repair: makeRepair({
        acceptance: plan.acceptance,
        implementation: plan.implementation,
        source: "readiness",
      }),
      fingerprint: `feedback:${[...plan.acceptance, ...plan.implementation].join("|").slice(0, 300)}`,
    });
  if (reruns.requested.length || reruns.refused.length)
    respond(
      "WAIT",
      [
        reruns.requested.length
          ? `Requested a rerun of ${reruns.requested.join(", ")}; waiting for the new attempt`
          : "",
        reruns.refused.length
          ? `GitHub refused a rerun of ${reruns.refused.join(", ")}; Samson sees it again next round`
          : "",
      ]
        .filter(Boolean)
        .join("; "),
      { reruns },
    );
}

// GitHub recomputes mergeability after a resolution; a `blocked` read now
// could be stale and end the issue as a human review that is not needed.
const settling = resolutionWait(resolvedThisRound);
if (settling) finish(settling);

// 4. Fresh observations (top-level comments and review bodies included) and
// one readiness decision. The merge lane re-check uses the same observation.
const observe = async () => {
  const pr = await github.pull(prNumber);
  const [threads, reviews, comments, runs, statuses, protection, rules] =
    await Promise.all([
      github.reviewThreads(prNumber),
      github.reviews(prNumber),
      github.issueComments(prNumber),
      github.checkRuns(pr.head.sha),
      github.statuses(pr.head.sha),
      github.branchProtection(target),
      github.branchRules(target),
    ]);
  const dispositions =
    (await round.archon.get(feedbackName)).value?.dispositions ?? {};
  const factory = (await round.archon.get("core/factory")).value;
  const scope = (await round.archon.get("core/scope")).value;
  const current = (await workItem(round)).value;
  return {
    pr,
    decision: evaluateReadiness({
      workItem: current,
      installedPolicyRevision: policyRevision(round.paths).policyRevision,
      contextFingerprint: {
        recorded: current.brief?.contextFingerprint,
        current: round.ledger.read("context")?.fingerprint,
      },
      targetBranch: target,
      pr,
      rules,
      protection,
      checkRuns: runs,
      statuses,
      reviews,
      threads,
      dispositions,
      topLevelFeedback: topLevelFeedback({ comments, reviews }),
      comments,
      reviewProviders: providers,
      scope,
      factory,
    }),
  };
};
let { pr, decision } = await observe();
round.ledger.write("readiness-observation", {
  decision,
  head: pr.head.sha,
  mergeable: pr.mergeable,
  state: pr.mergeable_state,
});

// MERGED needs closeout evidence: on the target, and the issue closed.
const closeout = async (merged: any, by: string): Promise<Outcome> => {
  const compare = merged.merge_commit_sha
    ? await github.compare(merged.merge_commit_sha, target).catch(() => null)
    : null;
  let issue = await github.issue(round.issue);
  let result = closeoutDecision({
    pr: merged,
    issue,
    compare,
    targetBranch: target,
    issueNumber: round.issue,
    mergedBy: by,
  });
  if (result.shouldClose) {
    await github.closeIssue(round.issue).catch(() => null);
    issue = await github.issue(round.issue);
    result = closeoutDecision({
      pr: merged,
      issue,
      compare,
      targetBranch: target,
      issueNumber: round.issue,
      mergedBy: by,
    });
  }
  await checkpoint({
    pr: {
      ...value.pr,
      mergedAt: merged.merged_at,
      mergeCommit: merged.merge_commit_sha,
      mergedBy: by,
      onTarget: ["identical", "ahead"].includes(compare?.status),
      issueClosed: issue?.state === "closed",
    },
  });
  return {
    verdict: result.verdict,
    reason: result.reason,
    ledger: result.ledger,
  };
};
if (decision.verdict === "MERGED")
  finish(await closeout(pr, mergedBy(value, pr)));

// 5. Strict protection or a conflict, and no owner has work pending:
// integrate the base with an ordinary merge. The new head is recorded only
// after GitHub shows it; an integration that changed the candidate's own diff
// goes to the review-only route. A conflict is recorded against the
// candidate so an operator's pushed resolution can be adopted (step 1).
if (shouldIntegrate(decision)) {
  const before = value.head;
  const branch = value.branch;
  const base = await revParse(
    { git: round.git, cwd: round.where.repo },
    `origin/${target}`,
  );
  const storage = await checkFactoryStorage({ ...round, operation: "merge" });
  if (storage.ok !== true || storage.code !== "STORAGE_READY")
    finish(storageOutcome(storage));
  const merge = await runInIssueRepo(round, {
    command: ["git", "merge", "--no-edit", `origin/${target}`],
    timeoutMs: 10 * 60_000,
  });
  if (merge.status !== "passed") {
    const output = `${merge.stdout ?? ""}\n${merge.stderr ?? ""}`;
    await runInIssueRepo(round, {
      command: ["git", "merge", "--abort"],
      timeoutMs: 120_000,
    });
    const failure = baseIntegrationFailure({
      output,
      target,
      branch,
      head: before,
      base,
    });
    if (failure.conflict)
      await checkpoint({
        pr: { ...value.pr, conflict: { ...failure.conflict, at: round.now() } },
      });
    finish(failure);
  }
  const after = await revParse(
    { git: round.git, cwd: round.where.repo },
    "HEAD",
  );
  const oldDiff = await round.git.ok(
    ["diff", "--no-color", `${value.base}`, before],
    { cwd: round.where.repo, timeoutMs: 120_000 },
  );
  const newDiff = await round.git.ok(["diff", "--no-color", base, after], {
    cwd: round.where.repo,
    timeoutMs: 120_000,
  });
  const carried = oldDiff === newDiff;
  round.ledger.write("integrate-base", { before, after, base, carried });
  if (!carried) {
    // The integrated commit is the candidate the review route freezes again.
    await checkpoint({ head: after, base, reviews: null, final: null });
    finish(reviewAgain({ before, after, base }));
  }
  await checkpoint({
    pr: {
      ...value.pr,
      pending: {
        head: after,
        base,
        from: before,
        carried: true,
        at: round.now(),
      },
    },
  });
  const publication = await publishCandidate(round, {
    branch,
    candidate: after,
  });
  if (!publication.ok) {
    if (publication.repair) {
      // The integrated candidate failed the pre-push guard; its owner fixes it on top.
      await checkpoint({
        head: after,
        base,
        reviews: null,
        final: null,
        pr: { ...value.pr, pending: null },
      });
      respond("REPAIR", publication.reason, {
        repair: asRepair(publication.repair, "readiness"),
        fingerprint: publication.fingerprint,
      });
    }
    // The pending marker stays: the next round adopts the push if it landed.
    respond("BLOCKED", publication.reason, { blocked: publication.blocked });
  }
  await checkpoint({
    head: after,
    base,
    ...carryForward(value, after, before),
    pr: { ...value.pr, head: after, publishedAt: round.now(), pending: null },
  });
  respond(
    "WAIT",
    `Integrated ${target} at ${base.slice(0, 12)} and republished ${after.slice(0, 12)}; reviews carried forward`,
    { integrated: { before, after, base, carried: true } },
  );
}

// 6. One final merge lane for the whole factory, released before responding.
if (decision.verdict === "MERGE")
  finish(
    await withMergeLane(
      round.archon,
      { issue: round.issue, pr: prNumber, now: round.now() },
      async (): Promise<Outcome> => {
        ({ pr, decision } = await observe());
        if (decision.verdict !== "MERGE")
          return {
            verdict: decision.verdict === "PR_READY" ? "PR_READY" : "WAIT",
            reason:
              `Re-check before merge: ${decision.reasons.join("; ")}`.slice(
                0,
                1500,
              ),
          };
        const pending = value.pr?.mergeRequest;
        if (pending?.head === value.head && pending.status !== "refused")
          return {
            verdict: "BLOCKED",
            reason: "A previous merge request still needs reconciliation",
            ledger: {
              blocked: {
                code: "merge-unconfirmed",
                detail: `Request for ${pending.head} is ${pending.status ?? "unconfirmed"}`,
                recovery:
                  "Inspect the PR and reconcile the recorded merge request before any retry",
              },
            },
          };
        const request = { head: value.head, at: round.now(), run: round.runId };
        await checkpoint({
          pr: {
            ...value.pr,
            mergeRequest: { ...request, status: "requested" },
          },
        });
        const storage = await checkFactoryStorage({
          ...round,
          operation: "merge",
        });
        if (storage.ok !== true || storage.code !== "STORAGE_READY") {
          await checkpoint({
            pr: {
              ...value.pr,
              mergeRequest: { ...request, status: "refused" },
            },
          }).catch(() => null);
          return storageOutcome(storage);
        }
        let merged: {
          merged?: boolean;
          sha?: string;
          message?: string;
        } | null = null;
        let refusal: string | null = null;
        try {
          merged = await github.merge(prNumber, {
            sha: value.head,
            method: round.config.repository.mergeMethod,
            title: `${pr.title} (#${prNumber})`,
          });
        } catch (error) {
          if ((error as { outcome?: string })?.outcome === "refused")
            refusal = String((error as Error).message ?? error);
        }
        if (merged?.merged === false)
          refusal = merged.message ?? "GitHub did not merge the PR";
        if (refusal !== null) {
          await checkpoint({
            pr: {
              ...value.pr,
              mergeRequest: { ...request, status: "refused" },
            },
          });
          return {
            verdict: "BLOCKED",
            reason: `GitHub refused the merge: ${refusal.slice(0, 400)}`,
            ledger: {
              blocked: {
                code: "merge-refused",
                detail: refusal.slice(0, 1000),
              },
            },
          };
        }
        const mergeCommit =
          merged?.merged === true &&
          typeof merged.sha === "string" &&
          SHA.test(merged.sha)
            ? merged.sha
            : null;
        await checkpoint({
          pr: {
            ...value.pr,
            mergeRequest: {
              ...request,
              status: mergeCommit ? "confirmed" : "unknown",
              ...(mergeCommit ? { mergeCommit } : {}),
            },
          },
        });
        const after = await github.pull(prNumber);
        if (!after.merged)
          return {
            verdict: "BLOCKED",
            reason: "Merge outcome could not be confirmed",
            ledger: {
              blocked: {
                code: "merge-unconfirmed",
                detail: JSON.stringify(merged ?? {}).slice(0, 400),
                recovery: "Inspect the PR before any retry",
              },
            },
          };
        return closeout(after, mergedBy(value, after));
      },
    ),
  );

if (decision.verdict === "PR_READY") {
  const comments = await github.issueComments(prNumber);
  const note = `Factory readiness for \`${value.head}\`: **PR_READY**. ${decision.reasons.join(" ")}`;
  if (
    !comments.some(
      (comment: { body?: string }) =>
        comment.body?.includes(MARKER) &&
        comment.body.includes(value.head) &&
        comment.body.includes("PR_READY"),
    )
  )
    await github.comment(prNumber, `${note}\n\n${MARKER}`).catch(() => null);
}
finish(decisionOutcome(decision));
