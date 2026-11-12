import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  FINAL_EVIDENCE,
  READ_ONLY_CHECKS,
  TRUSTED_GATES,
  changeSection,
  finalAcceptanceText,
} from "../../../scripts/archon-factory/pack/.shared/views.mjs";
import {
  criterionOwner,
  failRepair,
  finalDecision,
  briefText,
  hooksLine,
  publicationGate,
  reviewsLine,
} from "../../../scripts/archon-factory/pack/deliver/scripts/publish-logic.mjs";

const acceptance = { revision: "rev1", criteria: [{ id: "C1" }, { id: "C2" }] };
const final = (overrides: Record<string, unknown> = {}) => ({
  task_status: "DONE",
  decision: "PASS",
  candidate_sha: "c0ffee",
  acceptance_revision: "rev1",
  criteria: [
    { id: "C1", result: "PASS", evidence: "bun test a", correction: "" },
    { id: "C2", result: "PASS", evidence: "bun test b", correction: "" },
  ],
  checks_run: [],
  limitations: [],
  ...overrides,
});

describe("Ezra's final result (independence#10)", () => {
  it("does not accept a PASS from a BLOCKED final pass", () => {
    expect(
      finalDecision(final({ task_status: "BLOCKED" }), acceptance),
    ).toMatchObject({ decision: "INCONCLUSIVE" });
  });

  it("does not turn a FAIL without a failing criterion into an empty repair", () => {
    const result = finalDecision(
      final({
        decision: "FAIL",
        criteria: [
          { id: "C1", result: "PASS", evidence: "", correction: "" },
          { id: "C2", result: "INCONCLUSIVE", evidence: "", correction: "" },
        ],
      }),
      acceptance,
    );
    expect(result.decision).toBe("INCONCLUSIVE");
    expect(result.notes.join(" ")).toMatch(/FAIL/);
  });

  it("keeps a FAIL that names a failing criterion and repairs it", () => {
    const failing = final({
      decision: "FAIL",
      criteria: [
        { id: "C1", result: "PASS", evidence: "", correction: "" },
        {
          id: "C2",
          result: "FAIL",
          evidence: "total off by refund",
          correction: "subtract refunds",
        },
      ],
    });
    expect(finalDecision(failing, acceptance).decision).toBe("FAIL");
    const { repair, fingerprint } = failRepair(failing);
    expect(repair).toEqual({
      acceptance: [],
      implementation: ["[C2] total off by refund Correction: subtract refunds"],
      source: "publish",
    });
    expect(fingerprint).toBe("final:C2");
  });

  it("downgrades a PASS with an unmapped or non-PASS criterion", () => {
    expect(
      finalDecision(
        final({
          criteria: [
            { id: "C1", result: "PASS", evidence: "", correction: "" },
          ],
        }),
        acceptance,
      ),
    ).toMatchObject({ decision: "INCONCLUSIVE", unmapped: ["C2"] });
    expect(finalDecision(final(), acceptance)).toMatchObject({
      decision: "PASS",
      unmapped: [],
    });
  });
});

describe("publication gate (I8, independence#3)", () => {
  const value = (overrides: Record<string, unknown> = {}) => ({
    acceptance,
    reviews: {
      micaiah: { decision: "CLEAR", candidate: "c0ffee", acceptance: "rev1" },
      luke: {
        decision: "CLEAR",
        candidate: "c0ffee",
        acceptance: "rev1",
        cleared: true,
      },
    },
    final: {
      decision: "PASS",
      taskStatus: "DONE",
      candidate: "c0ffee",
      acceptanceRevision: "rev1",
    },
    ...overrides,
  });

  it("allows publication with both CLEAR reviews and a DONE PASS for this candidate", () => {
    expect(publicationGate({ value: value(), candidate: "c0ffee" })).toEqual(
      [],
    );
  });

  it("refuses when a first-pass review is INCONCLUSIVE", () => {
    // Verifier: Micaiah INCONCLUSIVE, Luke's finding rejected by Agabus, Ezra PASS.
    const problems = publicationGate({
      value: value({
        reviews: {
          micaiah: {
            decision: "INCONCLUSIVE",
            candidate: "c0ffee",
            acceptance: "rev1",
          },
          luke: { decision: "CLEAR", candidate: "c0ffee", acceptance: "rev1" },
        },
      }),
      candidate: "c0ffee",
    });
    expect(problems).toEqual([expect.stringMatching(/micaiah/i)]);
  });

  it("refuses reviews or final results bound to another candidate or acceptance", () => {
    expect(
      publicationGate({
        value: value({
          reviews: {
            micaiah: {
              decision: "CLEAR",
              candidate: "old",
              acceptance: "rev1",
            },
            luke: {
              decision: "CLEAR",
              candidate: "c0ffee",
              acceptance: "rev0",
            },
          },
        }),
        candidate: "c0ffee",
      }),
    ).toHaveLength(2);
    expect(
      publicationGate({ value: value({ reviews: null }), candidate: "c0ffee" }),
    ).toHaveLength(2);
    expect(
      publicationGate({
        value: value({
          final: {
            decision: "PASS",
            taskStatus: "BLOCKED",
            candidate: "c0ffee",
            acceptanceRevision: "rev1",
          },
        }),
        candidate: "c0ffee",
      }),
    ).toHaveLength(1);
    expect(
      publicationGate({
        value: value({
          final: {
            decision: "PASS",
            taskStatus: "DONE",
            candidate: "c0ffee",
            acceptanceRevision: "rev0",
          },
        }),
        candidate: "c0ffee",
      }),
    ).toHaveLength(1);
    expect(
      publicationGate({ value: value({ final: null }), candidate: "c0ffee" }),
    ).toHaveLength(1);
  });
});

