import { describe, expect, it } from "vitest";

import { buildFixtureContestInput } from "./renderer-qualification-test-fixture";
import { validateRendererQualificationCharterInput } from "../../../../packages/api/src/generated-documents/renderer-qualification";

import type {
  QualificationRoles,
  RendererQualificationCharterInput,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

function roleIssueCodes(input: RendererQualificationCharterInput): string[] {
  return validateRendererQualificationCharterInput(input)
    .filter((entry) => entry.path.startsWith("roles."))
    .map((entry) => entry.code);
}

function assignFinalApprover(
  input: RendererQualificationCharterInput,
  actor: string,
): void {
  input.roles = { ...input.roles, final_approver: actor };
  input.approvals = input.approvals.map((entry) =>
    entry.role === "final_approver" ? { ...entry, actor } : entry,
  );
}

describe("renderer qualification role overlap contract", () => {
  it.each([
    "accountable_owner",
    "security_privacy_reviewer",
    "operations_reviewer",
    "records_legal_evidence_owner",
  ] as const)("allows a candidate operator to also serve as %s", (role) => {
    const input = buildFixtureContestInput();
    input.roles = { ...input.roles, [role]: "operator-prince" };

    expect(roleIssueCodes(input)).not.toContain("role_collision");
  });

  it("allows one finalist operator to review when the other reviewer is independent", () => {
    const input = buildFixtureContestInput();
    input.roles = {
      ...input.roles,
      independent_reviewers: ["operator-prince", "operator-control"],
    };

    expect(roleIssueCodes(input)).not.toContain("role_collision");
  });

  it("does not treat shared or control-candidate implementation as a collision", () => {
    const input = buildFixtureContestInput();
    input.roles = {
      ...input.roles,
      candidate_operators: {
        ...input.roles.candidate_operators,
        "P18-R-T": "operator-prince",
      },
    };

    expect(roleIssueCodes(input)).not.toContain("role_collision");
  });

  it("allows the final approver to implement when another implementer exists", () => {
    const input = buildFixtureContestInput();
    assignFinalApprover(input, "operator-prince");

    expect(roleIssueCodes(input)).not.toContain("role_collision");
  });

  it("requires at least one reviewer outside both finalist operators", () => {
    const input = buildFixtureContestInput();
    input.roles = {
      ...input.roles,
      independent_reviewers: ["operator-prince", "operator-typst"],
    };

    expect(roleIssueCodes(input)).toContain("role_collision");
  });

  it("keeps the two reviewers distinct", () => {
    const input = buildFixtureContestInput();
    input.roles = {
      ...input.roles,
      independent_reviewers: ["reviewer-avery", "reviewer-avery"],
    };

    expect(roleIssueCodes(input)).toContain("role_collision");
  });

  it("rejects the final approver as the sole candidate implementer", () => {
    const input = buildFixtureContestInput();
    input.roles = {
      ...input.roles,
      candidate_operators: Object.fromEntries(
        Object.keys(input.roles.candidate_operators).map((candidateId) => [
          candidateId,
          "operator-only",
        ]),
      ) as QualificationRoles["candidate_operators"],
    };
    assignFinalApprover(input, "operator-only");

    expect(roleIssueCodes(input)).toContain("role_collision");
  });

  it.each(["P18-R-P", "P18-R-T", "P18-R-C"] as const)(
    "keeps the corpus custodian separate from the %s operator",
    (candidateId) => {
      const input = buildFixtureContestInput();
      input.roles = {
        ...input.roles,
        corpus_custodian: input.roles.candidate_operators[candidateId],
      };

      expect(roleIssueCodes(input)).toContain("role_collision");
    },
  );

  it("rejects a padded custodian alias instead of bypassing separation", () => {
    const input = buildFixtureContestInput();
    input.roles = {
      ...input.roles,
      corpus_custodian: " operator-prince ",
    };

    expect(roleIssueCodes(input)).toContain("role_missing");
  });

  it("rejects padded reviewer aliases instead of treating them as independent", () => {
    const input = buildFixtureContestInput();
    input.roles = {
      ...input.roles,
      independent_reviewers: [" operator-prince ", "operator-typst"],
    };

    expect(roleIssueCodes(input)).toContain("role_missing");
  });

  it("rejects invisible or padded candidate-operator aliases", () => {
    const input = buildFixtureContestInput();
    input.roles = {
      ...input.roles,
      candidate_operators: {
        "P18-R-P": " approver-emerson ",
        "P18-R-T": "approver-\u200bemerson",
        "P18-R-C": " approver-emerson ",
      },
    };

    expect(roleIssueCodes(input)).toContain("role_missing");
  });

  it("does not count an undeclared operator key as a second implementer", () => {
    const input = buildFixtureContestInput();
    input.roles = {
      ...input.roles,
      candidate_operators: Object.fromEntries(
        Object.keys(input.roles.candidate_operators).map((candidateId) => [
          candidateId,
          "operator-only",
        ]),
      ) as QualificationRoles["candidate_operators"],
    };
    (input.roles.candidate_operators as unknown as Record<string, string>)[
      "P18-R-X"
    ] = "operator-decoy";
    assignFinalApprover(input, "operator-only");

    expect(roleIssueCodes(input)).toContain("role_collision");
  });

  it("does not count a third undeclared reviewer as independent", () => {
    const input = buildFixtureContestInput();
    input.roles = {
      ...input.roles,
      independent_reviewers: [
        "operator-prince",
        "operator-typst",
        "reviewer-decoy",
      ] as unknown as QualificationRoles["independent_reviewers"],
    };

    expect(roleIssueCodes(input)).toContain("role_collision");
  });

  it("rejects a non-array reviewer tuple", () => {
    const input = buildFixtureContestInput();
    input.roles = {
      ...input.roles,
      independent_reviewers:
        "ab" as unknown as QualificationRoles["independent_reviewers"],
    };

    expect(roleIssueCodes(input)).toContain("role_collision");
  });
});
