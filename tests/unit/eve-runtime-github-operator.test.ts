import { readFile } from "node:fs/promises";
import path from "node:path";

import { createGithubBotEveAuditIdentity } from "@asym/api/eve/audit";
import { afterEach, describe, expect, it, vi } from "vitest";

import githubOperatorDefinition from "../../packages/eve-runtime/agent/tools/github_operator";
import { performEveGithubOperation } from "../../packages/eve-runtime/src/github/operator";
import { eveGithubOperationRunId } from "../../packages/eve-runtime/src/github/tool-runtime";

vi.mock("../../packages/eve-runtime/src/github/credentials", () => ({
  resolveEveGithubInstallationToken: vi.fn(async () => "test-token"),
}));

const operatorPath = path.resolve(
  import.meta.dirname,
  "../../packages/eve-runtime/agent/tools/github_operator.ts",
);
const runtimePath = path.resolve(
  import.meta.dirname,
  "../../packages/eve-runtime/src/github/operator.ts",
);

describe("Eve runtime GitHub operator", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is dynamically scoped to authorized Core GitHub senders", async () => {
    const source = await readFile(operatorPath, "utf8");
    expect(source).toContain("defineDynamic");
    expect(source).toContain('auth?.authenticator !== "github-webhook"');
    expect(source).toContain('repository !== "Asymmetric-al/core"');
    expect(source).toContain("collaborators/");
    expect(source).toContain("return null");

    let permission = "read";
    const fetchMock = vi.fn(async () =>
      Promise.resolve(
        new Response(JSON.stringify({ permission }), { status: 200 }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const resolve = githubOperatorDefinition.events["step.started"];
    const context = {
      session: {
        auth: {
          current: {
            attributes: {
              delivery_id: "delivery-one",
              installation_id: "42",
              repository: "Asymmetric-al/core",
              user_login: "external-contributor",
            },
            authenticator: "github-webhook",
            principalId: "github:42",
          },
        },
      },
    };

    await expect(resolve({} as never, context as never)).resolves.toBeNull();

    permission = "write";
    await expect(resolve({} as never, context as never)).resolves.toMatchObject(
      {
        description: expect.stringContaining("governed, issue-first"),
      },
    );
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "/repos/Asymmetric-al/core/collaborators/external-contributor/permission",
    );
  });

  it("contains the complete mutation vocabulary without merge", async () => {
    const source = await readFile(runtimePath, "utf8");
    expect(source).toContain("rerun-failed-jobs");
    expect(source).toContain("git/trees");
    expect(source).toContain("draft: false");
    expect(source).not.toMatch(/\/merge|mergePullRequest|auto_merge/u);
  });

  it("derives delivery-stable, operation-specific durable run IDs", async () => {
    const issue = {
      operation: "create_issue" as const,
      title: "Safe issue",
      body: "Safe engineering work.",
    };
    expect(eveGithubOperationRunId("delivery-one", issue)).toBe(
      eveGithubOperationRunId("delivery-one", issue),
    );
    expect(eveGithubOperationRunId("delivery-one", issue)).not.toBe(
      eveGithubOperationRunId("delivery-two", issue),
    );

    const source = await readFile(operatorPath, "utf8");
    expect(source).toMatch(
      /eveGithubOperationRunId\(\s*deliveryId,\s*request\s*\)/u,
    );
  });

  it("creates an issue-derived branch through the non-mutating ref lookup", async () => {
    const responses = [
      new Response(JSON.stringify({}), { status: 200 }),
      new Response(JSON.stringify({ message: "Not Found" }), { status: 404 }),
      new Response(JSON.stringify({ object: { sha: "a".repeat(40) } }), {
        status: 200,
      }),
      new Response(JSON.stringify({ ref: "refs/heads/eve/issue-431-fix" }), {
        status: 201,
      }),
    ];
    const fetchMock = vi.fn(async () => responses.shift()!);
    vi.stubGlobal("fetch", fetchMock);
    const identity = createGithubBotEveAuditIdentity({
      botId: "eve[bot]",
      initiatorId: "github:42",
      initiatorType: "github_sender",
    });

    await expect(
      performEveGithubOperation({
        accountableTrigger: "github:42:delivery:one",
        actorProfileId: "11111111-1111-4111-8111-111111111111",
        identity,
        installationId: 42,
        owner: "Asymmetric-al",
        repo: "core",
        request: {
          operation: "create_branch",
          issueNumber: 431,
          branch: "eve/issue-431-fix",
          baseBranch: "develop",
        },
        runId: "33333333-3333-4333-8333-333333333333",
      }),
    ).resolves.toEqual({ resourceId: "eve/issue-431-fix" });

    expect(String(fetchMock.mock.calls[1]?.[0])).toContain(
      "/git/ref/heads/eve%2Fissue-431-fix",
    );
    expect(fetchMock.mock.calls[3]?.[1]).toMatchObject({ method: "POST" });
  });

  it("rejects a pull-request state change when the PR is unrelated to the issue", async () => {
    const responses = [
      new Response(JSON.stringify({}), { status: 200 }),
      new Response(
        JSON.stringify({
          body: "Closes #432",
          head: { ref: "human-authored-change" },
        }),
        { status: 200 },
      ),
    ];
    const fetchMock = vi.fn(async () => responses.shift()!);
    vi.stubGlobal("fetch", fetchMock);
    const identity = createGithubBotEveAuditIdentity({
      botId: "eve[bot]",
      initiatorId: "github:42",
      initiatorType: "github_sender",
    });

    await expect(
      performEveGithubOperation({
        accountableTrigger: "github:42:delivery:one",
        actorProfileId: "11111111-1111-4111-8111-111111111111",
        identity,
        installationId: 42,
        owner: "Asymmetric-al",
        repo: "core",
        request: {
          operation: "update_pull_request",
          issueNumber: 431,
          pullRequestNumber: 99,
          state: "closed",
        },
        runId: "33333333-3333-4333-8333-333333333333",
      }),
    ).rejects.toThrow(/does not belong to issue #431/u);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls).not.toContainEqual([
      expect.anything(),
      expect.objectContaining({ method: "PATCH" }),
    ]);
  });

  it("updates an issue-linked Eve pull request", async () => {
    const responses = [
      new Response(JSON.stringify({}), { status: 200 }),
      new Response(
        JSON.stringify({
          body: "Bounded fix.\n\nCloses #431",
          head: { ref: "eve/issue-431-safe-fix" },
        }),
        { status: 200 },
      ),
      new Response(JSON.stringify({ state: "closed" }), { status: 200 }),
    ];
    const fetchMock = vi.fn(async () => responses.shift()!);
    vi.stubGlobal("fetch", fetchMock);
    const identity = createGithubBotEveAuditIdentity({
      botId: "eve[bot]",
      initiatorId: "github:42",
      initiatorType: "github_sender",
    });

    await expect(
      performEveGithubOperation({
        accountableTrigger: "github:42:delivery:one",
        actorProfileId: "11111111-1111-4111-8111-111111111111",
        identity,
        installationId: 42,
        owner: "Asymmetric-al",
        repo: "core",
        request: {
          operation: "update_pull_request",
          issueNumber: 431,
          pullRequestNumber: 99,
          state: "closed",
        },
        runId: "33333333-3333-4333-8333-333333333333",
      }),
    ).resolves.toEqual({ resourceId: "99" });

    expect(fetchMock.mock.calls[2]?.[1]).toMatchObject({ method: "PATCH" });
  });
});
