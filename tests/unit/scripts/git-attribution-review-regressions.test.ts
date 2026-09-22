import { describe, expect, it } from "vitest";

import { validateGitHubActorAttribution } from "../../../scripts/verify/git-attribution.mjs";

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
