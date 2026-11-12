import { describe, expect, it } from "vitest";

import { reconcileDependencies } from "../../../scripts/archon-factory/pack/select/scripts/admission-observations.mjs";

const REPO = "Asymmetric-al/core";

function parse(...texts: string[]) {
  return reconcileDependencies({
    native: [],
    texts: texts.map((text, index) => ({ text, source: `source-${index}` })),
    repo: REPO,
  });
}

const edges = (result: ReturnType<typeof parse>) =>
  result.dependencies
    .map(
      (edge: { kind: string; targetId: string }) =>
        `${edge.kind} ${edge.targetId}`,
    )
    .sort();

// The body and the dependency statements of issue #2228 as written on
// GitHub. The selector blocked it on #2268, #2281, #2289, #2292, #2298 and
// #2222, which its own specification says it does not depend on.
const ISSUE_2228_BODY = [
  "This is a follow-up from #2224 (C2) under #2222. #2224 does not fix it.",
  "",
  "**Wanted**",
  "- The settings copy lists every format the control accepts, including WebP.",
  "",
  "Not Ready. It's queued after the testing cleanup (#2223 to #2225).",
  "",
  "Refs #2222, #2224.",
].join("\n");

const ISSUE_2228_SPEC = [
  "## Final spec r1 (Oct 24, 2026)",
  "",
  "### §0 What I checked",
  "",
  "- **Copy of the old string in a fake page.** `tests/unit/acceptance/issue-2224/harness.ts:394` hard-codes the old string in a simulated page used by #2224's input tests. No test compares it with the real source, and #2224's criterion 9 depends only on \"auto-optimized\". See OQ2.",
  "",
  "### §9 Data, grants and `missionaries.person_id`",
  "",
  "None. This slice has no database, grant or REVOKE changes, and does not write `missionaries.person_id`, so it is not blocked by #2268.",
  "",
  "### §11 Dependencies and migration",
  "",
  "- **Phase 12 spine** (#492, #2281–#2289, #2292–#2298): no relation and no dependency.",
  "- **Other dependencies:** the #2223–#2225 testing cleanup it was queued behind is closed, so it has no open blockers. It is related to #2222 and #2224.",
  "",
  "### §12 OQs (defaults apply unless ruled)",
  "",
  "2. **#2224 harness string** (`harness.ts:394`). Default: leave it. It is a simulated page for #2224's input tests, and no criterion depends on the format list.",
].join("\n");

