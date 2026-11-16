import { afterEach, describe, expect, it, vi } from "vitest";

import {
  GitHubError,
  createGitHub,
  githubToken,
} from "../../../scripts/archon-factory/pack/.shared/github.mjs";

type Call = { url: string; init: RequestInit };
type Reply = Response | Error | (() => Response);

const NOW = 1_700_000_000_000;
const API = "https://api.github.com";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
}

function status(code: number, body = "", headers: Record<string, string> = {}) {
  return new Response(body, { status: code, headers });
}

// A fetch boundary that replays one scripted reply per call and records each
// request. Running past the script is itself a failure.
function fakeFetch(...replies: Reply[]) {
  const calls: Call[] = [];
  const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const reply = replies[calls.length - 1];
    if (reply === undefined)
      throw new Error(`unexpected request ${calls.length}: ${url}`);
    if (reply instanceof Error) throw reply;
    return typeof reply === "function" ? reply() : reply;
  });
  return { calls, fetchImpl };
}

function client(
  replies: Reply[],
  options: { retries?: number; capMs?: number } = {},
) {
  const fetch = fakeFetch(...replies);
  const waits: number[] = [];
  const wait = vi.fn(async (ms: number) => {
    waits.push(ms);
  });
  const github = createGitHub({
    token: "tok-secret",
    repo: "acme/core",
    fetchImpl: fetch.fetchImpl,
    now: () => NOW,
    wait,
    ...options,
  });
  return {
    github,
    calls: fetch.calls,
    fetchImpl: fetch.fetchImpl,
    waits,
    wait,
  };
}

async function rejection(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error as GitHubError & Record<string, unknown>;
  }
  throw new Error("expected the call to reject");
}

describe("request headers", () => {
  it("sends the bearer token and GitHub API headers on every read", async () => {
    const { github, calls } = client([json({ number: 7 })]);
    await github.issue(7);
    expect(calls[0].init.headers).toEqual({
      authorization: "Bearer tok-secret",
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "core-factory",
    });
  });

  it("reads a single resource from the repository's REST path", async () => {
    const { github, calls } = client([json({ number: 7 })]);
    await github.issue(7);
    expect([calls[0].url, calls[0].init.method, calls[0].init.body]).toEqual([
      `${API}/repos/acme/core/issues/7`,
      "GET",
      undefined,
    ]);
  });

  it("returns the parsed body of a successful read", async () => {
    const { github } = client([json({ number: 7, title: "Fix it" })]);
    await expect(github.issue(7)).resolves.toEqual({
      number: 7,
      title: "Fix it",
    });
  });

  it("sends a write as JSON with a content type", async () => {
    const { github, calls } = client([json({ id: 1 }, { status: 201 })]);
    await github.comment(12, "hello");
    expect([
      calls[0].url,
      calls[0].init.method,
      (calls[0].init.headers as Record<string, string>)["content-type"],
      calls[0].init.body,
    ]).toEqual([
      `${API}/repos/acme/core/issues/12/comments`,
      "POST",
      "application/json",
      '{"body":"hello"}',
    ]);
  });

  it("maps merge options onto GitHub's merge request body", async () => {
    const { github, calls } = client([json({ merged: true })]);
    await github.merge(5, { sha: "abc123", method: "squash", title: "T (#5)" });
    expect([
      calls[0].url,
      calls[0].init.method,
      JSON.parse(String(calls[0].init.body)),
    ]).toEqual([
      `${API}/repos/acme/core/pulls/5/merge`,
      "PUT",
      { sha: "abc123", merge_method: "squash", commit_title: "T (#5)" },
    ]);
  });

  it("returns null data for an empty success body", async () => {
    const { github } = client([new Response(null, { status: 204 })]);
    await expect(
      github.request("DELETE", "/repos/acme/core/x", undefined, {
        write: true,
      }),
    ).resolves.toMatchObject({ status: 204, data: null });
  });
});

