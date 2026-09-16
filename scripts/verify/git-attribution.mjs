#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REQUIRED_GIT_NAME = "Blake";
export const EXPECTED_GITHUB_LOGIN_BY_EMAIL = Object.freeze({
  "blake@risencode.org": "II-ricky-bobby-II",
  "116130409+II-ricky-bobby-II@users.noreply.github.com": "II-ricky-bobby-II",
  "299239962+asymmetric-core-eve[bot]@users.noreply.github.com":
    "asymmetric-core-eve[bot]",
});
export const ALLOWED_GIT_EMAILS = Object.freeze(
  Object.keys(EXPECTED_GITHUB_LOGIN_BY_EMAIL),
);
export const ALLOWED_GITHUB_LOGINS = Object.freeze([
  ...new Set(Object.values(EXPECTED_GITHUB_LOGIN_BY_EMAIL)),
]);
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
const expectedLoginByEmail = new Map(
  Object.entries(EXPECTED_GITHUB_LOGIN_BY_EMAIL).map(([email, login]) => [
    normalizeEmail(email),
    login,
  ]),
);
const githubIdsByLogin = new Map([
  ["ii-ricky-bobby-ii", 116130409],
  ["asymmetric-core-eve[bot]", 299239962],
]);
const integrationBranches = new Set(["develop", "production"]);
const gitHubWebFlowId = 19864447;

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

  if (fields.length !== 5 && fields.length !== 6) {
    return null;
  }

  const [sha, authorName, authorEmail, committerName, committerEmail, parents] =
    fields;

  return {
    sha,
    authorName,
    authorEmail,
    committerName,
    committerEmail,
    ...(parents === undefined
      ? {}
      : { parents: parents.split(" ").filter(Boolean) }),
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

export function validateGitHubActorAttribution(metadata, actors) {
  const errors = [];

  for (const { email, label, login } of [
    {
      email: metadata.authorEmail,
      label: "latest commit GitHub author",
      login: actors.authorLogin,
    },
    {
      email: metadata.committerEmail,
      label: "latest commit GitHub committer",
      login: actors.committerLogin,
    },
  ]) {
    const expectedLogin = expectedLoginByEmail.get(normalizeEmail(email));

    if (!expectedLogin || !login) {
      continue;
    }

    if (normalizeLogin(login) !== normalizeLogin(expectedLogin)) {
      errors.push(
        `${label} resolved to ${login}; email ${email} must resolve to ${expectedLogin}`,
      );
    }
  }

  return errors;
}

function isTrustedGitHubActor(login, id) {
  return (
    typeof login === "string" &&
    githubIdsByLogin.get(normalizeLogin(login)) === id &&
    allowedLoginSet.has(normalizeLogin(login))
  );
}

function isVerifiedGitHubMerge(metadata, evidence) {
  const { commit, signature, pullRequest, branch, repoSlug } = evidence ?? {};
  if (!commit || !signature || !pullRequest || !branch) return false;
  const expectedAuthor = expectedLoginByEmail.get(
    normalizeEmail(metadata.authorEmail),
  );
  const authorNameAllowed =
    metadata.authorName === REQUIRED_GIT_NAME ||
    (metadata.authorName === "ricky" &&
      metadata.authorEmail ===
        "116130409+II-ricky-bobby-II@users.noreply.github.com");
  const matchingCommit = [
    "sha",
    "authorName",
    "authorEmail",
    "committerName",
    "committerEmail",
  ].every((field) => commit[field] === metadata[field]);

  return (
    typeof repoSlug === "string" &&
    repoSlug.toLowerCase() === "asymmetric-al/core" &&
    /^[a-f0-9]{40}$/.test(metadata.sha) &&
    matchingCommit &&
    Array.isArray(metadata.parents) &&
    metadata.parents.length === 2 &&
    Array.isArray(commit.parents) &&
    commit.parents.length === 2 &&
    metadata.parents.every(
      (parent, index) => parent === commit.parents[index],
    ) &&
    authorNameAllowed &&
    isTrustedGitHubActor(commit.authorLogin, commit.authorId) &&
    normalizeLogin(commit.authorLogin) === expectedAuthor?.toLowerCase() &&
    metadata.committerName === "GitHub" &&
    metadata.committerEmail === "noreply@github.com" &&
    commit.committerLogin === "web-flow" &&
    commit.committerId === gitHubWebFlowId &&
    commit.verified === true &&
    commit.verificationReason === "valid" &&
    signature.sha === metadata.sha &&
    signature.isValid === true &&
    signature.state === "VALID" &&
    signature.wasSignedByGitHub === true &&
    signature.signerLogin === "web-flow" &&
    signature.signerId === gitHubWebFlowId &&
    pullRequest.merged === true &&
    pullRequest.state === "closed" &&
    typeof pullRequest.mergedAt === "string" &&
    pullRequest.mergedAt.length > 0 &&
    pullRequest.mergeCommitSha === metadata.sha &&
    typeof pullRequest.baseRepo === "string" &&
    pullRequest.baseRepo.toLowerCase() === repoSlug.toLowerCase() &&
    integrationBranches.has(pullRequest.baseRef) &&
    pullRequest.baseSha === metadata.parents[0] &&
    pullRequest.headSha === metadata.parents[1] &&
    isTrustedGitHubActor(pullRequest.mergedBy, pullRequest.mergedById) &&
    branch.name === pullRequest.baseRef &&
    branch.protected === true
  );
}

export function validateLatestCommitMetadata(metadata, evidence) {
  if (isVerifiedGitHubMerge(metadata, evidence)) return [];
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

function mustRunGit(args, command = run) {
  const result = command("git", args);

  if (!result.ok) {
    throw new Error(
      `git ${args.join(" ")} failed: ${result.stderr || result.status}`,
    );
  }

  return result.stdout;
}

function readGitHubEvidence({ repoSlug, metadata }, command) {
  const warnings = [];
  const errors = [];
  const evidence = { repoSlug };
  const readJson = (args, jsonLines = false) => {
    const result = command("gh", ["api", ...args, "--hostname", "github.com"]);
    if (!result.ok) {
      warnings.push(
        `GitHub attribution evidence unavailable (${args[0]}): ${result.stderr || result.status}`,
      );
      return null;
    }
    try {
      if (jsonLines) {
        return result.stdout
          .split(/\r?\n/)
          .filter(Boolean)
          .map((line) => JSON.parse(line));
      }
      const payload = JSON.parse(result.stdout);
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new TypeError("Expected an attribution metadata object");
      }
      return payload;
    } catch {
      const message = `GitHub attribution evidence returned invalid JSON or metadata shape (${args[0]})`;
      warnings.push(message);
      errors.push(message);
      return null;
    }
  };
  const sha = metadata.sha;
  // Project only attribution fields: large merge diffs exceeded spawnSync's
  // output buffer. GitHub's file pagination does not change commit metadata.
  evidence.commit = readJson([
    `repos/${repoSlug}/commits/${sha}?per_page=1`,
    "--jq",
    "{sha, authorName:.commit.author.name, authorEmail:.commit.author.email, committerName:.commit.committer.name, committerEmail:.commit.committer.email, authorLogin:.author.login, authorId:.author.id, committerLogin:.committer.login, committerId:.committer.id, parents:[.parents[].sha], verified:.commit.verification.verified, verificationReason:.commit.verification.reason}",
  ]);
  if (
    !evidence.commit ||
    metadata.committerName !== "GitHub" ||
    metadata.committerEmail !== "noreply@github.com" ||
    metadata.parents?.length !== 2
  ) {
    return { evidence, warnings, errors };
  }

  const [owner, name] = repoSlug.split("/");
  evidence.signature = readJson([
    "graphql",
    "-f",
    "query=query($owner:String!,$name:String!,$sha:GitObjectID!){repository(owner:$owner,name:$name){object(oid:$sha){... on Commit{oid signature{isValid state wasSignedByGitHub signer{login databaseId}}}}}}",
    "-f",
    `owner=${owner}`,
    "-f",
    `name=${name}`,
    "-f",
    `sha=${sha}`,
    "--jq",
    ".data.repository.object | {sha:.oid, isValid:.signature.isValid, state:.signature.state, wasSignedByGitHub:.signature.wasSignedByGitHub, signerLogin:.signature.signer.login, signerId:.signature.signer.databaseId}",
  ]);
  if (!evidence.signature) return { evidence, warnings, errors };

  const pullNumbers = readJson(
    [
      `repos/${repoSlug}/commits/${sha}/pulls?per_page=100`,
      "--paginate",
      "--jq",
      `.[] | select(.merged_at != null and .merge_commit_sha == "${sha}") | .number`,
    ],
    true,
  );
  if (!Array.isArray(pullNumbers)) return { evidence, warnings, errors };
  for (const number of new Set(pullNumbers)) {
    if (!Number.isSafeInteger(number) || number <= 0) continue;
    evidence.pullRequest = readJson([
      `repos/${repoSlug}/pulls/${number}`,
      "--jq",
      "{merged, state, mergedAt:.merged_at, mergeCommitSha:.merge_commit_sha, mergedBy:.merged_by.login, mergedById:.merged_by.id, baseRepo:.base.repo.full_name, baseRef:.base.ref, baseSha:.base.sha, headSha:.head.sha}",
    ]);
    if (
      !evidence.pullRequest ||
      !integrationBranches.has(evidence.pullRequest.baseRef)
    )
      continue;
    evidence.branch = readJson([
      `repos/${repoSlug}/branches/${evidence.pullRequest.baseRef}`,
      "--jq",
      "{name, protected}",
    ]);
    if (isVerifiedGitHubMerge(metadata, evidence)) break;
  }
  return { evidence, warnings, errors };
}

function parseArgs(argv) {
  return {
    skipLatestCommit: argv.includes("--skip-latest-commit"),
    skipGithub: argv.includes("--skip-github"),
  };
}

export function collectVerification(options, command = run) {
  const errors = [];
  const warnings = [];

  const git = (args) => mustRunGit(args, command);
  const userName = git(["config", "--get", "user.name"]);
  const userEmail = git(["config", "--get", "user.email"]);

  errors.push(...validateLocalGitConfig({ userName, userEmail }));
  errors.push(
    ...validateGitIdent("GIT_AUTHOR_IDENT", git(["var", "GIT_AUTHOR_IDENT"])),
  );
  errors.push(
    ...validateGitIdent(
      "GIT_COMMITTER_IDENT",
      git(["var", "GIT_COMMITTER_IDENT"]),
    ),
  );

  let latestCommit = null;

  if (!options.skipLatestCommit) {
    latestCommit = parseLatestCommitLog(
      git(["log", "-1", "--format=%H%x00%an%x00%ae%x00%cn%x00%ce%x00%P"]),
    );

    if (!latestCommit) {
      errors.push("latest commit metadata could not be parsed");
    } else {
      let evidence;
      if (!options.skipGithub) {
        const repoSlug = parseGitHubRepoSlug(
          git(["remote", "get-url", "origin"]),
        );

        if (!repoSlug) {
          warnings.push(
            "GitHub actor metadata check skipped because origin is not a GitHub remote",
          );
        } else {
          const result = readGitHubEvidence(
            { repoSlug, metadata: latestCommit },
            command,
          );
          evidence = result.evidence;
          warnings.push(...result.warnings);
          errors.push(...result.errors);
        }
      }
      errors.push(...validateLatestCommitMetadata(latestCommit, evidence));
      if (evidence?.commit && !isVerifiedGitHubMerge(latestCommit, evidence)) {
        errors.push(...validateGitHubActors(evidence.commit));
        errors.push(
          ...validateGitHubActorAttribution(latestCommit, evidence.commit),
        );
        if (latestCommit.committerEmail === "noreply@github.com") {
          errors.push(
            "latest commit requires verified GitHub-signed merge provenance from a trusted merger into protected develop or production; incomplete evidence cannot authorize the hosted identity",
          );
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
