/**
 * #2277 shared fixtures. Spec r1 plus addendum 1:
 * {@link https://github.com/Asymmetric-al/core/issues/2277#issuecomment-6386065652}
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 *
 * No test here talks to GitHub. Module tests inject a fake `run`; CLI tests
 * put a fake `gh` (and a fake `bun`) first on PATH in a throwaway git repo.
 */
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
export const SPEC_BASE_SHA = "02bd6e661ad8a94ccaf97111942658982cb6fe78";
export const MODULE_PATH = "scripts/release/release-blockers.mjs";
export const PRODUCTION_PATH = "scripts/release/production.mjs";
export const REPO = "Asymmetric-al/core";

/** §2.1: the two exact `gh` invocations, in order. */
const LIST_PATH =
  "repos/Asymmetric-al/core/issues?state=open&labels=release-blocker&per_page=100";
const JQ = ".[] | {number, title, html_url, state, pull_request}";
export const LABEL_ARGS =
  "gh api repos/Asymmetric-al/core/labels/release-blocker".split(" ");
export const LIST_ARGS = ["gh", "api", "--paginate", LIST_PATH, "--jq", JQ];

/** §2.3 message texts. */
export const refusedFirstLine = (n: number) =>
  `release:production refused: ${n} open release-blocker issue(s) in ${REPO}`;
export const REFUSED_LAST_LINE =
  "Close the issue(s) or remove the release-blocker label, then re-run.";
export const LABEL_MISSING_MESSAGE =
  "release:production refused: label release-blocker not found in Asymmetric-al/core. Create it (docs/ops/production-release.md#release-blockers) before releasing.";
export const VERIFY_FAILED_RE =
  /^release:production refused: could not verify release blockers \(.+\)\. Check `gh auth status` and network, then re-run\.$/u;
export const passLine = (stage: string) =>
  `==> release blockers (${stage}): none open`;

export const read = (relativePath: string) => {
  const absolute = path.join(REPO_ROOT, relativePath);
  if (!existsSync(absolute)) throw new Error(`missing file: ${relativePath}`);
  return readFileSync(absolute, "utf8");
};

export type Blocker = { number: number; title: string; url: string };
export type QueryResult =
  { ok: true; blockers: Blocker[] } | { ok: false; reason: string };
type Opts = { run: unknown; log?: (line: string) => void; stage?: string };
export interface ReleaseBlockersModule {
  RELEASE_BLOCKER_LABEL: unknown;
  RELEASE_REPO: unknown;
  queryReleaseBlockers: (opts: Opts) => unknown;
  evaluateReleaseBlockers: (r: unknown) => {
    allowed: boolean;
    message: string;
  };
  assertNoReleaseBlockers: (opts: Opts) => unknown;
}

export async function loadModule(): Promise<ReleaseBlockersModule> {
  const absolute = path.join(REPO_ROOT, MODULE_PATH);
  if (!existsSync(absolute)) throw new Error(`missing module: ${MODULE_PATH}`);
  return (await import(pathToFileURL(absolute).href)) as ReleaseBlockersModule;
}

/** One `gh` issues-list item exactly as `--jq '{…, pull_request}'` prints it. */
export function item(
  number: number,
  extra: { state?: string; pr?: boolean; title?: string } = {},
) {
  return JSON.stringify({
    number,
    title: extra.title ?? `Blocker ${number}`,
    html_url: `https://github.com/${REPO}/${extra.pr ? "pull" : "issues"}/${number}`,
    state: extra.state ?? "open",
    // jq object construction always emits the key; issues get null.
    pull_request: extra.pr
      ? { url: `https://api.github.com/repos/${REPO}/pulls/${number}` }
      : null,
  });
}

type Reply = Partial<SpawnSyncReturns<string>>;
export const ok = (stdout = ""): Reply => ({ status: 0, stdout, stderr: "" });
export const fail = (stderr: string, stdout = ""): Reply => ({
  status: 1,
  stdout,
  stderr,
});
const spawnError = (code: string, signal: NodeJS.Signals | null): Reply => ({
  status: null,
  signal,
  stdout: "",
  stderr: "",
  error: Object.assign(new Error(`spawnSync gh ${code}`), { code }),
});
export const enoent = () => spawnError("ENOENT", null);
export const timedOut = () => spawnError("ETIMEDOUT", "SIGTERM");
export const LABEL_OK = ok(
  JSON.stringify({ name: "release-blocker", color: "b60205" }),
);
export const LABEL_404 = fail(
  'gh: Not Found (HTTP 404)\n{"message":"Not Found","status":"404"}',
);

/** A reply that makes `run` itself throw (an exec-style runner's ENOENT). */
export const THROWS: Reply = {};

/** Fake `run`: spawnSync-shaped replies; calls recorded as ["gh", ...args]. */
export function fakeRun(replies: Reply[]) {
  const calls: string[][] = [];
  const run = (...callArgs: unknown[]) => {
    const [first, second] = callArgs;
    const args =
      typeof first === "string" && Array.isArray(second)
        ? [first, ...(second as string[])]
        : Array.isArray(first)
          ? (first as string[])
          : [String(first)];
    calls.push(args[0] === "gh" ? [...args] : ["gh", ...args]);
    // Unscripted calls succeed (label ok, no blockers): fail-open shows.
    const reply =
      replies[calls.length - 1] ?? [LABEL_OK, ok("")][calls.length - 1];
    if (!reply) throw new Error(`unexpected gh call #${calls.length}`);
    if (reply === THROWS) throw enoent().error;
    return { pid: 1, output: [], signal: null, error: undefined, ...reply };
  };
  return { run, calls };
}

