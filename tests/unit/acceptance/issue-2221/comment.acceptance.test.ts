/**
 * Acceptance tests for #2221: what the `ci-gate-comment` run: body does
 * against a fake GitHub API (criteria 1, 2, 5, 10 and rulings 1-2).
 * The job's real `run:` step is executed with a stub `gh` that records every
 * call (see ./harness.ts for the modelled gh surface).
 * Owned by Acceptance; implementers must not edit this file to satisfy their PR.
 * Spec: https://github.com/Asymmetric-al/core/issues/2221#issuecomment-6375001482
 * Rulings (override the spec's edit-in-place):
 * https://github.com/Asymmetric-al/core/issues/2221#issuecomment-6375027774
 */
import { describe, expect, it } from "vitest";

import * as H from "./harness";

const { MARKER, BOT, PR_A, PR_B } = H;
const OLD_RUN: H.PullRequestValues = {
  ...PR_A,
  headSha: "0000aaaa1111bbbb2222cccc3333dddd4444eeee",
  runId: "18700000001",
};

/** Lines after the leading marker, trimmed, empty ones dropped. */
const visibleLines = (body: string) =>
  body
    .slice(MARKER.length)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "");
const runUrl = (v: H.PullRequestValues) =>
  `${H.SERVER_URL}/${H.REPO}/actions/runs/${v.runId}/attempts/${v.runAttempt}`;
const methods = (out: H.SimulateOutcome) => out.writes.map((c) => c.method);
const deletedIds = (out: H.SimulateOutcome) =>
  out.writes
    .filter((c) => c.method === "DELETE")
    .map((c) => Number(/issues\/comments\/(\d+)$/.exec(c.path)?.[1]));
/** Sanity every run must pass: fake API understood every call. */
const expectModelled = (out: H.SimulateOutcome) => {
  expect(out.jobRan, "job if: skipped a settled same-repo PR run").toBe(true);
  expect(
    out.calls.filter((c) => c.method === "UNSUPPORTED"),
    `gh calls outside the modelled surface; output:\n${out.output}`,
  ).toEqual([]);
};

const MIXED: H.FakeComment[] = [
  { id: 101, login: "octocat", body: "LGTM" },
  {
    id: 102,
    login: "octocat",
    body: `${MARKER}\nci-gate: success on fake, run 1`,
  },
  { id: 103, login: "dependabot[bot]", body: `${MARKER}\nci-gate: failure` },
  { id: 104, login: "github-actions", body: `${MARKER}\nlookalike login` },
  { id: 105, login: BOT, body: "Preview deployment ready (no marker)" },
  { id: 106, login: BOT, body: `Summary\n${MARKER}\nmarker not at the start` },
  {
    id: 107,
    login: BOT,
    body: "<!-- ci-gate-status-old -->\nnear-miss marker",
  },
  { id: 108, login: BOT, body: H.markerBody("failure", OLD_RUN) },
  {
    id: 109,
    login: "II-ricky-bobby-II",
    body: "Samson: see #9999 and comment 108",
  },
];

