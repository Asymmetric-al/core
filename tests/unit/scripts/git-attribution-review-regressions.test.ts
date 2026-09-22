import { describe, expect, it, vi } from "vitest";

import {
  collectCiVerification,
  collectOutgoingCommitShas,
  resolveTrustedRemoteQueryTarget,
  validateDevelopMergeProvenance,
  validateGitHubActorAttribution,
} from "../../../scripts/verify/git-attribution.mjs";

const externalIdentity = {
  authorName: "External Contributor",
  authorEmail: "external@example.org",
  committerName: "External Contributor",
  committerEmail: "external@example.org",
};
const externalActors = {
  authorLogin: "external-contributor",
  authorId: 1234567,
  committerLogin: "external-contributor",
  committerId: 1234567,
};
const forkPolicy = { allowExternalAuthor: true, allowExternalCommitter: true };

describe("external commit signature validity", () => {
  it.each([
    { isValid: false, state: "INVALID" },
    { isValid: false, state: "VALID" },
    { isValid: true, state: "INVALID" },
  ])("rejects invalid or contradictory signature proof: %j", (validity) => {
    const errors = validateGitHubActorAttribution(
      externalIdentity,
      {
        ...externalActors,
        signature: {
          ...validity,
          signerLogin: externalActors.committerLogin,
          signerId: externalActors.committerId,
          wasSignedByGitHub: false,
        },
      },
      forkPolicy,
    );
    expect(errors.join("\n")).toContain("commit signature is not valid");
  });

  it.each([
    null,
    {
      isValid: true,
      state: "VALID",
      signerLogin: externalActors.committerLogin,
      signerId: externalActors.committerId,
      wasSignedByGitHub: false,
    },
  ])(
    "preserves attributable unsigned and validly signed fork contributions",
    (signature) => {
      expect(
        validateGitHubActorAttribution(
          externalIdentity,
          {
            ...externalActors,
            signature,
          },
          forkPolicy,
        ),
      ).toEqual([]);
    },
  );
});

describe("event principal completeness", () => {
  const headSha = "1".repeat(40);
  const environment: Record<string, string> = {
    ASYM_GITHUB_EVENT_NAME: "pull_request",
    ASYM_GITHUB_BASE_SHA: "2".repeat(40),
    ASYM_GITHUB_HEAD_SHA: headSha,
    ASYM_GITHUB_HEAD_REPOSITORY: "external/core",
    ASYM_GITHUB_REPOSITORY: "Asymmetric-al/core",
    ASYM_GITHUB_REF_NAME: "1/merge",
    ASYM_GITHUB_REF_TYPE: "branch",
    ASYM_GITHUB_EVENT_ACTOR_LOGIN: "external-contributor",
    ASYM_GITHUB_EVENT_ACTOR_ID: "1234567",
  };
  function verify(overrides: Record<string, string>) {
    return collectCiVerification({
      environment: { ...environment, ...overrides },
      collectCommitShas: () => [headSha],
      isHistorical: () => false,
      readCommit: () => ({
        metadata: { ...externalIdentity, sha: headSha },
        actors: externalActors,
      }),
      readSignature: () => null,
    });
  }

  for (const principal of [
    "EVENT_SENDER",
    "PULL_REQUEST_AUTHOR",
    "HEAD_OWNER",
  ]) {
    it.each([
      ["renamed-forbidden-account", ""],
      ["renamed-forbidden-account", "not-a-number"],
      ["", "1234567"],
      ["invalid/login", "1234567"],
    ])(`rejects incomplete or malformed ${principal}: %s / %s`, (login, id) => {
      expect(
        verify({
          [`ASYM_GITHUB_${principal}_LOGIN`]: login,
          [`ASYM_GITHUB_${principal}_ID`]: id,
        }).errors.join("\n"),
      ).toContain("complete valid login and immutable account id");
    });
    it(`accepts a complete valid ${principal}`, () => {
      expect(
        verify({
          [`ASYM_GITHUB_${principal}_LOGIN`]: "external-contributor",
          [`ASYM_GITHUB_${principal}_ID`]: "1234567",
        }).errors,
      ).toEqual([]);
    });
    it(`continues to reject a renamed forbidden ${principal} by immutable ID`, () => {
      expect(
        verify({
          [`ASYM_GITHUB_${principal}_LOGIN`]: "renamed-forbidden-account",
          [`ASYM_GITHUB_${principal}_ID`]: "53842349",
        }).errors.join("\n"),
      ).toContain("is forbidden");
    });
  }
  it("preserves absent optional event principals", () => {
    expect(verify({}).errors).toEqual([]);
  });
  it("rejects a malformed required event actor ID", () => {
    expect(
      verify({ ASYM_GITHUB_EVENT_ACTOR_ID: "not-a-number" }).errors.join("\n"),
    ).toContain("complete valid login and immutable account id");
  });
});

