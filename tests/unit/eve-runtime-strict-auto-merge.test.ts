import { readFile } from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../packages/eve-runtime/src/github/credentials", () => ({
  resolveEveGithubInstallationToken: vi.fn(async () => "test-token"),
}));

import {
  mergeEveStrictAutoMerge,
  escalateEveStrictAutoMerge,
} from "../../packages/eve-runtime/src/github/strict-auto-merge";
import { eveStrictAutoMergeRunId } from "../../packages/eve-runtime/src/github/strict-auto-merge-tool-runtime";

import type { EveStrictAutoMergeEvidence } from "@asym/api/eve/strict-auto-merge";

const toolPath = path.resolve(
  import.meta.dirname,
  "../../packages/eve-runtime/agent/tools/github_strict_auto_merge.ts",
);
const HEAD_SHA = "a".repeat(40);
const evidence: EveStrictAutoMergeEvidence = {
  activeRulesetCount: 0,
  baseBranch: "develop",
  changedPathsComplete: true,
  draft: false,
  expectedHeadSha: HEAD_SHA,
  headSha: HEAD_SHA,
  issueBranchVerified: true,
  issueLinkVerified: true,
  issueNumber: 432,
  mergeable: true,
  mergeableState: "clean",
  merged: false,
  observedChecks: [],
  observedReviews: [],
  open: true,
  protectedAreas: [],
  protection: null,
  pullRequestNumber: 900,
  pullRequestUrl: "https://github.com/Asymmetric-al/core/pull/900",
};

describe("Eve runtime strict auto-merge", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is dynamically scoped and uses a separate no-bypass merge tool", async () => {
    const source = await readFile(toolPath, "utf8");
    expect(source).toContain("defineDynamic");
    expect(source).toContain('auth?.authenticator !== "github-webhook"');
    expect(source).toContain('repository !== "Asymmetric-al/core"');
    expect(source).toContain('return "not-applicable"');
  });

  it("derives a stable run ID bound to the pull request and expected head", () => {
    const request = {
      accountableLogin: "maintainer",
      expectedHeadSha: HEAD_SHA,
      pullRequestNumber: 900,
    };
    expect(eveStrictAutoMergeRunId("delivery", request)).toBe(
      eveStrictAutoMergeRunId("delivery", request),
    );
    expect(eveStrictAutoMergeRunId("delivery", request)).not.toBe(
      eveStrictAutoMergeRunId("other-delivery", request),
    );
  });

  it("sends one expected-SHA merge request without a bypass parameter", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            merged: true,
            message: "merged",
            sha: "c".repeat(40),
          }),
          { status: 200 },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      mergeEveStrictAutoMerge({
        evidence,
        request: {
          accountableLogin: "maintainer",
          accountableTrigger: "github:42:delivery:one",
          actorProfileId: "11111111-1111-4111-8111-111111111111",
          expectedHeadSha: HEAD_SHA,
          identity: {} as never,
          installationId: 42,
          owner: "Asymmetric-al",
          pullRequestNumber: 900,
          repo: "core",
          runId: "33333333-3333-4333-8333-333333333333",
        },
      }),
    ).resolves.toMatchObject({ merged: true, resourceId: "c".repeat(40) });
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/pulls/900/merge");
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe("PUT");
    expect(JSON.parse(String(init.body))).toEqual({
      merge_method: "merge",
      sha: HEAD_SHA,
    });
  });

  it("makes the human escalation comment idempotent for one head SHA", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify([
            {
              body: `Already escalated <!-- eve:strict-auto-merge:900:${HEAD_SHA} -->`,
            },
          ]),
          { status: 200 },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    await escalateEveStrictAutoMerge({
      accountableLogin: "maintainer",
      evidence,
      installationId: 42,
      owner: "Asymmetric-al",
      reasons: ["required_human_review_missing"],
      repo: "core",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: "GET" });
  });
});
