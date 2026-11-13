// Trusted host-side Git operations. Host Git never runs candidate hooks,
// fsmonitor, filters, diff drivers or credential helpers: every call is
// hardened. The check container can write an issue clone's .git, so before
// any host call on an issue clone or outbox the factory restores that
// metadata from a trusted copy kept outside the clone.
// Layout:
//   mirror.git                 bare mirror; refs/remotes/origin/* = GitHub
//   issues/<n>/repo            per-issue clone, objects via alternates
//   issues/<n>/outbox.git      bare repo the container pushes to (hooks run there)
//   issues/<n>/git-trust.json  factory-owned config for repo and outbox
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { cleanEnvironment, runProcess } from "./proc.mjs";

const posix = path.posix;
const sha = /^[a-f0-9]{40}$/;
export const HARDENED = [
  "-c",
  "core.hooksPath=/dev/null",
  "-c",
  "core.fsmonitor=false",
  "-c",
  "core.untrackedCache=false",
  "-c",
  "core.attributesFile=/dev/null",
  "-c",
  "credential.helper=",
  "-c",
  "protocol.ext.allow=never",
  "-c",
  "remote.origin.uploadpack=git-upload-pack",
  "-c",
  "core.pager=cat",
  "-c",
  "advice.detachedHead=false",
];

// Per-subcommand options that keep repository-configured programs out of
// host Git: no external diff or textconv driver, no configured upload-pack.
const SAFE_OPTIONS = {
  diff: ["--no-ext-diff", "--no-textconv"],
  log: ["--no-ext-diff", "--no-textconv"],
  show: ["--no-ext-diff", "--no-textconv"],
  fetch: ["--upload-pack=git-upload-pack"],
  "ls-remote": ["--upload-pack=git-upload-pack"],
};
const VALUE_OPTIONS = new Set(["-c", "-C", "--git-dir", "--work-tree"]);

export function hardenedArgs(args) {
  const out = [...args];
  for (let index = 0; index < out.length; index += 1) {
    if (VALUE_OPTIONS.has(out[index])) {
      index += 1;
      continue;
    }
    if (out[index].startsWith("-")) continue;
    out.splice(index + 1, 0, ...(SAFE_OPTIONS[out[index]] ?? []));
    break;
  }
  return [...HARDENED, ...out];
}

// `issues` (the factory's issues root) turns on metadata restoration for
// every call whose cwd or gitDir is an issue clone or outbox.
export function createGit({ executable, run = runProcess, author, issues }) {
  const env = cleanEnvironment({
    GIT_TERMINAL_PROMPT: "0",
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_NO_REPLACE_OBJECTS: "1",
    GIT_ASKPASS: "/bin/false",
    GIT_OPTIONAL_LOCKS: "0",
    ...(author
      ? {
          GIT_AUTHOR_NAME: author.name,
          GIT_AUTHOR_EMAIL: author.email,
          GIT_COMMITTER_NAME: author.name,
          GIT_COMMITTER_EMAIL: author.email,
        }
      : {}),
  });
  const git = async (
    args,
    { cwd, gitDir, input, timeoutMs = 120_000, extraEnv } = {},
  ) => {
    if (issues) trustTarget(issues, gitDir ?? cwd);
    const prefix = gitDir ? ["--git-dir", gitDir] : [];
    const result = await run(
      [executable, ...hardenedArgs([...prefix, ...args])],
      {
        cwd,
        env: { ...env, ...(extraEnv ?? {}) },
        input,
        timeoutMs,
        maxOutput: 32 * 1024 * 1024,
      },
    );
    return result;
  };
  const ok = async (args, options) => {
    const result = await git(args, options);
    if (result.code !== 0)
      throw new Error(
        `git ${args.slice(0, 2).join(" ")} failed (${result.code}): ${result.stderr.trim().slice(-800)}`,
      );
    return result.stdout;
  };
  return { git, ok };
}

export function issuePaths(paths, issue) {
  if (!Number.isSafeInteger(issue) || issue <= 0)
    throw new Error("Invalid issue");
  return issueLayout(posix.join(paths.issues, String(issue)));
}

