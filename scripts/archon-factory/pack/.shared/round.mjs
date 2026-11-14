// Shared plumbing for one delivery round's trusted script nodes.
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { createArchon } from "./archon.mjs";
import { factoryPaths, limits, loadConfig } from "./config.mjs";
import { CheckCleanupError, executeCandidateCheck } from "./executor.mjs";
import { createGit, issuePaths, trustIssueRepo } from "./git.mjs";
import { runHeavyCheck } from "./heavy-check.mjs";
import {
  bindRunIdentity,
  isInitialNode,
  readRunIdentity,
  verifyNativeIdentity,
  NativeIdentityRefusal,
} from "./identity.mjs";
import { RUN_DETAIL_LIMIT } from "./native-faults.mjs";
import { readRunContext, writeRunContext } from "./runctx.mjs";

const posix = path.posix;

export const sha256 = (value) =>
  createHash("sha256")
    .update(typeof value === "string" ? value : JSON.stringify(value))
    .digest("hex");

export function emit(value) {
  process.stdout.write(JSON.stringify(value) + "\n");
}

export function input(name) {
  const raw = process.env[`INPUTS_${name.toUpperCase().replace(/-/g, "_")}`];
  if (raw === undefined) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function policyRevision(paths) {
  const file = posix.join(
    paths.control,
    ".archon",
    "core-factory-release.json",
  );
  const release = JSON.parse(readFileSync(file, "utf8"));
  if (!/^[a-f0-9]{64}$/.test(release.policyRevision ?? ""))
    throw new Error("Installed release has no policy revision");
  return release;
}

export function openRound() {
  const runId = process.env.WORKFLOW_ID;
  const artifacts = process.env.ARTIFACTS_DIR;
  if (!runId || !artifacts) throw new Error("Not inside a factory run");
  const config = loadConfig();
  const paths = factoryPaths(config);
  const issue = Number(input("issue"));
  const assignment = String(input("assignment") ?? "");
  if (!Number.isSafeInteger(issue) || issue <= 0)
    throw new Error("Invalid issue input");
  const archon = createArchon();
  const git = createGit({
    executable: config.git.executable,
    author: { name: config.git.authorName, email: config.git.authorEmail },
    issues: paths.issues,
  });
  const ledgerDir = posix.join(artifacts, "round");
  mkdirSync(ledgerDir, { recursive: true });
  const runDir = posix.join(paths.runs, runId);
  mkdirSync(runDir, { recursive: true, mode: 0o750 });
  return {
    runId,
    artifacts,
    config,
    paths,
    limits: limits(config),
    issue,
    assignment,
    archon,
    git,
    where: issuePaths(paths, issue),
    runDir,
    now: () => new Date().toISOString(),
    ledger: {
      write(node, value) {
        writeFileSync(
          posix.join(ledgerDir, `${node}.json`),
          JSON.stringify(value, null, 2),
        );
      },
      read(node) {
        const file = posix.join(ledgerDir, `${node}.json`);
        return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
      },
      all() {
        const result = {};
        for (const name of readdirSync(ledgerDir))
          if (name.endsWith(".json"))
            result[name.slice(0, -5)] = JSON.parse(
              readFileSync(posix.join(ledgerDir, name), "utf8"),
            );
        return result;
      },
    },
    materials(role) {
      const dir = posix.join(runDir, "materials", role);
      mkdirSync(dir, { recursive: true, mode: 0o750 });
      return dir;
    },
    context: {
      read: () => readRunContext(runId, paths.runs),
      write: (value) => writeRunContext(value, paths.runs),
    },
  };
}

// A delivery root pins its assignment; a native child inherits its parent's
// immutable binding. Neither path may select a fresh ambient account digest.
export async function inheritRoundIdentity(
  round,
  expected,
  {
    readIdentity = readRunIdentity,
    bindIdentity = bindRunIdentity,
    verifyIdentity = verifyNativeIdentity,
    env = process.env,
  } = {},
) {
  if (
    typeof expected?.owner !== "string" ||
    !/^[a-f0-9]{64}$/.test(expected?.profileDigest ?? "")
  )
    throw new NativeIdentityRefusal("identity-assignment-invalid");
  let result;
  try {
    result = await round.archon.raw(
      ["workflow", "get", round.runId, "--json", "--verbose", "--events"],
      undefined,
      { maxOutput: RUN_DETAIL_LIMIT },
    );
  } catch {
    throw new NativeIdentityRefusal("identity-run-unavailable");
  }
  const run = result?.json?.run ?? result?.json;
  if (
    result?.code !== 0 ||
    run?.id !== round.runId ||
    !Object.hasOwn(run, "parent_run_id") ||
    (run.parent_run_id !== null &&
      (typeof run.parent_run_id !== "string" ||
        run.parent_run_id === round.runId))
  )
    throw new NativeIdentityRefusal("identity-run-invalid");
  let existing;
  try {
    existing = readIdentity({ config: round.config, runId: round.runId });
  } catch (error) {
    if (error?.code !== "identity-run-binding-missing") throw error;
  }
  if (
    existing &&
    (existing.owner !== expected.owner ||
      existing.profileDigest !== expected.profileDigest)
  )
    throw new NativeIdentityRefusal("identity-run-binding-drift");
  if (!existing) {
    let execution;
    try {
      execution = JSON.parse(env.ARCHON_NODE_EXECUTION);
    } catch {}
    if (
      run.status !== "running" ||
      run.adopted_from_run_id !== null ||
      run.workflow_name !== "core-deliver" ||
      !isInitialNode({
        events: result.json.events,
        runId: round.runId,
        execution,
        step: "claim",
      })
    )
      throw new NativeIdentityRefusal("identity-initial-run-required");
  }
  let inherited;
  if (run.parent_run_id !== null) {
    inherited = readIdentity({
      config: round.config,
      runId: run.parent_run_id,
    });
    if (
      inherited.owner !== expected.owner ||
      inherited.profileDigest !== expected.profileDigest
    )
      throw new NativeIdentityRefusal("identity-run-binding-drift");
  }
  const observed = await verifyIdentity({
    config: round.config,
    owner: expected.owner,
    expectedDigest: expected.profileDigest,
  });
  if (
    observed.owner !== expected.owner ||
    observed.profileDigest !== expected.profileDigest ||
    (inherited &&
      (observed.profile !== inherited.profile ||
        observed.provider !== inherited.provider))
  )
    throw new NativeIdentityRefusal("identity-run-binding-drift");
  return bindIdentity({
    config: round.config,
    runId: round.runId,
    binding: existing ?? inherited ?? observed,
  });
}

export async function workItem(round) {
  return round.archon.get(`core/issues/${round.issue}`);
}

export async function writeWorkItem(round, plan) {
  return round.archon.put(plan.name, plan.value, {
    ifRevision: plan.ifRevision,
    lease: plan.lease,
  });
}

// Every tracked node_modules directory of the issue clone, mounted read-only
// into reviewer views so their checks run without copying dependencies.
// Freeze reinstalls them from the candidate lockfile first; a path the
// executor cannot express as a mount is skipped rather than failing checks.
const unmountable = /["\0\r\n]/;
export function nodeModulesMounts(repo, target = "/candidate") {
  const mounts = [];
  const visit = (dir, depth) => {
    if (depth > 3) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === ".git") continue;
      const full = posix.join(dir, entry.name);
      if (unmountable.test(full)) continue;
      if (entry.name === "node_modules") {
        mounts.push({
          source: full,
          target: posix.join(target, posix.relative(repo, full)),
          readOnly: true,
        });
        continue;
      }
      if (
        [
          "apps",
          "packages",
          "tooling",
          "scripts",
          "supabase",
          "tests",
        ].includes(entry.name) ||
        depth > 0
      )
        visit(full, depth + 1);
    }
  };
  if (existsSync(repo)) visit(repo, 0);
  return mounts;
}

