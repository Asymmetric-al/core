import { describe, expect, it } from "vitest";

import { createDefaultEveModelPolicy } from "../../../../packages/api/src/eve/model-policy/schema";
import {
  EVE_DELEGATION_CAPS,
  EVE_SPECIALIST_CATALOG,
  evaluateEveDelegationCap,
  routeEveSpecialists,
} from "../../../../packages/api/src/eve/subagent-catalog/catalog";
import { EVE_SPECIALIST_IDS } from "../../../../packages/api/src/eve/subagent-catalog/types";

describe("Eve specialist catalog", () => {
  it("defines every initial specialist with a complete bounded policy", () => {
    expect(Object.keys(EVE_SPECIALIST_CATALOG).sort()).toEqual(
      [...EVE_SPECIALIST_IDS].sort(),
    );

    for (const specialist of Object.values(EVE_SPECIALIST_CATALOG)) {
      expect(specialist.modelRole).toBe(`specialist.${specialist.id}`);
      expect(specialist.description.length).toBeGreaterThan(20);
      expect(specialist.routingKeywords.length).toBeGreaterThan(2);
      expect(specialist.workflowTypes.length).toBeGreaterThan(0);
      expect(specialist.allowedTools).toEqual([
        "ask_question",
        "glob",
        "grep",
        "read_file",
        "shared_context",
      ]);
      expect(specialist.budget.maxInputTokensPerSession).toBeGreaterThan(0);
      expect(specialist.budget.maxOutputTokensPerSession).toBeGreaterThan(0);
      expect(specialist.budget.maxRequestsPerMinute).toBeGreaterThan(0);
      expect(specialist.budget.maxUsdMicros).toBeGreaterThan(0);
      expect(specialist.evalGate.suiteId).toBe(`eve-${specialist.id}`);
      expect(specialist.evalGate.minimumScoreBps).toBeGreaterThanOrEqual(9_000);
    }
  });

  it("projects every specialist into the app-owned default model policy", () => {
    const policy = createDefaultEveModelPolicy();

    for (const specialist of Object.values(EVE_SPECIALIST_CATALOG)) {
      const role = policy.roles[specialist.modelRole];
      expect(role).toBeDefined();
      expect(role?.reasoning).toBe(specialist.reasoning);
      expect(role?.evalGate).toEqual(specialist.evalGate);
      expect(role?.budget).toEqual({
        maxInputTokens: specialist.budget.maxInputTokensPerSession,
        maxOutputTokens: specialist.budget.maxOutputTokensPerSession,
        maxRequestsPerMinute: specialist.budget.maxRequestsPerMinute,
        maxUsdMicros: specialist.budget.maxUsdMicros,
      });
    }
  });

  it("routes by workflow eligibility and deterministic keyword evidence", () => {
    expect(
      routeEveSpecialists({
        query:
          "Review Supabase tenant RLS and the authentication trust boundary for security.",
        workflowType: "security_review",
      }).map((entry) => entry.id),
    ).toEqual(["data-boundary-review", "security-review"]);

    expect(
      routeEveSpecialists({
        query:
          "Review the user flow, accessibility, and responsive interaction.",
        workflowType: "product_discovery",
      }).map((entry) => entry.id),
    ).toEqual(["ux-review"]);
  });

  it("enforces workflow-specific count and authored depth caps", () => {
    expect(Object.values(EVE_DELEGATION_CAPS)).toHaveLength(8);
    expect(
      evaluateEveDelegationCap({
        currentDepth: 0,
        dispatchedSubagents: 5,
        workflowType: "pull_request_review",
      }),
    ).toMatchObject({ allowed: true });
    expect(
      evaluateEveDelegationCap({
        currentDepth: 0,
        dispatchedSubagents: 6,
        workflowType: "pull_request_review",
      }),
    ).toMatchObject({ allowed: false, reason: "subagent_cap_reached" });
    expect(
      evaluateEveDelegationCap({
        currentDepth: 1,
        dispatchedSubagents: 0,
        workflowType: "pull_request_review",
      }),
    ).toMatchObject({ allowed: false, reason: "depth_cap_reached" });
  });
});
