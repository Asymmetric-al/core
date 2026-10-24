/**
 * Shared harness for the #2221 acceptance tests (`ci-gate-comment` job).
 * Owned by Acceptance; implementers must not edit this file to satisfy their PR.
 * Spec rev 1 (base a200250f) and the approval with rulings, which override the
 * spec where they differ (delete + re-create instead of edit in place):
 * https://github.com/Asymmetric-al/core/issues/2221#issuecomment-6375001482
 * https://github.com/Asymmetric-al/core/issues/2221#issuecomment-6375027774
 *
 * Contract these tests assume (spec §1, §2 I1-I5; ruling 1):
 * - `.github/workflows/ci.yml` gains a job keyed `ci-gate-comment`. Its logic
 *   is a single inline `run:` step (no repo script), so the "fake GitHub API"
 *   here is a stub `gh` on `PATH` that records every call. The step body is
 *   executed for real under its step shell, with its step `env` rendered from
 *   a modelled `github`/`needs` context, in an empty working directory, with a
 *   sandboxed `PATH` (no real `gh`, no `curl`, no network).
 * - Supported `gh` surface (anything else is recorded as UNSUPPORTED and fails
 *   with exit 2): `gh api <endpoint>` with `-X/--method`, `-f/--raw-field`,
 *   `-F/--field` (incl. `@file`/`@-`), `--input <file|->`, `-H`, `--paginate`,
 *   `--slurp`, `-q/--jq`, `--silent`; `gh pr view <n> --json <fields>`
 *   (`-q/--jq`, `-R/--repo`); `gh pr comment <n>` / `gh issue comment <n>`
 *   with `-b/--body`, `-F/--body-file` (create) or `--edit-last` (recorded as
 *   PATCH). `{owner}/{repo}` placeholders resolve from `GH_REPO` only (there
 *   is no git checkout). Like real `gh`, no `GH_TOKEN`/`GITHUB_TOKEN` means
 *   exit 4 and no call.
 * - REST routes modelled: GET pulls/{n}, GET issues/{n}/comments (paged:
 *   `per_page` default 30, max 100, `page`), GET/PATCH/DELETE
 *   issues/comments/{id}, POST issues/{n}/comments, GET user (403, as for an
 *   installation token). Anything else is 404.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
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

import * as E from "../../helpers/github-expression";
import * as W from "../../helpers/workflow-yaml";

export const SPEC_URL =
  "https://github.com/Asymmetric-al/core/issues/2221#issuecomment-6375001482";
export const RULINGS_URL =
  "https://github.com/Asymmetric-al/core/issues/2221#issuecomment-6375027774";

export const CI = ".github/workflows/ci.yml";
export const CII = ".github/workflows/ci-integration.yml";
export const DOC = "docs/ci.md";
export const JOB_ID = "ci-gate-comment";
export const MARKER = "<!-- ci-gate-status -->";
export const BOT = "github-actions[bot]";
export const REPO = W.REPOSITORY;
export const SERVER_URL = "https://github.com";
/** Stand-in for `github.token`; never a real credential. */
export const FAKE_TOKEN = "ghs_FAKE2221acceptanceTOKENnotreal000000";

export const text = (file: string) => readFileSync(file, "utf8");
export const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const ciDoc = () => W.parseWorkflowSource(text(CI));
export const ciJobs = () => W.workflowJobs(ciDoc(), CI);

/** The new job; a clear failure (not a crash) while it does not exist. */
export function commentJob(): W.WorkflowJob {
  const job = ciJobs()[JOB_ID];
  if (!job || typeof job !== "object") {
    throw new Error(
      `${CI} has no \`${JOB_ID}\` job (spec §2 I1: append it after ci-gate)`,
    );
  }
  return job;
}

export function runSteps(job: W.WorkflowJob): W.WorkflowStep[] {
  return W.allSteps(job).filter((step) => typeof step.run === "string");
}

