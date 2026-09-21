import { describe, expect, it } from "vitest";

import { buildFixtureContestInput } from "./renderer-qualification-test-fixture";
import {
  freezeRendererQualificationCharter,
  validateRendererQualificationCharterInput,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

import type {
  CharterApproval,
  CharterValidationIssue,
  RendererQualificationCharterInput,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

function issues(
  input: RendererQualificationCharterInput,
): CharterValidationIssue[] {
  return validateRendererQualificationCharterInput(input);
}

function issuePaths(input: RendererQualificationCharterInput): string[] {
  return issues(input).map((entry) => entry.path);
}

function approval(
  actor: string,
  role: string,
  approvedAt = "2026-07-22T11:30:00.000Z",
): CharterApproval {
  return {
    actor,
    role,
    approved_at: approvedAt,
    statement: `${role} approval by ${actor}`,
  };
}

function approvalByRole(
  input: RendererQualificationCharterInput,
  role: string,
): CharterApproval {
  const match = input.approvals.find((entry) => entry.role === role);
  if (!match) throw new Error(`Missing fixture approval for ${role}`);
  return match;
}

describe("renderer qualification timestamp and approval contract", () => {
  it.each([
    "2026-07-22T12:00:00",
    "2026-07-22",
    "2026-07-22 12:00:00Z",
    "2026-07-22T12:00:00+0700",
    " 2026-07-22T12:00:00Z",
    "2026-02-30T12:00:00Z",
  ])("rejects a non-RFC3339 freeze timestamp: %s", (frozenAt) => {
    const input = buildFixtureContestInput();
    input.frozen_at = frozenAt;

    expect(issuePaths(input)).toContain("frozen_at");
  });

  it.each([
    ["held_back_seal.sealed_at", "seal"],
    ["held_back_seal.access_log.0", "access"],
  ] as const)("rejects a zone-less %s timestamp", (expectedPath, field) => {
    const input = buildFixtureContestInput();
    if (field === "seal") {
      input.held_back_seal.sealed_at = "2026-07-22T11:00:00";
    } else {
      input.held_back_seal.access_log[0]!.at = "2026-07-22T11:00:00";
    }

    expect(issuePaths(input)).toContain(expectedPath);
  });

  it("accepts explicit offsets, preserves them, and permits exact freeze equality", () => {
    const input = buildFixtureContestInput();
    input.frozen_at = "2026-07-22T19:00:00.000+07:00";
    approvalByRole(input, "final_approver").approved_at =
      "2026-07-22T14:00:00.000+02:00";
    input.held_back_seal.access_log[0]!.at = "2026-07-22T14:00:00.000+02:00";

    const charter = freezeRendererQualificationCharter(input);

    expect(charter.frozen_at).toBe("2026-07-22T19:00:00.000+07:00");
    expect(approvalByRole(charter, "final_approver").approved_at).toBe(
      "2026-07-22T14:00:00.000+02:00",
    );
  });

  it("rejects an approval after freeze even when a different offset hides it", () => {
    const input = buildFixtureContestInput();
    approvalByRole(input, "final_approver").approved_at =
      "2026-07-22T14:00:01.000+02:00";

    expect(issues(input).map((entry) => entry.code)).toContain(
      "approval_invalid",
    );
  });

  it("compares the complete fractional second without millisecond truncation", () => {
    const input = buildFixtureContestInput();
    input.frozen_at = "2026-07-22T12:00:00.0000Z";
    approvalByRole(input, "final_approver").approved_at =
      "2026-07-22T12:00:00.0001Z";

    expect(issues(input).map((entry) => entry.code)).toContain(
      "approval_invalid",
    );
  });

  it.each([
    ["undeclared field", { ...approval("auditor", "audit"), extra: true }],
    [
      "missing field",
      {
        actor: "auditor",
        role: "audit",
        approved_at: "2026-07-22T11:30:00.000Z",
      },
    ],
    ["padded actor", approval(" auditor", "audit")],
    ["invisible role", approval("auditor", "audit\u200b")],
    ["blank statement", { ...approval("auditor", "audit"), statement: " " }],
    [
      "zone-less timestamp",
      approval("auditor", "audit", "2026-07-22T11:30:00"),
    ],
    [
      "post-freeze timestamp",
      approval("auditor", "audit", "2026-07-22T12:00:01.000Z"),
    ],
  ])(
    "validates every approval, including a trailing %s",
    (_label, trailing) => {
      const input = buildFixtureContestInput();
      input.approvals = [
        ...input.approvals,
        trailing as unknown as CharterApproval,
      ];

      expect(issues(input).map((entry) => entry.code)).toContain(
        "approval_invalid",
      );
    },
  );

  it("rejects duplicate role/actor pairs without banning permitted overlaps", () => {
    const valid = buildFixtureContestInput();
    valid.approvals = [
      ...valid.approvals,
      approval("auditor-one", "audit"),
      approval("auditor-one", "security"),
      approval("auditor-two", "audit"),
    ];
    expect(issues(valid).map((entry) => entry.code)).not.toContain(
      "approval_duplicate",
    );

    const duplicate = structuredClone(valid);
    duplicate.approvals = [
      ...duplicate.approvals,
      approval("auditor-one", "audit", "2026-07-22T11:45:00.000Z"),
    ];
    expect(issues(duplicate).map((entry) => entry.code)).toContain(
      "approval_duplicate",
    );
  });

  it("normalizes approvals by fields instead of delimiter-concatenated keys", () => {
    const input = buildFixtureContestInput();
    input.approvals = [
      ...input.approvals,
      approval("b:c", "a"),
      approval("c", "a:b"),
    ];
    const reordered = structuredClone(input);
    reordered.approvals = [...reordered.approvals].reverse();

    expect(freezeRendererQualificationCharter(reordered).manifest_digest).toBe(
      freezeRendererQualificationCharter(input).manifest_digest,
    );
  });

  it("fails closed for a malformed nested approval instead of throwing", () => {
    const input = buildFixtureContestInput();
    input.approvals = [...input.approvals, null as unknown as CharterApproval];

    expect(() => issues(input)).not.toThrow();
    expect(issues(input).map((entry) => entry.code)).toContain(
      "approval_invalid",
    );
  });
});
