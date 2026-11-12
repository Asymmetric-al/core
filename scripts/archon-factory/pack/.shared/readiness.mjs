// One live readiness decision, made by trusted code from fresh observations
// immediately before marking a PR ready or requesting a protected merge.
// Verdicts:
//   MERGE     every condition holds and merge is authorized now
//   PR_READY  every readiness condition holds; merge not authorized/permitted,
//             or a person must act (approval, standing change request)
//   WAIT      something is pending (checks, mergeability, a review provider,
//             feedback Samson has not dispositioned, a thread to resolve)
//   REPAIR    work for an owner: a failed check, an accepted defect not fixed
//             on this head, changed context, or a base integration (`integrate`)
//   BLOCKED   a condition the factory cannot fix by itself
import { reviewProviders as configuredProviders } from "./config.mjs";
import { publicationGate } from "../deliver/scripts/publish-logic.mjs";

const PASSING = new Set(["success", "neutral", "skipped"]);
const DISMISSALS = new Set(["rebut", "obsolete", "decline-nit"]);

// Every comment and reply the factory posts carries this marker, so its own
// words never count as feedback.
export const FACTORY_MARKER = "<!-- core-factory -->";

export function requiredChecksFromRules(rules, protection) {
  const required = new Map();
  for (const rule of rules ?? []) {
    if (rule.type !== "required_status_checks") continue;
    for (const check of rule.parameters?.required_status_checks ?? [])
      required.set(check.context, {
        context: check.context,
        appId: check.integration_id ?? null,
        strict: Boolean(rule.parameters?.strict_required_status_checks_policy),
      });
  }
  for (const check of protection?.required_status_checks?.checks ?? [])
    if (!required.has(check.context))
      required.set(check.context, {
        context: check.context,
        appId: check.app_id ?? null,
        strict: Boolean(protection.required_status_checks.strict),
      });
  return [...required.values()];
}

export function requiredApprovalsFromRules(rules, protection) {
  let count =
    protection?.required_pull_request_reviews
      ?.required_approving_review_count ?? 0;
  let codeOwners = Boolean(
    protection?.required_pull_request_reviews?.require_code_owner_reviews,
  );
  for (const rule of rules ?? []) {
    if (rule.type !== "pull_request") continue;
    count = Math.max(
      count,
      rule.parameters?.required_approving_review_count ?? 0,
    );
    codeOwners ||= Boolean(rule.parameters?.require_code_owner_review);
  }
  return { count, codeOwners };
}

const pinnedApp = (appId) => Number.isInteger(appId) && appId > 0;

function checkState(required, runs, statuses, head) {
  const byName = runs.filter(
    (run) => run.name === required.context && run.head_sha === head,
  );
  const candidates = pinnedApp(required.appId)
    ? byName.filter((run) => run.app?.id === required.appId)
    : byName;
  if (pinnedApp(required.appId) && byName.length && !candidates.length)
    return {
      state: "wrong-app",
      detail: `${required.context} reported by an unexpected app`,
    };
  if (candidates.length) {
    // The latest attempt wins; an older success never hides a newer rerun.
    const latest = [...candidates].sort(
      (a, b) =>
        Date.parse(b.started_at ?? 0) - Date.parse(a.started_at ?? 0) ||
        b.id - a.id,
    )[0];
    if (latest.status !== "completed")
      return { state: "pending", detail: required.context };
    if (PASSING.has(latest.conclusion))
      return { state: "passed", detail: required.context, runId: latest.id };
    return {
      state: "failed",
      detail: `${required.context}: ${latest.conclusion}`,
      runId: latest.id,
    };
  }
  // A commit status names no App, so it can never prove an App-pinned check.
  if (pinnedApp(required.appId))
    return { state: "missing", detail: required.context };
  const status = (statuses?.statuses ?? []).find(
    (item) => item.context === required.context,
  );
  if (statuses?.sha === head && status) {
    if (status.state === "success")
      return { state: "passed", detail: required.context };
    if (status.state === "pending")
      return { state: "pending", detail: required.context };
    return { state: "failed", detail: `${required.context}: ${status.state}` };
  }
  return { state: "missing", detail: required.context };
}