// ---------------------------------------------------------------------------
// Expression contexts
// ---------------------------------------------------------------------------

export type PullRequestValues = {
  number: number;
  headSha: string;
  headRef: string;
  runId: string;
  runAttempt: string;
};

/** Two distinct value sets so nothing can be hard-coded. */
export const PR_A: PullRequestValues = {
  number: 2242,
  headSha: "3f2c9e1d0b8a7f6e5d4c3b2a19087f6e5d4c3b2a",
  headRef: "builder/2221-ci-gate-comment",
  runId: "18800123456",
  runAttempt: "1",
};
export const PR_B: PullRequestValues = {
  number: 7,
  headSha: "a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9",
  headRef: "fix/other",
  runId: "19911223344",
  runAttempt: "3",
};
/** `github.sha` on a pull_request run is the merge commit, never the head. */
const MERGE_SHA = "9999999999999999999999999999999999999999";
export const PR_TITLE = "PR-TITLE-MUST-NOT-LEAK";

export function sameRepoPrGithub(v: PullRequestValues): E.ExprValue {
  return {
    event_name: "pull_request",
    repository: REPO,
    repository_owner: REPO.split("/")[0]!,
    server_url: SERVER_URL,
    api_url: "https://api.github.com",
    run_id: v.runId,
    run_number: "512",
    run_attempt: v.runAttempt,
    token: FAKE_TOKEN,
    sha: MERGE_SHA,
    ref: `refs/pull/${v.number}/merge`,
    head_ref: v.headRef,
    base_ref: "develop",
    workflow: "CI",
    event: {
      number: v.number,
      pull_request: {
        number: v.number,
        title: PR_TITLE,
        head: {
          sha: v.headSha,
          ref: v.headRef,
          repo: { full_name: REPO },
        },
        base: { ref: "develop", repo: { full_name: REPO } },
      },
    },
  };
}

export const NEED_RESULTS = [
  "success",
  "failure",
  "skipped",
  "cancelled",
] as const;

/** Job-`if` context: GitHub's status functions for a run (cancelled or not). */
export function ifContext(
  github: E.ExprValue,
  result: string,
  runCancelled: boolean,
): E.EvalContext {
  const g = github as Record<string, E.ExprValue> & { event: object };
  const event = { pull_request: null, ...(g.event as object) };
  return {
    contexts: {
      github: { ...g, event } as E.ExprValue,
      needs: { "ci-gate": { result, outputs: {} } },
      inputs: {},
      vars: {},
    },
    status: {
      success: result === "success" && !runCancelled,
      failure: result === "failure",
      cancelled: runCancelled,
    },
  };
}

export function jobRuns(
  job: W.WorkflowJob,
  github: E.ExprValue,
  result: string,
  runCancelled: boolean,
): boolean {
  return W.evaluateIfCondition(
    W.ifExpression(job) || undefined,
    ifContext(github, result, runCancelled),
  );
}

/** Render every `${{ }}` in a step env value against the run context. */
export function renderEnvValue(value: string, ctx: E.EvalContext): string {
  return value.replace(/\$\{\{([\s\S]*?)\}\}/g, (_whole, body: string) => {
    const result = E.evaluateExpression(E.parseExpression(body), ctx);
    if (result === null) return "";
    return typeof result === "object" ? JSON.stringify(result) : String(result);
  });
}

// ---------------------------------------------------------------------------
// Fake GitHub API (stub gh)
// ---------------------------------------------------------------------------

export type FakeComment = { id: number; login: string; body: string };
export type Fault = {
  method: string;
  /** Regex source matched against the normalized path (no query). */
  path: string;
  status: number;
  message: string;
};
export type ApiCall = {
  /** GET/POST/PATCH/DELETE/..., or UNSUPPORTED. */
  method: string;
  path: string;
  query: Record<string, string>;
  body?: string;
  token: string;
  via: string;
  argv: string[];
};
export type FakeState = {
  repo: string;
  pr: { number: number; headSha: string; headRef: string; title: string };
  comments: (FakeComment & { patched?: boolean })[];
  nextId: number;
  faults: Fault[];
  calls: ApiCall[];
};

