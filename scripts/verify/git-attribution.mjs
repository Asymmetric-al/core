#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ATTRIBUTION_BASELINE_SHA,
  GITHUB_PLATFORM_COMMITTER,
  TRUSTED_IDENTITIES,
  findTrustedIdentityByGitIdentity,
  findTrustedIdentityByGithubLogin,
  githubAccountMatches,
  isForbiddenGitEmail,
  isForbiddenGithubId,
  isForbiddenGithubLogin,
  isGitHubPlatformIdentity,
  parseGitHubRepoSlug,
  usesGitHubPlatformIdentityField,
} from "../git/trusted-identities.mjs";
import { parsePrePushUpdates } from "../git/pre-push-guard.mjs";

const CANONICAL_REPOSITORY = "Asymmetric-al/core";
const GITHUB_API_TIMEOUT_MS = 60_000;
const ZERO_SHA = "0".repeat(40);
const FULL_SHA_PATTERN = /^[0-9a-f]{40}$/i;

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function normalizeLogin(login) {
  return typeof login === "string" ? login.trim().toLowerCase() : "";
}

const trustedTupleSummary = TRUSTED_IDENTITIES.map(
  ({ name, email }) => `${name} <${email}>`,
).join(" or ");

function sameLogin(actual, expected) {
  return normalizeLogin(actual) === normalizeLogin(expected);
}

function formatIdentity({ name, email }) {
  return `${name ?? "<missing name>"} <${email ?? "<missing email>"}>`;
}

export function parseGitIdentity(identity) {
  const match = /^(?<name>.+) <(?<email>[^>]+)> \d+ [+-]\d+$/.exec(
    identity.trim(),
  );

  if (!match?.groups) {
    return null;
  }

  return {
    name: match.groups.name,
    email: match.groups.email,
  };
}

export function parseLatestCommitLog(value) {
  const fields = value.trimEnd().split("\0");

  if (fields.length !== 5) {
    return null;
  }

  const [sha, authorName, authorEmail, committerName, committerEmail] = fields;

  return {
    sha,
    authorName,
    authorEmail,
    committerName,
    committerEmail,
  };
}

export { parseGitHubRepoSlug };

function assertFullSha(value, label) {
  if (typeof value !== "string" || !FULL_SHA_PATTERN.test(value)) {
    throw new Error(`${label} must be a full 40-character Git SHA`);
  }
}

function splitCommitShas(output, label) {
  if (!output.trim()) {
    return [];
  }

  return output
    .split(/\r?\n/)
    .map((sha) => sha.trim())
    .filter(Boolean)
    .map((sha) => {
      assertFullSha(sha, `${label} commit`);
      return sha;
    });
}

export function collectOutgoingCommitShas({
  updates,
  remoteName,
  runGit,
  runGitStatus: readGitStatus,
}) {
  if (!Array.isArray(updates)) {
    throw new Error("pre-push updates must be an array");
  }

  if (typeof remoteName !== "string" || remoteName.trim().length === 0) {
    throw new Error("pre-push remote name is required");
  }

  if (typeof runGit !== "function") {
    throw new Error("runGit must be a function");
  }

  const commits = new Set();

  for (const update of updates) {
    if (
      !update ||
      typeof update.localRef !== "string" ||
      typeof update.remoteRef !== "string"
    ) {
      throw new Error("pre-push update refs are malformed");
    }

    assertFullSha(update.localSha, "pre-push local SHA");
    assertFullSha(update.remoteSha, "pre-push remote SHA");

    if (update.localSha === ZERO_SHA) {
      continue;
    }

    let output;

    if (update.remoteSha === ZERO_SHA) {
      const resolvedCommit = runGit([
        "rev-parse",
        `${update.localSha}^{commit}`,
      ]).trim();
      assertFullSha(resolvedCommit, "resolved pushed commit");

      if (typeof readGitStatus !== "function") {
        throw new Error("runGitStatus is required for a new pre-push ref");
      }

      const remoteRefs = runGit([
        "ls-remote",
        "--refs",
        "--heads",
        "--tags",
        remoteName,
      ])
        .split(/\r?\n/)
        .filter(Boolean)
        .filter((line) => !line.trimEnd().endsWith("^{}"))
        .map((line) => {
          const [sha, ref] = line.trim().split(/\s+/, 2);

          assertFullSha(sha, "remote ref tip");
          if (
            !ref?.startsWith("refs/heads/") &&
            !ref?.startsWith("refs/tags/")
          ) {
            throw new Error(`remote ref is malformed: ${line}`);
          }

          return { ref, sha };
        })
        .filter(
          ({ sha }, index, refs) =>
            refs.findIndex((candidate) => candidate.sha === sha) === index,
        );
      const missingRemoteRefs = remoteRefs.filter(
        ({ sha }) => readGitStatus(["cat-file", "-e", `${sha}^{commit}`]) !== 0,
      );

      if (missingRemoteRefs.length > 0) {
        runGit([
          "fetch",
          "--quiet",
          "--no-tags",
          "--no-write-fetch-head",
          remoteName,
          ...missingRemoteRefs.map(({ ref }) => ref),
        ]);
      }

      const remoteTips = [];

      for (const { ref, sha } of remoteRefs) {
        if (readGitStatus(["cat-file", "-e", `${sha}^{commit}`]) === 0) {
          remoteTips.push(sha);
        } else if (ref.startsWith("refs/heads/")) {
          throw new Error(`remote branch tip could not be inspected: ${sha}`);
        }
      }
      output = runGit([
        "rev-list",
        resolvedCommit,
        ...(remoteTips.length > 0 ? ["--not", ...remoteTips] : []),
      ]);
    } else {
      output = runGit(["rev-list", `${update.remoteSha}..${update.localSha}`]);
    }

    for (const sha of splitCommitShas(output, update.remoteRef)) {
      commits.add(sha);
    }
  }

  return [...commits];
}

