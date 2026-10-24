/**
 * Runs the real `ci-gate-comment` step body from ci.yml against a stub `gh`
 * on PATH (#2221): create, delete-then-repost, foreign marker, stale head (before
 * and after the comment list) and a 403 from a read-only token.
 */

import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  allSteps,
  loadWorkflowJobs,
  resolveRunSettings,
} from "../helpers/workflow-yaml";

const MARKER = "<!-- ci-gate-status -->";
const BOT = "github-actions[bot]";
const REPO = "Asymmetric-al/core";
const HEAD = "1234567890abcdef1234567890abcdef12345678";

type Comment = { id: number; login: string; body: string };
type State = {
  head: string;
  /** Heads returned by successive pulls/{n} reads before falling back to `head`. */
  heads?: string[];
  comments: Comment[];
  failMethod?: string;
  calls: string[];
};

const STUB = `#!${process.execPath}
const fs = require("fs");
const { spawnSync } = require("child_process");
const file = process.env.STUB_STATE;
const s = JSON.parse(fs.readFileSync(file, "utf8"));
const args = process.argv.slice(3);
let method, endpoint, jq, body;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "-X") method = args[++i];
  else if (a === "--jq") jq = args[++i];
  else if (a === "-f") body = args[++i].replace(/^body=/, "");
  else if (a !== "--paginate") endpoint = a.split("?")[0];
}
method = method || (body === undefined ? "GET" : "POST");
s.calls.push(method + " " + endpoint);
const done = (out, code = 0) => {
  fs.writeFileSync(file, JSON.stringify(s));
  if (out !== undefined) process.stdout.write(jq ? spawnSync("jq", ["-r", jq], { input: JSON.stringify(out), encoding: "utf8" }).stdout : JSON.stringify(out));
  process.exit(code);
};
if (s.failMethod === method) { process.stderr.write("HTTP 403\\n"); done(undefined, 1); }
if (method === "GET" && endpoint.endsWith("/comments")) done(s.comments.map((c) => ({ id: c.id, user: { login: c.login }, body: c.body })));
if (method === "GET") done({ head: { sha: (s.heads || []).shift() || s.head } });
if (method === "DELETE") { const id = Number(endpoint.split("/").pop()); s.comments = s.comments.filter((c) => c.id !== id); done(); }
s.comments.push({ id: 900 + s.calls.length, login: "${BOT}", body });
done({});
`;

const job = loadWorkflowJobs(".github/workflows/ci.yml")["ci-gate-comment"]!;
const [step] = allSteps(job);
const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true });
});

function run(input: Partial<State>): State & { output: string } {
  const root = mkdtempSync(path.join(tmpdir(), "ci-gate-comment-unit-"));
  roots.push(root);
  const stateFile = path.join(root, "state.json");
  const state: State = { head: HEAD, comments: [], calls: [], ...input };
  writeFileSync(stateFile, JSON.stringify(state));
  writeFileSync(path.join(root, "gh"), STUB);
  chmodSync(path.join(root, "gh"), 0o755);
  expect(resolveRunSettings(step!, job).shell.value).toBe("bash");
  const proc = spawnSync(
    "bash",
    ["--noprofile", "--norc", "-eo", "pipefail", "-c", step!.run as string],
    {
      encoding: "utf8",
      env: {
        PATH: `${root}:${process.env.PATH}`,
        STUB_STATE: stateFile,
        GH_TOKEN: "fake-token",
        GH_REPO: REPO,
        PR_NUMBER: "42",
        HEAD_SHA: HEAD,
        CI_GATE_RESULT: "failure",
        RUN_ID: "777",
        RUN_ATTEMPT: "2",
        SERVER_URL: "https://github.com",
      },
    },
  );
  expect(proc.status).toBe(0);
  const final = JSON.parse(readFileSync(stateFile, "utf8")) as State;
  return { ...final, output: proc.stdout + proc.stderr };
}

const expectedBody = `${MARKER}\nci-gate: failure on ${HEAD}, run 777\nhttps://github.com/${REPO}/actions/runs/777/attempts/2`;
const postCall = `POST repos/${REPO}/issues/42/comments`;

describe("ci-gate-comment run body", () => {
  it("creates the marker comment on a PR without one", () => {
    const out = run({});
    expect(out.calls).toEqual([
      `GET repos/${REPO}/pulls/42`,
      `GET repos/${REPO}/issues/42/comments`,
      `GET repos/${REPO}/pulls/42`,
      postCall,
    ]);
    expect(out.comments).toEqual([
      { id: expect.any(Number), login: BOT, body: expectedBody },
    ]);
    expect(out.output).not.toContain("::warning::");
  });

  it("deletes the bot's earlier marker comment, then posts a new one", () => {
    const old = { id: 5, login: BOT, body: `${MARKER}\nci-gate: success` };
    const unmarked = { id: 6, login: BOT, body: `note\n${MARKER}` };
    const out = run({ comments: [old, unmarked] });
    expect(out.calls.slice(3)).toEqual([
      `DELETE repos/${REPO}/issues/comments/5`,
      postCall,
    ]);
    expect(out.comments.map((c) => c.body)).toEqual([
      unmarked.body,
      expectedBody,
    ]);
  });

  it("never deletes a marker comment by another author", () => {
    const foreign = { id: 7, login: "octocat", body: `${MARKER}\nmine` };
    const out = run({ comments: [foreign] });
    expect(out.calls.filter((c) => c.startsWith("DELETE"))).toEqual([]);
    expect(out.comments).toHaveLength(2);
    expect(out.comments[0]).toEqual(foreign);
  });

  it("writes nothing when the PR head moved", () => {
    const old = { id: 8, login: BOT, body: `${MARKER}\nold` };
    const out = run({ head: "f".repeat(40), comments: [old] });
    expect(out.calls).toEqual([`GET repos/${REPO}/pulls/42`]);
    expect(out.comments).toEqual([old]);
    expect(out.output).toContain("::notice::");
  });

  it("writes nothing when the PR head moves while the comments are listed", () => {
    const old = { id: 9, login: BOT, body: `${MARKER}\nold` };
    const out = run({ heads: [HEAD, "e".repeat(40)], comments: [old] });
    expect(out.calls).toEqual([
      `GET repos/${REPO}/pulls/42`,
      `GET repos/${REPO}/issues/42/comments`,
      `GET repos/${REPO}/pulls/42`,
    ]);
    expect(out.calls.filter((c) => c.startsWith("DELETE"))).toEqual([]);
    expect(out.calls.filter((c) => c.startsWith("POST"))).toEqual([]);
    expect(out.comments).toEqual([old]);
    expect(out.output).toContain("::notice::");
  });

  it("warns and exits 0 on a 403 from a read-only token", () => {
    const out = run({ failMethod: "POST" });
    expect(out.calls.at(-1)).toBe(postCall);
    expect(out.comments).toEqual([]);
    expect(out.output).toMatch(/^::warning::ci-gate-comment: could not post/m);
  });
});
