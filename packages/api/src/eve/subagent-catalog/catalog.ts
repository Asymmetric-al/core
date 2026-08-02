import {
  EVE_SPECIALIST_IDS,
  type EveDelegationCap,
  type EveDelegationDecision,
  type EveSpecialistCatalogEntry,
  type EveSpecialistId,
  type EveWorkflowType,
} from "./types";

const READ_ONLY_REPOSITORY_TOOLS = [
  "ask_question",
  "glob",
  "grep",
  "read_file",
  "shared_context",
] as const;

function specialist(input: {
  description: string;
  fallbackEligible?: boolean;
  id: EveSpecialistId;
  keywords: readonly string[];
  reasoning: EveSpecialistCatalogEntry["reasoning"];
  workflows: readonly EveWorkflowType[];
}): EveSpecialistCatalogEntry {
  return {
    id: input.id,
    description: input.description,
    modelRole: `specialist.${input.id}`,
    reasoning: input.reasoning,
    fallbackEligible: input.fallbackEligible ?? false,
    budget: {
      maxInputTokensPerSession: 120_000,
      maxOutputTokensPerSession: 12_000,
      maxRequestsPerMinute: 8,
      maxUsdMicros: 750_000,
    },
    evalGate: {
      suiteId: `eve-${input.id}`,
      minimumScoreBps: 9_000,
    },
    routingKeywords: input.keywords,
    workflowTypes: input.workflows,
    allowedTools: READ_ONLY_REPOSITORY_TOOLS,
  };
}

export const EVE_SPECIALIST_CATALOG: Record<
  EveSpecialistId,
  EveSpecialistCatalogEntry
> = {
  "code-review": specialist({
    id: "code-review",
    description:
      "Review code changes for correctness, maintainability, regressions, and concrete file-and-line findings.",
    keywords: ["review", "diff", "regression", "correctness", "pull request"],
    reasoning: "high",
    workflows: ["pull_request_review", "implementation_planning"],
  }),
  "ci-triage": specialist({
    id: "ci-triage",
    description:
      "Diagnose failing CI checks from reproducible evidence and identify the smallest safe repair path.",
    keywords: ["ci", "check", "workflow", "failing test", "build failure"],
    reasoning: "medium",
    workflows: ["ci_failure", "pull_request_review", "release"],
  }),
  "security-review": specialist({
    id: "security-review",
    description:
      "Review trust boundaries, authorization, secrets, injection risks, and unsafe data exposure.",
    keywords: ["security", "auth", "secret", "injection", "trust boundary"],
    reasoning: "high",
    workflows: ["security_review", "pull_request_review", "release"],
  }),
  "test-planning": specialist({
    id: "test-planning",
    description:
      "Design risk-proportionate unit, integration, end-to-end, and failure-path verification.",
    keywords: ["test", "coverage", "assertion", "verification", "quality gate"],
    reasoning: "medium",
    workflows: ["implementation_planning", "pull_request_review", "ci_failure"],
  }),
  "openspec-guarding": specialist({
    id: "openspec-guarding",
    description:
      "Check implementation and review decisions against accepted OpenSpec intent and traceability.",
    keywords: ["openspec", "spec", "scope", "requirement", "acceptance"],
    reasoning: "high",
    workflows: ["implementation_planning", "pull_request_review", "release"],
  }),
  "data-boundary-review": specialist({
    id: "data-boundary-review",
    description:
      "Review tenant isolation, server-only data access, RLS, privacy, and authoritative data boundaries.",
    keywords: ["data boundary", "tenant", "rls", "supabase", "privacy"],
    reasoning: "high",
    workflows: ["security_review", "pull_request_review", "migration"],
  }),
  "dependency-review": specialist({
    id: "dependency-review",
    description:
      "Review dependency changes for necessity, compatibility, provenance, licensing, and supply-chain risk.",
    keywords: ["dependency", "package", "lockfile", "upgrade", "supply chain"],
    reasoning: "medium",
    workflows: ["pull_request_review", "security_review", "release"],
  }),
  "documentation-sync": specialist({
    id: "documentation-sync",
    description:
      "Find documentation that must change with implementation and verify source-of-truth consistency.",
    keywords: ["documentation", "readme", "guide", "adr", "sync docs"],
    reasoning: "low",
    workflows: ["implementation_planning", "pull_request_review", "release"],
  }),
  "product-strategy": specialist({
    id: "product-strategy",
    description:
      "Assess product intent, user value, sequencing, tradeoffs, and decision clarity without inventing authority.",
    keywords: ["product", "strategy", "user story", "outcome", "tradeoff"],
    reasoning: "high",
    workflows: ["product_discovery", "implementation_planning"],
  }),
  "ux-review": specialist({
    id: "ux-review",
    description:
      "Review user flows, accessibility, interaction clarity, responsive behavior, and failure states.",
    keywords: ["ux", "accessibility", "interaction", "responsive", "user flow"],
    reasoning: "high",
    workflows: [
      "product_discovery",
      "pull_request_review",
      "implementation_planning",
    ],
  }),
  "migration-planning": specialist({
    id: "migration-planning",
    description:
      "Plan reversible schema and data migrations with rollout, compatibility, validation, and rollback evidence.",
    keywords: ["migration", "schema", "backfill", "rollback", "database"],
    reasoning: "high",
    workflows: ["migration", "implementation_planning", "release"],
  }),
  "release-coordination": specialist({
    id: "release-coordination",
    description:
      "Coordinate release readiness from checks, dependencies, migrations, switches, rollback, and owner evidence.",
    keywords: ["release", "deploy", "rollout", "readiness", "rollback"],
    reasoning: "high",
    workflows: ["release", "ci_failure", "migration"],
  }),
  "memory-curation": specialist({
    id: "memory-curation",
    description:
      "Curate safe durable knowledge candidates while separating run context from private long-term memory.",
    keywords: ["memory", "curate", "retention", "knowledge", "provenance"],
    reasoning: "high",
    workflows: ["memory_maintenance", "product_discovery"],
  }),
};

