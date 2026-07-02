#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const DEFAULT_REPO = "Asymmetric-al/core";
const DEFAULT_GRACE_MINUTES = 20;
const SUPPORTED_BASE_REFS = new Set(["develop", "production"]);

export const AUTOMATION_LABELS = Object.freeze({
  signalsPending: "automation:signals-pending",
  ciSettled: "automation:ci-settled",
  ciFailed: "automation:ci-failed",
  greptileSettled: "automation:greptile-settled",
  bugbotSettled: "automation:bugbot-settled",
  securitySettled: "automation:security-settled",
  securityFailed: "automation:security-failed",
  reviewFindings: "automation:review-findings",
  signalTimeout: "automation:signal-timeout",
  prIntakeReady: "automation:pr-intake-ready",
});

export const AUTOMATION_LABEL_DEFINITIONS = Object.freeze([
  {
    name: AUTOMATION_LABELS.signalsPending,
    color: "D97706",
    description: "Waiting for PR automation prerequisite signals.",
  },
  {
    name: AUTOMATION_LABELS.ciSettled,
    color: "0E8A16",
    description: "Required PR CI checks have reached a terminal state.",
  },
  {
    name: AUTOMATION_LABELS.ciFailed,
    color: "B60205",
    description: "At least one required PR CI check failed.",
  },
  {
    name: AUTOMATION_LABELS.greptileSettled,
    color: "5319E7",
    description: "Greptile review signal has settled or timed out.",
  },
  {
    name: AUTOMATION_LABELS.bugbotSettled,
    color: "5319E7",
    description: "Cursor Bugbot signal has settled or timed out.",
  },
  {
    name: AUTOMATION_LABELS.securitySettled,
    color: "0366D6",
    description: "Cursor Security Reviewer signal has settled or timed out.",
  },
  {
    name: AUTOMATION_LABELS.securityFailed,
    color: "B60205",
    description: "Security reviewer failed, found issues, or timed out.",
  },
  {
    name: AUTOMATION_LABELS.reviewFindings,
    color: "FBCA04",
    description: "Automated review findings are present.",
  },
  {
    name: AUTOMATION_LABELS.signalTimeout,
    color: "D93F0B",
    description: "An expected PR automation signal timed out.",
  },
  {
    name: AUTOMATION_LABELS.prIntakeReady,
    color: "0E8A16",
    description: "Settled signals are ready for the PR Intake Coordinator.",
  },
]);

const ALL_AUTOMATION_LABELS = Object.freeze(
  AUTOMATION_LABEL_DEFINITIONS.map((label) => label.name),
);

const REQUIRED_CHECKS_BY_BASE = Object.freeze({
  develop: Object.freeze(["ci-gate", "integration-gate"]),
  production: Object.freeze([
    "release-source-gate",
    "ci-gate",
    "integration-gate",
    "e2e-gate",
  ]),
});

const RESET_EVENTS = new Set([
  "opened",
  "reopened",
  "synchronize",
  "ready_for_review",
]);

export function requiredChecksForBase(baseRef) {
  return [...(REQUIRED_CHECKS_BY_BASE[baseRef] ?? [])];
}

function unique(values) {
  return [...new Set(values)];
}

function normalizeLabelSet(labels) {
  return new Set(
    labels
      .map((label) => (typeof label === "string" ? label : label?.name))
      .filter((label) => typeof label === "string" && label.length > 0),
  );
}

function isResetEvent(context) {
  return (
    context.eventName === "pull_request" &&
    RESET_EVENTS.has(context.eventAction)
  );
}

function parseTime(value) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function hasTimedOut({ now, signalStartedAt, graceMinutes }) {
  const nowTimestamp = parseTime(now);
  const signalTimestamp = parseTime(signalStartedAt);
  const minutes =
    typeof graceMinutes === "number" ? graceMinutes : DEFAULT_GRACE_MINUTES;

  if (nowTimestamp === null || signalTimestamp === null) return false;

  return nowTimestamp - signalTimestamp >= minutes * 60 * 1000;
}