describe("owner of a failing final criterion (S5.8, R6.4)", () => {
  it("sends an acceptance-owned FAIL to Ezra and an implementation-owned FAIL to Bezalel", () => {
    const failing = final({
      decision: "FAIL",
      criteria: [
        {
          id: "C1",
          result: "FAIL",
          evidence: "test asserts EUR but the issue says USD",
          correction: "assert USD",
          owner: "acceptance",
        },
        {
          id: "C2",
          result: "FAIL",
          evidence: "total off by refund",
          correction: "subtract refunds",
          owner: "implementation",
        },
      ],
    });
    const { repair, fingerprint } = failRepair(failing);
    expect(repair).toEqual({
      acceptance: [
        "[C1] test asserts EUR but the issue says USD Correction: assert USD",
      ],
      implementation: ["[C2] total off by refund Correction: subtract refunds"],
      source: "publish",
    });
    expect(fingerprint).toBe("final:C1,C2");
  });

  it("treats a FAIL without an owner as Bezalel's", () => {
    const { repair } = failRepair(
      final({
        decision: "FAIL",
        criteria: [
          { id: "C2", result: "FAIL", evidence: "e", correction: "c" },
        ],
      }),
    );
    expect(repair).toMatchObject({
      acceptance: [],
      implementation: ["[C2] e Correction: c"],
    });
  });

  it("fails closed toward Bezalel for an unknown owner, and records only the two owners (I9)", () => {
    const { repair } = failRepair(
      final({
        decision: "FAIL",
        criteria: [
          {
            id: "C1",
            result: "FAIL",
            evidence: "e",
            correction: "c",
            owner: "tests",
          },
        ],
      }),
    );
    expect(repair).toMatchObject({
      acceptance: [],
      implementation: ["[C1] e Correction: c"],
    });
    expect(criterionOwner({ owner: "acceptance" })).toBe("acceptance");
    for (const owner of ["implementation", "tests", "", undefined, null, 1])
      expect(criterionOwner({ owner }), String(owner)).toBe("implementation");
  });
});

describe("Ezra's final assignment (I9, S5.8, R6.4)", () => {
  it("asks for the owner of every criterion and says how a missing owner is read", () => {
    const text = finalAcceptanceText({
      issue: 101,
      assignment: "a101",
      runId: "run1",
      value: {
        base: "b0",
        acceptance: {
          revision: "rev1",
          criteria: [{ id: "C1", statement: "s" }],
          tests: [["tests/x/a.test.ts", "blob1"]],
        },
      },
      candidate: "c0ffee",
      view: "/views/run1/ezra",
      materials: "/materials/ezra-final",
      request: "Fix totals",
    });
    expect(text).toMatch(/candidate_sha: c0ffee/);
    expect(text).toMatch(/owner/);
    expect(text).toMatch(
      /`acceptance` when the criterion or its test is wrong/,
    );
    expect(text).toMatch(/`implementation`/);
    expect(text).toMatch(/missing or unknown owner counts as `implementation`/);
  });
});

