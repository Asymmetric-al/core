#!/usr/bin/env node

export const ATTRIBUTION_BASELINE_SHA =
  "7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd";

function freezeIdentity(identity) {
  return Object.freeze({
    ...identity,
    platformAliases: Object.freeze(identity.platformAliases ?? []),
  });
}

export const TRUSTED_IDENTITIES = Object.freeze([
  freezeIdentity({
    kind: "human",
    name: "Blake",
    email: "blake@risencode.org",
    githubLogin: "II-ricky-bobby-II",
    githubId: 116_130_409,
  }),
  freezeIdentity({
    kind: "human",
    name: "Blake",
    email: "116130409+II-ricky-bobby-II@users.noreply.github.com",
    githubLogin: "II-ricky-bobby-II",
    githubId: 116_130_409,
    platformAliases: ["ricky"],
  }),
  freezeIdentity({
    kind: "human",
    name: "Conrad O",
    email: "79217644+cobmojo@users.noreply.github.com",
    githubLogin: "cobmojo",
    githubId: 79_217_644,
    platformAliases: ["Conrad O'"],
  }),
  freezeIdentity({
    kind: "automation",
    name: "asymmetric-core-eve[bot]",
    email: "299239962+asymmetric-core-eve[bot]@users.noreply.github.com",
    githubLogin: "asymmetric-core-eve[bot]",
    githubId: 299_239_962,
  }),
  freezeIdentity({
    kind: "automation",
    name: "Cursor Agent",
    email: "cursoragent@cursor.com",
    githubLogin: "cursoragent",
    githubId: 199_161_495,
  }),
  freezeIdentity({
    kind: "automation",
    name: "Blake",
    email: "301899336+asymmetric-core-pr-loop[bot]@users.noreply.github.com",
    githubLogin: "asymmetric-core-pr-loop[bot]",
    githubId: 301_899_336,
    platformAliases: ["asymmetric-core-pr-loop[bot]"],
  }),
]);

export const GITHUB_PLATFORM_COMMITTER = Object.freeze({
  kind: "platform",
  name: "GitHub",
  email: "noreply@github.com",
  githubLogin: "web-flow",
  githubId: 19_864_447,
});

export const FORBIDDEN_GIT_EMAILS = Object.freeze(["codex@example.com"]);
export const FORBIDDEN_GITHUB_LOGINS = Object.freeze(["abiatarprado"]);
export const FORBIDDEN_GITHUB_IDS = Object.freeze([53_842_349]);

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function normalizeLogin(login) {
  return typeof login === "string" ? login.trim().toLowerCase() : "";
}

function normalizeGithubId(id) {
  if (typeof id === "number" && Number.isSafeInteger(id)) {
    return String(id);
  }

  return typeof id === "string" && /^\d+$/.test(id.trim())
    ? String(Number(id.trim()))
    : "";
}

export function parseGitHubRepoSlug(remoteUrl) {
  if (typeof remoteUrl !== "string") {
    return null;
  }

  const trimmedUrl = remoteUrl.trim().replace(/\.git$/, "");
  const scpMatch = /^git@github\.com:(?<owner>[^/]+)\/(?<repo>[^/]+)$/i.exec(
    trimmedUrl,
  );

  if (scpMatch?.groups) {
    return `${scpMatch.groups.owner}/${scpMatch.groups.repo}`;
  }

  const urlMatch =
    /^(?:https|ssh):\/\/(?:[^/@]+@)?github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)$/i.exec(
      trimmedUrl,
    );

  return urlMatch?.groups
    ? `${urlMatch.groups.owner}/${urlMatch.groups.repo}`
    : null;
}

export function findTrustedIdentityByGitIdentity(
  identity,
  { allowPlatformAlias = false } = {},
) {
  if (!identity || typeof identity.name !== "string") {
    return undefined;
  }

  const normalizedEmail = normalizeEmail(identity.email);

  return TRUSTED_IDENTITIES.find((candidate) => {
    if (normalizeEmail(candidate.email) !== normalizedEmail) {
      return false;
    }

    if (candidate.name === identity.name) {
      return true;
    }

    return (
      allowPlatformAlias && candidate.platformAliases.includes(identity.name)
    );
  });
}

export function findTrustedIdentityByGithubLogin(login) {
  const normalizedLogin = normalizeLogin(login);

  if (!normalizedLogin) {
    return undefined;
  }

  return TRUSTED_IDENTITIES.find(
    (identity) => normalizeLogin(identity.githubLogin) === normalizedLogin,
  );
}

export function githubAccountMatches(identity, { id, login } = {}) {
  return (
    normalizeLogin(login) === normalizeLogin(identity?.githubLogin) &&
    normalizeGithubId(id) === normalizeGithubId(identity?.githubId)
  );
}

export function isForbiddenGitEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  return FORBIDDEN_GIT_EMAILS.some(
    (forbiddenEmail) => normalizeEmail(forbiddenEmail) === normalizedEmail,
  );
}

export function isForbiddenGithubLogin(login) {
  const normalizedLogin = normalizeLogin(login);
  return FORBIDDEN_GITHUB_LOGINS.some(
    (forbiddenLogin) => normalizeLogin(forbiddenLogin) === normalizedLogin,
  );
}

export function isForbiddenGithubId(id) {
  const normalizedId = normalizeGithubId(id);
  return FORBIDDEN_GITHUB_IDS.some(
    (forbiddenId) => normalizeGithubId(forbiddenId) === normalizedId,
  );
}

export function isGitHubPlatformIdentity(identity) {
  return (
    identity?.name === GITHUB_PLATFORM_COMMITTER.name &&
    normalizeEmail(identity?.email) ===
      normalizeEmail(GITHUB_PLATFORM_COMMITTER.email)
  );
}

export function usesGitHubPlatformIdentityField(identity) {
  return (
    identity?.name === GITHUB_PLATFORM_COMMITTER.name ||
    normalizeEmail(identity?.email) ===
      normalizeEmail(GITHUB_PLATFORM_COMMITTER.email)
  );
}