export function isHistoricalCommit({ sha, baselineSha, runGitStatus }) {
  assertFullSha(sha, "candidate commit");
  assertFullSha(baselineSha, "attribution baseline");

  if (typeof runGitStatus !== "function") {
    throw new Error("runGitStatus must be a function");
  }

  const status = runGitStatus([
    "merge-base",
    "--is-ancestor",
    sha,
    baselineSha,
  ]);

  if (status === 0) {
    return true;
  }

  if (status === 1) {
    return false;
  }

  throw new Error(
    `git could not compare ${sha} with attribution baseline ${baselineSha} (exit ${status})`,
  );
}

export function validateIdentity({
  label,
  name,
  email,
  requireTrusted = true,
  allowPlatformAlias = false,
}) {
  const errors = [];

  if (typeof name !== "string" || name.length === 0) {
    errors.push(`${label} name is missing`);
  }

  if (typeof email !== "string" || email.length === 0) {
    errors.push(`${label} email is missing`);
  }

  if (errors.length > 0) {
    return errors;
  }

  if (isForbiddenGitEmail(email)) {
    errors.push(`${label} email ${email} is forbidden`);
    return errors;
  }

  if (usesGitHubPlatformIdentityField({ name, email })) {
    errors.push(
      `${label} identity ${formatIdentity({ name, email })} is reserved for verified GitHub platform commits`,
    );
    return errors;
  }

  const trustedIdentity = findTrustedIdentityByGitIdentity(
    { name, email },
    { allowPlatformAlias },
  );

  if (trustedIdentity) {
    return errors;
  }

  const registeredEmail = TRUSTED_IDENTITIES.find(
    (identity) => normalizeEmail(identity.email) === normalizeEmail(email),
  );

  if (registeredEmail) {
    errors.push(
      `${label} identity ${formatIdentity({ name, email })} does not match the exact tuple registered for ${registeredEmail.githubLogin}`,
    );
    return errors;
  }

  if (requireTrusted) {
    errors.push(
      `${label} identity ${formatIdentity({ name, email })} is not registered; use ${trustedTupleSummary}`,
    );
  }

  return errors;
}

export function validateGitIdent(label, identity, options = {}) {
  const parsed = parseGitIdentity(identity);

  if (!parsed) {
    return [`${label} identity could not be parsed: ${identity}`];
  }

  return validateIdentity({ label, ...parsed, ...options });
}

export function validateLocalGitConfig(
  { userName, userEmail },
  { requireTrusted = true } = {},
) {
  return validateIdentity({
    label: "local git config",
    name: userName,
    email: userEmail,
    requireTrusted,
  });
}

function validateRemoteIdentity({
  allowExternal,
  allowPlatformAlias,
  id,
  identity,
  label,
  login,
}) {
  const errors = [];

  errors.push(
    ...validateIdentity({
      label,
      ...identity,
      requireTrusted: false,
      allowPlatformAlias,
    }),
  );

  if (!login) {
    errors.push(`${label} GitHub actor did not resolve to an account`);
    return errors;
  }

  if (isForbiddenGithubLogin(login)) {
    errors.push(`${label} GitHub actor ${login} is forbidden`);
    return errors;
  }

  const trustedIdentity = findTrustedIdentityByGitIdentity(identity, {
    allowPlatformAlias,
  });

  if (trustedIdentity) {
    if (!githubAccountMatches(trustedIdentity, { id, login })) {
      errors.push(
        `${label} GitHub association resolved to ${formatGithubAccount(login, id)}; ${formatIdentity(identity)} must resolve to ${formatGithubAccount(trustedIdentity.githubLogin, trustedIdentity.githubId)}`,
      );
    }

    return errors;
  }

  const registeredActor = findTrustedIdentityByGithubLogin(login);

  if (registeredActor) {
    errors.push(
      `${label} GitHub actor ${login} is reserved for its registered identity tuple`,
    );
  } else if (sameLogin(login, GITHUB_PLATFORM_COMMITTER.githubLogin)) {
    errors.push(
      `${label} GitHub actor ${login} is reserved for verified platform commits`,
    );
  } else if (!allowExternal) {
    errors.push(
      `${label} identity ${formatIdentity(identity)} is not a registered trusted tuple`,
    );
  }

  return errors;
}

