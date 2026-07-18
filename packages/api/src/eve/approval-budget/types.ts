export const EVE_TRUST_ZONES = [
  "engineering",
  "product_admin",
  "memory",
] as const;
export type EveTrustZone = (typeof EVE_TRUST_ZONES)[number];

export const EVE_WRITE_CLASSES = ["operational", "business_data"] as const;
export type EveWriteClass = (typeof EVE_WRITE_CLASSES)[number];

export const EVE_APPROVAL_MODES = [
  "allow",
  "require_approval",
  "deny",
] as const;
export type EveApprovalMode = (typeof EVE_APPROVAL_MODES)[number];

export const EVE_POLICY_ACTION_IDS = [
  "engineering.review_artifact.write",
  "engineering.github_operation.write",
  "engineering.github_merge.execute",
  "engineering.subagent.delegate",
  "engineering.dynamic_workflow.execute",
  "engineering.shared_context.write",
  "engineering.shared_context.resolve",
  "product.internal_status.write",
  "memory.advisory.write",
  "product.donor.write",
] as const;
export type EvePolicyActionId = (typeof EVE_POLICY_ACTION_IDS)[number];

export const EVE_BUDGET_SCOPE_TYPES = [
  "model_role",
  "subagent",
  "dynamic_workflow",
  "eval",
  "judge",
  "expensive_feature",
] as const;
export type EveBudgetScopeType = (typeof EVE_BUDGET_SCOPE_TYPES)[number];

export type EvePolicyDecision = "allow" | "deny" | "pause" | "override";
export type EvePolicyDecisionReason =
  | "approval_required"
  | "budget_exhausted"
  | "governance_blocked"
  | "operational_policy_allowed"
  | "policy_denied"
  | "unknown_action";

export interface EveActionCatalogEntry {
  actionId: EvePolicyActionId;
  budgetScopeId: string;
  budgetScopeType: EveBudgetScopeType;
  domain: "dynamic_workflows" | "production_writes";
  inputTokenCost: number;
  outputTokenCost: number;
  requestCost: number;
  trustZone: EveTrustZone;
  usdMicrosCost: number;
  writeClass: EveWriteClass;
}

export interface EveApprovalPolicyRecord {
  operationalMode: EveApprovalMode;
  trustZone: EveTrustZone;
  updatedAt: string;
}

export interface EveBudgetRecord {
  additionalInputTokens: number;
  additionalOutputTokens: number;
  additionalRequests: number;
  additionalUsdMicros: number;
  id: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  maxRequests: number;
  maxUsdMicros: number;
  scopeId: string;
  scopeType: EveBudgetScopeType;
  usedInputTokens: number;
  usedOutputTokens: number;
  usedRequests: number;
  usedUsdMicros: number;
  windowEndsAt?: string;
  windowSeconds: number;
}

export interface EveActionApprovalRecord {
  actionId: string;
  approvalLevel: "strict" | "zone";
  createdAt: string;
  expiresAt: string;
  id: string;
  status: "approved" | "denied" | "pending" | "used";
  targetKey: string;
  trustZone: EveTrustZone;
}

export interface EvePolicyDecisionRecord {
  actionId: string;
  createdAt: string;
  decision: EvePolicyDecision;
  id: string;
  reason: EvePolicyDecisionReason | string;
  targetKey: string;
  trustZone: EveTrustZone;
  writeClass: EveWriteClass;
}

export interface EveApprovalBudgetAdminView {
  approvals: EveActionApprovalRecord[];
  budgets: EveBudgetRecord[];
  catalog: EveActionCatalogEntry[];
  decisions: EvePolicyDecisionRecord[];
  policies: EveApprovalPolicyRecord[];
}

export interface EvePolicyConsultResult {
  actionId: string;
  artifactId?: string;
  decision: Exclude<EvePolicyDecision, "override">;
  reason: EvePolicyDecisionReason;
  trustZone: EveTrustZone;
  writeClass: EveWriteClass;
}
