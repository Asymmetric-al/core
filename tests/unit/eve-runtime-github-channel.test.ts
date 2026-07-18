import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const channelPath = path.resolve(
  import.meta.dirname,
  "../../packages/eve-runtime/agent/channels/github.ts",
);

describe("Eve GitHub channel boundary", () => {
  it("uses the installed native channel and keeps external effects behind Core policy", async () => {
    const source = await readFile(channelPath, "utf8");

    expect(source).toContain("githubChannel({");
    expect(source).toContain("connectGitHubCredentials");
    expect(source).toContain("authorizeEveGithubReviewTrigger");
    expect(source).toContain("publishEveGithubReview");
    expect(source).toContain("event: review.event");
    expect(source).toContain("progress: { reactions: false }");
    expect(source).toContain('"turn.failed"()');
    expect(source).not.toMatch(/labels|mergePullRequest|rerun|createIssue/iu);
  });

  it("requires tenant-linked service identity before dispatch", async () => {
    const source = await readFile(channelPath, "utf8");

    expect(source).toContain("EVE_GITHUB_ACTOR_PROFILE_ID");
    expect(source).toContain("EVE_GITHUB_TENANT_ID");
    expect(source).toContain("return null");
  });
});
