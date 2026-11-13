// GitHub access for trusted factory scripts only. Roles never receive this
// client or its token. Reads paginate completely; transient failures retry a
// bounded number of times with jitter, honoring Retry-After and rate resets.
// A write whose response is lost reports `unknown` so the caller reconciles
// by reading GitHub before any retry.
import { runProcess, cleanEnvironment } from "./proc.mjs";

export class GitHubError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "GitHubError";
    Object.assign(this, details);
  }
}

export async function githubToken({ gh, configDir, run = runProcess }) {
  const result = await run([gh, "auth", "token", "--hostname", "github.com"], {
    env: cleanEnvironment({
      GH_CONFIG_DIR: configDir,
      GH_PROMPT_DISABLED: "1",
    }),
    timeoutMs: 15_000,
  });
  const token = result.stdout.trim();
  if (result.code !== 0 || !token)
    throw new GitHubError(
      "GitHub sign-in for the factory is missing or invalid",
      {
        code: "github-auth",
      },
    );
  return token;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createGitHub({
  token,
  repo,
  fetchImpl = fetch,
  retries = 3,
  capMs = 120_000,
  // No request may wait on GitHub for ever: an unanswered one is abandoned
  // and handled like any other lost response.
  timeoutMs = 30_000,
  now = () => Date.now(),
  wait = sleep,
}) {
  const [owner, name] = repo.split("/");
  const base = "https://api.github.com";
  const headers = {
    authorization: `Bearer ${token}`,
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "user-agent": "core-factory",
  };
  const delayFor = (response, attempt) => {
    const after = Number(response?.headers?.get?.("retry-after"));
    if (Number.isFinite(after) && after > 0) return after * 1000;
    const reset = Number(response?.headers?.get?.("x-ratelimit-reset"));
    const remaining = response?.headers?.get?.("x-ratelimit-remaining");
    if (remaining === "0" && Number.isFinite(reset))
      return Math.max(0, reset * 1000 - now()) + 1000;
    const exponential = Math.min(capMs, 2000 * 2 ** attempt);
    return exponential / 2 + Math.random() * (exponential / 2);
  };
  async function request(method, url, body, { write = false } = {}) {
    let last;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      let response;
      try {
        response = await fetchImpl(url.startsWith("http") ? url : base + url, {
          method,
          headers: body
            ? { ...headers, "content-type": "application/json" }
            : headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (error) {
        if (write)
          throw new GitHubError(`${method} ${url}: response lost`, {
            outcome: "unknown",
            cause: error,
          });
        last = error;
        await wait(delayFor(null, attempt));
        continue;
      }
      if (response.status >= 200 && response.status < 300) {
        const text = await response.text();
        return {
          status: response.status,
          headers: response.headers,
          data: text ? JSON.parse(text) : null,
        };
      }
      const limited =
        response.status === 429 ||
        (response.status === 403 &&
          response.headers.get("x-ratelimit-remaining") === "0") ||
        (response.status === 403 &&
          /secondary rate/i.test(await response.clone().text()));
      // A rate-limited write was not performed and may retry; a write that hit
      // a server error may have taken effect, so it is never retried blind.
      const transient = limited || (!write && response.status >= 500);
      if (!transient || attempt === retries) {
        const detail = await response.text();
        if (write && response.status >= 500)
          throw new GitHubError(`${method} ${url}: ${response.status}`, {
            status: response.status,
            outcome: "unknown",
          });
        throw new GitHubError(
          `${method} ${url}: ${response.status} ${detail.slice(0, 400)}`,
          {
            status: response.status,
            outcome: write ? "refused" : undefined,
            rateLimited: limited,
          },
        );
      }
      const delay = delayFor(response, attempt);
      if (delay > capMs)
        throw new GitHubError(`${method} ${url}: rate limited until reset`, {
          status: response.status,
          rateLimited: true,
          resetInMs: delay,
          outcome: write ? "refused" : undefined,
        });
      last = new Error(`HTTP ${response.status}`);
      await wait(delay);
    }
    throw new GitHubError(`${method} ${url}: unavailable`, {
      cause: last,
      outcome: write ? "unknown" : undefined,
    });
  }
  async function paginate(url) {
    const items = [];
    let next = url.includes("?")
      ? `${url}&per_page=100`
      : `${url}?per_page=100`;
    while (next) {
      const page = await request("GET", next);
      const data = page.data;
      items.push(
        ...(Array.isArray(data)
          ? data
          : (data?.items ?? data?.check_runs ?? [])),
      );
      const link = page.headers.get("link") ?? "";
      next = /<([^>]+)>;\s*rel="next"/.exec(link)?.[1] ?? null;
    }
    return items;
  }
  async function graphql(query, variables) {
    const result = await request("POST", "/graphql", { query, variables });
    if (result.data?.errors?.length)
      throw new GitHubError(`GraphQL: ${result.data.errors[0].message}`);
    return result.data.data;
  }
  const r = `/repos/${owner}/${name}`;
  return {
    request,
    paginate,
    graphql,
    issue: async (n) => (await request("GET", `${r}/issues/${n}`)).data,
    closeIssue: async (n) =>
      (
        await request(
          "PATCH",
          `${r}/issues/${n}`,
          { state: "closed", state_reason: "completed" },
          { write: true },
        )
      ).data,
    rerunFailedJob: async (jobId) => {
      const job = (await request("GET", `${r}/actions/jobs/${jobId}`)).data;
      return (
        await request(
          "POST",
          `${r}/actions/runs/${job.run_id}/rerun-failed-jobs`,
          {},
          { write: true },
        )
      ).data;
    },
    issueComments: (n) => paginate(`${r}/issues/${n}/comments`),
    blockedBy: async (n) => {
      try {
        return await paginate(`${r}/issues/${n}/dependencies/blocked_by`);
      } catch (error) {
        if (error.status === 404) return [];
        throw error;
      }
    },
    pullsForHead: (branch) =>
      paginate(
        `${r}/pulls?state=all&head=${owner}:${encodeURIComponent(branch)}`,
      ),
    openPulls: () => paginate(`${r}/pulls?state=open`),
    pull: async (n) => (await request("GET", `${r}/pulls/${n}`)).data,
    pullFiles: (n) => paginate(`${r}/pulls/${n}/files`),
    reviews: (n) => paginate(`${r}/pulls/${n}/reviews`),
    reviewComments: (n) => paginate(`${r}/pulls/${n}/comments`),
    checkRuns: (ref) =>
      paginate(`${r}/commits/${ref}/check-runs?filter=latest`),
    statuses: async (ref) =>
      (await request("GET", `${r}/commits/${ref}/status`)).data,
    branchRules: (branch) =>
      paginate(`${r}/rules/branches/${encodeURIComponent(branch)}`),
    branchProtection: async (branch) => {
      try {
        return (
          await request(
            "GET",
            `${r}/branches/${encodeURIComponent(branch)}/protection`,
          )
        ).data;
      } catch (error) {
        if (error.status === 404) return null;
        throw error;
      }
    },
    compare: async (base, head) =>
      (await request("GET", `${r}/compare/${base}...${head}`)).data,
    reviewThreads: async (n) => {
      const threads = [];
      let cursor = null;
      do {
        const data = await graphql(
          `
            query (
              $owner: String!
              $name: String!
              $number: Int!
              $cursor: String
            ) {
              repository(owner: $owner, name: $name) {
                pullRequest(number: $number) {
                  reviewThreads(first: 50, after: $cursor) {
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                    nodes {
                      id
                      isResolved
                      isOutdated
                      path
                      line
                      comments(first: 50) {
                        nodes {
                          id
                          databaseId
                          author {
                            login
                          }
                          body
                          createdAt
                          url
                        }
                      }
                      recent: comments(last: 20) {
                        nodes {
                          id
                          databaseId
                          author {
                            login
                          }
                          body
                          createdAt
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
          { owner, name, number: n, cursor },
        );
        const page = data.repository.pullRequest.reviewThreads;
        threads.push(...page.nodes);
        cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
      } while (cursor);
      return threads;
    },
    createPull: async (body) =>
      (await request("POST", `${r}/pulls`, body, { write: true })).data,
    updatePull: async (n, body) =>
      (await request("PATCH", `${r}/pulls/${n}`, body, { write: true })).data,
    comment: async (n, body) =>
      (
        await request(
          "POST",
          `${r}/issues/${n}/comments`,
          { body },
          { write: true },
        )
      ).data,
    replyToReviewComment: async (n, commentId, body) =>
      (
        await request(
          "POST",
          `${r}/pulls/${n}/comments/${commentId}/replies`,
          { body },
          { write: true },
        )
      ).data,
    resolveThread: async (threadId) =>
      graphql(
        `
          mutation ($id: ID!) {
            resolveReviewThread(input: { threadId: $id }) {
              thread {
                id
                isResolved
              }
            }
          }
        `,
        { id: threadId },
      ),
    markReady: async (nodeId) =>
      graphql(
        `
          mutation ($id: ID!) {
            markPullRequestReadyForReview(input: { pullRequestId: $id }) {
              pullRequest {
                isDraft
              }
            }
          }
        `,
        { id: nodeId },
      ),
    merge: async (n, { sha, method, title }) =>
      (
        await request(
          "PUT",
          `${r}/pulls/${n}/merge`,
          { sha, merge_method: method, commit_title: title },
          { write: true },
        )
      ).data,
  };
}
