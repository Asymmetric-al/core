import { spawnSync } from "node:child_process";

export const RELEASE_BLOCKER_LABEL = "release-blocker";
// Fixed, not derived from --remote: a misconfigured remote must not point the
// check at a fork that has no blockers.
export const RELEASE_REPO = "Asymmetric-al/core";

const LABEL_MISSING = "label missing";
const LABEL_ARGS = [
  "api",
  `repos/${RELEASE_REPO}/labels/${RELEASE_BLOCKER_LABEL}`,
];
// The REST issues endpoint: the search API is eventually consistent and the gh
// issue-listing command stops at 30. --paginate follows every page and exits
// non-zero if any page fails.
const LIST_ARGS = [
  "api",
  "--paginate",
  `repos/${RELEASE_REPO}/issues?state=open&labels=${RELEASE_BLOCKER_LABEL}&per_page=100`,
  "--jq",
  ".[] | {number, title, html_url, state, pull_request}",
];

// Accepts run(args) or run("gh", args); uses the releaser's own gh auth.
function runGh(...input) {
  const args = Array.isArray(input[0]) ? input[0] : input[1];
  return spawnSync("gh", args, {
    encoding: "utf8",
    timeout: 30_000,
    env: process.env,
  });
}

function firstLine(text) {
  return (
    String(text ?? "")
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .find(Boolean) ?? ""
  );
}

function callGh(run, args) {
  const result = run("gh", args);
  if (result?.error) {
    throw new Error(`gh ${args[0]} failed: ${firstLine(result.error.message)}`);
  }
  if (result?.status !== 0) {
    const detail = firstLine(result?.stderr) || `exit ${result?.status}`;
    const error = new Error(`gh ${args[0]} failed: ${detail}`);
    error.notFound = /\bHTTP 404\b/u.test(String(result?.stderr ?? ""));
    throw error;
  }
  return String(result.stdout ?? "");
}

function parseIssue(line) {
  const issue = JSON.parse(line);
  if (
    !Number.isInteger(issue?.number) ||
    typeof issue.title !== "string" ||
    typeof issue.html_url !== "string"
  ) {
    throw new Error("unexpected gh output");
  }
  return issue;
}

/**
 * Never throws. Returns { ok: true, blockers } only when the label exists and
 * every page of open labeled issues was read and parsed; otherwise
 * { ok: false, reason }, so the release fails closed.
 */
export function queryReleaseBlockers({ run = runGh } = {}) {
  try {
    try {
      callGh(run, LABEL_ARGS);
    } catch (error) {
      if (error.notFound) return { ok: false, reason: LABEL_MISSING };
      throw error;
    }
    const blockers = callGh(run, LIST_ARGS)
      .split(/\r?\n/u)
      .filter((line) => line.trim())
      .map(parseIssue)
      // jq emits `pull_request: null` for issues; only a non-null value is a PR.
      .filter((issue) => !issue.pull_request && issue.state === "open")
      .map(({ number, title, html_url }) => ({ number, title, url: html_url }))
      .sort((a, b) => a.number - b.number);
    return { ok: true, blockers };
  } catch (error) {
    const reason =
      error instanceof SyntaxError
        ? "unparseable gh output"
        : firstLine(error?.message);
    return { ok: false, reason: reason || "unknown error" };
  }
}

export function evaluateReleaseBlockers(result) {
  if (!result?.ok) {
    if (result?.reason === LABEL_MISSING) {
      return {
        allowed: false,
        message: `release:production refused: label ${RELEASE_BLOCKER_LABEL} not found in ${RELEASE_REPO}. Create it (docs/ops/production-release.md#release-blockers) before releasing.`,
      };
    }
    return {
      allowed: false,
      message: `release:production refused: could not verify release blockers (${result?.reason || "unknown error"}). Check \`gh auth status\` and network, then re-run.`,
    };
  }
  if (result.blockers.length === 0) {
    return { allowed: true, message: "none open" };
  }
  return {
    allowed: false,
    message: [
      `release:production refused: ${result.blockers.length} open ${RELEASE_BLOCKER_LABEL} issue(s) in ${RELEASE_REPO}`,
      ...result.blockers.map((b) => `  #${b.number} ${b.title} ${b.url}`),
      `Close the issue(s) or remove the ${RELEASE_BLOCKER_LABEL} label, then re-run.`,
    ].join("\n"),
  };
}

export function assertNoReleaseBlockers({
  run = runGh,
  log = console.log,
  stage,
} = {}) {
  const verdict = evaluateReleaseBlockers(queryReleaseBlockers({ run }));
  if (!verdict.allowed) throw new Error(verdict.message);
  log(`==> release blockers (${stage}): ${verdict.message}`);
}