const WRITE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);
export const isWrite = (call: ApiCall) => WRITE_METHODS.has(call.method);

/** The stub `gh` (CommonJS, run by the test's own node/bun). */
function stubSource(statePath: string, jqPath: string): string {
  return `#!${process.execPath}
"use strict";
const fs = require("fs");
const { spawnSync } = require("child_process");
const STATE = ${JSON.stringify(statePath)};
const JQ = ${JSON.stringify(jqPath)};
const load = () => JSON.parse(fs.readFileSync(STATE, "utf8"));
const save = (s) => fs.writeFileSync(STATE, JSON.stringify(s));
const argv = process.argv.slice(2);
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";
let stdinCache;
const stdin = () => (stdinCache ??= fs.readFileSync(0, "utf8"));
function record(state, call) { state.calls.push({ token, argv, ...call }); }
function unsupported(why) {
  const s = load();
  record(s, { method: "UNSUPPORTED", path: why, query: {}, via: "unsupported" });
  save(s);
  process.stderr.write("fake gh: unsupported invocation (" + why + "): " + JSON.stringify(argv) + "\\n");
  process.exit(2);
}
if (!token) {
  process.stderr.write("gh: To use GitHub CLI in a GitHub Actions workflow, set the GH_TOKEN environment variable.\\n");
  process.exit(4);
}
function commentJson(s, c) {
  return {
    id: c.id, node_id: "IC_" + c.id,
    user: { login: c.login, type: c.login.endsWith("[bot]") ? "Bot" : "User" },
    body: c.body, created_at: "2026-10-23T21:00:00Z", updated_at: "2026-10-23T21:00:00Z",
    html_url: "https://github.com/" + s.repo + "/pull/" + s.pr.number + "#issuecomment-" + c.id,
    issue_url: "https://api.github.com/repos/" + s.repo + "/issues/" + s.pr.number,
    author_association: "NONE",
  };
}
function fail(status, message) {
  return { status, json: { message, status: String(status) } };
}
// One REST request against the fake state; records it (mutates s).
function request(s, method, rawPath, query, body, via) {
  let p = rawPath.replace(/^https:\\/\\/api\\.github\\.com\\//, "").replace(/^\\//, "");
  const qi = p.indexOf("?");
  if (qi >= 0) {
    for (const part of p.slice(qi + 1).split("&")) {
      if (!part) continue;
      const [k, v = ""] = part.split("=");
      query[decodeURIComponent(k)] = decodeURIComponent(v);
    }
    p = p.slice(0, qi);
  }
  if (/[{}]/.test(p)) {
    const repo = process.env.GH_REPO;
    if (!repo) return { status: -1, error: "none of the git remotes configured for this repository point to a known GitHub host (no GH_REPO)" };
    const [owner, name] = repo.split("/");
    p = p.replace(/\\{owner\\}/g, owner).replace(/\\{repo\\}/g, name);
  }
  record(s, { method, path: p, query: { ...query }, body: body === undefined ? undefined : (typeof body === "string" ? body : JSON.stringify(body)), via });
  for (const f of s.faults) {
    if (f.method === method && new RegExp(f.path).test(p)) return fail(f.status, f.message);
  }
  if (method === "GET" && p === "user") return fail(403, "Resource not accessible by integration");
  const m = /^repos\\/([^/]+\\/[^/]+)\\/(.*)$/.exec(p);
  if (!m || m[1].toLowerCase() !== s.repo.toLowerCase()) return fail(404, "Not Found");
  const rest = m[2];
  let r;
  if ((r = /^pulls\\/(\\d+)$/.exec(rest)) && method === "GET") {
    if (Number(r[1]) !== s.pr.number) return fail(404, "Not Found");
    return { status: 200, json: { number: s.pr.number, state: "open", title: s.pr.title,
      head: { sha: s.pr.headSha, ref: s.pr.headRef, repo: { full_name: s.repo } },
      base: { ref: "develop", repo: { full_name: s.repo } } } };
  }
  if ((r = /^issues\\/(\\d+)\\/comments$/.exec(rest))) {
    if (Number(r[1]) !== s.pr.number) return fail(404, "Not Found");
    if (method === "GET") {
      const per = Math.min(Math.max(Number(query.per_page || 30), 1), 100);
      const page = Math.max(Number(query.page || 1), 1);
      const all = [...s.comments].sort((a, b) => a.id - b.id);
      const items = all.slice((page - 1) * per, page * per).map((c) => commentJson(s, c));
      return { status: 200, json: items, hasNext: page * per < all.length, per, page };
    }
    if (method === "POST") {
      const text = body && typeof body === "object" ? body.body : undefined;
      if (typeof text !== "string" || text === "") return fail(422, "Validation Failed: body is missing");
      const c = { id: s.nextId++, login: "github-actions[bot]", body: text };
      s.comments.push(c);
      return { status: 201, json: commentJson(s, c) };
    }
  }
  if ((r = /^issues\\/comments\\/(\\d+)$/.exec(rest))) {
    const id = Number(r[1]);
    const i = s.comments.findIndex((c) => c.id === id);
    if (i < 0) return fail(404, "Not Found");
    if (method === "GET") return { status: 200, json: commentJson(s, s.comments[i]) };
    if (method === "DELETE") {
      if (s.comments[i].login !== "github-actions[bot]") return fail(403, "Resource not accessible by integration");
      s.comments.splice(i, 1);
      return { status: 204, json: null };
    }
    if (method === "PATCH") {
      if (s.comments[i].login !== "github-actions[bot]") return fail(403, "Resource not accessible by integration");
      const text = body && typeof body === "object" ? body.body : undefined;
      if (typeof text === "string") s.comments[i].body = text;
      s.comments[i].patched = true;
      return { status: 200, json: commentJson(s, s.comments[i]) };
    }
  }
  return fail(404, "Not Found");
}
function runJq(expr, input) {
  const out = spawnSync(JQ, ["-r", "-c", expr], { input, encoding: "utf8" });
  if (out.status !== 0) { process.stderr.write(out.stderr); process.exit(1); }
  return out.stdout;
}
function emitError(res) {
  if (res.status === -1) { process.stderr.write(res.error + "\\n"); process.exit(1); }
  process.stdout.write(JSON.stringify(res.json));
  process.stderr.write("gh: " + res.json.message + " (HTTP " + res.status + ")\\n");
  process.exit(1);
}
function readFileArg(v) { return v === "-" ? stdin() : fs.readFileSync(v, "utf8"); }
function typed(v) {
  if (v.startsWith("@")) return readFileArg(v.slice(1));
  if (v === "true") return true; if (v === "false") return false; if (v === "null") return null;
  if (/^-?\\d+$/.test(v)) return Number(v);
  return v;
}
function api(args) {
  let method, endpoint, input, jq, paginate = false, slurp = false, silent = false;
  const fields = {};
  const valued = { "-X": "method", "--method": "method", "-f": "raw", "--raw-field": "raw", "-F": "field", "--field": "field", "-H": "header", "--header": "header", "-q": "jq", "--jq": "jq", "--input": "input", "--hostname": "host", "-p": "preview", "--preview": "preview", "--cache": "cache" };
  for (let i = 0; i < args.length; i++) {
    let a = args[i], v;
    const eq = a.startsWith("--") ? a.indexOf("=") : -1;
    if (eq > 0) { v = a.slice(eq + 1); a = a.slice(0, eq); }
    if (a in valued) {
      if (v === undefined) v = args[++i];
      const kind = valued[a];
      if (kind === "method") method = v.toUpperCase();
      else if (kind === "raw" || kind === "field") {
        const k = v.indexOf("=");
        if (k < 0) unsupported("field without =");
        fields[v.slice(0, k)] = kind === "raw" ? v.slice(k + 1) : typed(v.slice(k + 1));
      } else if (kind === "jq") jq = v;
      else if (kind === "input") input = v;
      continue;
    }
    if (a === "--paginate") { paginate = true; continue; }
    if (a === "--slurp") { slurp = true; continue; }
    if (a === "--silent") { silent = true; continue; }
    if (a === "--verbose" || a === "-i" || a === "--include" || a === "-t" || a === "--template") unsupported("gh api " + a);
    if (a.startsWith("-") && a !== "-") unsupported("gh api flag " + a);
    if (endpoint !== undefined) unsupported("second positional " + a);
    endpoint = a;
  }
  if (endpoint === undefined) unsupported("gh api without endpoint");
  if (endpoint === "graphql") unsupported("gh api graphql");
  const hasBody = Object.keys(fields).length > 0 || input !== undefined;
  method = method || (hasBody ? "POST" : "GET");
  let query = {}, body;
  if (method === "GET") { for (const [k, v] of Object.entries(fields)) query[k] = String(v); }
  else if (input !== undefined) { const raw = readFileArg(input); try { body = JSON.parse(raw); } catch { body = raw; } }
  else if (hasBody) body = fields;
  const s = load();
  const pages = [];
  let res;
  for (;;) {
    res = request(s, method, endpoint, { ...query }, body, "gh api");
    if (res.status < 200 || res.status >= 300) { save(s); emitError(res); }
    pages.push(res.json);
    if (!(paginate && res.hasNext)) break;
    query = { ...query, per_page: String(res.per), page: String(res.page + 1) };
  }
  save(s);
  if (silent || res.status === 204) process.exit(0);
  if (slurp) { if (jq) unsupported("--slurp with --jq"); process.stdout.write(JSON.stringify(pages) + "\\n"); process.exit(0); }
  if (jq) { process.stdout.write(pages.map((p) => runJq(jq, JSON.stringify(p))).join("")); process.exit(0); }
  const out = paginate && pages.every(Array.isArray) ? pages.flat() : pages.length === 1 ? pages[0] : pages;
  process.stdout.write(JSON.stringify(out) + "\\n");
  process.exit(0);
}
function prOrIssue(kind, args) {
  const sub = args[0];
  let num, repo = process.env.GH_REPO, json, jq, body, edit = false;
  for (let i = 1; i < args.length; i++) {
    let a = args[i], v;
    const eq = a.startsWith("--") ? a.indexOf("=") : -1;
    if (eq > 0) { v = a.slice(eq + 1); a = a.slice(0, eq); }
    const take = () => (v !== undefined ? v : args[++i]);
    if (a === "-R" || a === "--repo") repo = take();
    else if (a === "--json") json = take();
    else if (a === "-q" || a === "--jq") jq = take();
    else if (a === "-b" || a === "--body") body = take();
    else if (a === "-F" || a === "--body-file") body = readFileArg(take());
    else if (a === "--edit-last") edit = true;
    else if (a.startsWith("-")) unsupported("gh " + kind + " " + sub + " " + a);
    else if (num === undefined) num = a;
    else unsupported("extra positional " + a);
  }
  if (!repo) { process.stderr.write("fatal: not a git repository (no GH_REPO, no -R)\\n"); process.exit(1); }
  const n = Number(String(num).replace(/^#/, ""));
  if (!Number.isInteger(n)) unsupported(kind + " " + sub + " without a number");
  const s = load();
  const base = "repos/" + repo + "/";
  if (kind === "pr" && sub === "view") {
    if (!json) unsupported("gh pr view without --json");
    const res = request(s, "GET", base + "pulls/" + n, {}, undefined, "gh pr view");
    if (res.status !== 200) { save(s); emitError(res); }
    const pr = res.json;
    const values = { number: pr.number, headRefOid: pr.head.sha, headRefName: pr.head.ref, state: "OPEN", title: pr.title, url: "https://github.com/" + s.repo + "/pull/" + pr.number,
      headRepository: { name: s.repo.split("/")[1] }, headRepositoryOwner: { login: s.repo.split("/")[0] }, isCrossRepository: false };
    const out = {};
    for (const f of json.split(",")) {
      if (f === "comments") {
        const all = [...s.comments].sort((a, b) => a.id - b.id);
        out.comments = all.map((c) => ({ id: "IC_" + c.id, author: { login: c.login.replace(/\\[bot\\]$/, "") }, body: c.body, url: "https://github.com/" + s.repo + "/pull/" + n + "#issuecomment-" + c.id }));
        record(s, { method: "GET", path: base + "issues/" + n + "/comments", query: {}, via: "gh pr view --json comments" });
      } else if (f in values) out[f] = values[f];
      else unsupported("gh pr view --json " + f);
    }
    save(s);
    process.stdout.write(jq ? runJq(jq, JSON.stringify(out)) : JSON.stringify(out) + "\\n");
    process.exit(0);
  }
  if (sub === "comment") {
    if (edit) {
      const mine = s.comments.filter((c) => c.login === "github-actions[bot]").sort((a, b) => a.id - b.id).at(-1);
      const res = request(s, "PATCH", base + "issues/comments/" + (mine ? mine.id : 0), {}, { body }, "gh " + kind + " comment --edit-last");
      save(s);
      if (res.status !== 200) emitError(res);
      process.exit(0);
    }
    if (body === undefined) unsupported("gh " + kind + " comment without --body/--body-file");
    const res = request(s, "POST", base + "issues/" + n + "/comments", {}, { body }, "gh " + kind + " comment");
    save(s);
    if (res.status !== 201) emitError(res);
    process.stdout.write(res.json.html_url + "\\n");
    process.exit(0);
  }
  unsupported("gh " + kind + " " + sub);
}
const [cmd, ...rest] = argv;
if (cmd === "api") api(rest);
else if (cmd === "pr" || cmd === "issue") prOrIssue(cmd, rest);
else if (cmd === "--version") { process.stdout.write("gh version 2.83.0 (fake)\\n"); process.exit(0); }
else unsupported("gh " + cmd);
`;
}