// The cache directories read-only checks may write: created here, by the
// trusted side, inside the clone's dependency directories, and named as the
// container paths the executor covers with a private scratch mount. The root
// gets the caches tools keep there; a workspace gets Vite's temporary
// directory only.
export function scratchTargets(repo, target = "/candidate") {
  const targets = [];
  for (const mount of nodeModulesMounts(repo, target)) {
    const names =
      mount.target === posix.join(target, "node_modules")
        ? [".vite-temp", ".vite", ".cache"]
        : [".vite-temp"];
    for (const name of names) {
      mkdirSync(posix.join(mount.source, name), { recursive: true });
      targets.push(posix.join(mount.target, name));
    }
  }
  return targets;
}

// Run one trusted step inside the credential-free executor against the
// issue clone (hooks, installs and preflight execute candidate code there).
// The clone's Git metadata is restored first, so no step sees hooks or
// drivers an earlier step planted. Every step shares the bounded heavy pool;
// cleanup uncertainty retains capacity and the issue workspace.
// --- Bun's package cache ------------------------------------------------------
// Bun refuses to install, even offline, unless it can rename into its cache
// directory, and Core's own unit tests run `bun install --offline`. A cache
// that candidate code could write would let one issue feed another, so:
//  * a seed is a cache directory keyed by the lockfile's digest, written only
//    by the fixed no-scripts install below (registry bytes verified against
//    that lockfile; no candidate code runs) and completed by a marker file
//    that sits outside anything a container mounts;
//  * every other step sees the seed read-only and gets a private cache on the
//    container's tmpfs whose entries are links into it. New entries stay
//    private and vanish with the container.
export const BUN_SEED_COMMAND = Object.freeze([
  "bun",
  "install",
  "--frozen-lockfile",
  "--ignore-scripts",
]);
const SEED_TARGET = "/bun-cache";
const PRIVATE_CACHE = "/tmp/bun-cache";
const EMPTY_CACHE = "/tmp/bun-install-cache";
const PRIVATE_CACHE_PRELUDE = `set -e; mkdir -p ${PRIVATE_CACHE}; find ${SEED_TARGET} -mindepth 1 -maxdepth 1 ! -name .tmp -exec ln -s -t ${PRIVATE_CACHE} {} +; exec "$@"`;