// Observed on VM 100 (runs 623b3e38 and cd44915c, 12 November 2026): final
// acceptance ran `git diff` in its Gitless view and could not settle a
// "only the assigned file changes" criterion; every read-only role spent
// several checks finding a Vitest invocation that needs no writable
// node_modules.
describe("what a read-only role is told about the change and its checks", () => {
  const value = {
    base: "b0",
    acceptance: {
      revision: "rev1",
      criteria: [{ id: "C1", statement: "s" }],
      tests: [["tests/x/a.test.ts", "blob1"]],
    },
  };
  const final = (changed?: string[]) =>
    finalAcceptanceText({
      issue: 101,
      assignment: "a101",
      runId: "run1",
      value,
      candidate: "c0ffee",
      view: "/views/run1/ezra",
      materials: "/materials/ezra-final",
      request: "Fix totals",
      changed,
    });

  it("lists the changed paths as a fact the factory read from Git", () => {
    const text = final(["docs/a.md", "tests/x/a.test.ts"]);
    expect(text).toContain(
      [
        "Files changed from base b0 to candidate c0ffee (2), read from Git by the factory:",
        "- docs/a.md",
        "- tests/x/a.test.ts",
        "Full diff: /materials/ezra-final/candidate.diff",
        "Your copy of the candidate has no Git metadata, so `git` cannot answer this there; rely on this list and the diff for what changed.",
      ].join("\n"),
    );
  });

  it("says so when nothing changed, and bounds a very long list", () => {
    expect(
      changeSection({
        base: "b0",
        candidate: "c1",
        changed: [],
        materials: "/m",
      }),
    ).toContain("Files changed from base b0 to candidate c1 (0)");
    const many = Array.from({ length: 450 }, (_, index) => `f/${index}.ts`);
    const section = changeSection({
      base: "b0",
      candidate: "c1",
      changed: many,
      materials: "/m",
    });
    expect(section).toContain("(450)");
    expect(section).toContain("- f/399.ts");
    expect(section).not.toContain("- f/400.ts");
    expect(section).toContain("50 more in /m/changed-files.txt");
  });

  it("tells final acceptance how checks run against a read-only node_modules", () => {
    expect(final(["docs/a.md"])).toContain(READ_ONLY_CHECKS);
    expect(READ_ONLY_CHECKS).toBe(
      "Checks run in a disposable container where node_modules is read-only, so a tool that writes a cache there fails at startup. Run Vitest as: node node_modules/vitest/vitest.mjs run --configLoader runner --no-fsModuleCache <paths>",
    );
  });

  it("tells read-only roles which gates the factory runs itself and what an environment failure is", () => {
    expect(final(["docs/a.md"])).toContain(TRUSTED_GATES);
    // Repository-wide gates are the pre-push gate's job, on the same commit.
    expect(TRUSTED_GATES).toContain("pre-push gate");
    expect(TRUSTED_GATES).toContain("this exact commit");
    // A failure caused by the check container is not the candidate's.
    expect(TRUSTED_GATES).toContain("not a failure of the candidate");
    // INCONCLUSIVE stays for evidence about the candidate itself.
    expect(TRUSTED_GATES).toContain("INCONCLUSIVE");
  });

  it("tells Ezra, when she defines acceptance, what final acceptance will have", () => {
    expect(FINAL_EVIDENCE).toBe(
      "Final acceptance checks the committed candidate in a copy without Git metadata. It is given the list of changed files and the full diff from base, both read from Git by the factory. State any criterion about what may or may not change in terms of that list and diff, not as a `git` command to run.",
    );
    expect(
      readFileSync(
        "scripts/archon-factory/pack/deliver/scripts/after-scope.ts",
        "utf8",
      ),
    ).toMatch(/"How to work",[\s\S]{0,900}FINAL_EVIDENCE/);
  });

  it("still renders without the change facts (an older caller)", () => {
    expect(final()).toMatch(/candidate_sha: c0ffee/);
    expect(final()).not.toContain("Files changed from base");
  });
});

