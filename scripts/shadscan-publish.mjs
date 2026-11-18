// Publishes the advisory Shadscan report to the job summary, to one marker
// comment on a same-repository pull request, and to the develop tracking issue.
// It uses Node built-ins only, so unavailable mode still runs after a failed
// dependency installation.
import { appendFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  COMMENT_MARKER,
  EXPECTED_APPLICATIONS,
  renderSummary,
  renderUnavailable,
} from "./shadscan-summary.mjs";

const ISSUE_MARKER = "<!-- shadscan-tracking -->";
const DEFAULT_UNAVAILABLE_REASON = "The audit did not produce a valid report";

function isScore(value) {
  return Number.isInteger(value) && value >= 0 && value <= 100;
}

function isScoreOrUnassessed(value) {
  return value === null || isScore(value);
}

export function validateSummary(summary) {
  const applications = summary?.applications;
  if (
    summary?.status !== "available" ||
    !Array.isArray(applications) ||
    !Array.isArray(summary.libraries) ||
    !isScoreOrUnassessed(summary.score) ||
    JSON.stringify(
      applications
        .slice(0, EXPECTED_APPLICATIONS.length)
        .map((app) => app?.packageDir),
    ) !== JSON.stringify(EXPECTED_APPLICATIONS) ||
    applications.some(
      (app) =>
        typeof app?.packageDir !== "string" ||
        (app.discovered &&
          (!isScoreOrUnassessed(app.score) ||
            !Array.isArray(app.categories) ||
            !app.categories.every(
              (category) =>
                category.percentage === null || isScore(category.percentage),
            ) ||
            !Array.isArray(app.failingRules))),
    )
  )
    throw new Error(
      "The audit summary is missing, incomplete or out of range; no score will be published",
    );
  return summary;
}

function headShaFrom(context) {
  return (
    context.headSha ??
    context.event?.pull_request?.head?.sha ??
    context.event?.after ??
    null
  );
}

async function paginate(request, pathname) {
  const records = [];
  for (let page = 1; page <= 100; page++) {
    const batch = await request(
      "GET",
      `${pathname}${pathname.includes("?") ? "&" : "?"}per_page=100&page=${page}`,
    );
    if (!Array.isArray(batch))
      throw new Error("GitHub returned an invalid reporting inventory");
    records.push(...batch);
    if (batch.length < 100) return records;
  }
  throw new Error("GitHub reporting inventory exceeded its pagination bound");
}