function issueLayout(root) {
  return {
    root,
    repo: posix.join(root, "repo"),
    outbox: posix.join(root, "outbox.git"),
    trust: posix.join(root, "git-trust.json"),
  };
}

const untrusted = (message) =>
  Object.assign(new Error(message), { code: "untrusted-git-dir" });

function entry(file) {
  try {
    return lstatSync(file);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function realDirectory(dir, label) {
  const stat = entry(dir);
  if (!stat || stat.isSymbolicLink() || !stat.isDirectory())
    throw untrusted(`${label} is not a real directory`);
}

// Host calls on an issue's clone or outbox first restore that metadata; any
// other path under the issues root is refused.
function trustTarget(issuesRoot, target) {
  if (typeof target !== "string") return;
  const relative = posix.relative(issuesRoot, target);
  if (!relative || relative.startsWith("..") || posix.isAbsolute(relative))
    return;
  const [issue, kind, ...rest] = relative.split("/");
  const where = issueLayout(posix.join(issuesRoot, issue));
  if (kind === "repo") trustIssueRepo(where);
  else if (kind === "outbox.git" && !rest.length) trustOutbox(where);
  else throw untrusted(`Host Git outside an issue clone or outbox: ${target}`);
}

function readTrust(where) {
  let trust;
  try {
    trust = JSON.parse(readFileSync(where.trust, "utf8"));
  } catch {
    throw untrusted(
      `${where.root} has no trusted Git metadata; recreate its clone`,
    );
  }
  if (
    trust?.v !== 1 ||
    typeof trust.repoConfig !== "string" ||
    typeof trust.alternates !== "string" ||
    typeof trust.outboxConfig !== "string"
  )
    throw untrusted(`${where.root} has malformed trusted Git metadata`);
  return trust;
}

const foreign = (item) =>
  item.isSymbolicLink() || (!item.isFile() && !item.isDirectory());

// Remove everything Git could follow or block on: symlinks and special files
// anywhere in the metadata, including symlinked object fan-out directories.
function scrub(dir, depth = 0) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const full = posix.join(dir, item.name);
    if (foreign(item)) {
      rmSync(full, { force: true });
      continue;
    }
    if (!item.isDirectory()) continue;
    if (depth === 0 && item.name === "objects") {
      for (const child of readdirSync(full, { withFileTypes: true }))
        if (foreign(child))
          rmSync(posix.join(full, child.name), { force: true });
      continue;
    }
    scrub(full, depth + 1);
  }
}

function replaceFile(file, content) {
  rmSync(file, { recursive: true, force: true });
  writeFileSync(file, content, { flag: "wx", mode: 0o644 });
}

function resetMetadata(gitDir) {
  scrub(gitDir);
  for (const name of [
    "config.worktree",
    "commondir",
    "gitdir",
    "worktrees",
    "info/attributes",
    "objects/info/http-alternates",
  ])
    rmSync(posix.join(gitDir, name), { recursive: true, force: true });
  rmSync(posix.join(gitDir, "hooks"), { recursive: true, force: true });
  mkdirSync(posix.join(gitDir, "hooks"));
}

// Restore an issue clone's metadata from the factory-owned copy: its config,
// object alternates and an empty hooks directory. .git must be a real
// directory, never a symlink or a gitfile pointing elsewhere.
export function trustIssueRepo(where) {
  const trust = readTrust(where);
  realDirectory(where.repo, "The issue clone");
  const gitDir = posix.join(where.repo, ".git");
  realDirectory(gitDir, "The issue clone's .git");
  resetMetadata(gitDir);
  realDirectory(
    posix.join(gitDir, "objects"),
    "The issue clone's object store",
  );
  mkdirSync(posix.join(gitDir, "objects", "info"), { recursive: true });
  replaceFile(posix.join(gitDir, "config"), trust.repoConfig);
  replaceFile(
    posix.join(gitDir, "objects", "info", "alternates"),
    trust.alternates,
  );
}

