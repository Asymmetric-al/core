import { describe, expect, it } from "vitest";

import {
  assertCanDecideCorrectionRequest,
  correctionRequiresApproval,
  resolveCorrectionApprovalPolicy,
} from "../../../../../packages/api/src/admin/contribution-operations/approval-policy";

describe("admin/contribution-operations/approval-policy", () => {
  it("defaults to separation of duties with no suppression", () => {
    const policy = resolveCorrectionApprovalPolicy(null);

    expect(policy.ownershipMode).toBe("separation_of_duties");
    expect(policy.suppressedGates).toEqual([]);
    expect(policy.strongerApprovalCategories).toEqual([]);
  });

  it("requires approval for high-risk corrections unless the gate is suppressed", () => {
    const policy = resolveCorrectionApprovalPolicy(null);

    expect(
      correctionRequiresApproval({ actionType: "amount_correction", policy }),
    ).toBe(true);
    expect(
      correctionRequiresApproval({
        actionType: "allocation_correction",
        policy,
      }),
    ).toBe(false);

    const suppressed = resolveCorrectionApprovalPolicy({
      ownership_mode: "separation_of_duties",
      suppressed_gates: ["amount_correction"],
      stronger_approval_categories: [],
    });
    expect(
      correctionRequiresApproval({
        actionType: "amount_correction",
        policy: suppressed,
      }),
    ).toBe(false);
  });

  it("keeps stronger approval categories gated even when suppressed or relaxed", () => {
    const policy = resolveCorrectionApprovalPolicy({
      ownership_mode: "no_approval_required",
      suppressed_gates: ["amount_correction", "fund_correction"],
      stronger_approval_categories: ["amount_correction"],
    });

    expect(
      correctionRequiresApproval({ actionType: "amount_correction", policy }),
    ).toBe(true);
    expect(
      correctionRequiresApproval({ actionType: "fund_correction", policy }),
    ).toBe(false);
  });

  it("blocks requesters from approving their own request under separation of duties", () => {
    const policy = resolveCorrectionApprovalPolicy(null);

    expect(() =>
      assertCanDecideCorrectionRequest({
        policy,
        request: { requestedByProfileId: "profile-1" },
        deciderProfileId: "profile-1",
        deciderCapabilities: ["contributions.approve_corrections"],
      }),
    ).toThrowError(/cannot approve|own/i);

    expect(() =>
      assertCanDecideCorrectionRequest({
        policy,
        request: { requestedByProfileId: "profile-1" },
        deciderProfileId: "profile-2",
        deciderCapabilities: ["contributions.approve_corrections"],
      }),
    ).not.toThrow();
  });

  it("allows self-approval under one_approver mode but still requires the capability", () => {
    const policy = resolveCorrectionApprovalPolicy({
      ownership_mode: "one_approver",
      suppressed_gates: [],
      stronger_approval_categories: [],
    });

    expect(() =>
      assertCanDecideCorrectionRequest({
        policy,
        request: { requestedByProfileId: "profile-1" },
        deciderProfileId: "profile-1",
        deciderCapabilities: ["contributions.approve_corrections"],
      }),
    ).not.toThrow();

    expect(() =>
      assertCanDecideCorrectionRequest({
        policy,
        request: { requestedByProfileId: "profile-1" },
        deciderProfileId: "profile-2",
        deciderCapabilities: ["contributions.view_detail"],
      }),
    ).toThrowError(/approve_corrections/);
  });
});