function formatGithubAccount(login, id) {
  const formattedLogin = login || "no account";
  const formattedId = id === undefined || id === null || id === "" ? "?" : id;
  return `${formattedLogin} (id ${formattedId})`;
}

function validateForbiddenGithubPrincipal(label, login, id) {
  if (isForbiddenGithubLogin(login) || isForbiddenGithubId(id)) {
    return [`${label} ${formatGithubAccount(login, id)} is forbidden`];
  }

  return [];
}

function validateForbiddenGithubPrincipals(actors) {
  return [
    ["commit author association", actors?.authorLogin, actors?.authorId],
    [
      "commit committer association",
      actors?.committerLogin,
      actors?.committerId,
    ],
    ["workflow actor", actors?.eventActorLogin, actors?.eventActorId],
    ["webhook sender", actors?.eventSenderLogin, actors?.eventSenderId],
    [
      "pull request author",
      actors?.pullRequestAuthorLogin,
      actors?.pullRequestAuthorId,
    ],
    ["pull request head owner", actors?.headOwnerLogin, actors?.headOwnerId],
    [
      "workflow triggering actor",
      actors?.triggeringActorLogin,
      actors?.triggeringActorId,
    ],
    [
      "commit signature signer",
      actors?.signature?.signerLogin,
      actors?.signature?.signerId,
    ],
  ].flatMap(([label, login, id]) =>
    validateForbiddenGithubPrincipal(label, login, id),
  );
}

function isValidSignature(signature) {
  return signature?.isValid === true && signature?.state === "VALID";
}

function validateRegisteredIdentityProof({
  actors,
  allowEventActorProof,
  identity,
  label,
}) {
  const signature = actors?.signature;

  if (signature) {
    if (!isValidSignature(signature)) {
      return [`${label} commit signature is not valid`];
    }

    if (
      !githubAccountMatches(identity, {
        id: signature.signerId,
        login: signature.signerLogin,
      })
    ) {
      return [
        `${label} verified signer resolved to ${formatGithubAccount(
          signature.signerLogin,
          signature.signerId,
        )}; ${formatIdentity(identity)} requires ${formatGithubAccount(
          identity.githubLogin,
          identity.githubId,
        )}`,
      ];
    }

    return [];
  }

  if (
    allowEventActorProof &&
    [
      { id: actors?.eventActorId, login: actors?.eventActorLogin },
      {
        id: actors?.pullRequestAuthorId,
        login: actors?.pullRequestAuthorLogin,
      },
    ].some((account) => githubAccountMatches(identity, account))
  ) {
    return [];
  }

  return [
    `${label} identity ${formatIdentity(identity)} lacks authenticated proof; require its verified signer or matching same-repository event actor or pull-request author ${formatGithubAccount(identity.githubLogin, identity.githubId)}`,
  ];
}

export function validateGitHubActorAttribution(
  metadata,
  actors,
  {
    allowEventActorProof = false,
    allowExternalAuthor = false,
    allowExternalCommitter = false,
    requireGitHubPlatformCommit = false,
  } = {},
) {
  const errors = [...validateForbiddenGithubPrincipals(actors)];
  const authorIdentity = {
    name: metadata.authorName,
    email: metadata.authorEmail,
  };
  const committerIdentity = {
    name: metadata.committerName,
    email: metadata.committerEmail,
  };
  const isPlatformCommit = isGitHubPlatformIdentity(committerIdentity);

  if (
    requireGitHubPlatformCommit &&
    (!isPlatformCommit || metadata.parentShas?.length !== 2)
  ) {
    errors.push(
      "protected-branch integration commits must be two-parent GitHub platform merges",
    );
  }
  const authorIdentityRecord = findTrustedIdentityByGitIdentity(
    authorIdentity,
    { allowPlatformAlias: isPlatformCommit },
  );
  const committerIdentityRecord =
    findTrustedIdentityByGitIdentity(committerIdentity);

  errors.push(
    ...validateRemoteIdentity({
      allowExternal: allowExternalAuthor,
      allowPlatformAlias: isPlatformCommit,
      id: actors?.authorId,
      identity: authorIdentity,
      label: "commit author",
      login: actors?.authorLogin,
    }),
  );

  if (isPlatformCommit) {
    if (
      !githubAccountMatches(GITHUB_PLATFORM_COMMITTER, {
        id: actors?.committerId,
        login: actors?.committerLogin,
      })
    ) {
      errors.push(
        `commit GitHub committer resolved to ${formatGithubAccount(actors?.committerLogin, actors?.committerId)}; platform commits must resolve to ${formatGithubAccount(GITHUB_PLATFORM_COMMITTER.githubLogin, GITHUB_PLATFORM_COMMITTER.githubId)}`,
      );
    }

    if (
      !isValidSignature(actors?.signature) ||
      actors?.signature?.wasSignedByGitHub !== true ||
      !githubAccountMatches(GITHUB_PLATFORM_COMMITTER, {
        id: actors?.signature?.signerId,
        login: actors?.signature?.signerLogin,
      })
    ) {
      errors.push(
        "commit GitHub platform signature must be valid, signed by GitHub, and resolve to web-flow",
      );
    }

    return errors;
  }

  errors.push(
    ...validateRemoteIdentity({
      allowExternal: allowExternalCommitter,
      allowPlatformAlias: false,
      id: actors?.committerId,
      identity: committerIdentity,
      label: "commit committer",
      login: actors?.committerLogin,
    }),
  );

  if (committerIdentityRecord) {
    errors.push(
      ...validateRegisteredIdentityProof({
        actors,
        allowEventActorProof,
        identity: committerIdentityRecord,
        label: "commit committer",
      }),
    );
  }

  if (
    authorIdentityRecord &&
    (!committerIdentityRecord ||
      authorIdentityRecord.githubId !== committerIdentityRecord.githubId)
  ) {
    errors.push(
      ...validateRegisteredIdentityProof({
        actors,
        allowEventActorProof,
        identity: authorIdentityRecord,
        label: "commit author",
      }),
    );
  }

  return errors;
}

