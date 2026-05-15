#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REQUIRED_GIT_NAME = "Blake";
export const ALLOWED_GIT_EMAILS = Object.freeze([
  "blake@risencode.org",
  "116130409+II-ricky-bobby-II@users.noreply.github.com",
]);
export const ALLOWED_GITHUB_LOGINS = Object.freeze(["II-ricky-bobby-II"]);
export const FORBIDDEN_GIT_EMAILS = Object.freeze(["codex@example.com"]);
export const FORBIDDEN_GITHUB_LOGINS = Object.freeze(["abiatarprado"]);

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeLogin(login) {
  return login.trim().toLowerCase();
}

const allowedEmailSet = new Set(ALLOWED_GIT_EMAILS.map(normalizeEmail));
const allowedLoginSet = new Set(ALLOWED_GITHUB_LOGINS.map(normalizeLogin));
const forbiddenEmailSet = new Set(FORBIDDEN_GIT_EMAILS.map(normalizeEmail));
const forbiddenLoginSet = new Set(FORBIDDEN_GITHUB_LOGINS.map(normalizeLogin));

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

export function parseGitHubRepoSlug(remoteUrl) {
  const trimmedUrl = remoteUrl.trim().replace(/\.git$/, "");
  const sshMatch = /^git@github\.com:(?<owner>[^/]+)\/(?<repo>[^/]+)$/.exec(
    trimmedUrl,
  );

  if (sshMatch?.groups) {
    return `${sshMatch.groups.owner}/${sshMatch.groups.repo}`;
  }

  const httpsMatch =
    /^https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)$/.exec(trimmedUrl);

  if (httpsMatch?.groups) {
    return `${httpsMatch.groups.owner}/${httpsMatch.groups.repo}`;
  }

  return null;
}

export function validateIdentity({ label, name, email, requireName = true }) {
  const errors = [];
  const normalizedEmail = normalizeEmail(email);

  if (requireName && name !== REQUIRED_GIT_NAME) {
    errors.push(`${label} name must be ${REQUIRED_GIT_NAME}; got ${name}`);
  }

  if (forbiddenEmailSet.has(normalizedEmail)) {
    errors.push(`${label} email ${email} is forbidden`);
  }

  if (!allowedEmailSet.has(normalizedEmail)) {
    errors.push(
      `${label} email ${email} is not allowed; use ${ALLOWED_GIT_EMAILS.join(
        " or ",
      )}`,
    );
  }

  return errors;
}

export function validateGitIdent(label, identity) {
  const parsed = parseGitIdentity(identity);

  if (!parsed) {
    return [`${label} identity could not be parsed: ${identity}`];
  }

  return validateIdentity({ label, ...parsed });
}

export function validateLocalGitConfig({ userName, userEmail }) {
  return validateIdentity({
    label: "local git config",
    name: userName,
    email: userEmail,
  });
}

export function validateGitHubActors({ authorLogin, committerLogin }) {
  const errors = [];

  for (const [label, login] of [
    ["latest commit GitHub author", authorLogin],
    ["latest commit GitHub committer", committerLogin],
  ]) {
    if (!login) {
      errors.push(`${label} did not resolve to a GitHub account`);
      continue;
    }

    const normalizedLogin = normalizeLogin(login);

    if (forbiddenLoginSet.has(normalizedLogin)) {
      errors.push(`${label} resolved to forbidden account ${login}`);
    }

    if (!allowedLoginSet.has(normalizedLogin)) {
      errors.push(
        `${label} resolved to ${login}; expected ${ALLOWED_GITHUB_LOGINS.join(
          " or ",
        )}`,
      );
    }
  }

  return errors;
}

export function validateLatestCommitMetadata(metadata) {
  return [
    ...validateIdentity({
      label: "latest commit author",
      name: metadata.authorName,
      email: metadata.authorEmail,
    }),
    ...validateIdentity({
      label: "latest commit committer",
      name: metadata.committerName,
      email: metadata.committerEmail,
    }),
  ];
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
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

function mustRunGit(args) {
  const result = run("git", args);

  if (!result.ok) {
    throw new Error(
      `git ${args.join(" ")} failed: ${result.stderr || result.status}`,
    );
  }

  return result.stdout;
}

function readGitHubActors({ repoSlug, sha }) {
  const result = run("gh", ["api", `repos/${repoSlug}/commits/${sha}`]);

  if (!result.ok) {
    return {
      actors: null,
      warning: `GitHub commit metadata was not available for ${sha}: ${
        result.stderr || result.status
      }`,
    };
  }

  const payload = JSON.parse(result.stdout);

  return {
    actors: {
      authorLogin: payload.author?.login ?? null,
      committerLogin: payload.committer?.login ?? null,
    },
    warning: null,
  };
}

function parseArgs(argv) {
  return {
    skipLatestCommit: argv.includes("--skip-latest-commit"),
    skipGithub: argv.includes("--skip-github"),
  };
}

function collectVerification(options) {
  const errors = [];
  const warnings = [];

  const userName = mustRunGit(["config", "--get", "user.name"]);
  const userEmail = mustRunGit(["config", "--get", "user.email"]);

  errors.push(...validateLocalGitConfig({ userName, userEmail }));
  errors.push(
    ...validateGitIdent(
      "GIT_AUTHOR_IDENT",
      mustRunGit(["var", "GIT_AUTHOR_IDENT"]),
    ),
  );
  errors.push(
    ...validateGitIdent(
      "GIT_COMMITTER_IDENT",
      mustRunGit(["var", "GIT_COMMITTER_IDENT"]),
    ),
  );

  let latestCommit = null;

  if (!options.skipLatestCommit) {
    latestCommit = parseLatestCommitLog(
      mustRunGit(["log", "-1", "--format=%H%x00%an%x00%ae%x00%cn%x00%ce"]),
    );

    if (!latestCommit) {
      errors.push("latest commit metadata could not be parsed");
    } else {
      errors.push(...validateLatestCommitMetadata(latestCommit));

      if (!options.skipGithub) {
        const repoSlug = parseGitHubRepoSlug(
          mustRunGit(["remote", "get-url", "origin"]),
        );

        if (!repoSlug) {
          warnings.push(
            "GitHub actor metadata check skipped because origin is not a GitHub remote",
          );
        } else {
          const { actors, warning } = readGitHubActors({
            repoSlug,
            sha: latestCommit.sha,
          });

          if (warning) {
            warnings.push(warning);
          }

          if (actors) {
            errors.push(...validateGitHubActors(actors));
          }
        }
      }
    }
  }

  return {
    errors,
    latestCommit,
    userEmail,
    userName,
    warnings,
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = collectVerification(options);

  for (const warning of result.warnings) {
    console.warn(`WARN verify:git-attribution: ${warning}`);
  }

  if (result.errors.length > 0) {
    console.error("==> FAIL verify:git-attribution");

    for (const error of result.errors) {
      console.error(`- ${error}`);
    }

    process.exit(1);
  }

  console.log("==> PASS verify:git-attribution");
  console.log(`Local Git identity: ${result.userName} <${result.userEmail}>`);

  if (result.latestCommit) {
    console.log(`Latest commit checked: ${result.latestCommit.sha}`);
  }
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main();
}
