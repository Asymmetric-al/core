import {
  eveGithubRequest as githubRequest,
  EveGithubRequestError as GithubRequestError,
  githubPathPart as pathPart,
} from "./client";

import type {
  EveGithubOperatorInput,
  EveGithubOperatorRequest,
} from "@asym/api/eve/github-operator";

async function verifyIssue(input: EveGithubOperatorInput, issueNumber: number) {
  const issue = await githubRequest<{ pull_request?: unknown }>({
    installationId: input.installationId,
    method: "GET",
    path: `/repos/${pathPart(input.owner)}/${pathPart(input.repo)}/issues/${issueNumber}`,
  });
  if (issue.body.pull_request !== undefined) {
    throw new Error(
      "Issue-first provenance requires a GitHub issue, not a pull request.",
    );
  }
}

async function createIssue(
  input: EveGithubOperatorInput,
  request: Extract<EveGithubOperatorRequest, { operation: "create_issue" }>,
) {
  const marker = `<!-- eve:github-operation:create_issue:${input.runId} -->`;
  for (let page = 1; page <= 30; page += 1) {
    const existing = await githubRequest<
      Array<{ body?: string; html_url?: string; number?: number }>
    >({
      installationId: input.installationId,
      method: "GET",
      path: `/repos/${pathPart(input.owner)}/${pathPart(input.repo)}/issues?state=all&per_page=100&page=${page}`,
    });
    const match = existing.body.find((issue) => issue.body?.includes(marker));
    if (match?.number) {
      return { resourceId: String(match.number), resourceUrl: match.html_url };
    }
    if (existing.body.length < 100) break;
  }
  const created = await githubRequest<{ html_url?: string; number: number }>({
    body: {
      title: request.title,
      body: `${request.body.trim()}\n\n${marker}`,
      labels: request.labels ?? [],
    },
    installationId: input.installationId,
    method: "POST",
    path: `/repos/${pathPart(input.owner)}/${pathPart(input.repo)}/issues`,
  });
  return {
    resourceId: String(created.body.number),
    resourceUrl: created.body.html_url,
  };
}

async function createBranch(
  input: EveGithubOperatorInput,
  request: Extract<EveGithubOperatorRequest, { operation: "create_branch" }>,
) {
  await verifyIssue(input, request.issueNumber);
  const root = `/repos/${pathPart(input.owner)}/${pathPart(input.repo)}/git/ref/heads`;
  const existing = await githubRequest<{ object: { sha: string } }>({
    installationId: input.installationId,
    method: "GET",
    path: `${root}/${pathPart(request.branch)}`,
  }).catch((error: unknown) => {
    if (error instanceof GithubRequestError && error.status === 404)
      return null;
    throw error;
  });
  if (existing) return { resourceId: request.branch };
  const base = await githubRequest<{ object: { sha: string } }>({
    installationId: input.installationId,
    method: "GET",
    path: `${root}/${pathPart(request.baseBranch)}`,
  });
  await githubRequest({
    body: { ref: `refs/heads/${request.branch}`, sha: base.body.object.sha },
    installationId: input.installationId,
    method: "POST",
    path: `/repos/${pathPart(input.owner)}/${pathPart(input.repo)}/git/refs`,
  });
  return { resourceId: request.branch };
}

async function openPullRequest(
  input: EveGithubOperatorInput,
  request: Extract<
    EveGithubOperatorRequest,
    { operation: "open_pull_request" }
  >,
) {
  await verifyIssue(input, request.issueNumber);
  const pullsPath = `/repos/${pathPart(input.owner)}/${pathPart(input.repo)}/pulls`;
  if (request.changedPaths) {
    const compared = await githubRequest<{
      files?: Array<{ filename?: string }>;
    }>({
      installationId: input.installationId,
      method: "GET",
      path: `/repos/${pathPart(input.owner)}/${pathPart(input.repo)}/compare/${pathPart(request.baseBranch)}...${pathPart(request.branch)}`,
    });
    const observed = (compared.body.files ?? [])
      .flatMap((file) => (file.filename ? [file.filename] : []))
      .sort();
    const declared = [...new Set(request.changedPaths)].sort();
    if (JSON.stringify(observed) !== JSON.stringify(declared)) {
      throw new Error("The declared pull-request paths do not match GitHub.");
    }
  }
  const existing = await githubRequest<
    Array<{ html_url?: string; number: number }>
  >({
    installationId: input.installationId,
    method: "GET",
    path: `${pullsPath}?state=all&head=${pathPart(`${input.owner}:${request.branch}`)}&per_page=100`,
  });
  if (existing.body[0]) {
    return {
      resourceId: String(existing.body[0].number),
      resourceUrl: existing.body[0].html_url,
    };
  }
  const created = await githubRequest<{ html_url?: string; number: number }>({
    body: {
      base: request.baseBranch,
      body: `${request.body.trim()}\n\n<!-- eve:github-operation:open_pull_request:${input.runId} -->`,
      draft: false,
      head: request.branch,
      title: request.title,
    },
    installationId: input.installationId,
    method: "POST",
    path: pullsPath,
  });
  return {
    resourceId: String(created.body.number),
    resourceUrl: created.body.html_url,
  };
}