export function validateCommitAttribution(
  metadata,
  { allowExternalAuthor = true, allowExternalCommitter = false } = {},
) {
  return [
    ...validateIdentity({
      label: "commit author",
      name: metadata.authorName,
      email: metadata.authorEmail,
      requireTrusted: !allowExternalAuthor,
    }),
    ...validateIdentity({
      label: "commit committer",
      name: metadata.committerName,
      email: metadata.committerEmail,
      requireTrusted: !allowExternalCommitter,
    }),
  ];
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: options.timeoutMs,
  });

  if (result.error) {
    return {
      ok: false,
      stdout: "",
      stderr: result.error.message,
      status: null,
    };
  }

  return {
    ok: result.status === 0,
    stdout: result.stdout.trimEnd(),
    stderr: result.stderr.trimEnd(),
    status: result.status,
  };
}

function runGitHubApi(args) {
  return run("gh", ["api", ...args], { timeoutMs: GITHUB_API_TIMEOUT_MS });
}

function mustRunGit(args) {
  const result = run("git", args);

  if (!result.ok) {
    throw new Error(
      `git ${args.join(" ")} failed: ${result.stderr || result.status}`,
    );
  }

  return result.stdout;
}

function runGitStatus(args) {
  return run("git", args).status ?? 128;
}

function parseStrictPrePushUpdates(input) {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const updates = parsePrePushUpdates(input);

  if (updates.length !== lines.length) {
    throw new Error("pre-push update input is malformed");
  }

  for (const [index, line] of lines.entries()) {
    if (line.split(/\s+/).length !== 4) {
      throw new Error(`pre-push update ${index + 1} is malformed`);
    }
  }

  return updates;
}

function readCommitMetadata(sha) {
  const metadata = parseLatestCommitLog(
    mustRunGit(["show", "-s", "--format=%H%x00%an%x00%ae%x00%cn%x00%ce", sha]),
  );

  if (!metadata || metadata.sha !== sha) {
    throw new Error(`commit metadata could not be parsed for ${sha}`);
  }

  return metadata;
}

function readGitHubCommit({ repoSlug, sha }) {
  const result = runGitHubApi([`repos/${repoSlug}/commits/${sha}`]);

  if (!result.ok) {
    throw new Error(
      `GitHub commit metadata was not available for ${sha}: ${result.stderr || result.status}`,
    );
  }

  let payload;

  try {
    payload = JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(
      `GitHub commit metadata was malformed for ${sha}: ${error.message}`,
    );
  }

  if (
    payload.sha !== sha ||
    !payload.commit?.author ||
    !payload.commit?.committer ||
    !Array.isArray(payload.parents)
  ) {
    throw new Error(`GitHub commit metadata was incomplete for ${sha}`);
  }

  return {
    metadata: {
      sha,
      authorName: payload.commit.author.name,
      authorEmail: payload.commit.author.email,
      committerName: payload.commit.committer.name,
      committerEmail: payload.commit.committer.email,
      parentShas: payload.parents.map((parent) => {
        assertFullSha(parent?.sha, "GitHub commit parent");
        return parent.sha;
      }),
    },
    actors: {
      authorId: payload.author?.id ?? null,
      authorLogin: payload.author?.login ?? null,
      committerId: payload.committer?.id ?? null,
      committerLogin: payload.committer?.login ?? null,
    },
  };
}

const GITHUB_COMMIT_SIGNATURE_QUERY = `
  query CommitSignature($owner: String!, $name: String!, $oid: GitObjectID!) {
    repository(owner: $owner, name: $name) {
      object(oid: $oid) {
        ... on Commit {
          oid
          signature {
            email
            isValid
            signer {
              databaseId
              login
            }
            state
            wasSignedByGitHub
          }
        }
      }
    }
  }
`;