function textFrom(value) {
  if (!value) return "";

  if (typeof value === "string") return value;

  return [value.body, value.title, value.summary, value.text]
    .filter((item) => typeof item === "string")
    .join("\n");
}

function checkRunText(checkRun) {
  return [checkRun?.name, textFrom(checkRun?.output)]
    .filter((item) => typeof item === "string")
    .join("\n");
}

function actorLogin(item) {
  return item?.user?.login ?? item?.author?.login ?? "";
}

function itemTimestamp(item) {
  return (
    parseTime(item?.created_at) ??
    parseTime(item?.createdAt) ??
    parseTime(item?.submitted_at) ??
    parseTime(item?.submittedAt) ??
    parseTime(item?.updated_at) ??
    parseTime(item?.updatedAt)
  );
}

function isCurrentSignalItem(context, item) {
  const signalTimestamp = parseTime(context.pr?.signalStartedAt);
  const timestamp = itemTimestamp(item);

  if (signalTimestamp === null || timestamp === null) return true;

  return timestamp >= signalTimestamp;
}

function bodyTextItems(items) {
  return items.map((item) => textFrom(item)).filter((body) => body.length > 0);
}

function collectBotItems(context, predicate) {
  const allItems = [
    ...(context.reviews ?? []),
    ...(context.reviewComments ?? []),
    ...(context.issueComments ?? []),
  ];

  return allItems.filter(
    (item) =>
      isCurrentSignalItem(context, item) &&
      predicate(actorLogin(item), textFrom(item)),
  );
}

function isIntakeSummaryBody(body) {
  return (
    body.includes("<!-- core-pr-intake-coordinator -->") ||
    /no comments found by intake/i.test(body) ||
    /PR Intake Snapshot/i.test(body)
  );
}

function isCursorAutomationActor(login) {
  return login.toLowerCase().includes("cursor");
}

function checkRunDate(checkRun) {
  return (
    parseTime(checkRun?.completedAt) ??
    parseTime(checkRun?.completed_at) ??
    parseTime(checkRun?.startedAt) ??
    parseTime(checkRun?.started_at) ??
    parseTime(checkRun?.updatedAt) ??
    parseTime(checkRun?.updated_at) ??
    0
  );
}

function latestMatchingCheckRun(checkRuns, predicate) {
  const matches = (checkRuns ?? []).filter(predicate);
  if (matches.length === 0) return null;

  return matches.reduce((latest, current) =>
    checkRunDate(current) >= checkRunDate(latest) ? current : latest,
  );
}

function checkName(checkRun) {
  return String(checkRun?.name ?? "");
}

function checkAppName(checkRun) {
  return String(checkRun?.app?.name ?? "");
}

function isCompleted(checkRun) {
  return checkRun?.status === "completed" || checkRun?.status === "COMPLETED";
}

function evaluateRequiredChecks(context) {
  const requiredChecks = requiredChecksForBase(context.pr?.baseRef);
  const results = requiredChecks.map((name) => {
    const checkRun = latestMatchingCheckRun(
      context.checkRuns,
      (candidate) => checkName(candidate) === name,
    );

    if (!checkRun || !isCompleted(checkRun)) {
      return { name, state: "pending" };
    }

    if (
      checkRun.conclusion === "success" ||
      checkRun.conclusion === "SUCCESS"
    ) {
      return { name, state: "pass" };
    }

    return {
      name,
      state: "fail",
      conclusion: checkRun.conclusion ?? "unknown",
    };
  });
  const settled =
    results.length > 0 && results.every((result) => result.state !== "pending");
  const failed = settled && results.some((result) => result.state === "fail");

  return { requiredChecks, results, settled, failed };
}