// --- Feedback identity ------------------------------------------------------

// The last comment someone other than the factory wrote in a thread. GitHub's
// `recent` page (last N comments) wins over the first page when present.
function threadComments(thread) {
  const nodes = new Map();
  for (const comment of [
    ...(thread.comments?.nodes ?? []),
    ...(thread.recent?.nodes ?? []),
  ])
    if (comment) nodes.set(comment.id ?? comment, comment);
  return [...nodes.values()];
}

export function threadLastReply(thread, marker = FACTORY_MARKER) {
  const first = thread.comments?.nodes ?? [];
  const recent = thread.recent?.nodes ?? [];
  const gap =
    first.length >= 50 &&
    recent.length &&
    !recent.some((comment) =>
      first.some((earlier) => earlier?.id && earlier.id === comment?.id),
    );
  if (
    gap &&
    recent.every(
      (comment) =>
        typeof comment?.body === "string" && comment.body.includes(marker),
    )
  )
    return null;
  const nodes = threadComments(thread);
  for (let index = nodes.length - 1; index >= 0; index -= 1)
    if (
      typeof nodes[index].body !== "string" ||
      !nodes[index].body.includes(marker)
    )
      return nodes[index];
  return null;
}

export function threadLastComment(thread, marker = FACTORY_MARKER) {
  return threadLastReply(thread, marker)?.id ?? null;
}

export function threadIdentity(thread, marker = FACTORY_MARKER) {
  const last = threadLastReply(thread, marker);
  const available = Boolean(last?.id && typeof last.body === "string");
  return {
    id: thread.id,
    lastComment: last?.id ?? null,
    ...(!available ? { contentUnavailable: true } : {}),
  };
}

// A disposition covers an item only as the item stood when Samson judged it:
// a thread with a newer reply, or a comment edited since, needs a new one.
export function currentDisposition(dispositions, item) {
  if (item.contentUnavailable) return null;
  const record = dispositions?.[item.id];
  if (!record) return null;
  if (
    "lastComment" in item &&
    (record.lastComment ?? null) !== (item.lastComment ?? null)
  )
    return null;
  if (item.updatedAt && record.updatedAt !== item.updatedAt) return null;
  return record;
}

// A thread's disposition, and whether a person reopened the thread after the
// factory resolved it on that disposition (`resolvedAt`). Unresolving is
// disagreement even without a reply, so a reopened thread needs a new one.
export function threadDisposition(
  dispositions,
  thread,
  marker = FACTORY_MARKER,
) {
  const record = currentDisposition(
    dispositions,
    threadIdentity(thread, marker),
  );
  const reopened = Boolean(record && !thread.isResolved && record.resolvedAt);
  return { record: reopened ? null : record, reopened };
}

export function topLevelFeedback({
  comments = [],
  reviews = [],
  marker = FACTORY_MARKER,
}) {
  const items = [];
  for (const review of reviews)
    if (review.body?.trim() && !review.body.includes(marker))
      items.push({ id: `review-${review.id}`, url: review.html_url });
  // A person's edit re-surfaces their comment; a bot's self-updating status
  // comment (deploy previews, summaries) is judged once.
  for (const comment of comments)
    if (!comment.body?.includes(marker))
      items.push(
        comment.user?.type === "Bot"
          ? { id: `comment-${comment.id}`, url: comment.html_url }
          : {
              id: `comment-${comment.id}`,
              url: comment.html_url,
              updatedAt: comment.updated_at ?? comment.created_at ?? null,
            },
      );
  return items;
}

// A thread a person resolved without the factory's judgment needs none. A
// thread the factory judged stays feedback after resolution: a newer reply
// makes its disposition stale and the thread needs one again.
const settledByResolution = (thread, dispositions) =>
  thread.isResolved && !dispositions?.[thread.id];

// The heads whose own change is this candidate's: the head itself and the
// reviewed head a base integration carried forward. A fix accepted at one of
// them is not on this head.
export function unfixedHeads(workItem) {
  const heads = new Set([workItem?.head, workItem?.final?.carriedFrom]);
  for (const review of Object.values(workItem?.reviews ?? {}))
    heads.add(review?.carriedFrom);
  heads.delete(undefined);
  heads.delete(null);
  return heads;
}