export const EVE_DELEGATION_CAPS: Record<EveWorkflowType, EveDelegationCap> = {
  pull_request_review: {
    workflowType: "pull_request_review",
    maxDepth: 1,
    maxSubagents: 6,
  },
  ci_failure: { workflowType: "ci_failure", maxDepth: 1, maxSubagents: 4 },
  security_review: {
    workflowType: "security_review",
    maxDepth: 1,
    maxSubagents: 5,
  },
  implementation_planning: {
    workflowType: "implementation_planning",
    maxDepth: 1,
    maxSubagents: 7,
  },
  product_discovery: {
    workflowType: "product_discovery",
    maxDepth: 1,
    maxSubagents: 4,
  },
  migration: { workflowType: "migration", maxDepth: 1, maxSubagents: 5 },
  release: { workflowType: "release", maxDepth: 1, maxSubagents: 7 },
  memory_maintenance: {
    workflowType: "memory_maintenance",
    maxDepth: 1,
    maxSubagents: 3,
  },
};

export function routeEveSpecialists(input: {
  query: string;
  workflowType: EveWorkflowType;
}): EveSpecialistCatalogEntry[] {
  const query = input.query.toLocaleLowerCase("en-US");
  return EVE_SPECIALIST_IDS.map((id) => EVE_SPECIALIST_CATALOG[id])
    .filter((entry) => entry.workflowTypes.includes(input.workflowType))
    .map((entry) => ({
      entry,
      score: entry.routingKeywords.reduce(
        (total, keyword) => total + (query.includes(keyword) ? 1 : 0),
        0,
      ),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || left.entry.id.localeCompare(right.entry.id),
    )
    .map((candidate) => candidate.entry);
}

export function evaluateEveDelegationCap(input: {
  currentDepth: number;
  dispatchedSubagents: number;
  workflowType: EveWorkflowType;
}): EveDelegationDecision {
  const cap = EVE_DELEGATION_CAPS[input.workflowType];
  if (input.currentDepth >= cap.maxDepth) {
    return { allowed: false, cap, reason: "depth_cap_reached" };
  }
  if (input.dispatchedSubagents >= cap.maxSubagents) {
    return { allowed: false, cap, reason: "subagent_cap_reached" };
  }
  return { allowed: true, cap };
}