async function publishBody(markdown, context, request) {
  const { event, eventName, repository, ref, runUrl } = context;
  if (
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) ||
    event.repository?.full_name !== repository
  )
    throw new Error(
      "GitHub report target does not match the triggering repository",
    );
  const body = `${markdown}\n[Workflow run and raw report](${runUrl}).\n`.slice(
    0,
    60_000,
  );
  if (eventName === "pull_request") {
    if (event.pull_request?.head?.repo?.full_name !== repository)
      return {
        published: false,
        reason:
          "Fork pull requests keep job-summary-only reporting: their token is read-only",
      };
    const number = event.pull_request.number;
    if (!Number.isInteger(number) || number <= 0)
      throw new Error("Invalid pull request target");
    const comments = await paginate(
      request,
      `/repos/${repository}/issues/${number}/comments`,
    );
    const existing = comments.findLast(
      (comment) =>
        comment.user?.type === "Bot" && comment.body?.includes(COMMENT_MARKER),
    );
    const result = existing
      ? await request(
          "PATCH",
          `/repos/${repository}/issues/comments/${existing.id}`,
          { body },
        )
      : await request(
          "POST",
          `/repos/${repository}/issues/${number}/comments`,
          { body },
        );
    return { published: true, url: result.html_url };
  }
  if (eventName !== "push" || ref !== "refs/heads/develop")
    return {
      published: false,
      reason: "Only develop pushes update the tracked audit issue",
    };
  const issues = await paginate(
    request,
    `/repos/${repository}/issues?state=open&labels=shadscan`,
  );
  const existing = issues.find(
    (issue) =>
      !issue.pull_request &&
      issue.user?.type === "Bot" &&
      (issue.body?.includes(ISSUE_MARKER) ||
        /^shadscan audit:/i.test(issue.title)),
  );
  const issueBody = `${ISSUE_MARKER}\n${body}`;
  if (existing) {
    const result = await request(
      "PATCH",
      `/repos/${repository}/issues/${existing.number}`,
      {
        title: `AL-${existing.number}: Shadscan audit tracking`,
        body: issueBody,
      },
    );
    return { published: true, url: result.html_url };
  }
  try {
    await request("GET", `/repos/${repository}/labels/shadscan`);
  } catch (error) {
    if (error.status !== 404) throw error;
    await request("POST", `/repos/${repository}/labels`, {
      name: "shadscan",
      description: "Shadscan UI audit",
      color: "0E8A16",
    });
  }
  const created = await request("POST", `/repos/${repository}/issues`, {
    title: "Shadscan audit tracking",
    body: issueBody,
    labels: [
      "shadscan",
      "complexity:medium",
      "status:needs-review",
      "type:chore",
    ],
  });
  const result = await request(
    "PATCH",
    `/repos/${repository}/issues/${created.number}`,
    { title: `AL-${created.number}: Shadscan audit tracking` },
  );
  return { published: true, url: result.html_url };
}

export async function publishSummary(summary, context, request) {
  validateSummary(summary);
  return publishBody(
    renderSummary(summary, { headSha: headShaFrom(context) }),
    context,
    request,
  );
}

// Replaces any earlier scores with an explicit statement, so a failed or
// missing scan never leaves an older head's scores reading as current.
export async function publishUnavailable(context, request, reason) {
  return publishBody(
    renderUnavailable({ headSha: headShaFrom(context), reason }),
    context,
    request,
  );
}

async function githubRequest(method, pathname, body) {
  if (!process.env.GH_TOKEN)
    throw new Error("GitHub reporting token is unavailable");
  const response = await fetch(`https://api.github.com${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2026-03-10",
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    const error = new Error(
      `GitHub report update failed (HTTP ${response.status})`,
    );
    error.status = response.status;
    throw error;
  }
  return response.json();
}

function workflowContext() {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  return {
    event,
    eventName: process.env.GITHUB_EVENT_NAME,
    repository: process.env.GITHUB_REPOSITORY,
    ref: process.env.GITHUB_REF,
    headSha:
      process.env.SHADSCAN_HEAD_SHA ||
      event.pull_request?.head?.sha ||
      process.env.GITHUB_SHA ||
      null,
    runUrl: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
  };
}

async function main() {
  const [mode, value, ...extra] = process.argv.slice(2);
  if (!mode || extra.length)
    throw new Error(
      "Usage: shadscan-publish.mjs report-directory | --unavailable [reason]",
    );
  const context = workflowContext();
  let markdown;
  let publish;
  if (mode === "--unavailable") {
    const reason =
      value ||
      process.env.SHADSCAN_UNAVAILABLE_REASON ||
      DEFAULT_UNAVAILABLE_REASON;
    markdown = renderUnavailable({ headSha: context.headSha, reason });
    publish = () => publishUnavailable(context, githubRequest, reason);
  } else {
    if (value !== undefined)
      throw new Error("Usage: shadscan-publish.mjs report-directory");
    const summary = validateSummary(
      JSON.parse(
        readFileSync(path.join(mode, "shadscan.summary.json"), "utf8"),
      ),
    );
    markdown = renderSummary(summary, { headSha: context.headSha });
    publish = () => publishSummary(summary, context, githubRequest);
  }
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
  const result = await publish();
  console.log(
    result.published
      ? `Published Shadscan report: ${result.url}`
      : result.reason,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