// 12 Nov 2026, PR #2659: Micaiah sealed FINDINGS (one P3), Samson assessed it
// as not material, and the pull request said "Micaiah CLEAR".
describe("what the PR body says about the independent reviews", () => {
  const review = (overrides: Record<string, unknown> = {}) => ({
    decision: "CLEAR",
    findings: 0,
    ...overrides,
  });

  it("says clear only for a review that was sealed clear without findings", () => {
    expect(reviewsLine({ micaiah: review(), luke: review() })).toBe(
      "- Independent reviews: Micaiah clear; Luke clear.",
    );
  });

  it("names findings that were not upheld instead of calling the review clear", () => {
    expect(
      reviewsLine({
        micaiah: review({ findings: 1, cleared: true }),
        luke: review({ findings: 2, cleared: true }),
      }),
    ).toBe(
      "- Independent reviews: Micaiah raised 1 finding, not upheld after assessment; Luke raised 2 findings, not upheld after assessment.",
    );
  });

  it("mentions the optional notes of a review sealed clear", () => {
    expect(
      reviewsLine({ micaiah: review(), luke: review({ findings: 1 }) }),
    ).toBe(
      "- Independent reviews: Micaiah clear; Luke clear, with 1 optional note.",
    );
  });

  it("claims nothing for a review that is missing or not clear", () => {
    expect(reviewsLine({ micaiah: review({ decision: "INCONCLUSIVE" }) })).toBe(
      "- Independent reviews: Micaiah inconclusive; Luke not recorded.",
    );
    expect(reviewsLine(null)).toBe(
      "- Independent reviews: Micaiah not recorded; Luke not recorded.",
    );
  });

  it("is what publish.ts prints", () => {
    const source = readFileSync(
      new URL(
        "../../../scripts/archon-factory/pack/deliver/scripts/publish.ts",
        import.meta.url,
      ),
      "utf8",
    );
    expect(source).toContain("reviewsLine(value.reviews)");
    expect(source).toContain("briefText(value.brief.summary)");
    expect(source).not.toContain("value.reviews?.micaiah?.decision");
  });
});

describe("the coordinator brief in the PR body", () => {
  it("keeps a brief that fits", () => {
    expect(briefText("One line.\nAnother.")).toBe("One line.\nAnother.");
  });

  it("ends a long brief at a line end and says it was shortened", () => {
    const lines = Array.from(
      { length: 200 },
      (_, n) => `Line ${n} of the brief.`,
    );
    const text = briefText(lines.join("\n"), 400);
    expect(text.length).toBeLessThanOrEqual(400 + 60);
    const kept = text.split("\n");
    expect(kept.at(-1)).toBe("_(The coordinator brief is shortened here.)_");
    expect(kept.at(-2)).toBe("");
    for (const line of kept.slice(0, -2)) expect(lines).toContain(line);
  });
});

describe("hook evidence in the PR body (boundary-shell-secrets#2, publication-merge#2)", () => {
  it("says the pre-commit hook ran in this round only when freeze recorded a receipt for every commit", () => {
    const line = hooksLine(
      {
        preCommit: [
          { status: "passed", ran: true },
          { status: "passed", ran: true },
        ],
      },
      { prePush: true },
    );
    expect(line).toMatch(
      /^- Pre-commit hook \(lint-staged\) ran and passed in this round; /,
    );
    expect(line).toMatch(
      /pre-push hook ran ci:preflight to '==> PASS ci:preflight' \(verified\)\.$/,
    );
  });

  it("says a review-only round's candidate passed the hook when it was committed earlier", () => {
    expect(
      hooksLine({ preCommit: "earlier-round" }, { prePush: true }),
    ).toMatch(/passed when this candidate was committed in an earlier round/);
  });

  it("claims nothing the receipts do not show", () => {
    for (const hooks of [
      undefined,
      null,
      {},
      { preCommit: [] },
      { preCommit: [{ status: "passed", ran: false }] },
      { preCommit: [{ status: "failed", ran: true }] },
      { preCommit: "yes" },
    ]) {
      const line = hooksLine(hooks, { prePush: true });
      expect(line, JSON.stringify(hooks)).not.toMatch(
        /ran and passed|passed when/,
      );
      expect(line).toMatch(/no pre-commit receipt/);
    }
    for (const publication of [
      undefined,
      {},
      { prePush: false },
      { prePush: "yes" },
    ])
      expect(
        hooksLine({ preCommit: "earlier-round" }, publication),
        JSON.stringify(publication),
      ).toMatch(/pre-push hook not verified/);
  });
});

describe("pending acceptance corrections at publication (I8)", () => {
  it("refuses to publish while Ezra still has a correction to apply", () => {
    const value = {
      acceptance,
      brief: {
        repair: {
          acceptance: ["The governing issue context changed"],
          implementation: [],
          reviewOnly: true,
          source: "readiness",
        },
      },
      reviews: {
        micaiah: { decision: "CLEAR", candidate: "c0ffee", acceptance: "rev1" },
        luke: { decision: "CLEAR", candidate: "c0ffee", acceptance: "rev1" },
      },
      final: {
        decision: "PASS",
        taskStatus: "DONE",
        candidate: "c0ffee",
        acceptanceRevision: "rev1",
      },
    };
    expect(publicationGate({ value, candidate: "c0ffee" })).toEqual([
      expect.stringMatching(/acceptance correction/i),
    ]);
    expect(
      publicationGate({
        value: { ...value, brief: { repair: null } },
        candidate: "c0ffee",
      }),
    ).toEqual([]);
  });
});