function parseRepositorySlug(repoSlug) {
  const match = /^(?<owner>[A-Za-z0-9_.-]+)\/(?<name>[A-Za-z0-9_.-]+)$/.exec(
    repoSlug,
  );

  if (!match?.groups) {
    throw new Error(`GitHub repository slug is invalid: ${repoSlug}`);
  }

  return match.groups;
}

export function parseGitHubSignaturePayload(payload, sha) {
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    throw new Error(`GitHub commit signature query failed for ${sha}`);
  }

  const commit = payload?.data?.repository?.object;

  if (commit?.oid !== sha) {
    throw new Error(`GitHub commit signature response did not match ${sha}`);
  }

  if (!commit.signature) {
    return null;
  }

  if (
    typeof commit.signature.email !== "string" ||
    typeof commit.signature.isValid !== "boolean" ||
    typeof commit.signature.state !== "string" ||
    typeof commit.signature.wasSignedByGitHub !== "boolean"
  ) {
    throw new Error(`GitHub commit signature was incomplete for ${sha}`);
  }

  const signerId = commit.signature.signer?.databaseId ?? null;
  const signerLogin = commit.signature.signer?.login ?? null;

  if (
    (signerId === null) !== (signerLogin === null) ||
    (signerId !== null && !Number.isSafeInteger(signerId)) ||
    (signerLogin !== null && typeof signerLogin !== "string")
  ) {
    throw new Error(`GitHub commit signature signer was incomplete for ${sha}`);
  }

  return {
    email: commit.signature.email,
    isValid: commit.signature.isValid,
    signerId,
    signerLogin,
    state: commit.signature.state,
    wasSignedByGitHub: commit.signature.wasSignedByGitHub,
  };
}

function readGitHubSignature({ repoSlug, sha }) {
  const { owner, name } = parseRepositorySlug(repoSlug);
  const result = runGitHubApi([
    "graphql",
    "-f",
    `query=${GITHUB_COMMIT_SIGNATURE_QUERY}`,
    "-F",
    `owner=${owner}`,
    "-F",
    `name=${name}`,
    "-F",
    `oid=${sha}`,
  ]);

  if (!result.ok) {
    throw new Error(
      `GitHub commit signature was not available for ${sha}: ${result.stderr || result.status}`,
    );
  }

  let payload;

  try {
    payload = JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(
      `GitHub commit signature was malformed for ${sha}: ${error.message}`,
    );
  }

  return parseGitHubSignaturePayload(payload, sha);
}

function readAssociatedPullRequests({ repoSlug, sha }) {
  const result = runGitHubApi([`repos/${repoSlug}/commits/${sha}/pulls`]);

  if (!result.ok) {
    throw new Error(
      `GitHub pull-request provenance was not available for ${sha}: ${result.stderr || result.status}`,
    );
  }

  try {
    const payload = JSON.parse(result.stdout);

    if (!Array.isArray(payload)) {
      throw new Error("response was not an array");
    }

    return payload;
  } catch (error) {
    throw new Error(
      `GitHub pull-request provenance was malformed for ${sha}: ${error.message}`,
    );
  }
}

function readGitHubComparison({ base, head, repoSlug }) {
  assertFullSha(base, "GitHub comparison base");

  if (typeof head !== "string" || !/^[A-Za-z0-9._/-]+$/.test(head)) {
    throw new Error(`GitHub comparison head is invalid: ${head}`);
  }

  const result = runGitHubApi([`repos/${repoSlug}/compare/${base}...${head}`]);

  if (!result.ok) {
    throw new Error(
      `GitHub comparison was not available for ${base}...${head}: ${result.stderr || result.status}`,
    );
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`GitHub comparison was malformed: ${error.message}`);
  }
}

export function validateDevelopMergeProvenance({
  metadata,
  pullRequests,
  repository = CANONICAL_REPOSITORY,
}) {
  const [baseParent, headParent] = metadata?.parentShas ?? [];
  const hasExactMergedPullRequest =
    metadata?.parentShas?.length === 2 &&
    Array.isArray(pullRequests) &&
    pullRequests.some(
      (pullRequest) =>
        pullRequest?.state === "closed" &&
        typeof pullRequest?.merged_at === "string" &&
        pullRequest.merge_commit_sha === metadata.sha &&
        pullRequest.base?.repo?.full_name?.toLowerCase() ===
          repository.toLowerCase() &&
        pullRequest.base?.ref === "develop" &&
        pullRequest.base?.sha === baseParent &&
        pullRequest.head?.sha === headParent,
    );

  return hasExactMergedPullRequest
    ? []
    : [
        "develop integration commit is not the exact two-parent merge result of a closed Core pull request",
      ];
}

export function validateProductionPromotion({ comparison, headSha }) {
  return comparison?.merge_base_commit?.sha === headSha
    ? []
    : ["production head is not already reachable from canonical develop"];
}