export function lockDigestOf(repo) {
  const lock = posix.join(repo, "bun.lock");
  if (!lstatSync(lock, { throwIfNoEntry: false })?.isFile()) return null;
  return sha256(readFileSync(lock, "utf8"));
}

export function seedPaths(paths, lockDigest) {
  if (!/^[a-f0-9]{64}$/.test(lockDigest ?? ""))
    throw new Error("A seed needs a lockfile digest");
  const dir = posix.join(paths.cache, "bun-seed", lockDigest);
  return { dir, marker: `${dir}.json` };
}

export function seedCompleted(paths, lockDigest) {
  if (!lockDigest) return false;
  const { dir, marker } = seedPaths(paths, lockDigest);
  try {
    return (
      lstatSync(dir).isDirectory() &&
      JSON.parse(readFileSync(marker, "utf8")).lockDigest === lockDigest
    );
  } catch {
    return false;
  }
}

// What a container step gets for `cache`: false is an empty private cache,
// true is a private view of the lockfile's completed seed (or an empty cache
// when there is none), "seed" writes the seed and only for the fixed command.
export function bunCachePlan({ paths, repo, cache, command }) {
  if (cache === "seed") {
    if (JSON.stringify(command) !== JSON.stringify(BUN_SEED_COMMAND))
      throw Object.assign(
        new Error(
          "seed-command-refused: only the no-scripts install may write a seed",
        ),
        { code: "seed-command-refused" },
      );
    const { dir } = seedPaths(paths, lockDigestOf(repo));
    mkdirSync(dir, { recursive: true });
    return {
      mounts: [{ source: dir, target: SEED_TARGET, readOnly: false }],
      cacheDirectory: SEED_TARGET,
      command: [...command],
    };
  }
  const lockDigest = cache ? lockDigestOf(repo) : null;
  if (!seedCompleted(paths, lockDigest))
    return { mounts: [], cacheDirectory: EMPTY_CACHE, command: [...command] };
  const { dir, marker } = seedPaths(paths, lockDigest);
  try {
    const now = new Date();
    utimesSync(marker, now, now);
  } catch {}
  return {
    mounts: [{ source: dir, target: SEED_TARGET, readOnly: true }],
    cacheDirectory: PRIVATE_CACHE,
    command: [
      "/bin/sh",
      "-c",
      PRIVATE_CACHE_PRELUDE,
      "core-private-bun-cache",
      ...command,
    ],
  };
}