describe("pagination", () => {
  it("follows rel=next across pages and concatenates the results", async () => {
    const { github } = client([
      json([{ id: 1 }, { id: 2 }], {
        headers: {
          link: `<${API}/page2>; rel="next", <${API}/page3>; rel="last"`,
        },
      }),
      json([{ id: 3 }], { headers: { link: `<${API}/page3>; rel="next"` } }),
      json([{ id: 4 }]),
    ]);
    await expect(github.issueComments(9)).resolves.toEqual([
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
    ]);
  });

  it("requests the next link exactly and stops when no next link remains", async () => {
    const { github, calls } = client([
      json([{ id: 1 }], {
        headers: { link: `<${API}/page2?per_page=100&page=2>; rel="next"` },
      }),
      json([{ id: 2 }], { headers: { link: `<${API}/page1>; rel="first"` } }),
    ]);
    await github.issueComments(9);
    expect(calls.map((call) => call.url)).toEqual([
      `${API}/repos/acme/core/issues/9/comments?per_page=100`,
      `${API}/page2?per_page=100&page=2`,
    ]);
  });

  it("finds rel=next when it follows a rel=prev entry", async () => {
    const { github, calls } = client([
      json([], {
        headers: {
          link: `<${API}/p1>; rel="prev", <${API}/p3>; rel="next", <${API}/p9>; rel="last"`,
        },
      }),
      json([]),
    ]);
    await github.issueComments(9);
    expect(calls[1].url).toBe(`${API}/p3`);
  });

  it("appends per_page with & when the path already has a query", async () => {
    const { github, calls } = client([json([])]);
    await github.openPulls();
    expect(calls[0].url).toBe(
      `${API}/repos/acme/core/pulls?state=open&per_page=100`,
    );
  });

  it("encodes the head branch when listing pulls for a head", async () => {
    const { github, calls } = client([json([])]);
    await github.pullsForHead("factory/12-fix");
    expect(calls[0].url).toBe(
      `${API}/repos/acme/core/pulls?state=all&head=acme:factory%2F12-fix&per_page=100`,
    );
  });

  it("collects check runs from GitHub's wrapped check-runs page", async () => {
    const { github } = client([
      json({ total_count: 2, check_runs: [{ id: 1 }, { id: 2 }] }),
    ]);
    await expect(github.checkRuns("abc")).resolves.toEqual([
      { id: 1 },
      { id: 2 },
    ]);
  });

  it("collects search-style items pages", async () => {
    const { github } = client([json({ total_count: 1, items: [{ id: 5 }] })]);
    await expect(github.paginate("/search/issues?q=x")).resolves.toEqual([
      { id: 5 },
    ]);
  });

  it("treats missing blocked-by dependencies (404) as no blockers", async () => {
    const { github } = client([status(404, '{"message":"Not Found"}')]);
    await expect(github.blockedBy(3)).resolves.toEqual([]);
  });

  it("still fails blocked-by on other client errors", async () => {
    const { github } = client([status(422, "bad")]);
    expect((await rejection(github.blockedBy(3))).status).toBe(422);
  });

  it("treats an unprotected branch (404) as no protection", async () => {
    const { github } = client([status(404, "")]);
    await expect(github.branchProtection("develop")).resolves.toBeNull();
  });
});