function readGitHubUser(login) {
  if (typeof login !== "string" || !/^[A-Za-z0-9-]+(?:\[bot\])?$/.test(login)) {
    throw new Error(`GitHub login is invalid: ${login}`);
  }

  const result = runGitHubApi([`users/${encodeURIComponent(login)}`]);

  if (!result.ok) {
    throw new Error(
      `GitHub account metadata was not available for ${login}: ${result.stderr || result.status}`,
    );
  }

  let payload;

  try {
    payload = JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(
      `GitHub account metadata was malformed for ${login}: ${error.message}`,
    );
  }

  if (typeof payload.login !== "string" || !Number.isSafeInteger(payload.id)) {
    throw new Error(`GitHub account metadata was incomplete for ${login}`);
  }

  return { id: payload.id, login: payload.login };
}

export function resolveTriggeringActor({
  eventActorId,
  eventActorLogin,
  readGithubUser = readGitHubUser,
  triggeringActorLogin,
}) {
  if (!triggeringActorLogin) {
    return { id: null, login: null };
  }

  if (sameLogin(triggeringActorLogin, eventActorLogin)) {
    return { id: eventActorId, login: eventActorLogin };
  }

  return readGithubUser(triggeringActorLogin);
}

function isCanonicalRepositorySlug(repoSlug) {
  return (
    typeof repoSlug === "string" &&
    repoSlug.toLowerCase() === CANONICAL_REPOSITORY.toLowerCase()
  );
}

function resolveLocalRemoteContext() {
  const hasPrePushRemoteName = Object.hasOwn(
    process.env,
    "ASYM_PRE_PUSH_REMOTE_NAME",
  );
  const suppliedRemoteName = hasPrePushRemoteName
    ? process.env.ASYM_PRE_PUSH_REMOTE_NAME || ""
    : "origin";
  const remoteName = suppliedRemoteName || "origin";
  const hasPrePushSlug = Object.hasOwn(
    process.env,
    "ASYM_PRE_PUSH_REPOSITORY_SLUG",
  );
  const repoSlug = hasPrePushSlug
    ? process.env.ASYM_PRE_PUSH_REPOSITORY_SLUG || null
    : parseGitHubRepoSlug(mustRunGit(["remote", "get-url", remoteName]));
  const remoteQueryTarget =
    suppliedRemoteName ||
    (repoSlug ? `https://github.com/${repoSlug}.git` : "");

  return {
    remoteName,
    remoteQueryTarget,
    repoSlug,
    requireTrustedOperator:
      repoSlug === null || isCanonicalRepositorySlug(repoSlug),
  };
}

function collectLocalCommitShas({ remoteName, remoteQueryTarget }) {
  const prePushInput = process.env.ASYM_PRE_PUSH_UPDATES;

  if (typeof prePushInput === "string") {
    return collectOutgoingCommitShas({
      updates: parseStrictPrePushUpdates(prePushInput),
      remoteName: remoteQueryTarget,
      runGit: mustRunGit,
      runGitStatus,
    });
  }

  return splitCommitShas(
    mustRunGit(["rev-list", "HEAD", "--not", "--remotes"]),
    "local-only",
  );
}

function collectTrustedRemoteNames(remoteName, { runCommand }) {
  const remoteNames = new Set();

  if (remoteName) {
    remoteNames.add(remoteName);
  }

  const remotesResult = runCommand("git", ["remote"]);

  if (!remotesResult.ok) {
    return remoteNames;
  }

  for (const candidate of remotesResult.stdout.split(/\r?\n/)) {
    const candidateName = candidate.trim();

    if (!candidateName || remoteNames.has(candidateName)) {
      continue;
    }

    const remoteUrlResult = runCommand("git", [
      "remote",
      "get-url",
      candidateName,
    ]);

    if (
      remoteUrlResult.ok &&
      isCanonicalRepositorySlug(parseGitHubRepoSlug(remoteUrlResult.stdout))
    ) {
      remoteNames.add(candidateName);
    }
  }

  return remoteNames;
}

export function isReachableFromTrustedRemoteBranch(
  sha,
  remoteName,
  { runCommand = run, runGitStatus: readGitStatus = runGitStatus } = {},
) {
  const remoteNames = collectTrustedRemoteNames(remoteName, { runCommand });

  for (const trustedRemoteName of remoteNames) {
    for (const branch of ["develop", "production"]) {
      const remoteRef = `refs/remotes/${trustedRemoteName}/${branch}`;
      const refResult = runCommand("git", [
        "show-ref",
        "--verify",
        "--quiet",
        remoteRef,
      ]);

      if (!refResult.ok) {
        continue;
      }

      const status = readGitStatus([
        "merge-base",
        "--is-ancestor",
        sha,
        remoteRef,
      ]);

      if (status === 0) {
        return true;
      }

      if (status !== 1) {
        throw new Error(
          `git could not compare ${sha} with trusted remote branch ${remoteRef}`,
        );
      }
    }
  }

  return false;
}