describe("#2221 criterion 1: exactly one marker comment with the exact first line and run link", () => {
  it.each([
    ["success", PR_A],
    ["failure", PR_B],
  ] as const)("ci-gate %s on a fresh PR posts one comment", (result, v) => {
    const out = H.simulate({ values: v, result });
    expectModelled(out);
    expect(methods(out)).toEqual(["POST"]);
    expect(out.writes[0]!.path).toBe(H.issueCommentsPath(v.number));
    const [body] = H.posted(out);
    expect(body!.startsWith(MARKER), body).toBe(true);
    const lines = visibleLines(body!);
    expect(lines[0]).toBe(`ci-gate: ${result} on ${v.headSha}, run ${v.runId}`);
    expect(lines[1] ?? "").toContain(runUrl(v));
    expect(lines, "nothing else goes in the comment").toHaveLength(2);
    const markers = H.botMarkers(out.comments);
    expect(markers).toHaveLength(1);
    expect(markers[0]!.body).toBe(body);
  });

  it("uses the PR head SHA, not github.sha (the merge commit)", () => {
    const out = H.simulate({ values: PR_A });
    expectModelled(out);
    const [body] = H.posted(out);
    expect(body).toContain(PR_A.headSha);
    expect(body).not.toContain("9999999999999999999999999999999999999999");
  });

  it("negative: no PR title, branch name or log text in the body", () => {
    const out = H.simulate({ values: PR_A });
    expectModelled(out);
    const [body] = H.posted(out);
    expect(body).not.toContain(H.PR_TITLE);
    expect(body).not.toContain(PR_A.headRef);
    expect(body).not.toMatch(
      /::(warning|error|notice)|\/(merge|close|approve)\b/i,
    );
  });

  it("every API call uses github.token and targets this repo's PR from the event", () => {
    const out = H.simulate({
      values: PR_B,
      comments: MIXED.map((c) => ({ ...c })),
    });
    expectModelled(out);
    expect(out.calls.length).toBeGreaterThan(0);
    for (const call of out.calls) {
      expect(call.token, `${call.method} ${call.path}`).toBe(H.FAKE_TOKEN);
      expect(call.path, "only this repo").toMatch(
        new RegExp(
          `^repos/${H.REPO}/(issues/${PR_B.number}/comments|issues/comments/\\d+|pulls/${PR_B.number})$`,
        ),
      );
    }
  });
});

describe("#2221 criterion 2 (as ruled): a later settled run replaces the marker comment", () => {
  it("a new push: deletes the earlier bot marker comment, then creates a new one", () => {
    const out = H.simulate({
      values: PR_A,
      result: "failure",
      comments: [
        { id: 501, login: BOT, body: H.markerBody("success", OLD_RUN) },
      ],
    });
    expectModelled(out);
    expect(methods(out)).toEqual(["DELETE", "POST"]);
    expect(out.writes[0]!.path).toBe(H.commentPath(501));
    const markers = H.botMarkers(out.comments);
    expect(markers).toHaveLength(1);
    expect(markers[0]!.id).not.toBe(501);
    expect(visibleLines(markers[0]!.body)[0]).toBe(
      `ci-gate: failure on ${PR_A.headSha}, run ${PR_A.runId}`,
    );
  });

  it("a re-run of the same head: same delete-then-create, new attempt link", () => {
    const rerun = { ...PR_A, runAttempt: "2" };
    const out = H.simulate({
      values: rerun,
      comments: [{ id: 502, login: BOT, body: H.markerBody("failure", PR_A) }],
    });
    expectModelled(out);
    expect(methods(out)).toEqual(["DELETE", "POST"]);
    expect(deletedIds(out)).toEqual([502]);
    expect(H.posted(out)[0]).toContain(runUrl(rerun));
    expect(H.botMarkers(out.comments)).toHaveLength(1);
  });

  it("several earlier bot marker comments are all deleted; one remains", () => {
    const out = H.simulate({
      values: PR_A,
      comments: [
        { id: 601, login: BOT, body: H.markerBody("success", OLD_RUN) },
        { id: 602, login: "octocat", body: "unrelated" },
        { id: 603, login: BOT, body: H.markerBody("failure", OLD_RUN) },
      ],
    });
    expectModelled(out);
    expect(deletedIds(out).sort()).toEqual([601, 603]);
    expect(methods(out)).toEqual(["DELETE", "DELETE", "POST"]);
    expect(H.botMarkers(out.comments)).toHaveLength(1);
  });

  it("a marker comment by another author is never deleted and does not stop the bot posting", () => {
    const foreign = {
      id: 701,
      login: "octocat",
      body: H.markerBody("success", PR_A),
    };
    const out = H.simulate({ values: PR_A, comments: [foreign] });
    expectModelled(out);
    expect(methods(out)).toEqual(["POST"]);
    expect(out.comments).toContainEqual(foreign);
    expect(H.botMarkers(out.comments)).toHaveLength(1);
  });

  it("finds the earlier marker comment beyond the first 100 comments (paginated)", () => {
    const filler = Array.from({ length: 130 }, (_, i) => ({
      id: 1000 + i,
      login: i % 2 ? "octocat" : BOT,
      body: `chatter ${i}`,
    }));
    const out = H.simulate({
      values: PR_A,
      comments: [
        ...filler,
        { id: 5000, login: BOT, body: H.markerBody("success", OLD_RUN) },
      ],
    });
    expectModelled(out);
    expect(deletedIds(out)).toEqual([5000]);
    expect(methods(out)).toEqual(["DELETE", "POST"]);
    expect(out.comments.length).toBe(131);
  });
});

