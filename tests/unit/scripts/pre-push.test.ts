import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it, vi } from "vitest";

import * as gitAttributionModule from "../../../scripts/verify/git-attribution.mjs";

const ZERO_SHA = "0".repeat(40);
const REMOTE_SHA_A = "1".repeat(40);
const LOCAL_SHA_A = "2".repeat(40);
const MERGE_PARENT_SHA = "3".repeat(40);
const REMOTE_SHA_B = "4".repeat(40);
const LOCAL_SHA_B = "5".repeat(40);
const SHARED_SHA = "6".repeat(40);

interface PrePushUpdate {
  localRef: string;
  localSha: string;
  remoteRef: string;
  remoteSha: string;
}

interface PrePushCoordinatorModule {
  createPrePushEnvironment(input: {
    input: string;
    remoteName: string;
    remoteUrl: string;
    env: NodeJS.ProcessEnv;
  }): NodeJS.ProcessEnv;
  runPrePush(input: {
    env: NodeJS.ProcessEnv;
    input: string;
    remoteName: string;
    remoteUrl: string;
    runCommand: (
      command: string,
      args: string[],
      options: { env: NodeJS.ProcessEnv; stdio: string },
    ) => { error?: Error; status: number | null };
  }): number;
}

const gitAttribution = gitAttributionModule as typeof gitAttributionModule & {
  collectOutgoingCommitShas(input: {
    updates: PrePushUpdate[];
    remoteName: string;
    runGit: (args: string[]) => string;
    runGitStatus?: (args: string[]) => number;
  }): string[];
  isHistoricalCommit(input: {
    sha: string;
    baselineSha: string;
    runGitStatus: (args: string[]) => number;
  }): boolean;
};

function branchUpdate(overrides: Partial<PrePushUpdate> = {}): PrePushUpdate {
  return {
    localRef: "refs/heads/feature/AL-1425-team-developer-workflow",
    localSha: LOCAL_SHA_A,
    remoteRef: "refs/heads/feature/AL-1425-team-developer-workflow",
    remoteSha: REMOTE_SHA_A,
    ...overrides,
  };
}

async function loadPrePushCoordinator(): Promise<PrePushCoordinatorModule> {
  const moduleUrl = new URL(
    "../../../scripts/git/pre-push.mjs",
    import.meta.url,
  ).href;

  return (await import(
    /* @vite-ignore */ moduleUrl
  )) as PrePushCoordinatorModule;
}