describe("new-ref destination history", () => {
  it("excludes fork history using the actual sanitized push destination", () => {
    const forkMerge = "3".repeat(40);
    const canonicalTip = "2".repeat(40);
    const descendant = "4".repeat(40);
    const runCommand = vi.fn((_command: string, args: string[]) => ({
      ok: true,
      status: 0,
      stderr: "",
      stdout:
        args.length === 1
          ? "origin\nupstream\n"
          : args.at(-1) === "upstream"
            ? "git@github.com:Asymmetric-al/core.git"
            : "git@github.com:external/core.git",
    }));
    const remoteName = resolveTrustedRemoteQueryTarget({
      remoteName: "origin",
      repoSlug: "external/core",
      runCommand,
    });
    const runGit = vi.fn((args: string[]) => {
      if (args[0] === "rev-parse" && args[1] === "--is-shallow-repository")
        return "false";
      if (args[0] === "rev-parse") return descendant;
      if (args[0] === "ls-remote")
        return `${args.at(-1) === "https://github.com/external/core.git" ? forkMerge : canonicalTip}\trefs/heads/main`;
      if (args[0] === "rev-list")
        return args.includes(forkMerge)
          ? descendant
          : `${forkMerge}\n${descendant}`;
      throw new Error(`Unexpected git command: ${args.join(" ")}`);
    });
    expect(
      collectOutgoingCommitShas({
        updates: [
          {
            localRef: "refs/heads/feature",
            localSha: descendant,
            remoteRef: "refs/heads/feature",
            remoteSha: "0".repeat(40),
          },
        ],
        remoteName,
        runGit,
        runGitStatus: () => 0,
      }),
    ).toEqual([descendant]);
    expect(remoteName).toBe("https://github.com/external/core.git");
  });
  it("keeps an explicit canonical push bound to canonical history even with a fork fetch URL", () => {
    expect(
      resolveTrustedRemoteQueryTarget({
        remoteName: "origin",
        repoSlug: "Asymmetric-al/core",
        runCommand: () => ({
          ok: true,
          status: 0,
          stderr: "",
          stdout: "git@github.com:external/core.git",
        }),
      }),
    ).toBe("https://github.com/Asymmetric-al/core.git");
  });
  it("refuses an unsafe destination slug", () => {
    expect(() =>
      resolveTrustedRemoteQueryTarget({
        repoSlug: "external/core?secret=value",
      }),
    ).toThrow("repository slug");
  });
});

describe("recorded develop base ancestry", () => {
  const baseParent = "a".repeat(40);
  const headParent = "b".repeat(40);
  const mergeSha = "c".repeat(40);
  const recordedBase = "d".repeat(40);
  const metadata = { sha: mergeSha, parentShas: [baseParent, headParent] };
  const pullRequest = {
    state: "closed",
    merged_at: "2026-09-22T00:00:00Z",
    merge_commit_sha: mergeSha,
    base: {
      ref: "develop",
      sha: recordedBase,
      repo: { full_name: "Asymmetric-al/core" },
    },
    head: { sha: headParent },
  };

  it("accepts an older recorded base only after proving ancestry to the exact first parent", () => {
    const runGitStatus = vi.fn(() => 0);
    expect(
      validateDevelopMergeProvenance({
        metadata,
        pullRequests: [pullRequest],
        runGitStatus,
      }),
    ).toEqual([]);
    expect(runGitStatus).toHaveBeenCalledExactlyOnceWith([
      "merge-base",
      "--is-ancestor",
      recordedBase,
      baseParent,
    ]);
  });

  it.each([1, 128])(
    "rejects unrelated, descendant, or unavailable base ancestry (git exit %s)",
    (status) => {
      expect(
        validateDevelopMergeProvenance({
          metadata,
          pullRequests: [pullRequest],
          runGitStatus: () => status,
        }),
      ).not.toEqual([]);
    },
  );

  it("accepts an exact recorded base without an ancestry lookup", () => {
    const runGitStatus = vi.fn(() => 128);
    expect(
      validateDevelopMergeProvenance({
        metadata,
        pullRequests: [
          { ...pullRequest, base: { ...pullRequest.base, sha: baseParent } },
        ],
        runGitStatus,
      }),
    ).toEqual([]);
    expect(runGitStatus).not.toHaveBeenCalled();
  });

  it.each([
    { ...pullRequest, state: "open" },
    { ...pullRequest, merged_at: null },
    { ...pullRequest, merge_commit_sha: "e".repeat(40) },
    { ...pullRequest, head: { sha: "e".repeat(40) } },
    { ...pullRequest, base: { ...pullRequest.base, ref: "production" } },
    {
      ...pullRequest,
      base: { ...pullRequest.base, repo: { full_name: "external/core" } },
    },
    { ...pullRequest, base: { ...pullRequest.base, sha: "invalid" } },
  ])(
    "rejects a mismatching merge envelope before consulting ancestry: %j",
    (candidate) => {
      const runGitStatus = vi.fn(() => 0);
      expect(
        validateDevelopMergeProvenance({
          metadata,
          pullRequests: [candidate],
          runGitStatus,
        }),
      ).not.toEqual([]);
      expect(runGitStatus).not.toHaveBeenCalled();
    },
  );

  it("rejects a malformed commit SHA even when the PR agrees with it", () => {
    expect(
      validateDevelopMergeProvenance({
        metadata: { ...metadata, sha: "invalid" },
        pullRequests: [
          {
            ...pullRequest,
            merge_commit_sha: "invalid",
            base: { ...pullRequest.base, sha: baseParent },
          },
        ],
        runGitStatus: () => 0,
      }),
    ).not.toEqual([]);
  });
});

describe("unsigned same-tuple collaborator claims", () => {
  it("rejects a new unsigned Conrad tuple presented by Blake on Conrad's PR", () => {
    expect(
      validateGitHubActorAttribution(
        {
          authorName: "Conrad O",
          authorEmail: "79217644+cobmojo@users.noreply.github.com",
          committerName: "Conrad O",
          committerEmail: "79217644+cobmojo@users.noreply.github.com",
        },
        {
          authorLogin: "cobmojo",
          authorId: 79217644,
          committerLogin: "cobmojo",
          committerId: 79217644,
          eventActorLogin: "II-ricky-bobby-II",
          eventActorId: 116130409,
          pullRequestAuthorLogin: "cobmojo",
          pullRequestAuthorId: 79217644,
          signature: null,
        },
        { allowEventActorProof: true },
      ).join("\n"),
    ).toContain("lacks authenticated proof");
  });
});
