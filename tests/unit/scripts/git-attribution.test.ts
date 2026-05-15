import { describe, expect, it } from "vitest";

import {
  parseGitHubRepoSlug,
  parseGitIdentity,
  parseLatestCommitLog,
  validateGitHubActors,
  validateIdentity,
  validateLatestCommitMetadata,
} from "../../../scripts/verify/git-attribution.mjs";

const blakeNoReplyEmail =
  "116130409+II-ricky-bobby-II@users.noreply.github.com";

describe("git attribution verifier", () => {
  it("accepts Blake with the configured GitHub noreply address", () => {
    expect(
      validateIdentity({
        label: "local git config",
        name: "Blake",
        email: blakeNoReplyEmail,
      }),
    ).toEqual([]);
  });

  it("rejects the old Codex identity", () => {
    const errors = validateIdentity({
      label: "latest commit author",
      name: "Codex",
      email: "codex@example.com",
    });

    expect(errors).toContain(
      "latest commit author name must be Blake; got Codex",
    );
    expect(errors).toContain(
      "latest commit author email codex@example.com is forbidden",
    );
  });

  it("rejects GitHub actor metadata that resolves to abiatarprado", () => {
    const errors = validateGitHubActors({
      authorLogin: "abiatarprado",
      committerLogin: "abiatarprado",
    });

    expect(errors).toContain(
      "latest commit GitHub author resolved to forbidden account abiatarprado",
    );
    expect(errors).toContain(
      "latest commit GitHub committer resolved to forbidden account abiatarprado",
    );
  });

  it("accepts GitHub actor metadata that resolves to Blake's account", () => {
    expect(
      validateGitHubActors({
        authorLogin: "II-ricky-bobby-II",
        committerLogin: "II-ricky-bobby-II",
      }),
    ).toEqual([]);
  });

  it("parses git identities and latest commit log output", () => {
    expect(
      parseGitIdentity(`${"Blake"} <${blakeNoReplyEmail}> 1778829921 +0700`),
    ).toEqual({
      name: "Blake",
      email: blakeNoReplyEmail,
    });

    expect(
      parseLatestCommitLog(
        `abc123\0Blake\0${blakeNoReplyEmail}\0Blake\0${blakeNoReplyEmail}`,
      ),
    ).toEqual({
      sha: "abc123",
      authorName: "Blake",
      authorEmail: blakeNoReplyEmail,
      committerName: "Blake",
      committerEmail: blakeNoReplyEmail,
    });
  });

  it("validates latest commit author and committer metadata", () => {
    expect(
      validateLatestCommitMetadata({
        sha: "abc123",
        authorName: "Blake",
        authorEmail: blakeNoReplyEmail,
        committerName: "Blake",
        committerEmail: blakeNoReplyEmail,
      }),
    ).toEqual([]);
  });

  it("parses GitHub origin URLs", () => {
    expect(parseGitHubRepoSlug("git@github.com:Asymmetric-al/core.git")).toBe(
      "Asymmetric-al/core",
    );
    expect(
      parseGitHubRepoSlug("https://github.com/Asymmetric-al/core.git"),
    ).toBe("Asymmetric-al/core");
  });
});