describe("outgoing commit collection", () => {
  it("collects the full remote-to-local range for an existing ref", () => {
    const runGit = vi.fn((args: string[]) => {
      if (args[0] === "rev-list") {
        return `${LOCAL_SHA_A}\n${MERGE_PARENT_SHA}\n`;
      }

      throw new Error(`unexpected git command: ${args.join(" ")}`);
    });

    expect(
      gitAttribution.collectOutgoingCommitShas({
        updates: [branchUpdate()],
        remoteName: "origin",
        runGit,
      }),
    ).toEqual([LOCAL_SHA_A, MERGE_PARENT_SHA]);

    const revListArgs = runGit.mock.calls.find(
      ([args]) => args[0] === "rev-list",
    )?.[0];

    expect(revListArgs).toContain(`${REMOTE_SHA_A}..${LOCAL_SHA_A}`);
    expect(revListArgs).not.toContain("--first-parent");
  });

  it("resolves a new ref to a commit and excludes history on the pushed remote", () => {
    const runGit = vi.fn((args: string[]) => {
      if (args[0] === "rev-parse") {
        return LOCAL_SHA_A;
      }

      if (args[0] === "ls-remote") {
        return `${REMOTE_SHA_A}\trefs/heads/develop\n${REMOTE_SHA_B}\trefs/tags/v1^{}\n`;
      }

      if (args[0] === "rev-list") {
        return `${LOCAL_SHA_A}\n`;
      }

      throw new Error(`unexpected git command: ${args.join(" ")}`);
    });

    expect(
      gitAttribution.collectOutgoingCommitShas({
        updates: [branchUpdate({ remoteSha: ZERO_SHA })],
        remoteName: "origin",
        runGit,
        runGitStatus: () => 0,
      }),
    ).toEqual([LOCAL_SHA_A]);

    const revParseArgs = runGit.mock.calls.find(
      ([args]) => args[0] === "rev-parse",
    )?.[0];
    const revListArgs = runGit.mock.calls.find(
      ([args]) => args[0] === "rev-list",
    )?.[0];

    expect(revParseArgs).toContain(`${LOCAL_SHA_A}^{commit}`);
    expect(revListArgs).toContain(LOCAL_SHA_A);
    expect(runGit).toHaveBeenCalledWith([
      "ls-remote",
      "--refs",
      "--heads",
      "--tags",
      "origin",
    ]);
    expect(revListArgs).toContain("--not");
    expect(revListArgs).toContain(REMOTE_SHA_A);
    expect(revListArgs).not.toContain(REMOTE_SHA_B);
    expect(revListArgs).not.toContain("--remotes=origin");
    expect(revListArgs).not.toContain("--first-parent");
  });

  it("fetches an advertised remote tip before subtracting its shared ancestry", () => {
    let fetched = false;
    const runGit = vi.fn((args: string[]) => {
      if (args[0] === "rev-parse") return LOCAL_SHA_A;
      if (args[0] === "ls-remote") {
        return `${REMOTE_SHA_A}\trefs/heads/develop\n`;
      }
      if (args[0] === "fetch") {
        fetched = true;
        return "";
      }
      if (args[0] === "rev-list") return `${LOCAL_SHA_A}\n`;
      throw new Error(`unexpected git command: ${args.join(" ")}`);
    });
    const runGitStatus = vi.fn(() => (fetched ? 0 : 128));

    expect(
      gitAttribution.collectOutgoingCommitShas({
        updates: [branchUpdate({ remoteSha: ZERO_SHA })],
        remoteName: "origin",
        runGit,
        runGitStatus,
      }),
    ).toEqual([LOCAL_SHA_A]);
    expect(runGit).toHaveBeenCalledWith([
      "fetch",
      "--quiet",
      "--no-tags",
      "--no-write-fetch-head",
      "origin",
      "refs/heads/develop",
    ]);
    expect(runGit).toHaveBeenLastCalledWith([
      "rev-list",
      LOCAL_SHA_A,
      "--not",
      REMOTE_SHA_A,
    ]);
  });

  it("ignores ref deletions without invoking git", () => {
    const runGit = vi.fn<(args: string[]) => string>();

    expect(
      gitAttribution.collectOutgoingCommitShas({
        updates: [branchUpdate({ localSha: ZERO_SHA })],
        remoteName: "origin",
        runGit,
      }),
    ).toEqual([]);
    expect(runGit).not.toHaveBeenCalled();
  });

  it("deduplicates commits reachable from multiple updated refs", () => {
    const runGit = vi.fn((args: string[]) => {
      const range = args.find((arg) => arg.includes(".."));

      if (range === `${REMOTE_SHA_A}..${LOCAL_SHA_A}`) {
        return `${LOCAL_SHA_A}\n${SHARED_SHA}\n`;
      }

      if (range === `${REMOTE_SHA_B}..${LOCAL_SHA_B}`) {
        return `${LOCAL_SHA_B}\n${SHARED_SHA}\n`;
      }

      throw new Error(`unexpected git command: ${args.join(" ")}`);
    });

    const commits = gitAttribution.collectOutgoingCommitShas({
      updates: [
        branchUpdate(),
        branchUpdate({
          localRef: "refs/heads/feature/second",
          localSha: LOCAL_SHA_B,
          remoteRef: "refs/heads/feature/second",
          remoteSha: REMOTE_SHA_B,
        }),
      ],
      remoteName: "origin",
      runGit,
    });

    expect(commits).toHaveLength(3);
    expect(new Set(commits)).toEqual(
      new Set([LOCAL_SHA_A, SHARED_SHA, LOCAL_SHA_B]),
    );
  });

  it("fails closed for a malformed update", () => {
    const runGit = vi.fn<(args: string[]) => string>();
    const malformedUpdate = {
      localRef: "refs/heads/feature/malformed",
      localSha: LOCAL_SHA_A,
      remoteRef: "refs/heads/feature/malformed",
    } as PrePushUpdate;

    expect(gitAttribution.collectOutgoingCommitShas).toBeTypeOf("function");
    expect(() =>
      gitAttribution.collectOutgoingCommitShas({
        updates: [malformedUpdate],
        remoteName: "origin",
        runGit,
      }),
    ).toThrow();
    expect(runGit).not.toHaveBeenCalled();
  });

  it("fails closed when a new ref cannot be resolved to a commit", () => {
    const runGit = vi.fn((args: string[]) => {
      throw new Error(`cannot resolve ${args.join(" ")}`);
    });

    expect(() =>
      gitAttribution.collectOutgoingCommitShas({
        updates: [branchUpdate({ remoteSha: ZERO_SHA })],
        remoteName: "origin",
        runGit,
      }),
    ).toThrow();

    expect(runGit.mock.calls[0]?.[0]).toContain(`${LOCAL_SHA_A}^{commit}`);
  });
});

