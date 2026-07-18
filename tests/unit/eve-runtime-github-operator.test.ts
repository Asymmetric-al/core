import { readFile } from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../packages/eve-runtime/src/github/credentials", () => ({
  resolveEveGithubInstallationToken: vi.fn(async () => "test-token"),
}));

import { createGithubBotEveAuditIdentity } from "@asym/api/eve/audit";
import { performEveGithubOperation } from "../../packages/eve-runtime/src/github/operator";
import { eveGithubOperationRunId } from "../../packages/eve-runtime/src/github/tool-runtime";

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

  it("is dynamically scoped to verified Core GitHub sessions", async () => {
    const source = await readFile(operatorPath, "utf8");
    expect(source).toContain("defineDynamic");
    expect(source).toContain('auth?.authenticator !== "github-webhook"');
    expect(source).toContain('repository !== "Asymmetric-al/core"');
    expect(source).toContain("return null");
  });

  it("contains the complete mutation vocabulary without merge", async () => {
    const source = await readFile(runtimePath, "utf8");
    expect(source).toContain("rerun-failed-jobs");
    expect(source).toContain("git/trees");
    expect(source).toContain("draft: false");
    expect(source).not.toMatch(/\/merge|mergePullRequest|auto_merge/u);
  });

  it("derives stable, operation-specific durable run IDs", () => {
    const issue = {
      operation: "create_issue" as const,
      title: "Safe issue",
      body: "Safe engineering work.",
    };
    expect(eveGithubOperationRunId("turn-one", issue)).toBe(
      eveGithubOperationRunId("turn-one", issue),
    );
    expect(eveGithubOperationRunId("turn-one", issue)).not.toBe(
      eveGithubOperationRunId("turn-two", issue),
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
});