function validateLocallyKnownPlatformCommit(metadata, remoteName) {
  const committer = {
    name: metadata.committerName,
    email: metadata.committerEmail,
  };

  if (!isGitHubPlatformIdentity(committer)) {
    return null;
  }

  if (!isReachableFromTrustedRemoteBranch(metadata.sha, remoteName)) {
    return validateCommitAttribution(metadata);
  }

  return validateIdentity({
    label: "GitHub platform commit author",
    name: metadata.authorName,
    email: metadata.authorEmail,
    requireTrusted: false,
    allowPlatformAlias: true,
  });
}

function collectLocalVerification() {
  const errors = [];
  const { remoteName, remoteQueryTarget, requireTrustedOperator } =
    resolveLocalRemoteContext();
  const identityOptions = { requireTrusted: requireTrustedOperator };
  const userName = mustRunGit(["config", "--get", "user.name"]);
  const userEmail = mustRunGit(["config", "--get", "user.email"]);

  errors.push(
    ...validateLocalGitConfig(
      { userName, userEmail },
      { requireTrusted: requireTrustedOperator },
    ),
  );
  errors.push(
    ...validateGitIdent(
      "GIT_AUTHOR_IDENT",
      mustRunGit(["var", "GIT_AUTHOR_IDENT"]),
      identityOptions,
    ),
  );
  errors.push(
    ...validateGitIdent(
      "GIT_COMMITTER_IDENT",
      mustRunGit(["var", "GIT_COMMITTER_IDENT"]),
      identityOptions,
    ),
  );

  const checkedCommits = [];

  for (const sha of collectLocalCommitShas({ remoteName, remoteQueryTarget })) {
    if (
      isHistoricalCommit({
        sha,
        baselineSha: ATTRIBUTION_BASELINE_SHA,
        runGitStatus,
      })
    ) {
      continue;
    }

    const metadata = readCommitMetadata(sha);
    const platformErrors = validateLocallyKnownPlatformCommit(
      metadata,
      remoteName,
    );

    const commitErrors =
      platformErrors ??
      validateCommitAttribution(metadata, {
        allowExternalAuthor: true,
        allowExternalCommitter: !requireTrustedOperator,
      });

    errors.push(...commitErrors.map((error) => `${sha}: ${error}`));
    checkedCommits.push(sha);
  }

  return { errors, checkedCommits, userEmail, userName };
}

export function collectCiCommitShas({
  baseSha,
  eventName,
  headSha,
  refName,
  refType,
  runGit = mustRunGit,
  runGitStatus: readGitStatus = runGitStatus,
}) {
  assertFullSha(headSha, "GitHub event head SHA");

  if (!["pull_request", "push", "workflow_dispatch"].includes(eventName)) {
    throw new Error(`unsupported GitHub attribution event: ${eventName}`);
  }

  const protectedIntegration =
    eventName !== "pull_request" &&
    (refName === "develop" || refName === "production");
  const ancestryArgs = protectedIntegration ? ["--first-parent"] : [];

  if (eventName === "pull_request" || eventName === "push") {
    if (!baseSha || baseSha === ZERO_SHA) {
      throw new Error(`${eventName} attribution requires a nonzero base SHA`);
    }

    assertFullSha(baseSha, "GitHub event base SHA");

    if (
      eventName === "push" &&
      readGitStatus(["merge-base", "--is-ancestor", baseSha, headSha]) !== 0
    ) {
      throw new Error("protected-branch update is not a fast-forward");
    }

    return splitCommitShas(
      runGit(["rev-list", ...ancestryArgs, `${baseSha}..${headSha}`]),
      "GitHub event range",
    );
  }

  if (refType !== "branch" || !refName) {
    throw new Error("workflow_dispatch attribution requires a branch ref");
  }

  return splitCommitShas(
    runGit([
      "rev-list",
      ...ancestryArgs,
      headSha,
      "--not",
      ATTRIBUTION_BASELINE_SHA,
    ]),
    "GitHub dispatch history",
  );
}