export function feedbackFixPending(disposition, workItem) {
  if (disposition.action === "fix-acceptance") {
    const revision = workItem?.acceptance?.revision;
    return (
      !disposition.acceptanceRevision ||
      !revision ||
      disposition.acceptanceRevision === revision ||
      publicationGate({ value: workItem, candidate: workItem.head }).length > 0
    );
  }
  return (
    disposition.action?.startsWith("fix-") &&
    (!disposition.head || unfixedHeads(workItem).has(disposition.head))
  );
}

// Everything that still needs Samson's disposition, outdated threads included
// (GitHub's conversation-resolution rule counts them). Failed-check logs are
// added by the caller.
export function feedbackItems({
  threads = [],
  reviews = [],
  comments = [],
  failedRuns = [],
  dispositions = {},
  marker = FACTORY_MARKER,
}) {
  const items = [];
  for (const thread of threads) {
    if (settledByResolution(thread, dispositions)) continue;
    const { record, reopened } = threadDisposition(
      dispositions,
      thread,
      marker,
    );
    if (record) continue;
    const nodes = threadComments(thread);
    const identity = threadIdentity(thread, marker);
    const last = threadLastReply(thread, marker);
    items.push({
      ...identity,
      kind: "review-thread",
      path: thread.path,
      line: thread.line,
      outdated: Boolean(thread.isOutdated),
      resolved: Boolean(thread.isResolved),
      ...(reopened ? { reopened: true } : {}),
      url: nodes[0]?.url,
      replyTo: nodes[0]?.databaseId ?? null,
      lastReply: identity.contentUnavailable
        ? null
        : { id: last.id, author: last.author?.login ?? "?", body: last.body },
      comments: nodes
        .filter(
          (comment) =>
            comment.id !== identity.lastComment &&
            !comment.body?.includes(marker),
        )
        .map(
          (comment) =>
            `${comment.author?.login ?? "?"}: ${comment.body ?? "[body unavailable]"}`,
        )
        .join("\n---\n")
        .slice(0, 4000),
    });
  }
  const byId = new Map(
    reviews.map((review) => [`review-${review.id}`, review]),
  );
  const commentsById = new Map(
    comments.map((comment) => [`comment-${comment.id}`, comment]),
  );
  for (const item of topLevelFeedback({ comments, reviews, marker })) {
    if (currentDisposition(dispositions, item)) continue;
    const review = byId.get(item.id);
    if (review) {
      items.push({
        ...item,
        kind: "review-body",
        author: review.user?.login,
        state: review.state,
        commit: review.commit_id,
        body: review.body.slice(0, 4000),
      });
      continue;
    }
    const comment = commentsById.get(item.id);
    items.push({
      ...item,
      kind: "comment",
      author: comment.user?.login,
      body: (comment.body ?? "").slice(0, 4000),
    });
  }
  for (const run of failedRuns) {
    const id = `check-${run.id}`;
    if (dispositions[id]) continue;
    items.push({
      id,
      kind: "failed-check",
      name: run.name,
      conclusion: run.conclusion,
      url: run.html_url,
    });
  }
  return items;
}

// --- Human reviews, providers and authority ---------------------------------

// Each person's latest decisive review across every head (GitHub returns
// reviews oldest first). COMMENTED leaves a standing decision in force; a
// change request stands until that person approves or it is DISMISSED. Only
// an approval of this head counts toward required approvals.
export function reviewStanding(reviews, head) {
  const latest = new Map();
  for (const review of reviews ?? []) {
    const login = review.user?.login;
    if (!login || review.state === "COMMENTED" || review.state === "PENDING")
      continue;
    latest.set(login, review);
  }
  const changesRequested = [];
  let approved = 0;
  for (const [login, review] of latest) {
    if (review.state === "CHANGES_REQUESTED") changesRequested.push(login);
    else if (review.state === "APPROVED" && review.commit_id === head)
      approved += 1;
  }
  return { changesRequested, approved };
}

