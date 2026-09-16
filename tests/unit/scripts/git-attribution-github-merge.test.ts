import { describe, expect, it } from "vitest";

import {
  collectVerification,
  validateIdentity,
  validateLatestCommitMetadata,
} from "../../../scripts/verify/git-attribution.mjs";

const metadata = {
  sha: "7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd",
  authorName: "ricky",
  authorEmail: "116130409+II-ricky-bobby-II@users.noreply.github.com",
  committerName: "GitHub",
  committerEmail: "noreply@github.com",
  parents: [
    "201f5d025284aa8b90acc0b90ed4d8fbe2bcadad",
    "70494812578dacd778a8a19786026d7b2628ac20",
  ],
};

function mergeEvidence() {
  return {
    repoSlug: "Asymmetric-al/core",
    commit: {
      ...metadata,
      parents: [...metadata.parents],
      authorLogin: "II-ricky-bobby-II",
      authorId: 116130409,
      committerLogin: "web-flow",
      committerId: 19864447,
      verified: true,
      verificationReason: "valid",
    },
    pullRequest: {
      merged: true,
      state: "closed",
      mergedAt: "2026-08-19T17:59:53Z",
      mergeCommitSha: metadata.sha,
      mergedBy: "II-ricky-bobby-II",
      mergedById: 116130409,
      baseRepo: "Asymmetric-al/core",
      baseRef: "develop",
      baseSha: metadata.parents[0],
      headSha: metadata.parents[1],
    },
    signature: {
      sha: metadata.sha,
      isValid: true,
      state: "VALID",
      wasSignedByGitHub: true,
      signerLogin: "web-flow",
      signerId: 19864447,
    },
    branch: { name: "develop", protected: true },
  };
}

type Evidence = ReturnType<typeof mergeEvidence>;

function fakeCommands(
  evidence: Evidence,
  options: {
    unavailable?: string;
    localName?: string;
    localCommit?: typeof metadata;
    malformed?: string;
    repoSlug?: string;
  } = {},
) {
  const {
    unavailable = "",
    localName = "Blake",
    localCommit = metadata,
    malformed = "",
    repoSlug = "Asymmetric-al/core",
  } = options;
  const calls: Array<{ command: string; args: string[] }> = [];
  const run = (command: string, args: string[]) => {
    calls.push({ command, args });
    const success = (stdout: string) => ({
      ok: true,
      stdout,
      stderr: "",
      status: 0,
    });
    if (command === "git") {
      if (args[0] === "config")
        return success(
          args[2] === "user.name" ? localName : metadata.authorEmail,
        );
      if (args[0] === "var")
        return success(
          `${localName} <${metadata.authorEmail}> 1787158800 +0000`,
        );
      if (args[0] === "log")
        return success(
          [
            localCommit.sha,
            localCommit.authorName,
            localCommit.authorEmail,
            localCommit.committerName,
            localCommit.committerEmail,
            localCommit.parents.join(" "),
          ].join("\0"),
        );
      if (args[0] === "remote")
        return success(`https://github.com/${repoSlug}.git`);
    }
    const endpoint = args[1] ?? "";
    if (unavailable && endpoint.includes(unavailable))
      return { ok: false, stdout: "", stderr: "offline", status: 1 };
    if (malformed && endpoint.includes(malformed))
      return success("{broken json");
    if (endpoint === "graphql")
      return success(JSON.stringify(evidence.signature));
    if (endpoint.includes("/pulls?")) return success("0\n1325\n");
    if (endpoint.includes("/pulls/"))
      return success(JSON.stringify(evidence.pullRequest));
    if (endpoint.includes("/branches/"))
      return success(JSON.stringify(evidence.branch));
    if (endpoint.includes("/commits/")) {
      return success(
        JSON.stringify(
          args.includes("--jq")
            ? evidence.commit
            : {
                author: { login: evidence.commit.authorLogin },
                committer: { login: evidence.commit.committerLogin },
              },
        ),
      );
    }
    throw new Error(`Unexpected command ${command} ${args.join(" ")}`);
  };
  return { run, calls };
}

