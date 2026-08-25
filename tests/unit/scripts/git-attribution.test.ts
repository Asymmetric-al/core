import { describe, expect, it, vi } from "vitest";

import {
  ATTRIBUTION_BASELINE_SHA,
  GITHUB_PLATFORM_COMMITTER,
  TRUSTED_IDENTITIES,
  findTrustedIdentityByGitIdentity,
  findTrustedIdentityByGithubLogin,
} from "../../../scripts/git/trusted-identities.mjs";
import {
  collectCiCommitShas,
  collectCiVerification,
  parseGitHubRepoSlug,
  parseGitHubSignaturePayload,
  parseGitIdentity,
  parseLatestCommitLog,
  resolveTriggeringActor,
  validateDevelopMergeProvenance,
  validateGitHubActorAttribution,
  validateProductionPromotion,
  validateCommitAttribution,
  validateIdentity,
} from "../../../scripts/verify/git-attribution.mjs";

const blakeNoReplyEmail =
  "116130409+II-ricky-bobby-II@users.noreply.github.com";
const blakeVerifiedEmail = "blake@risencode.org";
const blakeGithubLogin = "II-ricky-bobby-II";
const blakeGithubId = 116_130_409;
const conradName = "Conrad O";
const conradConfiguredNameAlias = "Conrad O'";
const conradNoReplyEmail = "79217644+cobmojo@users.noreply.github.com";
const conradGithubLogin = "cobmojo";
const conradGithubId = 79_217_644;
const asymmetricCoreEveBotEmail =
  "299239962+asymmetric-core-eve[bot]@users.noreply.github.com";
const asymmetricCoreEveBotLogin = "asymmetric-core-eve[bot]";
const asymmetricCoreEveBotId = 299_239_962;
const cursorAgentEmail = "cursoragent@cursor.com";
const cursorAgentLogin = "cursoragent";
const cursorAgentId = 199_161_495;
const prLoopBotEmail =
  "301899336+asymmetric-core-pr-loop[bot]@users.noreply.github.com";
const prLoopBotLogin = "asymmetric-core-pr-loop[bot]";
const prLoopBotId = 301_899_336;
const githubPlatformId = 19_864_447;
const attributionBaselineSha = "7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd";

const conradIdentity = {
  name: conradName,
  email: conradNoReplyEmail,
};
const blakeIdentity = {
  name: "Blake",
  email: blakeNoReplyEmail,
};
const eveIdentity = {
  name: asymmetricCoreEveBotLogin,
  email: asymmetricCoreEveBotEmail,
};

function commitMetadata({
  author = conradIdentity,
  committer = conradIdentity,
} = {}) {
  return {
    sha: "abc123",
    authorName: author.name,
    authorEmail: author.email,
    committerName: committer.name,
    committerEmail: committer.email,
  };
}

function githubIdForLogin(login: string | null | undefined) {
  return (
    new Map<string, number>([
      [asymmetricCoreEveBotLogin, asymmetricCoreEveBotId],
      [blakeGithubLogin, blakeGithubId],
      [conradGithubLogin, conradGithubId],
      [cursorAgentLogin, cursorAgentId],
      ["web-flow", githubPlatformId],
      [prLoopBotLogin, prLoopBotId],
    ]).get(login ?? "") ?? (login ? 999_002 : null)
  );
}

function unsignedActorEvidence(
  options: {
    authorId?: number | null;
    authorLogin?: string | null;
    committerId?: number | null;
    committerLogin?: string | null;
    eventActorId?: number;
    eventActorLogin?: string;
  } = {},
) {
  const authorLogin =
    "authorLogin" in options ? options.authorLogin : conradGithubLogin;
  const committerLogin =
    "committerLogin" in options ? options.committerLogin : conradGithubLogin;
  const eventActorLogin = options.eventActorLogin ?? conradGithubLogin;

  return {
    authorId:
      "authorId" in options ? options.authorId : githubIdForLogin(authorLogin),
    authorLogin,
    committerId:
      "committerId" in options
        ? options.committerId
        : githubIdForLogin(committerLogin),
    committerLogin,
    eventActorLogin,
    eventActorId: options.eventActorId ?? githubIdForLogin(eventActorLogin),
    signature: null,
  };
}

