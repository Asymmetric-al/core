export const EVE_AI_SETTINGS_PERMISSION = "ai.settings.manage" as const;

export const EVE_MODEL_POLICY_STATUSES = [
  "draft",
  "evaluated",
  "active",
  "retired",
  "rolled_back",
] as const;

export type EveModelPolicyStatus = (typeof EVE_MODEL_POLICY_STATUSES)[number];

export const EVE_MODEL_POLICY_EVAL_STATUSES = [
  "not_evaluated",
  "passed",
  "failed",
] as const;

export type EveModelPolicyEvalStatus =
  (typeof EVE_MODEL_POLICY_EVAL_STATUSES)[number];

export interface EveModelBudget {
  maxInputTokens: number;
  maxOutputTokens: number;
  maxRequestsPerMinute: number;
  maxUsdMicros: number;
}

export interface EveGatewayRoute {
  modelId: string;
  route: "vercel_ai_gateway";
}

export interface EveDirectFallbackRoute {
  enabled: boolean;
  modelId: string;
  providerId: string;
  route: "direct_provider";
}

export interface EveModelEvalGate {
  minimumScoreBps: number;
  suiteId: string;
}

export interface EveModelRolePolicy {
  budget: EveModelBudget;
  evalGate: EveModelEvalGate;
  fallbacks: EveDirectFallbackRoute[];
  primary: EveGatewayRoute;
  reasoning: "low" | "medium" | "high";
}

export interface EveSubagentModelOverride {
  budget?: Partial<EveModelBudget>;
  evalGate?: EveModelEvalGate;
  fallbackProviderId?: string;
  reasoning?: EveModelRolePolicy["reasoning"];
  role: string;
}

export interface EveModelPolicyDocument {
  agentRole: string;
  judgeRole: string;
  reviewRole: string;
  roles: Record<string, EveModelRolePolicy>;
  schemaVersion: 1;
  scope: "platform";
  subagentOverrides: Record<string, EveSubagentModelOverride>;
}

export interface EveModelPolicyEvaluationCheck {
  id: string;
  message: string;
  passed: boolean;
}

export interface EveModelPolicyEvaluation {
  checks: EveModelPolicyEvaluationCheck[];
  evaluatedAt: string;
  status: "passed" | "failed";
}

export interface EveModelPolicyRecord {
  activatedAt?: string;
  createdAt: string;
  createdByProfileId: string;
  evalStatus: EveModelPolicyEvalStatus;
  evalSummary?: EveModelPolicyEvaluation;
  evaluatedAt?: string;
  id: string;
  policy: EveModelPolicyDocument;
  policyHash: string;
  previousPolicyId?: string;
  status: EveModelPolicyStatus;
  version: number;
}

export interface EveModelBudgetOverride {
  additionalInputTokens: number;
  additionalOutputTokens: number;
  additionalRequests: number;
  additionalUsdMicros: number;
  createdAt: string;
  expiresAt: string;
  id: string;
  policyId: string;
  reason: string;
  scopeId: string;
  scopeType: "role" | "subagent";
}

export interface EveModelUsageSnapshot {
  inputTokens: number;
  outputTokens: number;
  requestsInCurrentMinute: number;
  usdMicros: number;
}

export type EveModelResolution =
  | {
      allowed: false;
      reason:
        | "budget_exhausted"
        | "policy_inactive"
        | "rate_limit_exhausted"
        | "role_missing";
    }
  | {
      allowed: true;
      budget: EveModelBudget;
      directFallback?: EveDirectFallbackRoute;
      evalGate: EveModelEvalGate;
      primary: EveGatewayRoute;
      reasoning: EveModelRolePolicy["reasoning"];
      role: string;
    };

export interface EveModelPolicyAdminView {
  activePolicy?: EveModelPolicyRecord;
  budgetOverrides: EveModelBudgetOverride[];
  canManage: boolean;
  policies: EveModelPolicyRecord[];
}