// Keep the newest seeds; never one used in the last week.
export function pruneSeeds(paths, { keep = 4, now = Date.now() } = {}) {
  const root = posix.join(paths.cache, "bun-seed");
  let markers;
  try {
    markers = readdirSync(root)
      .filter((name) => /^[a-f0-9]{64}\.json$/.test(name))
      .map((name) => ({
        digest: name.slice(0, 64),
        used: statSync(posix.join(root, name)).mtimeMs,
      }))
      .sort((left, right) => right.used - left.used);
  } catch {
    return [];
  }
  const removed = [];
  for (const { digest, used } of markers.slice(keep)) {
    if (now - used < 7 * 24 * 60 * 60 * 1000) continue;
    rmSync(posix.join(root, `${digest}.json`), { force: true });
    rmSync(posix.join(root, digest), { recursive: true, force: true });
    removed.push(digest);
  }
  return removed;
}

export async function runInIssueRepo(
  round,
  {
    command,
    network = "none",
    timeoutMs,
    outbox = false,
    cache = false,
    env = {},
    memoryMb = 16384,
    cpus = 8,
  },
  { execute = executeCandidateCheck, signal, reconcile, slotClock } = {},
) {
  const { where, paths, config } = round;
  trustIssueRepo(where);
  const mounts = [
    {
      source: posix.join(paths.mirror, "objects"),
      target: posix.join(paths.mirror, "objects"),
      readOnly: true,
    },
  ];
  if (outbox)
    mounts.push({ source: where.outbox, target: "/outbox", readOnly: false });
  const cachePlan = bunCachePlan({ paths, repo: where.repo, cache, command });
  mounts.push(...cachePlan.mounts);
  let currentAttempt;
  try {
    return await runHeavyCheck(
      {
        config,
        locks: paths.locks ?? posix.join(paths.root ?? config.root, "locks"),
        runId: round.runId,
        issue: round.issue,
        node: process.env.ARCHON_NODE_ID ?? "trusted-script",
      },
      async (attempt) => {
        currentAttempt = attempt;
        return execute({
          attempt,
          dockerExecutable: config.executor.docker,
          image: config.executor.image,
          workspaceRoot: where.root,
          workspaceDirectory: where.repo,
          workspaceTarget: where.repo,
          mounts,
          network,
          runId: round.runId,
          issue: round.issue,
          ...(signal ? { signal } : {}),
          tmpfsMb: 4096,
          env: {
            GIT_AUTHOR_NAME: config.git.authorName,
            GIT_AUTHOR_EMAIL: config.git.authorEmail,
            GIT_COMMITTER_NAME: config.git.authorName,
            GIT_COMMITTER_EMAIL: config.git.authorEmail,
            GIT_TERMINAL_PROMPT: "0",
            BUN_INSTALL_CACHE_DIR: cachePlan.cacheDirectory,
            NEXT_TELEMETRY_DISABLED: "1",
            TURBO_TELEMETRY_DISABLED: "1",
            ...env,
          },
          command: cachePlan.command,
          limits: {
            cpus,
            memoryMb,
            pids: 8192,
            timeoutMs,
            outputBytes: 16 * 1024 * 1024,
          },
        });
      },
      { signal, reconcile, clock: slotClock },
    );
  } catch (error) {
    if (error?.code === "check-capacity" || error?.code === "check-cancelled") {
      round.ledger.write("executor-capacity", {
        blocked: {
          code: error.code,
          detail: error.message,
          recovery: "Reconcile shared check capacity and resume the same run",
        },
      });
    } else if (
      currentAttempt &&
      (error?.receipt?.cleanupConfirmed !== true ||
        error?.receipt?.reusable !== true)
    ) {
      const receipt = error?.receipt ?? {
        labels: {
          "core.archon.executor": "candidate-check",
          "core.archon.attempt": currentAttempt,
          "core.archon.run": round.runId,
          "core.archon.issue": String(round.issue),
        },
        cleanupConfirmed: false,
        reusable: false,
      };
      round.ledger.write("executor-cleanup", {
        cleanup: {
          step: "trusted-script",
          runId: round.runId,
          assignment: round.assignment,
          issue: round.issue,
          error: { name: error.name, message: error.message },
          receipt,
        },
        blocked: {
          code: "cleanup-unconfirmed",
          detail: "Executor cleanup requires independent confirmation",
        },
      });
      if (error?.name !== "CheckCleanupError")
        throw new CheckCleanupError(receipt, error);
    }
    throw error;
  }
}

// Remove every node_modules tree in the clone without following links, so a
// clean install cannot inherit files a writer planted in a dependency.
export function removeNodeModules(repo) {
  const removed = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = posix.join(dir, entry.name);
      if (entry.name === "node_modules") {
        rmSync(full, { recursive: true, force: true });
        removed.push(posix.relative(repo, full));
      } else if (
        entry.isDirectory() &&
        !entry.isSymbolicLink() &&
        !(dir === repo && entry.name === ".git")
      )
        visit(full);
    }
  };
  visit(repo);
  return removed;
}