function optionalEventValue(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function collectCiVerification({
  collectCommitShas = collectCiCommitShas,
  environment = process.env,
  isHistorical = isHistoricalCommit,
  readCommit = readGitHubCommit,
  readComparison = readGitHubComparison,
  readPullRequests = readAssociatedPullRequests,
  readSignature = readGitHubSignature,
} = {}) {
  const eventName = environment.ASYM_GITHUB_EVENT_NAME;
  const baseSha = environment.ASYM_GITHUB_BASE_SHA;
  const headSha = environment.ASYM_GITHUB_HEAD_SHA;
  const headRepository = environment.ASYM_GITHUB_HEAD_REPOSITORY;
  const repository = environment.ASYM_GITHUB_REPOSITORY;
  const refName = environment.ASYM_GITHUB_REF_NAME;
  const refType = environment.ASYM_GITHUB_REF_TYPE;
  const eventActorLogin = environment.ASYM_GITHUB_EVENT_ACTOR_LOGIN;
  const eventActorId = environment.ASYM_GITHUB_EVENT_ACTOR_ID;

  if (
    !eventName ||
    !headSha ||
    !repository ||
    !headRepository ||
    !refName ||
    !refType ||
    !eventActorLogin ||
    !eventActorId
  ) {
    throw new Error("GitHub attribution event metadata is incomplete");
  }

  if (!isCanonicalRepositorySlug(repository)) {
    throw new Error(
      `GitHub attribution expected ${CANONICAL_REPOSITORY}; got ${repository}`,
    );
  }

  if (
    eventName === "push" &&
    refName !== "develop" &&
    refName !== "production"
  ) {
    throw new Error(`unsupported protected push ref: ${refName}`);
  }

  const allowExternalCommitter =
    eventName === "pull_request" &&
    headRepository.toLowerCase() !== repository.toLowerCase();
  const allowEventActorProof =
    eventName === "pull_request" &&
    headRepository.toLowerCase() === repository.toLowerCase();
  const triggeringActor = resolveTriggeringActor({
    eventActorId,
    eventActorLogin,
    triggeringActorLogin: optionalEventValue(
      environment.ASYM_GITHUB_TRIGGERING_ACTOR_LOGIN,
    ),
  });
  const eventActors = {
    eventActorId,
    eventActorLogin,
    eventSenderId: optionalEventValue(environment.ASYM_GITHUB_EVENT_SENDER_ID),
    eventSenderLogin: optionalEventValue(
      environment.ASYM_GITHUB_EVENT_SENDER_LOGIN,
    ),
    headOwnerId: optionalEventValue(environment.ASYM_GITHUB_HEAD_OWNER_ID),
    headOwnerLogin: optionalEventValue(
      environment.ASYM_GITHUB_HEAD_OWNER_LOGIN,
    ),
    pullRequestAuthorId: optionalEventValue(
      environment.ASYM_GITHUB_PULL_REQUEST_AUTHOR_ID,
    ),
    pullRequestAuthorLogin: optionalEventValue(
      environment.ASYM_GITHUB_PULL_REQUEST_AUTHOR_LOGIN,
    ),
    triggeringActorId: triggeringActor.id,
    triggeringActorLogin: triggeringActor.login,
  };
  const errors = [...validateForbiddenGithubPrincipals(eventActors)];
  const checkedCommits = [];
  const protectedIntegration =
    eventName !== "pull_request" &&
    (refName === "develop" || refName === "production");

  if (protectedIntegration && refName === "production") {
    errors.push(
      ...validateProductionPromotion({
        comparison: readComparison({
          base: headSha,
          head: "develop",
          repoSlug: repository,
        }),
        headSha,
      }).map((error) => `${headSha}: ${error}`),
    );
  }

  for (const sha of collectCommitShas({
    baseSha,
    eventName,
    headSha,
    refName,
    refType,
  })) {
    if (
      isHistorical({
        sha,
        baselineSha: ATTRIBUTION_BASELINE_SHA,
        runGitStatus,
      })
    ) {
      continue;
    }

    const { metadata, actors: commitActors } = readCommit({
      repoSlug: headRepository,
      sha,
    });
    const actors = {
      ...commitActors,
      ...eventActors,
      signature: readSignature({ repoSlug: headRepository, sha }),
    };

    const commitErrors = [];

    if (protectedIntegration && refName === "develop") {
      commitErrors.push(
        ...validateDevelopMergeProvenance({
          metadata,
          pullRequests: readPullRequests({
            repoSlug: repository,
            sha,
          }),
          repository,
        }),
      );
    }

    commitErrors.push(
      ...validateGitHubActorAttribution(metadata, actors, {
        allowEventActorProof,
        allowExternalAuthor: true,
        allowExternalCommitter,
        requireGitHubPlatformCommit: protectedIntegration,
      }),
    );
    errors.push(...commitErrors.map((error) => `${sha}: ${error}`));
    checkedCommits.push(sha);
  }

  return { errors: [...new Set(errors)], checkedCommits };
}

function parseArgs(argv) {
  const args = argv.filter((arg) => arg !== "--");

  for (const arg of args) {
    if (arg !== "--ci") {
      throw new Error(`unsupported git attribution option: ${arg}`);
    }
  }

  return { ci: args.includes("--ci") };
}

function printFailure(errors) {
  console.error("==> FAIL verify:git-attribution");

  for (const error of errors) {
    console.error(`- ${error}`);
  }
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = options.ci
      ? collectCiVerification()
      : collectLocalVerification();

    if (result.errors.length > 0) {
      printFailure(result.errors);
      return 1;
    }

    console.log("==> PASS verify:git-attribution");
    console.log(
      `Commits checked: ${result.checkedCommits.length}${
        result.checkedCommits.length > 0
          ? ` (${result.checkedCommits.map((sha) => sha.slice(0, 12)).join(", ")})`
          : ""
      }`,
    );

    if (!options.ci) {
      console.log(
        `Local Git identity: ${result.userName} <${result.userEmail}>`,
      );
    }

    return 0;
  } catch (error) {
    printFailure([error instanceof Error ? error.message : String(error)]);
    return 1;
  }
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  process.exitCode = main();
}