function evaluateGreptile(context, timedOut) {
  const checkRun = latestMatchingCheckRun(context.checkRuns, (candidate) => {
    const name = checkName(candidate).toLowerCase();
    const app = checkAppName(candidate).toLowerCase();
    return name.includes("greptile") || app.includes("greptile");
  });
  const botItems = collectBotItems(context, (login, body) => {
    const normalizedLogin = login.toLowerCase();
    return normalizedLogin.includes("greptile") && !isIntakeSummaryBody(body);
  });
  const bodies = bodyTextItems(botItems);
  const observed = Boolean(checkRun) || botItems.length > 0;
  const settled = observed || timedOut;
  const hasInlineFinding = (context.reviewComments ?? []).some(
    (item) =>
      isCurrentSignalItem(context, item) &&
      actorLogin(item).toLowerCase().includes("greptile"),
  );
  const findings =
    hasInlineFinding ||
    bodies.some((body) =>
      /\b(P[0-3]|findings?\s+present|changes?\s+requested|safe\s+to\s+merge\s+after\s+fixing)\b/i.test(
        body,
      ),
    );

  return {
    observed,
    settled,
    timedOut: !observed && timedOut,
    findings,
  };
}

function evaluateBugbot(context, timedOut) {
  const checkRun = latestMatchingCheckRun(context.checkRuns, (candidate) =>
    checkName(candidate).toLowerCase().includes("bugbot"),
  );
  const botItems = collectBotItems(
    context,
    (login, body) =>
      isCursorAutomationActor(login) &&
      /bugbot/i.test(body) &&
      !isIntakeSummaryBody(body),
  );
  const bodies = bodyTextItems(botItems);
  const observed = Boolean(checkRun) || botItems.length > 0;
  const settled = observed || timedOut;
  const findings =
    (checkRun && checkRun.conclusion && checkRun.conclusion !== "success") ||
    bodies.some((body) =>
      /\b(P[0-3]|bug|finding|issue|regression|failure)\b/i.test(body),
    );

  return {
    observed,
    settled,
    timedOut: !observed && timedOut,
    findings: Boolean(findings),
  };
}

function evaluateSecurity(context, timedOut) {
  const checkRun = latestMatchingCheckRun(context.checkRuns, (candidate) => {
    const name = checkName(candidate).toLowerCase();
    return (
      name.includes("cursor security") || name.includes("security reviewer")
    );
  });
  const botItems = collectBotItems(
    context,
    (login, body) =>
      isCursorAutomationActor(login) &&
      /security reviewer|security review/i.test(body) &&
      !isIntakeSummaryBody(body),
  );
  const bodies = bodyTextItems(botItems);
  const observed = Boolean(checkRun) || botItems.length > 0;
  const completed = !checkRun || isCompleted(checkRun);
  const settled = (observed && completed) || timedOut;
  const conclusion = String(checkRun?.conclusion ?? "").toLowerCase();
  const runText = checkRunText(checkRun);
  const failedToStart =
    /failed to start|hard limit|unavailable|timed out|timeout/i.test(runText);
  const findingText = [...bodies, runText].some((body) =>
    /\b(P[0-3]|finding|vulnerability|injection|leak|secret|exploit)\b/i.test(
      body,
    ),
  );
  const failed =
    (!observed && timedOut) ||
    ["failure", "cancelled", "timed_out", "action_required"].includes(
      conclusion,
    ) ||
    (conclusion === "neutral" && failedToStart) ||
    findingText;

  return {
    observed,
    settled,
    timedOut: !observed && timedOut,
    failed: Boolean(failed),
  };
}

function diffLabels({ currentLabels, targetLabels }) {
  const target = new Set(targetLabels);
  const labelsToAdd = [...target].filter((label) => !currentLabels.has(label));
  const labelsToRemove = ALL_AUTOMATION_LABELS.filter(
    (label) => currentLabels.has(label) && !target.has(label),
  );

  return { labelsToAdd, labelsToRemove };
}