function signedActorEvidence(
  options: {
    authorId?: number | null;
    authorLogin?: string | null;
    committerId?: number | null;
    committerLogin?: string | null;
    eventActorId?: number;
    eventActorLogin?: string;
    signatureEmail?: string;
    signerId?: number;
    signerLogin?: string;
    wasSignedByGitHub?: boolean;
  } = {},
) {
  const authorLogin =
    "authorLogin" in options ? options.authorLogin : conradGithubLogin;
  const committerLogin =
    "committerLogin" in options ? options.committerLogin : conradGithubLogin;
  const eventActorLogin = options.eventActorLogin ?? "external-trigger";
  const signerLogin = options.signerLogin ?? conradGithubLogin;

  return {
    authorId:
      "authorId" in options ? options.authorId : githubIdForLogin(authorLogin),
    authorLogin,
    committerId:
      "committerId" in options
        ? options.committerId
        : githubIdForLogin(committerLogin),
    committerLogin,
    eventActorLogin,
    eventActorId: options.eventActorId ?? 999_001,
    signature: {
      email: options.signatureEmail ?? conradNoReplyEmail,
      isValid: true,
      signerLogin,
      signerId: options.signerId ?? githubIdForLogin(signerLogin),
      state: "VALID",
      wasSignedByGitHub: options.wasSignedByGitHub ?? false,
    },
  };
}

