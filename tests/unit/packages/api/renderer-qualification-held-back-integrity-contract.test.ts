import { describe, expect, it } from "vitest";

import { buildFixtureContestInput } from "./renderer-qualification-test-fixture";
import {
  RendererCharterValidationError,
  freezeRendererQualificationCharter,
  loadCandidateWorkPacket,
  validateRendererQualificationCharterInput,
  type RendererQualificationCharterInput,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

const CANDIDATE_SAFE_HELD_BACK_BOUNDS =
  "Shared input schema and frozen charter-wide admission, page/content, and resource bounds; exact fixture identity and variation withheld until candidate outputs and sources are sealed.";

function issueCodes(input: RendererQualificationCharterInput): string[] {
  return validateRendererQualificationCharterInput(input).map(
    (issue) => issue.code,
  );
}

describe("renderer qualification held-back integrity contract", () => {
  it("exposes one neutral shared bound without hidden fixture variations", () => {
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    const packet = loadCandidateWorkPacket(
      charter,
      "P18-R-T",
      charter.roles.candidate_operators["P18-R-T"],
    );

    const candidateVisibleBounds = new Set(
      packet.held_back_case_schemas.map((item) => item.bounds),
    );
    expect(candidateVisibleBounds).toEqual(
      new Set([CANDIDATE_SAFE_HELD_BACK_BOUNDS]),
    );
    expect(
      charter.held_back_corpus.find((item) => item.case_id === "H03")?.fixture
        .bounds,
    ).toBe("French locale; leap-day dates; long registration strings");

    const serializedPacket = JSON.stringify(packet);
    for (const hiddenVariation of [
      "French locale",
      "leap-day",
      "long registration strings",
      "Determinism fixture",
      "fixed clock",
      "forbidden identity markers",
    ]) {
      expect(serializedPacket).not.toContain(hiddenVariation);
    }
  });

  it("rejects a held-back access entry without an attributable actor", () => {
    const input = structuredClone(buildFixtureContestInput());
    input.held_back_seal = {
      ...input.held_back_seal,
      access_log: input.held_back_seal.access_log.map((entry, index) =>
        index === 0 ? { ...entry, actor: "   " } : entry,
      ),
    };

    expect(issueCodes(input)).toContain("held_back_not_sealed");
    expect(() => freezeRendererQualificationCharter(input)).toThrow(
      RendererCharterValidationError,
    );
  });

  it.each([
    ["missing", undefined, "held_back_not_sealed"],
    ["zero-width", "\u200B", "held_back_not_sealed"],
    [
      "padded candidate operator",
      " operator-prince ",
      "held_back_expectation_leaked",
    ],
  ])("rejects a %s held-back access actor", (_label, actor, expectedCode) => {
    const input = structuredClone(buildFixtureContestInput());
    input.held_back_seal = {
      ...input.held_back_seal,
      access_log: input.held_back_seal.access_log.map((entry, index) =>
        index === 0 ? { ...entry, actor } : entry,
      ) as RendererQualificationCharterInput["held_back_seal"]["access_log"],
    };

    expect(issueCodes(input)).toContain(expectedCode);
    expect(() => freezeRendererQualificationCharter(input)).toThrow(
      RendererCharterValidationError,
    );
  });

  it.each(["x", "g".repeat(64), "A".repeat(64)])(
    "rejects a non-SHA-256 per-case expectation digest: %s",
    (sealedExpectationDigest) => {
      const input = structuredClone(buildFixtureContestInput());
      input.held_back_corpus = input.held_back_corpus.map((item, index) =>
        index === 0
          ? {
              ...item,
              sealed_expectation_digest: sealedExpectationDigest,
            }
          : item,
      );

      expect(issueCodes(input)).toContain("held_back_not_sealed");
      expect(() => freezeRendererQualificationCharter(input)).toThrow(
        RendererCharterValidationError,
      );
    },
  );
});
