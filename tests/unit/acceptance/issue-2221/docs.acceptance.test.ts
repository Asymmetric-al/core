/**
 * Acceptance tests for #2221 criterion 12 / I6: docs/ci.md documents the
 * `ci-gate-comment` job as ruled (delete + re-post, cancelled posts nothing).
 * Owned by Acceptance; implementers must not edit this file to satisfy their PR.
 * Spec: https://github.com/Asymmetric-al/core/issues/2221#issuecomment-6375001482
 * Rulings: https://github.com/Asymmetric-al/core/issues/2221#issuecomment-6375027774
 */
import { describe, expect, it } from "vitest";

import * as H from "./harness";

const lines = () => H.text(H.DOC).split("\n");

/** Body of the first heading matching `re`, up to the next heading of level <= `level`. */
function section(re: RegExp, level: number, within = lines()): string[] {
  const start = within.findIndex((l) => re.test(l));
  if (start < 0) return [];
  const stop = new RegExp(`^#{1,${level}} `);
  const end = within.findIndex((l, i) => i > start && stop.test(l));
  return within.slice(start, end < 0 ? within.length : end);
}
const HEADING = /^### `?ci-gate-comment`?\s*$/;
const fastChecks = () => section(/^## Fast-checks workflow/, 2);
const jobSection = () => {
  const body = section(HEADING, 3, fastChecks());
  if (body.length === 0) {
    throw new Error(
      `${H.DOC} has no "### ci-gate-comment" subsection under "## Fast-checks workflow" (spec I6)`,
    );
  }
  return body.join("\n");
};
const liveRequired = () => section(/^### Live required checks\s*$/, 3);
/** Markdown list items (with wrapped continuation lines) of a section. */
const bullets = (body: string[]) => {
  const out: string[] = [];
  for (const l of body) {
    if (/^- /.test(l)) out.push(l);
    else if (/^\s+\S/.test(l) && out.length)
      out[out.length - 1] += ` ${l.trim()}`;
  }
  return out;
};

describe("#2221 criterion 12: `### ci-gate-comment` subsection under Fast-checks workflow", () => {
  it("exists exactly once, inside the Fast-checks section", () => {
    expect(lines().filter((l) => HEADING.test(l))).toHaveLength(1);
    expect(fastChecks().some((l) => HEADING.test(l))).toBe(true);
  });

  it.each([
    [
      "the trigger: needs ci-gate, runs on pull_request",
      [/ci-gate/, /pull_request/],
    ],
    ["event matrix: forks", [/fork/i]],
    ["event matrix: merge_group", [/merge_group/]],
    ["event matrix: push", [/\bpush/]],
    ["event matrix: workflow_dispatch", [/workflow_dispatch/]],
    ["cancelled runs post nothing (ruling 2)", [/cancel/i]],
    ["permission pull-requests: write", [/pull-requests: write/]],
    ["token: GITHUB_TOKEN / github.token", [/GITHUB_TOKEN|github\.token/]],
    ["the marker", [/<!-- ci-gate-status -->/]],
    ["the author it matches", [/github-actions\[bot\]/]],
    [
      "delete then re-post (ruling 1)",
      [/delet/i, /re-?post|re-?creat|new comment|posts? a new/i],
    ],
    [
      "stale guard: head moved",
      [/head/i, /stale|moved|changed|differs|no longer/i],
    ],
    ["failure tolerance", [/::warning::|warning/i, /continue-on-error/]],
  ] as const)("covers %s", (_label, patterns) => {
    const body = jobSection();
    for (const re of patterns) expect(body).toMatch(re);
  });

  it("negative: does not describe editing the comment in place (ruling 1)", () => {
    expect(jobSection()).not.toMatch(
      /edit(s|ed|ing)? (it |the comment )?in place|\bPATCH\b/i,
    );
  });
});

describe("#2221 criterion 12: one Live required checks bullet saying it is not required", () => {
  it("has exactly one bullet for ci-gate-comment, saying it is not a required check", () => {
    const items = bullets(liveRequired()).filter((b) =>
      b.includes("`ci-gate-comment`"),
    );
    expect(
      items,
      `${H.DOC} "### Live required checks" needs one ci-gate-comment bullet`,
    ).toHaveLength(1);
    expect(items[0]).toMatch(/^- `ci-gate-comment`/);
    expect(items[0]).toMatch(/\bnot\b[^.]*\brequired\b/i);
  });

  it("negative: the develop/production required lists do not gain ci-gate-comment", () => {
    for (const b of bullets(liveRequired()).filter((b) =>
      /^- `(develop|production)` uses/.test(b),
    )) {
      expect(b).not.toContain("ci-gate-comment");
    }
  });
});

describe("#2221 criterion 12 negatives: overview table and ci-gate bullet unchanged (I6, #2153)", () => {
  it("overview table is byte-identical to a200250f", () => {
    const all = lines();
    const start = all.findIndex((l) => l.startsWith("| Workflow"));
    const table: string[] = [];
    for (
      let i = start;
      i >= 0 && i < all.length && all[i]!.startsWith("|");
      i++
    )
      table.push(all[i]!);
    expect(H.sha256(table.join("\n"))).toBe(
      "4cddb621cea7144afb30152f0cd602acc0dea6bbff016ace83ebddf24b650dd3",
    );
  });

  it("there is still exactly one top-level - `ci-gate` bullet", () => {
    expect(lines().filter((l) => l.startsWith("- `ci-gate`"))).toHaveLength(1);
  });
});