describe("forward-only attribution baseline", () => {
  it("treats only ancestors of the immutable baseline as historical", () => {
    const runGitStatus = vi.fn(() => 0);

    expect(
      gitAttribution.isHistoricalCommit({
        sha: REMOTE_SHA_A,
        baselineSha: LOCAL_SHA_A,
        runGitStatus,
      }),
    ).toBe(true);
    expect(runGitStatus).toHaveBeenCalledWith([
      "merge-base",
      "--is-ancestor",
      REMOTE_SHA_A,
      LOCAL_SHA_A,
    ]);
  });

  it("does not treat descendants of the baseline as historical", () => {
    expect(
      gitAttribution.isHistoricalCommit({
        sha: LOCAL_SHA_A,
        baselineSha: REMOTE_SHA_A,
        runGitStatus: () => 1,
      }),
    ).toBe(false);
  });

  it("fails closed when git cannot determine ancestry", () => {
    expect(gitAttribution.isHistoricalCommit).toBeTypeOf("function");
    expect(() =>
      gitAttribution.isHistoricalCommit({
        sha: LOCAL_SHA_A,
        baselineSha: REMOTE_SHA_A,
        runGitStatus: () => 128,
      }),
    ).toThrow();
  });
});

describe("pre-push coordinator", () => {
  it("carries the exact stdin payload once without propagating remote credentials", async () => {
    const input = [
      `refs/heads/feature/one ${LOCAL_SHA_A} refs/heads/feature/one ${REMOTE_SHA_A}`,
      `refs/heads/feature/two ${LOCAL_SHA_B} refs/heads/feature/two ${REMOTE_SHA_B}`,
      "",
    ].join("\n");
    const originalEnv = { PATH: "/usr/bin" };
    const { createPrePushEnvironment } = await loadPrePushCoordinator();

    const childEnv = createPrePushEnvironment({
      input,
      remoteName: "origin",
      remoteUrl:
        "https://x-access-token:secret@github.com/Asymmetric-al/core.git",
      env: originalEnv,
    });

    expect(childEnv).toMatchObject({
      PATH: "/usr/bin",
      ASYM_PRE_PUSH_UPDATES: input,
      ASYM_PRE_PUSH_REMOTE_NAME: "origin",
      ASYM_PRE_PUSH_REPOSITORY_SLUG: "Asymmetric-al/core",
    });
    expect(childEnv.ASYM_PRE_PUSH_REMOTE_URL).toBeUndefined();
    expect(Object.values(childEnv).join("\n")).not.toContain("secret");
    expect(
      Object.values(childEnv).filter((value) => value === input),
    ).toHaveLength(1);
    expect(originalEnv).toEqual({ PATH: "/usr/bin" });
  });

  it("sanitizes the remote name when Git supplies a raw credential URL twice", async () => {
    const credentialUrl =
      "https://x-access-token:secret@github.com/Asymmetric-al/core.git";
    const { createPrePushEnvironment } = await loadPrePushCoordinator();

    const childEnv = createPrePushEnvironment({
      env: { PATH: "/usr/bin" },
      input: "",
      remoteName: credentialUrl,
      remoteUrl: credentialUrl,
    });

    expect(childEnv).toMatchObject({
      ASYM_PRE_PUSH_REMOTE_NAME: "",
      ASYM_PRE_PUSH_REPOSITORY_SLUG: "Asymmetric-al/core",
    });
    expect(Object.values(childEnv).join("\n")).not.toContain("secret");
  });

  it("runs the guard before preflight and propagates the child status", async () => {
    const input = `refs/heads/feature/test ${LOCAL_SHA_A} refs/heads/feature/test ${REMOTE_SHA_A}\n`;
    const runCommand = vi.fn(() => ({ status: 23 }));
    const { runPrePush } = await loadPrePushCoordinator();

    expect(
      runPrePush({
        env: { PATH: "/usr/bin" },
        input,
        remoteName: "origin",
        remoteUrl: "git@github.com:Asymmetric-al/core.git",
        runCommand,
      }),
    ).toBe(23);
    expect(runCommand).toHaveBeenCalledOnce();
    expect(runCommand).toHaveBeenCalledWith(
      "bun",
      ["run", "ci:preflight"],
      expect.objectContaining({
        env: expect.objectContaining({
          ASYM_PRE_PUSH_UPDATES: input,
          ASYM_PRE_PUSH_REPOSITORY_SLUG: "Asymmetric-al/core",
        }),
        stdio: "inherit",
      }),
    );
  });

  it("routes the hook through the single stdin-owning coordinator", () => {
    const hookPath = fileURLToPath(
      new URL("../../../.husky/pre-push", import.meta.url),
    );

    expect(readFileSync(hookPath, "utf8").trim()).toBe(
      'node scripts/git/pre-push.mjs "$@"',
    );
  });
});