describe("GitHub-created integration merge attribution", () => {
  it.each(["null", "false", "0", '"unexpected"', "[]"])(
    "rejects a successful non-object commit projection: %s",
    (projection) => {
      const localCommit = {
        ...metadata,
        authorName: "Blake",
        committerName: "Blake",
        committerEmail: metadata.authorEmail,
        parents: metadata.parents.slice(0, 1),
      };
      const { run } = fakeCommands(mergeEvidence(), { localCommit });
      const result = collectVerification(
        {},
        (command: string, args: string[]) => {
          const response = run(command, args);
          return command === "gh"
            ? { ...response, stdout: projection }
            : response;
        },
      );
      expect(result.errors.length).toBeGreaterThan(0);
    },
  );

  it("blocks malformed successful GitHub metadata for an ordinary commit", () => {
    const localCommit = {
      ...metadata,
      authorName: "Blake",
      committerName: "Blake",
      committerEmail: metadata.authorEmail,
      parents: metadata.parents.slice(0, 1),
    };
    const { run } = fakeCommands(mergeEvidence(), {
      localCommit,
      malformed: "/commits/",
    });
    const result = collectVerification({}, run);
    expect(
      result.errors.some((error: string) => error.includes("invalid JSON")),
    ).toBe(true);
  });

  it.each(["/commits/", "graphql", "/pulls?", "/pulls/", "/branches/"])(
    "rejects malformed JSON from %s",
    (endpoint) => {
      const { run } = fakeCommands(mergeEvidence(), { malformed: endpoint });
      const result = collectVerification({}, run);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(
        result.warnings.some((warning: string) =>
          warning.includes("invalid JSON"),
        ),
      ).toBe(true);
    },
  );

  it("rejects the same-looking evidence from a noncanonical origin", () => {
    const { run } = fakeCommands(mergeEvidence(), { repoSlug: "someone/core" });
    expect(collectVerification({}, run).errors.length).toBeGreaterThan(0);
  });

  it.each([
    "blake@risencode.org",
    "299239962+asymmetric-core-eve[bot]@users.noreply.github.com",
  ])("rejects the ricky alias with %s", (email) => {
    const local = { ...metadata, authorEmail: email };
    const evidence = mergeEvidence();
    evidence.commit.authorEmail = email;
    expect(
      validateLatestCommitMetadata(local, evidence).length,
    ).toBeGreaterThan(0);
  });

  it.each([false, true])(
    "preserves ordinary commit verification (offline: %s)",
    (offline) => {
      const localCommit = {
        ...metadata,
        authorName: "Blake",
        committerName: "Blake",
        committerEmail: metadata.authorEmail,
        parents: metadata.parents.slice(0, 1),
      };
      const evidence = mergeEvidence();
      evidence.commit = {
        ...evidence.commit,
        ...localCommit,
        committerLogin: "II-ricky-bobby-II",
        committerId: 116130409,
      };
      const { run, calls } = fakeCommands(evidence, {
        localCommit,
        unavailable: offline ? "/commits/" : "",
      });
      const result = collectVerification({}, run);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toHaveLength(offline ? 1 : 0);
      expect(calls.filter((call) => call.command === "gh")).toHaveLength(1);
    },
  );

  it("accepts the signed merge only with matching trusted protected-PR provenance", () => {
    expect(validateLatestCommitMetadata(metadata, mergeEvidence())).toEqual([]);
  });

  it("rejects provider-looking local metadata without GitHub evidence", () => {
    expect(validateLatestCommitMetadata(metadata)).toHaveLength(3);
  });

  const invalidEvidence: Array<[string, (evidence: Evidence) => void]> = [
    [
      "wrong commit",
      (e) => {
        e.commit.sha = "a".repeat(40);
      },
    ],
    [
      "unsigned commit",
      (e) => {
        e.commit.verified = false;
      },
    ],
    [
      "invalid signature reason",
      (e) => {
        e.commit.verificationReason = "invalid";
      },
    ],
    [
      "different raw identity",
      (e) => {
        e.commit.authorName = "someone else";
      },
    ],
    [
      "different parents",
      (e) => {
        e.commit.parents.reverse();
      },
    ],
    [
      "untrusted author",
      (e) => {
        e.commit.authorLogin = "abiatarprado";
      },
    ],
    [
      "wrong author numeric identity",
      (e) => {
        e.commit.authorId = 1;
      },
    ],
    [
      "wrong trusted account for email",
      (e) => {
        e.commit.authorLogin = "asymmetric-core-eve[bot]";
      },
    ],
    [
      "non-provider committer",
      (e) => {
        e.commit.committerLogin = "II-ricky-bobby-II";
      },
    ],
    [
      "wrong provider numeric identity",
      (e) => {
        e.commit.committerId = 1;
      },
    ],
    [
      "different signed object",
      (e) => {
        e.signature.sha = "c".repeat(40);
      },
    ],
    [
      "invalid GraphQL signature",
      (e) => {
        e.signature.isValid = false;
      },
    ],
    [
      "invalid GraphQL signature state",
      (e) => {
        e.signature.state = "INVALID";
      },
    ],
    [
      "a user-signed provider-looking commit",
      (e) => {
        e.signature.wasSignedByGitHub = false;
      },
    ],
    [
      "wrong signer login",
      (e) => {
        e.signature.signerLogin = "someone";
      },
    ],
    [
      "wrong signer numeric identity",
      (e) => {
        e.signature.signerId = 1;
      },
    ],
    [
      "unmerged PR",
      (e) => {
        e.pullRequest.merged = false;
      },
    ],
    [
      "open PR",
      (e) => {
        e.pullRequest.state = "open";
      },
    ],
    [
      "missing merge time",
      (e) => {
        e.pullRequest.mergedAt = "";
      },
    ],
    [
      "different PR merge",
      (e) => {
        e.pullRequest.mergeCommitSha = "b".repeat(40);
      },
    ],
    [
      "different repository",
      (e) => {
        e.pullRequest.baseRepo = "someone/core";
      },
    ],
    [
      "non-integration target",
      (e) => {
        e.pullRequest.baseRef = "feature/test";
      },
    ],
    [
      "untrusted merger",
      (e) => {
        e.pullRequest.mergedBy = "abiatarprado";
      },
    ],
    [
      "wrong merger numeric identity",
      (e) => {
        e.pullRequest.mergedById = 1;
      },
    ],
    [
      "different PR base parent",
      (e) => {
        e.pullRequest.baseSha = metadata.parents[1];
      },
    ],
    [
      "different PR head parent",
      (e) => {
        e.pullRequest.headSha = metadata.parents[0];
      },
    ],
    [
      "unprotected target",
      (e) => {
        e.branch.protected = false;
      },
    ],
    [
      "different protected branch",
      (e) => {
        e.branch.name = "production";
      },
    ],
  ];

  it.each(invalidEvidence)("rejects %s", (_label, mutate) => {
    const evidence = mergeEvidence();
    mutate(evidence);
    expect(
      validateLatestCommitMetadata(metadata, evidence).length,
    ).toBeGreaterThan(0);
  });

  it("does not grant the exception to squash or ordinary one-parent commits", () => {
    const singleParent = { ...metadata, parents: metadata.parents.slice(0, 1) };
    const evidence = mergeEvidence();
    evidence.commit.parents = singleParent.parents;
    expect(
      validateLatestCommitMetadata(singleParent, evidence).length,
    ).toBeGreaterThan(0);
  });

  it("does not change local developer identity validation", () => {
    expect(
      validateIdentity({
        label: "local git config",
        name: "GitHub",
        email: "noreply@github.com",
      }),
    ).toHaveLength(2);
    expect(
      validateIdentity({
        label: "local git config",
        name: "ricky",
        email: metadata.authorEmail,
      }),
    ).toHaveLength(1);
  });

  it("does not generalize the observed hosted author alias", () => {
    const changed = { ...metadata, authorName: "someone else" };
    const evidence = mergeEvidence();
    evidence.commit.authorName = changed.authorName;
    expect(
      validateLatestCommitMetadata(changed, evidence).length,
    ).toBeGreaterThan(0);
  });

  it("enforces the full gate using compact live-provider evidence", () => {
    const { run, calls } = fakeCommands(mergeEvidence());
    expect(collectVerification({}, run).errors).toEqual([]);
    const lookups = calls.filter((call) => call.command === "gh");
    expect(lookups.length).toBeGreaterThanOrEqual(5);
    expect(lookups.every((call) => call.args.includes("--jq"))).toBe(true);
    expect(
      lookups.some((call) =>
        call.args[1].endsWith(`${metadata.sha}?per_page=1`),
      ),
    ).toBe(true);
  });

  it.each(["/commits/", "graphql", "/pulls?", "/pulls/", "/branches/"])(
    "fails closed when %s proof is unavailable",
    (endpoint) => {
      const { run } = fakeCommands(mergeEvidence(), { unavailable: endpoint });
      const result = collectVerification({}, run);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(
        result.warnings.some((warning: string) => warning.includes("offline")),
      ).toBe(true);
    },
  );

  it("does not let skipping GitHub enable the hosted exception", () => {
    const { run, calls } = fakeCommands(mergeEvidence());
    expect(collectVerification({ skipGithub: true }, run).errors).toHaveLength(
      3,
    );
    expect(calls.some((call) => call.command === "gh")).toBe(false);
  });

  it("still rejects an invalid local identity when the remote merge is valid", () => {
    const { run } = fakeCommands(mergeEvidence(), { localName: "Conrad" });
    const errors = collectVerification({}, run).errors;
    expect(errors).toHaveLength(3);
    expect(
      errors.every((error: string) => error.includes("name must be Blake")),
    ).toBe(true);
  });
});