export function buildSignalDecision(context) {
  const currentLabels = normalizeLabelSet(context.pr?.labels ?? []);

  if (isResetEvent(context)) {
    return {
      readyForIntake: false,
      targetLabels: [AUTOMATION_LABELS.signalsPending],
      labelsToAdd: currentLabels.has(AUTOMATION_LABELS.signalsPending)
        ? []
        : [AUTOMATION_LABELS.signalsPending],
      labelsToRemove: ALL_AUTOMATION_LABELS.filter(
        (label) =>
          label !== AUTOMATION_LABELS.signalsPending &&
          currentLabels.has(label),
      ),
      ci: evaluateRequiredChecks(context),
      greptile: {
        observed: false,
        settled: false,
        timedOut: false,
        findings: false,
      },
      bugbot: {
        observed: false,
        settled: false,
        timedOut: false,
        findings: false,
      },
      security: {
        observed: false,
        settled: false,
        timedOut: false,
        failed: false,
      },
      timedOut: false,
      reason: "reset event",
    };
  }

  const timedOut = hasTimedOut({
    now: context.now,
    signalStartedAt: context.pr?.signalStartedAt,
    graceMinutes: context.graceMinutes,
  });
  const ci = evaluateRequiredChecks(context);
  const greptile = evaluateGreptile(context, timedOut);
  const bugbot = evaluateBugbot(context, timedOut);
  const security = evaluateSecurity(context, timedOut);
  const allSignalsSettled =
    ci.settled && greptile.settled && bugbot.settled && security.settled;
  const targetLabels = [];

  if (!allSignalsSettled) {
    targetLabels.push(AUTOMATION_LABELS.signalsPending);
  }

  if (ci.settled) targetLabels.push(AUTOMATION_LABELS.ciSettled);
  if (ci.failed) targetLabels.push(AUTOMATION_LABELS.ciFailed);
  if (greptile.settled) targetLabels.push(AUTOMATION_LABELS.greptileSettled);
  if (bugbot.settled) targetLabels.push(AUTOMATION_LABELS.bugbotSettled);
  if (security.settled) targetLabels.push(AUTOMATION_LABELS.securitySettled);
  if (security.failed) targetLabels.push(AUTOMATION_LABELS.securityFailed);
  if (greptile.findings || bugbot.findings) {
    targetLabels.push(AUTOMATION_LABELS.reviewFindings);
  }
  if (greptile.timedOut || bugbot.timedOut || security.timedOut) {
    targetLabels.push(AUTOMATION_LABELS.signalTimeout);
  }
  if (allSignalsSettled) targetLabels.push(AUTOMATION_LABELS.prIntakeReady);

  const { labelsToAdd, labelsToRemove } = diffLabels({
    currentLabels,
    targetLabels: unique(targetLabels),
  });

  return {
    readyForIntake: allSignalsSettled,
    targetLabels: unique(targetLabels),
    labelsToAdd,
    labelsToRemove,
    ci,
    greptile,
    bugbot,
    security,
    timedOut,
    reason: allSignalsSettled ? "signals settled" : "signals pending",
  };
}

function parseArgs(argv) {
  const args = {
    repo: process.env.GITHUB_REPOSITORY || DEFAULT_REPO,
    prNumber: "",
    eventName: process.env.GITHUB_EVENT_NAME || "",
    eventAction: process.env.GITHUB_EVENT_ACTION || "",
    eventLabel: process.env.GITHUB_EVENT_LABEL || "",
    graceMinutes: Number(
      process.env.PR_SIGNAL_GRACE_MINUTES || DEFAULT_GRACE_MINUTES,
    ),
    dryRun: false,
    json: false,
    allOpen: false,
    ensureLabelsOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo") {
      args.repo = argv.at(index + 1) ?? args.repo;
      index += 1;
    } else if (arg === "--pr-number") {
      args.prNumber = argv.at(index + 1) ?? args.prNumber;
      index += 1;
    } else if (arg === "--event-name") {
      args.eventName = argv.at(index + 1) ?? args.eventName;
      index += 1;
    } else if (arg === "--event-action") {
      args.eventAction = argv.at(index + 1) ?? args.eventAction;
      index += 1;
    } else if (arg === "--event-label") {
      args.eventLabel = argv.at(index + 1) ?? args.eventLabel;
      index += 1;
    } else if (arg === "--grace-minutes") {
      args.graceMinutes = Number(argv.at(index + 1) ?? args.graceMinutes);
      index += 1;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg === "--all-open") {
      args.allOpen = true;
    } else if (arg === "--ensure-labels-only") {
      args.ensureLabelsOnly = true;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    }
  }

  if (!Number.isFinite(args.graceMinutes) || args.graceMinutes < 1) {
    args.graceMinutes = DEFAULT_GRACE_MINUTES;
  }

  return args;
}