export function reviewProvidersFrom(config) {
  const raw = config ? configuredProviders(config) : null;
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) throw new Error("reviewProviders must be a list");
  return raw.map((provider, index) => {
    const where = `reviewProviders[${index}]`;
    if (
      !provider ||
      typeof provider.login !== "string" ||
      !provider.login.trim()
    )
      throw new Error(`${where} needs a login`);
    if (
      provider.required !== undefined &&
      typeof provider.required !== "boolean"
    )
      throw new Error(`${where}.required must be true or false`);
    const skipMarkers = provider.skipMarkers ?? [];
    if (
      !Array.isArray(skipMarkers) ||
      skipMarkers.some((marker) => typeof marker !== "string" || !marker.trim())
    )
      throw new Error(`${where}.skipMarkers must be non-empty strings`);
    if (
      provider.appSlug !== undefined &&
      (typeof provider.appSlug !== "string" || !provider.appSlug.trim())
    )
      throw new Error(`${where}.appSlug must be a non-empty string`);
    if (
      provider.coverage !== undefined &&
      provider.coverage !== "head" &&
      provider.coverage !== "once"
    )
      throw new Error(`${where}.coverage must be "head" or "once"`);
    return {
      login: provider.login,
      required: provider.required !== false,
      skipMarkers,
      ...(provider.appSlug ? { appSlug: provider.appSlug } : {}),
      ...(provider.coverage ? { coverage: provider.coverage } : {}),
    };
  });
}

// A required provider is covered by a review of this head, or, when its GitHub
// App is configured, by that App's check runs on this head once every one of
// them has completed (its findings arrive as threads and comments, which are
// dispositioned separately). A provider configured as coverage "once" reviews
// a pull request only when it opens; an earlier review covers it and is
// reported. A skip marker it posted after this head was published ends the
// wait but is never coverage.
export function providerCoverage({
  providers = [],
  reviews = [],
  comments = [],
  checkRuns = [],
  head,
  publishedAt,
}) {
  const pending = [];
  const skipped = [];
  const earlier = [];
  const since = Date.parse(publishedAt ?? "");
  for (const provider of providers) {
    if (!provider.required) continue;
    if (
      reviews.some(
        (review) =>
          review.user?.login === provider.login && review.commit_id === head,
      )
    )
      continue;
    // The provider's own check runs on this head: all finished and all
    // successful is a review of this head. Finished any other way (skipped,
    // neutral, cancelled, failed) means the provider did not review it.
    const runs = provider.appSlug
      ? checkRuns.filter(
          (run) => run.app?.slug === provider.appSlug && run.head_sha === head,
        )
      : [];
    const finished =
      runs.length > 0 && runs.every((run) => run.status === "completed");
    if (finished && runs.every((run) => run.conclusion === "success")) continue;
    if (
      provider.coverage === "once" &&
      reviews.some((review) => review.user?.login === provider.login)
    ) {
      earlier.push(provider.login);
      continue;
    }
    if (finished) {
      skipped.push(provider.login);
      continue;
    }
    const skip =
      Number.isFinite(since) &&
      comments.some(
        (comment) =>
          comment.user?.login === provider.login &&
          (provider.skipMarkers ?? []).some((marker) =>
            comment.body?.includes(marker),
          ) &&
          Date.parse(comment.updated_at ?? comment.created_at ?? "") >= since,
      );
    if (skip) skipped.push(provider.login);
    else
      pending.push(
        `review provider ${provider.login} has not reviewed this head`,
      );
  }
  return { pending, skipped, earlier };
}

// Merge authority comes from the scope as it stands now, not at admission.
export function scopeMergeAuthority(scope, issue) {
  if (!scope || !Array.isArray(scope.issues) || !scope.issues.includes(issue))
    return {
      ok: false,
      reason: `The current scope no longer includes issue #${issue}`,
    };
  const endState = scope.endStates?.[issue] ?? scope.endState;
  if (endState !== "MERGED")
    return {
      ok: false,
      reason: `The current scope's end state for issue #${issue} is ${endState ?? "unset"}`,
    };
  return { ok: true };
}

// --- The decision -------------------------------------------------------------

