import { describe, expect, it } from "vitest";

import {
  evaluateEveModelPolicy,
  hashEveModelPolicy,
} from "../../../../packages/api/src/eve/model-policy/evaluator";
import { createDefaultEveModelPolicy } from "../../../../packages/api/src/eve/model-policy/schema";

import type { EveModelPolicyDocument } from "../../../../packages/api/src/eve/model-policy/types";

describe("Eve model-policy evaluator", () => {
  it("passes the safe Gateway-primary policy with independent named roles", () => {
    const evaluation = evaluateEveModelPolicy(
      createDefaultEveModelPolicy(),
      new Date("2026-07-17T12:00:00.000Z"),
    );

    expect(evaluation.status).toBe("passed");
    expect(evaluation.evaluatedAt).toBe("2026-07-17T12:00:00.000Z");
    expect(evaluation.checks).toHaveLength(6);
    expect(evaluation.checks.every((check) => check.passed)).toBe(true);
  });

  it("fails when the judge is coupled to the agent role", () => {
    const policy = createDefaultEveModelPolicy();
    policy.judgeRole = policy.agentRole;

    const evaluation = evaluateEveModelPolicy(policy);

    expect(evaluation.status).toBe("failed");
    expect(evaluation.checks).toContainEqual(
      expect.objectContaining({ id: "independent_judge", passed: false }),
    );
  });

  it("fails closed on an invalid subagent role or fallback", () => {
    const policy = createDefaultEveModelPolicy();
    policy.subagentOverrides.security = {
      role: "missing-role",
      fallbackProviderId: "unconfigured-provider",
      evalGate: { suiteId: "security", minimumScoreBps: 9_500 },
    };

    const evaluation = evaluateEveModelPolicy(policy);

    expect(evaluation.status).toBe("failed");
    expect(evaluation.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "controlled_fallbacks", passed: false }),
        expect.objectContaining({ id: "subagent_roles", passed: false }),
      ]),
    );
  });

  it("rejects a structurally invalid policy instead of evaluating partial data", () => {
    const evaluation = evaluateEveModelPolicy({
      ...createDefaultEveModelPolicy(),
      scope: "tenant",
    } as unknown as EveModelPolicyDocument);

    expect(evaluation).toEqual(
      expect.objectContaining({
        status: "failed",
        checks: [expect.objectContaining({ id: "schema", passed: false })],
      }),
    );
  });

  it("hashes equivalent policies identically regardless of object key order", async () => {
    const policy = createDefaultEveModelPolicy();
    const reversed = Object.fromEntries(
      Object.entries(policy).reverse(),
    ) as unknown as EveModelPolicyDocument;

    await expect(hashEveModelPolicy(reversed)).resolves.toBe(
      await hashEveModelPolicy(policy),
    );
  });
});