export function trustOutbox(where) {
  const trust = readTrust(where);
  realDirectory(where.outbox, "The issue outbox");
  resetMetadata(where.outbox);
  rmSync(posix.join(where.outbox, "objects", "info", "alternates"), {
    force: true,
  });
  replaceFile(posix.join(where.outbox, "config"), trust.outboxConfig);
}

// Only these [core] booleans are carried over from Git's own init output;
// everything else in the trusted config is fixed by the factory.
const CORE_KEYS = new Set([
  "filemode",
  "symlinks",
  "ignorecase",
  "precomposeunicode",
]);

function coreSettings(file) {
  const stat = entry(file);
  if (!stat || !stat.isFile()) return {};
  const settings = {};
  let section = "";
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    const header = /^\[([^\]\s"]+)/.exec(line);
    if (header) {
      section = header[1].toLowerCase();
      continue;
    }
    const pair = /^([A-Za-z]+)\s*=\s*(true|false)\s*$/i.exec(line);
    if (section === "core" && pair && CORE_KEYS.has(pair[1].toLowerCase()))
      settings[pair[1].toLowerCase()] = pair[2].toLowerCase();
  }
  return settings;
}

const quoted = (value) =>
  `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

function renderConfig(core, bare, origin) {
  const lines = ["[core]", "\trepositoryformatversion = 0"];
  if (core.filemode) lines.push(`\tfilemode = ${core.filemode}`);
  lines.push(`\tbare = ${bare}`);
  if (!bare) lines.push("\tlogallrefupdates = true");
  for (const key of ["symlinks", "ignorecase", "precomposeunicode"])
    if (core[key]) lines.push(`\t${key} = ${core[key]}`);
  if (origin)
    lines.push(
      '[remote "origin"]',
      `\turl = ${quoted(origin)}`,
      "\tfetch = +refs/remotes/origin/*:refs/remotes/origin/*",
    );
  return lines.join("\n") + "\n";
}

function writeTrust(where, paths) {
  const trust = {
    v: 1,
    repoConfig: renderConfig(
      coreSettings(posix.join(where.repo, ".git", "config")),
      false,
      paths.mirror,
    ),
    alternates: posix.join(paths.mirror, "objects") + "\n",
    outboxConfig: renderConfig(
      coreSettings(posix.join(where.outbox, "config")),
      true,
      null,
    ),
  };
  const temporary = `${where.trust}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(trust, null, 2), { mode: 0o640 });
  renameSync(temporary, where.trust);
}

export async function ensureMirror({ git, paths, remote }) {
  if (!existsSync(posix.join(paths.mirror, "HEAD"))) {
    await git.ok(["init", "--bare", paths.mirror]);
    await git.ok(["remote", "add", "origin", remote], { gitDir: paths.mirror });
    await git.ok(
      ["config", "remote.origin.fetch", "+refs/heads/*:refs/remotes/origin/*"],
      { gitDir: paths.mirror },
    );
  }
}

// What Git prints when another process moved or locked a ref first: 2.50 and
// later, earlier releases, and a held lock file.
const REF_RACE =
  /incorrect old value provided|reference already exists|cannot lock ref|Unable to create '[^'\n]*\.lock'/;
const MIRROR_FETCHES = 4;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Every round fetches into the one mirror, and two rounds can start in the
// same second. Git moves each remote-tracking ref with compare-and-swap, so
// the fetch that arrives second fails on every ref the first one already
// moved, although the mirror is current by then. Fetching is idempotent, so a
// fetch that lost that race runs again. Any other failure is reported at once.
export async function fetchMirror({ git, paths, pause = sleep }) {
  for (let attempts = 1; ; attempts += 1) {
    const result = await git.git(["fetch", "--prune", "--no-tags", "origin"], {
      gitDir: paths.mirror,
      timeoutMs: 15 * 60_000,
    });
    if (result.code === 0) return { attempts };
    if (attempts >= MIRROR_FETCHES || !REF_RACE.test(result.stderr))
      throw new Error(
        `git fetch --prune failed (${result.code}): ${result.stderr.trim().slice(-800)}`,
      );
    await pause(attempts * 1000 + Math.floor(Math.random() * 500));
  }
}