describe("#2221 ruling 1: delete-then-create; never edit in place; never touch other comments", () => {
  it("with a mixed thread, deletes exactly the bot's marker comments and nothing else", () => {
    const out = H.simulate({
      values: PR_A,
      comments: MIXED.map((c) => ({ ...c })),
    });
    expectModelled(out);
    expect(deletedIds(out)).toEqual([108]);
    for (const c of MIXED.filter((c) => c.id !== 108)) {
      expect(out.comments, `comment ${c.id} must be untouched`).toContainEqual(
        c,
      );
    }
  });

  it("every DELETE precedes the POST, and there is exactly one POST", () => {
    const out = H.simulate({
      values: PR_A,
      comments: [
        { id: 801, login: BOT, body: H.markerBody("success", OLD_RUN) },
        { id: 802, login: BOT, body: H.markerBody("failure", OLD_RUN) },
      ],
    });
    expectModelled(out);
    const order = methods(out);
    expect(order.filter((m) => m === "POST")).toHaveLength(1);
    expect(order.lastIndexOf("DELETE")).toBeLessThan(order.indexOf("POST"));
    expect(order.at(-1)).toBe("POST");
  });

  it.each([
    ["no earlier comment", []],
    [
      "one earlier bot marker",
      [{ id: 901, login: BOT, body: H.markerBody("success", OLD_RUN) }],
    ],
    ["mixed thread", MIXED],
  ] as const)(
    "negative: no PATCH/PUT and no edit, ever (%s)",
    (_label, comments) => {
      for (const result of ["success", "failure"]) {
        const out = H.simulate({
          values: PR_B,
          result,
          comments: comments.map((c) => ({ ...c })),
        });
        expectModelled(out);
        expect(
          out.writes.filter((c) => c.method === "PATCH" || c.method === "PUT"),
        ).toEqual([]);
        expect(out.comments.filter((c) => c.patched)).toEqual([]);
      }
    },
  );

  it("negative: never writes to a comment it did not pick (only DELETE by id, POST to the PR)", () => {
    const out = H.simulate({
      values: PR_A,
      comments: MIXED.map((c) => ({ ...c })),
    });
    expectModelled(out);
    for (const call of out.writes) {
      if (call.method === "DELETE") expect(call.path).toBe(H.commentPath(108));
      else
        expect([call.method, call.path]).toEqual([
          "POST",
          H.issueCommentsPath(PR_A.number),
        ]);
    }
  });
});

describe("#2221 ruling 2: cancelled runs post nothing", () => {
  const earlier = () => [
    { id: 1201, login: BOT, body: H.markerBody("success", OLD_RUN) },
  ];
  it.each(["success", "failure", "cancelled"])(
    "run cancelled (ci-gate %s): job skipped, zero API calls",
    (result) => {
      const out = H.simulate({
        values: PR_A,
        result,
        runCancelled: true,
        comments: earlier(),
      });
      expect(out.jobRan).toBe(false);
      expect(out.calls).toEqual([]);
      expect(out.comments).toEqual(earlier());
    },
  );
  it.each(["cancelled", "skipped"])(
    "ci-gate %s on an uncancelled run: zero API calls",
    (result) => {
      const out = H.simulate({ values: PR_A, result, comments: earlier() });
      expect(out.jobRan).toBe(false);
      expect(out.writes).toEqual([]);
    },
  );
});

