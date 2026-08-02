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
    expect(source).toContain("eveGithubCredentials");
    expect(source).toContain("authorizeEveGithubReviewTrigger");
    expect(source).toContain("publishEveGithubReview");
    expect(source).toContain("onCheckSuite");
    expect(source).toContain("runEveStrictAutoMergeTool");
    expect(source).toContain("event: review.event");
    expect(source).toContain("progress: { reactions: false }");
    expect(source).toContain('session_purpose: "github_review"');
    expect(source.match(/preflightEveGithubReview\(/gu)).toHaveLength(2);
    expect(source).toContain('"turn.failed"()');
    expect(source).not.toMatch(/labels|mergePullRequest|rerun|createIssue/iu);
  });

  it("drops events from repositories other than Core", async () => {
    const source = await readFile(channelPath, "utf8");

    // The App can be installed elsewhere, and every handler drives publication
    // against the event's own owner/repo, so each entry point must reject a
    // foreign repository before any session is created.
    expect(source).toContain('const CORE_REPOSITORY = "Asymmetric-al/core";');
    const guards = source.match(
      /ctx\.repository\.fullName !== CORE_REPOSITORY/gu,
    );
    expect(guards).toHaveLength(3);
    for (const handler of ["onComment", "onCheckSuite", "onPullRequest"]) {
      const start = source.indexOf("async " + handler + "(");
      expect(start).toBeGreaterThan(-1);
      expect(source.slice(start, start + 240)).toContain(
        "ctx.repository.fullName !== CORE_REPOSITORY",
      );
    }
  });

  it("requires tenant-linked service identity before dispatch", async () => {
    const source = await readFile(channelPath, "utf8");

    expect(source).toContain("EVE_GITHUB_ACTOR_PROFILE_ID");
    expect(source).toContain("EVE_GITHUB_TENANT_ID");
    expect(source).toContain("return null");
  });
});