export async function revParse({ git, gitDir, cwd }, ref) {
  const out = (
    await git.ok(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`], {
      gitDir,
      cwd,
    })
  ).trim();
  if (!sha.test(out)) throw new Error(`Could not resolve ${ref}`);
  return out;
}

// Create or reuse the issue clone. Objects come from the mirror via
// alternates. The trusted metadata copy is written when the clone is
// created, or derived once for an older clone from Git's own [core]
// booleans only, never from whatever else its config now says.
export async function ensureIssueRepo({ git, paths, issue }) {
  const where = issuePaths(paths, issue);
  mkdirSync(where.root, { recursive: true, mode: 0o750 });
  const fresh = !entry(posix.join(where.repo, ".git"));
  if (fresh) {
    mkdirSync(where.repo, { recursive: true, mode: 0o750 });
    await git.ok([
      "init",
      "--quiet",
      "--initial-branch",
      "factory-init",
      where.repo,
    ]);
  }
  if (!entry(where.outbox))
    await git.ok(["init", "--quiet", "--bare", where.outbox]);
  if (fresh || !existsSync(where.trust)) {
    realDirectory(posix.join(where.repo, ".git"), "The issue clone's .git");
    writeTrust(where, paths);
  }
  trustIssueRepo(where);
  trustOutbox(where);
  await git.ok(["fetch", "--prune", "--no-tags", "origin"], {
    cwd: where.repo,
    timeoutMs: 10 * 60_000,
  });
  return where;
}

export async function statusPorcelain({ git }, repo) {
  const out = await git.ok(
    ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
    { cwd: repo },
  );
  const entries = [];
  const parts = out.split("\0").filter(Boolean);
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const code = part.slice(0, 2);
    const file = part.slice(3);
    if (code.startsWith("R") || code.startsWith("C")) index += 1;
    entries.push({ code, path: file });
  }
  return entries;
}

// Commits the clone holds after the recorded one that the work item never
// recorded: a round was stopped between its commit and its checkpoint, or its
// hooks left files behind after the commit. Only a plain line of commits on
// top of the recorded one counts; a merge or a different history does not.
async function unrecordedCommits({ git }, repo, target, currentHead) {
  if (!currentHead || currentHead === target) return false;
  const descends = await git.git(
    ["merge-base", "--is-ancestor", target, currentHead],
    { cwd: repo },
  );
  if (descends.code !== 0) return false;
  const merges = await git.ok(
    ["rev-list", "--count", "--merges", `${target}..${currentHead}`],
    { cwd: repo },
  );
  return merges.trim() === "0";
}

// Check out the branch for this round at the recorded commit, or start it
// from the integration base. An uncommitted working tree is never discarded:
// a dirty tree with no recorded head is refused for reconciliation.
// `keepUnrecorded` is set by a round that commits work: unrecorded commits on
// top of the recorded one are taken back into the working tree (the branch
// returns to the recorded commit, every file keeps its content), so the round
// commits them again through the hooks and the freeze checks.
export async function prepareBranch({
  git,
  repo,
  branch,
  head,
  base,
  keepUnrecorded = false,
}) {
  const dirty = await statusPorcelain({ git }, repo);
  const current = (
    await git.git(["symbolic-ref", "--quiet", "--short", "HEAD"], { cwd: repo })
  ).stdout.trim();
  const at = await git.git(["rev-parse", "--verify", "--quiet", "HEAD"], {
    cwd: repo,
  });
  const currentHead = at.code === 0 ? at.stdout.trim() : null;
  const target = head ?? base;
  if (!sha.test(target ?? ""))
    throw new Error("Branch target must be a full SHA");
  if (current === branch && currentHead === target)
    return { reused: true, dirty };
  if (
    keepUnrecorded &&
    current === branch &&
    (await unrecordedCommits({ git }, repo, target, currentHead))
  ) {
    await git.ok(["reset", "--quiet", "--mixed", target], { cwd: repo });
    return {
      reused: true,
      restored: currentHead,
      dirty: await statusPorcelain({ git }, repo),
    };
  }
  if (dirty.length)
    throw Object.assign(
      new Error("Issue workspace has uncommitted work on a different revision"),
      { code: "dirty-workspace", dirty },
    );
  await git.ok(["checkout", "-B", branch, target], { cwd: repo });
  return { reused: false, dirty: [] };
}

export async function changedSince({ git }, repo, base) {
  const out = await git.ok(["diff", "--name-only", "-z", `${base}...HEAD`], {
    cwd: repo,
  });
  return out.split("\0").filter(Boolean);
}

// Read one committed file from the object store (never the working tree, so
// a symlink planted there is never followed). Only regular files count.
export async function readCommittedFile(
  { git },
  repo,
  revision,
  file,
  { maxBytes = 1_048_576 } = {},
) {
  if (!sha.test(revision ?? "")) throw new Error("Revision must be a full SHA");
  const segments = typeof file === "string" ? file.split("/") : [];
  if (
    !segments.length ||
    segments.some(
      (part) => !part || part === "." || part === ".." || /[\0\r\n]/.test(part),
    )
  )
    return { state: "invalid" };
  const listed = await git.ok(
    [
      "--literal-pathspecs",
      "ls-tree",
      "-z",
      "--full-tree",
      revision,
      "--",
      file,
    ],
    { cwd: repo },
  );
  const match = /^(\d{6}) (\w+) ([a-f0-9]{40})\t([^\0]*)$/.exec(
    listed.split("\0").find(Boolean) ?? "",
  );
  if (!match || match[4] !== file) return { state: "missing" };
  if (match[2] !== "blob" || !["100644", "100755"].includes(match[1]))
    return { state: "not-a-file", mode: match[1] };
  const bytes = Number(
    (await git.ok(["cat-file", "-s", match[3]], { cwd: repo })).trim(),
  );
  if (!Number.isSafeInteger(bytes) || bytes > maxBytes)
    return { state: "too-large", bytes };
  const text = await git.ok(["cat-file", "blob", match[3]], { cwd: repo });
  return { state: "ok", text, bytes, blob: match[3] };
}

// Move the candidate the container pushed to the per-issue outbox into the
// mirror, verify it, and push exactly that commit to GitHub from the bare
// mirror (no candidate hooks run on the host).
export async function publishFromOutbox({
  git,
  paths,
  issue,
  branch,
  expected,
  credentialHelper,
  remote,
  extraEnv,
}) {
  const where = issuePaths(paths, issue);
  trustOutbox(where);
  const outboxHead = (
    await git.ok(["rev-parse", "--verify", `refs/heads/${branch}^{commit}`], {
      gitDir: where.outbox,
    })
  ).trim();
  if (outboxHead !== expected)
    throw new Error(
      `Outbox head ${outboxHead} differs from candidate ${expected}`,
    );
  await git.ok(
    [
      "fetch",
      "--no-tags",
      where.outbox,
      `+refs/heads/${branch}:refs/factory/${issue}/published`,
    ],
    { gitDir: paths.mirror },
  );
  const local = await revParse(
    { git, gitDir: paths.mirror },
    `refs/factory/${issue}/published`,
  );
  if (local !== expected)
    throw new Error("Mirror did not receive the candidate");
  const pushed = await git.git(
    [
      "-c",
      `credential.helper=${credentialHelper}`,
      "push",
      "--porcelain",
      remote,
      `${expected}:refs/heads/${branch}`,
    ],
    { gitDir: paths.mirror, timeoutMs: 10 * 60_000, extraEnv },
  );
  return {
    code: pushed.code,
    stdout: pushed.stdout,
    stderr: pushed.stderr.slice(-2000),
  };
}

export async function remoteHead({ git, remote }, branch) {
  const out = await git.ok([
    "ls-remote",
    "--heads",
    remote,
    `refs/heads/${branch}`,
  ]);
  const line = out.trim().split("\n").find(Boolean);
  if (!line) return null;
  const [value] = line.split(/\s+/);
  return sha.test(value) ? value : null;
}
