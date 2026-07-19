import { eveModelPolicyDocumentSchema } from "./schema";

import type {
  EveModelPolicyDocument,
  EveModelPolicyEvaluation,
  EveModelPolicyEvaluationCheck,
} from "./types";

function createCheck(
  id: string,
  passed: boolean,
  message: string,
): EveModelPolicyEvaluationCheck {
  return { id, passed, message };
}

export function evaluateEveModelPolicy(
  policy: EveModelPolicyDocument,
  now = new Date(),
): EveModelPolicyEvaluation {
  const parsed = eveModelPolicyDocumentSchema.safeParse(policy);
  if (!parsed.success) {
    return {
      status: "failed",
      evaluatedAt: now.toISOString(),
      checks: [
        createCheck(
          "schema",
          false,
          "Policy does not satisfy the versioned model-policy schema.",
        ),
      ],
    };
  }

  const roleNames = Object.keys(policy.roles);
  const referencedRoles = [
    policy.agentRole,
    policy.reviewRole,
    policy.judgeRole,
  ];
  const allReferencedRolesExist = referencedRoles.every((role) =>
    roleNames.includes(role),
  );
  const subagentRolesExist = Object.values(policy.subagentOverrides).every(
    (override) => roleNames.includes(override.role),
  );
  const subagentFallbacksExist = Object.values(policy.subagentOverrides).every(
    (override) => {
      if (!override.fallbackProviderId) return true;
      const role = policy.roles[override.role];
      return role?.fallbacks.some(
        (fallback) =>
          fallback.providerId === override.fallbackProviderId &&
          fallback.enabled,
      );
    },
  );
  const subagentEvalGatesAreDefined = Object.values(
    policy.subagentOverrides,
  ).every((override) => {
    const evalGate = override.evalGate ?? policy.roles[override.role]?.evalGate;
    return Boolean(evalGate?.suiteId);
  });
  const directFallbacksAreUnique = Object.values(policy.roles).every((role) => {
    const providerIds = role.fallbacks.map((fallback) => fallback.providerId);
    return new Set(providerIds).size === providerIds.length;
  });

  const checks = [
    createCheck(
      "named_roles",
      roleNames.length >= 3 && allReferencedRolesExist,
      "Agent, review, and judge resolve through named policy roles.",
    ),
    createCheck(
      "gateway_primary",
      Object.values(policy.roles).every(
        (role) => role.primary.route === "vercel_ai_gateway",
      ),
      "Every named role keeps Vercel AI Gateway as its primary route.",
    ),
    createCheck(
      "controlled_fallbacks",
      directFallbacksAreUnique && subagentFallbacksExist,
      "Direct providers are unique, explicit, non-primary fallbacks.",
    ),
    createCheck(
      "subagent_roles",
      subagentRolesExist && subagentEvalGatesAreDefined,
      "Every subagent override references a declared role and resolves an eval gate.",
    ),
    createCheck(
      "independent_judge",
      policy.judgeRole !== policy.agentRole,
      "The judge role is configured independently from the agent role.",
    ),
    createCheck(
      "hard_limits",
      Object.values(policy.roles).every(
        (role) =>
          role.budget.maxRequestsPerMinute >= 0 &&
          role.budget.maxUsdMicros >= 0 &&
          role.budget.maxInputTokens >= 0 &&
          role.budget.maxOutputTokens >= 0,
      ),
      "Every role carries explicit hard spend, token, and rate limits.",
    ),
  ];

  return {
    status: checks.every((check) => check.passed) ? "passed" : "failed",
    evaluatedAt: now.toISOString(),
    checks,
  };
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, canonicalize(child)]),
  );
}

export async function hashEveModelPolicy(
  policy: EveModelPolicyDocument,
): Promise<string> {
  const encoded = new TextEncoder().encode(
    JSON.stringify(canonicalize(policy)),
  );
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