describe("git attribution verifier", () => {
  it("keeps the trusted identity registry and policy baseline immutable", () => {
    expect(Object.isFrozen(TRUSTED_IDENTITIES)).toBe(true);
    expect(
      TRUSTED_IDENTITIES.every((identity) => Object.isFrozen(identity)),
    ).toBe(true);
    expect(ATTRIBUTION_BASELINE_SHA).toBe(attributionBaselineSha);
    expect(Object.isFrozen(GITHUB_PLATFORM_COMMITTER)).toBe(true);
    expect(GITHUB_PLATFORM_COMMITTER).toMatchObject({
      name: "GitHub",
      email: "noreply@github.com",
      githubLogin: "web-flow",
      githubId: githubPlatformId,
    });
  });

  it("registers Conrad's exact Git tuple and GitHub login", () => {
    expect(findTrustedIdentityByGitIdentity(conradIdentity)).toMatchObject({
      githubLogin: conradGithubLogin,
      githubId: conradGithubId,
    });
    expect(findTrustedIdentityByGithubLogin(conradGithubLogin)).toMatchObject({
      githubLogin: conradGithubLogin,
      githubId: conradGithubId,
    });
    expect(
      validateIdentity({
        label: "local git config",
        ...conradIdentity,
      }),
    ).toEqual([]);
  });

  it("recognizes Conrad's GitHub display alias only when explicitly allowed", () => {
    const configuredIdentity = {
      name: conradConfiguredNameAlias,
      email: conradNoReplyEmail,
    };

    expect(
      findTrustedIdentityByGitIdentity(configuredIdentity),
    ).toBeUndefined();
    expect(
      findTrustedIdentityByGitIdentity(configuredIdentity, {
        allowPlatformAlias: true,
      }),
    ).toMatchObject({ githubLogin: conradGithubLogin });
  });

  it("preserves Blake's verified and GitHub noreply tuples", () => {
    expect(
      validateIdentity({
        label: "local git config",
        name: "Blake",
        email: blakeNoReplyEmail,
      }),
    ).toEqual([]);
    expect(
      validateIdentity({
        label: "local git config",
        name: "Blake",
        email: blakeVerifiedEmail,
      }),
    ).toEqual([]);
    expect(findTrustedIdentityByGithubLogin(blakeGithubLogin)).toMatchObject({
      githubLogin: blakeGithubLogin,
      githubId: blakeGithubId,
    });
  });

  it("preserves the Asymmetric Core Eve automation tuple", () => {
    expect(
      validateIdentity({
        label: "latest commit author",
        ...eveIdentity,
      }),
    ).toEqual([]);
    expect(findTrustedIdentityByGitIdentity(eveIdentity)).toMatchObject({
      githubLogin: asymmetricCoreEveBotLogin,
    });
    expect(
      findTrustedIdentityByGithubLogin(asymmetricCoreEveBotLogin),
    ).toMatchObject({
      githubLogin: asymmetricCoreEveBotLogin,
      githubId: asymmetricCoreEveBotId,
    });
    expect(
      validateIdentity({
        label: "obsolete Eve tuple",
        name: "Blake",
        email: asymmetricCoreEveBotEmail,
      }),
    ).not.toEqual([]);
  });

  it("preserves the approved Cursor Cloud and PR-loop automation tuples", () => {
    expect(
      findTrustedIdentityByGitIdentity({
        name: "Cursor Agent",
        email: cursorAgentEmail,
      }),
    ).toMatchObject({
      githubLogin: cursorAgentLogin,
      githubId: cursorAgentId,
    });
    expect(
      findTrustedIdentityByGitIdentity({
        name: "Blake",
        email: prLoopBotEmail,
      }),
    ).toMatchObject({
      githubLogin: prLoopBotLogin,
      githubId: prLoopBotId,
    });
    expect(
      validateIdentity({
        label: "unassociated FastPR tuple",
        name: "pr-fast",
        email: "pr-fast@users.noreply.github.com",
      }),
    ).not.toEqual([]);
  });

  it("recognizes Blake's GitHub-emitted author alias only when explicitly allowed", () => {
    const platformAlias = {
      name: "ricky",
      email: blakeNoReplyEmail,
    };

    expect(findTrustedIdentityByGitIdentity(platformAlias)).toBeUndefined();
    expect(
      findTrustedIdentityByGitIdentity(platformAlias, {
        allowPlatformAlias: true,
      }),
    ).toMatchObject({ githubLogin: blakeGithubLogin });
  });

  it.each([
    {
      name: conradName,
      email: blakeNoReplyEmail,
    },
    {
      name: "Blake",
      email: conradNoReplyEmail,
    },
    {
      name: conradName,
      email: asymmetricCoreEveBotEmail,
    },
  ])("rejects a cross-wired trusted tuple: $name <$email>", (identity) => {
    expect(
      validateIdentity({
        label: "latest commit author",
        ...identity,
      }),
    ).not.toEqual([]);
  });

  it("rejects a forbidden legacy email even when external identities are allowed", () => {
    const errors = validateIdentity({
      label: "latest commit author",
      name: "Codex",
      email: "codex@example.com",
      requireTrusted: false,
    });

    expect(errors.join("\n")).toContain("codex@example.com");
    expect(errors.join("\n").toLowerCase()).toContain("forbidden");
  });

  it("accepts an external author when the canonical committer is trusted", () => {
    expect(
      validateCommitAttribution(
        commitMetadata({
          author: {
            name: "Ada Lovelace",
            email: "ada@example.org",
          },
        }),
      ),
    ).toEqual([]);
  });

  it("does not grant an external committer canonical push authority", () => {
    expect(
      validateCommitAttribution(
        commitMetadata({
          committer: {
            name: "Ada Lovelace",
            email: "ada@example.org",
          },
        }),
      ),
    ).not.toEqual([]);
  });

  it("allows an attributable external committer only for an explicit fork policy", () => {
    const externalMetadata = commitMetadata({
      author: { name: "Ada Lovelace", email: "ada@example.org" },
      committer: { name: "Ada Lovelace", email: "ada@example.org" },
    });
    const externalActors = unsignedActorEvidence({
      authorLogin: "ada-lovelace",
      committerLogin: "ada-lovelace",
      eventActorLogin: "ada-lovelace",
    });

    expect(
      validateGitHubActorAttribution(externalMetadata, externalActors, {
        allowExternalAuthor: true,
        allowExternalCommitter: true,
      }),
    ).toEqual([]);
    expect(
      validateGitHubActorAttribution(externalMetadata, externalActors, {
        allowExternalAuthor: true,
      }),
    ).not.toEqual([]);
  });

  it("fails closed when a trusted identity lacks authenticated proof", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata(),
        unsignedActorEvidence({
          authorLogin: null,
          eventActorLogin: "unrelated-user",
        }),
        { allowEventActorProof: true },
      ),
    ).not.toEqual([]);
  });

  it("binds Conrad's unsigned tuple to the authenticated same-repo event actor", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata(),
        unsignedActorEvidence(),
        { allowEventActorProof: true },
      ),
    ).toEqual([]);
  });

  it("rejects an unsigned fork commit that spoofs Conrad's public noreply tuple", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata(),
        unsignedActorEvidence({ eventActorLogin: "mallory" }),
        {
          allowExternalAuthor: true,
          allowExternalCommitter: true,
        },
      ),
    ).not.toEqual([]);
  });

  it("does not let a matching actor bypass signature proof for a fork", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata(),
        unsignedActorEvidence(),
        {
          allowExternalAuthor: true,
          allowExternalCommitter: true,
          allowEventActorProof: false,
        },
      ),
    ).not.toEqual([]);
  });

  it("rejects a matching actor login with the wrong immutable account id", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata(),
        unsignedActorEvidence({ eventActorId: 123_456 }),
        { allowEventActorProof: true },
      ),
    ).not.toEqual([]);
  });

  it("rejects a registered tuple whose REST association has the wrong immutable id", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata(),
        unsignedActorEvidence({ authorId: 123_456 }),
        { allowEventActorProof: true },
      ),
    ).not.toEqual([]);
  });

  it("rejects an unproven registered author claim carried by an external committer", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata({
          committer: { name: "Ada Lovelace", email: "ada@example.org" },
        }),
        unsignedActorEvidence({
          committerLogin: "ada-lovelace",
          eventActorLogin: "ada-lovelace",
          eventActorId: 123_456,
        }),
        {
          allowExternalAuthor: true,
          allowExternalCommitter: true,
        },
      ),
    ).not.toEqual([]);
  });

  it("accepts a same-repo external author with Conrad as accountable committer", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata({
          author: { name: "Ada Lovelace", email: "ada@example.org" },
        }),
        unsignedActorEvidence({ authorLogin: "ada-lovelace" }),
        {
          allowExternalAuthor: true,
          allowEventActorProof: true,
        },
      ),
    ).toEqual([]);
  });

  it("accepts a fork commit using Conrad's tuple only when Conrad is the verified signer", () => {
    expect(
      validateGitHubActorAttribution(commitMetadata(), signedActorEvidence(), {
        allowExternalAuthor: true,
        allowExternalCommitter: true,
      }),
    ).toEqual([]);
  });

  it("accepts a verified Conrad signature when a same-repo event actor differs", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata(),
        signedActorEvidence({
          eventActorId: blakeGithubId,
          eventActorLogin: blakeGithubLogin,
        }),
        { allowEventActorProof: true },
      ),
    ).toEqual([]);
  });

  it("accepts a signed Cursor Cloud commit under the Cursor workflow actor", () => {
    const cursorIdentity = {
      name: "Cursor Agent",
      email: cursorAgentEmail,
    };

    expect(
      validateGitHubActorAttribution(
        commitMetadata({ author: cursorIdentity, committer: cursorIdentity }),
        signedActorEvidence({
          authorLogin: cursorAgentLogin,
          committerLogin: cursorAgentLogin,
          eventActorLogin: "cursor[bot]",
          eventActorId: 206_951_365,
          signatureEmail: cursorAgentEmail,
          signerLogin: cursorAgentLogin,
          signerId: cursorAgentId,
        }),
        { allowEventActorProof: true },
      ),
    ).toEqual([]);
  });

  it("accepts an unsigned PR-loop repair commit under the matching bot actor", () => {
    const prLoopIdentity = { name: "Blake", email: prLoopBotEmail };

    expect(
      validateGitHubActorAttribution(
        commitMetadata({ author: prLoopIdentity, committer: prLoopIdentity }),
        unsignedActorEvidence({
          authorLogin: prLoopBotLogin,
          committerLogin: prLoopBotLogin,
          eventActorLogin: prLoopBotLogin,
          eventActorId: prLoopBotId,
        }),
        { allowEventActorProof: true },
      ),
    ).toEqual([]);
  });

  it("keeps the PR author's earlier unsigned commits valid when a bot synchronizes the branch", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata(),
        {
          ...unsignedActorEvidence({
            eventActorId: prLoopBotId,
            eventActorLogin: prLoopBotLogin,
          }),
          pullRequestAuthorId: conradGithubId,
          pullRequestAuthorLogin: conradGithubLogin,
        },
        { allowEventActorProof: true },
      ),
    ).toEqual([]);
  });

  it("accepts signature proof when sender metadata is ghost and actor id is absent", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata(),
        {
          ...signedActorEvidence({
            eventActorId: undefined,
            eventActorLogin: "ghost",
          }),
          eventSenderLogin: "ghost",
        },
        { allowEventActorProof: true },
      ),
    ).toEqual([]);
  });

  it("rejects a trusted tuple signed by a different GitHub account", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata(),
        signedActorEvidence({ signerLogin: "mallory" }),
        { allowEventActorProof: true },
      ),
    ).not.toEqual([]);
  });

  it("rejects a forbidden signer even for an external tuple", () => {
    const externalMetadata = commitMetadata({
      author: { name: "Ada Lovelace", email: "ada@example.org" },
      committer: { name: "Ada Lovelace", email: "ada@example.org" },
    });
    const forbiddenSignature = signedActorEvidence({
      authorLogin: "ada-lovelace",
      committerLogin: "ada-lovelace",
      signerLogin: "renamed-legacy-user",
      signerId: 53_842_349,
    });

    expect(
      validateGitHubActorAttribution(externalMetadata, forbiddenSignature, {
        allowExternalAuthor: true,
        allowExternalCommitter: true,
      }).join("\n"),
    ).toContain("forbidden");
  });

  it("rejects cross-wired GitHub associations for registered tuples", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata({ committer: blakeIdentity }),
        unsignedActorEvidence({
          authorLogin: blakeGithubLogin,
          committerLogin: conradGithubLogin,
          eventActorLogin: blakeGithubLogin,
          eventActorId: blakeGithubId,
        }),
        { allowEventActorProof: true },
      ),
    ).not.toEqual([]);
  });

  it("rejects a forbidden GitHub association even for an allowed external author", () => {
    const errors = validateGitHubActorAttribution(
      commitMetadata({
        author: {
          name: "Historical Contributor",
          email: "historical@example.org",
        },
      }),
      unsignedActorEvidence({
        authorLogin: "abiatarprado",
      }),
      { allowExternalAuthor: true, allowEventActorProof: true },
    );

    expect(errors.join("\n")).toContain("abiatarprado");
    expect(errors.join("\n").toLowerCase()).toContain("forbidden");
  });

  it.each([
    {
      label: "workflow actor",
      principal: { eventActorId: 53_842_349, eventActorLogin: "abiatarprado" },
    },
    {
      label: "renamed workflow actor id",
      principal: { eventActorId: 53_842_349, eventActorLogin: "renamed-user" },
    },
    {
      label: "webhook sender",
      principal: {
        eventSenderId: 53_842_349,
        eventSenderLogin: "abiatarprado",
      },
    },
    {
      label: "pull request author",
      principal: {
        pullRequestAuthorId: 53_842_349,
        pullRequestAuthorLogin: "abiatarprado",
      },
    },
    {
      label: "pull request head owner",
      principal: {
        headOwnerId: 53_842_349,
        headOwnerLogin: "abiatarprado",
      },
    },
    {
      label: "workflow triggering actor",
      principal: { triggeringActorLogin: "abiatarprado" },
    },
  ])("rejects a forbidden $label independently", ({ principal }) => {
    const externalMetadata = commitMetadata({
      author: { name: "Ada Lovelace", email: "ada@example.org" },
      committer: { name: "Ada Lovelace", email: "ada@example.org" },
    });
    const errors = validateGitHubActorAttribution(
      externalMetadata,
      {
        ...unsignedActorEvidence({
          authorLogin: "ada-lovelace",
          committerLogin: "ada-lovelace",
        }),
        ...principal,
      },
      {
        allowExternalAuthor: true,
        allowExternalCommitter: true,
      },
    );

    expect(errors.join("\n").toLowerCase()).toContain("forbidden");
  });

  it("rejects a human event actor presenting Eve's unsigned tuple", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata({ author: eveIdentity, committer: eveIdentity }),
        unsignedActorEvidence({
          authorLogin: asymmetricCoreEveBotLogin,
          committerLogin: asymmetricCoreEveBotLogin,
        }),
        { allowEventActorProof: true },
      ),
    ).not.toEqual([]);
  });

  it("preserves Blake's unsigned tuple for Blake's same-repo event", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata({
          author: blakeIdentity,
          committer: blakeIdentity,
        }),
        unsignedActorEvidence({
          authorLogin: blakeGithubLogin,
          committerLogin: blakeGithubLogin,
          eventActorLogin: blakeGithubLogin,
          eventActorId: blakeGithubId,
        }),
        { allowEventActorProof: true },
      ),
    ).toEqual([]);
  });

  it("rejects a direct non-platform commit on a protected-branch push", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata(),
        unsignedActorEvidence(),
        {
          allowEventActorProof: true,
          requireGitHubPlatformCommit: true,
        },
      ).join("\n"),
    ).toContain("platform merge");
  });

  it("preserves Eve's tuple when Eve is the verified signer", () => {
    expect(
      validateGitHubActorAttribution(
        commitMetadata({
          author: eveIdentity,
          committer: eveIdentity,
        }),
        signedActorEvidence({
          authorLogin: asymmetricCoreEveBotLogin,
          committerLogin: asymmetricCoreEveBotLogin,
          eventActorLogin: asymmetricCoreEveBotLogin,
          eventActorId: asymmetricCoreEveBotId,
          signatureEmail: asymmetricCoreEveBotEmail,
          signerLogin: asymmetricCoreEveBotLogin,
          signerId: asymmetricCoreEveBotId,
        }),
      ),
    ).toEqual([]);
  });

  it("accepts a verified GitHub web-flow platform commit", () => {
    expect(
      validateGitHubActorAttribution(
        {
          sha: attributionBaselineSha,
          authorName: "ricky",
          authorEmail: blakeNoReplyEmail,
          committerName: "GitHub",
          committerEmail: "noreply@github.com",
          parentShas: ["1".repeat(40), "2".repeat(40)],
        },
        signedActorEvidence({
          authorLogin: blakeGithubLogin,
          committerLogin: "web-flow",
          eventActorLogin: blakeGithubLogin,
          signatureEmail: "noreply@github.com",
          signerLogin: "web-flow",
          signerId: githubPlatformId,
          wasSignedByGitHub: true,
        }),
        { requireGitHubPlatformCommit: true },
      ),
    ).toEqual([]);
  });

  it("rejects a platform commit whose registered author association has the wrong immutable id", () => {
    expect(
      validateGitHubActorAttribution(
        {
          sha: "3".repeat(40),
          authorName: conradName,
          authorEmail: conradNoReplyEmail,
          committerName: "GitHub",
          committerEmail: "noreply@github.com",
          parentShas: ["1".repeat(40), "2".repeat(40)],
        },
        signedActorEvidence({
          authorId: blakeGithubId,
          authorLogin: conradGithubLogin,
          committerId: githubPlatformId,
          committerLogin: "web-flow",
          signatureEmail: "noreply@github.com",
          signerId: githubPlatformId,
          signerLogin: "web-flow",
          wasSignedByGitHub: true,
        }),
        { requireGitHubPlatformCommit: true },
      ),
    ).not.toEqual([]);
  });

  it("rejects a locally forged GitHub platform committer", () => {
    expect(
      validateCommitAttribution({
        sha: "forged123",
        authorName: conradName,
        authorEmail: conradNoReplyEmail,
        committerName: "GitHub",
        committerEmail: "noreply@github.com",
      }),
    ).not.toEqual([]);
  });

  it("rejects a GitHub platform envelope not resolved to web-flow", () => {
    expect(
      validateGitHubActorAttribution(
        {
          sha: "forged123",
          authorName: "ricky",
          authorEmail: blakeNoReplyEmail,
          committerName: "GitHub",
          committerEmail: "noreply@github.com",
        },
        signedActorEvidence({
          authorLogin: blakeGithubLogin,
          committerLogin: conradGithubLogin,
          eventActorLogin: blakeGithubLogin,
          signatureEmail: "noreply@github.com",
          signerLogin: conradGithubLogin,
          wasSignedByGitHub: true,
        }),
      ),
    ).not.toEqual([]);
  });

  it("rejects a valid web-flow signature not made with GitHub's signing key", () => {
    expect(
      validateGitHubActorAttribution(
        {
          sha: "forged123",
          authorName: "ricky",
          authorEmail: blakeNoReplyEmail,
          committerName: "GitHub",
          committerEmail: "noreply@github.com",
        },
        signedActorEvidence({
          authorLogin: blakeGithubLogin,
          committerLogin: "web-flow",
          signatureEmail: "noreply@github.com",
          signerId: githubPlatformId,
          signerLogin: "web-flow",
          wasSignedByGitHub: false,
        }),
      ),
    ).not.toEqual([]);
  });

  it("rejects an unverified GitHub web-flow platform commit", () => {
    expect(
      validateGitHubActorAttribution(
        {
          sha: "unsigned123",
          authorName: "ricky",
          authorEmail: blakeNoReplyEmail,
          committerName: "GitHub",
          committerEmail: "noreply@github.com",
        },
        {
          authorLogin: blakeGithubLogin,
          committerLogin: "web-flow",
          eventActorLogin: blakeGithubLogin,
          signature: {
            email: "noreply@github.com",
            isValid: false,
            signerLogin: null,
            state: "UNSIGNED",
            wasSignedByGitHub: false,
          },
        },
      ),
    ).not.toEqual([]);
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

  it("parses the GraphQL signature signer account", () => {
    expect(
      parseGitHubSignaturePayload(
        {
          data: {
            repository: {
              object: {
                oid: attributionBaselineSha,
                signature: {
                  email: "noreply@github.com",
                  isValid: true,
                  signer: {
                    databaseId: githubPlatformId,
                    login: "web-flow",
                  },
                  state: "VALID",
                  wasSignedByGitHub: true,
                },
              },
            },
          },
        },
        attributionBaselineSha,
      ),
    ).toEqual({
      email: "noreply@github.com",
      isValid: true,
      signerId: githubPlatformId,
      signerLogin: "web-flow",
      state: "VALID",
      wasSignedByGitHub: true,
    });
  });

  it("fails closed for mismatched or incomplete GraphQL signature metadata", () => {
    expect(() =>
      parseGitHubSignaturePayload(
        {
          data: {
            repository: {
              object: { oid: attributionBaselineSha, signature: null },
            },
          },
          errors: [{ message: "denied" }],
        },
        attributionBaselineSha,
      ),
    ).toThrow();
    expect(() =>
      parseGitHubSignaturePayload(
        { data: { repository: { object: { oid: "wrong" } } } },
        attributionBaselineSha,
      ),
    ).toThrow();
    expect(() =>
      parseGitHubSignaturePayload(
        {
          data: {
            repository: {
              object: {
                oid: attributionBaselineSha,
                signature: { isValid: true },
              },
            },
          },
        },
        attributionBaselineSha,
      ),
    ).toThrow();
    expect(() =>
      parseGitHubSignaturePayload(
        {
          data: {
            repository: {
              object: {
                oid: attributionBaselineSha,
                signature: {
                  email: "conrad@example.com",
                  isValid: true,
                  signer: { login: conradGithubLogin },
                  state: "VALID",
                  wasSignedByGitHub: false,
                },
              },
            },
          },
        },
        attributionBaselineSha,
      ),
    ).toThrow();
  });

  it("parses GitHub origin URLs", () => {
    expect(parseGitHubRepoSlug("git@github.com:Asymmetric-al/core.git")).toBe(
      "Asymmetric-al/core",
    );
    expect(
      parseGitHubRepoSlug("https://github.com/Asymmetric-al/core.git"),
    ).toBe("Asymmetric-al/core");
    expect(
      parseGitHubRepoSlug("ssh://git@github.com/Asymmetric-al/core.git"),
    ).toBe("Asymmetric-al/core");
  });

  it("uses full PR ancestry and first-parent protected-push ancestry", () => {
    const baseSha = "1".repeat(40);
    const headSha = "2".repeat(40);
    const childSha = "3".repeat(40);
    const runGit = vi.fn(() => `${headSha}\n${childSha}\n`);

    expect(
      collectCiCommitShas({
        baseSha,
        eventName: "pull_request",
        headSha,
        runGit,
      }),
    ).toEqual([headSha, childSha]);
    expect(runGit).toHaveBeenLastCalledWith([
      "rev-list",
      `${baseSha}..${headSha}`,
    ]);

    collectCiCommitShas({
      baseSha,
      eventName: "push",
      headSha,
      refName: "develop",
      refType: "branch",
      runGit,
      runGitStatus: () => 0,
    });
    expect(runGit).toHaveBeenLastCalledWith([
      "rev-list",
      "--first-parent",
      `${baseSha}..${headSha}`,
    ]);

    collectCiCommitShas({
      baseSha,
      eventName: "workflow_dispatch",
      headSha,
      refName: "feature/diagnostic",
      refType: "branch",
      runGit,
    });
    expect(runGit).toHaveBeenLastCalledWith([
      "rev-list",
      headSha,
      "--not",
      attributionBaselineSha,
    ]);

    collectCiCommitShas({
      eventName: "workflow_dispatch",
      headSha,
      refName: "develop",
      refType: "branch",
      runGit,
    });
    expect(runGit).toHaveBeenLastCalledWith([
      "rev-list",
      "--first-parent",
      headSha,
      "--not",
      attributionBaselineSha,
    ]);

    expect(() =>
      collectCiCommitShas({
        eventName: "push",
        headSha,
        refName: "develop",
        refType: "branch",
        runGit,
        runGitStatus: () => 0,
      }),
    ).toThrow("nonzero base SHA");
  });

  it("requires exact merged-PR provenance for develop integration commits", () => {
    const baseSha = "1".repeat(40);
    const headSha = "2".repeat(40);
    const mergeSha = "3".repeat(40);
    const metadata = {
      ...commitMetadata(),
      parentShas: [baseSha, headSha],
      sha: mergeSha,
    };
    const pullRequest = {
      base: {
        ref: "develop",
        repo: { full_name: "Asymmetric-al/core" },
        sha: baseSha,
      },
      head: { sha: headSha },
      merge_commit_sha: mergeSha,
      merged_at: "2026-08-25T00:00:00Z",
      state: "closed",
    };

    expect(
      validateDevelopMergeProvenance({ metadata, pullRequests: [pullRequest] }),
    ).toEqual([]);
    expect(
      validateDevelopMergeProvenance({
        metadata,
        pullRequests: [
          {
            ...pullRequest,
            base: { ...pullRequest.base, sha: "4".repeat(40) },
          },
        ],
      }),
    ).not.toEqual([]);
  });

  it("requires production promotions to already be reachable from develop", () => {
    const headSha = "2".repeat(40);

    expect(
      validateProductionPromotion({
        comparison: { merge_base_commit: { sha: headSha } },
        headSha,
      }),
    ).toEqual([]);
    expect(
      validateProductionPromotion({
        comparison: { merge_base_commit: { sha: "3".repeat(40) } },
        headSha,
      }),
    ).not.toEqual([]);
  });

  it.each(["develop", "production"])(
    "wires %s protected integration provenance into CI verification",
    (refName) => {
      const baseSha = "1".repeat(40);
      const headParent = "2".repeat(40);
      const headSha = "3".repeat(40);
      const readPullRequests = vi.fn(() => [
        {
          base: {
            ref: "develop",
            repo: { full_name: "Asymmetric-al/core" },
            sha: baseSha,
          },
          head: { sha: headParent },
          merge_commit_sha: headSha,
          merged_at: "2026-08-25T00:00:00Z",
          state: "closed",
        },
      ]);
      const readComparison = vi.fn(() => ({
        merge_base_commit: { sha: headSha },
      }));

      const result = collectCiVerification({
        collectCommitShas: () => [headSha],
        environment: {
          ASYM_GITHUB_BASE_SHA: baseSha,
          ASYM_GITHUB_EVENT_ACTOR_ID: String(blakeGithubId),
          ASYM_GITHUB_EVENT_ACTOR_LOGIN: blakeGithubLogin,
          ASYM_GITHUB_EVENT_NAME: "push",
          ASYM_GITHUB_HEAD_REPOSITORY: "Asymmetric-al/core",
          ASYM_GITHUB_HEAD_SHA: headSha,
          ASYM_GITHUB_REF_NAME: refName,
          ASYM_GITHUB_REF_TYPE: "branch",
          ASYM_GITHUB_REPOSITORY: "Asymmetric-al/core",
          ASYM_GITHUB_TRIGGERING_ACTOR_LOGIN: blakeGithubLogin,
        },
        isHistorical: () => false,
        readCommit: () => ({
          actors: {
            authorId: blakeGithubId,
            authorLogin: blakeGithubLogin,
            committerId: githubPlatformId,
            committerLogin: "web-flow",
          },
          metadata: {
            authorEmail: blakeNoReplyEmail,
            authorName: "Blake",
            committerEmail: "noreply@github.com",
            committerName: "GitHub",
            parentShas: [baseSha, headParent],
            sha: headSha,
          },
        }),
        readComparison,
        readPullRequests,
        readSignature: () => ({
          email: "noreply@github.com",
          isValid: true,
          signerId: githubPlatformId,
          signerLogin: "web-flow",
          state: "VALID",
          wasSignedByGitHub: true,
        }),
      });

      expect(result.errors).toEqual([]);
      if (refName === "develop") {
        expect(readPullRequests).toHaveBeenCalledWith({
          repoSlug: "Asymmetric-al/core",
          sha: headSha,
        });
        expect(readComparison).not.toHaveBeenCalled();
      } else {
        expect(readComparison).toHaveBeenCalledWith({
          base: headSha,
          head: "develop",
          repoSlug: "Asymmetric-al/core",
        });
        expect(readPullRequests).not.toHaveBeenCalled();
      }
    },
  );

  it("resolves a rerun actor to an immutable account id", () => {
    const readGithubUser = vi.fn(() => ({
      id: 53_842_349,
      login: "renamed-legacy-user",
    }));

    expect(
      resolveTriggeringActor({
        eventActorId: conradGithubId,
        eventActorLogin: conradGithubLogin,
        readGithubUser,
        triggeringActorLogin: "renamed-legacy-user",
      }),
    ).toEqual({
      id: 53_842_349,
      login: "renamed-legacy-user",
    });
    expect(readGithubUser).toHaveBeenCalledWith("renamed-legacy-user");
  });
});
