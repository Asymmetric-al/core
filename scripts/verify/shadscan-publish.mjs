import { appendFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { renderSummary } from "./shadscan-summary.mjs";

const COMMENT_MARKER = "<!-- shadscan-report -->";
const ISSUE_MARKER = "<!-- shadscan-tracking -->";

export function validateSummary(summary) {
  if (
    !Array.isArray(summary?.applications) ||
    !Array.isArray(summary.libraries) ||
    !Array.isArray(summary.findings) ||
    !Array.isArray(summary.errors) ||
    typeof summary.passed !== "boolean"
  )
    throw new Error(
      "The audit summary is missing or incomplete; no score will be published",
    );
  if (
    summary.passed &&
    (summary.errors.length !== 0 ||
      summary.coverage?.source !== "complete" ||
      !Number.isInteger(summary.score) ||
      summary.score < 0 ||
      summary.score > 100 ||
      summary.findings.some((finding) =>
        ["unclassified", "confirmed-defect"].includes(finding.classification),
      ) ||
      JSON.stringify(
        summary.applications.map((app) => app.packageDir).sort(),
      ) !== JSON.stringify(["apps/admin", "apps/donor", "apps/missionary"]) ||
      summary.applications.some(
        (app) =>
          !Number.isInteger(app.score) ||
          !Number.isInteger(app.floor) ||
          app.score < 0 ||
          app.score > 100 ||
          app.floor < 0 ||
          app.floor > 100 ||
          app.score < app.floor,
      ))
  )
    throw new Error(
      "Refusing a passing report with contradictory or incomplete evidence",
    );
  return summary;
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

export async function publishSummary(summary, context, request) {
  validateSummary(summary);
  const { event, eventName, repository, ref, runUrl } = context;
  if (
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) ||
    event.repository?.full_name !== repository
  )
    throw new Error(
      "GitHub report target does not match the triggering repository",
    );
  const body =
    `${renderSummary(summary)}\n[Raw report and audit evidence](${runUrl}).\n`.slice(
      0,
      60_000,
    );
  if (eventName === "pull_request") {
    if (event.pull_request?.head?.repo?.full_name !== repository)
      return {
        published: false,
        reason: "Fork pull requests retain read-only artifact reporting",
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

async function githubRequest(method, pathname, body) {
  if (!process.env.GH_TOKEN)
    throw new Error("GitHub reporting token is unavailable");
  const response = await fetch(`https://api.github.com${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
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

async function main() {
  const directory = process.argv[2];
  if (!directory || process.argv.length !== 3)
    throw new Error("Usage: shadscan-publish.mjs report-directory");
  const summary = JSON.parse(
    readFileSync(path.join(directory, "shadscan.summary.json"), "utf8"),
  );
  validateSummary(summary);
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, renderSummary(summary));
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  const result = await publishSummary(
    summary,
    {
      event,
      eventName: process.env.GITHUB_EVENT_NAME,
      repository: process.env.GITHUB_REPOSITORY,
      ref: process.env.GITHUB_REF,
      runUrl: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
    },
    githubRequest,
  );
  console.log(
    result.published
      ? `Published Shadscan evidence: ${result.url}`
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
