import { describe, expect, it, vi } from "vitest";

import { preflightEveGithubReview } from "../../packages/eve-runtime/src/github/review-preflight";

function githubWithFiles(
  files: Array<{ filename?: unknown; patch?: unknown; status?: unknown }>,
) {
  return {
    request: vi.fn(async () => ({ body: files })),
  };
}

describe("Eve GitHub review preflight", () => {
  it("blocks a sensitive changed-file path before review context is loaded", async () => {
    const github = githubWithFiles([
      { filename: ".env.production", patch: "+SAFE=x", status: "modified" },
    ]);

    await expect(
      preflightEveGithubReview({
        github,
        owner: "Asymmetric-al",
        pullRequestNumber: 864,
        repo: "core",
      }),
    ).resolves.toBe(false);
  });

  it("blocks sensitive content in an otherwise safe patch", async () => {
    const github = githubWithFiles([
      {
        filename: "packages/ui/config.ts",
        patch: "+OPENAI_API_KEY=not-a-real-key",
        status: "modified",
      },
    ]);

    await expect(
      preflightEveGithubReview({
        github,
        owner: "Asymmetric-al",
        pullRequestNumber: 864,
        repo: "core",
      }),
    ).resolves.toBe(false);
  });

  it("scans deleted-file patches because removed text also enters review context", async () => {
    const github = githubWithFiles([
      {
        filename: "packages/ui/legacy-config.ts",
        patch: "-SUPABASE_SERVICE_ROLE_KEY=not-a-real-key",
        status: "removed",
      },
    ]);

    await expect(
      preflightEveGithubReview({
        github,
        owner: "Asymmetric-al",
        pullRequestNumber: 864,
        repo: "core",
      }),
    ).resolves.toBe(false);
  });

  it("allows protected source to be reviewed but fails closed without patch data", async () => {
    const protectedFile = githubWithFiles([
      {
        filename: "packages/eve-runtime/agent/agent.ts",
        patch: "+export {};",
        status: "modified",
      },
    ]);
    const missingPatch = githubWithFiles([
      { filename: "packages/ui/large.ts", status: "modified" },
    ]);

    await expect(
      preflightEveGithubReview({
        github: protectedFile,
        owner: "Asymmetric-al",
        pullRequestNumber: 864,
        repo: "core",
      }),
    ).resolves.toBe(true);
    await expect(
      preflightEveGithubReview({
        github: missingPatch,
        owner: "Asymmetric-al",
        pullRequestNumber: 864,
        repo: "core",
      }),
    ).resolves.toBe(false);
  });
});
