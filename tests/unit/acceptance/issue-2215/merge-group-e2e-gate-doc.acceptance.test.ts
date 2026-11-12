/**
 * #2215 acceptance (docs-only; deterministic structural checks). The docs/ci.md
 * Overview bullet that starts with `test-e2e` must not say `test-e2e`'s `if:`
 * skips `e2e-gate` in merge_group runs. It must say `e2e-gate` skips there
 * because its own event and branch predicates are false, independently of
 * `test-e2e`. The rest of the bullet keeps its meaning. The doc claims are
 * cross-checked against the parsed ci-integration.yml job `if:` (as #2201).
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as W from "../../helpers/workflow-yaml";

const DOC = "docs/ci.md";
const CII = ".github/workflows/ci-integration.yml";

/** The one docs/ci.md list item starting with `test-e2e`, whitespace-flattened. */
const bullet = () => {
  const items = readFileSync(DOC, "utf8").match(
    /^- `test-e2e` [^\n]*\n(?: {2}\S[^\n]*\n)*/gm,
  );
  expect(items, "exactly one list item starting with `test-e2e`").toHaveLength(
    1,
  );
  return items![0]!.replace(/\s+/g, " ");
};
/** Patterns missing from text (short failure output). */
const missing = (text: string, pats: RegExp[]) =>
  pats.filter((p) => !p.test(text)).map(String);
/** Patterns present in text. */
const present = (text: string, pats: RegExp[]) =>
  pats.filter((p) => p.test(text)).map(String);

describe("#2215 docs/ci.md test-e2e bullet", () => {
  it("C1: no longer says test-e2e's skip (therefore) skips e2e-gate", () => {
    expect(
      present(bullet(), [
        /\band therefore `e2e-gate`/i,
        /\b(?:therefore|thus|hence|consequently)\s+(?:also\s+)?`e2e-gate`/i,
        /\bskips (?:it|`test-e2e`) (?:\(\s*)?and `e2e-gate`/i,
        /`e2e-gate`[^.]{0,60}\bbecause (?:`test-e2e`|it) (?:is |was )?skipped/i,
      ]),
    ).toEqual([]);
  });
  it("C2: names e2e-gate's own event and branch if: predicates as the cause", () => {
    expect(
      missing(bullet(), [
        /(?:\bown\b|`e2e-gate`'s)[\s\S]{0,80}(?:`if:`|predicates?|conditions?)/i,
        /\bevent\b/i,
        /\bbranch\b/i,
        /\bfalse\b|\bnot (?:met|true|satisfied)\b|\bnever (?:match|true)/i,
      ]),
    ).toEqual([]);
  });
  it("C3: says e2e-gate's skip does not depend on test-e2e", () => {
    expect(bullet()).toMatch(
      /independent(?:ly)? of `test-e2e`|regardless of `test-e2e`|not because `test-e2e`|`test-e2e` alone|`always\(\)`|\bby itself\b/i,
    );
  });
  it("C4: still says test-e2e's own job-level if: skips it in merge_group runs", () => {
    expect(
      missing(bullet(), [/`merge_group`/, /`if:`[^.]{0,40}\bskips\b/i]),
    ).toEqual([]);
  });
  it("C5: keeps the develop-push note and the fail-closed required checks", () => {
    expect(
      missing(bullet(), [
        /still runs on the `develop` push that follows the merge/,
        /`ci-gate`, `migrate`, `smoke`, and `e2e-smoke-gate` still run and report on merge-group commits/,
        /`e2e-smoke-gate` still needs `migrate`, `smoke`, and `test-e2e-smoke` to succeed \(fails closed\)/,
      ]),
    ).toEqual([]);
  });
});

describe("#2215 doc claims hold for ci-integration.yml (cross-check)", () => {
  const jobs = () => W.workflowJobs(W.loadWorkflowDocument(CII), CII);
  const eventOf = (s: W.EventScenario) =>
    (s.github as { event_name: string }).event_name;
  const scenario = (event: string, label?: string) => {
    const s = W.EVENT_SCENARIOS.find(
      (x) => eventOf(x) === event && (label === undefined || x.label === label),
    );
    expect(s, `${event} ${label ?? ""} scenario`).toBeDefined();
    return s!;
  };
  const runs = (
    job: W.WorkflowJob,
    s: W.EventScenario,
    needs: Parameters<typeof W.scenarioContext>[1],
  ) => W.evaluateIfCondition(W.ifExpression(job), W.scenarioContext(s, needs));

  it("C6: test-e2e's if: is false under merge_group even when all its needs succeed", () => {
    const job = jobs()["test-e2e"]!;
    const ok = Object.fromEntries(
      W.needsList(job).map((n) => [n, { result: "success", outputs: {} }]),
    );
    expect(runs(job, scenario("merge_group"), ok)).toBe(false);
  });
  it("C7: e2e-gate's if: is false under merge_group for every test-e2e/instant-nav result", () => {
    const job = jobs()["e2e-gate"]!;
    const mg = scenario("merge_group");
    expect(W.needsScenarios(job).filter((n) => runs(job, mg, n))).toEqual([]);
  });
  it("C8: a skipped test-e2e alone does not skip e2e-gate (always()): it runs on a production push", () => {
    const job = jobs()["e2e-gate"]!;
    const needs = {
      "test-e2e": { result: "skipped", outputs: {} },
      "instant-nav": { result: "success", outputs: {} },
    };
    expect(runs(job, scenario("push", "push production"), needs)).toBe(true);
  });
});