describe("transient retries", () => {
  it("retries a 502 read and returns the later success", async () => {
    const { github } = client([status(502), json({ number: 1 })]);
    await expect(github.pull(1)).resolves.toEqual({ number: 1 });
  });

  it("makes exactly two calls for one 502 followed by success", async () => {
    const { github, fetchImpl } = client([status(502), json({ number: 1 })]);
    await github.pull(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("stops after `retries` retries and throws a GitHubError with the status", async () => {
    const { github, fetchImpl } = client(
      [status(503), status(503), status(503), status(503)],
      { retries: 2 },
    );
    const error = await rejection(github.pull(1));
    expect([
      error instanceof GitHubError,
      error.status,
      fetchImpl.mock.calls.length,
    ]).toEqual([true, 503, 3]);
  });

  it("defaults to three retries (four attempts)", async () => {
    const { github, fetchImpl } = client(
      Array.from({ length: 6 }, () => () => status(500)),
    );
    await rejection(github.pull(1));
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });

  it("does not retry when retries is zero", async () => {
    const { github, fetchImpl } = client([status(502), json({})], {
      retries: 0,
    });
    await rejection(github.pull(1));
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("backs off exponentially with half-range jitter", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const { github, waits } = client([
      status(502),
      status(502),
      status(502),
      json({}),
    ]);
    await github.pull(1);
    // 2000 * 2^attempt, half fixed plus half jitter: 1000+500, 2000+1000, 4000+2000.
    expect(waits).toEqual([1500, 3000, 6000]);
  });

  it("keeps jittered backoff inside [half, full) of the step", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { github, waits } = client([status(502), status(502), json({})]);
    await github.pull(1);
    expect(waits).toEqual([1000, 2000]);
  });

  it("caps the exponential step at capMs", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const { github, waits } = client(
      [status(502), status(502), status(502), json({})],
      { capMs: 3000 },
    );
    await github.pull(1);
    // Steps 2000, min(3000, 4000), min(3000, 8000) with 0.75 of each.
    expect(waits).toEqual([1500, 2250, 2250]);
  });

  it("does not retry a 404 read", async () => {
    const { github, fetchImpl } = client([status(404, "missing"), json({})]);
    await rejection(github.pull(1));
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("does not retry a 422 read and reports the status and response detail", async () => {
    const { github, fetchImpl } = client([
      status(422, "Validation Failed"),
      json({}),
    ]);
    const error = await rejection(github.pull(1));
    expect([
      error.status,
      error.rateLimited,
      /Validation Failed/.test(error.message),
      fetchImpl.mock.calls.length,
    ]).toEqual([422, false, true, 1]);
  });

  it("does not retry a permission 403 that is not a rate limit", async () => {
    const { github, fetchImpl } = client([
      status(403, "Resource not accessible", {
        "x-ratelimit-remaining": "4999",
      }),
      json({}),
    ]);
    const error = await rejection(github.pull(1));
    expect([
      error.status,
      error.rateLimited,
      fetchImpl.mock.calls.length,
    ]).toEqual([403, false, 1]);
  });

  it("retries a read whose fetch rejects and returns the later success", async () => {
    const { github, fetchImpl } = client([
      new TypeError("fetch failed"),
      json({ number: 2 }),
    ]);
    const result = await github.pull(2);
    expect([result, fetchImpl.mock.calls.length]).toEqual([{ number: 2 }, 2]);
  });

  it("reports a read as unavailable once every attempt's fetch rejects", async () => {
    const lost = new TypeError("fetch failed");
    const { github, fetchImpl } = client([lost, lost, lost, lost], {
      retries: 2,
    });
    const error = await rejection(github.pull(2));
    expect([
      error instanceof GitHubError,
      /unavailable/.test(error.message),
      error.cause,
      error.outcome,
      fetchImpl.mock.calls.length,
    ]).toEqual([true, true, lost, undefined, 3]);
  });
});

describe("Retry-After and rate limits", () => {
  it("waits exactly Retry-After seconds before retrying", async () => {
    const { github, waits } = client([
      status(503, "", { "retry-after": "7" }),
      json({}),
    ]);
    await github.pull(1);
    expect(waits).toEqual([7000]);
  });

  it("prefers Retry-After over the rate-limit reset", async () => {
    const { github, waits } = client([
      status(429, "", {
        "retry-after": "3",
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(NOW / 1000 + 60),
      }),
      json({}),
    ]);
    await github.pull(1);
    expect(waits).toEqual([3000]);
  });

  it("waits until the primary rate-limit reset plus one second", async () => {
    const { github, waits } = client([
      status(403, "API rate limit exceeded", {
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(NOW / 1000 + 30),
      }),
      json({}),
    ]);
    await github.pull(1);
    expect(waits).toEqual([31_000]);
  });

  it("waits one second when the rate-limit reset is already past", async () => {
    const { github, waits } = client([
      status(429, "", {
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(NOW / 1000 - 30),
      }),
      json({}),
    ]);
    await github.pull(1);
    expect(waits).toEqual([1000]);
  });

  it("retries a 403 secondary rate limit", async () => {
    const { github, fetchImpl } = client([
      status(403, "You have exceeded a secondary rate limit"),
      json({ number: 3 }),
    ]);
    await github.pull(3);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("refuses without waiting when the reset is beyond capMs", async () => {
    const { github, wait } = client([
      status(429, "", {
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(NOW / 1000 + 200),
      }),
      json({}),
    ]);
    await rejection(github.pull(1));
    expect(wait).not.toHaveBeenCalled();
  });

  it("reports rateLimited, the status and the time to reset when beyond capMs", async () => {
    const { github, fetchImpl } = client([
      status(429, "", {
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(NOW / 1000 + 200),
      }),
      json({}),
    ]);
    const error = await rejection(github.pull(1));
    expect([
      error instanceof GitHubError,
      error.rateLimited,
      error.status,
      error.resetInMs,
      error.outcome,
      fetchImpl.mock.calls.length,
    ]).toEqual([true, true, 429, 201_000, undefined, 1]);
  });

  it("waits when Retry-After equals capMs exactly", async () => {
    const { github, waits } = client([
      status(503, "", { "retry-after": "120" }),
      json({}),
    ]);
    await github.pull(1);
    expect(waits).toEqual([120_000]);
  });

  it("refuses when Retry-After exceeds capMs by one second", async () => {
    const { github, fetchImpl } = client([
      status(503, "", { "retry-after": "121" }),
      json({}),
    ]);
    const error = await rejection(github.pull(1));
    expect([
      error.rateLimited,
      error.resetInMs,
      fetchImpl.mock.calls.length,
    ]).toEqual([true, 121_000, 1]);
  });

  it("marks a write refused when its rate limit outlasts capMs", async () => {
    const { github } = client([status(429, "", { "retry-after": "600" })]);
    const error = await rejection(github.comment(4, "hi"));
    expect([error.rateLimited, error.outcome]).toEqual([true, "refused"]);
  });

  it("retries a rate-limited write, since GitHub did not perform it", async () => {
    const { github, fetchImpl } = client([
      status(429, "", { "retry-after": "2" }),
      json({ id: 9 }, { status: 201 }),
    ]);
    const result = await github.comment(4, "hi");
    expect([result, fetchImpl.mock.calls.length]).toEqual([{ id: 9 }, 2]);
  });

  it("reports rateLimited when the last attempt is still rate limited", async () => {
    const { github, wait } = client([status(429, "", { "retry-after": "1" })], {
      retries: 0,
    });
    const error = await rejection(github.pull(1));
    expect([error.rateLimited, error.status, wait.mock.calls.length]).toEqual([
      true,
      429,
      0,
    ]);
  });
});

describe("writes with an uncertain effect", () => {
  it("reports outcome unknown when a write's response is lost", async () => {
    const lost = new TypeError("socket hang up");
    const { github } = client([lost, json({ number: 1 }, { status: 201 })]);
    const error = await rejection(
      github.createPull({ title: "t", head: "h", base: "b" }),
    );
    expect([error instanceof GitHubError, error.outcome, error.cause]).toEqual([
      true,
      "unknown",
      lost,
    ]);
  });

  it("never retries a write whose response is lost", async () => {
    const { github, fetchImpl, wait } = client([
      new TypeError("socket hang up"),
      json({ number: 1 }, { status: 201 }),
    ]);
    await rejection(github.updatePull(3, { body: "x" }));
    expect([fetchImpl.mock.calls.length, wait.mock.calls.length]).toEqual([
      1, 0,
    ]);
  });

  it("never retries a lost merge response", async () => {
    const { github, fetchImpl } = client([
      new TypeError("reset"),
      json({ merged: true }),
    ]);
    const error = await rejection(
      github.merge(5, { sha: "s", method: "squash", title: "t" }),
    );
    expect([error.outcome, fetchImpl.mock.calls.length]).toEqual([
      "unknown",
      1,
    ]);
  });

  it("reports a write's final server error as outcome unknown with its status", async () => {
    const { github, fetchImpl } = client([status(502, "Bad Gateway")], {
      retries: 0,
    });
    const error = await rejection(github.comment(4, "hi"));
    expect([error.outcome, error.status, fetchImpl.mock.calls.length]).toEqual([
      "unknown",
      502,
      1,
    ]);
  });

  // A 5xx on a write does not prove GitHub skipped it: the caller must read
  // GitHub before any retry (spec: "A remote effect has an unknown result").
  it("never retries a write that received a server error", async () => {
    const { github, fetchImpl, wait } = client([
      status(502, "Bad Gateway"),
      json({ id: 9 }, { status: 201 }),
    ]);
    await rejection(github.comment(4, "hi"));
    expect([fetchImpl.mock.calls.length, wait.mock.calls.length]).toEqual([
      1, 0,
    ]);
  });

  it("reports a merge that received a server error as unknown, not refused by a retry", async () => {
    const { github } = client([
      status(502, "Bad Gateway"),
      status(405, "Pull Request is not mergeable"),
    ]);
    const error = await rejection(
      github.merge(5, { sha: "s", method: "squash", title: "t" }),
    );
    expect([error.outcome, error.status]).toEqual(["unknown", 502]);
  });

  it("reports a write rejected with a client error as refused, without retrying", async () => {
    const { github, fetchImpl } = client([
      status(422, "A pull request already exists"),
      json({ number: 1 }, { status: 201 }),
    ]);
    const error = await rejection(
      github.createPull({ title: "t", head: "h", base: "b" }),
    );
    expect([error.outcome, error.status, fetchImpl.mock.calls.length]).toEqual([
      "refused",
      422,
      1,
    ]);
  });

  it("leaves outcome unset on a failed read", async () => {
    const { github } = client([status(422, "nope")]);
    expect((await rejection(github.pull(1))).outcome).toBeUndefined();
  });
});

describe("graphql", () => {
  it("posts the query and variables to the GraphQL endpoint", async () => {
    const { github, calls } = client([
      json({ data: { viewer: { login: "f" } } }),
    ]);
    await github.graphql("query { viewer { login } }", { a: 1 });
    expect([
      calls[0].url,
      calls[0].init.method,
      JSON.parse(String(calls[0].init.body)),
    ]).toEqual([
      `${API}/graphql`,
      "POST",
      { query: "query { viewer { login } }", variables: { a: 1 } },
    ]);
  });

  it("returns the data member of a successful response", async () => {
    const { github } = client([json({ data: { viewer: { login: "f" } } })]);
    await expect(github.graphql("q", {})).resolves.toEqual({
      viewer: { login: "f" },
    });
  });

  it("surfaces errors in a 200 response body as a GitHubError", async () => {
    const { github } = client([
      json({
        data: null,
        errors: [{ message: "Could not resolve to a node" }],
      }),
    ]);
    const error = await rejection(github.graphql("q", {}));
    expect([error instanceof GitHubError, error.message]).toEqual([
      true,
      "GraphQL: Could not resolve to a node",
    ]);
  });

  it("surfaces errors even when partial data is present", async () => {
    const { github } = client([
      json({ data: { repository: null }, errors: [{ message: "denied" }] }),
    ]);
    await expect(github.graphql("q", {})).rejects.toThrow("GraphQL: denied");
  });

  it("follows review-thread cursors until hasNextPage is false", async () => {
    const page = (
      ids: string[],
      hasNextPage: boolean,
      endCursor: string | null,
    ) =>
      json({
        data: {
          repository: {
            pullRequest: {
              reviewThreads: {
                pageInfo: { hasNextPage, endCursor },
                nodes: ids.map((id) => ({ id })),
              },
            },
          },
        },
      });
    const { github, calls } = client([
      page(["a", "b"], true, "c1"),
      page(["c"], false, null),
    ]);
    const threads = await github.reviewThreads(8);
    expect([
      threads,
      calls.map((call) => JSON.parse(String(call.init.body)).variables),
    ]).toEqual([
      [{ id: "a" }, { id: "b" }, { id: "c" }],
      [
        { owner: "acme", name: "core", number: 8, cursor: null },
        { owner: "acme", name: "core", number: 8, cursor: "c1" },
      ],
    ]);
  });
});

describe("githubToken", () => {
  type RunOptions = { env: Record<string, string>; timeoutMs: number };
  function runner(result: { code: number; stdout: string }) {
    return vi.fn(async (_argv: string[], _options: RunOptions) => ({
      signal: null,
      stderr: "",
      ...result,
    }));
  }

  it("returns the trimmed token from gh", async () => {
    const run = runner({ code: 0, stdout: "  gho_abc123\n" });
    await expect(
      githubToken({
        gh: "/usr/bin/gh",
        configDir: "/srv/cf/credentials/gh",
        run,
      }),
    ).resolves.toBe("gho_abc123");
  });

  it("asks gh for the github.com token", async () => {
    const run = runner({ code: 0, stdout: "gho_abc123\n" });
    await githubToken({
      gh: "/usr/bin/gh",
      configDir: "/srv/cf/credentials/gh",
      run,
    });
    expect(run.mock.calls[0][0]).toEqual([
      "/usr/bin/gh",
      "auth",
      "token",
      "--hostname",
      "github.com",
    ]);
  });

  it("points gh at the factory profile with prompts disabled and a bounded timeout", async () => {
    const run = runner({ code: 0, stdout: "gho_abc123\n" });
    await githubToken({
      gh: "/usr/bin/gh",
      configDir: "/srv/cf/credentials/gh",
      run,
    });
    const options = run.mock.calls[0][1];
    expect([
      options.env.GH_CONFIG_DIR,
      options.env.GH_PROMPT_DISABLED,
      options.timeoutMs,
    ]).toEqual(["/srv/cf/credentials/gh", "1", 15_000]);
  });

  it("does not pass ambient GitHub credentials to gh", async () => {
    vi.stubEnv("GH_TOKEN", "ambient-gh");
    vi.stubEnv("GITHUB_TOKEN", "ambient-github");
    const run = runner({ code: 0, stdout: "gho_abc123\n" });
    await githubToken({
      gh: "/usr/bin/gh",
      configDir: "/srv/cf/credentials/gh",
      run,
    });
    const env = run.mock.calls[0][1].env;
    expect([env.GH_TOKEN, env.GITHUB_TOKEN]).toEqual([undefined, undefined]);
  });

  it("fails as github-auth when gh exits non-zero, even with output", async () => {
    const run = runner({ code: 1, stdout: "gho_stale\n" });
    const error = await rejection(
      githubToken({
        gh: "/usr/bin/gh",
        configDir: "/srv/cf/credentials/gh",
        run,
      }),
    );
    expect([error instanceof GitHubError, error.code]).toEqual([
      true,
      "github-auth",
    ]);
  });

  it("fails as github-auth when gh prints only whitespace", async () => {
    const run = runner({ code: 0, stdout: " \n\t\n" });
    const error = await rejection(
      githubToken({
        gh: "/usr/bin/gh",
        configDir: "/srv/cf/credentials/gh",
        run,
      }),
    );
    expect([error instanceof GitHubError, error.code]).toEqual([
      true,
      "github-auth",
    ]);
  });
});

describe("readiness writes and thread identity", () => {
  it("closes an issue as completed with a write", async () => {
    const { github, calls } = client([json({ number: 12, state: "closed" })]);
    await expect(github.closeIssue(12)).resolves.toMatchObject({
      state: "closed",
    });
    expect([
      calls[0].url,
      calls[0].init.method,
      JSON.parse(String(calls[0].init.body)),
    ]).toEqual([
      `${API}/repos/acme/core/issues/12`,
      "PATCH",
      { state: "closed", state_reason: "completed" },
    ]);
  });

  it("reruns the failed jobs of the workflow run that owns a job", async () => {
    const { github, calls } = client([
      json({ id: 503, run_id: 77 }),
      new Response(null, { status: 201 }),
    ]);
    await github.rerunFailedJob(503);
    expect(calls.map((call) => [call.url, call.init.method])).toEqual([
      [`${API}/repos/acme/core/actions/jobs/503`, "GET"],
      [`${API}/repos/acme/core/actions/runs/77/rerun-failed-jobs`, "POST"],
    ]);
  });

  it("does not retry a rerun request whose response is lost", async () => {
    const { github, calls } = client([
      json({ id: 503, run_id: 77 }),
      new TypeError("socket hang up"),
    ]);
    const error = await rejection(github.rerunFailedJob(503));
    expect([error.outcome, calls.length]).toEqual(["unknown", 2]);
  });

  it("asks for each thread's most recent comments so a new reply is visible", async () => {
    const { github, calls } = client([
      json({
        data: {
          repository: {
            pullRequest: {
              reviewThreads: {
                pageInfo: { hasNextPage: false, endCursor: null },
                nodes: [],
              },
            },
          },
        },
      }),
    ]);
    await github.reviewThreads(8);
    const query = JSON.parse(String(calls[0].init.body)).query as string;
    expect(query).toMatch(/recent:\s*comments\(last:\s*\d+\)/);
    expect(query).toMatch(/comments\(first:\s*\d+\)/);
  });
});

describe("request deadline", () => {
  it("abandons a request GitHub never answers, so one hung call cannot hold a pass", async () => {
    const signals: (AbortSignal | undefined)[] = [];
    const github = createGitHub({
      token: "t",
      repo: "acme/core",
      retries: 0,
      timeoutMs: 20,
      wait: async () => {},
      fetchImpl: ((_url: string, init: RequestInit) => {
        signals.push(init.signal ?? undefined);
        return new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () =>
            reject(init.signal?.reason ?? new Error("aborted")),
          );
        });
      }) as typeof fetch,
    });
    await expect(github.pull(1)).rejects.toThrow(/unavailable/);
    expect(signals[0]).toBeInstanceOf(AbortSignal);
    expect(signals[0]?.aborted).toBe(true);
  });
});