// --- CLI sandbox ----------------------------------------------------------

export interface GhScenario {
  label?: { status: number; stdout?: string; stderr?: string };
  /** One reply per list call, in order (pre-flight, then pre-push). */
  lists?: { status: number; stdout?: string; stderr?: string }[];
}

const FAKE_GH = `#!/usr/bin/env node
const fs = require("node:fs");
const s = JSON.parse(fs.readFileSync(process.env.ACC2277_SCENARIO, "utf8"));
const log = process.env.ACC2277_GH_LOG;
const prior = fs.existsSync(log) ? fs.readFileSync(log, "utf8").split("\\n").filter(Boolean) : [];
fs.appendFileSync(log, JSON.stringify(process.argv.slice(2)) + "\\n");
const isList = process.argv.slice(2).some((a) => a.includes("/issues"));
const listsSoFar = prior.filter((l) => l.includes("/issues")).length;
const r = (isList ? (s.lists || [])[listsSoFar] : s.label) || { status: 2, stderr: "fake gh: no reply" };
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
process.exit(r.status);
`;

const FAKE_BUN = `#!/usr/bin/env node
const fs = require("node:fs");
fs.appendFileSync(process.env.ACC2277_BUN_LOG, JSON.stringify(process.argv.slice(2)) + "\\n");
console.log("FAKE_BUN " + process.argv.slice(2).join(" "));
`;

function which(name: string): string {
  for (const dir of (process.env.PATH ?? "").split(path.delimiter)) {
    const candidate = path.join(dir, name);
    if (dir && existsSync(candidate)) return candidate;
  }
  throw new Error(`${name} not found on PATH`);
}

function cleanEnv(extra: Record<string, string>) {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (
      value !== undefined &&
      !key.startsWith("GIT_") &&
      !key.startsWith("ASYM_")
    )
      env[key] = value;
  }
  return { ...env, ...extra };
}

/**
 * A throwaway repo on `develop` (clean, one commit ahead of `production`) with
 * a local bare `origin`. PATH holds only git, node, a fake bun and, unless
 * `gh: false`, a fake gh driven by `scenario`.
 */
export function makeSandbox(scenario: GhScenario | false) {
  const root = mkdtempSync(path.join(tmpdir(), "acc-2277-"));
  const bin = path.join(root, "bin");
  const work = path.join(root, "work");
  const origin = path.join(root, "origin.git");
  mkdirSync(bin);
  mkdirSync(work);
  symlinkSync(which("git"), path.join(bin, "git"));
  symlinkSync(process.execPath, path.join(bin, "node"));
  writeFileSync(path.join(bin, "bun"), FAKE_BUN);
  chmodSync(path.join(bin, "bun"), 0o755);
  if (scenario) {
    writeFileSync(path.join(bin, "gh"), FAKE_GH);
    chmodSync(path.join(bin, "gh"), 0o755);
    writeFileSync(path.join(root, "scenario.json"), JSON.stringify(scenario));
  }
  const ghLog = path.join(root, "gh.log");
  const bunLog = path.join(root, "bun.log");
  const env = cleanEnv({
    PATH: bin,
    HOME: root,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: path.join(root, "gitconfig"),
    ACC2277_SCENARIO: path.join(root, "scenario.json"),
    ACC2277_GH_LOG: ghLog,
    ACC2277_BUN_LOG: bunLog,
  });
  const git = (cwd: string, ...args: string[]) => {
    const r = spawnSync("git", args, { cwd, env, encoding: "utf8" });
    if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
    return r.stdout.trim();
  };
  const id = ["-c", "user.name=acc", "-c", "user.email=acc@example.invalid"];
  git(root, "init", "-q", "--bare", origin);
  git(work, "init", "-q", "-b", "production");
  writeFileSync(path.join(work, "a.txt"), "one\n");
  git(work, "add", "a.txt");
  git(work, ...id, "commit", "-q", "-m", "one");
  git(work, "checkout", "-q", "-b", "develop");
  writeFileSync(path.join(work, "a.txt"), "two\n");
  git(work, ...id, "commit", "-q", "-am", "two");
  git(work, "remote", "add", "origin", origin);
  git(work, "push", "-q", "origin", "production", "develop");
  const productionBefore = git(origin, "rev-parse", "production");

  const lines = (file: string) =>
    existsSync(file)
      ? readFileSync(file, "utf8")
          .split("\n")
          .filter(Boolean)
          .map((l) => JSON.parse(l) as string[])
      : [];
  return {
    release(...args: string[]) {
      const r = spawnSync(
        process.execPath,
        [path.join(REPO_ROOT, PRODUCTION_PATH), ...args],
        { cwd: work, env, encoding: "utf8", timeout: 60_000 },
      );
      return {
        status: r.status,
        output: `${r.stdout}\n${r.stderr}`,
        stdout: r.stdout,
        stderr: r.stderr,
      };
    },
    ghCalls: () => lines(ghLog),
    bunCalls: () => lines(bunLog),
    productionMoved: () =>
      git(origin, "rev-parse", "production") !== productionBefore,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}
