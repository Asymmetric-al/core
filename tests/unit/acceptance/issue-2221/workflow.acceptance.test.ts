/**
 * Acceptance tests for #2221: the `ci-gate-comment` job's workflow wiring
 * (criteria 3, 4, 6, 7, 8, 9, 11, 13 and in-scope item I1).
 * Owned by Acceptance; implementers must not edit this file to satisfy their PR.
 * Spec: https://github.com/Asymmetric-al/core/issues/2221#issuecomment-6375001482
 * Rulings: https://github.com/Asymmetric-al/core/issues/2221#issuecomment-6375027774
 */
import { readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as H from "./harness";
import * as E from "../../helpers/github-expression";
import * as W from "../../helpers/workflow-yaml";

const TRIGGERS = ["merge_group", "pull_request", "push", "workflow_dispatch"];
/** Spec §1 job contract, verbatim (inside its `${{ }}`). */
const PINNED_IF =
  "!cancelled() && github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name == github.repository && (needs.ci-gate.result == 'success' || needs.ci-gate.result == 'failure')";
/** Spec §1: the only contexts a step env may read. */
const ENV_ALLOWLIST = [
  "github.event.pull_request.number",
  "github.event.number",
  "github.event.pull_request.head.sha",
  "needs.ci-gate.result",
  "github.run_id",
  "github.run_attempt",
  "github.repository",
  "github.server_url",
  "github.token",
];
/** a200250f pins. */
const BASE_CI_BYTES = 13603;
const BASE_CI_SHA256 =
  "a3b84b0ed54bd5a5aef467171e4c093619ee3a773ed0f7882765e190d7741d0b";
const BASE_CI_GATE_BLOCK_SHA256 =
  "d82da3b08054eae6565a662c59d7cef03646e90a07003929977f2b7244e087b4";
const BASE_CI_GATE_JSON_SHA256 =
  "7bf95665df5eed573004bce53b71548f4f3815d68cbc4b6eb6a579b42fe20bfc";
const BASE_CI_DOC_SHA256 =
  "478da834539a1e1e501eaa888bfbdc4e8109669d61652ba849831e85cde6fad9";
const BASE_CI_GATE_NEEDS = [
  "compilation-plan",
  "format",
  "integrity",
  "lint",
  "typecheck",
  "build",
  "test-unit",
  "acceptance-tests",
];

const eventOf = (s: W.EventScenario) =>
  (s.github as { event_name: string }).event_name;
const allJobs = () =>
  [H.CI, H.CII].flatMap((file) =>
    Object.entries(W.workflowJobs(W.parseWorkflowSource(H.text(file)), file)),
  );
/** Text of one top-level job block in ci.yml (to the next job key or EOF). */
const jobBlock = (source: string, id: string) => {
  const lines = source.split("\n");
  const at = lines.indexOf(`  ${id}:`);
  if (at < 0) return "";
  const end = lines.findIndex(
    (l, i) => i > at && /^ {2}[A-Za-z0-9_-]+:\s*$/.test(l),
  );
  return lines
    .slice(at, end < 0 ? undefined : end)
    .join("\n")
    .trimEnd();
};
/** Every `${{ }}` body in a value, as normalized text. */
const expressionsIn = (value: unknown): string[] =>
  [...JSON.stringify(value ?? null).matchAll(/\$\{\{([\s\S]*?)\}\}/g)].map(
    (m) => W.normalizeWorkflowExpression(JSON.parse(`"${m[1]!}"`) as string),
  );
const memberPath = (node: E.ExprNode): string | undefined => {
  if (node.kind === "ident") return node.name.toLowerCase();
  if (node.kind === "member") {
    const base = memberPath(node.object);
    return base && `${base}.${node.property.toLowerCase()}`;
  }
  if (node.kind === "index" && node.index.kind === "literal") {
    const base = memberPath(node.object);
    return base && `${base}.${String(node.index.value).toLowerCase()}`;
  }
  return undefined;
};

describe("#2221 criterion 3: runs only for settled same-repo pull_request runs", () => {
  it("the job if: is exactly the spec §1 contract", () => {
    const job = H.commentJob();
    expect(typeof job.if, "job-level if: is required").toBe("string");
    expect(W.stripExpressionWrapper(job.if as string)).toBe(PINNED_IF);
  });

  it("evaluated over EVENT_SCENARIOS x every ci-gate result x cancelled", () => {
    const job = H.commentJob();
    const wrong: string[] = [];
    for (const scenario of W.EVENT_SCENARIOS) {
      for (const result of H.NEED_RESULTS) {
        for (const runCancelled of [false, true]) {
          const expected =
            eventOf(scenario) === "pull_request" &&
            !scenario.fork &&
            !runCancelled &&
            (result === "success" || result === "failure");
          const actual = H.jobRuns(job, scenario.github, result, runCancelled);
          if (actual !== expected) {
            wrong.push(
              `${scenario.label} ci-gate=${result} cancelled=${runCancelled}: runs=${actual}`,
            );
          }
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it.each([
    ["fork PR, ci-gate failure", true, "failure", false],
    ["merge_group, ci-gate success", false, "success", false],
    [
      "same-repo PR, run cancelled, ci-gate failure (the always() trap)",
      false,
      "failure",
      true,
    ],
    ["same-repo PR, ci-gate skipped", false, "skipped", false],
    ["same-repo PR, ci-gate cancelled", false, "cancelled", false],
  ] as const)("negative: %s is skipped", (_label, fork, result, cancelled) => {
    const job = H.commentJob();
    const scenario = W.EVENT_SCENARIOS.find(
      (s) =>
        s.fork === fork &&
        eventOf(s) ===
          (_label.startsWith("merge_group") ? "merge_group" : "pull_request"),
    )!;
    expect(H.jobRuns(job, scenario.github, result, cancelled)).toBe(false);
  });
});

describe("#2221 criterion 4: ci-gate is unchanged and does not depend on the new job", () => {
  it("the ci-gate job block is byte-identical to a200250f", () => {
    const block = jobBlock(H.text(H.CI), "ci-gate");
    expect(H.sha256(block)).toBe(BASE_CI_GATE_BLOCK_SHA256);
  });
  it("the parsed ci-gate job equals a200250f's (needs, if, steps)", () => {
    const gate = H.ciJobs()["ci-gate"]!;
    expect(W.needsList(gate)).toEqual(BASE_CI_GATE_NEEDS);
    expect(H.sha256(JSON.stringify(gate))).toBe(BASE_CI_GATE_JSON_SHA256);
  });
  it("no job needs ci-gate-comment; the new job needs exactly [ci-gate]", () => {
    H.commentJob();
    const dependants = allJobs()
      .filter(([, job]) => W.needsList(job).includes(H.JOB_ID))
      .map(([id]) => id);
    expect(dependants).toEqual([]);
    expect(W.needsList(H.commentJob())).toEqual(["ci-gate"]);
  });
  it("the new job does not fail the workflow on its own: its step is continue-on-error", () => {
    const steps = H.runSteps(H.commentJob());
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) expect(step["continue-on-error"]).toBe(true);
  });
  it("ci-gate still passes and fails exactly as before for a same-repo PR", () => {
    H.commentJob();
    const gate = H.ciJobs()["ci-gate"]!;
    const pr = W.EVENT_SCENARIOS.find(
      (s) => eventOf(s) === "pull_request" && !s.fork,
    )!;
    const outputs = { "compilation-plan": { requested: "true" } };
    expect(
      W.gateEnforcementProblems(gate, W.needsList(gate), [pr], outputs),
    ).toEqual([]);
  });
});

describe("#2221 criterion 6: permissions", () => {
  it("workflow-level permissions are unchanged", () => {
    H.commentJob();
    expect(H.ciDoc().permissions).toStrictEqual({
      contents: "read",
      "pull-requests": "read",
    });
  });
  it("the new job's permissions are exactly { pull-requests: write }", () => {
    expect(H.commentJob().permissions).toStrictEqual({
      "pull-requests": "write",
    });
  });
  it("only shadscan-report and ci-gate-comment have job-level permissions", () => {
    const withPermissions = allJobs()
      .filter(([, job]) => job.permissions !== undefined)
      .map(([id]) => id)
      .sort();
    expect(withPermissions).toEqual([H.JOB_ID, "shadscan-report"]);
  });
  it("negative: ci-gate holds no permissions block (no write token in the required check)", () => {
    expect(H.ciJobs()["ci-gate"]!.permissions).toBeUndefined();
    expect(JSON.stringify(H.commentJob())).not.toMatch(
      /issues["']?\s*:\s*["']?write/,
    );
  });
});

describe("#2221 criterion 7: no secrets; github.token through GH_TOKEN only", () => {
  it("the job contains no `secrets` substring", () => {
    expect(JSON.stringify(H.commentJob())).not.toContain("secrets");
  });
  it("the run step sets GH_TOKEN: ${{ github.token }}", () => {
    const [step] = H.runSteps(H.commentJob());
    const value = String(step?.env?.GH_TOKEN ?? "");
    expect(W.stripExpressionWrapper(value)).toBe("github.token");
    expect(value.trim().startsWith("${{")).toBe(true);
  });
  it("github.token is referenced only by that GH_TOKEN entry", () => {
    const job = H.commentJob();
    const tokenUses = expressionsIn(job).filter((expr) =>
      /\bgithub\s*(\.\s*token|\[\s*'token'\s*\])/i.test(expr),
    );
    expect(tokenUses).toEqual(["github.token"]);
    expect(W.jobLevelReferencesSecrets(job)).toBe(false);
  });
  it("negative: no PAT, App token or private key anywhere in the job", () => {
    const json = JSON.stringify(H.commentJob());
    expect(json).not.toMatch(
      /ghp_|github_pat_|create-github-app-token|app[-_]token|private[-_]key|GITHUB_APP/i,
    );
  });
});

describe("#2221 criterion 8: no untrusted interpolation", () => {
  it("there is exactly one step, an inline run: with no ${{ in its body", () => {
    const steps = W.allSteps(H.commentJob());
    expect(steps).toHaveLength(1);
    expect(typeof steps[0]!.run).toBe("string");
    expect(steps[0]!.run).not.toContain("${{");
  });
  it("every expression outside the job if: reads only the allowlisted contexts", () => {
    const { if: _if, ...rest } = H.commentJob();
    const exprs = expressionsIn(rest);
    expect(exprs.length).toBeGreaterThan(0);
    const bad = exprs.filter((expr) => {
      const p = memberPath(E.parseExpression(expr));
      return p === undefined || !ENV_ALLOWLIST.includes(p);
    });
    expect(bad).toEqual([]);
  });
  it("the step env carries the PR number, head SHA, ci-gate result, run id/attempt, repository, server URL and token", () => {
    const [step] = H.runSteps(H.commentJob());
    const read = expressionsIn(step?.env).map((e) =>
      memberPath(E.parseExpression(e)),
    );
    for (const group of [
      ["github.event.pull_request.number", "github.event.number"],
      ["github.event.pull_request.head.sha"],
      ["needs.ci-gate.result"],
      ["github.run_id"],
      ["github.run_attempt"],
      ["github.token"],
    ]) {
      expect(
        read.some((p) => p !== undefined && group.includes(p)),
        group.join(" | "),
      ).toBe(true);
    }
  });
  it("negative: github.sha (the merge commit) and other event fields are not read", () => {
    const { if: _if, ...rest } = H.commentJob();
    for (const expr of expressionsIn(rest)) {
      expect(expr).not.toMatch(
        /github\.sha\b|head_ref|\.title|\.body|head\.ref\b|comment/i,
      );
    }
  });
});

describe("#2221 criterion 9: no repository or third-party code", () => {
  it("hosted ubuntu-latest, timeout-minutes set, no name:", () => {
    const job = H.commentJob();
    expect(job["runs-on"]).toBe("ubuntu-latest");
    const timeout = job["timeout-minutes"];
    expect(Number.isInteger(timeout)).toBe(true);
    expect(timeout as number).toBeGreaterThan(0);
    expect(timeout as number).toBeLessThanOrEqual(10);
    expect(Object.hasOwn(job, "name")).toBe(false);
  });
  it("no uses: steps, no checkout, no container/services/environment/reusable workflow", () => {
    const job = H.commentJob();
    expect(W.allSteps(job).filter((s) => s.uses !== undefined)).toEqual([]);
    expect(W.checkoutSteps(job)).toEqual([]);
    for (const key of [
      "uses",
      "container",
      "services",
      "environment",
      "strategy",
      "with",
      "secrets",
    ]) {
      expect(Object.hasOwn(job, key), `job key ${key}`).toBe(false);
    }
    expect(W.isSelfHostedJob(job)).toBe(false);
  });
  it("negative: the run body executes no repository code", () => {
    const run = String(H.runSteps(H.commentJob())[0]?.run ?? "");
    expect(run).not.toMatch(
      /\b(node|bun|bunx|npx|npm|python3?)\b|scripts\/|(^|\s)\.\//m,
    );
    expect(run).toMatch(/\bgh\b/);
  });
});

describe("#2221 criterion 11: threat model intact", () => {
  it("on: is still exactly the four triggers, byte-for-byte", () => {
    H.commentJob();
    const on = H.ciDoc().on as Record<string, unknown>;
    expect(Object.keys(on).sort()).toEqual(TRIGGERS);
    expect(H.text(H.CI)).toContain(
      "\non:\n  workflow_dispatch:\n  pull_request:\n  push:\n    branches: [develop, production]\n  merge_group:\n    types: [checks_requested]\n",
    );
    expect([...W.MODELED_TRIGGER_EVENTS]).toEqual(TRIGGERS);
  });
  it("negative: ci.yml gains no pull_request_target, workflow_run or issue_comment", () => {
    H.commentJob();
    expect(H.text(H.CI)).not.toMatch(
      /pull_request_target|workflow_run|issue_comment/,
    );
  });
  it("release-source.yml stays the only pull_request_target user", () => {
    H.commentJob();
    const dir = ".github/workflows";
    const users = readdirSync(dir).filter((f) =>
      H.text(`${dir}/${f}`).includes("pull_request_target"),
    );
    expect(users).toEqual(["release-source.yml"]);
  });
  it("the new job is hosted, so the self-hosted reachable set is unchanged", () => {
    const job = H.commentJob();
    expect(W.normalizeRunsOn(job["runs-on"] as string)).toEqual([
      "ubuntu-latest",
    ]);
    const selfHosted = allJobs()
      .filter(([, j]) => W.isSelfHostedJob(j))
      .map(([id]) => id)
      .sort();
    expect(selfHosted).not.toContain(H.JOB_ID);
  });
});

describe("#2221 I1: ci.yml change is append-only, after ci-gate", () => {
  it("the first 13,603 bytes are a200250f's ci.yml", () => {
    const source = H.text(H.CI);
    expect(source.length).toBeGreaterThan(BASE_CI_BYTES);
    expect(H.sha256(source.slice(0, BASE_CI_BYTES))).toBe(BASE_CI_SHA256);
  });
  it("what follows is the ci-gate-comment job and nothing else", () => {
    const tail = H.text(H.CI).slice(BASE_CI_BYTES);
    expect(tail.trimStart().startsWith(`${H.JOB_ID}:`)).toBe(true);
    const keys = [...tail.matchAll(/^ {2}([A-Za-z0-9_-]+):\s*$/gm)].map(
      (m) => m[1],
    );
    expect(keys).toEqual([H.JOB_ID]);
    expect(Object.keys(H.ciDoc().jobs ?? {}).at(-1)).toBe(H.JOB_ID);
  });
  it("without the new job, the parsed workflow equals a200250f's", () => {
    H.commentJob();
    const doc = H.ciDoc();
    delete (doc.jobs as W.WorkflowJobs)[H.JOB_ID];
    expect(H.sha256(JSON.stringify(doc))).toBe(BASE_CI_DOC_SHA256);
  });
});

describe("#2221 criterion 13: shared workflow-yaml pins are not loosened", () => {
  it("the new job is not added to PINNED_JOB_IFS, MODELLED_KEYS_BY_JOB or MODELLED_ENV_KEYS_BY_JOB", () => {
    expect(Object.hasOwn(W.PINNED_JOB_IFS, H.JOB_ID)).toBe(false);
    expect(Object.hasOwn(W.MODELLED_KEYS_BY_JOB, H.JOB_ID)).toBe(false);
    expect(Object.hasOwn(W.MODELLED_ENV_KEYS_BY_JOB, H.JOB_ID)).toBe(false);
  });
  it("ci-gate's helper pins are a200250f's", () => {
    expect(W.PINNED_JOB_IFS["ci-gate"]).toStrictEqual({
      role: "gate",
      jobIf: "always()",
    });
    expect(W.MODELLED_KEYS_BY_JOB["ci-gate"]).toStrictEqual({
      job: ["if", "needs", "runs-on", "steps"],
      steps: {
        "uses:actions/checkout": ["uses", "with"],
        "uses:actions/setup-node": ["uses", "with"],
        "name:Validate correctness checks and requested compilation": [
          "name",
          "env",
          "run",
        ],
      },
    });
    expect(W.MODELLED_ENV_KEYS_BY_JOB["ci-gate"]).toStrictEqual({
      job: [],
      steps: {
        "name:Validate correctness checks and requested compilation": [
          "CI_BUILD_REQUESTED",
          "CI_RESULTS",
        ],
      },
    });
  });
});