function usage() {
  return `Usage: node scripts/github/pr-signal-coordinator.mjs [options]

Options:
  --repo <owner/repo>       Repository. Default: ${DEFAULT_REPO}
  --pr-number <number>      Process one pull request.
  --all-open                Process all open develop/production pull requests.
  --event-name <name>       GitHub event name.
  --event-action <action>   GitHub event action.
  --event-label <label>     GitHub event label name.
  --grace-minutes <number>  Missing-signal grace window. Default: ${DEFAULT_GRACE_MINUTES}
  --dry-run                 Print decisions without changing labels.
  --json                    Print machine-readable JSON.
  --ensure-labels-only      Create/update automation labels and exit.
`;
}

function gh(args, options = {}) {
  return execFileSync("gh", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", options.ignoreStderr ? "ignore" : "pipe"],
  });
}

function ghJson(args, fallback = null) {
  try {
    return JSON.parse(gh(["api", ...args]));
  } catch (error) {
    if (fallback !== null) return fallback;
    throw error;
  }
}

function ghApi(args, options = {}) {
  try {
    return gh(["api", ...args], options);
  } catch (error) {
    if (options.ignoreError) return "";
    throw error;
  }
}

function isPermissionDenied(error) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Resource not accessible by integration") ||
    message.includes("HTTP 403")
  );
}

function warnPermissionDenied(action, error) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(
    `Warning: skipped ${action} because GitHub denied token access: ${message}`,
  );
}

function encodePathPart(value) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

function labelApiPath(repo, labelName) {
  return `/repos/${repo}/labels/${encodePathPart(labelName)}`;
}

export function ensureAutomationLabels({ repo, dryRun = false } = {}) {
  const results = [];

  for (const label of AUTOMATION_LABEL_DEFINITIONS) {
    const existing = ghJson([labelApiPath(repo, label.name)], {});
    const exists = existing && existing.name === label.name;
    const action = exists ? "update" : "create";
    results.push({ name: label.name, action });

    if (dryRun) continue;

    if (exists) {
      try {
        ghApi([
          "--method",
          "PATCH",
          labelApiPath(repo, label.name),
          "-f",
          `color=${label.color}`,
          "-f",
          `description=${label.description}`,
        ]);
      } catch (error) {
        if (!isPermissionDenied(error)) throw error;
        warnPermissionDenied(`updating ${label.name}`, error);
      }
    } else {
      try {
        ghApi([
          "--method",
          "POST",
          `/repos/${repo}/labels`,
          "-f",
          `name=${label.name}`,
          "-f",
          `color=${label.color}`,
          "-f",
          `description=${label.description}`,
        ]);
      } catch (error) {
        if (!isPermissionDenied(error)) throw error;
        warnPermissionDenied(`creating ${label.name}`, error);
      }
    }
  }

  return results;
}

function listOpenPullRequests(repo) {
  const seen = new Map();

  for (const base of SUPPORTED_BASE_REFS) {
    const prs = ghJson(
      [
        `/repos/${repo}/pulls?state=open&base=${base}&per_page=100`,
        "--paginate",
      ],
      [],
    );

    for (const pr of prs) {
      seen.set(String(pr.number), pr.number);
    }
  }

  return [...seen.values()];
}

