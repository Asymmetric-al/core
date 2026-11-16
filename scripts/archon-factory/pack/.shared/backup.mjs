#!/usr/bin/env node
// Coherent factory backup: SQLite online backup of the engine store, the
// installed control folder and release, run evidence, the engine's own run
// artifacts (round ledgers, frozen workflow sources, cross-run state), and
// every issue clone's unpushed Git objects/refs plus uncommitted work as a
// bundle and patch. Native login stores are deliberately excluded.
//
// Issue clones are candidate-writable, so every host Git call on them goes
// through git.mjs: trusted metadata is restored first, the arguments are
// hardened and the environment is clean. A clone without trusted metadata is
// recorded as a failure and Git never runs in it.
//
// Each part is captured independently: a failure is recorded in the manifest
// and the rest is still backed up. The manifest is always written, and only
// backups with a manifest count for retention, so a partial backup never
// displaces a complete one.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { factoryPaths, loadConfig } from "./config.mjs";
import { createGit, issuePaths, trustIssueRepo } from "./git.mjs";

const posix = path.posix;
const TOOLS = { sqlite3: "/usr/bin/sqlite3", tar: "/usr/bin/tar" };
const KEEP = 14;
// Per-project engine output that a restored engine needs to continue paused
// rounds: $ARTIFACTS_DIR (round ledgers), the frozen workflow source each run
// resolves from, and $STATE_DIR. Execution logs are not needed to resume.
const ENGINE_PARTS = ["artifacts/runs", "workflow-source", "state"];
const execute = (command, args, options = {}) =>
  execFileSync(command, args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
const message = (error) =>
  String(error?.stderr || error?.message || error)
    .trim()
    .slice(0, 600);

// createGit's process runner over the injectable synchronous runner, which
// throws on a non-zero exit.
const hostGit =
  (run) =>
  async ([command, ...args], { cwd, env, input }) => ({
    code: 0,
    stdout: run(command, args, { cwd, env, input }),
    stderr: "",
  });

export async function runBackup({
  config,
  now = () => new Date(),
  run = execute,
  tools = TOOLS,
}) {
  const paths = factoryPaths(config);
  const stamp = now().toISOString().replace(/[:.]/g, "-");
  const backups = posix.join(paths.root, "backups");
  const target = posix.join(backups, stamp);
  mkdirSync(target, { recursive: true, mode: 0o700 });
  const manifest = {
    createdAt: now().toISOString(),
    complete: false,
    files: [],
    issues: [],
    failures: [],
    omitted: ["native Claude profiles", "GitHub credentials"],
  };
  const warn = (text) => {
    manifest.warnings = [...(manifest.warnings ?? []), text];
  };
  const record = (file) => {
    const bytes = readFileSync(file);
    manifest.files.push({
      path: posix.relative(target, file),
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  };
  const part = (name, capture) => {
    try {
      capture();
    } catch (error) {
      manifest.failures.push({ part: name, error: message(error) });
    }
  };
  const archive = (name, file, args) => {
    try {
      run(tools.tar, [
        "--warning=no-file-changed",
        ...args.options,
        "-czf",
        file,
        ...args.members,
      ]);
    } catch (error) {
      // GNU tar exits 1 when a file changed while it was read (live run logs);
      // the archive is still complete. Anything else is a real failure.
      if (error.status !== 1) throw error;
      warn(`${name}: a file changed while it was archived`);
    }
    record(file);
  };

  try {
    // 1. Engine store through SQLite's online backup API (includes WAL content).
    part("engine-store", () => {
      const database = posix.join(config.archon.home, "archon.db");
      if (!existsSync(database)) return;
      const copy = posix.join(target, "archon.db");
      run(tools.sqlite3, [database, `.backup '${copy}'`]);
      const check = run(tools.sqlite3, [
        copy,
        "PRAGMA integrity_check;",
      ]).trim();
      if (check !== "ok")
        throw new Error(`integrity check failed: ${check.slice(0, 300)}`);
      record(copy);
    });
    // 2. Installed policy, configuration and evidence (bounded run directories).
    part("control-and-runs", () =>
      archive("control-and-runs", posix.join(target, "control-and-runs.tgz"), {
        options: ["--exclude=runs/*/strays/untracked", "-C", paths.root],
        members: ["control", "runs"],
      }),
    );
    // 3. The engine's run artifacts and frozen workflow sources.
    part("engine-runs", () => {
      const members = engineMembers(config.archon.home);
      if (!members.length) return;
      archive("engine-runs", posix.join(target, "engine-runs.tgz"), {
        options: ["--exclude=*/.archon/scratch", "-C", config.archon.home],
        members,
      });
    });
    // 4. Unfinished code: unpushed commits and uncommitted changes per issue.
    // With `issues` set, createGit restores the clone's trusted metadata
    // before every call, so a mid-backup rewrite is undone as well.
    const git = createGit({
      executable: config.git.executable,
      issues: paths.issues,
      run: hostGit(run),
    });
    if (existsSync(paths.issues))
      for (const issue of readdirSync(paths.issues).sort()) {
        if (!/^[1-9][0-9]*$/.test(issue)) {
          warn(`issues/${issue}: not an issue directory; skipped`);
          continue;
        }
        const where = issuePaths(paths, Number(issue));
        if (!existsSync(posix.join(where.repo, ".git"))) continue;
        try {
          trustIssueRepo(where);
          manifest.issues.push(
            await backupIssue({
              issue,
              repo: where.repo,
              target,
              run,
              tools,
              git,
              record,
            }),
          );
        } catch (error) {
          manifest.issues.push({ issue, failed: true });
          manifest.failures.push({
            part: `issue-${issue}`,
            error: message(error),
          });
        }
      }
  } finally {
    manifest.complete = manifest.failures.length === 0;
    writeFileSync(
      posix.join(target, "manifest.json"),
      JSON.stringify(manifest, null, 2),
    );
  }
  prune(backups);
  return { target, manifest };
}

function engineMembers(home) {
  const workspaces = posix.join(home, "workspaces");
  if (!existsSync(workspaces)) return [];
  const members = [];
  for (const owner of readdirSync(workspaces).sort()) {
    const ownerDir = posix.join(workspaces, owner);
    if (!statSync(ownerDir).isDirectory()) continue;
    for (const project of readdirSync(ownerDir).sort()) {
      const projectDir = posix.join(ownerDir, project);
      if (!statSync(projectDir).isDirectory()) continue;
      for (const part of ENGINE_PARTS)
        if (existsSync(posix.join(projectDir, part)))
          members.push(posix.join("workspaces", owner, project, part));
    }
  }
  return members;
}

async function backupIssue({
  issue,
  repo,
  target,
  run,
  tools,
  git: host,
  record,
}) {
  const git = (args) => host.ok(args, { cwd: repo });
  const pending = async (ref) =>
    Number(
      (
        await git(["rev-list", "--count", ref, "--not", "--remotes=origin"])
      ).trim(),
    ) > 0;
  // Git refuses an empty bundle, so bundle only refs with unpushed commits.
  const branch = (await git(["branch", "--show-current"])).trim();
  const refs = (
    await git(["for-each-ref", "--format=%(refname)", "refs/heads"])
  )
    .trim()
    .split("\n")
    .filter(Boolean);
  const unpushed = [];
  for (const ref of refs) if (await pending(ref)) unpushed.push(ref);
  if (!branch && (await pending("HEAD"))) unpushed.push("HEAD");
  if (unpushed.length) {
    const bundle = posix.join(target, `issue-${issue}.bundle`);
    await git([
      "bundle",
      "create",
      bundle,
      ...unpushed,
      "--not",
      "--remotes=origin",
    ]);
    record(bundle);
  }
  // hardenedArgs adds --no-ext-diff --no-textconv: a configured diff driver
  // would replace the binary patch.
  const patch = await git(["diff", "--binary", "HEAD"]);
  const patchFile = posix.join(target, `issue-${issue}.worktree.patch`);
  writeFileSync(patchFile, patch);
  record(patchFile);
  const untracked = (
    await git(["ls-files", "--others", "--exclude-standard", "-z"])
  )
    .split("\0")
    .filter(Boolean);
  if (untracked.length) {
    const tar = posix.join(target, `issue-${issue}.untracked.tgz`);
    run(tools.tar, ["-czf", tar, "-C", repo, "--null", "-T", "-"], {
      input: untracked.join("\0"),
    });
    record(tar);
  }
  return {
    issue,
    head: (await git(["rev-parse", "HEAD"])).trim(),
    branch,
    untracked: untracked.length,
    unpushed,
  };
}

// Bounded retention over finished backups (those with a manifest): keep the
// newest KEEP, and also the newest KEEP complete ones so a run of partial
// backups never prunes the last good one. A directory without a manifest is a
// backup that died before finishing and is removed.
function prune(backups) {
  const finished = [];
  for (const name of readdirSync(backups).sort()) {
    const dir = posix.join(backups, name);
    if (!statSync(dir).isDirectory()) continue;
    const file = posix.join(dir, "manifest.json");
    if (!existsSync(file)) {
      rmSync(dir, { recursive: true, force: true });
      continue;
    }
    let complete = false;
    try {
      complete = JSON.parse(readFileSync(file, "utf8")).complete !== false;
    } catch {}
    finished.push({ name, complete });
  }
  const keep = new Set([
    ...finished.slice(-KEEP).map((entry) => entry.name),
    ...finished
      .filter((entry) => entry.complete)
      .slice(-KEEP)
      .map((entry) => entry.name),
  ]);
  for (const { name } of finished)
    if (!keep.has(name))
      rmSync(posix.join(backups, name), { recursive: true, force: true });
}

// Node resolves the main module's real path but leaves argv[1] as given, so
// compare real paths: a unit started through a link must still back up.
function invokedAsScript() {
  if (!process.argv[1]) return false;
  try {
    return (
      realpathSync(process.argv[1]) ===
      realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return false;
  }
}

if (invokedAsScript()) {
  const { target, manifest } = await runBackup({ config: loadConfig() });
  console.log(
    JSON.stringify({
      backup: target,
      complete: manifest.complete,
      files: manifest.files.length,
      issues: manifest.issues.length,
      failures: manifest.failures,
    }),
  );
  if (!manifest.complete) process.exitCode = 1;
}
