import { describe, expect, it } from "vitest";

import { eveModelPolicyActions } from "../../../../packages/api/src/eve/model-policy/lifecycle";

describe("Eve model-policy lifecycle actions", () => {
  it("offers only evaluation for a draft", () => {
    expect(
      eveModelPolicyActions({
        status: "draft",
        evalStatus: "not_evaluated",
        previousPolicyId: undefined,
      }),
    ).toEqual({ canEvaluate: true, canActivate: false, canRollback: false });
  });

  it("offers activation only after a passed evaluation", () => {
    expect(
      eveModelPolicyActions({
        status: "evaluated",
        evalStatus: "passed",
        previousPolicyId: undefined,
      }),
    ).toEqual({ canEvaluate: true, canActivate: true, canRollback: false });
  });

  it("keeps a failed evaluation re-evaluable but not activatable", () => {
    expect(
      eveModelPolicyActions({
        status: "evaluated",
        evalStatus: "failed",
        previousPolicyId: undefined,
      }),
    ).toEqual({ canEvaluate: true, canActivate: false, canRollback: false });
  });

  it("offers rollback only for an active policy with a predecessor", () => {
    expect(
      eveModelPolicyActions({
        status: "active",
        evalStatus: "passed",
        previousPolicyId: "00000000-0000-4000-8000-000000000001",
      }),
    ).toEqual({ canEvaluate: false, canActivate: false, canRollback: true });
  });

  it("offers nothing for an active policy without a predecessor", () => {
    expect(
      eveModelPolicyActions({
        status: "active",
        evalStatus: "passed",
        previousPolicyId: undefined,
      }),
    ).toEqual({ canEvaluate: false, canActivate: false, canRollback: false });
  });

  it("offers nothing for a retired or rolled-back policy", () => {
    for (const status of ["retired", "rolled_back"] as const) {
      expect(
        eveModelPolicyActions({
          status,
          evalStatus: "passed",
          previousPolicyId: "00000000-0000-4000-8000-000000000001",
        }),
      ).toEqual({ canEvaluate: false, canActivate: false, canRollback: false });
    }
  });
});