function fetchPullRequestContext({
  repo,
  prNumber,
  eventName,
  eventAction,
  graceMinutes,
}) {
  const pr = ghJson([`/repos/${repo}/pulls/${prNumber}`], null);
  if (!pr || pr.message === "Not Found") return null;
  if (pr.state !== "open") return null;
  if (!SUPPORTED_BASE_REFS.has(pr.base?.ref)) return null;

  const issue = ghJson([`/repos/${repo}/issues/${prNumber}`], {});
  const commit = ghJson([`/repos/${repo}/commits/${pr.head?.sha}`], {});
  const checkRuns = ghJson(
    [`/repos/${repo}/commits/${pr.head?.sha}/check-runs?per_page=100`],
    { check_runs: [] },
  );
  const reviews = ghJson(
    [`/repos/${repo}/pulls/${prNumber}/reviews?per_page=100`, "--paginate"],
    [],
  );
  const reviewComments = ghJson(
    [`/repos/${repo}/pulls/${prNumber}/comments?per_page=100`, "--paginate"],
    [],
  );
  const issueComments = ghJson(
    [`/repos/${repo}/issues/${prNumber}/comments?per_page=100`, "--paginate"],
    [],
  );
  const signalStartedAt =
    commit?.commit?.committer?.date ??
    commit?.commit?.author?.date ??
    pr.updated_at ??
    pr.created_at;

  return {
    pr: {
      number: pr.number,
      baseRef: pr.base?.ref,
      labels: issue.labels ?? [],
      signalStartedAt,
    },
    checkRuns: checkRuns.check_runs ?? [],
    reviews,
    reviewComments,
    issueComments,
    now: new Date().toISOString(),
    graceMinutes,
    eventName,
    eventAction,
  };
}

function removeLabel({ repo, prNumber, label }) {
  ghApi(
    [
      "--method",
      "DELETE",
      `/repos/${repo}/issues/${prNumber}/labels/${encodePathPart(label)}`,
    ],
    { ignoreError: true, ignoreStderr: true },
  );
}

function addLabels({ repo, prNumber, labels }) {
  if (labels.length === 0) return;

  const fields = labels.flatMap((label) => ["-f", `labels[]=${label}`]);
  try {
    ghApi([
      "--method",
      "POST",
      `/repos/${repo}/issues/${prNumber}/labels`,
      ...fields,
    ]);
  } catch (error) {
    if (!isPermissionDenied(error)) throw error;
    warnPermissionDenied(`adding labels to PR #${prNumber}`, error);
  }
}

function applyDecision({ repo, prNumber, decision, dryRun }) {
  if (dryRun) return;

  for (const label of decision.labelsToRemove) {
    removeLabel({ repo, prNumber, label });
  }
  addLabels({ repo, prNumber, labels: decision.labelsToAdd });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const labelResults = ensureAutomationLabels({
    repo: args.repo,
    dryRun: args.dryRun,
  });

  if (args.ensureLabelsOnly) {
    const payload = { labels: labelResults, dryRun: args.dryRun };
    console.log(
      args.json
        ? JSON.stringify(payload, null, 2)
        : "Automation labels ensured.",
    );
    return;
  }

  const prNumbers = args.prNumber
    ? [Number(args.prNumber)]
    : args.allOpen
      ? listOpenPullRequests(args.repo)
      : [];

  if (prNumbers.length === 0) {
    console.log("No pull requests to process.");
    return;
  }

  const results = [];

  for (const prNumber of prNumbers) {
    const context = fetchPullRequestContext({
      repo: args.repo,
      prNumber,
      eventName: args.eventName,
      eventAction: args.eventAction,
      graceMinutes: args.graceMinutes,
    });

    if (!context) {
      results.push({ prNumber, skipped: true });
      continue;
    }

    const decision = buildSignalDecision(context);
    applyDecision({
      repo: args.repo,
      prNumber,
      decision,
      dryRun: args.dryRun,
    });
    results.push({
      prNumber,
      skipped: false,
      readyForIntake: decision.readyForIntake,
      reason: decision.reason,
      labelsToAdd: decision.labelsToAdd,
      labelsToRemove: decision.labelsToRemove,
      targetLabels: decision.targetLabels,
    });
  }

  if (args.json) {
    console.log(JSON.stringify({ dryRun: args.dryRun, results }, null, 2));
    return;
  }

  for (const result of results) {
    if (result.skipped) {
      console.log(`PR #${result.prNumber}: skipped`);
      continue;
    }

    console.log(
      `PR #${result.prNumber}: ${result.reason}; add=[${result.labelsToAdd.join(
        ", ",
      )}], remove=[${result.labelsToRemove.join(", ")}]`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