describe("dependency statements in issue text", () => {
  it("reads issue #2228 as its specification states it", () => {
    const result = parse(ISSUE_2228_BODY, ISSUE_2228_SPEC);
    expect(result.problems).toEqual([]);
    expect(result.reconciled).toBe(true);
    expect(edges(result)).toEqual([
      "implementation #2223",
      "implementation #2224",
      "implementation #2225",
      "informational #2222",
      "informational #2224",
    ]);
  });

  it.each([
    "This slice is not blocked by #50.",
    "It has no dependency on #50.",
    "The cleanup (#50) is closed, so it has no open blockers.",
    "- **Spine** (#50, #51): no relation and no dependency.",
    "It is no longer blocked by #50.",
    "This does not depend on #50.",
  ])("declares nothing for a denied dependency: %s", (text) => {
    const result = parse(`## Dependencies\n\n${text}`);
    expect(edges(result)).toEqual([]);
    expect(result.problems).toEqual([]);
  });

  // A negation elsewhere in the sentence does not deny the dependency: only
  // a negated dependency word does.
  it.each([
    ["Not ready because blocked by #50", "#50"],
    ["Not started and requires #52", "#52"],
    ["This has no UI but requires #60 first", "#60"],
    ["This is not small and depends on #51", "#51"],
    ["No tests yet; blocked by #53", "#53"],
    ["It never shipped and is blocked by #54", "#54"],
    ["Without the flag this requires #55", "#55"],
  ])("keeps the prerequisite in: %s", (text, target) => {
    const result = parse(text);
    expect(edges(result)).toEqual([`implementation ${target}`]);
  });

  it.each([
    "It is not currently blocked by #50.",
    "This is not yet blocked by #50.",
    "No hard prerequisites: #50 is only context.",
    "There are no remaining blockers (#50 merged).",
    "It doesn't depend on #50.",
    "Not dependent on #50.",
    "This wasn't blocked by #50.",
    "Not after #50.",
    "No longer queued after #50.",
    "It won't depend on #50.",
  ])("still reads a plain denial: %s", (text) => {
    const result = parse(`## Dependencies

${text}`);
    expect(edges(result)).toEqual([]);
  });

  it("keeps the genuine prerequisite when one sentence denies another", () => {
    const result = parse("Not blocked by #50 but requires #51.");
    expect(edges(result)).toEqual(["implementation #51"]);
  });

  it("still reads every reference of a list item under a dependency heading", () => {
    const result = parse("## Prerequisites\n\n- #50 producer. Also #51.");
    expect(edges(result)).toEqual(["implementation #50", "implementation #51"]);
  });

  it("does not let a denial hide an explicit non-optional prerequisite", () => {
    const result = parse("Requires #50 (not optional).");
    expect(edges(result)).toEqual(["implementation #50"]);
  });

  // A range names every issue in it, not only its two ends.
  it.each([
    "Queued after the testing cleanup (#2223 to #2225).",
    "Blocked by #2223–#2225.",
    "Depends on #2223-#2225.",
    "Requires #2223 through #2225.",
    "Blocked by #2223 — #2225",
  ])("reads every issue of a range: %s", (text) => {
    const result = parse(text);
    expect(edges(result)).toEqual([
      "implementation #2223",
      "implementation #2224",
      "implementation #2225",
    ]);
    expect(result.problems).toEqual([]);
  });

  it("stops for a person on a range too wide to be a real prerequisite list", () => {
    const result = parse("Blocked by #100 to #900.");
    expect(result.reconciled).toBe(false);
    expect(
      result.problems.map((problem: { code: string }) => problem.code),
    ).toEqual(["dependency-range-too-wide"]);
  });

  it("does not read a backwards pair as a range", () => {
    expect(edges(parse("Requires #60 to #50."))).toEqual([
      "implementation #50",
      "implementation #60",
    ]);
  });

  // A denial takes the issues it names with it, wherever it stands.
  it.each([
    "Requires #51, not blocked by #50.",
    "Depends on #51, not #50.",
    "Blocked by #51 but not #50 or #52.",
    "Requires #51 and has no dependency on #50 and #52.",
    "Depends on #51; it does not depend on #50–#53.",
  ])("drops the issues a denial names: %s", (text) => {
    const result = parse(text);
    expect(edges(result)).toEqual(["implementation #51"]);
    expect(result.problems).toEqual([]);
  });

  it("keeps an issue stated as a prerequisite and denied elsewhere", () => {
    const result = parse("Not blocked by #50.", "Requires #50.");
    expect(edges(result)).toEqual(["implementation #50"]);
  });

  // "Related to #50" and "depends on #50" do not contradict each other: the
  // prerequisite holds.
  it("lets a prerequisite stand beside a mention of the same issue as related", () => {
    const result = parse("Depends on #50. It is related to #50.");
    expect(result.problems).toEqual([]);
    expect(edges(result)).toEqual(["implementation #50", "informational #50"]);
    const reversed = parse("Related to #50.", "Blocked by #50.");
    expect(reversed.problems).toEqual([]);
    expect(edges(reversed)).toEqual([
      "implementation #50",
      "informational #50",
    ]);
  });

  it("still stops on statements that do contradict each other", () => {
    const result = parse("Optional: #50.", "Requires #50.");
    expect(
      result.problems.map((problem: { code: string }) => problem.code),
    ).toEqual(["conflicting-dependency"]);
    const kinds = parse(
      "Related to #50.",
      "Requires #50.",
      "Release prerequisite (gates admission): #50.",
    );
    expect(
      kinds.problems.map((problem: { code: string }) => problem.code),
    ).toEqual(["conflicting-dependency"]);
  });

  // A list of prerequisites is read whatever separates its issues.
  it.each([
    "Depends on #50/#51.",
    "Depends on #50; #51.",
    "Blocked by #50, #51",
    "Requires #50 and #51",
    "Blocked by #50 & #51",
  ])("reads both issues of a list: %s", (text) => {
    expect(edges(parse(text))).toEqual([
      "implementation #50",
      "implementation #51",
    ]);
  });

  it("still starts a new statement after a semicolon", () => {
    expect(edges(parse("Depends on #50; related to #51."))).toEqual([
      "implementation #50",
      "informational #51",
    ]);
    expect(edges(parse("Depends on #50; not blocked by #52."))).toEqual([
      "implementation #50",
    ]);
  });

  it("does not read a path or an anchor as an issue", () => {
    expect(
      edges(parse("Depends on docs/#12 and the page/#34 anchor.")),
    ).toEqual([]);
  });

  it("classifies a later sentence by its own words", () => {
    const result = parse("Depends on #50. It is related to #51.");
    expect(edges(result)).toEqual(["implementation #50", "informational #51"]);
    expect(result.problems).toEqual([]);
  });
});