describe("#2221 criterion 5: posting errors warn and never fail", () => {
  const earlier = () => [
    { id: 1301, login: BOT, body: H.markerBody("success", OLD_RUN) },
  ];
  const cases: [string, H.SimulateInput][] = [
    [
      "403 read-only token on POST (Dependabot)",
      {
        faults: [
          {
            method: "POST",
            path: "/comments$",
            status: 403,
            message: "Resource not accessible by integration",
          },
        ],
      },
    ],
    [
      "403 on DELETE",
      {
        comments: earlier(),
        faults: [
          {
            method: "DELETE",
            path: "issues/comments/",
            status: 403,
            message: "Resource not accessible by integration",
          },
        ],
      },
    ],
    [
      "403 on listing comments",
      {
        faults: [
          {
            method: "GET",
            path: "/comments$",
            status: 403,
            message: "Resource not accessible by integration",
          },
        ],
      },
    ],
    [
      "5xx on listing comments",
      {
        faults: [
          {
            method: "GET",
            path: "/comments$",
            status: 502,
            message: "Server Error",
          },
        ],
      },
    ],
    [
      "5xx on POST",
      {
        comments: earlier(),
        faults: [
          {
            method: "POST",
            path: "/comments$",
            status: 503,
            message: "Service Unavailable",
          },
        ],
      },
    ],
    [
      "rate limit (429) on reading the PR",
      {
        faults: [
          {
            method: "GET",
            path: "pulls/\\d+$",
            status: 429,
            message: "API rate limit exceeded",
          },
        ],
      },
    ],
    [
      "rate limit (403) on POST",
      {
        faults: [
          {
            method: "POST",
            path: "/comments$",
            status: 403,
            message: "API rate limit exceeded for installation",
          },
        ],
      },
    ],
    ["gh missing from PATH", { withoutGh: true }],
  ];
  it.each(cases)(
    "%s: emits ::warning:: and the job stays green",
    (_label, input) => {
      const out = H.simulate({ values: PR_A, ...input });
      expect(out.jobRan).toBe(true);
      expect(out.calls.filter((c) => c.method === "UNSUPPORTED")).toEqual([]);
      expect(out.output).toMatch(/^::warning( [^:]*)?::/m);
      expect(out.jobFailed).toBe(false);
    },
  );
  it("the run step is continue-on-error: true", () => {
    const steps = H.runSteps(H.commentJob());
    expect(steps).toHaveLength(1);
    expect(steps[0]!["continue-on-error"]).toBe(true);
  });
  it("negative: a clean run emits no warning", () => {
    const out = H.simulate({ values: PR_A });
    expectModelled(out);
    expect(out.output).not.toMatch(/::warning/);
    expect(out.steps.every((s) => s.status === 0)).toBe(true);
  });
});

describe("#2221 criterion 10: no write when the PR head moved", () => {
  it("reads the PR's current head before any write", () => {
    const out = H.simulate({
      values: PR_A,
      comments: [
        { id: 1401, login: BOT, body: H.markerBody("success", OLD_RUN) },
      ],
    });
    expectModelled(out);
    const read = out.calls.findIndex(
      (c) =>
        c.method === "GET" && c.path === `repos/${H.REPO}/pulls/${PR_A.number}`,
    );
    const firstWrite = out.calls.findIndex(H.isWrite);
    expect(
      read,
      "GET pulls/{n} (or gh pr view) is required",
    ).toBeGreaterThanOrEqual(0);
    expect(firstWrite).toBeGreaterThan(read);
  });
  it.each([
    ["no earlier comment", []],
    [
      "an earlier bot marker",
      [{ id: 1402, login: BOT, body: H.markerBody("success", OLD_RUN) }],
    ],
  ] as const)("head moved (%s): zero writes, job green", (_label, comments) => {
    const out = H.simulate({
      values: PR_A,
      currentHeadSha: "feedfacefeedfacefeedfacefeedfacefeedface",
      comments: comments.map((c) => ({ ...c })),
    });
    expectModelled(out);
    expect(out.writes).toEqual([]);
    expect(out.jobFailed).toBe(false);
    expect(out.comments).toEqual(comments);
  });
});