/** Host tools the run body may use; real `gh`, `curl` and `wget` are never linked. */
const SANDBOX_TOOLS = [
  "bash",
  "sh",
  "jq",
  "grep",
  "egrep",
  "sed",
  "awk",
  "cat",
  "printf",
  "echo",
  "head",
  "tail",
  "tr",
  "cut",
  "date",
  "wc",
  "sort",
  "uniq",
  "mktemp",
  "rm",
  "env",
  "test",
  "[",
  "sleep",
  "xargs",
  "tee",
  "base64",
  "true",
  "false",
  "ls",
  "cp",
  "mv",
  "dirname",
  "basename",
  "seq",
  "touch",
  "mkdir",
  "expr",
  "paste",
  "od",
  "comm",
  "join",
  "fold",
  "rev",
  "nl",
];

function which(tool: string): string | undefined {
  for (const dir of ["/usr/bin", "/bin", "/usr/local/bin"]) {
    const candidate = path.join(dir, tool);
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Simulated run of the job
// ---------------------------------------------------------------------------

export type SimulateInput = {
  values?: PullRequestValues;
  /** `needs.ci-gate.result`. */
  result?: string;
  /** The workflow run was cancelled (superseded or manual). */
  runCancelled?: boolean;
  comments?: FakeComment[];
  /** The PR's current head on GitHub (default: the run's head SHA). */
  currentHeadSha?: string;
  faults?: Fault[];
  /** Run with no `gh` on PATH at all. */
  withoutGh?: boolean;
};

export type StepRun = {
  status: number;
  stdout: string;
  stderr: string;
  continueOnError: boolean;
};

export type SimulateOutcome = {
  jobRan: boolean;
  steps: StepRun[];
  /** A failing step that is not continue-on-error turns the job red. */
  jobFailed: boolean;
  output: string;
  calls: ApiCall[];
  writes: ApiCall[];
  comments: (FakeComment & { patched?: boolean })[];
};

/** Make an earlier marker comment exactly as the job would have posted it. */
export function markerBody(conclusion: string, v: PullRequestValues): string {
  return `${MARKER}\nci-gate: ${conclusion} on ${v.headSha}, run ${v.runId}\n${SERVER_URL}/${REPO}/actions/runs/${v.runId}/attempts/${v.runAttempt}`;
}

/** Shell argv for a `run:` step, as the hosted runner builds it. */
function shellArgv(step: W.WorkflowStep, job: W.WorkflowJob): string[] {
  const { shell, workingDirectory } = W.resolveRunSettings(step, job);
  if (workingDirectory.value !== undefined) {
    throw new Error(
      `working-directory ${JSON.stringify(workingDirectory.value)} is not modelled for ${JOB_ID}`,
    );
  }
  if (shell.value === undefined) return ["bash", "-e"];
  if (shell.value === "bash") {
    return ["bash", "--noprofile", "--norc", "-eo", "pipefail"];
  }
  if (shell.value === "sh") return ["sh", "-e"];
  throw new Error(
    `shell ${JSON.stringify(shell.value)} is not modelled for ${JOB_ID} (default, bash or sh only)`,
  );
}

export function simulate(input: SimulateInput = {}): SimulateOutcome {
  const job = commentJob();
  const v = input.values ?? PR_A;
  const result = input.result ?? "success";
  const github = sameRepoPrGithub(v);
  const state: FakeState = {
    repo: REPO,
    pr: {
      number: v.number,
      headSha: input.currentHeadSha ?? v.headSha,
      headRef: v.headRef,
      title: PR_TITLE,
    },
    comments: (input.comments ?? []).map((c) => ({ ...c })),
    nextId: 9_000_000_001,
    faults: input.faults ?? [],
    calls: [],
  };
  const empty = (jobRan: boolean): SimulateOutcome => ({
    jobRan,
    steps: [],
    jobFailed: false,
    output: "",
    calls: [],
    writes: [],
    comments: state.comments,
  });
  if (!jobRuns(job, github, result, input.runCancelled ?? false)) {
    return empty(false);
  }

  const root = mkdtempSync(path.join(tmpdir(), "ci-gate-comment-"));
  try {
    const statePath = path.join(root, "state.json");
    writeFileSync(statePath, JSON.stringify(state));
    const ghDir = path.join(root, "gh-bin");
    const toolDir = path.join(root, "tools");
    const workDir = path.join(root, "work");
    const home = path.join(root, "home");
    const runnerTemp = path.join(root, "runner-temp");
    for (const dir of [ghDir, toolDir, workDir, home, runnerTemp]) {
      mkdirSync(dir);
    }
    const jq = which("jq");
    if (!jq) throw new Error("jq is required on the test host");
    for (const tool of SANDBOX_TOOLS) {
      const found = which(tool);
      if (found) symlinkSync(found, path.join(toolDir, tool));
    }
    const gh = path.join(ghDir, "gh");
    writeFileSync(gh, stubSource(statePath, jq));
    chmodSync(gh, 0o755);
    const summary = path.join(runnerTemp, "step_summary");
    const outputFile = path.join(runnerTemp, "output");
    const envFile = path.join(runnerTemp, "env");
    for (const file of [summary, outputFile, envFile]) writeFileSync(file, "");

    const ctx: E.EvalContext = {
      contexts: {
        github,
        needs: { "ci-gate": { result, outputs: {} } },
        env: {},
        inputs: {},
        vars: {},
      },
      status: { success: true, failure: false, cancelled: false },
    };
    const steps: StepRun[] = [];
    let failed = false;
    for (const step of W.allSteps(job)) {
      if (typeof step.uses === "string") {
        throw new Error(
          `${JOB_ID} step uses ${step.uses}: actions are not modelled (spec §1: no uses: steps)`,
        );
      }
      if (typeof step.run !== "string") continue;
      if (step.if !== undefined) {
        const stepCtx = {
          ...ctx,
          status: { success: !failed, failure: failed, cancelled: false },
        };
        if (!W.evaluateIfCondition(step.if, stepCtx)) continue;
      } else if (failed) continue;
      const rawEnv = W.effectiveStepEnv(
        W.workflowEnvOf(job),
        job.env,
        step.env,
      );
      const env = Object.fromEntries(
        Object.entries(rawEnv).map(([k, val]) => [k, renderEnvValue(val, ctx)]),
      );
      const script = path.join(root, `step-${steps.length}.sh`);
      writeFileSync(script, step.run);
      const [shell, ...flags] = shellArgv(step, job);
      const proc = spawnSync(path.join(toolDir, shell!), [...flags, script], {
        cwd: workDir,
        encoding: "utf8",
        timeout: 30_000,
        env: {
          // Runner-provided defaults (no GITHUB_TOKEN: the runner never sets it).
          PATH: input.withoutGh ? toolDir : `${ghDir}:${toolDir}`,
          HOME: home,
          CI: "true",
          GITHUB_ACTIONS: "true",
          GITHUB_EVENT_NAME: "pull_request",
          GITHUB_REPOSITORY: REPO,
          GITHUB_SERVER_URL: SERVER_URL,
          GITHUB_API_URL: "https://api.github.com",
          GITHUB_RUN_ID: v.runId,
          GITHUB_RUN_ATTEMPT: v.runAttempt,
          GITHUB_SHA: MERGE_SHA,
          GITHUB_JOB: JOB_ID,
          GITHUB_WORKSPACE: workDir,
          GITHUB_STEP_SUMMARY: summary,
          GITHUB_OUTPUT: outputFile,
          GITHUB_ENV: envFile,
          RUNNER_TEMP: runnerTemp,
          ...env,
        },
      });
      const continueOnError = W.evaluateFlag(step["continue-on-error"], ctx);
      const status = proc.status ?? 1;
      steps.push({
        status,
        stdout: String(proc.stdout ?? ""),
        stderr: String(proc.stderr ?? ""),
        continueOnError,
      });
      if (status !== 0 && !continueOnError) failed = true;
    }
    const final = JSON.parse(readFileSync(statePath, "utf8")) as FakeState;
    return {
      jobRan: true,
      steps,
      jobFailed: failed,
      output: steps.map((s) => s.stdout + s.stderr).join("\n"),
      calls: final.calls,
      writes: final.calls.filter(isWrite),
      comments: final.comments,
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

/** Bodies of the comments a run created. */
export const posted = (out: SimulateOutcome) =>
  out.writes.filter((c) => c.method === "POST").map((c) => postedText(c));

function postedText(call: ApiCall): string {
  if (call.body === undefined) return "";
  try {
    const parsed = JSON.parse(call.body) as { body?: unknown };
    return typeof parsed.body === "string" ? parsed.body : call.body;
  } catch {
    return call.body;
  }
}

/** Marker comments by the bot (starts with the marker), as the job must see them. */
export const botMarkers = (comments: FakeComment[]) =>
  comments.filter((c) => c.login === BOT && c.body.startsWith(MARKER));

export const commentPath = (id: number) =>
  `repos/${REPO}/issues/comments/${id}`;
export const issueCommentsPath = (n: number) =>
  `repos/${REPO}/issues/${n}/comments`;
