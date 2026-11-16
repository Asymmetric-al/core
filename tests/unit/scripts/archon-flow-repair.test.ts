import { describe, expect, it } from "vitest";

import {
  CONTEXT_CHANGE,
  afterAcceptance,
  bezalelRepairs,
  ezraCorrections,
  makeRepair,
  normalizeRepair,
  repairFingerprint,
  withContextChange,
} from "../../../scripts/archon-factory/pack/deliver/scripts/repair-logic.mjs";

const M1 =
  "[M1 P1] totals ignore refunds -> wrong balance at apps/x/a.ts:3. Correction: subtract refunds";
const L1 =
  "[L1 P2] C2 asserts the wrong currency -> false failure at tests/x/a.test.ts:9. Correction: assert USD";
const THREAD =
  "[review-thread https://example.invalid/t/1] the export drops the last page";
const CHECK =
  "[failed-check https://example.invalid/c/2] C3 expects the old message";

describe("repair hand-off between rounds (I2)", () => {
  it("keeps implementation and acceptance repairs as separate lists", () => {
    expect(
      makeRepair({
        acceptance: [L1],
        implementation: [M1],
        source: "after-assess",
      }),
    ).toEqual({
      acceptance: [L1],
      implementation: [M1],
      source: "after-assess",
    });
  });

  it("gives Ezra only the acceptance corrections in the oracle round", () => {
    const repair = makeRepair({
      acceptance: [L1],
      implementation: [M1],
      source: "after-assess",
    });
    expect(ezraCorrections(repair)).toEqual([L1]);
  });

  it("still hands the implementation repair to Bezalel after Ezra corrects the oracle", () => {
    // Case 1 of the finding: M1 repair-implementation with L1 repair-acceptance.
    const remaining = afterAcceptance(
      makeRepair({
        acceptance: [L1],
        implementation: [M1],
        source: "after-assess",
      }),
    );
    expect(remaining).toEqual({
      acceptance: [],
      implementation: [M1],
      source: "after-assess",
    });
    expect(bezalelRepairs(remaining)).toEqual([M1]);
  });

  it("keeps a human thread fix when a failed check needs an acceptance fix in the same round", () => {
    // Case 2 of the finding (feedback): fix-implementation plus fix-acceptance.
    const remaining = afterAcceptance(
      makeRepair({
        acceptance: [CHECK],
        implementation: [THREAD],
        source: "readiness",
      }),
    );
    expect(bezalelRepairs(remaining)).toEqual([THREAD]);
  });

  it("ends the repair once Ezra applied its only (acceptance) part", () => {
    expect(
      afterAcceptance(makeRepair({ acceptance: [L1], source: "after-assess" })),
    ).toBeNull();
    expect(afterAcceptance(null)).toBeNull();
  });

  it("adds a context change next to pending repairs instead of replacing them", () => {
    const changed = withContextChange(
      makeRepair({ implementation: [M1], source: "after-assess" }),
    );
    expect(ezraCorrections(changed)).toEqual([CONTEXT_CHANGE]);
    expect(bezalelRepairs(changed)).toEqual([M1]);
    expect(withContextChange(changed)).toEqual(changed);
    expect(bezalelRepairs(afterAcceptance(changed))).toEqual([M1]);
  });

  it("starts a context-change repair when nothing was pending", () => {
    const changed = withContextChange(null);
    expect(ezraCorrections(changed)).toEqual([CONTEXT_CHANGE]);
    expect(bezalelRepairs(changed)).toEqual([]);
  });

  it("reads legacy {kind, items} repairs with the one shared mapping", () => {
    // Wave 1b "one repair constructor": kind "acceptance" (I2) and
    // "context-change" are Ezra's, "review-again" re-runs the reviews with
    // empty lists, any other kind is Bezalel's. record and readiness import
    // this function, so every consumer agrees. (This deliberately replaces the
    // literal-I2 expectations: a legacy 'review-again' sent to Bezalel is the
    // wiring-bugs#5 no-change loop.)
    expect(normalizeRepair({ kind: "acceptance", items: [L1] })).toMatchObject({
      acceptance: [L1],
      implementation: [],
    });
    expect(normalizeRepair({ kind: "no-change", items: [M1] })).toMatchObject({
      acceptance: [],
      implementation: [M1],
    });
    expect(
      normalizeRepair({ kind: "context-change", items: [CONTEXT_CHANGE] }),
    ).toMatchObject({ acceptance: [CONTEXT_CHANGE], implementation: [] });
    expect(
      normalizeRepair({ kind: "review-again", items: ["repeat the reviews"] }),
    ).toEqual({
      acceptance: [],
      implementation: [],
      reviewOnly: true,
      source: "legacy:review-again",
    });
    expect(
      normalizeRepair({ kind: "acceptance", items: [L1], reviewOnly: true }),
    ).toMatchObject({ reviewOnly: true });
    // A new-shape repair is recognized by its lists, as record recognizes it.
    expect(
      normalizeRepair({
        kind: "acceptance",
        acceptance: [],
        implementation: [M1],
        source: "x",
      }),
    ).toEqual({ acceptance: [], implementation: [M1], source: "x" });
    expect(bezalelRepairs({ kind: "implementation", items: [M1] })).toEqual([
      M1,
    ]);
    expect(bezalelRepairs({ kind: "acceptance", items: [L1] })).toEqual([]);
    expect(ezraCorrections({ kind: "acceptance", items: [L1] })).toEqual([L1]);
  });

  it("carries a review-only repair without inventing items", () => {
    expect(
      normalizeRepair({
        acceptance: [],
        implementation: [],
        reviewOnly: true,
        source: "readiness",
      }),
    ).toEqual({
      acceptance: [],
      implementation: [],
      reviewOnly: true,
      source: "readiness",
    });
    expect(
      normalizeRepair({ kind: "acceptance", items: "not a list" }),
    ).toMatchObject({ acceptance: [], implementation: [] });
    expect(normalizeRepair("garbage")).toBeNull();
    expect(
      repairFingerprint("readiness", {
        acceptance: [],
        implementation: [],
        reviewOnly: true,
        source: "readiness",
      }),
    ).toBe("readiness:review-only");
  });

  it("keeps record's call shape: a fallback source and bounded items", () => {
    // record-logic calls normalizeRepair(entry.repair, stage); the stage names
    // a repair that does not carry its own source.
    expect(
      normalizeRepair({ kind: "hooks", items: ["lint failed"] }, "freeze"),
    ).toEqual({
      acceptance: [],
      implementation: ["lint failed"],
      source: "freeze",
    });
    expect(
      normalizeRepair({ acceptance: [], implementation: [M1] }, "after-assess"),
    ).toEqual({ acceptance: [], implementation: [M1], source: "after-assess" });
    expect(
      normalizeRepair(
        { acceptance: [], implementation: [M1], source: "publish" },
        "after-assess",
      ).source,
    ).toBe("publish");
    // Work-item size: at most 64 items of at most 2000 characters, no blank items.
    const many = Array.from({ length: 80 }, (_, index) => `item ${index}`);
    expect(
      makeRepair({ implementation: ["  ", ...many], source: "s" })
        .implementation,
    ).toEqual(many.slice(0, 64));
    expect(
      normalizeRepair({ acceptance: ["x".repeat(3000)], implementation: [] })
        ?.acceptance[0],
    ).toHaveLength(2000);
  });

  it("fingerprints a repair by its items", () => {
    const repair = makeRepair({
      acceptance: [L1],
      implementation: [M1],
      source: "after-assess",
    });
    expect(repairFingerprint("review", repair)).toBe(
      `review:${L1}|${M1}`.slice(0, 407),
    );
    expect(
      repairFingerprint("review", { kind: "implementation", items: [M1] }),
    ).toBe(`review:${M1}`);
  });
});