async function pushSafeFix(
  input: EveGithubOperatorInput,
  request: Extract<EveGithubOperatorRequest, { operation: "push_safe_fix" }>,
) {
  await verifyIssue(input, request.issueNumber);
  const root = `/repos/${pathPart(input.owner)}/${pathPart(input.repo)}`;
  const refPath = `${root}/git/ref/heads/${pathPart(request.branch)}`;
  const ref = await githubRequest<{ object: { sha: string } }>({
    installationId: input.installationId,
    method: "GET",
    path: refPath,
  });
  const marker = `eve-operation:push_safe_fix:${input.runId}`;
  const priorCommits = await githubRequest<
    Array<{ commit?: { message?: string }; html_url?: string; sha?: string }>
  >({
    installationId: input.installationId,
    method: "GET",
    path: `${root}/commits?sha=${pathPart(request.branch)}&per_page=100`,
  });
  const prior = priorCommits.body.find((candidate) =>
    candidate.commit?.message?.includes(marker),
  );
  if (prior?.sha) {
    return { resourceId: prior.sha, resourceUrl: prior.html_url };
  }
  const commit = await githubRequest<{
    html_url?: string;
    message?: string;
    sha?: string;
    tree: { sha: string };
  }>({
    installationId: input.installationId,
    method: "GET",
    path: `${root}/git/commits/${ref.body.object.sha}`,
  });
  const tree = await githubRequest<{ sha: string }>({
    body: {
      base_tree: commit.body.tree.sha,
      tree: request.changedFiles.map((file) => ({
        content: file.status === "deleted" ? undefined : file.content,
        mode: "100644",
        path: file.path,
        sha: file.status === "deleted" ? null : undefined,
        type: "blob",
      })),
    },
    installationId: input.installationId,
    method: "POST",
    path: `${root}/git/trees`,
  });
  const nextCommit = await githubRequest<{ html_url?: string; sha: string }>({
    body: {
      message: `${request.commitMessage}\n\n${marker}`,
      parents: [ref.body.object.sha],
      tree: tree.body.sha,
    },
    installationId: input.installationId,
    method: "POST",
    path: `${root}/git/commits`,
  });
  await githubRequest({
    body: { force: false, sha: nextCommit.body.sha },
    installationId: input.installationId,
    method: "PATCH",
    path: refPath,
  });
  return {
    resourceId: nextCommit.body.sha,
    resourceUrl: nextCommit.body.html_url,
  };
}

export async function performEveGithubOperation(input: EveGithubOperatorInput) {
  const request = input.request;
  switch (request.operation) {
    case "create_issue":
      return createIssue(input, request);
    case "create_branch":
      return createBranch(input, request);
    case "open_pull_request":
      return openPullRequest(input, request);
    case "add_labels":
      await verifyIssue(input, request.issueNumber);
      await githubRequest({
        body: { labels: request.labels },
        installationId: input.installationId,
        method: "POST",
        path: `/repos/${pathPart(input.owner)}/${pathPart(input.repo)}/issues/${request.targetNumber}/labels`,
      });
      return { resourceId: String(request.targetNumber) };
    case "rerun_failed_workflow":
      await verifyIssue(input, request.issueNumber);
      const workflow = await githubRequest<{ run_attempt?: number }>({
        installationId: input.installationId,
        method: "GET",
        path: `/repos/${pathPart(input.owner)}/${pathPart(input.repo)}/actions/runs/${request.workflowRunId}`,
      });
      if (workflow.body.run_attempt !== request.expectedRunAttempt) {
        return { resourceId: String(request.workflowRunId) };
      }
      await githubRequest({
        installationId: input.installationId,
        method: "POST",
        path: `/repos/${pathPart(input.owner)}/${pathPart(input.repo)}/actions/runs/${request.workflowRunId}/rerun-failed-jobs`,
      });
      return { resourceId: String(request.workflowRunId) };
    case "update_pull_request":
      await verifyIssue(input, request.issueNumber);
      await githubRequest({
        body: { state: request.state },
        installationId: input.installationId,
        method: "PATCH",
        path: `/repos/${pathPart(input.owner)}/${pathPart(input.repo)}/pulls/${request.pullRequestNumber}`,
      });
      return { resourceId: String(request.pullRequestNumber) };
    case "push_safe_fix":
      return pushSafeFix(input, request);
  }
}
