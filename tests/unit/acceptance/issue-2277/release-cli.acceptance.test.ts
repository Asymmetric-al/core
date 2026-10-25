/**
 * #2277 done criterion 8 and the production.mjs half of 9. Spec r1 plus
 * addendum 1:
 * {@link https://github.com/Asymmetric-al/core/issues/2277#issuecomment-6386065652}
 * Criterion 8 is checked on the source, as worded, and by running
 * production.mjs in a throwaway repo with a fake `gh` and `bun` on PATH (no
 * GitHub; pushes go to a local bare origin): gated before the slow gates,
 * again before the push, in dry runs too, failing closed (§1, OQ2, OQ5).
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { afterEach, describe, expect, it } from "vitest";

import {
  item,
  LABEL_ARGS,
  LIST_ARGS,
  makeSandbox,
  passLine,
  PRODUCTION_PATH,
  read,
  refusedFirstLine,
  type GhScenario,
} from "./harness";

const LABEL = { status: 0, stdout: '{"name":"release-blocker"}' };
const NONE = { status: 0, stdout: "" };
const ONE = { status: 0, stdout: `${item(2273, { title: "Hold" })}\n` };
const BLOCKER_LINE =
  "  #2273 Hold https://github.com/Asymmetric-al/core/issues/2273";
const GATES = [
  ["run", "verify:deployment-discipline"],
  ["run", "ci:preflight", "--", "--full"],
];

const sandboxes: ReturnType<typeof makeSandbox>[] = [];
function sandbox(scenario: GhScenario | false) {
  const box = makeSandbox(scenario);
  sandboxes.push(box);
  return box;
}
afterEach(() => {
  for (const box of sandboxes.splice(0)) box.cleanup();
});

describe("issue #2277 criterion 8: wiring and placement (source)", () => {
  const source = read(PRODUCTION_PATH);
  const callRe = /\bassertNoReleaseBlockers\s*\(/gu;
  const calls = [...source.matchAll(callRe)].map((m) => m.index);

  it("imports assertNoReleaseBlockers from ./release-blockers.mjs", () => {
    expect(source).toMatch(
      /import\s*\{[^}]*\bassertNoReleaseBlockers\b[^}]*\}\s*from\s*["']\.\/release-blockers\.mjs["']/u,
    );
  });

  it("has exactly two calls, placed per §2.2, at main()'s top level", () => {
    expect(calls).toHaveLength(2);
    const [first, second] = calls as [number, number];
    const clean = source.indexOf("assertCleanWorktree();");
    const discipline = source.indexOf('runGate("verify deployment discipline"');
    const onDevelop = source.indexOf(
      "assertReleaseSourceIsOnDevelop(args.remote, commit)",
    );
    const push = source.search(
      /(?<!function )\bpushProduction\(\{ remote: args/u,
    );
    for (const anchor of [clean, discipline, onDevelop, push]) {
      expect(anchor).toBeGreaterThan(-1);
    }
    expect(clean).toBeLessThan(first);
    expect(first).toBeLessThan(discipline);
    expect(onDevelop).toBeLessThan(second);
    expect(second).toBeLessThan(push);
    expect(source.slice(first, first + 200)).toMatch(
      /stage\s*:\s*"pre-flight"/u,
    );
    expect(source.slice(second, second + 200)).toMatch(
      /stage\s*:\s*"pre-push"/u,
    );

    // Neither call sits inside a dryRun branch: same indent as
    // `assertCleanWorktree();`, and no dryRun test between anchor and call.
    const indentAt = (index: number) =>
      /^[ \t]*/u.exec(source.slice(source.lastIndexOf("\n", index) + 1))![0];
    expect(indentAt(first)).toBe(indentAt(clean));
    expect(indentAt(second)).toBe(indentAt(clean));
    expect(source.slice(clean, first)).not.toMatch(/dryRun/u);
    expect(source.slice(onDevelop, second)).not.toMatch(/dryRun/u);
  });
});