// Install from the lockfile's seed. The first install for a lockfile seeds it
// with the no-scripts command (the only step that writes a seed), discards
// that tree, and then installs with lifecycle scripts from a private view, so
// candidate lifecycle scripts cannot persist dependency bytes for later hooks
// or independent verification. `clean` discards every existing node_modules
// first (freeze uses it so independent checks see dependencies derived from
// the candidate lockfile).
const installFailure = (label, receipt) =>
  Object.assign(
    new Error(
      `${label} failed: ${`${receipt.stdout ?? ""}${receipt.stderr ?? ""}`.slice(-1500)}`,
    ),
    { receipt },
  );

export async function ensureInstall(round, { clean = false, execute } = {}) {
  const lock = posix.join(round.where.repo, "bun.lock");
  if (!lstatSync(lock).isFile())
    throw new Error("bun.lock is not a regular file");
  const lockDigest = sha256(readFileSync(lock, "utf8"));
  const marker = posix.join(round.where.root, "install.json");
  const seeded = seedCompleted(round.paths, lockDigest);
  if (!clean && seeded && existsSync(marker)) {
    const previous = JSON.parse(readFileSync(marker, "utf8"));
    if (
      previous.lockDigest === lockDigest &&
      existsSync(posix.join(round.where.repo, "node_modules"))
    )
      return { reused: true, lockDigest };
  }
  rmSync(marker, { force: true });
  let removed = clean || !seeded ? removeNodeModules(round.where.repo) : [];
  if (!seeded) {
    // Nothing may be installed yet, or Bun would have nothing to fetch.
    const seeding = await runInIssueRepo(
      round,
      {
        command: [...BUN_SEED_COMMAND],
        network: "bridge",
        cache: "seed",
        timeoutMs: 30 * 60_000,
      },
      { execute },
    );
    if (seeding.cleanupConfirmed !== true || seeding.reusable !== true)
      throw new CheckCleanupError(seeding);
    if (seeding.status !== "passed")
      throw installFailure("bun cache seed", seeding);
    const seed = seedPaths(round.paths, lockDigest);
    const pending = `${seed.marker}.${process.pid}.tmp`;
    writeFileSync(
      pending,
      JSON.stringify({
        v: 1,
        lockDigest,
        at: new Date().toISOString(),
        container: seeding.containerId ?? null,
        by: { run: round.runId, issue: round.issue },
      }),
    );
    renameSync(pending, seed.marker);
    pruneSeeds(round.paths);
    removed = [...removed, ...removeNodeModules(round.where.repo)];
  }
  const receipt = await runInIssueRepo(
    round,
    {
      command: ["bun", "install", "--frozen-lockfile"],
      network: "bridge",
      cache: true,
      timeoutMs: 30 * 60_000,
    },
    { execute },
  );
  if (receipt.cleanupConfirmed !== true || receipt.reusable !== true)
    throw new CheckCleanupError(receipt);
  if (receipt.status !== "passed") throw installFailure("bun install", receipt);
  writeFileSync(
    marker,
    JSON.stringify({
      lockDigest,
      at: new Date().toISOString(),
      container: receipt.containerId,
      clean,
    }),
  );
  return {
    reused: false,
    lockDigest,
    seeded: !seeded,
    removed: removed.length,
  };
}

export function clipText(text, size) {
  if (text.length <= size) return text;
  return (
    text.slice(0, size) +
    `\n\n[... ${text.length - size} characters omitted; read the full file from your materials directory]`
  );
}

export function renderAssignment({ title, identity, sections, contract }) {
  const lines = [
    `# ${title}`,
    "",
    "## Identity (trusted, supplied by the factory)",
    "",
  ];
  for (const [key, value] of Object.entries(identity))
    lines.push(`- ${key}: ${value}`);
  for (const [heading, body] of sections)
    lines.push("", `## ${heading}`, "", body);
  lines.push("", "## Result", "", contract);
  return lines.join("\n");
}

export function dirSize(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = posix.join(dir, entry.name);
    total += entry.isDirectory() ? dirSize(full) : statSync(full).size;
  }
  return total;
}
