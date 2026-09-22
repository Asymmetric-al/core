import { describe, expect, it, vi } from "vitest";

import {
  collectCiVerification,
  collectOutgoingCommitShas,
  resolveTrustedRemoteQueryTarget,
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
