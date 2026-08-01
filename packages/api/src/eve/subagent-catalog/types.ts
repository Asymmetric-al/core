export const EVE_SPECIALIST_IDS = [
  "code-review",
  "ci-triage",
  "security-review",
  "test-planning",
  "openspec-guarding",
  "data-boundary-review",
  "dependency-review",
  "documentation-sync",
  "product-strategy",
  "ux-review",
  "migration-planning",
  "release-coordination",
  "memory-curation",
] as const;

export type EveSpecialistId = (typeof EVE_SPECIALIST_IDS)[number];

export const EVE_WORKFLOW_TYPES = [
  "pull_request_review",
  "ci_failure",
  "security_review",
  "implementation_planning",
  "product_discovery",
  "migration",
  "release",
  "memory_maintenance",
] as const;

export type EveWorkflowType = (typeof EVE_WORKFLOW_TYPES)[number];

export interface EveSpecialistBudget {
  maxInputTokensPerSession: number;
  maxOutputTokensPerSession: number;
  maxRequestsPerMinute: number;
  maxUsdMicros: number;
}

export interface EveSpecialistCatalogEntry {
  allowedTools: readonly string[];
  budget: EveSpecialistBudget;
  description: string;
  evalGate: {
    minimumScoreBps: number;
    suiteId: string;
  };
  fallbackEligible: boolean;
  id: EveSpecialistId;
  modelRole: string;
  reasoning: "low" | "medium" | "high";
  routingKeywords: readonly string[];
  workflowTypes: readonly EveWorkflowType[];
}

export interface EveDelegationCap {
  maxDepth: number;
  maxSubagents: number;
  workflowType: EveWorkflowType;
}

export type EveDelegationDecision =
  | { allowed: true; cap: EveDelegationCap }
  | {
      allowed: false;
      cap: EveDelegationCap;
      reason: "depth_cap_reached" | "subagent_cap_reached";
    };