describe("issue #2277 criterion 9 (production.mjs): no secrets, no override", () => {
  it("adds no token, override or shell use", () => {
    const source = read(PRODUCTION_PATH);
    expect(source).not.toMatch(
      /GH_TOKEN|GITHUB_TOKEN|ghp_|github_pat_|gho_|Authorization/u,
    );
    expect(source).not.toMatch(/OVERRIDE|[a-z](?:Override|Bypass)|BYPASS/u);
    expect(source).not.toMatch(/shell\s*:\s*true/u);
  });

  it("the gate's lines add no process.env read", () => {
    // Gate lines: the release-blockers.mjs import and the two §2.2 anchor
    // spans that hold the calls. Env use elsewhere in the file is out of scope.
    const source = read(PRODUCTION_PATH);
    const span = (from: string, to: RegExp) => {
      const start = source.indexOf(from);
      expect(start, from).toBeGreaterThan(-1);
      const end = start + source.slice(start).search(to);
      expect(end, String(to)).toBeGreaterThan(start);
      return source.slice(start, end);
    };
    const preFlight = span(
      "assertCleanWorktree();",
      /runGate\("verify deployment discipline"/u,
    );
    const prePush = span(
      "assertReleaseSourceIsOnDevelop(args.remote, commit)",
      /(?<!function )\bpushProduction\(\{ remote: args/u,
    );
    const imports = source
      .split("\n")
      .filter((line) => line.includes("release-blockers.mjs"));
    expect(imports.length, "release-blockers.mjs import").toBeGreaterThan(0);
    for (const gate of [preFlight, prePush]) {
      expect(gate).toMatch(/\bassertNoReleaseBlockers\s*\(/u);
    }
    for (const text of [preFlight, prePush, ...imports]) {
      expect(text).not.toMatch(/process\.env/u);
    }
  });
});

describe("issue #2277 criterion 8: release:production behavior", () => {
  it("dry run with an open blocker refuses at pre-flight, before any gate", () => {
    const box = sandbox({ label: LABEL, lists: [ONE, ONE] });
    const r = box.release("--dry-run");
    expect(r.status, r.output).not.toBe(0);
    expect(r.status, r.output).not.toBeNull();
    expect(r.output).toContain(refusedFirstLine(1));
    expect(r.output).toContain(BLOCKER_LINE);
    expect(box.bunCalls()).toEqual([]);
    expect(box.ghCalls()).toEqual([LABEL_ARGS.slice(1), LIST_ARGS.slice(1)]);
    expect(r.output).not.toContain("dry run: git push");
  });

  it("a blocker labeled during the preflight stops the real push", () => {
    const box = sandbox({ label: LABEL, lists: [NONE, ONE] });
    const r = box.release();
    expect(r.status, r.output).not.toBe(0);
    expect(r.output).toContain(passLine("pre-flight"));
    expect(r.output).toContain(refusedFirstLine(1));
    expect(r.output).toContain(BLOCKER_LINE);
    expect(box.bunCalls()).toEqual(GATES);
    expect(box.ghCalls()).toHaveLength(4);
    expect(box.productionMoved()).toBe(false);
    expect(r.output).not.toMatch(/==> pushing /u);
  });

  it("with none open, both stages pass in order and the release proceeds", () => {
    const box = sandbox({ label: LABEL, lists: [NONE, NONE] });
    const r = box.release("--dry-run");
    expect(r.status, r.output).toBe(0);
    const at = (text: string) => r.stdout.indexOf(text);
    expect(at(passLine("pre-flight"))).toBeGreaterThan(-1);
    expect(at(passLine("pre-flight"))).toBeLessThan(
      at("FAKE_BUN run verify:deployment-discipline"),
    );
    expect(at("FAKE_BUN run ci:preflight")).toBeLessThan(
      at(passLine("pre-push")),
    );
    expect(at(passLine("pre-push"))).toBeLessThan(at("dry run: git push"));
    expect(box.ghCalls()).toEqual([
      LABEL_ARGS.slice(1),
      LIST_ARGS.slice(1),
      LABEL_ARGS.slice(1),
      LIST_ARGS.slice(1),
    ]);
    expect(box.productionMoved()).toBe(false);
  });

  it("a real release with none open still pushes production", () => {
    const box = sandbox({ label: LABEL, lists: [NONE, NONE] });
    const r = box.release();
    expect(r.status, r.output).toBe(0);
    expect(box.productionMoved()).toBe(true);
  });

  it("fails closed when gh is not installed (default runner, ENOENT)", () => {
    const box = sandbox(false);
    const r = box.release("--dry-run");
    expect(r.status, r.output).not.toBe(0);
    expect(r.output).toMatch(
      /release:production refused: could not verify release blockers \(.+\)\. Check `gh auth status` and network, then re-run\./u,
    );
    expect(box.bunCalls()).toEqual([]);
  });

  it("refuses when the label does not exist, without listing", () => {
    const box = sandbox({
      label: { status: 1, stderr: "gh: Not Found (HTTP 404)" },
      lists: [NONE, NONE],
    });
    const r = box.release("--dry-run");
    expect(r.status, r.output).not.toBe(0);
    expect(r.output).toContain(
      "release:production refused: label release-blocker not found in Asymmetric-al/core.",
    );
    expect(box.ghCalls()).toEqual([LABEL_ARGS.slice(1)]);
    expect(box.bunCalls()).toEqual([]);
  });
});
