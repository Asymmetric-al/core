import { describe, expect, it, vi } from "vitest";

import {
  createCanonicalHistoryVerifier,
  validateCommitAttribution,
} from "../../../scripts/verify/git-attribution.mjs";

const inheritedSha = "134310f29e68f77888e462f37aaf101d7d4c567d";
const protectedTip = "b391e74dc697923f2dc4457cb1774eb519cc2fc4";
const productionTip = "3".repeat(40);
const novelSha = "4".repeat(40);
const legacyMetadata = {
  sha: inheritedSha,
  authorName: "Blake",
  authorEmail: "299239962+asymmetric-core-eve[bot]@users.noreply.github.com",
  committerName: "Blake",
  committerEmail: "299239962+asymmetric-core-eve[bot]@users.noreply.github.com",
};

function proofBoundary() {
  const readApi = vi.fn((args: string[]) => {
    const branch = args.at(-1)?.split("/").at(-1);
    return {
      ok: true,
      stdout: JSON.stringify({
        name: branch,
        protected: true,
        commit: { sha: branch === "develop" ? protectedTip : productionTip },
      }),
      stderr: "",
      status: 0,
    };
  });
  const readGitStatus = vi.fn((args: string[]) =>
    args.at(-2) === inheritedSha && args.at(-1) === protectedTip ? 0 : 1,
  );
  return { readApi, readGitStatus };
}

describe("canonical protected history on local pushes", () => {
  it("classifies an already integrated legacy tuple without accepting that tuple for new commits", () => {
    const { readApi, readGitStatus } = proofBoundary();
    const verify = createCanonicalHistoryVerifier({
      repository: "Asymmetric-al/core",
      runGitHubApi: readApi,
      runGitStatus: readGitStatus,
    });

    expect(validateCommitAttribution(legacyMetadata)).not.toEqual([]);
    expect(verify(legacyMetadata)).toEqual({
      branch: "develop",
      tip: protectedTip,
    });
    expect(verify({ ...legacyMetadata, sha: novelSha })).toBeNull();
    expect(
      validateCommitAttribution({ ...legacyMetadata, sha: novelSha }),
    ).not.toEqual([]);
    expect(readApi).toHaveBeenCalledWith([
      "--hostname",
      "github.com",
      "repos/Asymmetric-al/core/branches/develop",
    ]);
  });

  it("pins authenticated branch tips and ignores forged or stale local tracking refs", () => {
    const { readApi } = proofBoundary();
    const readGitStatus = vi.fn((args: string[]) =>
      args.some((arg) => arg.startsWith("refs/remotes/")) ? 0 : 1,
    );
    const verify = createCanonicalHistoryVerifier({
      repository: "Asymmetric-al/core",
      runGitHubApi: readApi,
      runGitStatus: readGitStatus,
    });

    expect(verify(legacyMetadata)).toBeNull();
    expect(readGitStatus).toHaveBeenCalledWith([
      "--no-replace-objects",
      "merge-base",
      "--is-ancestor",
      inheritedSha,
      protectedTip,
    ]);
    expect(readGitStatus.mock.calls.flat(2)).not.toContain(
      "refs/remotes/origin/develop",
    );
  });

  it("does not query or trust a noncanonical destination", () => {
    const { readApi, readGitStatus } = proofBoundary();
    const verify = createCanonicalHistoryVerifier({
      repository: "attacker/core",
      runGitHubApi: readApi,
      runGitStatus: readGitStatus,
    });
    expect(verify(legacyMetadata)).toBeNull();
    expect(readApi).not.toHaveBeenCalled();
    expect(readGitStatus).not.toHaveBeenCalled();
  });

  it("does not trust an unprotected canonical branch", () => {
    const { readApi, readGitStatus } = proofBoundary();
    readApi.mockImplementation((args: string[]) => ({
      ok: true,
      stdout: JSON.stringify({
        name: args.at(-1)?.split("/").at(-1),
        protected: false,
        commit: { sha: protectedTip },
      }),
      stderr: "",
      status: 0,
    }));
    const verify = createCanonicalHistoryVerifier({
      repository: "Asymmetric-al/core",
      runGitHubApi: readApi,
      runGitStatus: readGitStatus,
    });
    expect(verify(legacyMetadata)).toBeNull();
    expect(readGitStatus).not.toHaveBeenCalled();
  });

  it.each([
    "not json",
    "null",
    JSON.stringify({
      name: "feature/unsafe",
      protected: true,
      commit: { sha: protectedTip },
    }),
    JSON.stringify({ name: "develop", commit: { sha: protectedTip } }),
    JSON.stringify({
      name: "develop",
      protected: true,
      commit: { sha: "develop" },
    }),
  ])("fails closed on malformed protected-branch evidence: %s", (stdout) => {
    const { readGitStatus } = proofBoundary();
    const verify = createCanonicalHistoryVerifier({
      repository: "Asymmetric-al/core",
      runGitHubApi: () => ({ ok: true, stdout, stderr: "", status: 0 }),
      runGitStatus: readGitStatus,
    });
    expect(() => verify(legacyMetadata)).toThrow(/protected.*branch/i);
    expect(readGitStatus).not.toHaveBeenCalled();
  });

  it("fails closed when authenticated branch proof is unavailable", () => {
    const verify = createCanonicalHistoryVerifier({
      repository: "Asymmetric-al/core",
      runGitHubApi: () => ({
        ok: false,
        stdout: "",
        stderr: "unavailable",
        status: 1,
      }),
    });
    expect(() => verify(legacyMetadata)).toThrow(/protected.*branch/i);
  });

  it("fails closed when ancestry cannot be established locally", () => {
    const { readApi } = proofBoundary();
    const verify = createCanonicalHistoryVerifier({
      repository: "Asymmetric-al/core",
      runGitHubApi: readApi,
      runGitStatus: () => 128,
    });
    expect(() => verify(legacyMetadata)).toThrow(/ancestry/i);
  });

  it.each([
    { authorEmail: "codex@example.com" },
    { committerEmail: "codex@example.com" },
    { authorName: "" },
    { committerEmail: "" },
    { committerName: "GitHub", committerEmail: "noreply@github.com" },
  ])(
    "preserves forbidden, malformed and platform-envelope checks: %j",
    (override) => {
      const { readApi, readGitStatus } = proofBoundary();
      const verify = createCanonicalHistoryVerifier({
        repository: "Asymmetric-al/core",
        runGitHubApi: readApi,
        runGitStatus: readGitStatus,
      });
      expect(verify({ ...legacyMetadata, ...override })).toBeNull();
      expect(readApi).not.toHaveBeenCalled();
    },
  );

  it("uses one fresh branch proof per invocation and never exempts unrelated merge parents", () => {
    const { readApi, readGitStatus } = proofBoundary();
    const verify = createCanonicalHistoryVerifier({
      repository: "Asymmetric-al/core",
      runGitHubApi: readApi,
      runGitStatus: readGitStatus,
    });
    expect(readApi).not.toHaveBeenCalled();
    expect(verify(legacyMetadata)).not.toBeNull();
    expect(verify(legacyMetadata)).not.toBeNull();
    expect(verify({ ...legacyMetadata, sha: novelSha })).toBeNull();
    expect(readApi).toHaveBeenCalledTimes(2);
  });
});