export function evaluateReadiness(input) {
  const {
    workItem,
    installedPolicyRevision,
    contextFingerprint,
    targetBranch,
    pr,
    rules,
    protection,
    checkRuns,
    statuses,
    reviews,
    threads,
    dispositions,
    topLevelFeedback: feedback,
    comments = [],
    reviewProviders = [],
    scope,
    factory,
    requiredBots = [],
  } = input;
  const reasons = [];
  const pending = [];
  const repairs = [];
  const blocked = [];
  const acceptance = [];
  const implementation = [];
  let integrate = false;
  const repair = (text, owner = "implementation") => {
    repairs.push(text);
    (owner === "acceptance" ? acceptance : implementation).push(text);
  };
  const head = workItem.head;
  if (!pr) return { verdict: "BLOCKED", reasons: ["No pull request recorded"] };
  if (pr.merged)
    return {
      verdict: "MERGED",
      reasons: ["GitHub reports the PR merged"],
      mergeCommit: pr.merge_commit_sha,
    };
  if (pr.state !== "open") blocked.push("The pull request is not open");
  if (pr.head?.sha !== head)
    blocked.push(
      `PR head ${pr.head?.sha} is not the reviewed candidate ${head}`,
    );
  if (workItem.branch && pr.head?.ref !== workItem.branch)
    blocked.push(
      `PR branch ${pr.head?.ref} is not the issue branch ${workItem.branch}`,
    );
  if (pr.base?.ref !== targetBranch)
    blocked.push(`PR targets ${pr.base?.ref}, not ${targetBranch}`);
  if (workItem.assignment.policyRevision !== installedPolicyRevision)
    blocked.push("Installed factory policy changed after admission");
  if (
    contextFingerprint &&
    contextFingerprint.recorded !== contextFingerprint.current
  )
    repair(
      "Governing issue context changed; acceptance must be refreshed",
      "acceptance",
    );
  const final = workItem.final;
  if (!final || final.decision !== "PASS" || final.candidate !== head)
    blocked.push("Ezra's final acceptance is not PASS for this candidate");
  if (final && workItem.acceptance?.revision !== final.acceptanceRevision)
    blocked.push("Final acceptance used a different acceptance revision");
  for (const reviewer of ["micaiah", "luke"]) {
    const review = workItem.reviews?.[reviewer];
    if (!review || review.candidate !== head || review.decision !== "CLEAR")
      blocked.push(`${reviewer} review is not CLEAR for this candidate`);
  }
  const required = requiredChecksFromRules(rules, protection);
  for (const check of required) {
    const state = checkState(check, checkRuns ?? [], statuses, head);
    if (state.state === "pending" || state.state === "missing")
      pending.push(`check ${state.detail} ${state.state}`);
    else if (state.state === "wrong-app") blocked.push(state.detail);
    else if (state.state === "failed") {
      const disposition = state.runId
        ? dispositions?.[`check-${state.runId}`]
        : null;
      if (disposition?.action === "rerun-flake")
        pending.push(`check ${state.detail} rerun requested`);
      else if (DISMISSALS.has(disposition?.action))
        blocked.push(
          `Required check ${state.detail} was dispositioned ${disposition.action}; a required check must pass`,
        );
      else repair(`check ${state.detail}`);
    }
  }
  if (
    pr.mergeable === null ||
    pr.mergeable === undefined ||
    pr.mergeable_state === "unknown"
  )
    pending.push("GitHub mergeability is still being computed");
  else if (pr.mergeable === false || pr.mergeable_state === "dirty") {
    repairs.push("The PR conflicts with its base");
    integrate = true;
  } else if (
    pr.mergeable_state === "behind" &&
    required.some((check) => check.strict)
  ) {
    repairs.push(
      "Strict protection requires updating the branch with its base",
    );
    integrate = true;
  }
  // Every unresolved thread counts, outdated ones too: new feedback goes to
  // Samson, an accepted defect not fixed on this head (or on the reviewed head
  // it was carried from) goes to its owner, and a dispositioned thread waits
  // for the factory to resolve it. A resolved thread the factory judged stays
  // feedback: a reply after its disposition needs a new one, and so does a
  // thread a person reopened after the factory resolved it.
  for (const thread of threads ?? []) {
    if (settledByResolution(thread, dispositions)) continue;
    const link = thread.comments?.nodes?.[0]?.url ?? thread.id;
    const disposition = threadDisposition(dispositions, thread).record;
    if (!disposition) pending.push(`Review thread ${link} awaits disposition`);
    else if (feedbackFixPending(disposition, workItem))
      repair(
        `Review thread ${link} was accepted as a defect and is not fixed on this head: ${disposition.reason ?? ""}`.trim(),
        disposition.action === "fix-acceptance"
          ? "acceptance"
          : "implementation",
      );
    else if (!thread.isResolved)
      pending.push(
        `Review thread ${link} is dispositioned (${disposition.action}) but not resolved`,
      );
  }
  for (const item of feedback ?? []) {
    const disposition = currentDisposition(dispositions, item);
    if (!disposition)
      pending.push(`New feedback ${item.url ?? item.id} awaits disposition`);
    else if (feedbackFixPending(disposition, workItem))
      repair(
        `Feedback ${item.url ?? item.id} was accepted as a defect and is not fixed on this head: ${disposition.reason ?? ""}`.trim(),
        disposition.action === "fix-acceptance"
          ? "acceptance"
          : "implementation",
      );
  }
  const coverage = providerCoverage({
    providers: [
      ...reviewProviders,
      ...requiredBots.map((login) => ({
        login,
        required: true,
        skipMarkers: [],
      })),
    ],
    reviews: reviews ?? [],
    comments,
    checkRuns: checkRuns ?? [],
    head,
    publishedAt: workItem.pr?.publishedAt,
  });
  pending.push(...coverage.pending);
  if (blocked.length)
    return { verdict: "BLOCKED", reasons: blocked, pending, repairs };
  if (repairs.length) {
    const result = {
      verdict: "REPAIR",
      reasons: repairs,
      pending,
      repair: { acceptance, implementation, source: "readiness" },
    };
    // A base integration moves the head without fixing anything, so it runs
    // only when no owner has work pending; otherwise the owner goes first.
    if (integrate && !acceptance.length && !implementation.length)
      result.integrate = true;
    return result;
  }
  if (pending.length) return { verdict: "WAIT", reasons: pending };
  reasons.push(`All ${required.length} required checks passed on ${head}`);
  const approvals = requiredApprovalsFromRules(rules, protection);
  const standing = reviewStanding(reviews, head);
  // GitHub's own `blocked` state means a protection rule (usually a required
  // review) is unmet; unresolved threads were already handled above.
  const approvalsPending =
    standing.approved < approvals.count ||
    pr.mergeable_state === "blocked" ||
    (approvals.codeOwners && pr.mergeable_state !== "clean");
  const humanReviewPending =
    approvalsPending ||
    standing.changesRequested.length > 0 ||
    coverage.skipped.length > 0;
  for (const login of coverage.earlier)
    reasons.push(
      `Review provider ${login} reviews each pull request once and reviewed an earlier head`,
    );
  const authority = scopeMergeAuthority(scope, workItem.issue);
  const mergeAuthorized =
    workItem.assignment.endState === "MERGED" &&
    authority.ok &&
    factory?.mode === "run" &&
    !factory?.mergeHold &&
    workItem.control === "run";
  if (!mergeAuthorized || humanReviewPending) {
    if (approvalsPending)
      reasons.push(
        `Required human review pending (${standing.approved}/${approvals.count}${approvals.codeOwners ? ", code owners" : ""})`,
      );
    for (const login of standing.changesRequested)
      reasons.push(
        `Change request from ${login} stands until ${login} approves or it is dismissed`,
      );
    for (const login of coverage.skipped)
      reasons.push(
        `Review provider ${login} skipped this head; a person must confirm review coverage`,
      );
    if (workItem.assignment.endState !== "MERGED")
      reasons.push("Assignment end state is PR_READY");
    else if (!authority.ok) reasons.push(authority.reason);
    if (factory?.mergeHold) reasons.push("Operator merge hold is active");
    return { verdict: "PR_READY", reasons, humanReviewPending };
  }
  return { verdict: "MERGE", reasons };
}
